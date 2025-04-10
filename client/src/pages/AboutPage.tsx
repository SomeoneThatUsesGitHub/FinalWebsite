import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ScrollAnimation from "@/components/animations/ScrollAnimation";
import ValueCard from "@/components/about/ValueCard";
import { MapPin, Calendar, Award, Users, Bookmark, TrendingUp, Newspaper, Share2, BookOpen } from "lucide-react";

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
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      year: "2022",
      title: "Naissance du concept",
      description: "Politiquensemble est né de la volonté de rendre l'actualité politique accessible aux 16-30 ans, souvent éloignés des médias traditionnels."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      year: "2023",
      title: "Lancement sur les réseaux sociaux",
      description: "Nous avons commencé à publier du contenu sur les principales plateformes sociales, touchant rapidement plusieurs milliers d'abonnés."
    },
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      year: "2024",
      title: "Développement de notre plateforme",
      description: "Le lancement de notre site web marque une nouvelle étape, offrant un espace dédié à notre contenu et à nos formats innovants."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      year: "2025",
      title: "Expansion de nos formats",
      description: "Développement de nouvelles façons d'informer: directs pour les grands événements, données électorales interactives, et contenus éducatifs."
    }
  ];

  return (
    <>
      <Helmet>
        <title>À propos de Politiquensemble - Notre mission</title>
        <meta name="description" content="Découvrez la mission de Politiquensemble, média indépendant qui rend l'actualité politique, économique et historique accessible aux 16-30 ans." />
      </Helmet>

      {/* Hero Section avec effet carnet quadrillé qui s'estompe et collages politiques */}
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

      {/* Notre histoire - Format de notes collées */}
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
                className="flex justify-center"
              >
                <div className={`milestone-card w-full md:w-11/12 md:max-w-md`}>
                  <div className="milestone-content">
                    <div className="flex items-start mb-3">
                      <div className="mr-3 flex-shrink-0">
                        {milestone.icon}
                      </div>
                      <div>
                        <div className="text-blue-600 font-bold text-lg">{milestone.year}</div>
                        <h3 className="text-xl font-bold text-dark">{milestone.title}</h3>
                      </div>
                    </div>
                    <p className="text-dark/70">{milestone.description}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Nos valeurs - Nouveau style horizontal simplifié */}
      <section className="py-16 bg-blue-50" id="valeurs">
        <div className="container mx-auto px-4">
          <ScrollAnimation threshold={0.1}>
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">Nos valeurs</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>
              <p className="text-dark/70 max-w-3xl mx-auto">
                Ces principes fondamentaux guident notre ligne éditoriale et notre approche de l'information.
              </p>
            </div>
          </ScrollAnimation>

          <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto">
            {values.slice(0, 3).map((value, index) => (
              <ScrollAnimation key={index} threshold={0.1} delay={index * 0.15} className="flex-1">
                <div className="bg-white rounded-lg p-6 shadow-lg h-full border-t-4 border-blue-600 hover:shadow-xl transition-shadow">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ValueCard 
                      icon={value.icon} 
                      title=""
                      description=""
                      index={index}
                      iconOnly={true}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-center text-blue-800 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-center">{value.description}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Politiquensemble en chiffres */}
      <section className="py-16 bg-gradient-to-br from-blue-700 to-blue-900 text-white stats-section" id="chiffres">
        <div className="container mx-auto px-4">
          <ScrollAnimation threshold={0.1}>
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Politiquensemble en chiffres</h2>
              <div className="w-24 h-1 bg-white mx-auto rounded-full mb-6"></div>
              <p className="text-white/80 max-w-3xl mx-auto">
                Notre impact en quelques données clés
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
            <ScrollAnimation threshold={0.1} delay={0.1}>
              <div className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Users className="w-6 h-6 text-blue-100" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
                <div className="text-white/80">Abonnés</div>
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation threshold={0.1} delay={0.2}>
              <div className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Newspaper className="w-6 h-6 text-blue-100" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">250+</div>
                <div className="text-white/80">Articles publiés</div>
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation threshold={0.1} delay={0.3}>
              <div className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Share2 className="w-6 h-6 text-blue-100" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
                <div className="text-white/80">Directs couverts</div>
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation threshold={0.1} delay={0.4}>
              <div className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <BookOpen className="w-6 h-6 text-blue-100" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">15+</div>
                <div className="text-white/80">Dossiers pédagogiques</div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;