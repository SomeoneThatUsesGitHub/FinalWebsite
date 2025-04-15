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
        // Utiliser notre nouvelle API d'optimisation d'images
        const imgPath = src.startsWith('/') ? src : `/images/${src}`;
        
        // Appeler l'API d'optimisation
        const response = await fetch(`/api/images/optimize?path=${encodeURIComponent(imgPath)}`);
        
        if (!response.ok) {
          throw new Error(`Erreur d'optimisation: ${response.status} ${response.statusText}`);
        }
        
        const optimizedData = await response.json();
        
        // Mettre à jour les sources d'images avec les données optimisées
        setImageSources({
          original: optimizedData.original || imgPath,
          webp: optimizedData.webp || '',
          avif: optimizedData.avif || '',
          responsive: optimizedData.responsive || {
            webp: [],
            avif: []
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement des images optimisées:', error);
        // Fallback à l'image originale en cas d'erreur
        const imgPath = src.startsWith('/') ? src : `/images/${src}`;
        setImageSources({
          original: imgPath,
          responsive: {
            webp: [],
            avif: []
          }
        });
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
    
    // Gérer les images responsives pour différentes résolutions
    if (imageSources.responsive && imageSources.responsive.webp && imageSources.responsive.webp.length > 0) {
      // Créer un srcSet à partir des images responsives
      // Format: "url width, url2 width2, ..."
      return imageSources.responsive.webp
        .map((url, index) => {
          // Les largeurs courantes en pixels: 320, 640, 1024, 1280, 1920
          const widths = [320, 640, 1024, 1280, 1920];
          const width = index < widths.length ? widths[index] : widths[0];
          return `${url} ${width}w`;
        })
        .join(', ');
    }
    
    // Fallback à la version WebP standard si pas de responsive
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
          {imageSources.responsive && imageSources.responsive.avif && imageSources.responsive.avif.length > 0 ? (
            <source
              type="image/avif"
              sizes={sizes}
              srcSet={imageSources.responsive.avif
                .map((url, index) => {
                  const widths = [320, 640, 1024, 1280, 1920];
                  const width = index < widths.length ? widths[index] : widths[0];
                  return `${url} ${width}w`;
                })
                .join(', ')}
            />
          ) : imageSources.avif && (
            <source
              type="image/avif"
              srcSet={imageSources.avif}
            />
          )}
          
          {/* Source WebP pour compatibilité large */}
          {imageSources.responsive && imageSources.responsive.webp && imageSources.responsive.webp.length > 0 ? (
            <source
              type="image/webp"
              sizes={sizes}
              srcSet={imageSources.responsive.webp
                .map((url, index) => {
                  const widths = [320, 640, 1024, 1280, 1920];
                  const width = index < widths.length ? widths[index] : widths[0];
                  return `${url} ${width}w`;
                })
                .join(', ')}
            />
          ) : imageSources.webp && (
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