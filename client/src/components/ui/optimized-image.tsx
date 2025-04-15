import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  fetchSizes?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

type ImageFormats = {
  original: string;
  webp?: string;
  avif?: string;
  responsive: {
    webp: string[];
    avif: string[];
  };
};

/**
 * Composant OptimizedImage amélioré qui supporte:
 * - Formats modernes (WebP/AVIF) avec fallback automatique
 * - Lazy loading et tailles responsives
 * - Attributs pour SEO
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc,
  loading = 'lazy',
  fetchSizes = false,
  sizes = '100vw',
  width,
  height,
  ...props
}) => {
  const [imageSources, setImageSources] = useState<ImageFormats | null>(null);
  const [isFailed, setIsFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fonction pour vérifier si l'image est déjà optimisée
  const isOptimizedPath = (path: string) => 
    path.includes('/optimized/') || 
    path.includes('webp') || 
    path.includes('avif');
  
  // Récupérer les sources d'images optimisées si nécessaire
  useEffect(() => {
    if (!src || isOptimizedPath(src) || !fetchSizes) {
      setIsLoading(false);
      return;
    }
    
    const getOptimizedImage = async () => {
      try {
        setIsLoading(true);
        // Cette route REST n'existe pas encore, mais on simule pour le moment
        const imgPath = src.startsWith('/') ? src : `/images/${src}`;
        
        // Pour le moment, retourner un objet simulé avec l'image originale
        // Dans une vraie implémentation, on appellerait l'API côté serveur
        setImageSources({
          original: imgPath,
          webp: imgPath.replace(/\.(jpe?g|png|gif)$/i, '.webp'),
          avif: imgPath.replace(/\.(jpe?g|png|gif)$/i, '.avif'),
          responsive: {
            webp: [],
            avif: []
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement des images optimisées:', error);
        setIsFailed(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    getOptimizedImage();
  }, [src, fetchSizes]);
  
  // Gérer les erreurs et afficher l'image de fallback si nécessaire
  const handleImageError = () => {
    setIsFailed(true);
  };
  
  const getActualSrc = () => {
    if (isFailed && fallbackSrc) {
      return fallbackSrc;
    }
    
    if (imageSources && fetchSizes) {
      return imageSources.original;
    }
    
    return src;
  };
  
  const getSourceSet = () => {
    if (!imageSources || !fetchSizes || isFailed) {
      return undefined;
    }
    
    // Pour l'instant, puisque nous n'avons pas de tailles responsives, 
    // on retourne simplement la source WebP et l'original
    if (imageSources.webp) {
      return imageSources.webp;
    }
    
    return undefined;
  };
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Afficher un placeholder pendant le chargement */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      
      {fetchSizes && imageSources && !isFailed ? (
        <picture>
          {/* Source AVIF pour navigateurs modernes */}
          {imageSources.avif && (
            <source
              type="image/avif"
              srcSet={imageSources.avif}
            />
          )}
          
          {/* Source WebP pour compatibilité large */}
          {imageSources.webp && (
            <source
              type="image/webp"
              srcSet={imageSources.webp}
            />
          )}
          
          {/* Image de base pour fallback */}
          <img
            src={imageSources.original}
            alt={alt}
            loading={loading}
            width={width}
            height={height}
            onError={handleImageError}
            className={cn("w-full h-auto", isLoading && "opacity-0")}
            sizes={sizes}
            {...props}
          />
        </picture>
      ) : (
        <img
          src={getActualSrc()}
          alt={alt}
          loading={loading}
          onError={handleImageError}
          className={cn("w-full h-auto", isLoading && "opacity-0")}
          width={width}
          height={height}
          sizes={sizes}
          srcSet={getSourceSet()}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;