import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ParliamentSeat {
  party: string;
  count: number;
  color: string;
}

export interface ParliamentData {
  title: string;
  totalSeats: number;
  seats: ParliamentSeat[];
}

interface ParliamentChartProps {
  data: ParliamentData;
}

export const ParliamentChart: React.FC<ParliamentChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Nettoyer le contenu précédent
    d3.select(chartRef.current).selectAll('*').remove();

    // Dimensions du graphique
    const width = chartRef.current.clientWidth;
    const height = 400;
    const innerRadius = Math.min(width, height) * 0.25;
    const outerRadius = Math.min(width, height) * 0.45;

    // Créer le SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Calculer le nombre total de sièges et l'angle par siège
    const totalSeats = data.totalSeats;
    const anglePerSeat = (Math.PI) / totalSeats;

    // Générer toutes les positions des sièges
    let allSeats: { angle: number; party: string; color: string }[] = [];
    
    // Créer des rangées concentriques de sièges
    const rows = 5; // Nombre de rangées dans l'hémicycle
    const seatsPerRow = Math.ceil(totalSeats / rows);
    
    let currentSeatIndex = 0;
    let remainingSeats = new Map(data.seats.map(seat => [seat.party, seat.count]));
    let partyColors = new Map(data.seats.map(seat => [seat.party, seat.color]));
    
    // Calculer l'angle de départ et de fin pour l'arc hémicyclique
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;
    const totalAngle = endAngle - startAngle;
    
    // Générer les sièges en rangées concentriques
    for (let row = 0; row < rows; row++) {
      const rowRadius = innerRadius + (outerRadius - innerRadius) * (row / (rows - 1));
      const currentRowSeats = Math.min(seatsPerRow, totalSeats - currentSeatIndex);
      
      for (let i = 0; i < currentRowSeats; i++) {
        const angle = startAngle + (i / (currentRowSeats - 1)) * totalAngle;
        
        // Déterminer le parti de ce siège
        let selectedParty = '';
        for (const [party, count] of remainingSeats.entries()) {
          if (count > 0) {
            selectedParty = party;
            remainingSeats.set(party, count - 1);
            break;
          }
        }
        
        if (selectedParty) {
          allSeats.push({
            angle,
            party: selectedParty,
            color: partyColors.get(selectedParty) || '#cccccc'
          });
          
          currentSeatIndex++;
        }
      }
    }

    // Dessiner les sièges
    svg.selectAll('circle')
      .data(allSeats)
      .join('circle')
      .attr('cx', d => Math.cos(d.angle) * (innerRadius + (row => (outerRadius - innerRadius) * (row / (rows - 1)))(Math.floor(allSeats.indexOf(d) / seatsPerRow))))
      .attr('cy', d => Math.sin(d.angle) * (innerRadius + (row => (outerRadius - innerRadius) * (row / (rows - 1)))(Math.floor(allSeats.indexOf(d) / seatsPerRow))))
      .attr('r', 8)
      .attr('fill', d => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 10)
          .attr('opacity', 1)
          .attr('stroke-width', 2);
        
        // Afficher une infobulle
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${Math.cos(d.angle) * (innerRadius + (row => (outerRadius - innerRadius) * (row / (rows - 1)))(Math.floor(allSeats.indexOf(d) / seatsPerRow)))}, ${Math.sin(d.angle) * (innerRadius + (row => (outerRadius - innerRadius) * (row / (rows - 1)))(Math.floor(allSeats.indexOf(d) / seatsPerRow))) - 20})`);
        
        tooltip.append('rect')
          .attr('width', d.party.length * 8 + 20)
          .attr('height', 25)
          .attr('x', -d.party.length * 4 - 10)
          .attr('y', -25)
          .attr('rx', 5)
          .attr('fill', 'white')
          .attr('stroke', d.color)
          .attr('stroke-width', 1);
        
        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -10)
          .attr('fill', '#333')
          .text(d.party);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 8)
          .attr('opacity', 0.9)
          .attr('stroke-width', 1);
        
        svg.selectAll('.tooltip').remove();
      });

    // Ajouter l'arc hémicyclique
    const arc = d3.arc()
      .innerRadius(innerRadius * 0.9)
      .outerRadius(innerRadius * 0.95)
      .startAngle(startAngle)
      .endAngle(endAngle);

    svg.append('path')
      .attr('d', arc as any)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#cccccc')
      .attr('stroke-width', 1);

    // Ajouter une légende
    const legend = svg.append('g')
      .attr('transform', `translate(${-width / 2 + 20}, ${-height / 2 + 20})`);

    data.seats.forEach((seat, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendItem.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', seat.color)
        .attr('rx', 2);

      legendItem.append('text')
        .attr('x', 25)
        .attr('y', 12)
        .text(`${seat.party} (${seat.count})`)
        .attr('font-size', '12px')
        .attr('fill', '#333');
    });

  }, [data, chartRef]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={chartRef} 
          className="w-full"
          style={{ minHeight: '400px' }}
        />
      </CardContent>
    </Card>
  );
};