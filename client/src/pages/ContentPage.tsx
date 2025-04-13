import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { BookOpen, ChevronLeft, GraduationCap, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';

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
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-10 md:py-16 mb-6 relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-[4.25rem]">
            <div className="container mx-auto px-4">
              {topic && (
                <div className="max-w-4xl mx-auto mb-6">
                  <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30" asChild>
                    <Link href={`/apprendre/${topicSlug}`}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Retour à {topic.title}
                    </Link>
                  </Button>
                </div>
              )}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{content.title}</h1>
                    <p className="text-blue-100 text-lg mb-4">{content.description}</p>
                    
                    <div className="flex flex-wrap gap-3 mt-2">
                      <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white">
                        <Calendar className="h-3 w-3" />
                        Publié le {new Date(content.createdAt).toLocaleDateString('fr-FR')}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white">
                        <RefreshCw className="h-3 w-3" />
                        Mis à jour le {new Date(content.updatedAt).toLocaleDateString('fr-FR')}
                      </Badge>
                    </div>
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
                <div 
                  className="prose prose-blue prose-img:rounded-lg prose-img:mx-auto prose-headings:text-primary max-w-none" 
                  ref={(el) => {
                    // Fonction pour charger et initialiser le script Instagram
                    if (el && content.content.includes('instagram-media')) {
                      // Créer ou obtenir un script Instagram
                      let instaScript = document.getElementById('instagram-embed-js') as HTMLScriptElement;
                      if (!instaScript) {
                        instaScript = document.createElement('script');
                        instaScript.id = 'instagram-embed-js';
                        instaScript.src = 'https://www.instagram.com/embed.js';
                        instaScript.async = true;
                        
                        // Quand le script est chargé, traiter les embeds
                        instaScript.onload = () => {
                          if ((window as any).instgrm) {
                            (window as any).instgrm.Embeds.process();
                          }
                        };
                        
                        document.body.appendChild(instaScript);
                      } else if ((window as any).instgrm) {
                        // Si le script est déjà chargé, traiter les embeds immédiatement
                        setTimeout(() => {
                          (window as any).instgrm.Embeds.process();
                        }, 500);
                      }
                    }
                  }}
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