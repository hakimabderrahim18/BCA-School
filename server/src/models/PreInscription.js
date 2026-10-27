import mongoose from 'mongoose';

const preInscriptionSchema = new mongoose.Schema(
  {
    formation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formation',
      required: [true, 'La formation sélectionnée est obligatoire.'],
      index: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },
    fullName: {
      type: String,
      required: [true, 'Le nom et prénom sont obligatoires.'],
      trim: true,
      maxlength: [120, 'Le nom ne peut excéder 120 caractères.'],
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
    wilaya: {
      type: String,
      default: 'Tiaret (14)',
      trim: true,
    },
    commune: {
      type: String,
      trim: true,
      default: 'Tiaret',
    },
    currentStatus: {
      type: String,
      enum: {
        values: ['etudiant', 'salarie', 'demandeur_emploi', 'professionnel', 'autre'],
        message: 'Statut professionnel non valide.',
      },
      default: 'professionnel',
    },
    motivation: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['nouveau', 'en_cours', 'confirme', 'annule'],
      default: 'nouveau',
      index: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    internalNotes: {
      type: String,
      default: '',
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

preInscriptionSchema.index({ status: 1, createdAt: -1 });

const PreInscription = mongoose.model('PreInscription', preInscriptionSchema);
export default PreInscription;
