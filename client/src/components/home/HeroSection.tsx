import React from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 to-blue-600 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-blue-950 opacity-60"></div>
        <img 
          src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Political background" 
          className="object-cover w-full h-full opacity-40"
        />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-28 relative z-10">
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
