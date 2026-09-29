import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, MessageSquare, Calendar, BarChart3, Bot, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'HCPs', href: '/hcps', icon: Users },
    { name: 'Interactions', href: '/interactions', icon: MessageSquare },
    { name: 'Follow-ups', href: '/follow-ups', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Copilot', href: '/copilot', icon: Bot },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 h-screen fixed top-0 left-0">
      <div className="flex h-16 shrink-0 items-center px-6 text-white font-bold text-xl border-b border-slate-800">
        <span className="text-blue-500 mr-2">✦</span> AI CRM
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                  )
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-white" />
          Settings
        </a>
      </div>
    </div>
  );
}
