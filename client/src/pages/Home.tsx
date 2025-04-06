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
        <title>Politiquensemble - L'actualité politique pour les 16-30 ans</title>
        <meta name="description" content="Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans." />
      </Helmet>
      
      <HeroSection />
      <NewsWall />
    </motion.div>
  );
};

export default Home;
