import React from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 to-blue-600 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-blue-950/50 to-black/80 z-10"></div>
        <img 
          src="https://www.europarl.europa.eu/resources/library/images/20180409PHT01211/20180409PHT01211_original.jpg" 
          alt="European Parliament" 
          className="object-cover object-center w-full h-full"
        />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-36 relative z-10">
        <div className="max-w-3xl mx-auto md:mx-0">

          
          <motion.h1 
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-3xl md:text-5xl font-bold leading-tight mb-4"
          >
            L'actualité politique, <br/>
            <span className="text-blue-200">simplifiée et accessible</span>
          </motion.h1>
          
          <motion.p 
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl"
          >
            Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans.
          </motion.p>
          

        </div>
      </div>
      

    </section>
  );
};

export default HeroSection;
