import React, { useState } from 'react';
import { Feature1LifeHubAnalytics, DailyTelemetry } from '../types/lifeos.ts';
import { Activity, BatteryCharging, Moon, Flame, Brain, Clock, Sliders, TrendingUp, AlertOctagon, BarChart3 } from 'lucide-react';
import { ChartAnalytics } from './ChartAnalytics.tsx';

interface Feature1LifeHubProps {
  analytics: Feature1LifeHubAnalytics;
  weeklyTelemetry: DailyTelemetry[];
  todaySleepHours: number;
  todayCognitiveFatigue: number;
  onUpdateTodaySleep: (hours: number) => void;
  onUpdateTodayFatigue: (score: number) => void;
  onReAudit: () => void;
}

export const Feature1LifeHub: React.FC<Feature1LifeHubProps> = ({
  analytics,
  weeklyTelemetry,
  todaySleepHours,
  todayCognitiveFatigue,
  onUpdateTodaySleep,
  onUpdateTodayFatigue,
  onReAudit,
}) => {
  const [activeChartMetric, setActiveChartMetric] = useState<'sleep' | 'focus' | 'completion' | 'fatigue'>('sleep');
  const [showAdjuster, setShowAdjuster] = useState(false);

  // Fatigue styling helpers
  const getFatigueColor = (fatigue: string) => {
    switch (fatigue) {
      case 'Low':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400',
          gradient: 'from-emerald-500 to-teal-400',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          dot: 'bg-amber-400',
          gradient: 'from-amber-500 to-yellow-400',
        };
      case 'High':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          dot: 'bg-orange-400',
          gradient: 'from-orange-500 to-red-400',
        };
      case 'Critical':
      default:
        return {
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          dot: 'bg-rose-500',
          gradient: 'from-rose-500 to-red-500',
        };
    }
  };

  const fatigueStyle = getFatigueColor(analytics.fatigue_index);

  // Burnout meter color
  const getBurnoutColor = (pct: number) => {
    if (pct < 30) return { bar: 'bg-emerald-500', text: 'text-emerald-400', label: 'Sustainable Reserve' };
    if (pct < 60) return { bar: 'bg-amber-500', text: 'text-amber-400', label: 'Elevated Strain' };
    if (pct < 80) return { bar: 'bg-orange-500', text: 'text-orange-400', label: 'High Burnout Warning' };
    return { bar: 'bg-rose-500', text: 'text-rose-400', label: 'Critical Burnout Imminent' };
  };

  const burnoutStyle = getBurnoutColor(analytics.burnout_risk_percentage);

  // Calculations for weekly averages
  const avgWeeklySleep = (weeklyTelemetry.reduce((acc, c) => acc + c.sleepHours, 0) / weeklyTelemetry.length).toFixed(1);
  const avgFocusHours = (weeklyTelemetry.reduce((acc, c) => acc + c.focusMinutes, 0) / weeklyTelemetry.length / 60).toFixed(1);
  const avgWeeklyFatigue = (weeklyTelemetry.reduce((acc, c) => acc + c.cognitiveFatigueScore, 0) / weeklyTelemetry.length).toFixed(1);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/40">
              Feature 1
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Life Hub &amp; Weekly Wellness Analytics
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Autonomous synthesis of 7-day cognitive telemetry, sleep architecture, and neuro-fatigue capacity.
          </p>
        </div>

        <button
          onClick={() => setShowAdjuster(!showAdjuster)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800/90 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>{showAdjuster ? 'Close Telemetry Tweak' : 'Adjust Live Inputs'}</span>
        </button>
      </div>

      {/* Live Parameter Adjuster Drawer */}
      {showAdjuster && (
        <div className="mb-6 p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Live Telemetry Simulator (Instant Feedback)
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">Modifies inputs &amp; recalculates OS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-cyan-400" /> Today's Sleep Last Night:
                </span>
                <span className="font-mono font-bold text-cyan-400">{todaySleepHours} hours</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="10.0"
                step="0.2"
                value={todaySleepHours}
                onChange={(e) => onUpdateTodaySleep(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>3h (Severe Debt)</span>
                <span>7h (Baseline)</span>
                <span>10h (Saturated)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-fuchsia-400" /> Self-Reported Cognitive Fatigue:
                </span>
                <span className="font-mono font-bold text-fuchsia-400">{todayCognitiveFatigue} / 10</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.2"
                value={todayCognitiveFatigue}
                onChange={(e) => onUpdateTodayFatigue(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>1 (Pristine)</span>
                <span>5 (Moderate)</span>
                <span>10 (Exhausted)</span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex justify-end">
            <button
              onClick={onReAudit}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Re-Calculate Life Hub
            </button>
          </div>
        </div>
      )}

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Metric 1: Fatigue Index */}
        <div className={`p-4 rounded-xl border ${fatigueStyle.border} ${fatigueStyle.bg} flex flex-col justify-between transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Fatigue Index</span>
            <span className={`w-2.5 h-2.5 rounded-full ${fatigueStyle.dot} animate-pulse`} />
          </div>
          <div className="my-3">
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${fatigueStyle.text}`}>
              {analytics.fatigue_index}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {analytics.fatigue_index === 'Low' && 'Optimal prefrontal bandwidth. Ideal for high-stakes problem solving.'}
              {analytics.fatigue_index === 'Moderate' && 'Manageable load. Maintain strict 50-minute focus blocks.'}
              {analytics.fatigue_index === 'High' && 'High neuro-strain. Executive decision quality is degraded.'}
              {analytics.fatigue_index === 'Critical' && 'Severe cognitive fatigue. High risk of mental paralysis & errors.'}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-800/60 pt-2">
            <span>Sleep: {todaySleepHours}h</span>
            <span>Strain: {todayCognitiveFatigue}/10</span>
          </div>
        </div>

        {/* Metric 2: Burnout Risk Percentage */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Burnout Risk</span>
            <Flame className={`w-4 h-4 ${burnoutStyle.text}`} />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${burnoutStyle.text}`}>
                {analytics.burnout_risk_percentage}%
              </span>
              <span className="text-xs font-medium text-zinc-400 font-mono">
                {burnoutStyle.label}
              </span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full bg-zinc-800 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full ${burnoutStyle.bar} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(100, Math.max(5, analytics.burnout_risk_percentage))}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800/60 pt-2">
            <span>Safe: &lt;35%</span>
            <span>Critical: &gt;75%</span>
          </div>
        </div>

        {/* Metric 3: Optimal Focus Window */}
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-300">Peak Focus Window</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-3">
            <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {analytics.optimal_focus_window}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Calculated circadian crest based on REM rebound &amp; historical attention endurance.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-400 border-t border-indigo-500/20 pt-2">
            <Brain className="w-3.5 h-3.5" />
            <span>High-effort cognitive lock</span>
          </div>
        </div>

      </div>

      {/* Chart.js Analytics: Sleep, Fatigue & Weekly Focus Metrics */}
      <div className="mb-6">
        <ChartAnalytics
          weeklyTelemetry={weeklyTelemetry}
          todaySleepHours={todaySleepHours}
          todayCognitiveFatigue={todayCognitiveFatigue}
          optimalFocusWindow={analytics.optimal_focus_window}
          fatigueIndex={analytics.fatigue_index}
          burnoutRisk={analytics.burnout_risk_percentage}
        />
      </div>

      {/* AI Weekly Health Summary narrative */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800 flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Brain className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold">
              Weekly Health &amp; Neurological Telemetry Synthesis
            </h4>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
              LifeOS v4.2 Diagnostic
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed mt-1.5">
            {analytics.weekly_health_summary}
          </p>
        </div>
      </div>

    </div>
  );
};
