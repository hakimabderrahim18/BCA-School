import mongoose from 'mongoose';
import { createSlug } from '../utils/slugify.js';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre de l’événement est obligatoire.'],
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
      required: [true, 'La catégorie de l’événement est obligatoire.'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'La description de l’événement est obligatoire.'],
    },
    startDate: {
      type: Date,
      required: [true, 'La date de début est obligatoire.'],
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
      index: true,
    },
    startTime: {
      type: String,
      default: '09:00',
      trim: true,
    },
    endTime: {
      type: String,
      default: '17:00',
      trim: true,
    },
    location: {
      venue: { type: String, required: true, trim: true }, // ex: Maison de la Culture Ali Maachi
      address: { type: String, default: '', trim: true },
      commune: { type: String, required: true, default: 'Tiaret', trim: true, index: true },
      wilaya: { type: String, default: 'Tiaret (14)', trim: true },
      mapUrl: { type: String, default: '', trim: true },
    },
    organizer: {
      name: { type: String, required: true, trim: true },
      contactPerson: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true },
      website: { type: String, default: '', trim: true },
    },
    coverImage: {
      type: String,
      required: [true, 'L’affiche ou photo de l’événement est obligatoire.'],
    },
    price: {
      type: Number,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    registrationUrl: {
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
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = createSlug(this.title);
  }
  next();
});

eventSchema.index({ status: 1, startDate: 1, 'location.commune': 1 });
eventSchema.index({ title: 'text', description: 'text', 'location.venue': 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
