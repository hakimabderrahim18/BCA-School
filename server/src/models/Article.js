import mongoose from 'mongoose';
import { createSlug } from '../utils/slugify.js';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre de l’article est obligatoire.'],
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
      required: [true, 'La catégorie de l’article est obligatoire.'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L’auteur de l’article est obligatoire.'],
      index: true,
    },
    summary: {
      type: String,
      required: [true, 'Un résumé court (chapeau) est obligatoire.'],
      trim: true,
      maxlength: [500, 'Le résumé ne peut excéder 500 caractères.'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu complet de l’article est obligatoire.'],
    },
    coverImage: {
      type: String,
      required: [true, 'L’image de couverture est obligatoire.'],
    },
    tags: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Slug auto-généré
articleSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = createSlug(this.title);
  }
  // Si statut passe à published et que publishedAt est null, assigner la date actuelle
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Index de recherche textuelle et filtres combinés
articleSchema.index({ status: 1, publishedAt: -1, category: 1 });
articleSchema.index({ title: 'text', summary: 'text', content: 'text' });

const Article = mongoose.model('Article', articleSchema);
export default Article;
