import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Layers, 
  BookOpen, 
  History, 
  LucideIcon, 
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
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import MainLayout from '@/components/layout/MainLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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

const LearnPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = React.useState<EducationalTopic | null>(null);
  
  const { data: topics, isLoading, error } = useQuery<EducationalTopic[]>({
    queryKey: ['/api/educational-topics'],
  });

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
        <title>Apprendre | Politiquensemble</title>
        <meta name="description" content="Apprenez les bases de la politique, de l'économie et de l'histoire de manière simple et engageante." />
      </Helmet>
      
      <PageHeader 
        title="Apprendre" 
        description="Découvrez les fondamentaux de la politique, de l'économie et de l'histoire en termes simples et compréhensibles."
        icon={<GraduationCap className="h-6 w-6 mr-2" />}
      />

      <Separator className="my-6" />

      <div className="container mb-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
          {isLoading ? (
            // Squelettes de chargement
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden h-[360px]">
                <Skeleton className="w-full h-[160px]" />
                <CardHeader className="pb-2">
                  <Skeleton className="w-3/4 h-6 mb-2" />
                  <Skeleton className="w-full h-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="w-full h-16" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="w-28 h-10" />
                </CardFooter>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-destructive text-lg">Une erreur est survenue lors du chargement des sujets.</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                Réessayer
              </Button>
            </div>
          ) : topics && topics.length > 0 ? (
            <motion.div 
              className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {topics
                .sort((a, b) => a.order - b.order)
                .map((topic) => (
                  <motion.div key={topic.id} variants={item}>
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                      <div 
                        className="w-full h-[160px] bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${topic.imageUrl})` }}
                      >
                        <div 
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ backgroundColor: `${topic.color}88` }}
                        >
                          <div className="bg-white p-4 rounded-full">
                            {getIcon(topic.icon)}
                          </div>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <CardDescription className="text-sm line-clamp-3">
                          {topic.description}
                        </CardDescription>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/apprendre/${topic.slug}`}>
                          <Button>Explorer</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="ml-2"
                          onClick={() => setSelectedTopic(topic)}
                        >
                          Détails
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              }
            </motion.div>
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Aucun sujet d'apprentissage n'est disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails du sujet */}
      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTopic && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full" style={{ backgroundColor: selectedTopic.color + '22' }}>
                    {getIcon(selectedTopic.icon)}
                  </div>
                  <DialogTitle>{selectedTopic.title}</DialogTitle>
                </div>
                <DialogDescription>
                  {selectedTopic.description}
                </DialogDescription>
              </DialogHeader>
              <div>
                {selectedTopic.imageUrl && (
                  <img 
                    src={selectedTopic.imageUrl} 
                    alt={selectedTopic.title} 
                    className="w-full h-auto rounded-md mb-4 object-cover"
                    style={{ maxHeight: '300px' }}
                  />
                )}
                <div className="flex justify-end">
                  <Link href={`/apprendre/${selectedTopic.slug}`}>
                    <Button>Explorer ce sujet</Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default LearnPage;