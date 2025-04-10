import React from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ScrollAnimation from "@/components/animations/ScrollAnimation";
import TeamMemberCard from "@/components/about/TeamMemberCard";
import ValueCard from "@/components/about/ValueCard";
import Loader from "@/components/ui/custom/Loader";

type TeamMember = {
  id: number;
  displayName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
};

const AboutPage: React.FC = () => {
  // Récupération des membres de l'équipe depuis l'API
  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery<TeamMember[]>({
    queryKey: ['/api/team'],
  });

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

  const milestones = [
    {
      year: "2022",
      title: "Naissance du concept",
      description: "Politiquensemble est né de la volonté de rendre l'actualité politique accessible aux 16-30 ans, souvent éloignés des médias traditionnels.",
    },
    {
      year: "2023",
      title: "Lancement sur les réseaux sociaux",
      description: "Nous avons commencé à publier du contenu sur les principales plateformes sociales, touchant rapidement plusieurs milliers d'abonnés.",
    },
    {
      year: "2024",
      title: "Développement de notre plateforme",
      description: "Le lancement de notre site web marque une nouvelle étape, offrant un espace dédié à notre contenu et à nos formats innovants.",
    },
    {
      year: "2025",
      title: "Expansion de nos formats",
      description: "Développement de nouvelles façons d'informer: directs pour les grands événements, données électorales interactives, et contenus éducatifs.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>À propos de Politiquensemble - Notre mission et notre équipe</title>
        <meta name="description" content="Découvrez l'équipe et la mission de Politiquensemble, média indépendant qui rend l'actualité politique, économique et historique accessible aux 16-30 ans." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollAnimation threshold={0.1}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-6">
                Notre mission: rendre la politique <span className="text-blue-600">accessible à tous</span>
              </h1>
              <p className="text-lg md:text-xl text-dark/70 mb-8 max-w-3xl mx-auto">
                Politiquensemble est un média indépendant qui démocratise l'information politique, économique et historique pour les 16-30 ans, avec une approche pédagogique et innovante.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/team">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Découvrir notre équipe
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Notre histoire */}
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

          <div className="relative">
            {/* Ligne verticale de timeline */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>
            
            <div className="space-y-12 md:space-y-0 relative">
              {milestones.map((milestone, index) => (
                <ScrollAnimation 
                  key={index} 
                  threshold={0.1}
                  delay={index * 0.1}
                  className="md:grid md:grid-cols-2 md:gap-8 relative"
                >
                  <div className={`md:flex ${index % 2 === 0 ? 'md:justify-end' : 'md:order-2'}`}>
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 md:max-w-md mb-4 md:mb-0 hover:shadow-xl transition-shadow duration-300">
                      <div className="text-blue-600 font-bold text-xl mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-dark mb-3">{milestone.title}</h3>
                      <p className="text-dark/70">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Point de timeline */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow"></div>
                  
                  <div className={`hidden md:block ${index % 2 === 0 ? 'md:order-2' : ''}`}></div>
                </ScrollAnimation>
              ))}
            </div>
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

      {/* Notre équipe - Aperçu */}
      <section className="py-16 bg-white" id="equipe">
        <div className="container mx-auto px-4">
          <ScrollAnimation threshold={0.1}>
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">Notre équipe</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>
              <p className="text-dark/70 max-w-3xl mx-auto">
                Découvrez les personnes passionnées qui contribuent à rendre l'information politique accessible à tous.
              </p>
            </div>
          </ScrollAnimation>

          {isLoadingTeam ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {teamMembers && teamMembers.map((member, index) => (
                <ScrollAnimation key={member.id} threshold={0.1} delay={index * 0.1}>
                  <TeamMemberCard
                    name={member.displayName}
                    title={member.title || ""}
                    bio={member.bio || ""}
                    avatar={member.avatarUrl}
                    isAdmin={member.role === "admin"}
                  />
                </ScrollAnimation>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/team">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Voir toute l'équipe
              </Button>
            </Link>
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