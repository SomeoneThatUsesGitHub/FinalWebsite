import React from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-blue-950 text-white overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Enhanced gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-blue-950/60 to-blue-900/80 z-10"></div>
        <img 
          src="https://www.touteleurope.eu/wp-content/uploads/2021/10/20191217_EP-097972A_GEN_103_RESIZED_M.jpg" 
          alt="European Parliament" 
          className="object-cover object-center w-full h-full"
        />
      </div>
      
      {/* Hero content */}
      <div className="container mx-auto px-4 md:px-6 py-28 md:py-44 relative z-20">
        <div className="max-w-3xl mx-auto md:mx-0">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full mb-6"
          >
            Média politique pour les 16-30 ans
          </motion.div>
          
          <motion.h1 
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            L'actualité politique, <br/>
            <span className="text-blue-200">simplifiée et accessible</span>
          </motion.h1>
          
          <motion.p 
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl opacity-90"
          >
            Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Conçu pour les citoyens de 16 à 30 ans.
          </motion.p>
          
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="flex flex-wrap gap-4"
          >
            <Button size="lg" className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white">
              Découvrir nos articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6 border-white text-white hover:bg-white/10">
              En savoir plus
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Subtle wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 z-10">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 24L60 24C120 24 240 24 360 32C480 40 600 56 720 56C840 56 960 40 1080 32C1200 24 1320 24 1380 24L1440 24V60H0V24Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
