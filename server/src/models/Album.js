import mongoose from 'mongoose';
import { createSlug } from '../utils/slugify.js';

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre de l’album est obligatoire.'],
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
    theme: {
      type: String,
      enum: {
        values: ['formations', 'evenements', 'clients', 'vie_locale', 'autre'],
        message: 'Thème d’album non valide.',
      },
      required: [true, 'Le thème de l’album est obligatoire.'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    coverImage: {
      type: String,
      required: [true, 'L’image de couverture de l’album est obligatoire.'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

albumSchema.virtual('mediaItems', {
  ref: 'MediaItem',
  localField: '_id',
  foreignField: 'album',
});

albumSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = createSlug(this.title);
  }
  next();
});

albumSchema.index({ theme: 1, isFeatured: 1, date: -1 });

const Album = mongoose.model('Album', albumSchema);
export default Album;
