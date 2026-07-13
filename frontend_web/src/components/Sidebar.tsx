import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Lemari', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { path: '/styling', label: 'Asisten', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
  ];

  return (
    <aside className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto md:w-64 bg-slate-900 text-slate-300 md:min-h-screen flex md:flex-col z-50 border-t md:border-t-0 border-slate-800 shadow-2xl md:shadow-none">
      <div className="hidden md:block p-6">
        <h1 className="text-xl font-bold text-white tracking-tight">SmartWardrobe AI</h1>
      </div>
      <nav className="flex-1 px-2 py-2 md:px-4 space-x-2 md:space-x-0 md:space-y-2 md:mt-4 flex flex-row md:flex-col justify-around md:justify-start">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg font-medium transition-colors w-full justify-center md:justify-start ${
                isActive ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon}></path>
              </svg>
              <span className="text-[10px] md:text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
