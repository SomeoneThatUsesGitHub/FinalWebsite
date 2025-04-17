import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

// Import direct de l'image
import parlamentMobile from "@assets/image_1744916173295.png";

// Animations plus légères pour de meilleures performances
const fadeInWithBounce = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.175, 0.885, 0.32, 1.25], // Effet de rebond plus subtil
      bounce: 0.3,
      type: "spring",
      stiffness: 90,
    },
  },
};

const slideUpWithBounce = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: [0.175, 0.885, 0.32, 1.25], // Effet de rebond plus subtil
      bounce: 0.3,
      type: "spring",
      stiffness: 80,
    },
  },
};

const HeroSection: React.FC = () => {
  // Utilisez un media query pour détecter les mobiles
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <section className="relative text-white h-screen mb-8 md:mb-4 fixed-height-on-mobile">
      {/* Image de fond avec effet parallaxe - pas d'overflow pour éviter les problèmes sur mobile */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Dégradé amélioré, plus dynamique - moins sombre sur mobile */}
        <div className={`absolute inset-0 bg-gradient-to-t ${isMobile ? 'from-black/70 via-black/50 to-black/10' : 'from-black via-black/80 to-black/10'} backdrop-blur-[0px] z-10`}></div>
        <div className={`absolute inset-0 bg-gradient-to-r ${isMobile ? 'from-black/30 via-transparent to-black/30' : 'from-black/40 via-transparent to-black/40'} z-10`}></div>
        {/* Image pour mobile - affichée en tant qu'élément img avec import direct */}
        <div className="absolute inset-0 w-full h-full block md:hidden z-0 bg-gray-800">
          <img 
            src={parlamentMobile} 
            alt="Parlement européen avec drapeau UE" 
            className="w-full h-full object-cover"
            style={{
              objectPosition: "center",
              height: "100vh", /* Force hauteur fixe */
            }}
          />
        </div>
        
        {/* Image pour desktop - cachée sur mobile */}
        <div
          className="absolute inset-0 w-full h-full hidden md:block"
          style={{
            backgroundImage: "url('https://www.lightzoomlumiere.fr/wp-content/uploads/2024/05/Hemicycle-du-Parlement-Europeen-Strasbourg-France-Eclairage-fluorescent-Photo-Mathieu-Cugnot-Copyright-European-Union-2018-Source-EP-2.jpg')",
            backgroundPosition: "center center",
            backgroundSize: "cover",
            backgroundAttachment: "scroll",
            filter: "contrast(1.05) brightness(0.95)",
            height: "100vh", /* Force hauteur fixe */
          }}
        ></div>
      </div>

      {/* Contenu centré verticalement */}
      <div className="container mx-auto px-4 flex items-center h-full relative z-10">
        <div
          className={`max-w-4xl ${isMobile ? "text-left mx-0" : "mx-auto text-center md:text-left md:mx-0"}`}
        >
          <motion.h1
            variants={fadeInWithBounce}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 md:mb-5 drop-shadow-md"
          >
            <span className="block text-white">Politiquensemble</span>
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
              La politique simplifiée
            </span>
          </motion.h1>

          <motion.p
            variants={slideUpWithBounce}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white/95 font-medium leading-tight sm:leading-normal md:leading-relaxed drop-shadow-md"
          >
            <span className="font-semibold">Comprendre les enjeux politiques d'aujourd'hui</span>
            <span className="block mt-0.5 sm:mt-1">
              pour construire le monde de demain.
            </span>
            <span className="block mt-1 sm:mt-2 text-blue-200">
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
