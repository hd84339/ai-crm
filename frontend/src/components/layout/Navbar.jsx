import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1">
        <form className="flex w-full md:ml-0" action="#" method="GET" onSubmit={e => e.preventDefault()}>
          <label htmlFor="search-field" className="sr-only">Search</label>
          <div className="relative w-full text-slate-400 focus-within:text-slate-600 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="search-field"
              className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-slate-900 placeholder-slate-500 focus:border-transparent focus:placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm"
              placeholder="Search HCPs, interactions..."
              type="search"
              name="search"
            />
          </div>
        </form>
      </div>
      <div className="ml-4 flex items-center md:ml-6 space-x-4">
        <button className="text-slate-400 hover:text-slate-500">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex items-center space-x-2 text-sm font-medium text-slate-700 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
            <User className="h-5 w-5 text-slate-500" />
          </div>
          <span>Harsh</span>
        </div>
      </div>
    </header>
  );
}
