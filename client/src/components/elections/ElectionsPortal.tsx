import React, { useState } from "react";
import { motion } from "framer-motion";
import { staggerChildren, staggerItem, barChart } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, ChartBar, Book, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Election = {
  id: number;
  country: string;
  countryCode: string;
  title: string;
  date: string;
  type: string;
  results: Array<{
    party: string;
    percentage: number;
    color: string;
  }>;
  description: string;
  upcoming: boolean;
  createdAt: string;
};

const ElectionsPortal: React.FC = () => {
  const [electionType, setElectionType] = useState<string>("legislative");
  
  const { data: upcomingElections, isLoading: upcomingLoading } = useQuery<Election[]>({
    queryKey: ['/api/elections/upcoming'],
  });
  
  const { data: recentElections, isLoading: recentLoading } = useQuery<Election[]>({
    queryKey: ['/api/elections/recent'],
  });
  
  const isLoading = upcomingLoading || recentLoading;
  
  const handleElectionTypeChange = (type: string) => {
    setElectionType(type);
  };
  
  return (
    <section id="elections" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark mb-2">Portail des élections</h2>
        <p className="text-dark/70 mb-8">Suivez les résultats des élections dans le monde et leurs analyses</p>
        
        {/* Map and Featured Elections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Interactive Map */}
          <motion.div 
            className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 h-96"
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-4">Carte des élections récentes et à venir</h3>
            <div className="h-72 bg-light rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* This would be replaced with an actual interactive map */}
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1589519160732-576f165b9aaa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="World elections map" 
                  className="w-full h-full object-cover opacity-20"
                />
              </div>
              <div className="relative z-10 text-center p-6">
                <Globe className="h-16 w-16 text-secondary/40 mb-4" />
                <p className="text-dark font-medium">Carte interactive des élections mondiales</p>
                <p className="text-dark/60 text-sm">Cliquez sur un pays pour voir les détails des élections</p>
              </div>
            </div>
          </motion.div>
          
          {/* Upcoming Elections */}
          <motion.div 
            className="lg:col-span-1 bg-white rounded-xl shadow-md p-4"
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-4">Prochaines élections</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-[72px] w-full" />
                ))}
              </div>
            ) : (
              <motion.ul 
                className="space-y-3"
                variants={staggerChildren}
              >
                {upcomingElections?.map((election, index) => (
                  <motion.li 
                    key={election.id}
                    className="border-l-4 pl-3 py-2"
                    style={{ borderColor: getElectionTypeColor(election.type) }}
                    variants={staggerItem}
                    custom={index}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{election.country}</h4>
                        <p className="text-sm text-dark/70">{election.title}</p>
                      </div>
                      <span 
                        className="text-sm px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${getElectionTypeColor(election.type)}10`,
                          color: getElectionTypeColor(election.type)
                        }}
                      >
                        {formatDate(election.date, "MMMM yyyy")}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
            <div className="mt-4 text-center">
              <Button variant="link" className="text-secondary">
                Voir toutes les élections à venir →
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Recent Election Results */}
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 mb-10"
          variants={staggerItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Résultats des dernières élections</h3>
            <div className="flex space-x-2">
              <Button 
                variant={electionType === "presidential" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleElectionTypeChange("presidential")}
              >
                Présidentielles
              </Button>
              <Button 
                variant={electionType === "legislative" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleElectionTypeChange("legislative")}
              >
                Législatives
              </Button>
              <Button 
                variant={electionType === "local" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleElectionTypeChange("local")}
              >
                Locales
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentElections?.map(election => (
                <div key={election.id} className="border border-light rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <img 
                        src={`https://flagicons.lipis.dev/flags/4x3/${election.countryCode.toLowerCase()}.svg`} 
                        alt={election.country} 
                        className="w-8 h-6 object-cover mr-2"
                      />
                      <h4 className="font-bold">{`${election.country} - ${election.title}`}</h4>
                    </div>
                    <span className="text-xs text-dark/60">Mise à jour: {formatDate(election.createdAt, "dd/MM/yyyy")}</span>
                  </div>
                  
                  {/* Election Graph */}
                  <div className="mb-4 h-48 relative">
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-40">
                      {election.results.map((result, index) => (
                        <div key={index} className="flex flex-col items-center w-1/5">
                          <motion.div 
                            className="graph-bar w-12 rounded-t-md"
                            style={{ backgroundColor: result.color }}
                            variants={barChart}
                            custom={result.percentage}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                          ></motion.div>
                          <span className="mt-2 text-xs font-medium">{result.party}</span>
                          <span className="text-xs text-dark/60">{result.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button variant="link" className="text-secondary">
                      Voir l'analyse complète →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        
        {/* Election Analysis */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6"
            variants={staggerItem}
          >
            <h3 className="text-xl font-bold mb-4">Analyses d'experts</h3>
            <ul className="space-y-4">
              <li className="flex space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                  <ChartBar className="text-secondary text-2xl" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Les tendances de vote chez les jeunes</h4>
                  <p className="text-sm text-dark/70 mb-2">Comment les 18-30 ans influencent les résultats électoraux et pourquoi leur mobilisation est cruciale.</p>
                  <Button variant="link" className="text-secondary p-0 h-auto text-xs">
                    Lire l'analyse →
                  </Button>
                </div>
              </li>
              <li className="flex space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M20 15a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2"/><path d="M4 15a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/><path d="M12 8a2 2 0 0 0 2-2V4a2 2 0 0 0-4 0v2a2 2 0 0 0 2 2Z"/></svg>
                </div>
                <div>
                  <h4 className="font-medium mb-1">L'impact des réseaux sociaux sur les élections</h4>
                  <p className="text-sm text-dark/70 mb-2">Comment les plateformes numériques transforment les campagnes électorales et influencent l'opinion publique.</p>
                  <Button variant="link" className="text-secondary p-0 h-auto text-xs">
                    Lire l'analyse →
                  </Button>
                </div>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6"
            variants={staggerItem}
          >
            <h3 className="text-xl font-bold mb-4">Comprendre les systèmes électoraux</h3>
            <ul className="space-y-3">
              <li className="flex items-center p-2 bg-light/50 rounded-lg hover:bg-light transition-colors">
                <Book className="text-dark/40 mr-3 h-5 w-5" />
                <span>Le système électoral français expliqué simplement</span>
              </li>
              <li className="flex items-center p-2 bg-light/50 rounded-lg hover:bg-light transition-colors">
                <Book className="text-dark/40 mr-3 h-5 w-5" />
                <span>Présidentielle vs législatives : quelles différences ?</span>
              </li>
              <li className="flex items-center p-2 bg-light/50 rounded-lg hover:bg-light transition-colors">
                <Book className="text-dark/40 mr-3 h-5 w-5" />
                <span>Les systèmes électoraux dans le monde : tour d'horizon</span>
              </li>
              <li className="flex items-center p-2 bg-light/50 rounded-lg hover:bg-light transition-colors">
                <Book className="text-dark/40 mr-3 h-5 w-5" />
                <span>Le rôle des institutions européennes dans les élections</span>
              </li>
            </ul>
            <div className="mt-4 text-center">
              <Button className="bg-secondary hover:bg-secondary/90">
                Explorer tous les guides <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Helper function to get color based on election type
function getElectionTypeColor(type: string): string {
  switch (type) {
    case "presidential":
      return "#FF4D4D";
    case "legislative":
      return "#3B82F6";
    case "parliament":
      return "#8B5CF6";
    case "federal":
      return "#10B981";
    case "general":
      return "#F59E0B";
    default:
      return "#6B7280";
  }
}

export default ElectionsPortal;
