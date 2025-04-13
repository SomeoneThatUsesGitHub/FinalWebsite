import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';

export interface ElectionResult {
  candidate: string;
  party: string;
  votes?: number;
  percentage: number;
  color: string;
}

export interface ElectionResultsData {
  title: string;
  date: string;
  type: string;
  round?: number;
  location?: string;
  totalVotes?: number;
  results: ElectionResult[];
  displayType?: 'bar' | 'pie';
}

interface ElectionResultsChartProps {
  data: ElectionResultsData;
}

export const ElectionResultsChart: React.FC<ElectionResultsChartProps> = ({ data }) => {
  const { title, date, type, round, location, results } = data;
  
  // État pour détecter la taille de l'écran
  const [isMobile, setIsMobile] = React.useState(false);
  
  // Détecter la taille de l'écran au chargement et lors du redimensionnement
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Vérifier immédiatement
    checkScreenSize();
    
    // Mettre à jour lors du redimensionnement
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  
  // Trier les résultats par pourcentage (ordre décroissant)
  const sortedResults = [...results].sort((a, b) => b.percentage - a.percentage);

  const renderBarChart = () => {
    // Définir différentes hauteurs en fonction du nombre de candidats
    const dynamicHeight = Math.max(300, sortedResults.length * 60);
    
    return (
      <div className="overflow-x-auto overflow-y-visible -mx-2 sm:mx-0">
        <div style={{ minWidth: '300px', width: '100%', minHeight: dynamicHeight, height: 'auto' }} className="pl-0">
          <ResponsiveContainer width="100%" height={dynamicHeight}>
            <BarChart 
              data={sortedResults} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                unit="%" 
                tickFormatter={(value) => `${value}%`}
                fontSize={12}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                type="category" 
                dataKey="candidate" 
                width={100}
                tick={{ fontSize: 12, fontWeight: 500, fill: '#333' }}
                tickFormatter={(value) => value.length > 14 ? `${value.substring(0, 12)}...` : value}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Résultat']} 
                labelFormatter={(label) => {
                  const candidate = sortedResults.find(r => r.candidate === label);
                  return `${label} (${candidate?.party || 'Indépendant'})`;
                }}
                contentStyle={{ fontSize: '14px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}
              />
              <Bar dataKey="percentage" name="Pourcentage des voix" barSize={28} radius={[4, 4, 4, 4]}>
                {sortedResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="percentage" position="right" formatter={(value: number) => `${value.toFixed(1)}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    // Fonction pour simplifier les noms trop longs dans les légendes
    const simplifyName = (name: string) => name.length > 14 ? `${name.substring(0, 12)}...` : name;
    
    // Fonction pour générer des étiquettes adaptées aux petits écrans
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, candidate }: any) => {
      const RADIAN = Math.PI / 180;
      const radius = outerRadius * 1.1;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      
      // N'afficher les étiquettes que pour les segments importants (>5%)
      if (percent < 0.05) return null;
      
      return (
        <text 
          x={x} 
          y={y} 
          fill={sortedResults[index].color}
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      );
    };
    
    return (
      <div className="overflow-x-auto overflow-y-visible -mx-2 sm:mx-0">
        <div style={{ minWidth: '300px', minHeight: '300px' }} className="pl-0">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Pie
                data={sortedResults}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="percentage"
                nameKey="candidate"
                label={renderCustomizedLabel}
              >
                {sortedResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Résultat']} 
                labelFormatter={(label) => {
                  const candidate = sortedResults.find(r => r.candidate === label);
                  return `${label} (${candidate?.party || 'Indépendant'})`;
                }}
                contentStyle={{ fontSize: '14px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}
              />
              <Legend 
                formatter={(value) => <span style={{ fontSize: '11px' }}>{simplifyName(value)}</span>}
                wrapperStyle={{ fontSize: '11px', padding: '8px 0' }}
                layout="horizontal"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-3 bg-white rounded-lg overflow-hidden border shadow-md p-2 sm:p-4">
      <div className="mb-2 sm:mb-3">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-1">
          {type && <div className="font-medium">{type}</div>}
          {date && <div>{date}</div>}
          {location && <div>{location}</div>}
          {round && <div className="font-medium">Tour {round}</div>}
        </div>
      </div>
      <div className="mt-3 sm:mt-4">
        {isMobile ? renderPieChart() : renderBarChart()}
      </div>
    </div>
  );
};

export default ElectionResultsChart;