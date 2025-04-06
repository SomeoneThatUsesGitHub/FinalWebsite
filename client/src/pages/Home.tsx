import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import HeroSection from "@/components/home/HeroSection";
import NewsWall from "@/components/home/NewsWall";

import { Helmet } from "react-helmet";
import { Link } from "wouter";

const Home: React.FC = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>Politique Jeune - L'actualité politique pour les 16-30 ans</title>
        <meta name="description" content="Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans." />
      </Helmet>
      
      <HeroSection />
      <NewsWall />
      
      {/* Quick Access Sections */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Explorer notre contenu</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Articles</h3>
              <p className="text-gray-600 mb-4">Découvrez nos analyses approfondies sur les sujets d'actualité</p>
              <Link href="#">
                <div className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer">
                  Voir les articles
                </div>
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Élections</h3>
              <p className="text-gray-600 mb-4">Suivez les élections en cours et les résultats des scrutins récents</p>
              <Link href="#">
                <div className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer">
                  Voir les élections
                </div>
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 19 7.5 19s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 19 16.5 19c-1.746 0-3.332-.477-4.5-1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Apprendre</h3>
              <p className="text-gray-600 mb-4">Explorez nos contenus éducatifs pour mieux comprendre la politique</p>
              <Link href="#">
                <div className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer">
                  Découvrir
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
