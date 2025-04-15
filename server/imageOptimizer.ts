/**
 * Module d'optimisation d'images pour le serveur
 * Utilise sharp, imagemin, imagemin-webp et imagemin-avif pour optimiser les images
 */

import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminAvif from 'imagemin-avif';

// Dossier contenant les images originales et les images optimisées
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const OPTIMIZED_DIR = path.join(process.cwd(), 'public', 'optimized');

// S'assurer que les dossiers existent
async function ensureDirectories() {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });
    await fs.mkdir(path.join(OPTIMIZED_DIR, 'webp'), { recursive: true });
    await fs.mkdir(path.join(OPTIMIZED_DIR, 'avif'), { recursive: true });
  } catch (error) {
    console.error('Erreur lors de la création des dossiers d\'images:', error);
  }
}

// Fonction pour redimensionner une image en plusieurs tailles
async function resizeImage(inputPath: string, filename: string, formats: string[] = ['webp', 'avif']): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  
  try {
    // Widths for responsive images (common breakpoints)
    const widths = [320, 640, 1024, 1280, 1920];
    
    for (const format of formats) {
      result[format] = [];
      
      // Créer le dossier pour le format si nécessaire
      const formatDir = path.join(OPTIMIZED_DIR, format);
      await fs.mkdir(formatDir, { recursive: true });
      
      for (const width of widths) {
        const outputFilename = `${path.basename(filename, path.extname(filename))}-${width}.${format}`;
        const outputPath = path.join(formatDir, outputFilename);
        
        let transformer = sharp(inputPath).resize(width);
        
        // Appliquer le format spécifique
        if (format === 'webp') {
          transformer = transformer.webp({ quality: 80 });
        } else if (format === 'avif') {
          transformer = transformer.avif({ quality: 65 });
        }
        
        await transformer.toFile(outputPath);
        result[format].push(`/optimized/${format}/${outputFilename}`);
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Erreur lors du redimensionnement de l'image ${filename}:`, error);
    return result;
  }
}

// Convertir une image en WebP et AVIF
async function convertImage(inputPath: string, filename: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  
  try {
    // Conversion en WebP
    const webpFilename = `${path.basename(filename, path.extname(filename))}.webp`;
    const webpOutputPath = path.join(OPTIMIZED_DIR, 'webp', webpFilename);
    
    await imagemin([inputPath], {
      destination: path.join(OPTIMIZED_DIR, 'webp'),
      plugins: [
        imageminWebp({ quality: 80 })
      ]
    });
    
    result.webp = `/optimized/webp/${webpFilename}`;
    
    // Conversion en AVIF (peut être plus lent)
    const avifFilename = `${path.basename(filename, path.extname(filename))}.avif`;
    const avifOutputPath = path.join(OPTIMIZED_DIR, 'avif', avifFilename);
    
    await imagemin([inputPath], {
      destination: path.join(OPTIMIZED_DIR, 'avif'),
      plugins: [
        imageminAvif({ quality: 65 })
      ]
    });
    
    result.avif = `/optimized/avif/${avifFilename}`;
    
    return result;
  } catch (error) {
    console.error(`Erreur lors de la conversion de l'image ${filename}:`, error);
    return result;
  }
}

// Fonction pour optimiser toutes les images dans le dossier
export async function optimizeAllImages(): Promise<void> {
  try {
    await ensureDirectories();
    
    const files = await fs.readdir(IMAGES_DIR);
    const imageFiles = files.filter(file => /\.(jpe?g|png|gif)$/i.test(file));
    
    console.log(`Optimisation de ${imageFiles.length} images...`);
    
    for (const file of imageFiles) {
      const inputPath = path.join(IMAGES_DIR, file);
      await convertImage(inputPath, file);
      await resizeImage(inputPath, file);
    }
    
    console.log('Optimisation des images terminée.');
  } catch (error) {
    console.error('Erreur lors de l\'optimisation des images:', error);
  }
}

// Fonction pour optimiser une seule image et retourner les chemins d'accès
export async function optimizeImage(imagePath: string): Promise<{
  original: string;
  webp: string;
  avif: string;
  responsive: Record<string, string[]>;
}> {
  try {
    await ensureDirectories();
    
    const filename = path.basename(imagePath);
    const inputPath = path.isAbsolute(imagePath) 
      ? imagePath 
      : path.join(IMAGES_DIR, filename);
    
    // S'assurer que l'image existe
    await fs.access(inputPath);
    
    // Convertir
    const converted = await convertImage(inputPath, filename);
    
    // Redimensionner
    const responsive = await resizeImage(inputPath, filename);
    
    return {
      original: `/images/${filename}`,
      webp: converted.webp || '',
      avif: converted.avif || '',
      responsive
    };
  } catch (error) {
    console.error(`Erreur lors de l'optimisation de l'image ${imagePath}:`, error);
    return {
      original: imagePath.startsWith('/') ? imagePath : `/images/${path.basename(imagePath)}`,
      webp: '',
      avif: '',
      responsive: { webp: [], avif: [] }
    };
  }
}

// Initialisation des dossiers au démarrage
ensureDirectories().catch(console.error);