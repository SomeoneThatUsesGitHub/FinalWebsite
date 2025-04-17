import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

// Animations améliorées avec effet de rebond plus accentué
const fadeInWithBounce = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.175, 0.885, 0.32, 1.5], // Effet de rebond plus accentué
      bounce: 0.4,
      type: "spring",
      stiffness: 120
    }
  }
};

const slideUpWithBounce = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.3,
      ease: [0.175, 0.885, 0.32, 1.5], // Effet de rebond plus accentué
      bounce: 0.5,
      type: "spring",
      stiffness: 100
    }
  }
};

const HeroSection: React.FC = () => {
  // Utilisez un media query pour détecter les mobiles
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <section className="relative text-white overflow-hidden h-[70vh] md:h-screen mb-8 md:mb-4">
      {/* Image de fond avec effet parallaxe */}
      <div className="absolute inset-0 z-0">
        {/* Dégradé amélioré, plus dynamique */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/10 backdrop-blur-[0px] z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-10"></div>
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage:
              "url('https://www.lightzoomlumiere.fr/wp-content/uploads/2024/05/Hemicycle-du-Parlement-Europeen-Strasbourg-France-Eclairage-fluorescent-Photo-Mathieu-Cugnot-Copyright-European-Union-2018-Source-EP-2.jpg')",
            backgroundPosition: isMobile ? "center top" : "center center",
            backgroundSize: "cover",
            backgroundAttachment: "scroll",
            filter: "contrast(1.05) brightness(0.95)",
          }}
        ></div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-40 md:py-[calc(50vh-10rem)] lg:py-[calc(50vh-8rem)] relative z-10">
        <div className={`max-w-4xl ${isMobile ? 'text-left mx-0 pt-16' : 'mx-auto text-center md:text-left md:mx-0'}`}>
          <motion.h1
            variants={fadeInWithBounce}
            initial="hidden"
            animate="visible"
            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 md:mb-5"
          >
            <span className="block text-white/90">L'actualité politique</span>
            <span className="block mt-1 sm:mt-2 text-white">
              simplifiée et accessible
            </span>
          </motion.h1>

          <motion.p
            variants={slideUpWithBounce}
            initial="hidden"
            animate="visible"
            className="text-sm sm:text-base md:text-lg mb-6 md:mb-8 text-white/90 max-w-xl"
          >
            Comprendre les enjeux politiques d'aujourd'hui pour construire le
            monde de demain.
            <span className="block mt-1">
              Pour tous les citoyens de 16 à 30 ans.
            </span>
          </motion.p>

          {/* Le bouton "Découvrir nos articles" a été supprimé à la demande du client */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
