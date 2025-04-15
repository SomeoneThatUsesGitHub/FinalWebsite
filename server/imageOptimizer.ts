/**
 * Service d'optimisation d'images pour la conversion en WebP et AVIF
 */
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminAvif from 'imagemin-avif';

// Chemin des dossiers d'images
const ORIGINAL_IMAGES_DIR = path.join(process.cwd(), 'public', 'uploads');
const OPTIMIZED_IMAGES_DIR = path.join(process.cwd(), 'public', 'optimized');

// Assurez-vous que les dossiers existent
const ensureDirectoriesExist = () => {
  if (!fs.existsSync(OPTIMIZED_IMAGES_DIR)) {
    fs.mkdirSync(OPTIMIZED_IMAGES_DIR, { recursive: true });
  }
  
  const formats = ['webp', 'avif'];
  formats.forEach(format => {
    const formatDir = path.join(OPTIMIZED_IMAGES_DIR, format);
    if (!fs.existsSync(formatDir)) {
      fs.mkdirSync(formatDir, { recursive: true });
    }
  });
};

// Optimiser une image spécifique
export const optimizeImage = async (imagePath: string): Promise<{ webp: string, avif: string }> => {
  ensureDirectoriesExist();
  
  const filename = path.basename(imagePath);
  const filenameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
  
  // Chemins des fichiers optimisés
  const webpPath = path.join(OPTIMIZED_IMAGES_DIR, 'webp', `${filenameWithoutExt}.webp`);
  const avifPath = path.join(OPTIMIZED_IMAGES_DIR, 'avif', `${filenameWithoutExt}.avif`);
  
  try {
    // Conversion en WebP
    await sharp(imagePath)
      .webp({ quality: 80 })
      .toFile(webpPath);
    
    // Conversion en AVIF
    await sharp(imagePath)
      .avif({ quality: 65 })
      .toFile(avifPath);
    
    return {
      webp: `/optimized/webp/${filenameWithoutExt}.webp`,
      avif: `/optimized/avif/${filenameWithoutExt}.avif`,
    };
  } catch (error) {
    console.error(`Erreur lors de l'optimisation de l'image ${filename}:`, error);
    throw error;
  }
};

// Optimiser toutes les images dans le dossier uploads
export const optimizeAllImages = async (): Promise<void> => {
  ensureDirectoriesExist();
  
  try {
    // Lister tous les fichiers d'images dans le dossier original
    const files = fs.readdirSync(ORIGINAL_IMAGES_DIR).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
    
    // Optimiser chaque image
    for (const file of files) {
      const imagePath = path.join(ORIGINAL_IMAGES_DIR, file);
      await optimizeImage(imagePath);
    }
    
    console.log(`Optimisation terminée pour ${files.length} images.`);
  } catch (error) {
    console.error('Erreur lors de l\'optimisation des images:', error);
    throw error;
  }
};

// Obtenir les chemins d'une image optimisée à partir du nom de fichier original
export const getOptimizedImagePaths = (originalFilename: string): { original: string, webp: string, avif: string } => {
  const filenameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
  
  return {
    original: `/uploads/${originalFilename}`,
    webp: `/optimized/webp/${filenameWithoutExt}.webp`,
    avif: `/optimized/avif/${filenameWithoutExt}.avif`,
  };
};

// Optimiser une image lors du téléchargement
export const optimizeUploadedImage = async (imagePath: string, filename: string): Promise<{ original: string, webp: string, avif: string }> => {
  try {
    const result = await optimizeImage(imagePath);
    
    return {
      original: `/uploads/${filename}`,
      ...result
    };
  } catch (error) {
    console.error(`Erreur lors de l'optimisation de l'image téléchargée ${filename}:`, error);
    return {
      original: `/uploads/${filename}`,
      webp: `/uploads/${filename}`,
      avif: `/uploads/${filename}`
    };
  }
};