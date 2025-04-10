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
import { Loader2 } from 'lucide-react';
import TeamApplicationForm from '@/components/TeamApplicationForm';
// Layout
// Header et Footer sont fournis par App.tsx

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

export default function TeamPage() {
  // Ajoutons un log avant tout pour voir ce qui est chargé
  console.log("TeamPage se charge à:", new Date().toISOString());
  
  // Fonction pour afficher les données dans la console et vérifier les champs sociaux
  const showTeamMembers = (members: TeamMember[]) => {
    // Pour le débogage détaillé
    console.log("Membres reçus pour traitement:", JSON.stringify(members, null, 2));
    
    // Si Guest_1 a été mis à jour via l'admin, afficher ses détails
    const guest = members.find(m => m.username === 'Guest_1');
    if (guest) {
      console.log("Données sociales de Guest_1:", {
        twitter: guest.twitterHandle,
        instagram: guest.instagramHandle,
        email: guest.email
      });
    }
    
    // Si Noah a été mis à jour via l'admin, afficher ses détails  
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
      
      // Utiliser une URL avec cache-busting
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
  
  // Afficher les détails et journaliser les problèmes potentiels
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
                  {/* Carte sans fonctionnalité de réseaux sociaux */}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Section de candidature à l'équipe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="bg-blue-50 py-16 mt-16 mb-8"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Rejoignez Notre Équipe</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Vous souhaitez contribuer à notre mission de rendre la politique, l'économie et l'histoire accessibles 
                aux jeunes de 16 à 30 ans ? Nous recherchons des personnes passionnées et motivées pour rejoindre notre équipe.
              </p>
            </div>
            
            <TeamApplicationForm />
          </div>
        </div>
      </motion.div>
      
      {/* Espace avant le footer */}
      <div className="pb-20"></div>
    </>
  );
}