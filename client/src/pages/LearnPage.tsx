import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Book, GraduationCap } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Apprendre" 
          description="Découvrez nos différentes ressources éducatives pour comprendre les enjeux politiques" 
          icon={<GraduationCap className="h-8 w-8 mr-3 text-primary" />}
        />

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow overflow-hidden group">
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
            ))}
          </div>
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
    </MainLayout>
  );
};

export default LearnPage;