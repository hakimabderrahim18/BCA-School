import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenCookieOptions,
  verifyToken,
} from '../utils/tokenHelper.js';

export const authController = {
  /**
   * Connexion d'un utilisateur (Admin / Éditeur / Rédacteur)
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const rawIdentifier = (req.body.identifier || req.body.email || req.body.phone || req.body.login || '').trim();
      const { password } = req.body;

      if (!rawIdentifier || !password) {
        return sendError(res, 400, 'Veuillez fournir votre email ou numéro de téléphone et votre mot de passe.');
      }

      const cleanPhone = rawIdentifier.replace(/[\s\-\.]/g, '');

      // Recherche de l'utilisateur par email OU par numéro de téléphone
      const user = await User.findOne({
        $or: [
          { email: rawIdentifier.toLowerCase() },
          { phone: cleanPhone },
          { phone: rawIdentifier },
        ],
      }).select('+password +refreshToken');
      if (!user) {
        return sendError(res, 401, 'Identifiants de connexion incorrects.');
      }

      if (!user.isActive) {
        return sendError(res, 403, 'Votre compte a été suspendu par l’administration.');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 401, 'Identifiants de connexion incorrects.');
      }

      // Génération des tokens JWT
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Sauvegarde du refresh token et date de dernière connexion
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      // Envoi du refresh token sous forme de cookie HTTP-Only sécurisé
      res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

      const userSafe = user.toJSON();

      return sendSuccess(res, 200, 'Connexion réussie', {
        user: userSafe,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Renouvellement de l'Access Token à partir du Refresh Token HTTP-Only
   * POST /api/auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;

      if (!token) {
        return sendError(res, 401, 'Aucun jeton de renouvellement (Refresh Token) fourni.');
      }

      // Vérification de la signature du refresh token
      let decoded;
      try {
        decoded = await verifyToken(token, process.env.JWT_REFRESH_SECRET || 'bca_default_refresh_secret_key_9283748234');
      } catch (err) {
        return sendError(res, 401, 'Jeton de renouvellement invalide ou expiré.');
      }

      // Recherche de l'utilisateur ayant ce token enregistré
      const user = await User.findById(decoded.id).select('+refreshToken');
      if (!user || user.refreshToken !== token) {
        return sendError(res, 401, 'Session révoquée ou invalide. Veuillez vous reconnecter.');
      }

      if (!user.isActive) {
        return sendError(res, 403, 'Compte suspendu.');
      }

      // Création d'un nouvel Access Token
      const newAccessToken = generateAccessToken(user);

      return sendSuccess(res, 200, 'Jeton d’accès renouvelé', {
        accessToken: newAccessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Déconnexion de l'utilisateur et invalidation du token
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const token = req.cookies.refreshToken;
      if (token) {
        await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
      }

      res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
      return sendSuccess(res, 200, 'Déconnexion effectuée avec succès.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupère le profil de l'utilisateur actuellement connecté
   * GET /api/auth/me
   */
  async getMe(req, res) {
    return sendSuccess(res, 200, 'Profil récupéré', { user: req.user });
  },

  /**
   * Met à jour les informations du profil de l'utilisateur connecté
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const { name, phone, avatar, currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+password');

      if (!user) {
        return sendError(res, 404, 'Utilisateur introuvable.');
      }

      if (name) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (avatar !== undefined) user.avatar = avatar;

      // Changement de mot de passe si demandé
      if (newPassword) {
        if (!currentPassword) {
          return sendError(res, 400, 'Le mot de passe actuel est requis pour changer de mot de passe.');
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return sendError(res, 400, 'Le mot de passe actuel renseigné est incorrect.');
        }

        if (newPassword.length < 8) {
          return sendError(res, 400, 'Le nouveau mot de passe doit comporter au moins 8 caractères.');
        }

        user.password = newPassword;
      }

      await user.save();

      return sendSuccess(res, 200, 'Profil mis à jour avec succès.', {
        user: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  },
};
