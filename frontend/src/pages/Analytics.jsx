import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export default function Analytics() {
  const [loading, setLoading] = useState(true);

  // Mock Data
  const trendData = [
    { name: 'Sep 1', interactions: 12 }, { name: 'Sep 5', interactions: 19 },
    { name: 'Sep 10', interactions: 15 }, { name: 'Sep 15', interactions: 25 },
    { name: 'Sep 20', interactions: 22 }, { name: 'Sep 25', interactions: 30 },
    { name: 'Sep 30', interactions: 28 },
  ];

  const sentimentData = [
    { name: 'Positive', value: 65 },
    { name: 'Neutral', value: 25 },
    { name: 'Negative', value: 10 },
  ];
  const sentimentColors = ['#10b981', '#64748b', '#f43f5e'];

  const engagementData = [
    { name: 'High', value: 45 },
    { name: 'Medium', value: 35 },
    { name: 'Low', value: 20 },
  ];
  const engagementColors = ['#3b82f6', '#f59e0b', '#ef4444'];

  const typeData = [
    { name: 'Product Discussion', value: 40 },
    { name: 'Follow-up', value: 30 },
    { name: 'Meeting', value: 15 },
    { name: 'Call', value: 10 },
    { name: 'Other', value: 5 },
  ];
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 h-80 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="text-slate-400">Loading chart data...</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Interaction Trend */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Interaction Trend</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="interactions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorInteractions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interaction Types (Bar Chart) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Interaction Types</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13}} width={120} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Sentiment Breakdown</h2>
            <div className="h-72 flex flex-col items-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sentimentColors[index % sentimentColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-2 justify-center w-full">
                {sentimentData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: sentimentColors[index]}}></div>
                    <span className="text-sm text-slate-600 font-medium">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Engagement Levels */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Engagement Levels</h2>
            <div className="h-72 flex flex-col items-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%" cy="50%"
                    innerRadius={0}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={engagementColors[index % engagementColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-2 justify-center w-full">
                {engagementData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: engagementColors[index]}}></div>
                    <span className="text-sm text-slate-600 font-medium">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
