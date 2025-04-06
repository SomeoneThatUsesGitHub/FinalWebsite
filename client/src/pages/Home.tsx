import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import HeroSection from "@/components/home/HeroSection";
import NewsTicker from "@/components/home/NewsTicker";
import NewsWall from "@/components/home/NewsWall";
import ArticlesSection from "@/components/articles/ArticlesSection";
import ElectionsPortal from "@/components/elections/ElectionsPortal";
import LearnSection from "@/components/learn/LearnSection";
import SubscriptionBanner from "@/components/shared/SubscriptionBanner";
import AboutSection from "@/components/about/AboutSection";
import { Helmet } from "react-helmet";

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
      <NewsTicker />
      <NewsWall />
      <ArticlesSection />
      <ElectionsPortal />
      <LearnSection />
      <SubscriptionBanner />
      <AboutSection />
    </motion.div>
  );
};

export default Home;
