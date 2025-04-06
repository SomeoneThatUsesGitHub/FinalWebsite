import React from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-white text-dark overflow-hidden">
      {/* Top Banner Section */}
      <div className="bg-blue-600 text-white py-2 text-center text-sm">
        <div className="container mx-auto px-4">
          Découvrez notre actualité politique quotidienne | <span className="font-semibold">Suivez-nous sur les réseaux sociaux</span>
        </div>
      </div>
      
      {/* Main Hero Section */}
      <div className="container mx-auto py-10 md:py-16 px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="order-2 lg:order-1"
          >
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                Média politique indépendant
              </span>
              
              <motion.h1 
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="text-3xl md:text-5xl font-bold leading-tight mb-6 text-gray-800"
              >
                La politique <span className="text-blue-600">simplifiée</span> pour les jeunes de 16 à 30 ans
              </motion.h1>
              
              <motion.p 
                variants={slideUp}
                initial="hidden"
                animate="visible"
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Politiquensemble vous aide à comprendre les enjeux politiques d'aujourd'hui à travers des analyses accessibles, des explications claires et un contenu adapté aux nouveaux citoyens.
              </motion.p>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3 font-medium flex items-center">
                  Nos derniers articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full px-6 py-3 font-medium flex items-center">
                  <Play className="mr-2 h-4 w-4 fill-blue-600" />
                  Voir notre présentation
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Right Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1527525443983-6e60c75fff46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Jeunes citoyens engagés"
                  className="w-full h-auto max-w-lg object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
                <p className="text-3xl font-bold">20k+</p>
                <p className="text-sm font-medium">Lecteurs mensuels</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Trusted By Section */}
      <div className="bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 font-medium mb-8">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="https://via.placeholder.com/120x40" alt="Partenaire 1" className="h-8" />
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="https://via.placeholder.com/120x40" alt="Partenaire 2" className="h-8" />
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="https://via.placeholder.com/120x40" alt="Partenaire 3" className="h-8" />
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img src="https://via.placeholder.com/120x40" alt="Partenaire 4" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
