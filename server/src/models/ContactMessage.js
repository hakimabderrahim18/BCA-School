import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Le nom complet est obligatoire.'],
      trim: true,
      maxlength: [120, 'Le nom ne peut excéder 120 caractères.'],
    },
    email: {
      type: String,
      required: [true, 'L’adresse e-mail est obligatoire.'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Adresse e-mail non valide.'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est obligatoire.'],
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'L’objet du message est obligatoire.'],
      trim: true,
      maxlength: [200, 'L’objet ne peut excéder 200 caractères.'],
    },
    message: {
      type: String,
      required: [true, 'Le message est obligatoire.'],
      trim: true,
      maxlength: [3000, 'Le message ne peut excéder 3000 caractères.'],
    },
    status: {
      type: String,
      enum: ['nouveau', 'lu', 'repondu', 'archive'],
      default: 'nouveau',
      index: true,
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    replyNotes: {
      type: String,
      default: '',
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;
