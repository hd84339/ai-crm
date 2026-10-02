import React, { useState, useEffect } from 'react';
import { getInteractions } from '../services/api';
import { Calendar, MessageSquare, ThumbsUp, Activity, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Interactions() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [engagementFilter, setEngagementFilter] = useState('');

  useEffect(() => {
    fetchInteractions();
  }, [sentimentFilter, engagementFilter]);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const res = await getInteractions(1, sentimentFilter, engagementFilter);
      if (res.success) {
        setInteractions(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch interactions", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interactions</h1>
          <p className="text-slate-500">View and manage all your HCP interactions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={sentimentFilter} 
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full sm:w-40"
            >
              <option value="">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={engagementFilter} 
              onChange={(e) => setEngagementFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full sm:w-40"
            >
              <option value="">All Engagement</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading interactions...</div>
        ) : interactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No interactions found</h3>
            <p className="text-slate-500 max-w-sm">
              We couldn't find any interactions matching your current filters. Try adjusting them or log a new interaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                  <th className="p-4 font-semibold text-slate-600">Date</th>
                  <th className="p-4 font-semibold text-slate-600">HCP</th>
                  <th className="p-4 font-semibold text-slate-600">Type</th>
                  <th className="p-4 font-semibold text-slate-600">Notes</th>
                  <th className="p-4 font-semibold text-slate-600">Sentiment</th>
                  <th className="p-4 font-semibold text-slate-600">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interactions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium whitespace-nowrap">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(interaction.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {interaction.hcp_id ? (
                        <Link to={`/hcps/${interaction.hcp_id}`} className="text-blue-600 hover:text-blue-700 font-medium hover:underline whitespace-nowrap">
                          {interaction.doctor_name || 'View HCP'}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-900 whitespace-nowrap">{interaction.doctor_name || 'Unknown'}</span>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                        {interaction.type || 'Interaction'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div className="line-clamp-2 max-w-md" title={interaction.notes}>
                        {interaction.notes}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className={`w-4 h-4 ${
                          interaction.sentiment?.toLowerCase() === 'positive' ? 'text-emerald-500' :
                          interaction.sentiment?.toLowerCase() === 'negative' ? 'text-rose-500' : 'text-slate-400'
                        }`} />
                        <span className="text-sm font-medium text-slate-700">{interaction.sentiment || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <Activity className={`w-4 h-4 ${
                          interaction.engagement?.toLowerCase() === 'high' ? 'text-indigo-500' :
                          interaction.engagement?.toLowerCase() === 'low' ? 'text-amber-500' : 'text-slate-400'
                        }`} />
                        <span className="text-sm font-medium text-slate-700">{interaction.engagement || 'N/A'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
