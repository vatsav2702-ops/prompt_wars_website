import React, { useState } from 'react';
import { WellnessCheckInResponse, WellnessCheckInSuggestion, CheckInAnswers, PlannedTask } from '../types/lifeos.ts';
import { HeartPulse, Clock, Sparkles, Send, CheckCircle2, AlertCircle, Droplets, Zap, ListChecks, Activity, Brain, RefreshCw, ChevronRight, Sliders, Code } from 'lucide-react';
import { playReminderChime } from '../utils/reminderAudio.ts';

interface WellnessCheckInAgentProps {
  checkInData: WellnessCheckInResponse | null;
  plannedTasks: PlannedTask[];
  onTriggerCheckIn: (time: string) => Promise<void>;
  onEvaluateAnswers: (answers: CheckInAnswers, time: string) => Promise<void>;
  isLoading: boolean;
}

export const WellnessCheckInAgent: React.FC<WellnessCheckInAgentProps> = ({
  checkInData,
  plannedTasks,
  onTriggerCheckIn,
  onEvaluateAnswers,
  isLoading,
}) => {
  const [selectedTime, setSelectedTime] = useState<string>('02:00 PM');
  const [showJsonRaw, setShowJsonRaw] = useState<boolean>(false);

  // User responses to the 5 check-in questions
  const [answers, setAnswers] = useState<CheckInAnswers>({
    meals_response: 'Skipped breakfast, had a quick sandwich and 2 cups of black coffee.',
    sleep_response: 'Got about 4.8 hours of sleep, woke up twice and feeling a bit groggy.',
    task_completion_response: 'Finished about 60% of the morning lab, but hit a compiler bug block.',
    energy_score: 4.5,
    strain_response: 'Noticeable cervical neck stiffness and ocular screen strain after 3 hours coding.',
    fatigue_level_score: 7.5,
  });

  const handlePreFillSample = (profile: 'exhausted' | 'optimal' | 'postlunch') => {
    if (profile === 'exhausted') {
      setAnswers({
        meals_response: 'Only had an energy drink and chips; haven\'t eaten a real meal in 6 hours.',
        sleep_response: 'Under 4 hours, severe sleep debt from exam prep, head feels heavy.',
        task_completion_response: 'Struggling to finish anything, mental block on my primary project.',
        energy_score: 2.0,
        strain_response: 'Severe eye strain, tension headache, and lower back fatigue.',
        fatigue_level_score: 9.0,
      });
    } else if (profile === 'optimal') {
      setAnswers({
        meals_response: 'Ate oatmeal with berries and eggs, well hydrated with 1.2L water.',
        sleep_response: 'Solid 8.2 hours of restorative sleep, woke up energized.',
        task_completion_response: 'Completed the morning architecture RFC ahead of schedule.',
        energy_score: 9.0,
        strain_response: 'Zero physical strain, ergonomics dialed in and feeling limber.',
        fatigue_level_score: 2.0,
      });
    } else {
      setAnswers({
        meals_response: 'Heavy carb lunch (pasta), experiencing postprandial glycemic dip.',
        sleep_response: 'Around 6 hours, adequate but feeling the afternoon circadian lull.',
        task_completion_response: 'Partially done with morning review, need to start next block.',
        energy_score: 5.5,
        strain_response: 'Mild eye fatigue and sluggish posture at workstation.',
        fatigue_level_score: 6.5,
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playReminderChime();
    onEvaluateAnswers(answers, selectedTime);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Nutrition / Hydration':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'Energy Management':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Task Optimization':
        return <ListChecks className="w-4 h-4 text-indigo-400" />;
      case 'Physical Well-being':
      default:
        return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/40';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/40';
      case 'Low':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40';
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 right-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800/40">
              Wellness Agent
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-400" />
              Time-Triggered Check-In &amp; Wellness Suggestion Agent
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Autonomous schedule monitoring agent: generates 5-dimensional well-being questions and evaluates responses for personalized lifestyle interventions.
          </p>
        </div>

        {/* Operating Mode & Time Trigger Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-rose-400 ml-1.5 mr-1" />
            <select
              value={selectedTime}
              onChange={(e) => {
                setSelectedTime(e.target.value);
                onTriggerCheckIn(e.target.value);
              }}
              className="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="08:30 AM">08:30 AM (Morning Baseline)</option>
              <option value="11:30 AM">11:30 AM (Mid-Morning Peak)</option>
              <option value="02:00 PM">02:00 PM (Post-Lunch Dip)</option>
              <option value="05:30 PM">05:30 PM (Evening Deload)</option>
              <option value="10:00 PM">10:00 PM (Nighttime Wind-Down)</option>
            </select>
          </div>

          <button
            onClick={() => onTriggerCheckIn(selectedTime)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Checking...' : 'Trigger Check-In'}</span>
          </button>
        </div>
      </div>

      {/* Trigger Reason & Schedule Context Card */}
      {checkInData && (
        <div className="mb-6 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Trigger Diagnostic ({checkInData.current_time_evaluated})
              </span>
              <span className="text-zinc-200 font-semibold">{checkInData.trigger_reason}</span>
            </div>
          </div>

          <button
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJsonRaw ? 'Hide Agent JSON' : 'Inspect Agent JSON'}</span>
          </button>
        </div>
      )}

      {/* Raw JSON viewer toggle if requested */}
      {showJsonRaw && checkInData && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
            <span>check_in_and_wellness_agent.json</span>
            <span className="text-emerald-400">Validated 100% Schema</span>
          </div>
          <pre className="p-3 text-xs font-mono text-zinc-300 overflow-x-auto max-h-64 leading-relaxed">
            {JSON.stringify(checkInData, null, 2)}
          </pre>
        </div>
      )}

      {/* 2-Column Workflow: Check-In Questions & Responses (Left) vs Personalized Suggestions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left Column: Interactive 5-Question Check-In Form (6 cols) */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  5-Dimensional Check-In Questionnaire
                </h3>
              </div>

              {/* Sample Response Fillers */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Fill:</span>
                <button
                  type="button"
                  onClick={() => handlePreFillSample('exhausted')}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-rose-300 border border-zinc-800"
                >
                  Fatigued
                </button>
                <button
                  type="button"
                  onClick={() => handlePreFillSample('postlunch')}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800"
                >
                  Midday Lull
                </button>
                <button
                  type="button"
                  onClick={() => handlePreFillSample('optimal')}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-zinc-800"
                >
                  High Energy
                </button>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Question 1: Meals / Nutrition Status */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                  <span>1. Meals &amp; Nutrition Status (Last 4-6 hrs):</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Nutritional status</span>
                </label>
                <input
                  type="text"
                  value={answers.meals_response}
                  onChange={(e) => setAnswers({ ...answers, meals_response: e.target.value, nutrition_response: e.target.value })}
                  placeholder="e.g. Skipped breakfast, had black coffee and protein bowl..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Question 2: Hours Slept Last Night */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                  <span>2. Hours Slept Last Night &amp; Sleep Quality:</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Sleep architecture</span>
                </label>
                <input
                  type="text"
                  value={answers.sleep_response}
                  onChange={(e) => setAnswers({ ...answers, sleep_response: e.target.value })}
                  placeholder="e.g. 4.8 hours, interrupted sleep, woke up feeling groggy..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Question 3: Scheduled Task Completion */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                  <span>3. Scheduled Task Completion:</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Schedule adherence</span>
                </label>
                <input
                  type="text"
                  value={answers.task_completion_response}
                  onChange={(e) => setAnswers({ ...answers, task_completion_response: e.target.value })}
                  placeholder="e.g. Completed 65% of morning lab tasks; dynamic programming problem set pending..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Question 4: Focus & Energy Level (1-10) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-zinc-300">
                    4. Focus &amp; Energy Level (1-10 Scale):
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    {answers.energy_score ?? 5} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={answers.energy_score ?? 5}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setAnswers({ ...answers, energy_score: val, fatigue_level_score: 11 - val });
                  }}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                  <span>1 (Brain Fog / Exhausted)</span>
                  <span>5 (Moderate Focus)</span>
                  <span>10 (Peak Cognitive Flow)</span>
                </div>
              </div>

              {/* Question 5: Physical Strain / Fatigue */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                  <span>5. Physical Strain &amp; Fatigue:</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Somatic status</span>
                </label>
                <input
                  type="text"
                  value={answers.strain_response}
                  onChange={(e) => setAnswers({ ...answers, strain_response: e.target.value })}
                  placeholder="e.g. Neck stiffness, ocular dry-eye strain from monitor, shallow breathing..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading ? 'Analyzing Well-Being...' : 'Evaluate Responses & Generate Interventions'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Personalized Suggestions & Wellness Summary (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          
          {/* Current Wellness Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                Operational Wellness Synthesis
              </h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {checkInData?.wellness_summary || 'Awaiting check-in evaluation. Trigger check-in to analyze current fatigue and schedule telemetry.'}
            </p>
          </div>

          {/* Actionable Personalized Suggestions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Actionable Lifestyle Interventions ({checkInData?.personalized_suggestions.length || 0})
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Tiered by Priority</span>
            </div>

            {checkInData?.personalized_suggestions.map((item: WellnessCheckInSuggestion, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/90 hover:border-zinc-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(item.category)}
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                      {item.category}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getPriorityBadge(item.priority_level)}`}>
                    {item.priority_level} Priority
                  </span>
                </div>

                <h5 className="text-xs font-bold text-white tracking-tight mb-1">
                  {item.suggestion_title}
                </h5>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.actionable_advice}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
