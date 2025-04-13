import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Calendar, MapPin, VoteIcon, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { pageTransition } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ElectionResultsChart, ElectionResultsData } from '@/components/ElectionResultsChart';

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

// Fonction pour obtenir l'URL du drapeau d'un pays à partir de son code pays
const getCountryFlagUrl = (countryCode: string): string => {
  // En production, on utiliserait une API ou des images stockées
  // Pour cet exemple, on utilise les drapeaux de Flagcdn
  const code = countryCode.toLowerCase();
  return `https://flagcdn.com/w160/${code}.png`;
};

// Définir l'interface pour une élection
interface Election {
  id: number;
  country: string;
  countryCode: string;
  title: string;
  date: string;
  type: string;
  results: any;
  description: string | null;
  upcoming: boolean;
  createdAt: string;
}

const ElectionsPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  // Récupérer toutes les élections
  const { data: elections, isLoading, error } = useQuery<Election[]>({
    queryKey: ['/api/elections'],
  });

  if (error) {
    console.error('Erreur lors du chargement des élections:', error);
  }

  // Fonction pour obtenir les pays uniques à partir des élections
  const getUniqueCountries = () => {
    if (!elections) return [];
    
    const countriesMap = new Map<string, { country: string; countryCode: string; count: number }>();
    
    elections.forEach(election => {
      const existing = countriesMap.get(election.countryCode);
      if (existing) {
        existing.count += 1;
      } else {
        countriesMap.set(election.countryCode, { 
          country: election.country, 
          countryCode: election.countryCode,
          count: 1
        });
      }
    });
    
    return Array.from(countriesMap.values());
  };

  // Obtenir les types d'élections uniques
  const getUniqueElectionTypes = () => {
    if (!elections) return [];
    
    const typesSet = new Set<string>();
    elections.forEach(election => typesSet.add(election.type));
    
    return Array.from(typesSet);
  };

  // Filtrer les élections par pays et recherche
  const getFilteredElections = () => {
    if (!elections) return [];
    
    return elections.filter(election => {
      // Filtrer par pays si un pays est sélectionné
      if (selectedCountry && election.countryCode !== selectedCountry) {
        return false;
      }
      
      // Filtrer par type d'élection si un type est sélectionné
      if (filterType && election.type !== filterType) {
        return false;
      }
      
      // Filtrer par recherche si une requête est saisie
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          election.title.toLowerCase().includes(query) ||
          election.country.toLowerCase().includes(query) ||
          election.type.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  };

  // Fonction pour déterminer si une élection est récente (moins de 3 mois)
  const isRecentElection = (dateStr: string) => {
    const electionDate = new Date(dateStr);
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    return electionDate >= threeMonthsAgo && electionDate <= now;
  };

  // Trier les élections par date (plus récentes d'abord)
  const sortedElections = getFilteredElections().sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Diviser les élections entre passées et à venir
  const upcomingElections = sortedElections.filter(e => e.upcoming);
  const pastElections = sortedElections.filter(e => !e.upcoming);

  // Obtenir les pays uniques
  const uniqueCountries = getUniqueCountries();
  const uniqueElectionTypes = getUniqueElectionTypes();

  return (
    <MainLayout>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        {/* Bannière d'en-tête */}
        <div className="bg-blue-50 py-12 md:py-20 shadow-md mb-8 w-screen relative left-1/2 transform -translate-x-1/2 -mt-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                variants={fadeInWithBounce}
                initial="hidden"
                animate="visible"
                className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 relative"
              >
                Élections Internationales
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
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filtres et recherche */}
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 min-w-0">
                <Input
                  type="text"
                  placeholder="Rechercher une élection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrer par type
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-[200px] overflow-y-auto">
                    {uniqueElectionTypes.map(type => (
                      <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Filtres actifs */}
            {(selectedCountry || filterType) && (
              <div className="flex flex-wrap gap-2">
                {selectedCountry && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedCountry(null)}
                    className="flex items-center gap-1"
                  >
                    <span>Pays: {uniqueCountries.find(c => c.countryCode === selectedCountry)?.country}</span>
                    <span className="text-xs">✕</span>
                  </Button>
                )}
                
                {filterType && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFilterType(null)}
                    className="flex items-center gap-1"
                  >
                    <span>Type: {filterType}</span>
                    <span className="text-xs">✕</span>
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Section des pays */}
          {!selectedCountry && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Pays</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array(8).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uniqueCountries.map((country) => (
                    <Link key={country.countryCode} href={`/elections/${country.countryCode.toLowerCase()}`}>
                      <Card 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 flex items-center justify-center mr-3 overflow-hidden rounded">
                              <img 
                                src={getCountryFlagUrl(country.countryCode)} 
                                alt={`Drapeau ${country.country}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">{country.country}</h3>
                              <p className="text-sm text-muted-foreground">{country.count} élection{country.count > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{country.countryCode}</Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Liste des élections */}
          {(selectedCountry || searchQuery || filterType) && (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Toutes les élections</TabsTrigger>
                <TabsTrigger value="upcoming">À venir</TabsTrigger>
                <TabsTrigger value="past">Passées</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <ElectionsList 
                  elections={sortedElections} 
                  isLoading={isLoading} 
                  selectedCountry={selectedCountry}
                  uniqueCountries={uniqueCountries}
                  onSelectCountry={setSelectedCountry}
                  isRecentElection={isRecentElection}
                />
              </TabsContent>
              
              <TabsContent value="upcoming">
                <ElectionsList 
                  elections={upcomingElections} 
                  isLoading={isLoading} 
                  selectedCountry={selectedCountry}
                  uniqueCountries={uniqueCountries}
                  onSelectCountry={setSelectedCountry}
                  isRecentElection={isRecentElection}
                />
              </TabsContent>
              
              <TabsContent value="past">
                <ElectionsList 
                  elections={pastElections} 
                  isLoading={isLoading} 
                  selectedCountry={selectedCountry}
                  uniqueCountries={uniqueCountries}
                  onSelectCountry={setSelectedCountry}
                  isRecentElection={isRecentElection}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

// Composant pour afficher la liste des élections
interface ElectionsListProps {
  elections: Election[];
  isLoading: boolean;
  selectedCountry: string | null;
  uniqueCountries: { country: string; countryCode: string; count: number }[];
  onSelectCountry: (countryCode: string) => void;
  isRecentElection: (dateStr: string) => boolean;
}

const ElectionsList: React.FC<ElectionsListProps> = ({
  elections,
  isLoading,
  selectedCountry,
  uniqueCountries,
  onSelectCountry,
  isRecentElection,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }
  
  if (elections.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucune élection trouvée</p>
        {selectedCountry && (
          <Button 
            variant="outline" 
            onClick={() => onSelectCountry(selectedCountry)} 
            className="mt-4"
          >
            Voir tous les pays
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {elections.map((election) => (
        <ElectionCard 
          key={election.id} 
          election={election} 
          isRecent={isRecentElection(election.date)}
          selectedCountry={selectedCountry}
          uniqueCountries={uniqueCountries}
          onSelectCountry={onSelectCountry}
        />
      ))}
    </div>
  );
};

// Composant pour afficher une carte d'élection
interface ElectionCardProps {
  election: Election;
  isRecent: boolean;
  selectedCountry: string | null;
  uniqueCountries: { country: string; countryCode: string; count: number }[];
  onSelectCountry: (countryCode: string) => void;
}

const ElectionCard: React.FC<ElectionCardProps> = ({
  election,
  isRecent,
  selectedCountry,
  uniqueCountries,
  onSelectCountry,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { title, country, countryCode, date, type, description, results, upcoming } = election;
  
  // Formater la date
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  const parsedResults = results && typeof results === 'string' ? JSON.parse(results) : results;
  const electionData: ElectionResultsData = {
    title: title,
    date: formattedDate,
    type: type,
    results: parsedResults?.results || []
  };
  
  return (
    <Card className={`border-l-4 ${upcoming ? 'border-l-amber-500' : isRecent ? 'border-l-green-500' : 'border-l-blue-500'}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div className="w-full">
            <CardTitle className="flex flex-wrap items-center gap-2 mb-2">
              <div className="w-6 h-6 inline-block mr-2 overflow-hidden rounded">
                <img 
                  src={getCountryFlagUrl(countryCode)} 
                  alt={`Drapeau ${country}`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mr-2">{title}</span>
              <div className="flex flex-wrap gap-1">
                {upcoming && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    À venir
                  </Badge>
                )}
                {isRecent && !upcoming && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Récente
                  </Badge>
                )}
              </div>
            </CardTitle>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center bg-gray-100 text-gray-700">
                <MapPin className="h-3 w-3 mr-1" />
                {country}
              </Badge>
              <Badge variant="secondary" className="flex items-center bg-gray-100 text-gray-700">
                <Calendar className="h-3 w-3 mr-1" />
                {formattedDate}
              </Badge>
              <Badge variant="secondary" className="flex items-center bg-gray-100 text-gray-700">
                <VoteIcon className="h-3 w-3 mr-1" />
                {type}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {description && (
          <p className="text-muted-foreground mb-4">{description}</p>
        )}
        
        {parsedResults && expanded && (
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[500px] md:min-w-0">
              <ElectionResultsChart data={electionData} />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Masquer les résultats' : 'Voir les résultats'}
        </Button>
        
        {!selectedCountry && (
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full sm:w-auto" 
            onClick={(e) => {
              e.stopPropagation();
              onSelectCountry(countryCode);
            }}
          >
            Voir toutes les élections de {country}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Fin du composant ElectionCard

export default ElectionsPage;