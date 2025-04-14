import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronRight, Loader2, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getCountryFlagUrl } from "@/lib/helpers";

interface Election {
  id: number;
  country: string;
  countryCode: string;
  title: string;
  date: string;
  type: string;
  upcoming: boolean;
}

const ElectionsSection: React.FC = () => {
  const { data: elections, isLoading } = useQuery<Election[]>({
    queryKey: ["/api/elections"],
  });

  // Afficher uniquement les 3 élections les plus récentes (tri par date)
  const recentElections = React.useMemo(() => {
    if (!elections) return [];
    
    return [...elections]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [elections]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Élections</h2>
          <Link href="/elections">
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
        ) : recentElections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentElections.map((election) => (
              <Link 
                key={election.id} 
                href={`/elections/${election.countryCode.toLowerCase()}/resultats/${election.id}`}
              >
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col">
                  <div className="h-40 bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={getCountryFlagUrl(election.countryCode)} 
                        alt={`Drapeau de ${election.country}`} 
                        className="max-h-full max-w-full object-contain"
                        style={{ maxHeight: "70%", maxWidth: "80%" }}
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={election.upcoming ? "default" : "secondary"}>
                        {election.upcoming ? "À venir" : "Passée"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="py-5 flex-grow">
                    <h3 className="font-semibold text-xl mb-2">{election.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{election.country}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      <span>{formatDate(election.date)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucune élection disponible pour le moment.</p>
            <Link href="/elections">
              <Button variant="outline" className="mt-4">
                Explorer la section Élections
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ElectionsSection;