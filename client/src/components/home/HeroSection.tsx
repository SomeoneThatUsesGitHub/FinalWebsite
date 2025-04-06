import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { Newspaper, GraduationCap, TrendingUp } from "lucide-react";

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
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6"
          >
            Politique Jeune - Médias d'information
          </motion.div>
          
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
          
          <motion.div 
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
          >
            <Link href="#">
              <div className="btn px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center cursor-pointer">
                <Newspaper className="mr-2 h-5 w-5" /> Découvrir nos articles
              </div>
            </Link>
            <Link href="#">
              <div className="btn px-6 py-3 bg-white hover:bg-gray-100 text-blue-800 rounded-lg font-medium transition-colors inline-flex items-center justify-center cursor-pointer">
                <TrendingUp className="mr-2 h-5 w-5" /> Suivi des élections
              </div>
            </Link>
            <Link href="#">
              <div className="btn px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center cursor-pointer">
                <GraduationCap className="mr-2 h-5 w-5" /> Apprendre
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Stats bar */}
      <div className="bg-white/10 backdrop-blur-md py-4 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-blue-100">Articles publiés</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">100k+</p>
              <p className="text-sm text-blue-100">Lecteurs mensuels</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">15+</p>
              <p className="text-sm text-blue-100">Pays couverts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">30+</p>
              <p className="text-sm text-blue-100">Experts contributeurs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
