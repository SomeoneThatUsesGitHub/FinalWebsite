import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { LiveCoverage, LiveCoverageEditor, LiveCoverageUpdate, LiveCoverageQuestion } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Radio, Clock, AlertTriangle, User as UserIcon, Home, Share2, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { fr } from "date-fns/locale";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Extension du type LiveCoverageUpdate pour inclure les données de la question associée
interface LiveCoverageUpdateWithQuestion extends LiveCoverageUpdate {
  questionContent?: string;
  questionUsername?: string;
}

export default function LiveCoveragePage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { slug } = params;
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 secondes par défaut
  const [isMenuOpen, setIsMenuOpen] = useState(false); // État pour contrôler l'ouverture/fermeture du menu
  const [isEditorListOpen, setIsEditorListOpen] = useState(false); // État pour contrôler l'affichage de la liste des éditeurs
  const [questionText, setQuestionText] = useState("");
  const [username, setUsername] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { toast } = useToast();

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
  } = useQuery<(LiveCoverageUpdateWithQuestion & {
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

  // Définir la mutation pour soumettre une question
  const submitQuestionMutation = useMutation({
    mutationFn: async ({ username, content }: { username: string, content: string }) => {
      try {
        const res = await apiRequest("POST", `/api/live-coverages/${coverage?.id}/questions`, {
          username,
          content
        });
        
        // Vérifier si la réponse est OK
        if (!res.ok) {
          try {
            // Essayer de parser comme JSON d'abord
            const errorData = await res.json();
            throw new Error(errorData.message || "Erreur lors de l'envoi de la question");
          } catch (jsonError) {
            // Si ce n'est pas du JSON, utiliser le texte ou un message par défaut
            const errorText = await res.text();
            throw new Error("Erreur lors de l'envoi de la question");
          }
        }
        
        // Pour éviter les erreurs de parsing JSON, vérifions le Content-Type
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await res.json();
        } else {
          // Si la réponse n'est pas du JSON, retourner un objet simple
          return { success: true };
        }
      } catch (err) {
        console.error("Erreur lors de la soumission de la question:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("Question soumise avec succès:", data);
      setQuestionText("");
      setUsername("");
      setShowSuccessMessage(true);
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      toast({
        title: "Question envoyée",
        description: "Votre question a été soumise et sera publiée après modération.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Erreur dans la mutation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre question. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  });

  // Fonction pour soumettre une question
  const handleSubmitQuestion = () => {
    if (!questionText.trim() || !username.trim() || !coverage?.id) return;
    
    submitQuestionMutation.mutate({
      username: username.trim(),
      content: questionText.trim()
    });
  };

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
    <div className="min-h-screen bg-muted/20 relative">
      <div className="absolute inset-0 pointer-events-none opacity-5 pattern-grid"></div>
      {/* Bannière principale avec fond sombre et dégradé */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        {coverage.imageUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={coverage.imageUrl} 
              alt={coverage.title} 
              className="w-full h-full object-cover opacity-40"
              style={{ objectPosition: '50% 25%' }} 
            />
            <div className="absolute inset-0 bg-gray-900/60 mix-blend-overlay"></div>
          </div>
        ) : null}
        
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
        
        <div className="container max-w-4xl mx-auto px-4 py-16 sm:py-24 md:py-28 relative z-10">
          <div className="space-y-4 pt-10 sm:pt-4">
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <Badge variant="outline" className="bg-red-600/80 text-white border-0 flex items-center">
                <Radio className="h-3 w-3 mr-1 animate-pulse" /> LIVE EN COURS
              </Badge>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              {coverage.title}
            </h1>
            
            {coverage.subject && (
              <p className="text-lg sm:text-xl mt-2 mb-2 text-white/80 leading-snug">
                {coverage.subject}
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
                      <button 
                        onClick={() => setIsEditorListOpen(!isEditorListOpen)}
                        className="text-white/80 hover:text-white underline ml-1 focus:outline-none focus:ring-1 focus:ring-white/30 rounded-sm"
                      >
                        et d'autres personnes
                      </button>
                      
                      {/* Liste déroulante des éditeurs */}
                      {isEditorListOpen && (
                        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-md shadow-lg overflow-hidden z-50 p-2 w-72">
                          <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2 px-3">
                            <h4 className="font-semibold text-white">Équipe éditoriale</h4>
                            <button 
                              onClick={() => setIsEditorListOpen(false)}
                              className="text-white/70 hover:text-white"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="py-1 text-sm text-white">
                            <ul className="max-h-60 overflow-auto">
                              {editors.map(editor => (
                                <li key={editor.id} className="px-3 py-2 hover:bg-white/10 rounded flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    {editor.editor?.avatarUrl ? (
                                      <AvatarImage src={editor.editor.avatarUrl} alt={editor.editor?.displayName || "Éditeur"} />
                                    ) : (
                                      <AvatarFallback>{(editor.editor?.displayName || "E")[0]}</AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <span className="font-medium">{editor.editor?.displayName || "Éditeur"}</span>
                                    {editor.role && <span className="text-white/60 text-xs block">{editor.role}</span>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
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
      
      <div className="container max-w-4xl mx-auto px-4 py-6 mb-12">
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
              
              {showSuccessMessage ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-md p-3 mb-3 text-sm text-green-800 dark:text-green-400">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Question envoyée ! Elle sera examinée par nos modérateurs.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-2">
                    <input 
                      type="text" 
                      placeholder="Votre nom..." 
                      className="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background/80 mb-2"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 mb-1">
                    <input 
                      type="text" 
                      placeholder="Votre question..." 
                      className="flex-1 px-3 py-1.5 text-sm rounded-md border border-input bg-background/80"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitQuestion();
                        }
                      }}
                    />
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="h-8"
                      onClick={handleSubmitQuestion}
                      disabled={submitQuestionMutation.isPending || !questionText.trim() || !username.trim()}
                    >
                      {submitQuestionMutation.isPending ? (
                        <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
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
                        // Limiter à 3 faits essentiels, triés par date (les plus récents)
                        const importantUpdates = updates
                          ?.filter(u => u.important)
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .slice(0, 3) || [];
                          
                        return (
                          <>
                            <div className="bg-red-600 text-white p-2 flex justify-between items-center">
                              <h3 className="font-bold text-sm uppercase">
                                Les faits essentiels {importantUpdates.length > 0 && `(${importantUpdates.length})`}
                              </h3>
                              <button 
                                className="text-white/80 hover:text-white text-xs"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                Masquer
                              </button>
                            </div>
                            
                            {importantUpdates.length > 0 ? (
                              <ul className="py-1 overflow-auto">
                                {importantUpdates.map(update => {
                                  // Extraire la première ligne ou les 60 premiers caractères
                                  const firstLine = update.content.split('\n')[0];
                                  const title = firstLine.length > 60 ? 
                                    firstLine.slice(0, 60) + '...' : 
                                    firstLine;
                                    
                                  return (
                                    <li key={update.id} className="hover:bg-muted/50 cursor-pointer border-b border-muted/30 last:border-0">
                                      <button 
                                        className="w-full text-left px-3 py-3 text-sm flex items-start group"
                                        onClick={() => {
                                          // Défiler jusqu'à la mise à jour
                                          const element = document.getElementById(`update-${update.id}`);
                                          if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            setTimeout(() => {
                                              // Utiliser l'animation adaptée selon que l'update est importante ou non
                                              if (update.important) {
                                                element.classList.add('important-pulse');
                                                setTimeout(() => {
                                                  element.classList.remove('important-pulse');
                                                }, 2500);
                                              } else {
                                                element.classList.add('highlight-pulse');
                                                setTimeout(() => {
                                                  element.classList.remove('highlight-pulse');
                                                }, 2000);
                                              }
                                            }, 500);
                                          }
                                          setIsMenuOpen(false);
                                        }}
                                      >
                                        <span className="font-bold mr-2 text-red-600 dark:text-red-500 text-lg leading-none">•</span>
                                        <div className="flex-1">
                                          <span className="font-medium leading-tight block group-hover:text-primary transition-colors">{title}</span>
                                          <span className="text-xs text-muted-foreground block mt-1">
                                            {format(new Date(update.timestamp), "d MMMM à HH:mm", { locale: fr })}
                                          </span>
                                        </div>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <div className="py-4 px-4 text-sm text-muted-foreground text-center">
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
              <div className="space-y-6">
                {updates.map((update, index) => {
                  const updateTime = new Date(update.timestamp);
                  const timeAgo = formatDistanceToNow(updateTime, { addSuffix: true, locale: fr });
                  const formattedTime = format(updateTime, "HH:mm", { locale: fr });
                  
                  return (
                    <div 
                      key={update.id} 
                      id={`update-${update.id}`}
                      className="transition-all duration-300"
                    >
                      <Card className={`overflow-hidden shadow-md hover:shadow-lg border-border ${update.important ? "border-red-500 border-l-4" : "border-l-4 border-l-border"}`}>
                        <CardContent className="p-0">
                          {/* En-tête de la mise à jour */}
                          <div className={`p-3 md:p-4 flex justify-between items-start gap-2 border-b ${update.important ? "bg-red-50 dark:bg-red-900/10" : "bg-muted/30"}`}>
                            <div className="flex items-center gap-2">
                              {update.important && (
                                <Badge className="bg-red-500">Important</Badge>
                              )}
                              {update.isAnswer && (
                                <Badge className="bg-blue-500">Réponse</Badge>
                              )}
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span title={formatDate(update.timestamp)}>
                                  {formattedTime} <span className="hidden sm:inline">({timeAgo})</span>
                                </span>
                              </div>
                            </div>
                            
                            {update.author && (
                              <div className="flex items-center gap-2">
                                <div className="text-right text-sm">
                                  <span className="font-medium">{update.author.displayName}</span>
                                  {update.author.title && (
                                    <div className="text-xs text-muted-foreground hidden sm:block">
                                      {update.author.title}
                                    </div>
                                  )}
                                </div>
                                <Avatar className="h-6 w-6 md:h-8 md:w-8">
                                  {update.author.avatarUrl ? (
                                    <AvatarImage src={update.author.avatarUrl} alt={update.author.displayName} />
                                  ) : (
                                    <AvatarFallback>{update.author.displayName.charAt(0)}</AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                            )}
                          </div>
                          
                          {/* Contenu de la mise à jour */}
                          <div className="p-4 md:p-5 prose prose-sm dark:prose-invert max-w-none">
                            {update.isAnswer && update.questionContent && (
                              <div className="mb-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-md border-l-4 border-blue-500">
                                <p className="text-sm text-muted-foreground mb-1">Question de {update.questionUsername || "Visiteur"} :</p>
                                <p className="text-sm font-medium">{update.questionContent}</p>
                              </div>
                            )}
                            <p className="text-sm md:text-base whitespace-pre-line">{update.content}</p>
                            {update.imageUrl && (
                              <div className="mt-4">
                                <img 
                                  src={update.imageUrl} 
                                  alt="Mise à jour"
                                  className="rounded-md w-full object-cover h-auto max-h-[300px]" 
                                />
                              </div>
                            )}
                            {update.youtubeUrl && (
                              <div className="mt-4 w-full max-w-2xl mx-auto">
                                <div className="aspect-video">
                                  <iframe
                                    className="w-full h-full rounded-md"
                                    src={update.youtubeUrl.replace("watch?v=", "embed/")}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              </div>
                            )}
                            {update.articleId && (
                              <Card className="mt-4 overflow-hidden border shadow-sm hover:shadow rounded-xl transition-shadow duration-200">
                                <div className="flex flex-col sm:flex-row">
                                  <div className="sm:w-1/3 bg-muted">
                                    <div className="h-32 sm:h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                      {update.imageUrl ? (
                                        <img 
                                          src={update.imageUrl} 
                                          alt="Illustration article" 
                                          className="h-full w-full object-cover" 
                                        />
                                      ) : (
                                        <UserIcon className="h-12 w-12 text-muted-foreground/40" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="sm:w-2/3 p-4">
                                    <h3 className="text-lg font-semibold line-clamp-2">Jordan Bardella, Président en 2027 ?</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                                      Le 31 mars, le monde politique français est chamboulé par la décision clé du tribunal correctionnel de Paris : Marine Le Pen est reconnue coupable de détournements de...
                                    </p>
                                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                      <div className="flex items-center">
                                        <Clock className="mr-1 h-3 w-3" />
                                        <span>Publié le 08 avr. 2025</span>
                                      </div>
                                      <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span>Lecture 3 min.</span>
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      <Button
                                        variant="link"
                                        className="p-0 h-auto text-primary font-semibold"
                                        asChild
                                      >
                                        <a href={`/articles/${update.articleId}`} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">
                                          Lire l'article complet
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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