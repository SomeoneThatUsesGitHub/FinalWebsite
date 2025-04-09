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
                  {editors.map((editor, index) => (
                    <React.Fragment key={editor.id}>
                      {index > 0 && index === editors.length - 1 ? " et " : index > 0 ? ", " : ""}
                      <span className="font-medium">{editor.editor?.displayName || "Éditeur"}</span>
                      {editor.role && ` (${editor.role})`}
                    </React.Fragment>
                  ))}
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
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Section de l'équipe éditoriale - toujours affichée même si vide */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-primary" />
              Équipe éditoriale
            </h2>
            {editors && editors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {editors.map((editor) => (
                  <div key={editor.id} className="flex items-center gap-3 bg-background p-3 rounded-lg shadow-sm">
                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                      {editor.editor?.avatarUrl ? (
                        <AvatarImage src={editor.editor.avatarUrl} alt={editor.editor.displayName} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {editor.editor?.displayName?.charAt(0) || "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium">{editor.editor?.displayName || "Éditeur"}</div>
                      {editor.role && (
                        <div className="text-xs text-muted-foreground">{editor.role}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-background/50 rounded-lg">
                <UserIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Ce direct est animé par les journalistes de Politiquensemble.
                </p>
              </div>
            )}
          </div>
          
          {/* Section des questions des visiteurs */}
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Posez vos questions
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Avez-vous des questions sur cet événement ? Les journalistes tenteront d'y répondre en direct.
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Votre question..." 
                  className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background"
                  disabled
                />
                <Button variant="default" size="sm" disabled>
                  Envoyer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Les questions sont modérées avant publication. Veuillez rester courtois.
              </p>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center">
              <Radio className="h-5 w-5 mr-2 text-primary" />
              Dernières mises à jour
            </h2>
            
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
                    <Card key={update.id} className={update.important ? "border-primary" : undefined}>
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