import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';
import { DailyTelemetry } from '../types/lifeos.ts';
import { TrendingUp, Moon, Activity, Clock, Sliders, ShieldAlert, Sparkles, BarChart2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartAnalyticsProps {
  weeklyTelemetry: DailyTelemetry[];
  todaySleepHours: number;
  todayCognitiveFatigue: number;
  optimalFocusWindow?: string;
  fatigueIndex?: string;
  burnoutRisk?: number;
}

export const ChartAnalytics: React.FC<ChartAnalyticsProps> = ({
  weeklyTelemetry,
  todaySleepHours,
  todayCognitiveFatigue,
  optimalFocusWindow = '08:30 AM - 11:45 AM',
  fatigueIndex = 'Moderate',
  burnoutRisk = 45,
}) => {
  const [activeView, setActiveView] = useState<'sleep_fatigue' | 'focus_minutes' | 'radar_balance'>('sleep_fatigue');

  const labels = weeklyTelemetry.map((t) => `${t.day} (${t.date.split(' ')[1] || t.date})`);
  const sleepData = weeklyTelemetry.map((t) => t.sleepHours);
  const fatigueData = weeklyTelemetry.map((t) => t.cognitiveFatigueScore);
  const focusData = weeklyTelemetry.map((t) => Math.round(t.focusMinutes));
  const completionData = weeklyTelemetry.map((t) => t.taskCompletionRate);

  // Averages
  const avgSleep = (sleepData.reduce((a, b) => a + b, 0) / sleepData.length).toFixed(1);
  const totalFocusHrs = (focusData.reduce((a, b) => a + b, 0) / 60).toFixed(1);
  const avgFatigue = (fatigueData.reduce((a, b) => a + b, 0) / fatigueData.length).toFixed(1);
  const avgCompletion = Math.round(completionData.reduce((a, b) => a + b, 0) / completionData.length);

  // 1. Dual-Axis Line Chart: Sleep vs Cognitive Fatigue
  const dualAxisData = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Sleep Duration (Hours)',
        data: sleepData,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        borderWidth: 2.5,
        tension: 0.35,
        pointBackgroundColor: '#0891b2',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Cognitive Fatigue Score (1-10)',
        data: fatigueData,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.10)',
        borderWidth: 2.5,
        tension: 0.35,
        pointBackgroundColor: '#e11d48',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [4, 4],
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const dualAxisOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e4e4e7',
          font: { family: 'ui-monospace, SFMono-Regular, monospace', size: 11 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#e4e4e7',
        borderColor: '#3f3f46',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(63, 63, 70, 0.25)' },
        ticks: {
          color: '#a1a1aa',
          font: { family: 'ui-monospace, SFMono-Regular, monospace', size: 10 },
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 10,
        title: {
          display: true,
          text: 'Sleep (Hrs)',
          color: '#06b6d4',
          font: { size: 10, family: 'ui-monospace, monospace' },
        },
        grid: { color: 'rgba(63, 63, 70, 0.25)' },
        ticks: { color: '#06b6d4', stepSize: 2 },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 10,
        title: {
          display: true,
          text: 'Fatigue (1-10)',
          color: '#f43f5e',
          font: { size: 10, family: 'ui-monospace, monospace' },
        },
        grid: { drawOnChartArea: false },
        ticks: { color: '#f43f5e', stepSize: 2 },
      },
    },
  };

  // 2. Bar Chart: Focus Minutes per Day
  const focusBarData = {
    labels,
    datasets: [
      {
        label: 'Deep Focus (Minutes)',
        data: focusData,
        backgroundColor: (context: any) => {
          const val = context.raw || 0;
          return val >= 360
            ? 'rgba(99, 102, 241, 0.85)' // vibrant indigo
            : val >= 240
            ? 'rgba(129, 140, 248, 0.75)'
            : 'rgba(165, 180, 252, 0.65)';
        },
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const focusBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#e4e4e7',
          font: { family: 'ui-monospace, monospace', size: 11 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#e4e4e7',
        borderColor: '#3f3f46',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const mins = context.raw as number;
            const hrs = (mins / 60).toFixed(1);
            return ` Focus: ${mins} mins (${hrs} hours)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(63, 63, 70, 0.25)' },
        ticks: {
          color: '#a1a1aa',
          font: { family: 'ui-monospace, SFMono-Regular, monospace', size: 10 },
        },
      },
      y: {
        grid: { color: 'rgba(63, 63, 70, 0.25)' },
        ticks: {
          color: '#818cf8',
          font: { family: 'ui-monospace, monospace', size: 10 },
          stepSize: 100,
        },
        title: {
          display: true,
          text: 'Focus Minutes',
          color: '#818cf8',
          font: { size: 10, family: 'ui-monospace, monospace' },
        },
      },
    },
  };

  // 3. Radar Chart: Cognitive Balance & Neuro-Endurance
  const radarData = {
    labels: [
      'Sleep Health',
      'Focus Stamina',
      'Task Execution',
      'Cognitive Reserve',
      'Circadian Sync',
    ],
    datasets: [
      {
        label: 'Current 7-Day Performance Profile',
        data: [
          Math.min(100, Math.round((parseFloat(avgSleep) / 8.0) * 100)),
          Math.min(100, Math.round((parseFloat(totalFocusHrs) / 35.0) * 100)),
          avgCompletion,
          Math.max(10, Math.round((1 - parseFloat(avgFatigue) / 10) * 100)),
          burnoutRisk < 50 ? 85 : 45,
        ],
        backgroundColor: 'rgba(168, 85, 247, 0.25)',
        borderColor: '#a855f7',
        pointBackgroundColor: '#c084fc',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  const radarOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e4e4e7',
          font: { family: 'ui-monospace, monospace', size: 11 },
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#e4e4e7',
        borderColor: '#3f3f46',
        borderWidth: 1,
      },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(63, 63, 70, 0.4)' },
        grid: { color: 'rgba(63, 63, 70, 0.35)' },
        pointLabels: {
          color: '#d4d4d8',
          font: { family: 'ui-monospace, monospace', size: 10 },
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#71717a',
          stepSize: 20,
        },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="rounded-xl bg-zinc-950/70 border border-zinc-800 p-4 sm:p-5 text-zinc-100">
      {/* Chart Header & Tab Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Chart.js Telemetry Matrix: Sleep, Fatigue &amp; Weekly Focus
            </h3>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
              Interactive Engine
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Real-time visual regression of circadian sleep debt, cognitive fatigue load, and deep-work capacity.
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveView('sleep_fatigue')}
            className={`px-2.5 py-1 rounded-md transition-all font-mono cursor-pointer ${
              activeView === 'sleep_fatigue'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sleep &amp; Fatigue Line
          </button>
          <button
            type="button"
            onClick={() => setActiveView('focus_minutes')}
            className={`px-2.5 py-1 rounded-md transition-all font-mono cursor-pointer ${
              activeView === 'focus_minutes'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Weekly Focus Bars
          </button>
          <button
            type="button"
            onClick={() => setActiveView('radar_balance')}
            className={`px-2.5 py-1 rounded-md transition-all font-mono cursor-pointer ${
              activeView === 'radar_balance'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cognitive Radar
          </button>
        </div>
      </div>

      {/* Metric Quick Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-cyan-900/30">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span>7-Day Avg Sleep</span>
          </div>
          <div className="text-base font-bold text-cyan-300 font-mono mt-1">
            {avgSleep}h <span className="text-[10px] font-normal text-zinc-500">/ night</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-rose-900/30">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Avg Fatigue Index</span>
          </div>
          <div className="text-base font-bold text-rose-300 font-mono mt-1">
            {avgFatigue} <span className="text-[10px] font-normal text-zinc-500">/ 10</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-indigo-900/30">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Weekly Focus Sum</span>
          </div>
          <div className="text-base font-bold text-indigo-300 font-mono mt-1">
            {totalFocusHrs}h <span className="text-[10px] font-normal text-zinc-500">logged</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-emerald-900/30">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Task Completion</span>
          </div>
          <div className="text-base font-bold text-emerald-300 font-mono mt-1">
            {avgCompletion}% <span className="text-[10px] font-normal text-zinc-500">rate</span>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Container */}
      <div className="w-full h-64 sm:h-72 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 relative">
        {activeView === 'sleep_fatigue' && (
          <Line data={dualAxisData} options={dualAxisOptions} />
        )}
        {activeView === 'focus_minutes' && (
          <Bar data={focusBarData} options={focusBarOptions} />
        )}
        {activeView === 'radar_balance' && (
          <Radar data={radarData} options={radarOptions} />
        )}
      </div>

      {/* Bottom Insights Footnote */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2.5 gap-2">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-indigo-400 font-semibold">Circadian Lock:</span>
          <span>{optimalFocusWindow}</span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>Fatigue: <strong className="text-rose-400">{fatigueIndex}</strong></span>
          <span>Burnout Risk: <strong className="text-amber-400">{burnoutRisk}%</strong></span>
        </div>
      </div>
    </div>
  );
};
