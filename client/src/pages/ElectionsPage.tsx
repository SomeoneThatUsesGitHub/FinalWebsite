import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import ElectionsPortal from "@/components/elections/ElectionsPortal";
import SubscriptionBanner from "@/components/shared/SubscriptionBanner";
import { Helmet } from "react-helmet";

const ElectionsPage: React.FC = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>Portail des Élections | Politique Jeune</title>
        <meta name="description" content="Suivez les résultats des élections en France et dans le monde. Analyses, données et visualisations pour comprendre les dynamiques électorales." />
      </Helmet>
      
      <div className="bg-background py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-dark mb-4">
              Portail des Élections
            </h1>
            <p className="text-dark/70">
              Explorez et analysez les résultats électoraux en France et dans le monde.
              Découvrez les tendances, comprenez les enjeux et suivez les prochaines échéances électorales.
            </p>
          </div>
        </div>
      </div>
      
      <ElectionsPortal />
      <SubscriptionBanner />
    </motion.div>
  );
};

export default ElectionsPage;
