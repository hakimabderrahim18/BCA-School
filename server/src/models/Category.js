import mongoose from 'mongoose';
import { createSlug } from '../utils/slugify.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la catégorie est obligatoire.'],
      trim: true,
      maxlength: [100, 'Le nom ne peut excéder 100 caractères.'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Le type de contenu est obligatoire.'],
      enum: {
        values: ['formation', 'prestation', 'article', 'event', 'annonceur', 'petite_annonce'],
        message: 'Type de catégorie non valide.',
      },
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: 'Folder',
    },
    color: {
      type: String,
      default: '#0e8ce8',
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Génération automatique du slug si absent ou modifié
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = createSlug(this.name);
  }
  next();
});

// Index composé pour optimiser les requêtes de filtrage par type et statut actif
categorySchema.index({ type: 1, isActive: 1, order: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;
