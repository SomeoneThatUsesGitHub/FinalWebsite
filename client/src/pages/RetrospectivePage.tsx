import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  BookOpen, 
  Calendar, 
  ExternalLink, 
  ChevronRight, 
  Search, 
  Award, 
  Building, 
  Globe, 
  Users
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { parseISO, format } from "date-fns";
import { fr } from "date-fns/locale";

// Type pour un événement historique
interface HistoricalEvent {
  id: number;
  year: number;
  month: number | null;
  day: number | null;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
}

const RetrospectivePage = () => {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
  const [searchYear, setSearchYear] = useState<string>(searchParams.get("year") || "");
  const [searchCategory, setSearchCategory] = useState<string>(searchParams.get("category") || "");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fonction pour obtenir l'icône basée sur la catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "politique":
        return <Building className="h-5 w-5" />;
      case "economie":
        return <Award className="h-5 w-5" />;
      case "international":
        return <Globe className="h-5 w-5" />;
      case "social":
        return <Users className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  // Fonction pour obtenir la couleur basée sur la catégorie
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "politique":
        return "bg-blue-100 text-blue-800";
      case "economie":
        return "bg-green-100 text-green-800";
      case "international":
        return "bg-purple-100 text-purple-800";
      case "social":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Récupération des événements historiques avec filtres
  const { data: events, isLoading, isError } = useQuery<HistoricalEvent[]>({
    queryKey: ["/api/historical-events", searchYear, searchCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchYear) params.append("year", searchYear);
      if (searchCategory) params.append("category", searchCategory);
      
      const res = await fetch(\`/api/historical-events?\${params.toString()}\`);
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des événements historiques");
      }
      return res.json();
    },
  });

  // Mettre à jour l'URL lorsque les filtres changent
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchYear) params.append("year", searchYear);
    if (searchCategory) params.append("category", searchCategory);
    
    // Mettre à jour l'URL sans recharger la page
    window.history.pushState({}, "", \`/retrospective?\${params.toString()}\`);
  }, [searchYear, searchCategory]);

  // Récupérer les événements paginés
  const paginatedEvents = events ? events.slice((page - 1) * pageSize, page * pageSize) : [];
  const totalPages = events ? Math.ceil(events.length / pageSize) : 0;

  // Générer une liste d'années pour le filtre (de 1945 à aujourd'hui)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1945; year--) {
    years.push(year);
  }

  // Formatter la date d'un événement
  const formatEventDate = (event: HistoricalEvent) => {
    if (event.day && event.month) {
      return \`\${event.day} \${format(new Date(event.year, event.month - 1), 'MMMM', { locale: fr })} \${event.year}\`;
    } 
    if (event.month) {
      return \`\${format(new Date(event.year, event.month - 1), 'MMMM', { locale: fr })} \${event.year}\`;
    }
    return \`\${event.year}\`;
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Rétrospective</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les grands moments qui ont marqué l'histoire politique française et internationale au fil des années.
          </p>
        </div>

        {/* Filtres */}
        <div className="mb-8 bg-card p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="yearFilter" className="block mb-2 text-sm font-medium">
                Année
              </label>
              <Select 
                value={searchYear} 
                onValueChange={(value) => {
                  setSearchYear(value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="yearFilter">
                  <SelectValue placeholder="Toutes les années" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les années</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="categoryFilter" className="block mb-2 text-sm font-medium">
                Catégorie
              </label>
              <Select 
                value={searchCategory} 
                onValueChange={(value) => {
                  setSearchCategory(value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="categoryFilter">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  <SelectItem value="politique">Politique</SelectItem>
                  <SelectItem value="economie">Économie</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="culture">Culture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2 flex items-end">
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  setSearchYear("");
                  setSearchCategory("");
                  setPage(1);
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        </div>

        {/* Liste des événements */}
        <div className="space-y-6">
          {isLoading ? (
            // Squelettes de chargement
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-7 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-xl text-red-500">
                Erreur lors de la récupération des événements historiques.
              </p>
              <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          ) : paginatedEvents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">
                Aucun événement ne correspond à vos critères de recherche.
              </p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={() => {
                  setSearchYear("");
                  setSearchCategory("");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            // Liste des événements
            paginatedEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{formatEventDate(event)}</span>
                    </div>
                    <Badge variant="outline" className={getCategoryColor(event.category)}>
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(event.category)}
                        <span className="capitalize">
                          {event.category}
                        </span>
                      </span>
                    </Badge>
                  </div>
                  <CardTitle className="text-xl md:text-2xl mt-2">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {event.description}
                  </p>
                </CardContent>
                {event.imageUrl && (
                  <div className="px-6 pb-6">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-auto rounded-md object-cover"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  // Afficher seulement certaines pages pour éviter une pagination trop longue
                  if (
                    i === 0 || // Première page
                    i === totalPages - 1 || // Dernière page
                    (i >= page - 2 && i <= page) || // Pages autour de la page courante
                    (i >= page && i <= page + 1) // Pages après la page courante
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    (i === 1 && page > 3) || // Ellipsis au début
                    (i === totalPages - 2 && page < totalPages - 3) // Ellipsis à la fin
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RetrospectivePage;