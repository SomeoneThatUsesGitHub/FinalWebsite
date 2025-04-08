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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ExternalLink, Loader2 } from 'lucide-react';
// Layout
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team'],
    queryFn: async () => {
      const response = await fetch('/api/team');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des membres de l\'équipe');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-medium">Chargement de l'équipe...</h3>
          </div>
        </div>
        <Footer />
      </>
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
            {members.map((member, index) => (
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
                  <CardFooter className="flex justify-center space-x-2 border-t p-4 mt-auto">
                    {member.twitterHandle && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`https://twitter.com/${member.twitterHandle}`} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {member.instagramHandle && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`https://instagram.com/${member.instagramHandle}`} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {member.email && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`mailto:${member.email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {/* Si aucun réseau social n'est défini, on affiche un message */}
                    {!member.twitterHandle && !member.instagramHandle && !member.email && (
                      <span className="text-xs text-muted-foreground">Aucun réseau social disponible</span>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Ajout de beaucoup plus d'espace avant le footer */}
      <div className="pb-40"></div>
      
      <Footer />
    </>
  );
}