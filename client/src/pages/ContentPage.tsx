import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { BookOpen, ChevronLeft, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';

interface EducationalTopic {
  id: number;
  name: string;
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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          {topic && (
            <Button variant="outline" className="mb-4" asChild>
              <Link href={`/apprendre/${topicSlug}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour à {topic.name}
              </Link>
            </Button>
          )}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : content ? (
            <PageHeader
              title={content.title}
              description={content.description}
              icon={<BookOpen className="h-8 w-8 mr-3 text-primary" />}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Contenu introuvable</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : content ? (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: content.content }} />
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
    </MainLayout>
  );
};

export default ContentPage;