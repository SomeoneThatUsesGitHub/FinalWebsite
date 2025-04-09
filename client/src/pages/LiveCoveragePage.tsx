import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { LiveCoverage, LiveCoverageEditor, LiveCoverageUpdate } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Radio, Clock, AlertTriangle, User as UserIcon, Home, Share2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { fr } from "date-fns/locale";
import { format, formatDistanceToNow } from "date-fns";

export default function LiveCoveragePage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { slug } = params;
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 secondes par défaut
  const [isMenuOpen, setIsMenuOpen] = useState(false); // État pour contrôler l'ouverture/fermeture du menu

  // Récupérer les détails du suivi en direct
  const {
    data: coverage,
    isLoading: isLoadingCoverage,
    error: coverageError,
  } = useQuery<LiveCoverage>({
    queryKey: [`/api/live-coverages/${slug}`],
    refetchInterval: 60000, // Refresh toutes les minutes pour vérifier si le direct est toujours actif
  });

  // Récupérer les éditeurs du suivi en direct
  const {
    data: editors,
    isLoading: isLoadingEditors,
  } = useQuery<(LiveCoverageEditor & { 
    editor?: { displayName: string, title: string | null, avatarUrl: string | null } 
  })[]>({
    queryKey: [`/api/live-coverages/${coverage?.id}/editors`],
    enabled: !!coverage?.id,
  });

  // Récupérer les mises à jour du suivi en direct
  const {
    data: updates,
    isLoading: isLoadingUpdates,
    error: updatesError,
  } = useQuery<(LiveCoverageUpdate & {
    author?: { displayName: string, title: string | null, avatarUrl: string | null }
  })[]>({
    queryKey: [`/api/live-coverages/${coverage?.id}/updates`],
    enabled: !!coverage?.id,
    refetchInterval: refreshInterval,
  });

  // Si le suivi n'est pas actif, rediriger vers la page d'accueil
  useEffect(() => {
    if (coverage && !coverage.active) {
      navigate("/");
    }
  }, [coverage, navigate]);

  // Augmenter la fréquence de rafraîchissement si des mises à jour importantes sont détectées récemment
  useEffect(() => {
    if (updates && updates.length > 0) {
      // Vérifier s'il y a des mises à jour importantes dans les 5 dernières minutes
      const recentImportantUpdates = updates.filter(update => {
        const updateTime = new Date(update.timestamp);
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
        
        return update.important && updateTime > fiveMinutesAgo;
      });
      
      if (recentImportantUpdates.length > 0) {
        setRefreshInterval(10000); // Refresh toutes les 10 secondes si activité importante
      } else {
        setRefreshInterval(30000); // Revenir à 30 secondes sinon
      }
    }
  }, [updates]);

  if (isLoadingCoverage) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  if (coverageError || !coverage) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
        <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Suivi en direct non trouvé</h1>
        <p className="text-muted-foreground mb-6">
          Le suivi en direct que vous recherchez n'existe pas ou n'est plus disponible.
        </p>
        <Button onClick={() => navigate("/")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Bannière principale avec fond sombre et dégradé */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: coverage.imageUrl ? `url(${coverage.imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}></div>
        
        {/* Bouton de retour positionné dans le coin gauche de l'image */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-black/50 text-white border-white/30 hover:bg-black/70 hover:text-white shadow-md" 
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </div>
        
        <div className="container max-w-4xl mx-auto px-4 py-12 sm:py-16 md:py-20 relative z-10">
          <div className="space-y-3 pt-10 sm:pt-4">
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <Badge variant="outline" className="bg-red-600/80 text-white border-0 flex items-center">
                <Radio className="h-3 w-3 mr-1 animate-pulse" /> LIVE EN COURS
              </Badge>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              {coverage.title}
            </h1>
            
            {coverage.subject && (
              <p className="text-lg sm:text-xl mt-2 text-white/80 leading-snug">
                {coverage.subject}
              </p>
            )}
            
            {coverage.context && (
              <p className="text-sm sm:text-base mt-2 max-w-3xl leading-relaxed text-white/70">
                {coverage.context}
              </p>
            )}
            
            {editors && editors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20 text-sm">
                <span className="text-white/70">
                  Live animé par{" "}
                  {editors.length === 1 ? (
                    <span className="font-medium">
                      {editors[0].editor?.displayName || "Éditeur"}
                      {editors[0].role && ` (${editors[0].role})`}
                    </span>
                  ) : (
                    <>
                      <span className="font-medium">
                        {editors[0].editor?.displayName || "Éditeur"}
                        {editors[0].role && ` (${editors[0].role})`}
                      </span>
                      <span> et d'autres personnes</span>
                    </>
                  )}
                </span>
              </div>
            )}
            
            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="rounded-full bg-white/10 hover:bg-white/20 border-white/30 text-white"
                title="Partager"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full bg-white/10 hover:bg-white/20 border-white/30 text-white"
                title="Accueil"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Section des questions des visiteurs - version améliorée */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-background rounded-lg border border-muted/30 shadow-sm">
            <div className="absolute top-0 left-0 w-20 h-20 bg-primary/5 rounded-full -ml-10 -mt-10"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mb-6"></div>
            
            <div className="p-4 relative z-10">
              <h2 className="text-base font-medium mb-2 flex items-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Posez vos questions
              </h2>
              
              <div className="flex gap-2 mb-1">
                <input 
                  type="text" 
                  placeholder="Votre question..." 
                  className="flex-1 px-3 py-1.5 text-sm rounded-md border border-input bg-background/80"
                  disabled
                />
                <Button variant="default" size="sm" className="h-8" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Questions modérées avant publication
              </p>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold flex items-center">
                <Radio className="h-5 w-5 mr-2 text-primary" />
                Dernières mises à jour
              </h2>
              
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-sm px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <span className="font-medium text-primary">Les faits essentiels</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-primary transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-72 bg-white dark:bg-gray-900 border border-border rounded-md shadow-lg overflow-hidden z-50">
                    <div className="p-0">
                      {/* Filtrer les mises à jour importantes */}
                      {(() => {
                        const importantUpdates = updates?.filter(u => u.important) || [];
                        return (
                          <>
                            <div className="bg-red-600 text-white p-2 flex justify-between items-center">
                              <h3 className="font-bold text-sm uppercase">
                                Les faits essentiels ({importantUpdates.length})
                              </h3>
                              <button 
                                className="text-white/80 hover:text-white text-xs"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                Masquer
                              </button>
                            </div>
                            
                            {importantUpdates.length > 0 ? (
                              <ul className="py-1 max-h-60 overflow-auto">
                                {importantUpdates.map(update => (
                                  <li key={update.id} className="hover:bg-muted/50 cursor-pointer">
                                    <button 
                                      className="w-full text-left px-3 py-2 text-sm flex items-start"
                                      onClick={() => {
                                        // Défiler jusqu'à la mise à jour
                                        const element = document.getElementById(`update-${update.id}`);
                                        if (element) {
                                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                          setTimeout(() => {
                                            element.classList.add('highlight-pulse');
                                            setTimeout(() => {
                                              element.classList.remove('highlight-pulse');
                                            }, 2000);
                                          }, 500);
                                        }
                                        setIsMenuOpen(false);
                                      }}
                                    >
                                      <span className="font-bold mr-2 text-black dark:text-white">•</span>
                                      <span>{update.content.split('\n')[0].slice(0, 60)}{update.content.length > 60 ? '...' : ''}</span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="py-3 px-4 text-sm text-muted-foreground text-center">
                                Aucun fait essentiel pour le moment
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {isLoadingUpdates ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="py-6">
                      <div className="flex justify-between items-start mb-4">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : updatesError ? (
              <Card className="border-destructive">
                <CardContent className="py-6">
                  <div className="flex gap-4 items-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <div>
                      <h3 className="font-medium">Erreur de chargement</h3>
                      <p className="text-sm text-muted-foreground">
                        Impossible de charger les mises à jour. Veuillez rafraîchir la page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : updates && updates.length > 0 ? (
              <div className="space-y-4">
                {updates.map((update) => {
                  const updateTime = new Date(update.timestamp);
                  const timeAgo = formatDistanceToNow(updateTime, { addSuffix: true, locale: fr });
                  const formattedTime = format(updateTime, "HH:mm", { locale: fr });
                  
                  return (
                    <Card 
                      key={update.id} 
                      id={`update-${update.id}`}
                      className={`transition-all duration-300 ${update.important ? "border-primary" : ""}`}
                    >
                      <CardContent className="py-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            {update.important && (
                              <Badge className="bg-primary">Important</Badge>
                            )}
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              <span title={formatDate(update.timestamp)}>
                                {formattedTime} ({timeAgo})
                              </span>
                            </div>
                          </div>
                          {update.author && (
                            <div className="flex items-center gap-2">
                              <div className="text-right text-sm">
                                <span className="font-medium">{update.author.displayName}</span>
                                {update.author.title && (
                                  <div className="text-xs text-muted-foreground">
                                    {update.author.title}
                                  </div>
                                )}
                              </div>
                              <Avatar className="h-8 w-8">
                                {update.author.avatarUrl ? (
                                  <AvatarImage src={update.author.avatarUrl} alt={update.author.displayName} />
                                ) : (
                                  <AvatarFallback>{update.author.displayName.charAt(0)}</AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                          )}
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-base whitespace-pre-line">{update.content}</p>
                          {update.imageUrl && (
                            <div className="mt-4">
                              <img 
                                src={update.imageUrl} 
                                alt="Mise à jour"
                                className="rounded-md max-h-80 object-contain" 
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Aucune mise à jour pour le moment</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    Les premières mises à jour seront publiées dès que l'événement commencera.
                    Revenez un peu plus tard.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}