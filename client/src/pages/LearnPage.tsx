import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Book, Search, Sliders, Tag, BookOpen, Calendar, ArrowRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { pageTransition } from '@/lib/animations';

// Animation avec effet de rebond
const fadeInWithBounce = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.175, 0.885, 0.32, 1.5], // Effet de rebond accentué
      bounce: 0.4,
      type: "spring",
      stiffness: 120
    }
  }
};

// Animation pour les cartes
const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    } 
  }
};

interface EducationalTopic {
  id: number;
  title: string;
  slug: string;
  description: string;
  color: string;
  imageUrl: string;
  contentCount?: number;
  createdAt?: string;
  author?: {
    displayName: string;
    title?: string;
    avatarUrl?: string;
  };
}

const LearnPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: topics, isLoading, error } = useQuery<EducationalTopic[]>({
    queryKey: ['/api/educational-topics'],
  });

  if (error) {
    console.error('Erreur lors du chargement des sujets éducatifs:', error);
  }
  
  // Filtrer et trier les sujets
  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    
    let result = [...topics];
    
    // Appliquer la recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(topic => 
        topic.title.toLowerCase().includes(searchLower) || 
        topic.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Appliquer les filtres par année
    if (sortOrder === "2025") {
      result = result.filter(topic => {
        if (!topic.createdAt) return false;
        const year = new Date(topic.createdAt).getFullYear();
        return year === 2025;
      });
    } else if (sortOrder === "2024") {
      result = result.filter(topic => {
        if (!topic.createdAt) return false;
        const year = new Date(topic.createdAt).getFullYear();
        return year === 2024;
      });
    }
    // Pour "latest", on affiche tous les sujets
    
    return result;
  }, [topics, searchTerm, sortOrder]);
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const TopicsContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (!topics || topics.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
            <Book className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Pas encore de contenu éducatif</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Nous travaillons actuellement sur du contenu éducatif pour vous aider à mieux comprendre les enjeux politiques. Revenez bientôt !
          </p>
        </div>
      );
    }

    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        {filteredTopics.map((topic) => (
          <motion.div key={topic.id} variants={cardAnimation}>
            <Link href={`/apprendre/${topic.slug}`} className="block h-full cursor-pointer">
              <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden group h-full border-t-4 hover:translate-y-[-5px]" style={{ borderTopColor: topic.color || '#3b82f6' }}>
                <div className="relative w-full h-44 overflow-hidden">
                  <img 
                    src={topic.imageUrl} 
                    alt={topic.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="outline" className="bg-white/90 text-dark font-semibold">
                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                      {topic.contentCount || 0} ressource{topic.contentCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-1">
                  <CardTitle>
                    <span className="text-lg font-bold text-primary group-hover:text-blue-700 transition-colors">
                      {topic.title}
                    </span>
                  </CardTitle>
                  <div className="mt-1 w-12 h-0.5 bg-primary/30 rounded-full"></div>
                </CardHeader>
                <CardContent className="px-4 py-3">
                  <div className="w-full max-h-24 pr-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <p className="text-sm text-muted-foreground">
                      {topic.description}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-2">
                  <div className="flex items-center">
                    <div className="flex items-center text-xs text-slate-500">
                      <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold mr-1.5 overflow-hidden">
                        {topic.author ? (
                          <img 
                            src={topic.author.avatarUrl || '/assets/default-avatar.svg'} 
                            alt={topic.author.displayName || "Auteur"} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Si l'image échoue, on affiche l'initiale de l'auteur
                              (e.target as HTMLImageElement).style.display = 'none';
                              e.currentTarget.parentElement!.textContent = 
                                topic.author?.displayName?.charAt(0).toUpperCase() || 'A';
                            }}
                          />
                        ) : (
                          "A"
                        )}
                      </div>
                      <span>{topic.author?.displayName || "Administrateur"}</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <Button variant="default" size="sm" className="group-hover:bg-primary/90 transition-colors">
                      <span>Explorer</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>Apprendre | Politiquensemble</title>
        <meta name="description" content="Ressources éducatives pour comprendre les enjeux politiques, économiques et historiques." />
      </Helmet>
      
      <div className="bg-blue-50 py-12 md:py-16 lg:py-20 shadow-md mb-6 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] relative -mt-[4.25rem]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center pt-8">
            <motion.h1 
              variants={fadeInWithBounce}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 relative"
            >
              Apprendre
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
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-3 mb-12">
        {/* Barre de recherche et filtres */}
        <motion.div 
          className="mb-6 flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3
            }
          }}
        >
          {!showFilters && (
            <div className="flex-1 hidden md:flex flex-wrap gap-2 pb-2">
              <Badge 
                variant={!searchTerm && sortOrder === "latest" ? "default" : "outline"}
                className="cursor-pointer py-2 px-3 sm:px-4"
                onClick={() => {
                  setSearchTerm("");
                  setSortOrder("latest");
                }}
              >
                <Tag className="mr-1 h-4 w-4" />
                <span className="whitespace-nowrap">Toutes les années</span>
              </Badge>
              
              <Badge 
                variant={sortOrder === "2025" ? "default" : "outline"}
                className="cursor-pointer py-2 px-3 sm:px-4"
                onClick={() => setSortOrder("2025")}
              >
                <Calendar className="mr-1 h-4 w-4" />
                <span className="whitespace-nowrap">2025</span>
              </Badge>
              
              <Badge 
                variant={sortOrder === "2024" ? "default" : "outline"}
                className="cursor-pointer py-2 px-3 sm:px-4"
                onClick={() => setSortOrder("2024")}
              >
                <Calendar className="mr-1 h-4 w-4" />
                <span className="whitespace-nowrap">2024</span>
              </Badge>
            </div>
          )}
          
          <div className="flex items-center ml-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-xs whitespace-nowrap"
              onClick={toggleFilters}
            >
              <Sliders className="h-4 w-4 mr-1" />
              Filtres
            </Button>
          </div>
        </motion.div>
        
        {showFilters && (
          <div className="mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-7">
                <Input
                  type="text"
                  placeholder="Rechercher dans les sujets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="md:col-span-5">
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Toutes les années</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        
        {searchTerm && (
          <div className="mb-4 text-sm text-muted-foreground">
            Résultats pour "{searchTerm}" ({filteredTopics.length} sujet{filteredTopics.length !== 1 ? 's' : ''} trouvé{filteredTopics.length !== 1 ? 's' : ''})
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-7 px-2 text-xs"
                onClick={() => setSearchTerm("")}
              >
                Effacer
              </Button>
            )}
          </div>
        )}
        
        <TopicsContent />
      </div>
    </motion.div>
  );
};

export default LearnPage;