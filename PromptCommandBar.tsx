import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, Terminal, CheckCircle2, Zap, Moon, MapPin, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { ParsedPromptContext } from '../types/lifeos.ts';

interface PromptCommandBarProps {
  onProcessPrompt: (promptText: string) => Promise<void>;
  isProcessing: boolean;
  lastParsedContext: ParsedPromptContext | null;
}

export const PromptCommandBar: React.FC<PromptCommandBarProps> = ({
  onProcessPrompt,
  isProcessing,
  lastParsedContext,
}) => {
  const [promptText, setPromptText] = useState('');

  const samplePrompts = [
    {
      label: '🌙 Midterm Crunch (Library)',
      text: 'I only slept 3.5 hours last night, currently at Campus Library studying OS concepts. I have a 2-hour kernel lab at 2pm and gym at 6pm. My lab partner Devon just messaged asking to debug on a call right now.',
    },
    {
      label: '⚡ Peak Performance (Home)',
      text: 'Slept 8.5 hours and feeling sharp. Working from home office today. I scheduled deep database architecture from 9am-11:30am and team sync at 2pm. VP Marcus sent an ad-hoc sync request.',
    },
    {
      label: '🏥 Overnight Rotation (Exhausted)',
      text: 'Exhausted after an intense 12-hour hospital shift, only got 3 hours sleep. At the medical library preparing conference notes. Chief Dr. Walsh wants me to cover an emergency ICU night shift.',
    },
    {
      label: '☕ Cafe Sprint (Client Inquiry)',
      text: 'Working from Artisan Cafe, got 6 hours sleep. Have coding sprint at 10am and client roadmap review at 3pm. A recruiter texted asking for an immediate 15-minute phone interview.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isProcessing) return;
    onProcessPrompt(promptText.trim());
  };

  const handleSelectSample = (sample: string) => {
    setPromptText(sample);
    onProcessPrompt(sample);
  };

  return (
    <div className="bg-gradient-to-b from-indigo-950/40 via-zinc-900/80 to-zinc-950 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Prompt Line Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              LifeOS AI Natural Language Prompt Engine
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                Multi-Feature Synced
              </span>
            </h2>
          </div>
        </div>

        <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline-block">
          Type daily life, sleep, tasks, or location &bull; All 4 features update instantly
        </span>
      </div>

      {/* Main Prompt Input Bar */}
      <form onSubmit={handleSubmit} className="relative mb-3">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-indigo-400 pointer-events-none">
            <Terminal className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Type about your schedule or daily life (e.g. 'Slept 4 hours, at Campus Library, lab at 2pm, gym at 6pm, boss just texted...')"
            disabled={isProcessing}
            className="w-full bg-zinc-950/90 border border-indigo-500/40 hover:border-indigo-400/60 focus:border-indigo-400 text-zinc-100 rounded-xl pl-10 pr-28 sm:pr-36 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner placeholder:text-zinc-500 transition-all"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isProcessing || !promptText.trim()}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isProcessing || !promptText.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-md shadow-indigo-500/25 active:scale-95 cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  <span>Process Prompt</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick-Prompt Inspiration Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Quick Scenarios:</span>
        {samplePrompts.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample.text)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>{sample.label}</span>
          </button>
        ))}
      </div>

      {/* Live Context Banner if Prompt was processed */}
      {lastParsedContext && (
        <div className="mt-3.5 p-3 rounded-xl bg-zinc-950/80 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-zinc-200">
              <span className="font-semibold text-emerald-400">Prompt Synthesized: </span>
              {lastParsedContext.prompt_summary || 'All 4 features updated according to your prompt.'}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-zinc-400 shrink-0">
            {lastParsedContext.today_sleep_hours !== undefined && (
              <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-300 flex items-center gap-1">
                <Moon className="w-3 h-3" />
                {lastParsedContext.today_sleep_hours}h sleep
              </span>
            )}
            {lastParsedContext.detected_location && (
              <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-300 flex items-center gap-1 truncate max-w-[150px]">
                <MapPin className="w-3 h-3" />
                {lastParsedContext.detected_location.split(' - ')[0]}
              </span>
            )}
            {lastParsedContext.planned_tasks && (
              <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-purple-300 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {lastParsedContext.planned_tasks.length} slots audited
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
