import React from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, GraduationCap, LucideIcon, Layers, History, LineChart, ScrollText, PenTool, Award, Building, Landmark, User, Users, Flag, Library } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';

type EducationalTopic = {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  icon: string | null;
  color: string;
  order: number;
};

type EducationalContent = {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  imageUrl: string;
  topicId: number;
  authorId: number | null;
  published: boolean;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
};

// Map des noms d'icônes Lucide-React aux composants d'icônes
const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Layers,
  BookOpen,
  History,
  LineChart,
  ScrollText,
  PenTool,
  Award,
  Building,
  Landmark,
  User,
  Users,
  Flag,
  Library
};

const TopicPage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { slug } = params;

  const { data: topic, isLoading: isTopicLoading, error: topicError } = useQuery<EducationalTopic>({
    queryKey: [`/api/educational-topics/${slug}`],
    enabled: !!slug,
  });

  const { data: contents, isLoading: isContentsLoading, error: contentsError } = useQuery<EducationalContent[]>({
    queryKey: ['/api/educational-content', { topicId: topic?.id }],
    enabled: !!topic?.id,
  });

  const isLoading = isTopicLoading || isContentsLoading;
  const error = topicError || contentsError;

  // Fonction pour afficher l'icône correcte ou une icône par défaut
  const getIcon = (iconName: string | null) => {
    if (!iconName || !iconMap[iconName]) {
      return <BookOpen />;
    }
    
    const IconComponent = iconMap[iconName];
    return <IconComponent />;
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <Helmet>
        <title>{topic ? `${topic.title} | Apprendre` : 'Chargement...'} | Politiquensemble</title>
        <meta name="description" content={topic?.description || "Chargement du contenu éducatif..."} />
      </Helmet>

      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4"
        onClick={() => setLocation('/apprendre')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux sujets
      </Button>

      {isLoading ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-[200px]" />
          </div>
          <Skeleton className="h-4 w-[300px] mt-2 mb-6" />
          <Skeleton className="h-[200px] w-full mb-8" />
        </>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur est survenue lors du chargement du sujet.
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      ) : topic ? (
        <>
          <PageHeader 
            title={topic.title}
            description={topic.description} 
            icon={
              <div 
                className="p-2 rounded-full mr-2" 
                style={{ backgroundColor: topic.color + '22' }}
              >
                {getIcon(topic.icon)}
              </div>
            }
          />

          {topic.imageUrl && (
            <div 
              className="w-full h-[250px] bg-cover bg-center rounded-md mt-4 mb-8"
              style={{ 
                backgroundImage: `url(${topic.imageUrl})`,
                boxShadow: `0 4px 20px ${topic.color}22`
              }}
            />
          )}
        </>
      ) : (
        <Alert className="mb-6">
          <AlertTitle>Sujet non trouvé</AlertTitle>
          <AlertDescription>
            Le sujet demandé n'existe pas ou n'est plus disponible.
            <Button className="mt-2" onClick={() => setLocation('/apprendre')}>
              Retour aux sujets
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Separator className="my-6" />
      
      <h2 className="text-2xl font-bold mb-6">Contenus disponibles</h2>
      
      <div className="mb-12">
        {isContentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[300px]">
                <Skeleton className="h-[150px] w-full" />
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : contentsError ? (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors du chargement des contenus.
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        ) : contents && contents.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {contents
              .filter(content => content.published)
              .map(content => (
                <motion.div key={content.id} variants={item}>
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                    <div 
                      className="w-full h-[150px] bg-cover bg-center"
                      style={{ backgroundImage: `url(${content.imageUrl})` }}
                    />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{content.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription className="text-sm line-clamp-3">
                        {content.summary}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        onClick={() => setLocation(`/apprendre/${slug}/${content.slug}`)}
                      >
                        Lire
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        {content.views} lectures
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            }
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucun contenu n'est disponible pour ce sujet pour le moment.
            </p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => setLocation('/apprendre')}
            >
              Retour aux sujets
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TopicPage;