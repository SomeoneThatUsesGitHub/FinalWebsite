import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { BookOpen, ChevronLeft, FileText, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';

interface EducationalTopic {
  id: number;
  title: string;
  slug: string;
  description: string;
  color: string;
  imageUrl: string;
}

interface EducationalContent {
  id: number;
  title: string;
  slug: string;
  description: string;
  topicId: number;
  createdAt: string;
  updatedAt: string;
}

const TopicPage: React.FC = () => {
  const { slug } = useParams();
  
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery<EducationalTopic>({
    queryKey: [`/api/educational-topics/${slug}`],
    enabled: !!slug,
  });

  const { data: contents, isLoading: contentsLoading, error: contentsError } = useQuery<EducationalContent[]>({
    queryKey: [`/api/educational-content`, { topicId: topic?.id }],
    enabled: !!topic?.id,
  });

  if (topicError || contentsError) {
    console.error('Erreur lors du chargement:', topicError || contentsError);
  }

  const isLoading = topicLoading || contentsLoading;

  return (
    <MainLayout>
      {topicLoading ? (
        <div className="bg-blue-50 py-12 animate-pulse -mt-6 -mx-4 md:-mx-6 lg:-mx-8">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        </div>
      ) : topic ? (
        <div className="py-16 mb-6 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 relative overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-[4.25rem]">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl opacity-20 -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl opacity-20 translate-y-24 -translate-x-24"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <GraduationCap className="h-16 w-16 mx-auto text-white mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{topic.title}</h1>
              <div className="h-1 w-20 bg-white mx-auto my-4 rounded-full"></div>
              <p className="text-white/90 text-lg max-w-2xl mx-auto">{topic.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 py-12 shadow-md mb-6">
          <div className="container mx-auto px-4">
            <p className="text-center text-muted-foreground">Sujet introuvable</p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" className="mb-4" asChild>
            <Link href="/apprendre">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux sujets
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-48">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : contents && contents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {contents.map((content) => (
              <Card key={content.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    {content.title}
                  </CardTitle>
                  <CardDescription>
                    Mis à jour le {new Date(content.updatedAt).toLocaleDateString('fr-FR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {content.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href={`/apprendre/${slug}/${content.slug}`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Lire
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pas encore de contenu disponible</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Nous préparons actuellement du contenu éducatif sur ce sujet. Revenez bientôt !
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TopicPage;