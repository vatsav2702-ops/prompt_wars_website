import React, { useState } from 'react';
import { Feature3LocationAutomation, LocationTriggerContext } from '../types/lifeos.ts';
import { MapPin, Navigation, Copy, Check, Sparkles, BookOpen, Activity, Home, Cpu, Coffee, Send, Mail, ListChecks } from 'lucide-react';
import { AVAILABLE_LOCATIONS } from '../data/presets.ts';

interface Feature3LocationAutomationProps {
  automation: Feature3LocationAutomation;
  locationContext: LocationTriggerContext;
  onUpdateLocation: (newLocation: string, type: LocationTriggerContext['location_type'], outputType: LocationTriggerContext['target_output_type']) => void;
  onTriggerAutomation: () => void;
  isEvaluating: boolean;
}

export const Feature3LocationAutomationComponent: React.FC<Feature3LocationAutomationProps> = ({
  automation,
  locationContext,
  onUpdateLocation,
  onTriggerAutomation,
  isEvaluating,
}) => {
  const [copied, setCopied] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCopy = () => {
    const textToCopy = automation.auto_generated_content || automation.drafted_output || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLocationIcon = (type?: string) => {
    switch (type) {
      case 'library':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'gym':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'home':
        return <Home className="w-4 h-4 text-amber-400" />;
      case 'lab':
        return <Cpu className="w-4 h-4 text-fuchsia-400" />;
      case 'cafe':
        return <Coffee className="w-4 h-4 text-orange-400" />;
      default:
        return <MapPin className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/40">
              Feature 3
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              Location-Aware Trigger &amp; Task Automation Engine
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Detects geofence boundaries (Library, Gym, Home) to auto-draft emails, revision checklists, and summaries.
          </p>
        </div>

        <button
          onClick={onTriggerAutomation}
          disabled={isEvaluating}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulate Geo-Trigger</span>
        </button>
      </div>

      {/* Location Simulator Quick Grid */}
      <div className="mb-5">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
          Select Active Geofence or Simulate Arrival:
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {AVAILABLE_LOCATIONS.map((loc, idx) => {
            const isSelected = locationContext.detected_location === loc.name;
            return (
              <button
                key={idx}
                onClick={() => {
                  let targetType: LocationTriggerContext['target_output_type'] = 'study_checklist';
                  if (loc.type === 'gym') targetType = 'recovery_protocol';
                  else if (loc.type === 'lab' || loc.type === 'office') targetType = 'project_update';
                  else if (loc.type === 'home') targetType = 'academic_email';

                  onUpdateLocation(loc.name, loc.type, targetType);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-sm shadow-emerald-500/10'
                    : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  {getLocationIcon(loc.type)}
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <div className="text-[11px] font-medium text-zinc-200 line-clamp-1">{loc.name.split(' - ')[0]}</div>
                <div className="text-[9px] text-zinc-500 truncate mt-0.5">{loc.name.split(' - ')[1] || loc.type}</div>
              </button>
            );
          })}
        </div>

        {/* Custom Location Input Toggle */}
        <div className="mt-2 text-right">
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            {showCustomInput ? 'Hide custom geofence' : '+ Enter custom location/room'}
          </button>
        </div>

        {showCustomInput && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="e.g. Stanford AI Lab - Room 402 or Blue Bottle Cafe"
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => {
                if (customLocation.trim()) {
                  onUpdateLocation(customLocation.trim(), 'office', 'project_update');
                  setCustomLocation('');
                  setShowCustomInput(false);
                }
              }}
              className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
            >
              Set Location
            </button>
          </div>
        )}
      </div>

      {/* Detected Location Card & Recommended Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Active Detected Geofence
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
              {automation.detected_location}
            </h3>
            <span className="inline-block mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              GPS Precision: Simulated &plusmn;2m Accuracy
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              AI Trigger Recommended Action
            </span>
            <h3 className="text-sm font-bold text-indigo-300 tracking-tight mt-0.5">
              {automation.recommended_action || automation.action_triggered}
            </h3>
            <span className="inline-block mt-2 text-[10px] font-mono text-zinc-400">
              Trigger dispatched without user intervention
            </span>
          </div>
        </div>
      </div>

      {/* Auto-Generated Content (Checklist / Email / Summary) */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 relative">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Autonomous Context Output (Drafts / Checklists / Summaries)
            </h4>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Content</span>
              </>
            )}
          </button>
        </div>

        {/* Formatted Content View */}
        <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800/60 max-h-72">
          {automation.auto_generated_content || automation.drafted_output}
        </pre>

        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Target Payload: Context-sensitive draft for {locationContext.target_output_type.replace('_', ' ')}</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ready for Execution
          </span>
        </div>
      </div>

    </div>
  );
};
