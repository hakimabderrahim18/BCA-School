import nodemailer from 'nodemailer';

/**
 * Création et configuration du transporteur Nodemailer
 */
export const createTransporter = () => {
  const isSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

export const transporter = createTransporter();

/**
 * Vérifie la validité de la connexion SMTP
 */
export const verifyEmailConnection = async () => {
  try {
    if (!process.env.SMTP_USER || process.env.SMTP_PASS === 'your_app_password_here') {
      console.warn('[Nodemailer] Identifiants SMTP non configurés. Les emails seront simulés en console.');
      return false;
    }
    await transporter.verify();
    console.log('[Nodemailer] Connexion au serveur SMTP validée avec succès.');
    return true;
  } catch (error) {
    console.warn(`[Nodemailer] Avertissement connexion SMTP : ${error.message}`);
    return false;
  }
};
