import mongoose from 'mongoose';

const mediaItemSchema = new mongoose.Schema(
  {
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
      required: [true, 'L’album associé est obligatoire.'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
      index: true,
    },
    url: {
      type: String,
      required: [true, 'L’URL du média (image ou vidéo) est obligatoire.'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    videoProvider: {
      type: String,
      enum: ['none', 'youtube', 'vimeo', 'facebook', 'local'],
      default: 'none',
    },
    embedUrl: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
      default: '',
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

mediaItemSchema.index({ album: 1, order: 1 });

const MediaItem = mongoose.model('MediaItem', mediaItemSchema);
export default MediaItem;
