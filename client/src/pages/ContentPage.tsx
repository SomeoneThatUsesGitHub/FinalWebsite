import React from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Eye, ThumbsUp, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';

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

const ContentPage: React.FC = () => {
  const params = useParams<{ topicSlug: string, contentSlug: string }>();
  const [, setLocation] = useLocation();
  const { topicSlug, contentSlug } = params;

  const { data: topic, isLoading: isTopicLoading } = useQuery<EducationalTopic>({
    queryKey: [`/api/educational-topics/${topicSlug}`],
    enabled: !!topicSlug,
  });

  const { data: content, isLoading: isContentLoading, error: contentError } = useQuery<EducationalContent>({
    queryKey: [`/api/educational-content/${contentSlug}`],
    enabled: !!contentSlug,
  });

  const isLoading = isTopicLoading || isContentLoading;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy', { locale: fr });
  };

  return (
    <MainLayout>
      <Helmet>
        <title>
          {content ? `${content.title} | ${topic?.title || 'Apprendre'}` : 'Chargement...'} | Politiquensemble
        </title>
        <meta name="description" content={content?.summary || "Chargement du contenu éducatif..."} />
      </Helmet>

      <div className="mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4"
          onClick={() => topicSlug ? setLocation(`/apprendre/${topicSlug}`) : setLocation('/apprendre')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour {topic ? `à ${topic.title}` : 'aux sujets'}
        </Button>

        {isLoading ? (
          <>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-2/3 mb-6" />
            <Skeleton className="h-[300px] w-full mb-8" />
          </>
        ) : contentError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors du chargement du contenu.
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        ) : content && topic ? (
          <>
            <PageHeader 
              title={content.title}
              description={content.summary} 
              icon={<BookOpen className="h-6 w-6 mr-2" />}
            />

            <div className="flex flex-wrap gap-2 mt-4 mb-6">
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {content.views} vues
              </Badge>
              
              <Badge variant="outline" className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                {content.likes} j'aime
              </Badge>

              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Publié le {formatDate(content.createdAt)}
              </Badge>

              {content.updatedAt !== content.createdAt && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Mis à jour le {formatDate(content.updatedAt)}
                </Badge>
              )}
            </div>

            <div className="relative">
              <img 
                src={content.imageUrl} 
                alt={content.title} 
                className="w-full h-[300px] object-cover rounded-md mb-8"
              />
              <div 
                className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm py-1 px-3 rounded-full"
              >
                <Link href={`/apprendre/${topicSlug}`}>
                  <Badge 
                    className="hover:bg-primary/10 cursor-pointer"
                    style={{ backgroundColor: topic.color + '33' }}
                  >
                    {topic.title}
                  </Badge>
                </Link>
              </div>
            </div>

            <Separator className="my-6" />
            
            <div 
              className="prose prose-blue dark:prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />

            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => setLocation(`/apprendre/${topicSlug}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au sujet
              </Button>
            </div>
          </>
        ) : (
          <Alert className="mb-6">
            <AlertTitle>Contenu non trouvé</AlertTitle>
            <AlertDescription>
              Le contenu demandé n'existe pas ou n'est plus disponible.
              <div className="flex gap-2 mt-2">
                <Button onClick={() => topicSlug ? setLocation(`/apprendre/${topicSlug}`) : setLocation('/apprendre')}>
                  Retour {topic ? `à ${topic.title}` : 'aux sujets'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  );
};

export default ContentPage;