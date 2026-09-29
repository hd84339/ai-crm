import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, User, Calendar, Activity, X, Trash2 } from 'lucide-react';
import { getHcps, createHcp, deleteHcp } from '../services/api';

export default function HCPList() {
  const [hcps, setHcps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHcp, setNewHcp] = useState({ name: '', specialty: '', location: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHcps();
  }, []);

  const fetchHcps = async () => {
    try {
      setLoading(true);
      const res = await getHcps();
      if (res.success) {
        setHcps(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch HCPs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHcp = async (e) => {
    e.preventDefault();
    if (!newHcp.name) return;
    
    try {
      setSubmitting(true);
      const res = await createHcp(newHcp);
      if (res.success) {
        setIsModalOpen(false);
        setNewHcp({ name: '', specialty: '', location: '', email: '', phone: '' });
        fetchHcps(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to create HCP", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHcp = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will also delete all associated interactions and follow-ups.`)) {
      return;
    }
    try {
      await deleteHcp(id);
      fetchHcps();
    } catch (error) {
      console.error("Failed to delete HCP", error);
    }
  };

  const filteredHcps = hcps.filter(hcp => 
    hcp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hcp.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h2 className="font-bold text-lg text-slate-900">Add New HCP</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddHcp} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input required type="text" value={newHcp.name} onChange={e => setNewHcp({...newHcp, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dr. Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                <input type="text" value={newHcp.specialty} onChange={e => setNewHcp({...newHcp, specialty: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Cardiologist" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input type="text" value={newHcp.location} onChange={e => setNewHcp({...newHcp, location: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="City, State" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add HCP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Healthcare Professionals</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add HCP
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search HCPs by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading HCPs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">HCP</th>
                  <th className="px-6 py-3">Specialty</th>
                  <th className="px-6 py-3">Engagement</th>
                  <th className="px-6 py-3">Last Contact</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHcps.map((hcp) => (
                  <tr key={hcp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/hcps/${hcp.id}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {hcp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{hcp.name}</div>
                          <div className="text-xs text-slate-500">{hcp.location}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{hcp.specialty}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${hcp.engagement === 'High' ? 'bg-emerald-100 text-emerald-700' : 
                          hcp.engagement === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {hcp.engagement}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {hcp.lastContact}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteHcp(hcp.id, hcp.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" 
                        title="Delete HCP"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredHcps.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      No HCPs found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
