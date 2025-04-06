import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { ArrowRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

const HeroSection: React.FC = () => {
  // Utilisez un media query pour détecter les mobiles
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <section className="relative text-white overflow-hidden h-[70vh] md:h-auto">
      {/* Image de fond avec effet parallaxe */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 backdrop-blur-[1px] z-10"></div>
        <div
          className={`absolute inset-0 ${isMobile ? '' : 'bg-fixed'}`}
          style={{
            backgroundImage:
              "url('https://www.lightzoomlumiere.fr/wp-content/uploads/2024/05/Hemicycle-du-Parlement-Europeen-Strasbourg-France-Eclairage-fluorescent-Photo-Mathieu-Cugnot-Copyright-European-Union-2018-Source-EP-2.jpg')",
            backgroundPosition: isMobile ? "center top" : "center center",
            backgroundSize: "cover",
            backgroundAttachment: isMobile ? "scroll" : "fixed", 
          }}
        ></div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-40 md:py-40 lg:py-56 relative z-10">
        <div className={`max-w-4xl ${isMobile ? 'text-left mx-0 pt-16' : 'mx-auto text-center md:text-left md:mx-0'}`}>
          <motion.h1
            variants={fadeIn}
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
            variants={slideUp}
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
