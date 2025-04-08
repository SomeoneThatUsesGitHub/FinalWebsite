import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { LiveCoverage } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, ArrowRight, Activity } from "lucide-react";
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
          <h1 className="text-4xl font-bold tracking-tight">Suivis en direct</h1>
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
                <Card key={coverage.id} className="flex flex-col h-full overflow-hidden">
                  {coverage.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={coverage.imageUrl} 
                        alt={coverage.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">En direct</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{coverage.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {coverage.subject}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      Depuis le {formatUpdateDate(coverage.createdAt)}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full" 
                      onClick={() => setLocation(`/suivis-en-direct/${coverage.slug}`)}
                    >
                      Suivre en direct
                      <ArrowRight className="ml-2 h-4 w-4" />
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
                <Card key={coverage.id} className="flex flex-col h-full overflow-hidden border-muted/50 bg-muted/10">
                  {coverage.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden grayscale">
                      <img 
                        src={coverage.imageUrl} 
                        alt={coverage.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <Badge variant="outline">Terminé</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{coverage.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {coverage.subject}
                    </p>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>Du {formatUpdateDate(coverage.createdAt)}</p>
                      {coverage.endDate && (
                        <p className="mt-1">au {formatUpdateDate(coverage.endDate)}</p>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline"
                      className="w-full" 
                      onClick={() => setLocation(`/suivis-en-direct/${coverage.slug}`)}
                    >
                      Voir le récapitulatif
                      <ArrowRight className="ml-2 h-4 w-4" />
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