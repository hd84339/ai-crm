import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_hcps: 0,
    total_interactions: 0,
    follow_ups_due: 0,
    positive_sentiment_percent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming backend runs on 8000
    axios.get('http://127.0.0.1:8000/analytics/dashboard')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard stats", err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Good morning, Harsh 👋</h1>
      
      {loading ? (
        <div className="text-slate-500">Loading dashboard data...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-slate-900">{stats.total_hcps}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Total HCPs</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-slate-900">{stats.total_interactions}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Interactions</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-amber-600">{stats.follow_ups_due}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Follow-ups Due</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600">{stats.positive_sentiment_percent}%</div>
            <div className="text-sm font-medium text-slate-500 mt-1">Positive Sentiment</div>
          </div>
        </div>
      )}
    </div>
  );
}
