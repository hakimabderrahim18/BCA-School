import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom du partenaire ou organisme est obligatoire.'],
      trim: true,
      maxlength: [120, 'Le nom ne peut excéder 120 caractères.'],
    },
    logo: {
      type: String,
      required: [true, 'Le logo du partenaire est obligatoire.'],
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: {
        values: ['partenaire', 'agrement', 'client_reference', 'institution'],
        message: 'Type de partenariat non valide.',
      },
      default: 'partenaire',
      index: true,
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

partnerSchema.index({ isActive: 1, type: 1, order: 1 });

const Partner = mongoose.model('Partner', partnerSchema);
export default Partner;
