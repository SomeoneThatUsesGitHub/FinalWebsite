import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ScrollAnimation from "@/components/animations/ScrollAnimation";
import ValueCard from "@/components/about/ValueCard";
import { MapPin, Calendar, Award, Users, Bookmark, TrendingUp, Newspaper, Share2, BookOpen, Instagram } from "lucide-react";
import CountUp from "react-countup";

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
                <a href="https://www.instagram.com/politiquensemble/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Instagram className="h-4 w-4 mr-2" />
                    Nous suivre
                  </Button>
                </a>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Notre histoire - Avec fond plus foncé et téléphone affichant Instagram */}
      <section className="py-20 bg-gradient-to-b from-gray-100 to-gray-50 overflow-hidden" id="histoire">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row">
            {/* Titre et introduction à gauche */}
            <div className="lg:w-1/3 lg:pr-16 mb-12 lg:mb-0 relative z-10">
              <ScrollAnimation threshold={0.1}>
                <div className="sticky top-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4 lg:text-left">Notre histoire</h2>
                  <div className="w-24 h-1 bg-blue-600 mb-6 lg:mx-0"></div>
                  <p className="text-dark/80 mb-8 lg:text-left">
                    Découvrez comment Politiquensemble est passé d'une simple idée à un média digital innovant qui transforme l'accès à l'information politique pour les jeunes.
                  </p>
                  
                  {/* Téléphone avec Instagram (incliné sur desktop, animation popup sur mobile) */}
                  <div className="mt-16 relative flex justify-center lg:justify-start max-w-full lg:max-w-[280px]">
                    <div className="phone-mockup">
                      <div className="relative border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl transform lg:-rotate-3 animate-in fade-in-50 zoom-in-95 duration-1000">
                        <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                        <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                        <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white">
                          <img src="/assets/instagram-politiquensemble.jpg" className="w-full h-full object-cover" alt="Compte Instagram Politiquensemble" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden lg:block relative">
                    <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-blue-100 rounded-full opacity-70"></div>
                    <div className="absolute -right-12 top-10 w-16 h-16 bg-blue-200 rounded-full opacity-50"></div>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
            
            {/* Timeline à droite avec nouveau design sans effet carnet */}
            <div className="lg:w-2/3 relative">
              <div className="hidden lg:block absolute top-0 bottom-0 left-12 w-1 bg-blue-200"></div>
              
              {keyMilestones.map((milestone, index) => (
                <ScrollAnimation 
                  key={index} 
                  threshold={0.1}
                  delay={index * 0.1}
                >
                  <div className="flex mb-16 relative lg:pl-24">
                    <div className="hidden lg:flex absolute left-10 top-4 -translate-x-1/2 w-8 h-8 bg-gray-50 border-4 border-blue-500 rounded-full z-10"></div>
                    <div className="bg-gray-50/80 backdrop-blur-sm shadow-lg rounded-lg p-6 hover:shadow-xl transition-all w-full lg:ml-4 transform hover:scale-[1.02]">
                      <div className="flex items-start mb-3">
                        <div className="mr-4 p-3 bg-blue-100 rounded-xl flex-shrink-0">
                          {milestone.icon}
                        </div>
                        <div>
                          <div className="text-blue-600 font-bold text-lg">{milestone.year}</div>
                          <h3 className="text-xl font-bold text-dark">{milestone.title}</h3>
                        </div>
                      </div>
                      <p className="text-dark/70 lg:pl-16">{milestone.description}</p>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nos valeurs - Style asymétrique */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-white" id="valeurs">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Cards à gauche */}
            <div className="lg:w-3/5 order-2 lg:order-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 relative">
                {/* Élément décoratif */}
                <div className="hidden lg:block absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full opacity-50 z-0"></div>
                
                {values.slice(0, 3).map((value, index) => (
                  <ScrollAnimation key={index} threshold={0.1} delay={index * 0.15}>
                    <div className={`bg-white rounded-lg p-6 shadow-lg h-full border-l-4 border-blue-600 hover:shadow-xl transition-shadow relative z-10 transform ${index % 2 === 1 ? 'lg:translate-y-8' : ''}`}>
                      <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                        <ValueCard 
                          icon={value.icon} 
                          title=""
                          description=""
                          index={index}
                          iconOnly={true}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-blue-800 mb-3">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
            
            {/* Texte à droite */}
            <div className="lg:w-2/5 mb-12 lg:mb-0 order-1 lg:order-2 lg:pl-16">
              <ScrollAnimation threshold={0.1}>
                <div className="lg:text-right">
                  <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">Nos valeurs</h2>
                  <div className="w-24 h-1 bg-blue-600 mb-6 lg:ml-auto"></div>
                  <p className="text-dark/80 mb-6">
                    Ces principes fondamentaux guident notre ligne éditoriale et notre approche de l'information quotidienne.
                  </p>
                  <p className="text-dark/70">
                    Notre objectif est de rendre l'information politique compréhensible, objective et accessible, quelle que soit votre connaissance préalable du sujet.
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Bande bleue pour transition */}
      <section className="py-2 bg-blue-800"></section>
      
      {/* Politiquensemble en chiffres - Style décalé et dynamique avec animation de comptage */}
      <section className="py-20 bg-gradient-to-br from-blue-700 to-blue-900 text-white stats-section relative overflow-hidden" id="chiffres">
        {/* Élément décoratif */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 opacity-30 rounded-full"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-400 opacity-20 rounded-full"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Stats à droite */}
            <div className="lg:w-3/5 order-2 lg:order-2">
              <div className="grid grid-cols-2 gap-6 relative">
                <ScrollAnimation threshold={0.1} delay={0.1}>
                  <div className="p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 transform hover:translate-y-[-5px] transition-transform">
                    <div className="flex items-center mb-3">
                      <div className="bg-white/15 p-3 rounded-lg mr-4">
                        <Users className="w-7 h-7 text-blue-100" />
                      </div>
                      <div className="text-3xl md:text-5xl font-bold">
                        <CountUp end={10} suffix="K+" duration={2.5} />
                      </div>
                    </div>
                    <div className="text-lg text-white/80">Abonnés sur nos réseaux sociaux</div>
                  </div>
                </ScrollAnimation>
                
                <ScrollAnimation threshold={0.1} delay={0.2}>
                  <div className="p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 transform lg:translate-y-6 hover:translate-y-1 transition-transform">
                    <div className="flex items-center mb-3">
                      <div className="bg-white/15 p-3 rounded-lg mr-4">
                        <Newspaper className="w-7 h-7 text-blue-100" />
                      </div>
                      <div className="text-3xl md:text-5xl font-bold">
                        <CountUp end={250} suffix="+" duration={2.5} />
                      </div>
                    </div>
                    <div className="text-lg text-white/80">Articles et analyses publiés</div>
                  </div>
                </ScrollAnimation>
                
                <ScrollAnimation threshold={0.1} delay={0.3}>
                  <div className="p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 transform lg:translate-y-[-24px] hover:translate-y-[-29px] transition-transform">
                    <div className="flex items-center mb-3">
                      <div className="bg-white/15 p-3 rounded-lg mr-4">
                        <Share2 className="w-7 h-7 text-blue-100" />
                      </div>
                      <div className="text-3xl md:text-5xl font-bold">
                        <CountUp end={50} suffix="+" duration={2.5} />
                      </div>
                    </div>
                    <div className="text-lg text-white/80">Événements couverts en direct</div>
                  </div>
                </ScrollAnimation>
                
                <ScrollAnimation threshold={0.1} delay={0.4}>
                  <div className="p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 transform hover:translate-y-[-5px] transition-transform">
                    <div className="flex items-center mb-3">
                      <div className="bg-white/15 p-3 rounded-lg mr-4">
                        <BookOpen className="w-7 h-7 text-blue-100" />
                      </div>
                      <div className="text-3xl md:text-5xl font-bold">
                        <CountUp end={15} suffix="+" duration={2.5} />
                      </div>
                    </div>
                    <div className="text-lg text-white/80">Dossiers pédagogiques</div>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
            
            {/* Texte à gauche */}
            <div className="lg:w-2/5 mb-12 lg:mb-0 order-1 lg:order-1 lg:pr-16">
              <ScrollAnimation threshold={0.1}>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Notre impact en chiffres</h2>
                <div className="w-24 h-1 bg-white mb-6"></div>
                <p className="text-white/90 text-lg mb-6">
                  Depuis notre création, nous nous efforçons de rendre l'information politique accessible au plus grand nombre.
                </p>
                <p className="text-white/80">
                  Ces chiffres témoignent de notre engagement à produire un contenu de qualité qui aide à comprendre les enjeux politiques contemporains.
                </p>
                <div className="mt-8">
                  <a 
                    href="https://www.instagram.com/politiquensemble/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-800 rounded-full font-medium hover:bg-blue-50 transition-all"
                  >
                    <Instagram className="mr-2 h-5 w-5" />
                    Nous suivre
                  </a>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;