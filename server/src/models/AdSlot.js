import mongoose from 'mongoose';

const adSlotSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre de la campagne ou bannière est obligatoire.'],
      trim: true,
      maxlength: [150, 'Le titre ne peut excéder 150 caractères.'],
    },
    slotKey: {
      type: String,
      required: [true, 'L’emplacement de diffusion est obligatoire.'],
      enum: {
        values: [
          'home_banner_top',
          'home_banner_middle',
          'home_sidebar',
          'article_inline',
          'event_sidebar',
          'annonces_top',
        ],
        message: 'Emplacement publicitaire non valide.',
      },
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Le visuel ou bannière publicitaire est obligatoire.'],
    },
    targetUrl: {
      type: String,
      required: [true, 'Le lien de redirection vers le site ou WhatsApp est obligatoire.'],
      trim: true,
    },
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Annonceur',
      default: null,
    },
    advertiserName: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'La date de début d’affichage est obligatoire.'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'La date de fin d’affichage est obligatoire.'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 1,
    },
    clicksCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    impressionsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual pour vérifier si la publicité est activement en cours de diffusion
adSlotSchema.virtual('isCurrentlyActive').get(function () {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
});

adSlotSchema.index({ slotKey: 1, isActive: 1, startDate: 1, endDate: 1 });

const AdSlot = mongoose.model('AdSlot', adSlotSchema);
export default AdSlot;
