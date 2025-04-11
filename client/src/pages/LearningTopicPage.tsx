import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle, Clock, Award, ArrowLeft, MoveLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Type pour les données de cette page
interface LearningTopic {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  category: string;
  difficulty: "débutant" | "intermédiaire" | "avancé";
  estimatedTime: number;
  createdAt: string;
  published: boolean;
  authorId: number;
  popularity: number;
}

interface LearningModule {
  id: number;
  title: string;
  description: string;
  topicId: number;
  order: number;
  imageUrl: string | null;
}

interface LearningContent {
  id: number;
  title: string;
  description: string;
  content: string;
  type: "text" | "quiz" | "video" | "exercise";
  duration: number;
  moduleId: number;
  order: number;
}

interface UserProgress {
  contentId: number;
  completed: boolean;
  score: number | null;
  completedAt: string;
}

export default function LearningTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeContentId, setActiveContentId] = useState<number | null>(null);

  // Récupérer les données du sujet et ses modules
  const { 
    data: topicData,
    isLoading: isLoadingTopic,
    error: topicError
  } = useQuery({
    queryKey: [`/api/learning/topics/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/learning/topics/${slug}`);
      if (!response.ok) throw new Error("Erreur lors de la récupération du sujet d'apprentissage");
      return await response.json();
    },
  });

  // Récupérer les contenus du module actif
  const {
    data: contents = [],
    isLoading: isLoadingContents,
  } = useQuery<LearningContent[]>({
    queryKey: [`/api/learning/modules/${activeModuleId}/contents`],
    queryFn: async () => {
      if (!activeModuleId) return [];
      const response = await fetch(`/api/learning/modules/${activeModuleId}/contents`);
      if (!response.ok) throw new Error("Erreur lors de la récupération des contenus");
      return await response.json();
    },
    enabled: !!activeModuleId,
  });

  // Récupérer la progression de l'utilisateur
  const {
    data: userProgress = [],
    isLoading: isLoadingProgress,
  } = useQuery<UserProgress[]>({
    queryKey: [`/api/learning/user/progress`, { topicId: topicData?.topic?.id }],
    queryFn: async () => {
      if (!user || !topicData?.topic?.id) return [];
      const response = await fetch(`/api/learning/user/progress?topicId=${topicData.topic.id}`);
      if (!response.ok) throw new Error("Erreur lors de la récupération de la progression");
      return await response.json();
    },
    enabled: !!user && !!topicData?.topic?.id,
  });

  // Définir le module actif dès que les données sont disponibles
  useEffect(() => {
    if (topicData?.modules && topicData.modules.length > 0 && !activeModuleId) {
      setActiveModuleId(topicData.modules[0].id);
    }
  }, [topicData, activeModuleId]);

  // Définir le contenu actif dès que les contenus sont disponibles
  useEffect(() => {
    if (contents && contents.length > 0 && !activeContentId) {
      setActiveContentId(contents[0].id);
    }
  }, [contents, activeContentId]);

  // Afficher un message d'erreur si la récupération des données a échoué
  useEffect(() => {
    if (topicError) {
      toast({
        title: "Erreur",
        description: "Impossible de charger ce sujet d'apprentissage. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  }, [topicError, toast]);

  // Calculer la progression globale pour un module
  const getModuleProgress = (moduleId: number) => {
    if (!userProgress.length) return 0;
    
    const moduleContents = contents.filter(content => content.moduleId === moduleId);
    if (!moduleContents.length) return 0;
    
    const completedContents = moduleContents.filter(content => 
      userProgress.some(progress => progress.contentId === content.id && progress.completed)
    );
    
    return Math.round((completedContents.length / moduleContents.length) * 100);
  };

  // Vérifier si un contenu est complété
  const isContentCompleted = (contentId: number) => {
    return userProgress.some(progress => progress.contentId === contentId && progress.completed);
  };

  // Récupérer le score d'un contenu
  const getContentScore = (contentId: number) => {
    const progress = userProgress.find(p => p.contentId === contentId);
    return progress?.score || 0;
  };

  // Obtenir un label de difficulté
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "débutant":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            <BookOpen className="mr-1 h-3 w-3" />
            Débutant
          </Badge>
        );
      case "intermédiaire":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            <BookOpen className="mr-1 h-3 w-3" />
            Intermédiaire
          </Badge>
        );
      case "avancé":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50">
            <BookOpen className="mr-1 h-3 w-3" />
            Avancé
          </Badge>
        );
      default:
        return <Badge variant="outline">Non défini</Badge>;
    }
  };

  // Composant pour afficher le contenu actif
  const ContentDisplay = ({ content }: { content: LearningContent }) => {
    if (!content) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{content.title}</CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm text-muted-foreground">{content.duration} minutes</span>
          </div>
          {user && isContentCompleted(content.id) ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-muted-foreground">Complété</span>
              {content.type === "quiz" && getContentScore(content.id) > 0 && (
                <span className="ml-2 text-sm">Score: {getContentScore(content.id)}%</span>
              )}
            </div>
          ) : (
            user ? (
              <Button
                onClick={() => markContentCompleted(content.id)}
                variant="outline"
                size="sm"
              >
                Marquer comme terminé
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/auth")}
              >
                Se connecter pour suivre
              </Button>
            )
          )}
        </CardFooter>
      </Card>
    );
  };

  // Fonction pour marquer un contenu comme complété
  const markContentCompleted = async (contentId: number) => {
    if (!user) return;

    try {
      const response = await fetch("/api/learning/user/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          score: 100, // Valeur par défaut pour les contenus sans quiz
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la progression");
      }

      // Invalider la requête pour forcer un rafraîchissement des données
      // TanStack Query v5 nécessite d'utiliser queryClient, mais comme nous n'avons pas accès à queryClient ici,
      // nous allons simplement rafraîchir la page
      window.location.reload();

      toast({
        title: "Progression mise à jour",
        description: "Votre progression a été enregistrée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre progression. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingTopic) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!topicData || !topicData.topic) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sujet non trouvé</h2>
          <p className="text-muted-foreground mb-6">
            Le sujet d'apprentissage que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => setLocation("/apprendre")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux sujets
          </Button>
        </div>
      </div>
    );
  }

  const { topic, modules } = topicData;
  const activeModule = modules.find((m: any) => m.id === activeModuleId) || modules[0];
  const activeContent = contents.find(c => c.id === activeContentId);

  return (
    <div>
      <div className="bg-blue-50 py-12 md:py-20 shadow-md mb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Button 
              variant="outline" 
              size="sm"
              className="mb-4"
              onClick={() => setLocation("/apprendre")}
            >
              <MoveLeft className="mr-1 h-4 w-4" />
              Retour aux sujets
            </Button>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 relative">
              {topic.title}
            </h1>
            <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full"></div>
            <p className="mt-4 text-lg text-gray-600">
              {topic.description}
            </p>
            <div className="flex justify-center items-center mt-4 gap-2">
              {getDifficultyLabel(topic.difficulty)}
              <Badge variant="secondary">{topic.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground ml-2">
                <Clock className="h-4 w-4 mr-1" />
                {topic.estimatedTime} minutes
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 mb-24">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar gauche - Liste des modules */}
          <div className="w-full lg:w-1/4">
            <div className="sticky top-4">
              <h3 className="text-lg font-medium mb-3">Modules</h3>
              <div className="space-y-3">
                {modules.map((module: any) => (
                  <Card 
                    key={module.id} 
                    className={`hover:border-primary transition-colors cursor-pointer ${
                      activeModuleId === module.id ? "border-primary" : ""
                    }`}
                    onClick={() => setActiveModuleId(module.id)}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">{module.title}</CardTitle>
                    </CardHeader>
                    {user && (
                      <CardFooter className="p-3 pt-0 flex-col items-start">
                        <div className="w-full flex justify-between text-xs mb-1">
                          <span>Progression</span>
                          <span>{getModuleProgress(module.id)}%</span>
                        </div>
                        <Progress value={getModuleProgress(module.id)} className="h-2 w-full" />
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="w-full lg:w-3/4">
            <Card>
              <CardHeader>
                <CardTitle>{activeModule?.title}</CardTitle>
                <CardDescription>{activeModule?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingContents ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : contents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Aucun contenu disponible pour ce module.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Liste des contenus du module */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {contents.map((content) => (
                        <Button
                          key={content.id}
                          variant={activeContentId === content.id ? "default" : "outline"}
                          size="sm"
                          className={`${
                            isContentCompleted(content.id) ? "border-green-500" : ""
                          }`}
                          onClick={() => setActiveContentId(content.id)}
                        >
                          {isContentCompleted(content.id) && (
                            <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                          )}
                          {content.title}
                        </Button>
                      ))}
                    </div>

                    {/* Affichage du contenu actif */}
                    {activeContent && <ContentDisplay content={activeContent} />}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}