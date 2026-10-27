import Album from '../models/Album.js';
import MediaItem from '../models/MediaItem.js';
import { sendSuccess, sendError, sendPagination } from '../utils/apiResponse.js';

export const galleryController = {
  // ============================================================================
  // GALERIE - PUBLIC
  // ============================================================================

  /**
   * Liste des albums photo/vidéo classés par thème
   * GET /api/albums?theme=formations
   */
  async getAlbums(req, res, next) {
    try {
      const { theme, page = 1, limit = 12 } = req.query;
      const query = {};
      if (theme) query.theme = theme;

      const total = await Album.countDocuments(query);
      const albums = await Album.find(query)
        .sort({ order: 1, date: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return sendPagination(res, albums, total, page, limit, 'Albums de la galerie');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Détail d'un album avec l'ensemble de ses médias (photos et vidéos)
   * GET /api/albums/:slug
   */
  async getAlbumBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const album = await Album.findOne({ slug }).populate({
        path: 'mediaItems',
        options: { sort: { order: 1, createdAt: -1 } },
      });

      if (!album) {
        return sendError(res, 404, 'Album introuvable.');
      }

      return sendSuccess(res, 200, 'Détail de l’album', album);
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (ALBUMS & MÉDIAS)
  // ============================================================================

  async createAlbum(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) data.coverImage = req.file.path;

      if (!data.title || !data.theme || !data.coverImage) {
        return sendError(res, 400, 'Titre, thème et image de couverture sont requis.');
      }

      const album = await Album.create(data);
      return sendSuccess(res, 201, 'Album créé avec succès', album);
    } catch (error) {
      next(error);
    }
  },

  async updateAlbum(req, res, next) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (req.file) data.coverImage = req.file.path;

      const album = await Album.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!album) return sendError(res, 404, 'Album introuvable.');

      return sendSuccess(res, 200, 'Album mis à jour', album);
    } catch (error) {
      next(error);
    }
  },

  async deleteAlbum(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Album.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Album introuvable.');

      await MediaItem.deleteMany({ album: id });
      return sendSuccess(res, 200, 'Album et médias supprimés.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ajoute un média (photo ou vidéo) à un album
   * POST /api/albums/:id/media
   */
  async addMediaItem(req, res, next) {
    try {
      const { id } = req.params;
      const { title, type, videoProvider, embedUrl, caption, videoUrl } = req.body;

      const album = await Album.findById(id);
      if (!album) return sendError(res, 404, 'Album introuvable.');

      let mediaUrl = videoUrl || '';
      if (req.file) {
        mediaUrl = req.file.path;
      }

      if (!mediaUrl && !embedUrl) {
        return sendError(res, 400, 'Fichier image ou URL vidéo requis.');
      }

      const mediaItem = await MediaItem.create({
        album: id,
        title: title || '',
        type: type || 'photo',
        url: mediaUrl,
        videoProvider: videoProvider || 'none',
        embedUrl: embedUrl || '',
        caption: caption || '',
      });

      return sendSuccess(res, 201, 'Média ajouté à l’album', mediaItem);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Supprime un média d'un album
   * DELETE /api/albums/media/:mediaId
   */
  async deleteMediaItem(req, res, next) {
    try {
      const { mediaId } = req.params;
      const deleted = await MediaItem.findByIdAndDelete(mediaId);
      if (!deleted) return sendError(res, 404, 'Média introuvable.');

      return sendSuccess(res, 200, 'Média supprimé avec succès.');
    } catch (error) {
      next(error);
    }
  },
};
