import React from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
      <div className="container mx-auto px-4 py-12 lg:py-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="max-w-xl">
            <motion.h1 
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-3xl md:text-4xl font-bold leading-tight mb-4"
            >
              L'actualité politique, 
              <span className="text-white/90 block mt-1">simplifiée et accessible</span>
            </motion.h1>
            
            <motion.p 
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="text-lg mb-6 text-white/80 max-w-2xl"
            >
              Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="hidden md:flex"
            >
              <a 
                href="/articles" 
                className="inline-flex items-center px-5 py-3 rounded-full bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors"
              >
                Découvrir nos articles
                <ArrowRight size={16} className="ml-2" />
              </a>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:w-2/5 flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-full bg-white/10 flex items-center justify-center p-5">
              <div className="absolute inset-3 rounded-full border-4 border-white/20 border-dashed animate-spin-slow"></div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-8 w-4/5 h-4/5 flex items-center justify-center">
                <span className="text-3xl md:text-5xl font-bold">P</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="md:hidden bg-blue-700 py-4">
        <div className="container mx-auto px-4">
          <a 
            href="/articles" 
            className="flex items-center justify-center gap-2 text-white font-medium"
          >
            Découvrir nos articles
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
