import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { Newspaper, GraduationCap } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-dark to-primary text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-dark opacity-50"></div>
        <img 
          src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Political background" 
          className="object-cover w-full h-full opacity-40"
        />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 relative z-10">
        <div className="max-w-3xl">
          <motion.h1 
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-3xl md:text-5xl font-bold font-heading leading-tight mb-4"
          >
            L'actualité politique, <br/>
            <span className="text-accent font-accent italic">simplifiée et accessible</span>
          </motion.h1>
          
          <motion.p 
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl mb-8 text-light/90 max-w-2xl"
          >
            Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans.
          </motion.p>
          
          <motion.div 
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
          >
            <Link href="/">
              <a className="btn px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center">
                <Newspaper className="mr-2 h-5 w-5" /> Dernières actualités
              </a>
            </Link>
            <Link href="/apprendre">
              <a className="btn px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center">
                <GraduationCap className="mr-2 h-5 w-5" /> Commencer à apprendre
              </a>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
