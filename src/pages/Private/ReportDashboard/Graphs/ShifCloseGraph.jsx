import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const ShiftCloseGraphs = ({ data }) => {
  // Calculate variance data for each payment method
  const varianceData = useMemo(() => {
    return data.map(item => ({
      name: `${item.LoginCode} (${item.TOT})`,
      Cash: Math.abs(Number(item.Cash) - Number(item.ActualCash)),
      Card: Math.abs(Number(item.Card) - Number(item.ActualCard)),
      Wallet1: Math.abs(Number(item.Wallet1) - Number(item.ActualWallet1)),
      Wallet2: Math.abs(Number(item.Wallet2) - Number(item.ActualWallet2)),
      user: item.LoginCode,
      time: item.TOT
    }));
  }, [data]);

  // Daily totals per payment method
  const dailySummary = useMemo(() => {
    return data.map(item => ({
      name: item.DOT,
      ActualTotal: (
        Number(item.ActualCash) +
        Number(item.ActualCard) +
        Number(item.ActualWallet1) +
        Number(item.ActualWallet2)
      ),
      ReportedTotal: (
        Number(item.Cash) +
        Number(item.Card) +
        Number(item.Wallet1) +
        Number(item.Wallet2)
      )
    }));
  }, [data]);

  // User accuracy analysis
  const userAccuracy = useMemo(() => {
    const userStats = data.reduce((acc, item) => {
      const user = item.LoginCode;
      if (!acc[user]) {
        acc[user] = { correct: 0, total: 0 };
      }
      
      const checks = [
        [item.Cash, item.ActualCash],
        [item.Card, item.ActualCard],
        [item.Wallet1, item.ActualWallet1],
        [item.Wallet2, item.ActualWallet2]
      ];
      
      checks.forEach(([reported, actual]) => {
        acc[user].total++;
        if (Number(reported) === Number(actual)) {
          acc[user].correct++;
        }
      });
      
      return acc;
    }, {});

    return Object.entries(userStats).map(([name, stats]) => ({
      name,
      accuracy: (stats.correct / stats.total) * 100
    }));
  }, [data]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Variance Tracking */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Payment Method Variances</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={varianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Cash" fill="#0088FE" />
              <Bar dataKey="Card" fill="#00C49F" />
              <Bar dataKey="Wallet1" fill="#FFBB28" />
              <Bar dataKey="Wallet2" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Sales Comparison */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Reported vs Actual Sales</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={dailySummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ActualTotal" 
                stroke="#0088FE" 
                name="Actual Total"
              />
              <Line 
                type="monotone" 
                dataKey="ReportedTotal" 
                stroke="#00C49F" 
                name="Reported Total"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Accuracy */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">User Input Accuracy (%)</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <RadarChart outerRadius={90} data={userAccuracy}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="Accuracy"
                dataKey="accuracy"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time-based Variance Trends */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Variance by Time of Day</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={varianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Cash" stroke="#0088FE" />
              <Line type="monotone" dataKey="Card" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Performance Comparison */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">User Performance Comparison</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={userAccuracy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#8884d8">
                {userAccuracy.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.accuracy > 90 ? '#00C49F' : '#FF8042'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Total Sales Distribution */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Payment Methods Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={varianceData}
                dataKey="Cash"
                nameKey="user"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#0088FE"
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ShiftCloseGraphs;