import { Link, useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Award, Calendar, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCountryFlagUrl } from "../lib/helpers";
import { ElectionResultsData } from "../components/ElectionResultsChart";
import ElectionResultsChart from "../components/ElectionResultsChart";
import MainLayout from "../components/layout/MainLayout";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.5 } }
};

const fadeInWithBounce = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    }
  }
};

const ElectionResultsPage: React.FC = () => {
  const [routeMatched, params] = useRoute('/elections/:countryCode/resultats/:id');
  const countryCode = params?.countryCode.toUpperCase();
  const [location] = useLocation();
  
  // Extraire l'ID de l'élection à partir des paramètres d'URL
  const electionId = params?.id ? parseInt(params.id) : null;
  
  // Récupérer toutes les élections
  const { data: allElections, isLoading } = useQuery<Election[]>({
    queryKey: ['/api/elections'],
  });
  
  // Trouver l'élection actuelle par son ID
  const currentElection = useMemo(() => {
    if (!allElections || !electionId) return null;
    return allElections.find(e => e.id === electionId);
  }, [allElections, electionId]);
  
  // Si l'ID d'élection est invalide ou non trouvé
  const [locationPath, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!electionId || !currentElection)) {
      console.log("Redirection nécessaire. ID non valide:", electionId, "Election trouvée:", !!currentElection);
      // Rediriger vers la page du pays si l'élection n'est pas trouvée
      if (countryCode) {
        setLocation(`/elections/${countryCode.toLowerCase()}`);
      } else {
        setLocation("/elections");
      }
    }
  }, [isLoading, electionId, currentElection, countryCode, setLocation]);
  
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
  
  if (!currentElection) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Link href={`/elections/${countryCode?.toLowerCase() || ''}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Élection non trouvée</h1>
            <p className="text-muted-foreground mb-8">
              L'élection demandée n'existe pas ou a été supprimée.
            </p>
            <Link href="/elections">
              <Button>Voir toutes les élections</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const { title, country, date, type, description, results, upcoming } = currentElection;
  
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
    <MainLayout>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        {/* Bannière d'en-tête */}
        <div className="bg-blue-50 py-16 md:py-24 shadow-md mb-8 w-screen relative left-1/2 transform -translate-x-1/2 -mt-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                variants={fadeInWithBounce}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-6 pt-4 relative flex items-center justify-center"
              >
                {title}
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
                className="mt-4 text-muted-foreground flex items-center justify-center gap-3"
              >
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formattedDate}
                </span>
                <span className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {type}
                </span>
                {upcoming && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    À venir
                  </Badge>
                )}
              </motion.p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href={`/elections/${countryCode?.toLowerCase() || ''}`}>
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux élections de {country}
              </Button>
            </Link>
          </div>
          
          {description && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <p className="text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          )}
          
          {!upcoming && electionData.results.length > 0 ? (
            <div className="space-y-2">
              <div>
                <h2 className="text-2xl font-bold mb-2">Résultats des élections</h2>
                <div className="h-[400px] mb-2">
                  <ElectionResultsChart data={{...electionData, title: '', date: '', type: ''}} />
                </div>
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Détail des candidats</CardTitle>
                  <CardDescription>Liste complète des candidats et leurs performances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {electionData.results.map((result, index) => (
                      <div key={index} className="flex items-center rounded-lg border p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-1 h-8 rounded mr-3" style={{ backgroundColor: result.color }}></div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="font-semibold text-md">{result.candidate}</h3>
                              <p className="text-xs text-muted-foreground">{result.party}</p>
                            </div>
                            <div className="flex items-center mt-1 sm:mt-0">
                              {result.votes && (
                                <span className="text-xs text-muted-foreground mr-3">
                                  <Users className="h-3 w-3 inline mr-1" />
                                  {result.votes.toLocaleString('fr-FR')}
                                </span>
                              )}
                              <div className="font-bold text-md">{result.percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 mt-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${result.percentage}%`,
                                backgroundColor: result.color 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Section des réactions */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Réactions</CardTitle>
                  <CardDescription>Partagez votre opinion sur les résultats de cette élection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <textarea 
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Partagez votre réaction..."
                        rows={4}
                      />
                      <div className="flex justify-end">
                        <Button>Publier</Button>
                      </div>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      <h3 className="font-semibold text-lg mb-2">Commentaires récents</h3>
                      
                      <div className="space-y-4">
                        {/* Liste des réactions (simulée pour le moment) */}
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {String.fromCharCode(65 + i)}
                              </div>
                              <div>
                                <p className="font-medium">Utilisateur {i + 1}</p>
                                <p className="text-xs text-gray-500">il y a {i + 1} heure{i !== 0 ? 's' : ''}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">
                              {i === 0 && "Ces résultats sont très intéressants, je suis surpris par la performance du candidat en tête."}
                              {i === 1 && "Je m'attendais à un résultat plus serré. Les chiffres sont éloquents !"}
                              {i === 2 && "Une élection historique qui marque un tournant important."}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-2">Élection à venir</h3>
                <p className="text-muted-foreground">
                  Les résultats seront disponibles après le {formattedDate}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ElectionResultsPage;