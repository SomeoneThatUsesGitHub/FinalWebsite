import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ScrollAnimation from "@/components/animations/ScrollAnimation";
import ValueCard from "@/components/about/ValueCard";
import { MapPin, Calendar, Award, Users, Bookmark, TrendingUp } from "lucide-react";

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: "objective",
      title: "Objectivité",
      description: "Nous nous engageons à fournir une information factuelle, vérifiée et impartiale pour vous permettre de former votre propre opinion.",
    },
    {
      icon: "pedagogy",
      title: "Pédagogie",
      description: "Nous rendons l'actualité politique accessible à tous, quelle que soit votre niveau de connaissance préalable.",
    },
    {
      icon: "transparency",
      title: "Transparence",
      description: "Nos sources sont toujours citées et vérifiables, et nous reconnaissons ouvertement nos erreurs lorsqu'elles surviennent.",
    },
    {
      icon: "independence",
      title: "Indépendance",
      description: "Nous ne sommes affiliés à aucun parti politique ou groupe d'intérêt, garantissant une couverture équilibrée de l'actualité.",
    },
    {
      icon: "innovation",
      title: "Innovation",
      description: "Nous explorons constamment de nouvelles façons de présenter l'information politique pour la rendre plus engageante et pertinente.",
    },
    {
      icon: "community",
      title: "Communauté",
      description: "Nous créons un espace d'échange respectueux où chacun peut participer au débat politique constructif.",
    },
  ];

  const keyMilestones = [
    {
      icon: <Calendar className="h-10 w-10 text-blue-600" />,
      year: "2022",
      title: "Naissance du concept",
      description: "Politiquensemble est né de la volonté de rendre l'actualité politique accessible aux 16-30 ans, souvent éloignés des médias traditionnels."
    },
    {
      icon: <Users className="h-10 w-10 text-blue-600" />,
      year: "2023",
      title: "Lancement sur les réseaux sociaux",
      description: "Nous avons commencé à publier du contenu sur les principales plateformes sociales, touchant rapidement plusieurs milliers d'abonnés."
    },
    {
      icon: <MapPin className="h-10 w-10 text-blue-600" />,
      year: "2024",
      title: "Développement de notre plateforme",
      description: "Le lancement de notre site web marque une nouvelle étape, offrant un espace dédié à notre contenu et à nos formats innovants."
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-blue-600" />,
      year: "2025",
      title: "Expansion de nos formats",
      description: "Développement de nouvelles façons d'informer: directs pour les grands événements, données électorales interactives, et contenus éducatifs."
    }
  ];

  return (
    <>
      <Helmet>
        <title>À propos de Politiquensemble - Notre mission et notre équipe</title>
        <meta name="description" content="Découvrez la mission de Politiquensemble, média indépendant qui rend l'actualité politique, économique et historique accessible aux 16-30 ans." />
      </Helmet>

      {/* Hero Section avec effet carnet quadrillé qui s'estompe */}
      <section className="pattern-grid-fade pt-16 pb-12 md:pt-24 md:pb-16 min-h-[50vh] flex items-center">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollAnimation threshold={0.1}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-6">
                Notre mission: rendre la politique <span className="text-blue-600">accessible à tous</span>
              </h1>
              <p className="text-lg md:text-xl text-dark/70 mb-8 max-w-3xl mx-auto">
                Politiquensemble est un média indépendant qui démocratise l'information politique, économique et historique pour les 16-30 ans, avec une approche pédagogique et innovante.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Nous contacter
                  </Button>
                </Link>
                <a href="https://twitter.com/politiquensemble" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    Nous suivre
                  </Button>
                </a>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Notre histoire - Nouveau format sans timeline */}
      <section className="py-16 bg-white" id="histoire">
        <div className="container mx-auto px-4">
          <ScrollAnimation threshold={0.1}>
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">Notre histoire</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>
              <p className="text-dark/70 max-w-3xl mx-auto">
                Découvrez comment Politiquensemble est passé d'une simple idée à un média digital innovant.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {keyMilestones.map((milestone, index) => (
              <ScrollAnimation 
                key={index} 
                threshold={0.1}
                delay={index * 0.1}
              >
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 p-3 bg-blue-50 rounded-full flex items-center justify-center">
                      {milestone.icon}
                    </div>
                    <div>
                      <div className="text-blue-600 font-bold text-xl">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-dark">{milestone.title}</h3>
                    </div>
                  </div>
                  <p className="text-dark/70 flex-grow">{milestone.description}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="py-16 bg-gray-50" id="valeurs">
        <div className="container mx-auto px-4">
          <ScrollAnimation threshold={0.1}>
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">Nos valeurs</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>
              <p className="text-dark/70 max-w-3xl mx-auto">
                Ces principes guident chacune de nos décisions éditoriales et notre approche de l'information.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <ScrollAnimation key={index} threshold={0.1} delay={index * 0.1}>
                <ValueCard 
                  icon={value.icon} 
                  title={value.title} 
                  description={value.description} 
                />
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <ScrollAnimation threshold={0.1}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Rejoignez notre communauté
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-3xl mx-auto">
                Suivez-nous sur les réseaux sociaux et inscrivez-vous à notre newsletter pour ne manquer aucune actualité politique expliquée simplement.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    Contactez-nous
                  </Button>
                </Link>
                <a href="https://twitter.com/politiquensemble" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-white text-white hover:bg-blue-700">
                    Suivez-nous
                  </Button>
                </a>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </>
  );
};

export default AboutPage;