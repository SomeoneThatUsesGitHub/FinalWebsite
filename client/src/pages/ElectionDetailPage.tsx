import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, VoteIcon, ChevronLeft, Share2 } from 'lucide-react';
import { pageTransition } from '@/lib/animations';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ElectionResultsChart, ElectionResultsData } from '@/components/ElectionResultsChart';
import { ParliamentChart, ParliamentData } from '@/components/ParliamentChart';
import { getCountryFlag } from '@/lib/countries';

// Interface pour les données d'élection
interface Election {
  id: number;
  country: string;
  countryCode: string;
  title: string;
  date: string;
  type: string;
  results: any; // Ce sera parsé
  description: string | null;
  upcoming: boolean;
  createdAt: string;
}

const ElectionDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [electionId, setElectionId] = useState<number | null>(null);
  
  useEffect(() => {
    if (params && params.id) {
      setElectionId(parseInt(params.id, 10));
    }
  }, [params]);

  // Récupérer les données de l'élection
  const { data: elections, isLoading } = useQuery<Election[]>({
    queryKey: ['/api/elections'],
  });

  // Trouver l'élection actuelle
  const election = elections?.find(e => e.id === electionId);
  
  // Convertir les résultats en données de graphique
  const [electionResults, setElectionResults] = useState<ElectionResultsData | null>(null);
  const [parliamentData, setParliamentData] = useState<ParliamentData | null>(null);
  
  useEffect(() => {
    if (election) {
      const parsedResults = election.results && typeof election.results === 'string' 
        ? JSON.parse(election.results) 
        : election.results;
      
      if (parsedResults && parsedResults.results) {
        // Données pour le graphique des résultats 
        const resultsData: ElectionResultsData = {
          title: election.title,
          date: new Date(election.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          type: election.type,
          results: parsedResults.results
        };
        setElectionResults(resultsData);
        
        // Convertir pour le graphique de l'hémicycle (simulation)
        // En réalité, ces données devraient provenir du backend avec le nombre de sièges
        const seatsData: ParliamentData = {
          title: "Répartition des sièges",
          totalSeats: 350, // Un nombre arbitraire de sièges
          seats: parsedResults.results.map((result: any) => ({
            party: result.party,
            // Calculer un nombre approximatif de sièges basé sur le pourcentage
            count: Math.round((result.percentage / 100) * 350),
            color: result.color
          }))
        };
        setParliamentData(seatsData);
      }
    }
  }, [election]);
  
  // Si l'élection n'est pas trouvée, rediriger vers la page principale des élections
  useEffect(() => {
    if (!isLoading && elections && electionId && !election) {
      setLocation('/elections');
    }
  }, [isLoading, elections, election, electionId, setLocation]);

  if (isLoading || !election) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Skeleton className="h-96 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </MainLayout>
    );
  }

  // Formater la date
  const formattedDate = new Date(election.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <MainLayout>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        {/* En-tête de l'élection avec fond de couleur */}
        <div className="bg-blue-50 py-12 md:py-20 shadow-md mb-8 w-screen relative left-1/2 transform -translate-x-1/2">
          <div className="container mx-auto px-4 md:px-6">
            <Button 
              variant="ghost" 
              className="mb-6" 
              onClick={() => setLocation('/elections')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux élections
            </Button>
            
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{getCountryFlag(election.countryCode)}</div>
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary"
                  >
                    {election.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } }}
                    className="text-lg text-blue-800/70 mt-2"
                  >
                    {election.country}
                  </motion.p>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } }}
                className="flex flex-wrap gap-3 mt-6"
              >
                <Badge variant="secondary" className="flex items-center bg-white/70 text-blue-800">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formattedDate}
                </Badge>
                <Badge variant="secondary" className="flex items-center bg-white/70 text-blue-800">
                  <VoteIcon className="h-3 w-3 mr-1" />
                  {election.type}
                </Badge>
                {election.upcoming ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    À venir
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Terminée
                  </Badge>
                )}
              </motion.div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Description */}
          {election.description && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{election.description}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Onglets avec différentes visualisations */}
          <Tabs defaultValue="results" className="w-full mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="results">Résultats</TabsTrigger>
              <TabsTrigger value="parliament">Parlement</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="space-y-6">
              {electionResults ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[500px] md:min-w-0">
                    <ElectionResultsChart data={electionResults} />
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Aucun résultat disponible</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="parliament" className="space-y-6">
              {parliamentData ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[500px] md:min-w-0">
                    <ParliamentChart data={parliamentData} />
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Données parlementaires non disponibles</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Section de partage */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Partager cette élection</CardTitle>
              <CardDescription>
                Partagez ces informations avec vos contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Copier le lien
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ElectionDetailPage;