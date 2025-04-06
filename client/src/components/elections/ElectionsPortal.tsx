import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerChildren, staggerItem } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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
    seats?: number;
  }>;
  description: string;
  upcoming: boolean;
  createdAt: string;
};

const ElectionsPortal: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  const { data: elections, isLoading } = useQuery<Election[]>({
    queryKey: ['/api/elections/recent'],
  });
  
  // Get unique list of countries from elections data
  const countries = elections ? 
    Array.from(new Set(elections.map(election => election.country)))
      .map(country => {
        const election = elections.find(e => e.country === country);
        return {
          name: country,
          code: election?.countryCode || ''
        };
      }) : [];
  
  // Find the selected election based on country
  const selectedElection = selectedCountry ? 
    elections?.find(election => election.country === selectedCountry) : 
    (elections && elections.length > 0 ? elections[0] : null);
    
  // Function to calculate total seats
  const calculateTotalSeats = () => {
    if (!selectedElection?.results) return 0;
    return selectedElection.results.reduce((sum, party) => sum + (party.seats || 0), 0);
  };
  
  const totalSeats = calculateTotalSeats();
  
  // Format data for pie chart (parliament visualization)
  const getChartData = () => {
    if (!selectedElection?.results) return [];
    return selectedElection.results.map(result => ({
      name: result.party,
      value: result.seats || Math.round(result.percentage),
      color: result.color,
      percentage: result.percentage
    }));
  };
  
  return (
    <section id="elections" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">Résultats des élections</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Consultez les résultats détaillés des dernières élections dans différents pays et découvrez la composition des parlements.
          </p>
        </motion.div>
        
        {/* Country Selector */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="max-w-md mx-auto mb-10"
        >
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-4 text-center">Sélectionner un pays</h3>
            
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedCountry || (elections && elections.length > 0 ? elections[0].country : '')}
                onValueChange={(value) => setSelectedCountry(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      <div className="flex items-center">
                        <img 
                          src={`https://flagicons.lipis.dev/flags/4x3/${country.code.toLowerCase()}.svg`} 
                          alt={country.name} 
                          className="w-5 h-4 mr-2" 
                        />
                        {country.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </motion.div>
        
        {/* Election Results */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : selectedElection ? (
            <div>
              {/* Header with flag and title */}
              <div className="bg-gray-50 p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={`https://flagicons.lipis.dev/flags/4x3/${selectedElection.countryCode.toLowerCase()}.svg`} 
                      alt={selectedElection.country} 
                      className="w-10 h-7 mr-3" 
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedElection.country}</h3>
                      <p className="text-gray-600">{selectedElection.title} - {formatDate(selectedElection.date, "MMMM yyyy")}</p>
                    </div>
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {selectedElection.type}
                  </span>
                </div>
              </div>
              
              {/* Parliament Visualization */}
              <div className="p-6">
                <h4 className="text-lg font-medium mb-6 text-center">Répartition des sièges au parlement</h4>
                
                <div className="flex flex-col lg:flex-row">
                  {/* Pie Chart */}
                  <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={getChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={140}
                          fill="#8884d8"
                          paddingAngle={1}
                          dataKey="value"
                          label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                        >
                          {getChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => {
                            return [`${value} sièges (${props.payload.percentage.toFixed(1)}%)`, name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Parties Legend */}
                  <div className="w-full lg:w-1/2 lg:pl-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-4">Partis politiques</h5>
                      <div className="space-y-4">
                        {selectedElection.results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3" 
                                style={{ backgroundColor: result.color }}
                              ></div>
                              <span className="font-medium">{result.party}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold">{result.seats || Math.round((result.percentage / 100) * totalSeats)}</span>
                              <span className="text-gray-500 text-sm ml-1">sièges</span>
                              <span className="block text-sm text-gray-500">{result.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="font-medium">Total</span>
                          <span className="font-bold">{totalSeats} sièges</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Election Description */}
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">À propos de cette élection</h5>
                      <p className="text-sm text-gray-700">{selectedElection.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">Aucun résultat d'élection disponible</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ElectionsPortal;
