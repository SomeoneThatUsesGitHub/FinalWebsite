import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EducationalTopic {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  color: string;
  icon: string | null;
}

const LearnSection: React.FC = () => {
  const { data: topics, isLoading } = useQuery<EducationalTopic[]>({
    queryKey: ["/api/educational-topics"],
  });

  // Afficher uniquement les 3 derniers sujets ajoutés
  const recentTopics = topics?.slice(0, 3);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Apprendre</h2>
          <Link href="/apprendre">
            <Button variant="ghost" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
              Voir plus
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col h-full">
                <Skeleton className="w-full h-48 rounded-t-lg" />
                <div className="p-5 border border-t-0 rounded-b-lg flex-grow">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recentTopics && recentTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTopics.map((topic) => (
              <Link key={topic.id} href={`/apprendre/${topic.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col">
                  <div 
                    className="h-48 bg-cover bg-center relative"
                    style={{ 
                      backgroundImage: topic.imageUrl ? `url(${topic.imageUrl})` : 'none',
                      backgroundColor: topic.imageUrl ? 'transparent' : (topic.color || '#3b82f6')
                    }}
                  >
                    {!topic.imageUrl && topic.icon && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <span className="text-white text-8xl">{topic.icon}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="py-5 flex-grow">
                    <h3 className="font-semibold text-xl mb-2">{topic.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{topic.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucun contenu d'apprentissage disponible pour le moment.</p>
            <Link href="/apprendre">
              <Button variant="outline" className="mt-4">
                Explorer la section Apprendre
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default LearnSection;