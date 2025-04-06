import React from "react";
import { motion } from "framer-motion";
import { pageTransition, staggerChildren, staggerItem } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import SubscriptionBanner from "@/components/shared/SubscriptionBanner";
import { Helmet } from "react-helmet";
import { Twitter, Instagram, ExternalLink } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Marie Dupont",
    role: "Fondatrice & Rédactrice en chef",
    bio: "Diplômée de Sciences Po Paris, Marie a fondé Politique Jeune en 2021 avec la volonté de rendre la politique accessible à tous. Passionnée de pédagogie et d'information, elle coordonne l'ensemble de la ligne éditoriale.",
    imageUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com"
    }
  },
  {
    id: 2,
    name: "Thomas Martin",
    role: "Responsable Contenu Digital",
    bio: "Expert en stratégie digitale, Thomas gère l'ensemble des réseaux sociaux et supervise la création de contenus adaptés aux jeunes générations. Il est également en charge du développement de notre présence sur TikTok.",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      website: "https://example.com"
    }
  },
  {
    id: 3,
    name: "Sophie Bernard",
    role: "Journaliste Économie",
    bio: "Avec un Master en économie internationale, Sophie décrypte les enjeux économiques pour les rendre accessibles à tous. Elle est spécialisée dans les questions liées à l'emploi des jeunes et à l'économie verte.",
    imageUrl: "https://randomuser.me/api/portraits/women/23.jpg",
    socialLinks: {
      twitter: "https://twitter.com"
    }
  },
  {
    id: 4,
    name: "Julien Lambert",
    role: "Journaliste Politique Nationale",
    bio: "Ancien assistant parlementaire, Julien couvre l'actualité politique française. Sa connaissance des institutions et des coulisses du pouvoir lui permet d'offrir des analyses pertinentes sur les débats politiques actuels.",
    imageUrl: "https://randomuser.me/api/portraits/men/54.jpg",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com"
    }
  },
  {
    id: 5,
    name: "Claire Dubois",
    role: "Journaliste Environnement",
    bio: "Ingénieure environnementale de formation, Claire traite des sujets liés au changement climatique et aux politiques environnementales. Elle vulgarise des rapports scientifiques complexes pour les rendre accessibles à tous.",
    imageUrl: "https://randomuser.me/api/portraits/women/42.jpg",
    socialLinks: {
      twitter: "https://twitter.com",
      website: "https://example.com"
    }
  },
  {
    id: 6,
    name: "Laurent Chevalier",
    role: "Journaliste International",
    bio: "Spécialiste des relations internationales, Laurent a vécu sur trois continents et couvre l'actualité géopolitique mondiale. Sa passion pour l'histoire lui permet de mettre en perspective les tensions internationales actuelles.",
    imageUrl: "https://randomuser.me/api/portraits/men/85.jpg",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com"
    }
  }
];

const TeamPage: React.FC = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>Notre Équipe | Politique Jeune</title>
        <meta name="description" content="Découvrez l'équipe de Politique Jeune, des journalistes et experts passionnés qui travaillent à rendre l'information politique accessible aux 16-30 ans." />
      </Helmet>
      
      <div className="bg-background py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-dark mb-4">
              Notre Équipe
            </h1>
            <p className="text-dark/70">
              Découvrez les visages derrière Politique Jeune, des passionnés d'information
              qui s'engagent chaque jour pour vous offrir un contenu de qualité.
            </p>
          </div>
        </div>
      </div>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
          >
            {teamMembers.map((member) => (
              <motion.div 
                key={member.id}
                className="bg-background rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                variants={staggerItem}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.imageUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-dark mb-1">{member.name}</h2>
                  <p className="text-primary font-medium mb-4">{member.role}</p>
                  <p className="text-dark/70 text-sm mb-4">{member.bio}</p>
                  
                  <div className="flex space-x-3">
                    {member.socialLinks.twitter && (
                      <a 
                        href={member.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        aria-label={`Twitter de ${member.name}`}
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {member.socialLinks.instagram && (
                      <a 
                        href={member.socialLinks.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        aria-label={`Instagram de ${member.name}`}
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {member.socialLinks.website && (
                      <a 
                        href={member.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        aria-label={`Site web de ${member.name}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Rejoignez notre équipe !</h2>
            <p className="text-dark/70 max-w-2xl mx-auto mb-6">
              Vous êtes passionné(e) par la politique et souhaitez contribuer à rendre l'information
              plus accessible aux jeunes ? Nous sommes toujours à la recherche de nouveaux talents !
            </p>
            <Button size="lg" className="mt-2">
              Voir nos offres d'emploi
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Nos valeurs d'équipe</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-primary pl-4 py-2">
                <h3 className="font-bold text-lg mb-2">Pédagogie</h3>
                <p className="text-dark/70">
                  Nous croyons en l'importance d'expliquer simplement des sujets complexes, sans jamais tomber dans la simplification excessive.
                </p>
              </div>
              
              <div className="border-l-4 border-secondary pl-4 py-2">
                <h3 className="font-bold text-lg mb-2">Neutralité</h3>
                <p className="text-dark/70">
                  Nous nous efforçons de présenter les faits et différents points de vue de manière équilibrée, sans orientation partisane.
                </p>
              </div>
              
              <div className="border-l-4 border-accent pl-4 py-2">
                <h3 className="font-bold text-lg mb-2">Innovation</h3>
                <p className="text-dark/70">
                  Nous explorons constamment de nouveaux formats et approches pour rendre l'information politique accessible et engageante.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="font-bold text-lg mb-2">Inclusion</h3>
                <p className="text-dark/70">
                  Nous veillons à ce que notre contenu soit accessible à tous, indépendamment de leur niveau d'éducation ou de leur origine.
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

export default TeamPage;
