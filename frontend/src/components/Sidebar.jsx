import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  Trophy, 
  ShoppingBag, 
  MessageSquareOff, 
  MessageSquare,
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Leaf,
  UserCircle,
  Award,
  Newspaper,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'challenges', label: 'Eco Challenges', icon: Award },
    { id: 'marketplace', label: 'Rewards Catalog', icon: ShoppingBag },
    { id: 'chat', label: 'AI Advisor', icon: MessageSquare },
    { id: 'forums', label: 'Eco Forums', icon: Newspaper },
    { id: 'profile', label: 'Profile & Rewards', icon: UserCircle },
  ];

  return (
    <div 
      className={`fixed top-0 left-0 h-screen z-30 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-emerald-500 text-white p-2 rounded-xl shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-emerald-400 whitespace-nowrap">
              EcoSpend <span className="text-emerald-500 dark:text-emerald-300 font-light">AI</span>
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Quick Info (Interactive Click to Profile) */}
      {user && (
        <button 
          onClick={() => setActiveView('profile')}
          className="w-[calc(100%-1.5rem)] mx-3 my-2.5 p-3 border border-slate-100 hover:border-emerald-500/25 hover:bg-slate-50 dark:hover:bg-slate-850 dark:border-slate-800/60 rounded-2xl flex flex-col items-center transition-all duration-200 cursor-pointer shadow-sm group shrink-0"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden mb-2 shadow-sm border border-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="text-center w-full">
              <p className="font-semibold text-slate-800 dark:text-white truncate group-hover:text-emerald-500 transition-colors duration-250">{user.name}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                🌱 {user.ecoPoints} Points
              </div>
            </div>
          )}
        </button>
      )}

      {/* Navigation Menu Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                isActive 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
        {/* Logout Button (on top of Dark Mode) */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun className="w-5 h-5 text-amber-400 shrink-0" />
              {!isCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-indigo-500 shrink-0" />
              {!isCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
