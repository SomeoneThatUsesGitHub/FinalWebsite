import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  itemProp?: string; // Pour le support Schema.org
}

/**
 * Composant d'image optimisé avec support lazy loading avancé et formats WebP/AVIF
 */
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  onLoad,
  onError,
  itemProp,
  ...props
}: OptimizedImageProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fonction pour déterminer si l'URL est externe
  const isExternalUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Générer les chemins d'images optimisés (uniquement pour les images internes)
  const getOptimizedPaths = (originalSrc: string) => {
    if (isExternalUrl(originalSrc)) {
      return {
        original: originalSrc,
        webp: originalSrc,
        avif: originalSrc
      };
    }

    // Extraire le nom du fichier et le chemin
    const parts = originalSrc.split('/');
    const filename = parts[parts.length - 1];
    const filenameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;

    if (originalSrc.includes('/uploads/')) {
      return {
        original: originalSrc,
        webp: `/optimized/webp/${filenameWithoutExt}.webp`,
        avif: `/optimized/avif/${filenameWithoutExt}.avif`
      };
    }

    return {
      original: originalSrc,
      webp: originalSrc,
      avif: originalSrc
    };
  };

  const paths = src ? getOptimizedPaths(src) : { original: '', webp: '', avif: '' };

  // Gérer le chargement de l'image avec Intersection Observer
  useEffect(() => {
    // Si l'image est prioritaire, la charger immédiatement
    if (priority) {
      setIsLoaded(true);
      return;
    }

    if (!imgRef.current) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: '200px', // Précharger l'image quand elle est à 200px du viewport
      threshold: 0.01
    });

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  // Fonction qui gère les erreurs de chargement d'image
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`Erreur de chargement d'image: ${src}`);
    if (onError) onError(e);
  };

  // Fonction de gestion du chargement réussi
  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  return (
    <picture>
      {/* Format AVIF pour les navigateurs qui le supportent */}
      {isLoaded && <source type="image/avif" srcSet={paths.avif} />}
      
      {/* Format WebP pour les navigateurs qui le supportent */}
      {isLoaded && <source type="image/webp" srcSet={paths.webp} />}
      
      {/* Image de secours pour les autres navigateurs */}
      <img
        ref={imgRef}
        src={isLoaded ? paths.original : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} // Placeholder transparent
        alt={alt}
        className={`${className || ''} ${!isLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onError={handleError}
        onLoad={handleLoad}
        itemProp={itemProp}
        {...props}
      />
    </picture>
  );
}