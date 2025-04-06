import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import ArticlesSection from "@/components/articles/ArticlesSection";
import SubscriptionBanner from "@/components/shared/SubscriptionBanner";
import { Helmet } from "react-helmet";

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
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-dark mb-4">
              Articles et Analyses
            </h1>
            <p className="text-dark/70">
              Explorez notre collection d'articles pour comprendre les enjeux politiques, économiques et historiques actuels.
              Des analyses détaillées et accessibles pour tous.
            </p>
          </div>
        </div>
      </div>
      
      <ArticlesSection />
      <SubscriptionBanner />
    </motion.div>
  );
};

export default ArticlesList;
