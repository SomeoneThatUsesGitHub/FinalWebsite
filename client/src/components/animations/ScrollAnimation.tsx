import React, { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ScrollAnimationProps {
  children: React.ReactNode;
  threshold?: number;
  delay?: number;
  className?: string;
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  threshold = 0.3,
  delay = 0,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Sur mobile, réduire encore plus les effets pour de meilleures performances
  const mobileDelay = isMobile ? 0 : delay; // Pas de délai sur mobile
  const mobileThreshold = isMobile ? 0.05 : threshold; // Seuil plus bas = animation plus tôt

  useEffect(() => {
    // Désactive les animations pour les petits écrans si nécessaire
    if (isMobile) {
      // Option pour des performances optimales sur mobile: désactiver complètement l'animation
      // setIsVisible(true);
      // return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: mobileThreshold,
      }
    );

    const currentRef = ref.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [mobileThreshold, isMobile]);

  return (
    <div
      ref={ref}
      className={`transition-all ${isMobile ? 'duration-300' : 'duration-500'} ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      } ${className}`}
      style={{ transitionDelay: `${mobileDelay}s` }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;