import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['prestation', 'publicite', 'formation_sur_mesure'],
        message: 'Type de devis non valide.',
      },
      default: 'prestation',
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Le nom et prénom du demandeur sont obligatoires.'],
      trim: true,
      maxlength: [120, 'Le nom ne peut excéder 120 caractères.'],
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'L’adresse e-mail est obligatoire.'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Adresse e-mail invalide.'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est obligatoire.'],
      trim: true,
      index: true,
    },
    prestation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prestation',
      default: null,
    },
    adSlotInterest: {
      type: String,
      default: '',
    },
    budget: {
      type: String,
      default: 'Non précisé',
    },
    deadline: {
      type: String,
      default: 'Dès que possible',
    },
    projectDescription: {
      type: String,
      required: [true, 'La description de votre projet ou besoin est obligatoire.'],
      trim: true,
      maxlength: [4000, 'La description ne peut excéder 4000 caractères.'],
    },
    status: {
      type: String,
      enum: ['nouveau', 'en_etude', 'devis_envoye', 'accepte', 'refuse'],
      default: 'nouveau',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    internalNotes: {
      type: String,
      default: '',
    },
    estimatedAmount: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

quoteRequestSchema.index({ status: 1, createdAt: -1 });

const QuoteRequest = mongoose.model('QuoteRequest', quoteRequestSchema);
export default QuoteRequest;
