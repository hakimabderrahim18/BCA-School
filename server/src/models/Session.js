import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    formation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formation',
      required: [true, 'La formation associée est obligatoire.'],
      index: true,
    },
    sessionCode: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'La date de début de session est obligatoire.'],
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    schedule: {
      type: String,
      required: [true, 'Le planning horaire est requis (ex: Samedi et Mardi 09h00 - 12h00).'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Siège B.C.A. - Rue Principale, Tiaret',
      trim: true,
    },
    modality: {
      type: String,
      enum: {
        values: ['presentiel', 'en_ligne', 'hybride'],
        message: 'Modalité non valide.',
      },
      default: 'presentiel',
    },
    maxSeats: {
      type: Number,
      default: 15,
      min: [1, 'Une session doit comporter au moins une place.'],
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed', 'cancelled'],
      default: 'planned',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual pour vérifier si la session est complète
sessionSchema.virtual('isFull').get(function () {
  return this.enrolledCount >= this.maxSeats;
});

// Virtual pour le nombre de places restantes
sessionSchema.virtual('availableSeats').get(function () {
  return Math.max(0, this.maxSeats - this.enrolledCount);
});

sessionSchema.index({ formation: 1, startDate: 1, status: 1 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
