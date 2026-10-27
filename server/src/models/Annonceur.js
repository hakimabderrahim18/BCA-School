import mongoose from 'mongoose';
import { createSlug } from '../utils/slugify.js';

const annonceurSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'La raison sociale ou nom de l’enseigne est obligatoire.'],
      trim: true,
      maxlength: [150, 'Le nom ne peut excéder 150 caractères.'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    sector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Le secteur d’activité est obligatoire.'],
      index: true,
    },
    logo: {
      type: String,
      required: [true, 'Le logo de l’annonceur est obligatoire.'],
    },
    coverImage: {
      type: String,
      default: '/uploads/partners/default-banner.webp',
    },
    shortDescription: {
      type: String,
      required: [true, 'Une présentation courte pour l’annuaire est obligatoire.'],
      trim: true,
      maxlength: [300, 'La description courte ne peut excéder 300 caractères.'],
    },
    fullDescription: {
      type: String,
      required: [true, 'La présentation complète de l’établissement est obligatoire.'],
    },
    address: {
      type: String,
      required: [true, 'L’adresse physique est requise.'],
      trim: true,
    },
    commune: {
      type: String,
      default: 'Tiaret',
      trim: true,
      index: true,
    },
    wilaya: {
      type: String,
      default: 'Tiaret (14)',
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone principal est obligatoire.'],
      trim: true,
    },
    secondaryPhone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '', trim: true },
      instagram: { type: String, default: '', trim: true },
      linkedin: { type: String, default: '', trim: true },
      youtube: { type: String, default: '', trim: true },
      tiktok: { type: String, default: '', trim: true },
    },
    openingHours: {
      type: String,
      default: 'Du Samedi au Jeudi : 08h30 - 17h30',
      trim: true,
    },
    coordinates: {
      lat: { type: Number, default: 35.371 }, // Coordonnées par défaut Tiaret
      lng: { type: Number, default: 1.317 },
    },
    gallery: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ['standard', 'premium', 'sponsorise'],
      default: 'standard',
    },
    subscriptionExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

annonceurSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = createSlug(this.name);
  }
  next();
});

annonceurSchema.index({ status: 1, sector: 1, commune: 1 });
annonceurSchema.index({ name: 'text', shortDescription: 'text', address: 'text' });

const Annonceur = mongoose.model('Annonceur', annonceurSchema);
export default Annonceur;
