import React from 'react';
import {
  Brain,
  RefreshCw,
  Code,
  Home,
  HeartPulse,
  CalendarCheck,
  MapPin,
  ShieldAlert,
  Terminal
} from 'lucide-react';
import { PRESETS, PersonaPreset } from '../data/presets.ts';
import { ActiveTab } from '../types/lifeos.ts';

interface HeaderProps {
  currentPreset: PersonaPreset;
  onSelectPreset: (preset: PersonaPreset) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onEvaluate: () => void;
  isEvaluating: boolean;
  engineSource?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  activeTab,
  setActiveTab,
  onEvaluate,
  isEvaluating,
  engineSource,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
    activeClass: string;
  }[] = [
    {
      id: 'home',
      label: 'Home Hub',
      shortLabel: 'Home',
      icon: Home,
      activeClass: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400 font-bold',
    },
    {
      id: 'wellness',
      label: 'Feature 1: Wellness',
      shortLabel: '1. Wellness',
      icon: HeartPulse,
      badge: '5 Qs',
      activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400 font-bold',
    },
    {
      id: 'schedule',
      label: 'Feature 2: Schedule',
      shortLabel: '2. Schedule',
      icon: CalendarCheck,
      badge: 'Audit',
      activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400 font-bold',
    },
    {
      id: 'location',
      label: 'Feature 3: Location',
      shortLabel: '3. Location',
      icon: MapPin,
      badge: 'Auto',
      activeClass: 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400 font-bold',
    },
    {
      id: 'comms',
      label: 'Feature 4: Proxy Screener',
      shortLabel: '4. Proxy',
      icon: ShieldAlert,
      badge: 'Proxy',
      activeClass: 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400 font-bold',
    },
    {
      id: 'prompt_engine',
      label: 'Prompt Engine',
      shortLabel: 'Prompt',
      icon: Terminal,
      badge: 'AI',
      activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400 font-bold',
    },
    {
      id: 'json',
      label: 'Strict JSON',
      shortLabel: 'JSON',
      icon: Code,
      badge: 'Schema',
      activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400 font-bold',
    },
  ];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50 shadow-xl">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="group flex items-center space-x-3 text-left cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Brain className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                    LifeOS
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Gemini 3.8
                  </span>
                  {engineSource && (
                    <span className="hidden sm:inline-block text-[8px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {engineSource}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 hidden sm:block">
                  Autonomous Schedule Engine &bull; 4 Multimodal Features
                </p>
              </div>
            </button>
          </div>

          {/* Persona & Preset Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
              <span className="text-zinc-500 px-2 font-mono text-[10px] uppercase tracking-wider">Persona:</span>
              <select
                value={currentPreset.id}
                onChange={(e) => {
                  const found = PRESETS.find((p) => p.id === e.target.value);
                  if (found) onSelectPreset(found);
                }}
                className="bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Run LifeOS Evaluation Button */}
            <button
              type="button"
              onClick={onEvaluate}
              disabled={isEvaluating}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs tracking-wide transition-all shadow-md cursor-pointer ${
                isEvaluating
                  ? 'bg-indigo-800/50 text-indigo-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/25 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Auditing...' : 'Audit Schedule'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Screen Navigation Tabs Bar */}
      <div className="border-t border-zinc-800/80 bg-zinc-950/95 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? item.activeClass
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                  }`}
                  title={`Switch to ${item.label}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.shortLabel}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        isActive
                          ? 'bg-black/30 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
