import mongoose from 'mongoose';

const eventProposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre de l’événement proposé est obligatoire.'],
      trim: true,
      maxlength: [200, 'Le titre ne peut excéder 200 caractères.'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La catégorie est obligatoire.'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'La date de début est obligatoire.'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    startTime: {
      type: String,
      default: '09:00',
    },
    endTime: {
      type: String,
      default: '18:00',
    },
    venue: {
      type: String,
      required: [true, 'Le lieu ou salle est obligatoire.'],
      trim: true,
    },
    commune: {
      type: String,
      required: [true, 'La commune est obligatoire (ex: Tiaret).'],
      trim: true,
      default: 'Tiaret',
    },
    organizerName: {
      type: String,
      required: [true, 'Le nom de l’organisateur ou association est obligatoire.'],
      trim: true,
    },
    organizerPhone: {
      type: String,
      required: [true, 'Le téléphone de contact est obligatoire.'],
      trim: true,
    },
    organizerEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    flyerImage: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNote: {
      type: String,
      default: '',
    },
    approvedEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

eventProposalSchema.index({ status: 1, createdAt: -1 });

const EventProposal = mongoose.model('EventProposal', eventProposalSchema);
export default EventProposal;
