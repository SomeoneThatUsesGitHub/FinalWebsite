import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search, BookOpen, Award, TrendingUp, BarChart2, Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/hooks/use-auth";

// Types pour notre module d'apprentissage
interface LearningTopic {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  category: string;
  difficulty: "débutant" | "intermédiaire" | "avancé";
  estimatedTime: number; // en minutes
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

interface UserProgress {
  topicId: number;
  moduleId: number;
  contentCount: number;
  completedCount: number;
  averageScore: number;
  lastInteraction: string;
}

export default function LearnPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("popular");

  // Récupérer tous les sujets d'apprentissage
  const { 
    data: topics = [], 
    isLoading: isLoadingTopics,
    error: topicsError
  } = useQuery<LearningTopic[]>({
    queryKey: ["/api/learning/topics", { search: searchQuery, category: selectedCategory }],
    queryFn: async () => {
      let url = "/api/learning/topics";
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors de la récupération des sujets d'apprentissage");
      return await response.json();
    },
  });

  // Récupérer la progression de l'utilisateur s'il est connecté
  const {
    data: userProgress = [],
    isLoading: isLoadingProgress,
  } = useQuery<UserProgress[]>({
    queryKey: ["/api/learning/user/progress"],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch("/api/learning/user/progress");
      if (!response.ok) throw new Error("Erreur lors de la récupération de la progression");
      return await response.json();
    },
    enabled: !!user,
  });

  // Filtrer et trier les sujets selon l'onglet actif
  const filteredTopics = () => {
    let result = [...topics];
    
    // Filtrer par catégorie si sélectionnée
    if (selectedCategory) {
      result = result.filter(topic => topic.category === selectedCategory);
    }
    
    // Filtrer par recherche si présente
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        topic => 
          topic.title.toLowerCase().includes(query) || 
          topic.description.toLowerCase().includes(query)
      );
    }
    
    // Trier selon l'onglet actif
    switch (activeTab) {
      case "popular":
        return result.sort((a, b) => b.popularity - a.popularity);
      case "newest":
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "inProgress":
        if (userProgress.length > 0) {
          // Trier par dernière interaction
          const topicsInProgress = result.filter(topic => 
            userProgress.some(progress => progress.topicId === topic.id)
          );
          return topicsInProgress.sort((a, b) => {
            const progressA = userProgress.find(p => p.topicId === a.id);
            const progressB = userProgress.find(p => p.topicId === b.id);
            if (!progressA || !progressB) return 0;
            return new Date(progressB.lastInteraction).getTime() - new Date(progressA.lastInteraction).getTime();
          });
        }
        return [];
      default:
        return result;
    }
  };

  // Obtenir les catégories uniques des sujets
  const categories = Array.from(new Set(topics.map(topic => topic.category)));

  // Calculer la progression pour un sujet
  const getTopicProgress = (topicId: number) => {
    const progress = userProgress.find(p => p.topicId === topicId);
    if (!progress) return 0;
    return progress.completedCount > 0 
      ? Math.round((progress.completedCount / progress.contentCount) * 100) 
      : 0;
  };

  // Afficher un message d'erreur si la récupération des sujets a échoué
  useEffect(() => {
    if (topicsError) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les sujets d'apprentissage. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  }, [topicsError, toast]);

  // Obtenir un label pour la difficulté
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "débutant":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Débutant</Badge>;
      case "intermédiaire":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Intermédiaire</Badge>;
      case "avancé":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50">Avancé</Badge>;
      default:
        return <Badge variant="outline">Non défini</Badge>;
    }
  };

  return (
    <div className="container py-8 max-w-screen-xl mx-auto px-4 md:px-6">
      <PageHeader
        title="Espace d'apprentissage"
        description="Découvrez nos parcours d'apprentissage pour comprendre les institutions, les élections et les concepts politiques."
      />

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 mt-8">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher un sujet..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Tous
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs pour filtrer les sujets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Populaires</span>
          </TabsTrigger>
          <TabsTrigger value="newest" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Récents</span>
          </TabsTrigger>
          {user && (
            <TabsTrigger value="inProgress" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>En cours</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="popular" className="mt-0">
          <TopicsList 
            topics={filteredTopics()} 
            isLoading={isLoadingTopics}
            getTopicProgress={getTopicProgress}
            getDifficultyLabel={getDifficultyLabel}
            userProgress={userProgress}
            user={user}
          />
        </TabsContent>

        <TabsContent value="newest" className="mt-0">
          <TopicsList 
            topics={filteredTopics()} 
            isLoading={isLoadingTopics}
            getTopicProgress={getTopicProgress}
            getDifficultyLabel={getDifficultyLabel}
            userProgress={userProgress}
            user={user}
          />
        </TabsContent>

        <TabsContent value="inProgress" className="mt-0">
          {user ? (
            <TopicsList 
              topics={filteredTopics()} 
              isLoading={isLoadingTopics || isLoadingProgress}
              getTopicProgress={getTopicProgress}
              getDifficultyLabel={getDifficultyLabel}
              userProgress={userProgress}
              user={user}
              emptyMessage="Vous n'avez pas encore commencé de parcours d'apprentissage."
            />
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Connectez-vous pour suivre votre progression</h3>
              <p className="text-muted-foreground mb-4">
                La connexion vous permet de suivre votre progression et de reprendre où vous en étiez.
              </p>
              <Link href="/auth">
                <Button>Se connecter</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Composant pour la liste des sujets
function TopicsList({ 
  topics, 
  isLoading,
  getTopicProgress,
  getDifficultyLabel,
  userProgress,
  user,
  emptyMessage = "Aucun sujet d'apprentissage disponible pour le moment."
}: { 
  topics: LearningTopic[], 
  isLoading: boolean,
  getTopicProgress: (topicId: number) => number,
  getDifficultyLabel: (difficulty: string) => JSX.Element,
  userProgress: UserProgress[],
  user: any,
  emptyMessage?: string
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <Link key={topic.id} href={`/apprendre/${topic.slug}`}>
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border border-border">
            <CardHeader className="p-0">
              <div 
                className="h-40 w-full bg-cover bg-center rounded-t-lg" 
                style={{ backgroundImage: `url(${topic.imageUrl})` }}
              />
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary">{topic.category}</Badge>
                {getDifficultyLabel(topic.difficulty)}
              </div>
              <CardTitle className="text-xl mb-2">{topic.title}</CardTitle>
              <CardDescription className="line-clamp-2 h-10">{topic.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex flex-col p-4 pt-0 gap-2">
              <div className="flex items-center w-full text-sm text-muted-foreground">
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {topic.estimatedTime} minutes
                </span>
              </div>
              
              {user && userProgress.some(p => p.topicId === topic.id) && (
                <div className="w-full mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progression</span>
                    <span>{getTopicProgress(topic.id)}%</span>
                  </div>
                  <Progress value={getTopicProgress(topic.id)} className="h-2" />
                </div>
              )}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}