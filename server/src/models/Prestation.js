import mongoose from 'mongoose';
import { createSlug } from '../utils/slugify.js';

const prestationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'L’intitulé de la prestation est obligatoire.'],
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
      required: [true, 'La catégorie de service est obligatoire.'],
      index: true,
    },
    summary: {
      type: String,
      required: [true, 'Le résumé court est obligatoire.'],
      trim: true,
      maxlength: [400, 'Le résumé ne peut excéder 400 caractères.'],
    },
    description: {
      type: String,
      required: [true, 'La description complète est requise.'],
    },
    benefits: {
      type: [String],
      default: [],
    },
    steps: [
      {
        stepNumber: { type: Number, default: 1 },
        title: { type: String, required: true },
        description: { type: String, default: '' },
      },
    ],
    examples: {
      type: [String],
      default: [],
    },
    delay: {
      type: String,
      default: 'Variable selon le cahier des charges',
      trim: true,
    },
    priceDisplay: {
      type: String,
      default: 'Sur devis personnalisé',
      trim: true,
    },
    isQuoteOnly: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: '/uploads/prestations/default-service.webp',
    },
    icon: {
      type: String,
      default: 'Briefcase',
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

prestationSchema.virtual('realisations', {
  ref: 'Realisation',
  localField: '_id',
  foreignField: 'prestation',
});

prestationSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = createSlug(this.title);
  }
  next();
});

prestationSchema.index({ status: 1, category: 1, isFeatured: 1 });

const Prestation = mongoose.model('Prestation', prestationSchema);
export default Prestation;
