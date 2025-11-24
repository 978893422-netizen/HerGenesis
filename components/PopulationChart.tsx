import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SpeciesType } from '../types';

interface PopulationChartProps {
  data: { date: string; [key: string]: number | string }[];
}

const COLORS = {
  [SpeciesType.DODO]: '#e91e63', // Rose
  [SpeciesType.MAMMOTH]: '#00bcd4', // Diamond
  [SpeciesType.THYLACINE]: '#ffc107', // Gold
  [SpeciesType.IRISH_ELK]: '#9c27b0', // Violet
};

export const PopulationChart: React.FC<PopulationChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80 pixel-panel p-4">
      <h3 className="text-lg font-pixel mb-4 text-mc-dark uppercase border-b-4 border-mc-dark pb-2">Server Stats</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="0" stroke="#9e9e9e" vertical={true} horizontal={true} />
          <XAxis 
            dataKey="date" 
            stroke="#212121" 
            fontFamily="VT323"
            fontSize={16} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#212121" 
            fontFamily="VT323"
            fontSize={16} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '2px solid #eceff1', 
                fontFamily: 'VT323',
                color: '#fff',
                borderRadius: '0px' 
            }}
            itemStyle={{ fontSize: '16px' }}
          />
          {Object.values(SpeciesType).map((species) => (
            <Area
              key={species}
              type="step" 
              dataKey={species}
              stackId="1"
              stroke={COLORS[species]}
              strokeWidth={3}
              fill={COLORS[species]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};