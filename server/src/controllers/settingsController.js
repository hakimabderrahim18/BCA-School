import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import SiteSettings from '../models/SiteSettings.js';
import Partner from '../models/Partner.js';
import Testimonial from '../models/Testimonial.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const saveUploadedBuffer = async (fileObj, subfolder = 'settings', width = 1920) => {
  if (!fileObj || !fileObj.buffer) return null;
  const uploadDir = path.join(process.cwd(), 'uploads', subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  if (fileObj.mimetype === 'image/svg+xml') {
    const filename = `${subfolder}-${timestamp}-${randomStr}.svg`;
    fs.writeFileSync(path.join(uploadDir, filename), fileObj.buffer);
    return `/uploads/${subfolder}/${filename}`;
  }
  const filename = `${subfolder}-${timestamp}-${randomStr}.webp`;
  const filePath = path.join(uploadDir, filename);
  await sharp(fileObj.buffer)
    .resize({ width, withoutEnlargement: true, fit: 'inside' })
    .toFormat('webp', { quality: 85 })
    .toFile(filePath);
  return `/uploads/${subfolder}/${filename}`;
};

export const settingsController = {
  // ============================================================================
  // PARAMÈTRES DU SITE (PUBLIC)
  // ============================================================================

  /**
   * Récupère la configuration globale publique du site (coordonnées, réseaux, À propos, SEO, tarifs pub)
   * GET /api/settings
   */
  async getSettings(req, res, next) {
    try {
      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create({});
      }
      return sendSuccess(res, 200, 'Paramètres du site', settings);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupère les partenaires et logos pour le bandeau défilant et la page À propos
   * GET /api/settings/partners
   */
  async getPartners(req, res, next) {
    try {
      const partners = await Partner.find({ isActive: true }).sort({ order: 1 });
      return sendSuccess(res, 200, 'Partenaires et agréments', partners);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupère tous les partenaires pour le panneau admin
   * GET /api/settings/partners/admin
   */
  async getAllPartnersAdmin(req, res, next) {
    try {
      const partners = await Partner.find().sort({ order: 1, createdAt: -1 });
      return sendSuccess(res, 200, 'Tous les partenaires (Admin)', partners);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupère les avis et témoignages validés
   * GET /api/settings/testimonials
   */
  async getTestimonials(req, res, next) {
    try {
      const { type } = req.query;
      const query = { isActive: true };
      if (type) query.type = type;

      const testimonials = await Testimonial.find(query)
        .populate('formation', 'title slug')
        .populate('prestation', 'title slug')
        .sort({ isFeatured: -1, order: 1, createdAt: -1 });

      return sendSuccess(res, 200, 'Témoignages clients et stagiaires', testimonials);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupère tous les avis et témoignages pour l'administration
   * GET /api/settings/testimonials/admin
   */
  async getAllTestimonialsAdmin(req, res, next) {
    try {
      const testimonials = await Testimonial.find()
        .populate('formation', 'title slug')
        .populate('prestation', 'title slug')
        .sort({ createdAt: -1 });

      return sendSuccess(res, 200, 'Tous les témoignages (Admin)', testimonials);
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // GESTION ADMIN (PARAMÈTRES, PARTENAIRES & TÉMOIGNAGES)
  // ============================================================================

  /**
   * Met à jour les paramètres généraux du site (Admin only)
   * PUT /api/settings
   */
  async updateSettings(req, res, next) {
    try {
      const data = { ...req.body };
      let settings = await SiteSettings.findOne();
      if (!settings) settings = new SiteSettings();

      // Traitement des objets imbriqués envoyés en FormData ou JSON
      const jsonFields = ['contact', 'socialLinks', 'about', 'advertisingRates', 'adPricing', 'seo', 'colors', 'homePhotos'];
      jsonFields.forEach((field) => {
        if (typeof data[field] === 'string') {
          try {
            data[field] = JSON.parse(data[field]);
          } catch {}
        }
      });

      // Fusion des objets imbriqués pour préserver les sous-champs
      if (data.homePhotos) {
        const cleanHomePhotos = {};
        for (const [k, v] of Object.entries(data.homePhotos)) {
          if (v && !String(v).startsWith('blob:')) {
            cleanHomePhotos[k] = v;
          }
        }
        settings.homePhotos = {
          ...(settings.homePhotos ? (settings.homePhotos.toObject ? settings.homePhotos.toObject() : settings.homePhotos) : {}),
          ...cleanHomePhotos,
        };
        delete data.homePhotos;
      }

      // Nettoyer les champs de marque s'ils contiennent 'blob:'
      if (data.logo && String(data.logo).startsWith('blob:')) delete data.logo;
      if (data.logoWhite && String(data.logoWhite).startsWith('blob:')) delete data.logoWhite;
      if (data.favicon && String(data.favicon).startsWith('blob:')) delete data.favicon;

      // Gestion des fichiers téléversés (priorité absolue sur les champs texte)
      if (req.files) {
        if (req.files.logo?.[0]) {
          settings.logo = await saveUploadedBuffer(req.files.logo[0], 'settings', 600);
          delete data.logo;
        }
        if (req.files.logoWhite?.[0]) {
          settings.logoWhite = await saveUploadedBuffer(req.files.logoWhite[0], 'settings', 600);
          delete data.logoWhite;
        }
        if (req.files.favicon?.[0]) {
          settings.favicon = await saveUploadedBuffer(req.files.favicon[0], 'settings', 128);
          delete data.favicon;
        }
        if (!settings.homePhotos) settings.homePhotos = {};
        if (req.files.heroSlide1?.[0]) {
          settings.homePhotos.heroSlide1 = await saveUploadedBuffer(req.files.heroSlide1[0], 'home', 1920);
        }
        if (req.files.heroSlide2?.[0]) {
          settings.homePhotos.heroSlide2 = await saveUploadedBuffer(req.files.heroSlide2[0], 'home', 1920);
        }
        if (req.files.heroSlide3?.[0]) {
          settings.homePhotos.heroSlide3 = await saveUploadedBuffer(req.files.heroSlide3[0], 'home', 1920);
        }
        if (req.files.ctaBanner?.[0]) {
          settings.homePhotos.ctaBanner = await saveUploadedBuffer(req.files.ctaBanner[0], 'home', 1920);
        }
      }

      if (data.adPricing) {
        settings.adPricing = {
          ...(settings.adPricing ? (settings.adPricing.toObject ? settings.adPricing.toObject() : settings.adPricing) : {}),
          ...data.adPricing,
        };
        delete data.adPricing;
      }

      if (data.contact) {
        settings.contact = {
          ...(settings.contact ? (settings.contact.toObject ? settings.contact.toObject() : settings.contact) : {}),
          ...data.contact,
        };
        delete data.contact;
      }

      if (data.socialLinks) {
        settings.socialLinks = {
          ...(settings.socialLinks ? (settings.socialLinks.toObject ? settings.socialLinks.toObject() : settings.socialLinks) : {}),
          ...data.socialLinks,
        };
        delete data.socialLinks;
      }

      if (data.seo) {
        settings.seo = {
          ...(settings.seo ? (settings.seo.toObject ? settings.seo.toObject() : settings.seo) : {}),
          ...data.seo,
        };
        delete data.seo;
      }

      Object.assign(settings, data);
      await settings.save();

      return sendSuccess(res, 200, 'Paramètres du site enregistrés avec succès', settings);
    } catch (error) {
      next(error);
    }
  },

  // PARTENAIRES CRUD
  async createPartner(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) data.logo = req.file.path.replace(/\\/g, '/');

      if (!data.name) {
        return sendError(res, 400, 'Le nom du partenaire est obligatoire.');
      }
      if (!data.logo) {
        data.logo = '/uploads/partners/default-partner.webp';
      }

      const partner = await Partner.create(data);
      return sendSuccess(res, 201, 'Partenaire ajouté', partner);
    } catch (error) {
      next(error);
    }
  },

  async updatePartner(req, res, next) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (req.file) data.logo = req.file.path.replace(/\\/g, '/');

      const partner = await Partner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!partner) return sendError(res, 404, 'Partenaire introuvable.');

      return sendSuccess(res, 200, 'Partenaire mis à jour', partner);
    } catch (error) {
      next(error);
    }
  },

  async deletePartner(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Partner.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Partenaire introuvable.');

      return sendSuccess(res, 200, 'Partenaire supprimé.');
    } catch (error) {
      next(error);
    }
  },

  // TÉMOIGNAGES CRUD
  async createTestimonial(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) data.avatar = req.file.path.replace(/\\/g, '/');

      data.authorName = data.authorName || data.name;
      data.roleOrCompany = data.roleOrCompany || data.role || 'Stagiaire B.C.A.';

      if (!data.authorName || !data.content) {
        return sendError(res, 400, 'Nom et texte du témoignage sont obligatoires.');
      }

      const testimonial = await Testimonial.create(data);
      return sendSuccess(res, 201, 'Témoignage ajouté', testimonial);
    } catch (error) {
      next(error);
    }
  },

  async updateTestimonial(req, res, next) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (req.file) data.avatar = req.file.path.replace(/\\/g, '/');

      if (data.name && !data.authorName) data.authorName = data.name;
      if (data.role && !data.roleOrCompany) data.roleOrCompany = data.role;

      const testimonial = await Testimonial.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!testimonial) return sendError(res, 404, 'Témoignage introuvable.');

      return sendSuccess(res, 200, 'Témoignage mis à jour', testimonial);
    } catch (error) {
      next(error);
    }
  },

  async deleteTestimonial(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Testimonial.findByIdAndDelete(id);
      if (!deleted) return sendError(res, 404, 'Témoignage introuvable.');

      return sendSuccess(res, 200, 'Témoignage supprimé.');
    } catch (error) {
      next(error);
    }
  },
};

export default settingsController;
