import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Award, Users, ExternalLink } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { pageTransition } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ElectionResultsChart, ElectionResultsData } from '@/components/ElectionResultsChart';

// Interface pour les élections
interface Election {
  id: number;
  country: string;
  countryCode: string;
  title: string;
  date: string;
  type: string;
  results: any;
  description: string | null;
  upcoming: boolean;
  createdAt: string;
}

// Animation avec effet de rebond
const fadeInWithBounce = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.175, 0.885, 0.32, 1.5], // Effet de rebond accentué
      bounce: 0.4,
      type: "spring",
      stiffness: 120
    }
  }
};

// Fonction pour obtenir l'URL du drapeau d'un pays à partir de son code pays
const getCountryFlagUrl = (countryCode: string): string => {
  // En production, on utiliserait une API ou des images stockées
  // Pour cet exemple, on utilise les drapeaux de Flagcdn
  const code = countryCode.toLowerCase();
  return `https://flagcdn.com/w320/${code}.png`;
};

const CountryElectionsPage: React.FC = () => {
  const [_, params] = useRoute('/elections/:countryCode');
  const countryCode = params?.countryCode.toUpperCase();
  // Plus besoin d'onglets
  
  // Récupérer toutes les élections
  const { data: allElections, isLoading } = useQuery<Election[]>({
    queryKey: ['/api/elections'],
  });
  
  if (!countryCode) {
    return <div>Code pays non valide</div>;
  }
  
  // Filtrer les élections par pays
  const elections = allElections?.filter(
    election => election.countryCode.toUpperCase() === countryCode.toUpperCase()
  ) || [];
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-1/3 mb-8" />
          <div className="space-y-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (elections.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Link href="/elections">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux pays
            </Button>
          </Link>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Aucune élection trouvée</h1>
            <p className="text-muted-foreground mb-8">
              Aucune donnée disponible pour ce pays.
            </p>
            <Link href="/elections">
              <Button>Voir tous les pays</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Obtenir le nom du pays depuis la première élection
  const countryName = elections[0].country;
  
  // Élections à venir et passées
  const upcomingElections = elections.filter(e => e.upcoming);
  const pastElections = elections.filter(e => !e.upcoming);
  
  // Trier les élections par date (plus récentes d'abord)
  const sortedElections = [...elections].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <MainLayout>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        {/* Bannière d'en-tête */}
        <div className="bg-blue-50 py-12 md:py-20 shadow-md mb-8 w-screen relative left-1/2 transform -translate-x-1/2 -mt-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                variants={fadeInWithBounce}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 relative flex items-center justify-center"
              >
                <div className="w-16 h-12 md:w-20 md:h-16 lg:w-24 lg:h-20 inline-block mr-4 overflow-hidden rounded shadow-md">
                  <img 
                    src={getCountryFlagUrl(countryCode)} 
                    alt={`Drapeau ${countryName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {countryName}
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
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 0.5, duration: 0.5 } 
                }}
                className="mt-4 text-muted-foreground"
              >
                {elections.length} élection{elections.length > 1 ? 's' : ''}
              </motion.p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <Link href="/elections">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux pays
            </Button>
          </Link>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Élections passées</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastElections.map((election) => (
                <ElectionCard key={election.id} election={election} />
              ))}
            </div>
          </div>

          {upcomingElections.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Élections à venir</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingElections.map((election) => (
                  <ElectionCard key={election.id} election={election} />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

interface ElectionCardProps {
  election: Election;
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election }) => {
  const { title, date, type, description, results, upcoming } = election;
  
  // Formater la date
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  // Parser les résultats
  const parsedResults = results && typeof results === 'string' ? JSON.parse(results) : results;
  const electionData: ElectionResultsData = {
    title: title,
    date: formattedDate,
    type: type,
    results: parsedResults?.results || []
  };
  
  return (
    <Link href={`/elections/${election.countryCode.toLowerCase()}/resultats?id=${election.id}`}>
      <Card className={`hover:shadow-md transition-shadow h-full ${upcoming ? 'border-amber-300' : 'border-blue-300'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1" />
              {type}
            </div>
            {upcoming && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                À venir
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
          )}
          
          {!upcoming && parsedResults?.results && parsedResults.results.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Voir les résultats
              </Button>
            </div>
          )}
          
          {upcoming && (
            <div className="flex items-center justify-between mt-4">
              <Badge variant="outline" className="w-full py-1.5 justify-center">
                Élection à venir le {formattedDate}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default CountryElectionsPage;