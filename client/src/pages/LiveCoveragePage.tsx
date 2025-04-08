import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { LiveCoverage, LiveCoverageUpdate } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Calendar, Clock, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LiveCoveragePage() {
  const [_, params] = useRoute("/suivis-en-direct/:slug");
  const slug = params?.slug;
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 secondes par défaut
  
  // Récupérer les détails du suivi en direct
  const { 
    data: coverage,
    isLoading: coverageLoading,
    isError: coverageError,
    refetch: refetchCoverage
  } = useQuery<LiveCoverage>({
    queryKey: [`/api/live-coverages/${slug}`],
    queryFn: getQueryFn,
    enabled: !!slug,
  });
  
  // Récupérer les mises à jour du suivi en direct
  const { 
    data: updates,
    isLoading: updatesLoading,
    isError: updatesError,
    refetch: refetchUpdates
  } = useQuery<LiveCoverageUpdate[]>({
    queryKey: [`/api/live-coverages/${coverage?.id}/updates`],
    queryFn: getQueryFn,
    enabled: !!coverage?.id,
    refetchInterval: refreshInterval,
  });
  
  // Récupérer les éditeurs du suivi en direct
  const { 
    data: editors,
    isLoading: editorsLoading
  } = useQuery<any[]>({
    queryKey: [`/api/live-coverages/${coverage?.id}/editors`],
    queryFn: getQueryFn,
    enabled: !!coverage?.id,
  });
  
  // Mettre à jour le titre de la page et log des données pour le debug
  useEffect(() => {
    if (coverage) {
      document.title = `${coverage.title} | Politiquensemble`;
      console.log("Coverage data:", coverage);
    }
    return () => {
      document.title = "Politiquensemble";
    };
  }, [coverage]);
  
  useEffect(() => {
    console.log("Updates data:", updates);
  }, [updates]);
  
  useEffect(() => {
    console.log("Editors data:", editors);
  }, [editors]);
  
  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    refetchCoverage();
    refetchUpdates();
  };
  
  // Format de date pour les mises à jour
  const formatUpdateDate = (date: string | Date) => {
    try {
      return format(new Date(date), "d MMMM yyyy à HH:mm", { locale: fr });
    } catch (error) {
      console.error("Date format error:", error);
      return "Date indisponible";
    }
  };
  
  // Si en cours de chargement
  if (coverageLoading) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
        <p className="mt-4 text-muted-foreground">Chargement du suivi en direct...</p>
      </div>
    );
  }
  
  // Si erreur
  if (coverageError || !coverage) {
    return (
      <div className="container mx-auto py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Suivi introuvable</h1>
          <p className="mt-4 text-muted-foreground">
            Le suivi en direct demandé n'existe pas ou n'est plus disponible.
          </p>
          <Button 
            className="mt-8" 
            variant="outline" 
            onClick={() => window.location.assign("/home")}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-medium">
                Suivi en direct
              </Badge>
              {coverage.active ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
              ) : (
                <Badge variant="outline">Terminé</Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.assign("/home")}
            >
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{coverage.title}</h1>
          
          <div className="mt-4 flex items-center text-muted-foreground gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Créé le {formatUpdateDate(coverage.createdAt)}
              </span>
            </div>
            {coverage.endDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(coverage.endDate) < new Date() 
                    ? "Terminé le" 
                    : "Se termine le"} {formatUpdateDate(coverage.endDate)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Image de couverture */}
        {coverage.imageUrl && (
          <div className="mb-10 rounded-xl overflow-hidden shadow-md">
            <img 
              src={coverage.imageUrl} 
              alt={coverage.title} 
              className="w-full h-[300px] object-cover"
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar - Contexte et Éditeurs */}
          <div className="order-2 md:order-1 md:col-span-1">
            {/* Contexte */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contexte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {coverage.context || "Aucun contexte fourni."}
                </p>
              </CardContent>
            </Card>
            
            {/* Éditeurs */}
            <Card>
              <CardHeader>
                <CardTitle>Équipe éditoriale</CardTitle>
                <CardDescription>
                  Les personnes qui couvrent cet événement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editorsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
                  </div>
                ) : editors && Array.isArray(editors) && editors.length > 0 ? (
                  <div className="space-y-4">
                    {editors.map((editor) => (
                      <div key={editor.editorId} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {editor.editor?.avatarUrl ? (
                            <AvatarImage src={editor.editor.avatarUrl} alt={editor.editor.displayName} />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {editor.editor?.displayName.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{editor.editor?.displayName || "Éditeur"}</p>
                          {editor.editor?.title && (
                            <p className="text-xs text-muted-foreground">{editor.editor.title}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">Aucun éditeur assigné.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Options de rafraîchissement */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Rafraîchissement automatique</span>
                <div className="flex gap-2">
                  <Button 
                    variant={refreshInterval === 15000 ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={() => setRefreshInterval(15000)}
                  >
                    15s
                  </Button>
                  <Button 
                    variant={refreshInterval === 30000 ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={() => setRefreshInterval(30000)}
                  >
                    30s
                  </Button>
                  <Button 
                    variant={refreshInterval === 60000 ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={() => setRefreshInterval(60000)}
                  >
                    1min
                  </Button>
                  <Button 
                    variant={refreshInterval === 0 ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={() => setRefreshInterval(0)}
                  >
                    Off
                  </Button>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={handleRefresh}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Rafraîchir maintenant
              </Button>
            </div>
          </div>
          
          {/* Main Content - Mises à jour */}
          <div className="order-1 md:order-2 md:col-span-2">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{coverage.subject}</h2>
                
                {/* Statut de chargement */}
                {updatesLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mise à jour...
                  </div>
                )}
              </div>
              <Separator className="my-4" />
            </div>
            
            {/* Liste des mises à jour */}
            {updatesError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700">Erreur lors du chargement des mises à jour</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => refetchUpdates()}
                >
                  Réessayer
                </Button>
              </div>
            ) : updates && Array.isArray(updates) && updates.length > 0 ? (
              <div className="space-y-8">
                {[...updates].sort((a, b) => {
                    try {
                      // Utiliser timestamp si disponible, sinon createdAt
                      const dateA = a.timestamp || a.createdAt;
                      const dateB = b.timestamp || b.createdAt;
                      return new Date(dateB).getTime() - new Date(dateA).getTime();
                    } catch (error) {
                      return 0;
                    }
                  })
                  .map((update) => (
                    <div key={update.id} className="relative pl-6 border-l-2 border-muted">
                      <div className="absolute left-[-8px] top-0">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                      </div>
                      
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {formatUpdateDate(update.timestamp || update.createdAt)}
                        </span>
                        
                        {update.author && (
                          <>
                            <Separator orientation="vertical" className="h-3" />
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                {update.author.avatarUrl ? (
                                  <AvatarImage src={update.author.avatarUrl} alt={update.author.displayName} />
                                ) : (
                                  <AvatarFallback className="text-[10px]">
                                    {update.author.displayName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <span className="text-xs font-medium">{update.author.displayName}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-2 text-base">
                        <p className="whitespace-pre-wrap">{update.content}</p>
                      </div>
                      
                      {update.imageUrl && (
                        <div className="mt-3 max-w-md">
                          <img 
                            src={update.imageUrl} 
                            alt="Mise à jour" 
                            className="rounded-md w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-muted/30 border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Aucune mise à jour pour le moment</p>
                <p className="text-sm mt-2 text-muted-foreground">
                  Les mises à jour apparaîtront ici dès qu'elles seront publiées
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}