import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Book, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
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
}

const LearnPage: React.FC = () => {
  const { data: topics, isLoading, error } = useQuery<EducationalTopic[]>({
    queryKey: ['/api/educational-topics'],
  });

  if (error) {
    console.error('Erreur lors du chargement des sujets éducatifs:', error);
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Apprendre | Politiquensemble</title>
        <meta name="description" content="Ressources éducatives pour comprendre les enjeux politiques, économiques et historiques." />
      </Helmet>
      
      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="bg-blue-50 py-12 md:py-20 shadow-md mb-8">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                variants={fadeInWithBounce}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 relative"
              >
                <GraduationCap className="inline-block h-10 w-10 mb-2 mr-3 text-primary" />
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
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { delay: 0.5, duration: 0.5 } 
                }}
                className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
              >
                Découvrez nos différentes ressources éducatives pour comprendre les enjeux politiques, économiques et historiques
              </motion.p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
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
          ) : topics && topics.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
            >
              {topics.map((topic) => (
                <motion.div key={topic.id} variants={cardAnimation}>
                  <Card className="hover:shadow-md transition-shadow overflow-hidden group h-full">
                    <div className="relative w-full h-40 overflow-hidden">
                      <img 
                        src={topic.imageUrl} 
                        alt={topic.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: topic.color || '#3b82f6' }}></div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <Book className="h-5 w-5 mr-2 text-primary" />
                        {topic.title}
                      </CardTitle>
                      <CardDescription>
                        {topic.contentCount || 0} ressource{topic.contentCount !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {topic.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline">
                        <Link href={`/apprendre/${topic.slug}`}>
                          Explorer
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                <Book className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pas encore de contenu éducatif</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Nous travaillons actuellement sur du contenu éducatif pour vous aider à mieux comprendre les enjeux politiques. Revenez bientôt !
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default LearnPage;