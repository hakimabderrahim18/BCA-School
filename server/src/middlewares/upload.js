import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { sendError } from '../utils/apiResponse.js';

// Stockage en mémoire RAM pour traitement direct par Sharp avant écriture sur le disque
const storage = multer.memoryStorage();

// Filtre des types MIME autorisés
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Formats acceptés : JPG, PNG, WebP, SVG.'), false);
  }
};

const maxFileSize = Number(process.env.MAX_FILE_SIZE_BYTES) || 10 * 1024 * 1024; // 10 Mo par défaut

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter,
});

/**
 * Middleware factory pour traiter et compresser une image unique avec Sharp
 * @param {string} destinationSubfolder - Sous-dossier dans uploads/ (ex: 'formations', 'articles')
 * @param {object} options - Options de redimensionnement et compression
 */
export const processSingleImage = (destinationSubfolder = 'general', options = {}) => {
  return async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    try {
      const uploadDir = path.join(process.cwd(), 'uploads', destinationSubfolder);
      
      // Assurer que le sous-dossier existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const isSvg = req.file.mimetype === 'image/svg+xml';

      if (isSvg) {
        // Sauvegarde brute pour les fichiers SVG
        const filename = `${destinationSubfolder}-${timestamp}-${randomString}.svg`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);

        req.file.filename = filename;
        req.file.path = `/uploads/${destinationSubfolder}/${filename}`;
        return next();
      }

      // Traitement et conversion WebP optimisée pour les images matricielles
      const filename = `${destinationSubfolder}-${timestamp}-${randomString}.webp`;
      const filePath = path.join(uploadDir, filename);

      const targetWidth = options.width || 1200;
      const targetQuality = options.quality || 82;

      await sharp(req.file.buffer)
        .resize({
          width: targetWidth,
          withoutEnlargement: true,
          fit: options.fit || 'inside',
        })
        .toFormat('webp', { quality: targetQuality })
        .toFile(filePath);

      // Met à jour l'objet file avec le chemin et le nom webp généré
      req.file.filename = filename;
      req.file.path = `/uploads/${destinationSubfolder}/${filename}`;
      req.file.mimetype = 'image/webp';

      next();
    } catch (error) {
      return sendError(res, 500, `Erreur lors de l'optimisation de l'image : ${error.message}`);
    }
  };
};

/**
 * Middleware factory pour traiter une liste d'images multiples (galeries, albums)
 */
export const processMultipleImages = (destinationSubfolder = 'gallery', options = {}) => {
  return async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    try {
      const uploadDir = path.join(process.cwd(), 'uploads', destinationSubfolder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const processedFiles = [];

      for (const file of req.files) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const filename = `${destinationSubfolder}-${timestamp}-${randomString}.webp`;
        const filePath = path.join(uploadDir, filename);

        await sharp(file.buffer)
          .resize({
            width: options.width || 1400,
            withoutEnlargement: true,
            fit: 'inside',
          })
          .toFormat('webp', { quality: options.quality || 80 })
          .toFile(filePath);

        processedFiles.push({
          originalname: file.originalname,
          filename,
          path: `/uploads/${destinationSubfolder}/${filename}`,
          mimetype: 'image/webp',
        });
      }

      req.processedFiles = processedFiles;
      next();
    } catch (error) {
      return sendError(res, 500, `Erreur lors de l'optimisation des images multiples : ${error.message}`);
    }
  };
};
