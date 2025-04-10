import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Users, Send, BriefcaseBusiness, Newspaper, Camera, Video, Award } from 'lucide-react';
import TeamApplicationForm from '@/components/TeamApplicationForm';

type TeamMember = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
  title: string | null;
  bio: string | null;
  twitterHandle?: string | null;
  instagramHandle?: string | null;
  email?: string | null;
};

// Données pour les postes disponibles avec icônes et descriptions
const availablePositions = [
  {
    title: "Journaliste",
    icon: <Newspaper className="h-8 w-8 text-blue-600" />,
    description: "Rédiger des articles sur l'actualité politique et économique."
  },
  {
    title: "Monteur vidéo",
    icon: <Video className="h-8 w-8 text-blue-600" />,
    description: "Créer et éditer des contenus vidéo pour nos plateformes."
  },
  {
    title: "Graphiste",
    icon: <BriefcaseBusiness className="h-8 w-8 text-blue-600" />,
    description: "Concevoir des visuels pour nos publications."
  },
  {
    title: "Photographe",
    icon: <Camera className="h-8 w-8 text-blue-600" />,
    description: "Couvrir des événements et créer des reportages photo."
  },
  {
    title: "Ambassadeur",
    icon: <Award className="h-8 w-8 text-blue-600" />,
    description: "Représenter Politiquensemble lors d'événements."
  }
];

export default function TeamPage() {
  console.log("TeamPage se charge à:", new Date().toISOString());
  
  const showTeamMembers = (members: TeamMember[]) => {
    console.log("Membres reçus pour traitement:", JSON.stringify(members, null, 2));
    
    const guest = members.find(m => m.username === 'Guest_1');
    if (guest) {
      console.log("Données sociales de Guest_1:", {
        twitter: guest.twitterHandle,
        instagram: guest.instagramHandle,
        email: guest.email
      });
    }
    
    const noah = members.find(m => m.username === 'Noah');
    if (noah) {
      console.log("Données sociales de Noah:", {
        twitter: noah.twitterHandle,
        instagram: noah.instagramHandle,
        email: noah.email
      });
    }
    
    return members;
  };
  
  const { data: membersRaw = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team'], 
    queryFn: async () => {
      console.log("Requête API /team lancée");
      
      const response = await fetch(`/api/team?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des membres de l\'équipe');
      }
      
      const data = await response.json();
      console.log("Membres récupérés du serveur (BRUT):", JSON.stringify(data, null, 2));
      
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  const members = showTeamMembers(membersRaw);

  if (isLoading) {
    return (
      <div className="container mx-auto py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h3 className="mt-4 text-lg font-medium">Chargement de l'équipe...</h3>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 py-12 md:py-20 shadow-md mb-8"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.7,
                  ease: [0.175, 0.885, 0.32, 1.5],
                  bounce: 0.4,
                  type: "spring",
                  stiffness: 120
                }
              }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 relative"
            >
              Notre Équipe
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 0.3, duration: 0.5 } 
              }}
              className="h-1 w-20 bg-blue-500 mx-auto rounded-full"
            ></motion.div>
          </div>
        </div>
      </motion.div>
      <div className="container mx-auto py-6 px-4">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-medium">Aucun membre d'équipe à afficher</h3>
            <p className="text-muted-foreground mt-2">
              Notre équipe est en cours de construction. Revenez bientôt !
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member: TeamMember, index: number) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: 0.1 * index, 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }
                }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all h-full">
                  <CardHeader className="pb-2">
                    <motion.div 
                      className="flex justify-center mb-4"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="h-24 w-24">
                        {member.avatarUrl ? (
                          <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                        ) : (
                          <AvatarFallback className="text-2xl">
                            {member.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </motion.div>
                    <CardTitle className="text-xl text-center">{member.displayName}</CardTitle>
                    {member.title && (
                      <CardDescription className="text-center text-sm font-medium text-primary">
                        {member.title}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="text-center">
                    {member.bio ? (
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Membre de l'équipe Politiquensemble
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Section de candidature à l'équipe avec design amélioré */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="bg-gradient-to-br from-blue-50 to-blue-100 py-16 mt-16 mb-8 relative overflow-hidden"
      >
        {/* Formes décoratives */}
        <div className="absolute -top-10 -left-20 w-40 h-40 bg-blue-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-blue-300 rounded-full opacity-20"></div>
        <div className="absolute top-1/3 right-0 w-20 h-80 bg-blue-200 rounded-l-full opacity-30"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-12 relative z-10">
            
            {/* Colonne de gauche: informations sur les postes */}
            <div className="w-full md:w-5/12 lg:w-4/12 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <Users className="h-8 w-8 mr-3 text-blue-600" />
                  Rejoignez-nous
                </h2>
                <p className="text-gray-600 mb-6">
                  Nous recherchons des personnes motivées et passionnées pour contribuer au développement de notre média.
                </p>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-700">Postes disponibles</h3>
                
                <div className="space-y-4">
                  {availablePositions.map((position, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { delay: 0.3 + (index * 0.1), duration: 0.5 }
                      }}
                      className="flex items-start p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="mr-3">{position.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-800">{position.title}</h4>
                        <p className="text-sm text-gray-600">{position.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="p-4 bg-blue-600 bg-opacity-10 border border-blue-600 border-opacity-20 rounded-lg"
                >
                  <p className="text-blue-800 text-sm flex items-start">
                    <Send className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                    <span>Remplissez le formulaire pour postuler à l'un de ces postes ou proposer une candidature spontanée.</span>
                  </p>
                </motion.div>
              </div>
            </div>
            
            {/* Colonne de droite: formulaire de candidature */}
            <div className="w-full md:w-7/12 lg:w-8/12">
              <TeamApplicationForm />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Espace avant le footer */}
      <div className="pb-20"></div>
    </>
  );
}