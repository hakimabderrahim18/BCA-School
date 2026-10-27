import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: [true, 'Le nom de l’auteur du témoignage est obligatoire.'],
      trim: true,
      maxlength: [100, 'Le nom ne peut excéder 100 caractères.'],
    },
    roleOrCompany: {
      type: String,
      required: [true, 'La fonction ou entreprise est requise.'],
      trim: true,
      maxlength: [150, 'Ce champ ne peut excéder 150 caractères.'],
    },
    type: {
      type: String,
      enum: {
        values: ['stagiaire', 'client', 'partenaire'],
        message: 'Type de témoignage non valide.',
      },
      default: 'stagiaire',
      index: true,
    },
    formation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formation',
      default: null,
    },
    prestation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prestation',
      default: null,
    },
    content: {
      type: String,
      required: [true, 'Le texte du témoignage est obligatoire.'],
      trim: true,
      maxlength: [1000, 'Le texte ne peut excéder 1000 caractères.'],
    },
    rating: {
      type: Number,
      min: [1, 'La note minimale est de 1.'],
      max: [5, 'La note maximale est de 5.'],
      default: 5,
    },
    avatar: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

testimonialSchema.index({ isActive: 1, isFeatured: 1, type: 1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
