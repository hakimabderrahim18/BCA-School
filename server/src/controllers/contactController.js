import ContactMessage from '../models/ContactMessage.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';
import { emailService } from '../services/emailService.js';
import { exportToCSV } from '../services/csvExportService.js';
import { transporter } from '../config/nodemailer.js';

export const contactController = {
  // ============================================================================
  // FORMULAIRE DE CONTACT (PUBLIC)
  // ============================================================================

  /**
   * Envoi d'un message depuis le formulaire de contact public
   * POST /api/contact
   */
  async sendMessage(req, res, next) {
    try {
      const { fullName, email, phone, subject, message } = req.body;

      if (!fullName || !email || !phone || !subject || !message) {
        return sendError(res, 400, 'Tous les champs du formulaire sont obligatoires.');
      }

      const contact = await ContactMessage.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      // Notification par email asynchrone pour la direction
      emailService.sendContactMessageNotification({
        fullName,
        email,
        phone,
        subject,
        message,
      });

      return sendSuccess(res, 201, 'Votre message a bien été envoyé. Notre équipe vous répondra dans les plus brefs délais.', contact);
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (MESSAGES DE CONTACT)
  // ============================================================================

  /**
   * Liste des messages avec filtres et pagination
   * GET /api/contact/messages
   */
  async getMessages(req, res, next) {
    try {
      const { status, search, page = 1, limit = 15 } = req.query;
      const query = {};

      if (status) query.status = status;
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await ContactMessage.countDocuments(query);
      const messages = await ContactMessage.find(query)
        .populate('handledBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, messages, total, page, limit, 'Messages reçus');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Consultation d'un message unique (passe en 'lu' si c'était 'nouveau')
   * GET /api/contact/messages/:id
   */
  async getMessageById(req, res, next) {
    try {
      const { id } = req.params;
      const message = await ContactMessage.findById(id).populate('handledBy', 'name email');

      if (!message) return sendError(res, 404, 'Message introuvable.');

      if (message.status === 'nouveau') {
        message.status = 'lu';
        await message.save();
      }

      return sendSuccess(res, 200, 'Détail du message', message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Met à jour le statut d'un message
   * PATCH /api/contact/messages/:id/status
   */
  async updateMessageStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, replyNotes } = req.body;

      const message = await ContactMessage.findById(id);
      if (!message) return sendError(res, 404, 'Message introuvable.');

      if (status) message.status = status;
      if (replyNotes !== undefined) message.replyNotes = replyNotes;
      message.handledBy = req.user._id;

      await message.save();
      return sendSuccess(res, 200, 'Statut du message mis à jour', message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Répond directement par email au contact depuis le back-office
   * POST /api/contact/messages/:id/reply
   */
  async replyMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { replyText, replySubject } = req.body;

      if (!replyText) {
        return sendError(res, 400, 'Le contenu de la réponse est obligatoire.');
      }

      const contact = await ContactMessage.findById(id);
      if (!contact) return sendError(res, 404, 'Message introuvable.');

      const subject = replySubject || `Re: ${contact.subject} - B.C.A. Tiaret`;

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'B.C.A. Tiaret'}" <${process.env.SMTP_FROM_EMAIL || 'contact@bca-tiaret.dz'}>`,
        to: contact.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p>Bonjour <strong>${contact.fullName}</strong>,</p>
            <div style="margin: 20px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #082849;">
              ${replyText.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 13px; color: #718096;">
              En réponse à votre message du ${new Date(contact.createdAt).toLocaleDateString('fr-FR')} concernant : "${contact.subject}"
            </p>
            <p style="font-size: 13px; color: #718096; margin-top: 15px;">
              <strong>B.C.A. - Centre de Formation & Communication</strong><br>
              Tiaret, Algérie
            </p>
          </div>
        `,
      });

      contact.status = 'repondu';
      contact.isReplied = true;
      contact.repliedAt = new Date();
      contact.replyNotes = (contact.replyNotes ? contact.replyNotes + '\n' : '') + `[Réponse envoyée le ${new Date().toISOString()}] : ${replyText}`;
      contact.handledBy = req.user._id;

      await contact.save();
      return sendSuccess(res, 200, 'Réponse envoyée par e-mail avec succès.', contact);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Exporte les messages de contact au format CSV
   * GET /api/contact/messages/export/csv
   */
  async exportMessagesCSV(req, res, next) {
    try {
      const messages = await ContactMessage.find({}).sort({ createdAt: -1 });

      const fields = [
        { label: 'Date', key: 'createdAt' },
        { label: 'Nom & Prénom', key: 'fullName' },
        { label: 'Email', key: 'email' },
        { label: 'Téléphone', key: 'phone' },
        { label: 'Objet', key: 'subject' },
        { label: 'Message', key: 'message' },
        { label: 'Statut', key: 'status' },
      ];

      return exportToCSV(messages, fields, res, `messages_contact_bca_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      next(error);
    }
  },

  async deleteMessage(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await ContactMessage.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Message introuvable.');

      return sendSuccess(res, 200, 'Message supprimé.');
    } catch (error) {
      next(error);
    }
  },
};
