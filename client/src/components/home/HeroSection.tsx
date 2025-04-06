import React from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10"></div>
        <div 
          className="absolute inset-0 bg-fixed"
          style={{
            backgroundImage: "url('https://www.radiofrance.fr/s3/cruiser-production/2022/02/af860b5c-da54-49b0-ba42-6f7106eb17b1/1200x680_0parlement-europeen00-98t4np.jpg')",
            backgroundPosition: "center",
            backgroundSize: "cover", 
            filter: "blur(2px)"
          }}
        ></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-28 md:py-48 relative z-10">
        <div className="max-w-3xl mx-auto md:mx-0">

          
          <motion.h1 
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-3xl md:text-5xl font-bold leading-tight mb-4"
          >
            L'actualité politique, <br/>
            <span className="text-blue-400">simplifiée et accessible</span>
          </motion.h1>
          
          <motion.p 
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl"
          >
            Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans.
          </motion.p>
          

        </div>
      </div>
      

    </section>
  );
};

export default HeroSection;
