import { transporter } from '../config/nodemailer.js';

/**
 * Service centralisé pour l'expédition des e-mails transactionnels Nodemailer
 */
export const emailService = {
  /**
   * Envoie une notification à l'administrateur lors d'une nouvelle préinscription
   */
  async sendNewPreInscriptionNotification({ formationTitle, applicantName, email, phone, wilaya }) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'B.C.A. Tiaret'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@bca-tiaret.dz'}>`,
      to: adminEmail,
      subject: `[B.C.A.] Nouvelle Préinscription : ${formationTitle} - ${applicantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #082849; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Centre B.C.A. Tiaret</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Notification de Préinscription en ligne</p>
          </div>
          <div style="padding: 24px;">
            <p>Une nouvelle demande de préinscription vient d'être enregistrée sur le site :</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Formation :</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${formationTitle}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Candidat :</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${applicantName}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">E-mail :</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Téléphone :</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${phone}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7; font-weight: bold;">Wilaya :</td><td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${wilaya}</td></tr>
            </table>
            <div style="margin-top: 25px; text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/inscriptions" style="background-color: #026fc6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accéder au Panneau d'Administration</a>
            </div>
          </div>
          <div style="background-color: #f7fafc; padding: 12px; text-align: center; font-size: 12px; color: #718096;">
            © ${new Date().getFullYear()} B.C.A. Tiaret. Tous droits réservés.
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn(`[emailService] Échec de l'envoi de l'e-mail d'inscription : ${error.message}`);
    }
  },

  /**
   * Envoie un e-mail d'accusé de réception automatique au candidat
   */
  async sendPreInscriptionConfirmationToApplicant({ applicantName, email, formationTitle }) {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'B.C.A. Tiaret'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@bca-tiaret.dz'}>`,
      to: email,
      subject: `Confirmation de votre préinscription à la formation "${formationTitle}" - B.C.A. Tiaret`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #082849; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">B.C.A. Formation & Communication</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Tiaret, Algérie</p>
          </div>
          <div style="padding: 24px;">
            <p>Bonjour <strong>${applicantName}</strong>,</p>
            <p>Nous avons bien reçu votre demande de préinscription pour la formation :</p>
            <div style="background-color: #ebf8ff; border-left: 4px solid #026fc6; padding: 12px 16px; margin: 16px 0; font-weight: bold; color: #074b83;">
              ${formationTitle}
            </div>
            <p>Notre équipe pédagogique va examiner votre demande et vous contactera rapidement par téléphone pour vous confirmer les dates de session et les démarches de finalisation de votre dossier.</p>
            <p>Pour toute urgence ou question complémentaire, contactez-nous directement par téléphone ou WhatsApp.</p>
            <p style="margin-top: 20px;">Cordialement,<br><strong>L'équipe B.C.A. Tiaret</strong></p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn(`[emailService] Échec envoi confirmation candidat : ${error.message}`);
    }
  },

  /**
   * Envoie une alerte lors d'un nouveau message de contact
   */
  async sendContactMessageNotification({ fullName, email, phone, subject, message }) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'B.C.A. Tiaret'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@bca-tiaret.dz'}>`,
      to: adminEmail,
      subject: `[B.C.A. Contact] ${subject} - de ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #082849; color: #fff; padding: 20px;">
            <h3 style="margin: 0;">Nouveau Message de Contact</h3>
          </div>
          <div style="padding: 24px;">
            <p><strong>De :</strong> ${fullName} (<a href="mailto:${email}">${email}</a> | Tél: ${phone})</p>
            <p><strong>Objet :</strong> ${subject}</p>
            <div style="background-color: #f7fafc; padding: 16px; border-radius: 6px; margin-top: 15px; border: 1px solid #e2e8f0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn(`[emailService] Échec notification message contact : ${error.message}`);
    }
  },

  /**
   * Envoie une alerte lors d'une nouvelle demande de devis
   */
  async sendQuoteRequestNotification({ fullName, company, email, phone, type, projectDescription }) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'B.C.A. Tiaret'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@bca-tiaret.dz'}>`,
      to: adminEmail,
      subject: `[B.C.A. Devis] Demande de Devis (${type}) - ${company || fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #082849; color: #fff; padding: 20px;">
            <h3 style="margin: 0;">Nouvelle Demande de Devis</h3>
          </div>
          <div style="padding: 24px;">
            <p><strong>Client :</strong> ${fullName} ${company ? `(${company})` : ''}</p>
            <p><strong>Contact :</strong> <a href="mailto:${email}">${email}</a> | Tél: ${phone}</p>
            <p><strong>Type :</strong> ${type}</p>
            <div style="background-color: #f7fafc; padding: 16px; border-radius: 6px; margin-top: 15px; border: 1px solid #e2e8f0;">
              <strong>Description du besoin :</strong><br>
              ${projectDescription.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn(`[emailService] Échec notification devis : ${error.message}`);
    }
  },
};
