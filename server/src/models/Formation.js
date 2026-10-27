import mongoose from 'mongoose';
import { createSlug } from '../utils/slugify.js';

const formationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'L’intitulé de la formation est obligatoire.'],
      trim: true,
      maxlength: [200, 'Le titre ne peut excéder 200 caractères.'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La catégorie de formation est obligatoire.'],
      index: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Un résumé court est obligatoire pour les cartes d’affichage.'],
      maxlength: [400, 'Le résumé ne peut excéder 400 caractères.'],
    },
    description: {
      type: String,
      required: [true, 'La description détaillée est requise.'],
    },
    objectives: {
      type: [String],
      default: [],
    },
    targetAudience: {
      type: [String],
      default: [], // Ex: Étudiants, Professionnels, Demandeurs d'emploi
    },
    prerequisites: {
      type: [String],
      default: ['Aucun prérequis particulier requis.'],
    },
    program: [
      {
        moduleNumber: { type: Number, default: 1 },
        title: { type: String, required: true },
        content: { type: String, default: '' },
        duration: { type: String, default: '' },
      },
    ],
    duration: {
      type: String,
      default: '',
      trim: true,
    },
    durationHours: {
      type: Number,
      default: 30,
    },
    durationWeeks: {
      type: Number,
      default: 4,
    },
    price: {
      type: Number,
      default: null,
    },
    priceDisplay: {
      type: String,
      default: 'Nous consulter', // Ex: "25 000 DZD" ou "Sur devis"
    },
    certification: {
      type: String,
      default: 'Attestation de formation qualifiante agréée B.C.A.',
    },
    trainer: {
      name: { type: String, default: '' },
      title: { type: String, default: 'Formateur expert B.C.A.' },
      bio: { type: String, default: '' },
      photo: { type: String, default: '' },
    },
    image: {
      type: String,
      default: '/uploads/formations/default-course.webp',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual pour lier dynamiquement les sessions associées à cette formation
formationSchema.virtual('sessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'formation',
});

// Génération automatique du slug
formationSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = createSlug(this.title);
  }
  next();
});

formationSchema.index({ status: 1, category: 1, isFeatured: 1 });
formationSchema.index({ title: 'text', summary: 'text', description: 'text' });

const Formation = mongoose.model('Formation', formationSchema);
export default Formation;
