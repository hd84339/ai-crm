import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Trash2, Edit2, AlertCircle, X } from 'lucide-react';
import { getFollowUps, getHcps, updateFollowUp, deleteFollowUp } from '../services/api';

export default function FollowUps() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState({ today: [], upcoming: [], completed: [] });
  
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ task: '', date: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getFollowUps();
      
      const hcpsRes = await getHcps('', 1, 1000); 
      const hcpsMap = {};
      if (hcpsRes.success) {
        hcpsRes.data.forEach(h => {
          hcpsMap[h.id] = h.name;
        });
      }

      if (res.success) {
        const today = [];
        const upcoming = [];
        const completed = [];
        
        const now = new Date();
        now.setHours(0,0,0,0);
        
        res.data.forEach(followup => {
          const item = {
            id: followup.id,
            doctor: hcpsMap[followup.hcp_id] || `HCP #${followup.hcp_id}`,
            task: followup.task,
            rawDate: followup.due_date,
            date: followup.due_date ? new Date(followup.due_date).toLocaleDateString() : null,
            priority: 'medium', // Default
            status: followup.status
          };
          
          if (followup.status?.toLowerCase() === 'completed') {
            completed.push(item);
          } else {
            if (followup.due_date && new Date(followup.due_date) > new Date()) {
              upcoming.push(item);
            } else {
              today.push(item);
            }
          }
        });
        
        setTasks({ today, upcoming, completed });
      }
    } catch (error) {
      console.error("Failed to fetch follow-ups", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await updateFollowUp(id, { status: 'Completed' });
      fetchTasks();
    } catch (error) {
      console.error("Failed to complete task", error);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this follow-up?")) return;
    try {
      await deleteFollowUp(id);
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };
  
  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditForm({
      task: task.task,
      date: task.rawDate ? new Date(task.rawDate).toISOString().slice(0, 16) : ''
    });
  };
  
  const saveEdit = async () => {
    try {
      await updateFollowUp(editingTask, { 
        task: editForm.task,
        due_date: editForm.date ? new Date(editForm.date).toISOString() : null
      });
      setEditingTask(null);
      fetchTasks();
    } catch(err) {
      console.error("Error editing", err);
    }
  };

  const TaskCard = ({ task, section }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
      <div className="flex items-start gap-4">
        {section === 'completed' ? (
          <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
        ) : (
          <div className={`w-3 h-3 rounded-full mt-2 shrink-0 ${
            task.priority === 'high' ? 'bg-rose-500' : 
            task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
          }`} />
        )}
        
        <div>
          <h3 className={`font-bold ${section === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
            {task.doctor}
          </h3>
          <p className={`text-sm ${section === 'completed' ? 'text-slate-400' : 'text-slate-600'}`}>
            {task.task}
          </p>
          {task.date && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
              <Calendar className="w-3 h-3" />
              {task.date}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {section !== 'completed' && (
          <>
            <button onClick={() => handleComplete(task.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Complete">
              <CheckCircle className="w-4 h-4" />
            </button>
            <button onClick={() => startEdit(task)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
              <Edit2 className="w-4 h-4" />
            </button>
          </>
        )}
        <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Follow-ups Management</h1>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Clock className="w-4 h-4" />
          Create Follow-up
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 animate-pulse bg-white rounded-xl border border-slate-200">
          Loading tasks...
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-slate-900">Today</h2>
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                {tasks.today.length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.today.length > 0 ? (
                tasks.today.map(task => <TaskCard key={task.id} task={task} section="today" />)
              ) : (
                <p className="text-sm text-slate-500 italic">No tasks due today.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-slate-900">Upcoming</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                {tasks.upcoming.length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.upcoming.length > 0 ? (
                tasks.upcoming.map(task => <TaskCard key={task.id} task={task} section="upcoming" />)
              ) : (
                <p className="text-sm text-slate-500 italic">No upcoming tasks.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2 opacity-60">
              <CheckCircle className="w-5 h-5 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-500">Completed</h2>
            </div>
            <div className="space-y-3 opacity-75">
              {tasks.completed.length > 0 ? (
                tasks.completed.map(task => <TaskCard key={task.id} task={task} section="completed" />)
              ) : (
                <p className="text-sm text-slate-500 italic">No completed tasks yet.</p>
              )}
            </div>
          </section>
        </div>
      )}
      
      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">Edit Follow-up</h2>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Description</label>
                <input
                  type="text"
                  value={editForm.task}
                  onChange={e => setEditForm({...editForm, task: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={editForm.date}
                  onChange={e => setEditForm({...editForm, date: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button onClick={() => setEditingTask(null)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={saveEdit} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm shadow-blue-500/30">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
