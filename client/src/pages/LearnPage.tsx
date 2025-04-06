import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import LearnSection from "@/components/learn/LearnSection";
import SubscriptionBanner from "@/components/shared/SubscriptionBanner";
import { Helmet } from "react-helmet";

const LearnPage: React.FC = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>Apprendre | Politique Jeune</title>
        <meta name="description" content="Des contenus éducatifs organisés par thématique pour apprendre et comprendre la politique, l'économie et l'histoire de façon simple et accessible." />
      </Helmet>
      
      <div className="bg-background py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-dark mb-4">
              Apprendre
            </h1>
            <p className="text-dark/70">
              Des contenus éducatifs pour comprendre les enjeux politiques, économiques et historiques.
              Retrouvez toutes nos publications Instagram organisées par thématique.
            </p>
          </div>
        </div>
      </div>
      
      <LearnSection />
      <SubscriptionBanner />
    </motion.div>
  );
};

export default LearnPage;
