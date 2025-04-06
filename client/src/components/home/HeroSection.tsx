import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { ArrowRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

const HeroSection: React.FC = () => {
  // Utilisez un media query pour détecter les mobiles
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <section className="relative text-white overflow-hidden h-[85vh] md:h-auto">
      {/* Image de fond avec effet parallaxe */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 backdrop-blur-[1px] z-10"></div>
        <div
          className={`absolute inset-0 ${isMobile ? '' : 'bg-fixed'}`}
          style={{
            backgroundImage:
              "url('https://www.touteleurope.eu/wp-content/uploads/2021/10/20191217_EP-097972A_GEN_103_RESIZED_M.jpg')",
            backgroundPosition: "center center",
            backgroundSize: "cover",
            backgroundAttachment: isMobile ? "scroll" : "fixed", 
          }}
        ></div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-32 md:py-48 lg:py-64 relative z-10">
        <div className="max-w-4xl mx-auto text-center md:text-left md:mx-0">
          <motion.h1
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 md:mb-6"
          >
            <span className="block text-white/90">L'actualité politique</span>
            <span className="block mt-1 sm:mt-3 text-white">
              simplifiée et accessible
            </span>
          </motion.h1>

          <motion.p
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg md:text-xl mb-8 md:mb-10 text-white/90 max-w-2xl mx-auto md:mx-0"
          >
            Comprendre les enjeux politiques d'aujourd'hui pour construire le
            monde de demain.
            <span className="block mt-1 sm:mt-2">
              Pour tous les citoyens de 16 à 30 ans.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center md:justify-start"
          >
            <a
              href="/articles"
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors shadow-lg"
            >
              Découvrir nos articles
              <ArrowRight size={16} className="ml-1.5 sm:ml-2 sm:size-[18px]" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
