import mongoose from 'mongoose';
import { createSlug } from '../utils/slugify.js';

const realisationSchema = new mongoose.Schema(
  {
    prestation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prestation',
      required: [true, 'La prestation rattachée est obligatoire.'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Le titre du projet/réalisation est obligatoire.'],
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
    clientName: {
      type: String,
      required: [true, 'Le nom du client ou de l’organisation est obligatoire.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La description de la réalisation est requise.'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    coverImage: {
      type: String,
      required: [true, 'L’image principale du projet est obligatoire.'],
    },
    images: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    testimonial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Testimonial',
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
  }
);

realisationSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = createSlug(this.title);
  }
  next();
});

realisationSchema.index({ prestation: 1, isFeatured: 1, createdAt: -1 });

const Realisation = mongoose.model('Realisation', realisationSchema);
export default Realisation;
