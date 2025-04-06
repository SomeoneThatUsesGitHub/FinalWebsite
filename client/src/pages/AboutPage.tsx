import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import AboutSection from "@/components/about/AboutSection";
import SubscriptionBanner from "@/components/shared/SubscriptionBanner";
import { Helmet } from "react-helmet";

const AboutPage: React.FC = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>À propos | Politique Jeune</title>
        <meta name="description" content="Découvrez la mission et l'équipe de Politique Jeune, le média qui simplifie l'actualité politique pour les 16-30 ans." />
      </Helmet>
      
      <div className="bg-background py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-dark mb-4">
              À propos de nous
            </h1>
            <p className="text-dark/70">
              Découvrez qui nous sommes, notre mission et nos valeurs.
              Politique Jeune, c'est une équipe passionnée qui s'engage à rendre la politique accessible à tous.
            </p>
          </div>
        </div>
      </div>
      
      <AboutSection />
      
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark mb-6 text-center">Notre mission</h2>
            
            <div className="bg-white p-8 rounded-xl shadow-md mb-10">
              <h3 className="text-xl font-bold mb-4">Simplifier et rendre accessible</h3>
              <p className="text-dark/80 mb-6">
                Notre première mission est de rendre l'information politique accessible à tous, en particulier aux jeunes
                qui se sentent parfois exclus ou dépassés par la complexité des enjeux. Nous décryptons et expliquons
                l'actualité politique nationale et internationale avec un langage clair et des formats adaptés.
              </p>
              
              <h3 className="text-xl font-bold mb-4">Éduquer sans orienter</h3>
              <p className="text-dark/80 mb-6">
                Nous croyons en l'importance d'une information neutre et équilibrée. Notre objectif n'est pas de dire
                aux jeunes ce qu'ils doivent penser, mais de leur donner les outils pour forger leur propre opinion
                politique en connaissance de cause.
              </p>
              
              <h3 className="text-xl font-bold mb-4">Encourager l'engagement citoyen</h3>
              <p className="text-dark/80">
                Nous sommes convaincus que la démocratie se porte mieux quand les citoyens sont informés et engagés.
                En rendant la politique plus accessible et intéressante pour les jeunes, nous espérons contribuer à
                augmenter leur participation civique et électorale.
              </p>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark mb-6 text-center">Nos valeurs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-3 text-primary">Accessibilité</h3>
                <p className="text-dark/80">
                  L'information politique doit être claire, concise et compréhensible par tous, quel que soit leur
                  niveau de connaissance préalable.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-3 text-secondary">Indépendance</h3>
                <p className="text-dark/80">
                  Nous sommes indépendants de tout parti politique ou groupe d'intérêt, ce qui nous permet de
                  présenter une information équilibrée et objective.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-3 text-accent">Innovation</h3>
                <p className="text-dark/80">
                  Nous explorons constamment de nouveaux formats et approches pour rendre l'information politique
                  attrayante et adaptée aux habitudes de consommation des jeunes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <SubscriptionBanner />
    </motion.div>
  );
};

export default AboutPage;
