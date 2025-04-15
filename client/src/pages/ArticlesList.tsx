import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import ArticlesSection from "@/components/articles/ArticlesSection";
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
        <title>Articles et Analyses | Politiquensemble</title>
        <meta name="description" content="Découvrez tous nos articles sur l'actualité politique, économique et historique pour les jeunes de 16 à 30 ans." />
        
        {/* Balises Open Graph */}
        <meta property="og:title" content="Articles et Analyses | Politiquensemble" />
        <meta property="og:description" content="Découvrez tous nos articles sur l'actualité politique, économique et historique pour les jeunes de 16 à 30 ans." />
        <meta property="og:url" content="https://politiquensemble.be/articles" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://politiquensemble.be/logo-share.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Articles et Analyses | Politiquensemble" />
        <meta name="twitter:description" content="Découvrez tous nos articles sur l'actualité politique, économique et historique pour les jeunes de 16 à 30 ans." />
        <meta name="twitter:image" content="https://politiquensemble.be/logo-share.png" />
        
        {/* Balises Google News pour la section articles */}
        <meta name="news_keywords" content="politique, articles, analyses, actualité, jeunes, Europe, France" />
        
        {/* Schema.org pour la liste d'articles */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "headline": "Articles et Analyses | Politiquensemble",
            "description": "Découvrez tous nos articles sur l'actualité politique, économique et historique pour les jeunes de 16 à 30 ans.",
            "url": "https://politiquensemble.be/articles",
            "publisher": {
              "@type": "Organization",
              "name": "Politiquensemble",
              "logo": {
                "@type": "ImageObject",
                "url": "https://politiquensemble.be/logo.png"
              }
            }
          })}
        </script>
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://politiquensemble.be/articles" />
      </Helmet>
      
      <header className="bg-blue-50 py-12 md:py-20 shadow-md mb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              variants={fadeInWithBounce}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 relative"
            >
              Articles et Analyses
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 0.3, duration: 0.5 } 
              }}
              className="h-1 w-20 bg-blue-500 mx-auto rounded-full"
              aria-hidden="true"
            ></motion.div>
          </div>
        </div>
      </header>
      
      <main>
        <ArticlesSection />
      </main>
    </motion.div>
  );
};

export default ArticlesList;
