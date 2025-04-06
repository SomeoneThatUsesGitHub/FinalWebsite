import React from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white overflow-hidden">
      {/* Image de fond avec effet parallaxe */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/70 z-10"></div>
        <div 
          className="absolute inset-0 bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1608322368235-b1ff33955952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        ></div>
      </div>
      
      {/* Contenu */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center md:text-left md:mx-0">
          <motion.h1 
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-3xl md:text-5xl font-bold leading-tight mb-4"
          >
            L'actualité politique,
            <span className="block mt-2">simplifiée et accessible</span>
          </motion.h1>
          
          <motion.p 
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto md:mx-0"
          >
            Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center md:justify-start"
          >
            <a 
              href="/articles" 
              className="inline-flex items-center px-6 py-3 rounded-full bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors shadow-lg"
            >
              Découvrir nos articles
              <ArrowRight size={18} className="ml-2" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
