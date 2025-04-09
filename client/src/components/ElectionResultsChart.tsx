import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { title, date, type, round, location, results, displayType = 'bar' } = data;
  
  // Trier les résultats par pourcentage (ordre décroissant)
  const sortedResults = [...results].sort((a, b) => b.percentage - a.percentage);

  const renderBarChart = () => {
    // Définir différentes hauteurs en fonction du nombre de candidats
    const dynamicHeight = Math.max(300, sortedResults.length * 50);
    
    return (
      <div className="overflow-x-auto overflow-y-visible">
        <div style={{ minWidth: '350px', width: '100%', minHeight: dynamicHeight, height: 'auto' }}>
          <ResponsiveContainer width="100%" height={dynamicHeight}>
            <BarChart 
              data={sortedResults} 
              layout="vertical"
              margin={{ top: 10, right: 30, left: 25, bottom: 10 }}
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
                width={120}
                tick={{ fontSize: 13, fontWeight: 500, fill: '#333' }}
                tickFormatter={(value) => value.length > 16 ? `${value.substring(0, 14)}...` : value}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'Résultat']} 
                labelFormatter={(label) => {
                  const candidate = sortedResults.find(r => r.candidate === label);
                  return `${label} (${candidate?.party || 'Indépendant'})`;
                }}
                contentStyle={{ fontSize: '14px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', padding: '10px 0' }}
                formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
              />
              <Bar dataKey="percentage" name="Pourcentage des voix" barSize={24}>
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
      <div className="overflow-x-auto overflow-y-visible">
        <div style={{ minWidth: '320px', minHeight: '350px' }}>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={sortedResults}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
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
                formatter={(value) => <span style={{ fontSize: '12px' }}>{simplifyName(value)}</span>}
                wrapperStyle={{ fontSize: '12px', padding: '10px 0' }}
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
    <Card className="shadow-md border overflow-hidden election-chart-card" style={{ backgroundColor: 'white' }}>
      <CardHeader className="pb-2 update-card-header" style={{ backgroundColor: 'white' }}>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
          {type && <div className="font-medium">{type}</div>}
          {date && <div>{date}</div>}
          {location && <div>{location}</div>}
          {round && <div className="font-medium">Tour {round}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-2 update-card-content" style={{ backgroundColor: 'white' }}>
        {displayType === 'bar' ? renderBarChart() : renderPieChart()}
      </CardContent>
    </Card>
  );
};

export default ElectionResultsChart;