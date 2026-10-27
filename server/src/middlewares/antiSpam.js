import { sendError, sendSuccess } from '../utils/apiResponse.js';

/**
 * Middleware anti-spam pour les formulaires publics
 * Combine honeypot invisible et vérification reCAPTCHA v3 optionnelle
 */
export const antiSpam = async (req, res, next) => {
  try {
    const honeypotFieldName = process.env.HONEYPOT_FIELD_NAME || 'website_hp';

    // 1. Vérification Honeypot (champ invisible censé rester vierge)
    if (req.body && req.body[honeypotFieldName]) {
      console.warn(`[AntiSpam] Soumission bloquée par Honeypot depuis l'IP ${req.ip}`);
      // On répond un faux succès 200 pour leurrer les robots sans enregistrer en base
      return sendSuccess(res, 200, 'Votre message a bien été envoyé.');
    }

    // 2. Vérification reCAPTCHA (si configuré dans les variables d'environnement)
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const clientToken = req.body.recaptchaToken || req.headers['x-recaptcha-token'];

    if (recaptchaSecret && recaptchaSecret.trim() !== '') {
      if (!clientToken) {
        return sendError(res, 400, 'Vérification de sécurité anti-spam requise (reCAPTCHA manquant).');
      }

      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: recaptchaSecret,
          response: clientToken,
        }),
      });

      const { success, score } = await response.json();

      // Score minimal accepté pour reCAPTCHA v3 (0.0 = bot certain, 1.0 = humain certain)
      if (!success || (score !== undefined && score < 0.5)) {
        console.warn(`[AntiSpam] Échec du test reCAPTCHA (score: ${score}) depuis l'IP ${req.ip}`);
        return sendError(res, 403, 'Échec de la validation de sécurité anti-spam. Veuillez réessayer.');
      }
    }

    next();
  } catch (error) {
    console.error(`[AntiSpam] Erreur interne du middleware anti-spam : ${error.message}`);
    // En cas de panne de Google reCAPTCHA, on laisse passer pour ne pas pénaliser les utilisateurs légitimes
    next();
  }
};
