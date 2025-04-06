import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import ArticlesSection from "@/components/articles/ArticlesSection";
import SubscriptionBanner from "@/components/shared/SubscriptionBanner";
import { Helmet } from "react-helmet";

// Animation avec effet de rebond
const fadeInWithBounce = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.175, 0.885, 0.32, 1.5], // Effet de rebond accentué
      bounce: 0.4,
      type: "spring",
      stiffness: 120
    }
  }
};

const ArticlesList: React.FC = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>Articles | Politique Jeune</title>
        <meta name="description" content="Découvrez tous nos articles sur l'actualité politique, économique et historique pour les jeunes de 16 à 30 ans." />
      </Helmet>
      
      <div className="bg-background py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-8 text-center">
            <motion.h1 
              variants={fadeInWithBounce}
              initial="hidden"
              animate="visible"
              className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-dark mb-2"
            >
              Articles et Analyses
            </motion.h1>
          </div>
        </div>
      </div>
      
      <ArticlesSection />
      <SubscriptionBanner />
    </motion.div>
  );
};

export default ArticlesList;
