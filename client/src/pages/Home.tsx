import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import HeroSection from "@/components/home/HeroSection";
import NewsWall from "@/components/home/NewsWall";
import VideosSection from "@/components/home/VideosSection";

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
        
        {/* Balises Open Graph */}
        <meta property="og:title" content="Politiquensemble - L'actualité politique pour les 16-30 ans" />
        <meta property="og:description" content="Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans." />
        <meta property="og:url" content="https://politiquensemble.fr" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://politiquensemble.fr/logo-share.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Politiquensemble - L'actualité politique pour les 16-30 ans" />
        <meta name="twitter:description" content="Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans." />
        <meta name="twitter:image" content="https://politiquensemble.fr/logo-share.png" />
        
        {/* Balises Google News pour la page d'accueil */}
        <meta name="news_keywords" content="politique, actualité, jeunesse, démocratie, élections, Europe, France, éducation" />
        
        {/* Schema.org pour la page d'accueil */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Politiquensemble",
            "url": "https://politiquensemble.fr",
            "description": "Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Pour tous les citoyens de 16 à 30 ans.",
            "publisher": {
              "@type": "Organization",
              "name": "Politiquensemble",
              "logo": {
                "@type": "ImageObject",
                "url": "https://politiquensemble.fr/logo.png"
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://politiquensemble.fr/articles?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        
        {/* Schema.org pour l'organisation */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsMediaOrganization",
            "name": "Politiquensemble",
            "url": "https://politiquensemble.fr",
            "logo": "https://politiquensemble.fr/logo.png",
            "sameAs": [
              "https://www.instagram.com/politiquensemble",
              "https://twitter.com/politiquensemble",
              "https://www.tiktok.com/@politiquensemble"
            ],
            "diversityPolicy": "https://politiquensemble.fr/a-propos",
            "ethicsPolicy": "https://politiquensemble.fr/mentions-legales",
            "masthead": "https://politiquensemble.fr/team",
            "foundingDate": "2023-01-01",
            "foundingLocation": {
              "@type": "Place",
              "name": "France"
            }
          })}
        </script>
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://politiquensemble.fr" />
      </Helmet>
      
      <HeroSection />
      <NewsWall />
      <VideosSection />
    </motion.div>
  );
};

export default Home;
