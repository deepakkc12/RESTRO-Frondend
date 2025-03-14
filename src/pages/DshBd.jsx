import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const currentWeekData = [
  { name: 'Mon', currentSales: 5000 },
  { name: 'Tue', currentSales: 2000 },
  { name: 'Wed', currentSales: 7500 },
  { name: 'Thu', currentSales: 6800 },
  { name: 'Fri', currentSales: 8200 },
  { name: 'Sat', currentSales: 7000 },
  { name: 'Sun', currentSales: 5500 },
];

const previousWeekData = [
  { name: 'Mon', previousSales: 4800 },
  { name: 'Tue', previousSales: 5500 },
  { name: 'Wed', previousSales: 6800 },
  { name: 'Thu', previousSales: 6200 },
  { name: 'Fri', previousSales: 7900 },
  { name: 'Sat', previousSales: 6500 },
  { name: 'Sun', previousSales: 5000 },
];

// Merge the two datasets based on the day of the week
const mergedData = currentWeekData.map((current, index) => ({
  ...current,
  previousSales: previousWeekData[index]?.previousSales || 0,
}));

const SalesComparisonChart = () => {
  const maxSales = Math.max(
    ...mergedData.flatMap(d => [d.currentSales, d.previousSales])
  );

  return (
    <AreaChart
      width={800}
      height={400}
      data={mergedData}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
    >
      <XAxis dataKey="name" />
      <YAxis type="number" domain={[0, maxSales]} />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      <Area
        type="monotone"
        dataKey="currentSales"
        stroke="#2BA697"
        fill="#2BA697"
        fillOpacity={0.5}
        name="Current Week"
      />
      <Area
        type="monotone"
        dataKey="previousSales"
        stroke="#0E60B6"
        fill="#0E60B6"
        fillOpacity={0.5}
        name="Previous Week"
      />
    </AreaChart>
  );
};

export default SalesComparisonChart;
