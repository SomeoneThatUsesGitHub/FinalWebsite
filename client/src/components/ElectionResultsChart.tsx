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

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={sortedResults} 
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis type="number" domain={[0, 100]} unit="%" />
        <YAxis 
          type="category" 
          dataKey="candidate" 
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(2)}%`, 'Résultat']} 
          labelFormatter={(label) => {
            const candidate = sortedResults.find(r => r.candidate === label);
            return `${label} (${candidate?.party || 'Indépendant'})`;
          }}
        />
        <Legend />
        <Bar dataKey="percentage" name="Pourcentage des voix">
          {sortedResults.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
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
          label={({ candidate, percentage }) => `${candidate}: ${percentage.toFixed(1)}%`}
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
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="shadow-md border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
          {type && <div>{type}</div>}
          {date && <div>{date}</div>}
          {location && <div>{location}</div>}
          {round && <div>Tour {round}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {displayType === 'bar' ? renderBarChart() : renderPieChart()}
      </CardContent>
    </Card>
  );
};

export default ElectionResultsChart;