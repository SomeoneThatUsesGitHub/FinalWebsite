import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 py-16 md:py-24 mb-6 relative -mt-[4.25rem] overflow-hidden w-screen left-1/2 right-1/2 -translate-x-1/2">
          {/* Éléments décoratifs */}
          <div className="absolute inset-0 bg-pattern opacity-5"></div>
          <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 -translate-y-24 translate-x-24"></div>
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-300 rounded-full filter blur-2xl opacity-10"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.175, 0.885, 0.32, 1.5] }}
                className="text-4xl md:text-5xl font-bold text-white mb-4 text-center"
              >
                Élections Internationales
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-xl text-blue-100 text-center mb-8"
              >
                Découvrez les résultats des élections récentes et les prochains scrutins à travers le monde
              </motion.p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filtres et recherche */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <Input
                type="text"
                placeholder="Rechercher une élection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer par type
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {uniqueElectionTypes.map(type => (
                    <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                    <Card 
                      key={country.countryCode} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedCountry(country.countryCode)}
                    >
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 flex items-center justify-center mr-3">
                            <span className="text-4xl">{getCountryFlag(country.countryCode)}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{country.country}</h3>
                            <p className="text-sm text-muted-foreground">{country.count} élection{country.count > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{country.countryCode}</Badge>
                      </CardContent>
                    </Card>
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center mb-1">
              <span className="text-xl mr-2">{getCountryFlag(countryCode)}</span>
              <span>{title}</span>
              {upcoming && (
                <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                  À venir
                </Badge>
              )}
              {isRecent && !upcoming && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  Récente
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex flex-wrap gap-2">
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
          <div className="mt-4">
            <ElectionResultsChart data={electionData} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Masquer les résultats' : 'Voir les résultats'}
        </Button>
        
        {!selectedCountry && (
          <Button 
            variant="ghost" 
            size="sm" 
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

// Fonction helper pour obtenir l'emoji du drapeau à partir du code pays
const getCountryFlag = (countryCode: string): string => {
  // Les codes pays sont en majuscules et ont 2 caractères
  const uppercaseCode = countryCode.toUpperCase();
  const codePoints = [];
  
  for (let i = 0; i < uppercaseCode.length; i++) {
    codePoints.push(127397 + uppercaseCode.charCodeAt(i));
  }
  
  return String.fromCodePoint(...codePoints);
};

export default ElectionsPage;