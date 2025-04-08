import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { LiveCoverage } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, ArrowRight, Activity, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function LiveCoveragesList() {
  const [_, setLocation] = useLocation();
  
  // Récupérer tous les suivis en direct actifs
  const { data: coverages, isLoading, isError } = useQuery<LiveCoverage[]>({
    queryKey: ["/api/live-coverages"],
    queryFn: getQueryFn,
  });
  
  // Format de date
  const formatUpdateDate = (date: string | Date) => {
    return format(new Date(date), "d MMMM yyyy", { locale: fr });
  };
  
  // Si en cours de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
        <p className="mt-4 text-muted-foreground">Chargement des suivis en direct...</p>
      </div>
    );
  }
  
  // Si erreur
  if (isError) {
    return (
      <div className="container mx-auto py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Erreur de chargement</h1>
          <p className="mt-4 text-muted-foreground">
            Une erreur est survenue lors du chargement des suivis en direct.
          </p>
        </div>
      </div>
    );
  }
  
  // Si aucun suivi actif
  if (!coverages || coverages.length === 0) {
    return (
      <div className="container mx-auto py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Aucun suivi en direct</h1>
          <p className="mt-4 text-muted-foreground">
            Il n'y a actuellement aucun suivi en direct disponible.
          </p>
        </div>
      </div>
    );
  }
  
  // Trier les suivis: d'abord les actifs, puis par date de création décroissante
  const sortedCoverages = coverages && Array.isArray(coverages) ? [...coverages].sort((a, b) => {
    // D'abord trier par statut actif
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    
    // Ensuite par date de création (le plus récent d'abord)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) : [];
  
  // Filtrer les suivis actifs et inactifs
  const activeCoverages = sortedCoverages.filter(coverage => coverage.active);
  const inactiveCoverages = sortedCoverages.filter(coverage => !coverage.active);
  
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full mb-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Suivis en direct</h1>
          </div>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Retrouvez l'actualité politique et les événements importants en temps réel
          </p>
        </div>
        
        {/* Suivis actifs */}
        {activeCoverages.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">En cours</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCoverages.map((coverage) => (
                <Card 
                  key={coverage.id} 
                  className="flex flex-col h-full overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => setLocation(`/suivis-en-direct/${coverage.slug}`)}
                >
                  <div className="relative">
                    {coverage.imageUrl ? (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={coverage.imageUrl} 
                          alt={coverage.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary text-white hover:bg-primary/90 shadow-sm">En direct</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
                        <Activity className="h-12 w-12 text-primary/50" />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary text-white hover:bg-primary/90 shadow-sm">En direct</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{coverage.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {coverage.subject}
                    </p>
                    
                    <p className="text-xs flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Depuis le {formatUpdateDate(coverage.createdAt)}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full group" 
                    >
                      <span className="group-hover:translate-x-1 transition-transform">Suivre en direct</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Suivis inactifs (archivés) */}
        {inactiveCoverages.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold">Suivis archivés</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveCoverages.map((coverage) => (
                <Card 
                  key={coverage.id} 
                  className="flex flex-col h-full overflow-hidden shadow-sm hover:shadow transition-all duration-300"
                  onClick={() => setLocation(`/suivis-en-direct/${coverage.slug}`)}
                >
                  <div className="relative">
                    {coverage.imageUrl ? (
                      <div className="aspect-video w-full overflow-hidden grayscale">
                        <img 
                          src={coverage.imageUrl} 
                          alt={coverage.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="outline" className="bg-muted/80 backdrop-blur-sm">Terminé</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-muted/20 flex items-center justify-center grayscale">
                        <Activity className="h-12 w-12 text-muted-foreground/30" />
                        <div className="absolute top-3 left-3">
                          <Badge variant="outline" className="bg-muted/80 backdrop-blur-sm">Terminé</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{coverage.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {coverage.subject}
                    </p>
                    
                    <div className="flex flex-col gap-1">
                      <p className="text-xs flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Du {formatUpdateDate(coverage.createdAt)}
                      </p>
                      {coverage.endDate && (
                        <p className="text-xs flex items-center gap-2 text-muted-foreground pl-5">
                          au {formatUpdateDate(coverage.endDate)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline"
                      className="w-full group" 
                    >
                      <span className="group-hover:translate-x-1 transition-transform">Voir le récapitulatif</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}