/**
 * Utilitaire pour l'optimisation des images
 * Permet de convertir les URLs d'images vers des formats modernes comme WebP
 */

const IMAGE_OPTIMIZATION_PARAMS = {
  width: '800',
  format: 'webp',
  quality: '80'
};

/**
 * Vérifie si une URL est celle d'une image
 * @param url L'URL à vérifier
 * @returns Vrai si l'URL semble être celle d'une image
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Vérifie l'extension du fichier
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  
  // Vérifie si c'est une URL d'image courante (Cloudinary, Imgur, etc.)
  const isCommonImageHost = 
    url.includes('cloudinary.com') || 
    url.includes('imgur.com') ||
    url.includes('unsplash.com') ||
    url.includes('images.pexels.com');
  
  return hasImageExtension || isCommonImageHost;
}

/**
 * Optimise une URL d'image en ajoutant des paramètres pour la conversion en WebP
 * et le redimensionnement si possible
 * @param url L'URL de l'image d'origine
 * @returns L'URL optimisée de l'image
 */
export function optimizeImageUrl(url: string): string {
  if (!url || !isImageUrl(url)) return url;

  // Si c'est déjà une URL optimisée, la retourner telle quelle
  if (url.includes('format=webp') || url.endsWith('.webp')) return url;

  // Gestion des URLs Cloudinary
  if (url.includes('cloudinary.com')) {
    // Recherche de la partie "upload/" dans l'URL de Cloudinary
    const uploadIndex = url.indexOf('upload/');
    if (uploadIndex !== -1) {
      // Insertion des paramètres de transformation après "upload/"
      const optimizedUrl = url.slice(0, uploadIndex + 7) + 
        `w_${IMAGE_OPTIMIZATION_PARAMS.width},f_${IMAGE_OPTIMIZATION_PARAMS.format},q_${IMAGE_OPTIMIZATION_PARAMS.quality}/` + 
        url.slice(uploadIndex + 7);
      return optimizedUrl;
    }
  }

  // Gestion des URLs Imgur
  if (url.includes('imgur.com')) {
    // Remplacement de l'extension par webp
    return url.replace(/\.(jpg|jpeg|png|gif)($|\?)/, '.webp$2');
  }

  // Ajout d'un paramètre pour les autres services qui supportent WebP via paramètres d'URL
  if (url.includes('?')) {
    return `${url}&format=webp&width=${IMAGE_OPTIMIZATION_PARAMS.width}`;
  } else {
    return `${url}?format=webp&width=${IMAGE_OPTIMIZATION_PARAMS.width}`;
  }
}

/**
 * Composant pour afficher une image optimisée avec lazy loading
 * Usage: <OptimizedImage src={url} alt="Description" className="custom-class" />
 */
export const getOptimizedImageProps = (src: string, alt: string = '', className: string = '') => {
  return {
    src: optimizeImageUrl(src),
    alt,
    className,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      // Fallback en cas d'erreur de chargement de l'image optimisée
      const img = e.currentTarget;
      if (img.src !== src) {
        img.src = src;
      }
    }
  };
};