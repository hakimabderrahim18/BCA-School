import mongoose from 'mongoose';
import { createSlug } from '../utils/slugify.js';

const petiteAnnonceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre de l’annonce est obligatoire.'],
      trim: true,
      maxlength: [150, 'Le titre ne peut excéder 150 caractères.'],
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
      required: [true, 'La catégorie de la petite annonce est requise.'],
      index: true,
    },
    type: {
      type: String,
      enum: ['offre', 'demande'],
      default: 'offre',
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Le descriptif de l’annonce est obligatoire.'],
      trim: true,
    },
    price: {
      type: Number,
      default: null,
    },
    priceDisplay: {
      type: String,
      default: 'Prix à débattre',
      trim: true,
    },
    isNegotiable: {
      type: Boolean,
      default: false,
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
    contactName: {
      type: String,
      required: [true, 'Le nom du déclarant est obligatoire.'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Le numéro de téléphone est obligatoire.'],
      trim: true,
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // Valide 30 jours par défaut
      index: true,
    },
    moderationNote: {
      type: String,
      default: '',
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

petiteAnnonceSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = `${createSlug(this.title)}-${Math.random().toString(36).substring(2, 6)}`;
  }
  next();
});

petiteAnnonceSchema.index({ status: 1, category: 1, createdAt: -1 });

const PetiteAnnonce = mongoose.model('PetiteAnnonce', petiteAnnonceSchema);
export default PetiteAnnonce;
