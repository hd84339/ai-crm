import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Trash2, Edit2, AlertCircle } from 'lucide-react';

export default function FollowUps() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState({ today: [], upcoming: [], completed: [] });

  useEffect(() => {
    // Mocking fetch data
    setTimeout(() => {
      setTasks({
        today: [
          { id: 1, doctor: 'Dr. Patel', task: 'Share clinical data', priority: 'high', status: 'pending' },
          { id: 2, doctor: 'Dr. Sharma', task: 'Schedule follow-up', priority: 'medium', status: 'pending' }
        ],
        upcoming: [
          { id: 3, doctor: 'Dr. Mehta', task: 'Product discussion', date: 'Oct 2', priority: 'low', status: 'pending' }
        ],
        completed: [
          { id: 4, doctor: 'Dr. Singh', task: 'Send efficacy report', date: 'Sep 25', status: 'completed' }
        ]
      });
      setLoading(false);
    }, 500);
  }, []);

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
            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Complete">
              <CheckCircle className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
              <Edit2 className="w-4 h-4" />
            </button>
          </>
        )}
        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
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
          {/* Today Section */}
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

          {/* Upcoming Section */}
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

          {/* Completed Section */}
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
    </div>
  );
}
