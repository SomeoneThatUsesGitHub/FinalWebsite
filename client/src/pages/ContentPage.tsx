import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { BookOpen, ChevronLeft, GraduationCap, Calendar, RefreshCw, BookOpenText, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { pageTransition } from '@/lib/animations';
import GlossaryHighlighter from '@/components/GlossaryHighlighter';
import QuizDisplay from '@/components/QuizDisplay';

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

interface EducationalTopic {
  id: number;
  title: string;
  slug: string;
  description: string;
  color: string;
}

interface EducationalContent {
  id: number;
  title: string;
  slug: string;
  description: string;
  topicId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  topic?: EducationalTopic;
}

const ContentPage: React.FC = () => {
  const { topicSlug, contentSlug } = useParams();

  const { data: topic, isLoading: topicLoading } = useQuery<EducationalTopic>({
    queryKey: [`/api/educational-topics/${topicSlug}`],
    enabled: !!topicSlug,
  });

  const { data: content, isLoading: contentLoading, error } = useQuery<EducationalContent>({
    queryKey: [`/api/educational-content/${contentSlug}`],
    enabled: !!contentSlug,
  });

  if (error) {
    console.error('Erreur lors du chargement du contenu:', error);
  }

  const isLoading = topicLoading || contentLoading;
  
  // Plus besoin du useEffect car nous utilisons la méthode ref directement sur la div du contenu

  return (
    <MainLayout>
      {isLoading ? (
        <div className="bg-blue-50 py-12 animate-pulse -mt-6 -mx-4 md:-mx-6 lg:-mx-8">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        </div>
      ) : content ? (
        <>
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-16 md:py-24 mb-6 relative -mt-[4.25rem] overflow-hidden w-screen left-1/2 right-1/2 -translate-x-1/2">
            {/* Éléments décoratifs pour rendre la bannière plus dynamique */}
            <div className="absolute inset-0 bg-pattern opacity-5"></div>
            <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 -translate-y-24 translate-x-24"></div>
            <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-300 rounded-full filter blur-2xl opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20 translate-y-24 -translate-x-24"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-200 rounded-full filter blur-xl opacity-10"></div>
            
            {/* Lignes décoratives */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent"></div>
            
            <div className="container mx-auto px-4 relative z-10">
              {topic && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl mx-auto mb-8"
                >
                  <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30" asChild>
                    <Link href={`/apprendre/${topicSlug}`}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Retour à {topic.title}
                    </Link>
                  </Button>
                </motion.div>
              )}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.5,
                      type: "spring",
                      stiffness: 120,
                      damping: 10
                    }}
                    className="bg-white/15 p-4 md:p-5 rounded-full backdrop-blur-sm border border-white/10 shadow-lg"
                  >
                    <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h1 
                      variants={fadeInWithBounce}
                      initial="hidden"
                      animate="visible"
                      className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-md"
                    >
                      {content.title}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="text-blue-100 text-lg mb-4 max-w-3xl"
                    >
                      {content.description}
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="flex flex-wrap gap-3 mt-2"
                    >
                      <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white">
                        <Calendar className="h-3 w-3" />
                        Publié le {new Date(content.createdAt).toLocaleDateString('fr-FR')}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white">
                        <RefreshCw className="h-3 w-3" />
                        Mis à jour le {new Date(content.updatedAt).toLocaleDateString('fr-FR')}
                      </Badge>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-blue-50 py-12 shadow-md mb-6">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground">Contenu introuvable</p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-3 sm:px-4 py-8">
        <div className="max-w-4xl mx-auto w-full">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : content ? (
            <Card className="shadow-sm border-0 sm:border">
              <CardContent className="p-3 sm:p-6">

                <GlossaryHighlighter>
                  <div 
                    className="prose prose-blue prose-img:rounded-lg prose-img:mx-auto prose-headings:text-primary max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: content.content
                        // Remplacer les balises img qui apparaissent sous forme de texte
                        .replace(/&lt;img/g, '<img')
                        .replace(/class=&quot;([^&]*)&quot;/g, 'class="$1"')
                        .replace(/src=&quot;([^&]*)&quot;/g, 'src="$1"')
                        .replace(/alt=&quot;([^&]*)&quot;/g, 'alt="$1"')
                        .replace(/style=&quot;([^&]*)&quot;/g, 'style="$1"')
                        .replace(/\/&gt;/g, '/>')
                        // Alternative avec les guillemets non-échappés
                        .replace(/<img src="([^"]*)" alt="([^"]*)" class="([^"]*)" \/>/g, 
                                '<img src="$1" alt="$2" class="$3" />')
                        // Correction pour les balises figure et figcaption
                        .replace(/&lt;figure/g, '<figure')
                        .replace(/&lt;figcaption/g, '<figcaption')
                        .replace(/&lt;\/figure&gt;/g, '</figure>')
                        .replace(/&lt;\/figcaption&gt;/g, '</figcaption>')
                    }}
                  />
                </GlossaryHighlighter>

                {/* Intégration des quiz */}
                {content && (
                  <QuizDisplay contentId={content.id} />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Contenu introuvable</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Le contenu que vous recherchez n'est pas disponible ou a été déplacé.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/apprendre">
                  Retour à la page d'apprentissage
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ContentPage;