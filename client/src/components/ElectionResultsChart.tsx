import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

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
  const { title, date, type, round, location, results, displayType = 'bar' } = data;
  
  // Trier les résultats par pourcentage (ordre décroissant)
  const sortedResults = [...results].sort((a, b) => b.percentage - a.percentage);

  const renderBarChart = () => {
    // Définir différentes hauteurs en fonction du nombre de candidats
    const dynamicHeight = Math.max(250, sortedResults.length * 40);
    
    return (
      <div className="overflow-x-auto">
        <div style={{ minWidth: '300px', width: '100%', height: dynamicHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={sortedResults} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                unit="%" 
                tickFormatter={(value) => `${value}%`}
                fontSize={11}
              />
              <YAxis 
                type="category" 
                dataKey="candidate" 
                width={100}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 12)}...` : value}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Résultat']} 
                labelFormatter={(label) => {
                  const candidate = sortedResults.find(r => r.candidate === label);
                  return `${label} (${candidate?.party || 'Indépendant'})`;
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
              />
              <Bar dataKey="percentage" name="Pourcentage des voix">
                {sortedResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    // Fonction pour simplifier les noms trop longs dans les légendes
    const simplifyName = (name: string) => name.length > 12 ? `${name.substring(0, 10)}...` : name;
    
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
          fontSize={10}
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      );
    };
    
    return (
      <div className="overflow-x-auto">
        <div style={{ minWidth: '280px', minHeight: '280px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sortedResults}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
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
              />
              <Legend 
                formatter={(value) => <span style={{ fontSize: '11px' }}>{simplifyName(value)}</span>}
                wrapperStyle={{ fontSize: '11px' }}
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
    <Card className="shadow-md border overflow-hidden" style={{ backgroundColor: 'white' }}>
      <CardHeader className="pb-2" style={{ backgroundColor: 'white' }}>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
          {type && <div>{type}</div>}
          {date && <div>{date}</div>}
          {location && <div>{location}</div>}
          {round && <div>Tour {round}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-2" style={{ backgroundColor: 'white' }}>
        {displayType === 'bar' ? renderBarChart() : renderPieChart()}
      </CardContent>
    </Card>
  );
};

export default ElectionResultsChart;