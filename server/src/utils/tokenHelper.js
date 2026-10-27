import jwt from 'jsonwebtoken';

/**
 * Génère un Access Token JWT de courte durée (ex: 15 min)
 * Contient l'ID utilisateur, l'email et son rôle
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET || 'bca_default_access_secret_key_3847298374',
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    }
  );
};

/**
 * Génère un Refresh Token JWT de plus longue durée (ex: 7 jours)
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET || 'bca_default_refresh_secret_key_9283748234',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Options sécurisées pour le stockage du refresh token dans un cookie HTTP-Only
 */
export const getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction, // HTTPS uniquement en production
    sameSite: isProduction ? 'none' : 'lax', // 'none' permet le fonctionnement cross-origin entre Vercel et Render
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
    path: '/',
  };
};

/**
 * Vérifie un token JWT avec la clé secrète spécifiée
 */
export const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};
