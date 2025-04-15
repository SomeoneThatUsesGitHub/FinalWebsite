import React, { useState } from 'react';
import { getOptimizedImageProps } from '@/lib/imageOptimizer';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  fallbackSrc?: string;
  aspectRatio?: string; // Format "16:9" ou "4:3" etc.
}

/**
 * Composant pour afficher une image optimisée avec lazy loading et gestion des erreurs
 * Utilise automatiquement WebP quand c'est possible
 */
export function OptimizedImage({ 
  src, 
  alt = '', 
  fallbackSrc,
  aspectRatio,
  className = '',
  ...props 
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Préparation des styles pour les conteneurs avec aspect ratio
  const containerStyle: React.CSSProperties = {};
  if (aspectRatio) {
    const [width, height] = aspectRatio.split(':').map(Number);
    if (width && height) {
      containerStyle.paddingBottom = `${(height / width) * 100}%`;
    }
  }

  // Gestion de l'erreur de chargement
  const handleError = () => {
    if (!error && fallbackSrc) {
      setError(true);
    }
  };

  // Optimisation de l'image
  const imageProps = getOptimizedImageProps(
    error && fallbackSrc ? fallbackSrc : src, 
    alt,
    `${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`
  );

  return (
    <div 
      className={`relative overflow-hidden bg-gray-100 ${aspectRatio ? 'w-full' : ''}`}
      style={aspectRatio ? containerStyle : undefined}
    >
      {/* Image de préchargement floue pour une meilleure UX */}
      <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      
      <img 
        {...imageProps} 
        {...props}
        onLoad={() => setLoaded(true)}
        onError={() => {
          handleError();
          // Appel du gestionnaire d'erreur d'origine s'il existe
          if (props.onError) {
            props.onError(new Event('error') as any);
          }
        }}
        className={imageProps.className}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: aspectRatio ? '100%' : 'auto',
          position: aspectRatio ? 'absolute' : 'relative',
          top: aspectRatio ? 0 : undefined,
          left: aspectRatio ? 0 : undefined,
          ...props.style
        }}
      />
    </div>
  );
}