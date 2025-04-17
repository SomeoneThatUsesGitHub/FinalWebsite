import { Variants } from "framer-motion";

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

// Slide up animation
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Staggered animation for children
export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Child animation for stagger
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Scale animation for cards
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  }
};

// Animation pour transitions de page optimisée pour mobile
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.05 // Réduit le délai entre les animations des enfants
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Animation for navigation menu items
export const navItem: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Election bar chart animation
export const barChart: Variants = {
  hidden: { height: 0 },
  visible: (custom: number) => ({ 
    height: `${custom}%`,
    transition: { duration: 1, ease: "easeOut" }
  })
};

// Animation for mobile menu
export const mobileMenu: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2
    }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Pulse animation
export const pulse: Variants = {
  hidden: { scale: 1 },
  visible: { 
    scale: [1, 1.05, 1],
    transition: { 
      duration: 1.5,
      repeat: Infinity,
      repeatType: "loop"
    }
  }
};

// News ticker animation avec vitesse réduite pour de meilleures performances
export const ticker: Variants = {
  hidden: { x: "100%" },
  visible: { 
    x: "-100%",
    transition: { 
      duration: 30, // Ralenti pour moins solliciter le CPU
      repeat: Infinity,
      ease: "linear",
      repeatType: "loop"
    }
  }
};

// Fade in with delay animation - useful for staggered elements
export const fadeInWithDelay: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number = 0) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      delay: custom 
    }
  })
};
