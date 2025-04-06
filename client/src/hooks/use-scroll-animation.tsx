import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';

// Variante d'animation pour l'effet popup
export const popupVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number; // Seuil de visibilité (0-1)
  delay?: number; // Délai avant animation (en secondes)
  variants?: Variants; // Variantes d'animation personnalisées
}

// Composant d'animation au défilement
export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({ 
  children, 
  className = "", 
  threshold = 0.1,
  delay = 0,
  variants = popupVariants
}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Quand l'élément entre dans la viewport
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          controls.start("visible");
        }
      },
      { threshold }
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
  }, [controls, isVisible, threshold]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hook personnalisé pour réutiliser la logique d'animation
export const useScrollAnimation = (threshold = 0.1) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          controls.start("visible");
        }
      },
      { threshold }
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
  }, [controls, isVisible, threshold]);

  return { ref, controls, isVisible };
};

export default useScrollAnimation;