import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
      <div className="bg-blue-600 py-12 mb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Notre Équipe</h1>
          <div className="w-24 h-1 bg-white mx-auto mt-4"></div>
        </div>
      </div>
      <div className="container mx-auto py-6 px-4">
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground text-center mb-16">
          Découvrez l'équipe passionnée qui se cache derrière Politiquensemble, 
          travaillant chaque jour pour vous apporter une information politique de qualité.
        </p>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-medium">Aucun membre d'équipe à afficher</h3>
            <p className="text-muted-foreground mt-2">
              Notre équipe est en cours de construction. Revenez bientôt !
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member) => (
              <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      {member.avatarUrl ? (
                        <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          {member.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
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
                <CardFooter className="flex justify-center space-x-2 border-t p-4">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`https://twitter.com/${member.username}`} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`https://linkedin.com/in/${member.username}`} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`mailto:${member.username}@politiquensemble.fr`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}