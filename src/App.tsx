import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { Feature1LifeHub } from './components/Feature1LifeHub.tsx';
import { Feature2ScheduleAuditor } from './components/Feature2ScheduleAuditor.tsx';
import { Feature3LocationAutomationComponent } from './components/Feature3LocationAutomation.tsx';
import { Feature4CommunicationDelegateComponent } from './components/Feature4CommunicationDelegate.tsx';
import { JsonViewer } from './components/JsonViewer.tsx';
import { PromptCommandBar } from './components/PromptCommandBar.tsx';
import { PromptReplyScreen } from './components/PromptReplyScreen.tsx';
import { ActiveReminderModal } from './components/ActiveReminderModal.tsx';
import { WellnessCheckInAgent } from './components/WellnessCheckInAgent.tsx';
import { playReminderChime, triggerSystemNotification } from './utils/reminderAudio.ts';
import { PRESETS, PersonaPreset, createInitialEvaluation } from './data/presets.ts';
import { 
  LifeOSResponse, 
  PlannedTask, 
  LocationTriggerContext, 
  InboundCommunication, 
  ParsedPromptContext, 
  WellnessCheckInResponse, 
  CheckInAnswers,
  ActiveTab
} from './types/lifeos.ts';
import { 
  Sparkles, 
  Activity, 
  Calendar, 
  Navigation, 
  ShieldCheck, 
  Cpu, 
  Code, 
  ArrowUpRight, 
  Flame, 
  Clock, 
  Bell, 
  HeartPulse,
  Home,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Terminal,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [currentPreset, setCurrentPreset] = useState<PersonaPreset>(PRESETS[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [engineSource, setEngineSource] = useState<string>('gemini-3.8-flash');

  // Working payload state
  const [todaySleepHours, setTodaySleepHours] = useState<number>(PRESETS[0].payload.today_sleep_hours);
  const [todayCognitiveFatigue, setTodayCognitiveFatigue] = useState<number>(PRESETS[0].payload.today_cognitive_fatigue);
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>(PRESETS[0].payload.planned_tasks);
  const [locationContext, setLocationContext] = useState<LocationTriggerContext>(PRESETS[0].payload.location_context);
  const [inboundComm, setInboundComm] = useState<InboundCommunication>(PRESETS[0].payload.inbound_comm);

  // Active LifeOS Evaluation state & Prompt processing - pre-initialized so UI is instantly ready
  const [evaluation, setEvaluation] = useState<LifeOSResponse>(() => createInitialEvaluation(PRESETS[0]));
  const [lastParsedContext, setLastParsedContext] = useState<ParsedPromptContext | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Prompt Reply Screen Monitor State
  const [lastPromptText, setLastPromptText] = useState<string>(
    'CS Student Midterm Crunch: 4.8h sleep, Campus Library, OS Kernel Lab at 2pm, gym at 5:30pm'
  );
  const [isPromptCompleted, setIsPromptCompleted] = useState<boolean>(true);
  const [promptCompletedAt, setPromptCompletedAt] = useState<string | null>('Initialized');

  // Active Reminder State
  const [activeReminderTask, setActiveReminderTask] = useState<PlannedTask | null>(null);

  // Time-Triggered Check-In & Wellness Agent State
  const [wellnessData, setWellnessData] = useState<WellnessCheckInResponse | null>(null);
  const [isWellnessLoading, setIsWellnessLoading] = useState<boolean>(false);
  const [currentEvalTime, setCurrentEvalTime] = useState<string>('02:00 PM');

  // Trigger LifeOS evaluation
  const executeEvaluation = useCallback(
    async (overridePayload?: Partial<typeof currentPreset.payload> & { current_time?: string; phase_type?: any }) => {
      setIsEvaluating(true);
      setErrorNotice(null);

      const payload = {
        persona: currentPreset.payload.persona,
        persona_title: currentPreset.payload.persona_title,
        weekly_telemetry: currentPreset.payload.weekly_telemetry,
        today_sleep_hours: overridePayload?.today_sleep_hours ?? todaySleepHours,
        today_cognitive_fatigue: overridePayload?.today_cognitive_fatigue ?? todayCognitiveFatigue,
        planned_tasks: overridePayload?.planned_tasks ?? plannedTasks,
        location_context: overridePayload?.location_context ?? locationContext,
        inbound_comm: overridePayload?.inbound_comm ?? inboundComm,
        current_time: overridePayload?.current_time ?? currentEvalTime,
        phase_type: overridePayload?.phase_type,
      };

      try {
        const res = await fetch('/api/lifeos/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.data) {
          setEvaluation(data.data);
          setEngineSource(data.source || 'gemini-3.8-flash');
        }
      } catch (err: unknown) {
        console.error('Failed to evaluate LifeOS:', err);
        setErrorNotice((err as Error).message || 'Evaluation error. LifeOS fallback engaged.');
      } finally {
        setIsEvaluating(false);
      }
    },
    [currentPreset, todaySleepHours, todayCognitiveFatigue, plannedTasks, locationContext, inboundComm]
  );

  // Run on initial load
  useEffect(() => {
    executeEvaluation();
    handleTriggerCheckIn('02:00 PM');
  }, [currentPreset.id]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: PersonaPreset) => {
    setCurrentPreset(preset);
    setTodaySleepHours(preset.payload.today_sleep_hours);
    setTodayCognitiveFatigue(preset.payload.today_cognitive_fatigue);
    setPlannedTasks(preset.payload.planned_tasks);
    setLocationContext(preset.payload.location_context);
    setInboundComm(preset.payload.inbound_comm);
    setEvaluation(createInitialEvaluation(preset));
    setLastPromptText(`Profile Loaded: ${preset.name} (${preset.role}) - ${preset.tagline}`);
    setIsPromptCompleted(true);
    setPromptCompletedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // Handle Task Addition
  const handleAddTask = (newTask: PlannedTask) => {
    const updated = [...plannedTasks, newTask];
    setPlannedTasks(updated);
    executeEvaluation({ planned_tasks: updated });
  };

  // Handle Task Deletion
  const handleDeleteTask = (taskId: string) => {
    const updated = plannedTasks.filter((t) => t.id !== taskId);
    setPlannedTasks(updated);
    executeEvaluation({ planned_tasks: updated });
  };

  // Handle Smart Rebalance
  const handleSmartRebalance = () => {
    if (!evaluation) return;

    // Identify which tasks got DON'T
    const dontNames = new Set(
      evaluation.feature_2_schedule_audit.filter((i) => i.verdict === "DON'T").map((i) => i.task_name)
    );

    // Rebalance: shift DON'T tasks to peak focus window or convert high load into recovery
    const rebalanced = plannedTasks.map((task) => {
      if (dontNames.has(task.task_name)) {
        if (task.cognitive_load === 'Intense' || task.cognitive_load === 'High') {
          // If in the evening, reschedule to morning peak window
          if (task.time_slot.includes('PM') && (task.time_slot.includes('07:') || task.time_slot.includes('08:') || task.time_slot.includes('02:'))) {
            return {
              ...task,
              time_slot: '09:00 AM - 10:45 AM (Peak Shift)',
              task_name: `${task.task_name} [Protected Peak Slot]`,
              cognitive_load: 'Medium' as const,
            };
          }
          // Or replace with deload
          return {
            ...task,
            task_name: `Active Recovery & Light Review (Substituted: ${task.task_name})`,
            category: 'recovery' as const,
            cognitive_load: 'Low' as const,
          };
        }
      }
      return task;
    });

    setPlannedTasks(rebalanced);
    executeEvaluation({ planned_tasks: rebalanced });
  };

  // Handle Location Update
  const handleUpdateLocation = (
    newLocation: string,
    type: LocationTriggerContext['location_type'],
    targetOutputType: LocationTriggerContext['target_output_type']
  ) => {
    const updatedLoc: LocationTriggerContext = {
      detected_location: newLocation,
      location_type: type,
      target_output_type: targetOutputType,
    };
    setLocationContext(updatedLoc);
    executeEvaluation({ location_context: updatedLoc });
  };

  // Handle Reminder controls
  const handleToggleReminder = (taskId: string) => {
    const updated = plannedTasks.map((t) =>
      t.id === taskId ? { ...t, reminder_enabled: t.reminder_enabled === false ? true : false } : t
    );
    setPlannedTasks(updated);
  };

  const handleUpdateReminderLeadTime = (taskId: string, minutes: number) => {
    const updated = plannedTasks.map((t) =>
      t.id === taskId ? { ...t, reminder_minutes_before: minutes, reminder_enabled: true } : t
    );
    setPlannedTasks(updated);
  };

  const handleTriggerTestReminder = (task: PlannedTask) => {
    playReminderChime();
    triggerSystemNotification(
      `LifeOS Reminder: ${task.task_name}`,
      `Starting soon (${task.time_slot}) on ${task.scheduled_day || 'Today'}`
    );
    setActiveReminderTask(task);
  };

  const handlePromptScheduleForDay = (day: string, promptText: string) => {
    handleProcessPrompt(`On ${day}: ${promptText}`);
  };

  // Time-Triggered Check-In Agent Handlers
  const handleTriggerCheckIn = async (time: string) => {
    setIsWellnessLoading(true);
    try {
      const res = await fetch('/api/lifeos/wellness-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'GENERATE_CHECKIN',
          current_time: time,
          current_schedule: plannedTasks,
          telemetry: {
            today_sleep_hours: todaySleepHours,
            today_cognitive_fatigue: todayCognitiveFatigue,
          },
        }),
      });
      const resData = await res.json();
      if (resData.data) {
        setWellnessData(resData.data);
      }
    } catch (err) {
      console.error('Failed to trigger check-in:', err);
    } finally {
      setIsWellnessLoading(false);
    }
  };

  const handleEvaluateCheckInAnswers = async (answers: CheckInAnswers, time: string) => {
    setIsWellnessLoading(true);
    try {
      const res = await fetch('/api/lifeos/wellness-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'EVALUATE_RESPONSE',
          current_time: time,
          current_schedule: plannedTasks,
          telemetry: {
            today_sleep_hours: todaySleepHours,
            today_cognitive_fatigue: todayCognitiveFatigue,
          },
          user_answers: answers,
        }),
      });
      const resData = await res.json();
      if (resData.data) {
        setWellnessData(resData.data);
      }

      // Synchronize fatigue score to LifeOS Hub
      const score = typeof answers.fatigue_level_score === 'number'
        ? answers.fatigue_level_score
        : (typeof answers.energy_score === 'number' ? answers.energy_score : undefined);

      if (typeof score === 'number') {
        setTodayCognitiveFatigue(score);
        executeEvaluation({ today_cognitive_fatigue: score });
      }
    } catch (err) {
      console.error('Failed to evaluate check-in answers:', err);
    } finally {
      setIsWellnessLoading(false);
    }
  };

  // Process user natural language prompt to update all 4 features
  const handleProcessPrompt = async (promptText: string) => {
    setLastPromptText(promptText);
    setIsPromptCompleted(false);
    setPromptCompletedAt(null);
    setIsEvaluating(true);
    setErrorNotice(null);

    const payload = {
      prompt: promptText,
      current_payload: {
        persona: currentPreset.payload.persona,
        persona_title: currentPreset.payload.persona_title,
        weekly_telemetry: currentPreset.payload.weekly_telemetry,
        today_sleep_hours: todaySleepHours,
        today_cognitive_fatigue: todayCognitiveFatigue,
        planned_tasks: plannedTasks,
        location_context: locationContext,
        inbound_comm: inboundComm,
      },
    };

    try {
      const res = await fetch('/api/lifeos/process-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const resData = await res.json();
      if (resData.data) {
        setEvaluation(resData.data);
        setEngineSource(resData.source || 'gemini-3.8-flash');
        setIsPromptCompleted(true);
        setPromptCompletedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }

      if (resData.parsed_context) {
        const parsed: ParsedPromptContext = resData.parsed_context;
        setLastParsedContext(parsed);

        // Update local parameters so UI sliders, tasks, and locations update synchronously
        if (typeof parsed.today_sleep_hours === 'number') {
          setTodaySleepHours(parsed.today_sleep_hours);
        }
        if (typeof parsed.today_cognitive_fatigue === 'number') {
          setTodayCognitiveFatigue(parsed.today_cognitive_fatigue);
        }
        if (parsed.planned_tasks && Array.isArray(parsed.planned_tasks) && parsed.planned_tasks.length > 0) {
          setPlannedTasks(parsed.planned_tasks);
        }
        if (parsed.detected_location) {
          setLocationContext((prev) => ({
            ...prev,
            detected_location: parsed.detected_location!,
            location_type: parsed.location_type || prev.location_type,
            target_output_type: parsed.target_output_type || prev.target_output_type,
          }));
        }
        if (parsed.inbound_comm) {
          setInboundComm(parsed.inbound_comm);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to process prompt:', err);
      setErrorNotice((err as Error).message || 'Failed to process natural language prompt.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const activeHub = evaluation?.feature_1_life_hub_analytics || {
    fatigue_index: 'Moderate' as const,
    burnout_risk_percentage: 45,
    optimal_focus_window: '08:30 AM - 11:45 AM',
    weekly_health_summary: 'Baseline operational cognitive reserve.'
  };
  const activeProxyStatus = evaluation?.feature_4_communication_delegate?.action_taken || evaluation?.feature_4_communication_delegate?.ai_action_taken || 'RESCHEDULED';

  const handleSelectEvalTime = (timeStr: string) => {
    setCurrentEvalTime(timeStr);
    executeEvaluation({ current_time: timeStr });
    handleTriggerCheckIn(timeStr);
  };

  const strictDirective = evaluation.strict_directive_output || {
    schedule_evaluation: {
      active_schedule_count: plannedTasks.length,
      current_time: currentEvalTime,
      current_status: 'ON_TASK' as const,
      active_or_upcoming_task: plannedTasks[0]?.task_name || 'Core Focus Slot',
    },
    reminders_and_checkins: [
      {
        trigger_time: currentEvalTime,
        associated_task: plannedTasks[0]?.task_name || 'Scheduled Slot',
        reminder_type: 'TASK_START' as const,
        message: `Currently active scheduled task: "${plannedTasks[0]?.task_name || 'Deep Work'}". Maintain focus.`,
      },
      {
        trigger_time: currentEvalTime,
        associated_task: 'Circadian Nutrition',
        reminder_type: 'MEAL_CHECK' as const,
        message: 'Circadian nutrition check: Verify you have eaten your meal and hydrated prior to your next focused cognitive sprint.',
      },
    ],
    schedule_audit: evaluation.feature_2_schedule_audit,
    location_and_task_automation: {
      detected_location: locationContext.detected_location,
      automated_action: evaluation.feature_3_location_automation?.recommended_action || 'Autonomous Protocol',
      generated_content: evaluation.feature_3_location_automation?.auto_generated_content || '',
    },
  };

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
    try {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Header */}
      <Header
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onEvaluate={() => executeEvaluation()}
        isEvaluating={isEvaluating}
        engineSource={engineSource}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        
        {/* Error notification banner if any */}
        {errorNotice && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
            <span>Notice: {errorNotice}</span>
            <button
              onClick={() => setErrorNotice(null)}
              className="text-rose-400 hover:text-white underline font-mono text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Screen Switcher Banner - Highly Visible & Responsive */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 px-1">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Workspace:
              <span className="text-white font-bold font-mono">
                {activeTab === 'home' ? 'Home Hub (Overview & All Features)' :
                 activeTab === 'wellness' ? 'Feature 1: Time-Triggered Wellness Check-In & Questions' :
                 activeTab === 'schedule' ? 'Feature 2: Schedule Auditor & DO / DON\'T Advisor' :
                 activeTab === 'location' ? 'Feature 3: Location Automation Engine' :
                 activeTab === 'comms' ? 'Feature 4: AI Communication Proxy Screener' :
                 activeTab === 'prompt_engine' ? 'Natural Language Prompt Engine & Execution Reply' :
                 'Strict Validated Machine-Readable JSON Output'}
              </span>
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
              <span>Persona:</span>
              <span className="text-zinc-300 font-bold">{currentPreset.name}</span>
            </div>
          </div>

          {/* Quick-Switch Pill Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2">
            {[
              { id: 'home' as const, label: 'Home Hub', icon: Home, color: 'bg-indigo-600', ring: 'ring-indigo-400' },
              { id: 'wellness' as const, label: '1. Wellness', icon: HeartPulse, color: 'bg-rose-600', ring: 'ring-rose-400' },
              { id: 'schedule' as const, label: '2. Schedule', icon: Calendar, color: 'bg-blue-600', ring: 'ring-blue-400' },
              { id: 'location' as const, label: '3. Location', icon: Navigation, color: 'bg-cyan-600', ring: 'ring-cyan-400' },
              { id: 'comms' as const, label: '4. Proxy Screener', icon: ShieldCheck, color: 'bg-purple-600', ring: 'ring-purple-400' },
              { id: 'prompt_engine' as const, label: 'Prompt Engine', icon: Terminal, color: 'bg-emerald-600', ring: 'ring-emerald-400' },
              { id: 'json' as const, label: 'Strict JSON', icon: Code, color: 'bg-amber-600', ring: 'ring-amber-400' },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? `${tab.color} text-white shadow-md ring-2 ${tab.ring} font-bold scale-[1.02]`
                      : 'bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SCREEN ROUTING */}
        {activeTab === 'wellness' ? (
          /* FEATURE 1 DEDICATED SCREEN: WELLNESS CHECK-IN & QUESTIONS */
          <div className="space-y-6">
            {/* Dedicated Screen Header Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-zinc-900 to-zinc-950 border border-rose-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate('home')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 hover:border-rose-500 font-mono text-xs transition-all cursor-pointer shadow-md group shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400 group-hover:-translate-x-1 transition-transform" />
                  <span>← Return to Home Hub</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Feature 1 Screen
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-400" />
                      Time-Triggered Wellness Check-In &amp; 5-Question Agent
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Circadian telemetry for <span className="text-white font-medium">{currentPreset.name}</span> ({todaySleepHours}h sleep logged &bull; fatigue: {todayCognitiveFatigue}/10 &bull; focus window: {activeHub.optimal_focus_window}).
                  </p>
                </div>
              </div>

              {/* Feature 1 Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerCheckIn('02:00 PM')}
                  className="px-3.5 py-2 text-xs rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-medium flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Trigger 02:00 PM Check-In
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('schedule')}
                  className="px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next: 2. Schedule Audit</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('json')}
                  className="px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-amber-400" />
                  Inspect JSON
                </button>
              </div>
            </div>

            {/* Time-Triggered Check-In Agent Component */}
            <WellnessCheckInAgent
              checkInData={wellnessData}
              plannedTasks={plannedTasks}
              onTriggerCheckIn={handleTriggerCheckIn}
              onEvaluateAnswers={handleEvaluateCheckInAnswers}
              isLoading={isWellnessLoading}
            />

            {/* Circadian Life Hub Telemetry Component */}
            <Feature1LifeHub
              analytics={activeHub}
              weeklyTelemetry={currentPreset.payload.weekly_telemetry}
              todaySleepHours={todaySleepHours}
              todayCognitiveFatigue={todayCognitiveFatigue}
              onUpdateTodaySleep={(hours) => {
                setTodaySleepHours(hours);
                executeEvaluation({ today_sleep_hours: hours });
              }}
              onUpdateTodayFatigue={(score) => {
                setTodayCognitiveFatigue(score);
                executeEvaluation({ today_cognitive_fatigue: score });
              }}
              onReAudit={() => executeEvaluation()}
            />
          </div>
        ) : activeTab === 'schedule' ? (
          /* FEATURE 2 DEDICATED SCREEN: SCHEDULE AUDITOR & DO/DON'T ADVISOR */
          <div className="space-y-6">
            {/* Dedicated Screen Header Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-zinc-900 to-zinc-950 border border-blue-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate('home')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 hover:border-blue-500 font-mono text-xs transition-all cursor-pointer shadow-md group shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform" />
                  <span>← Return to Home Hub</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Feature 2 Screen
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      AI Schedule Auditor &amp; Binary &quot;DO / DON&apos;T&quot; Advisor
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Auditing {plannedTasks.length} planned items against circadian focus window ({activeHub.optimal_focus_window}) and fatigue index ({activeHub.fatigue_index}).
                  </p>
                </div>
              </div>

              {/* Feature 2 Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSmartRebalance}
                  className="px-3.5 py-2 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-medium flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Smart Rebalance
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('location')}
                  className="px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next: 3. Location</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('json')}
                  className="px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-amber-400" />
                  Inspect JSON
                </button>
              </div>
            </div>
            {/* Live Timing Adherence & Status Verification (Critical Directive) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-blue-900/40 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Directive: Schedule Timing Accuracy
                    </span>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-400" />
                      Live Evaluator: {currentEvalTime}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Strict schedule adherence: checks current time against scheduled slots, issues status verification for passed tasks, and detects free time.
                  </p>
                </div>

                {/* Time selector pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono text-zinc-400 mr-1">Current Time:</span>
                  {['09:30 AM', '02:00 PM', '05:30 PM', '08:30 PM', '11:00 PM'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => handleSelectEvalTime(t)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                        currentEvalTime === t
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 scale-105'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status summary tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Evaluation Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      strictDirective.schedule_evaluation.current_status === 'ON_TASK' ? 'bg-emerald-400 animate-pulse' :
                      strictDirective.schedule_evaluation.current_status === 'TRANSITION' ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400'
                    }`} />
                    <span className={`font-bold ${
                      strictDirective.schedule_evaluation.current_status === 'ON_TASK' ? 'text-emerald-400' :
                      strictDirective.schedule_evaluation.current_status === 'TRANSITION' ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {strictDirective.schedule_evaluation.current_status}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    {strictDirective.schedule_evaluation.current_status === 'ON_TASK' ? 'Actively engaged in scheduled task' :
                     strictDirective.schedule_evaluation.current_status === 'TRANSITION' ? 'Approaching scheduled transition' :
                     'Outside scheduled slots (Free Time)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Active or Upcoming Task</span>
                  <span className="text-white font-bold block mt-1 truncate">
                    {strictDirective.schedule_evaluation.active_or_upcoming_task || 'Free time / Deload'}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    Strict adherence to user schedule
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Strict Directives Count</span>
                  <span className="text-blue-400 font-bold block mt-1">
                    {strictDirective.reminders_and_checkins.length} Reminders / Check-Ins
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    {strictDirective.schedule_audit.length} verified tasks
                  </span>
                </div>
              </div>

              {/* Passed Tasks Status Verification (Critical Directive 2) */}
              {strictDirective.reminders_and_checkins.some(r => r.reminder_type === 'TASK_COMPLETION_CHECK') && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Status Verification Required for Concluded Slots:</span>
                  </div>
                  <div className="space-y-1.5">
                    {strictDirective.reminders_and_checkins
                      .filter(r => r.reminder_type === 'TASK_COMPLETION_CHECK')
                      .map((chk, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-zinc-950/80 border border-amber-900/40 text-xs">
                          <span className="text-zinc-200 font-mono text-[11px]">{chk.message}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = plannedTasks.map(t =>
                                  t.task_name === chk.associated_task ? { ...t, reminder_status: 'completed' as const } : t
                                );
                                setPlannedTasks(updated);
                              }}
                              className="px-2.5 py-1 text-[11px] font-mono rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors"
                            >
                              ✓ Finished
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Extending buffer for ${chk.associated_task} by 15 minutes.`);
                              }}
                              className="px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer transition-colors"
                            >
                              +15m Buffer
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <Feature2ScheduleAuditor
              auditItems={evaluation.feature_2_schedule_audit}
              plannedTasks={plannedTasks}
              fatigueIndex={activeHub.fatigue_index}
              optimalFocusWindow={activeHub.optimal_focus_window}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onSmartRebalance={handleSmartRebalance}
              onReAudit={() => executeEvaluation()}
              onToggleReminder={handleToggleReminder}
              onUpdateReminderLeadTime={handleUpdateReminderLeadTime}
              onTriggerTestReminder={handleTriggerTestReminder}
              onPromptScheduleForDay={handlePromptScheduleForDay}
            />
          </div>
        ) : activeTab === 'location' ? (
          /* FEATURE 3 DEDICATED SCREEN: LOCATION AUTOMATION */
          <div className="space-y-6">
            {/* Dedicated Screen Header Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-zinc-900 to-zinc-950 border border-cyan-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate('home')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 hover:border-cyan-500 font-mono text-xs transition-all cursor-pointer shadow-md group shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
                  <span>← Return to Home Hub</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Feature 3 Screen
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      Location-Aware Trigger &amp; Task Automation Engine
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Geofenced context: <span className="text-white font-medium">{locationContext.detected_location}</span> &bull; Target action: {locationContext.target_output_type}.
                  </p>
                </div>
              </div>

              {/* Feature 3 Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => executeEvaluation()}
                  disabled={isEvaluating}
                  className="px-3.5 py-2 text-xs rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-medium flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Trigger Location Action
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('comms')}
                  className="px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next: 4. Proxy Screener</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('json')}
                  className="px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-amber-400" />
                  Inspect JSON
                </button>
              </div>
            </div>

            <Feature3LocationAutomationComponent
              automation={evaluation.feature_3_location_automation}
              locationContext={locationContext}
              onUpdateLocation={handleUpdateLocation}
              onTriggerAutomation={() => executeEvaluation()}
              isEvaluating={isEvaluating}
            />
          </div>
        ) : activeTab === 'comms' ? (
          /* FEATURE 4 DEDICATED SCREEN: AI COMMUNICATION PROXY */
          <div className="space-y-6">
            {/* Dedicated Screen Header Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-zinc-900 to-zinc-950 border border-purple-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate('home')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 hover:border-purple-500 font-mono text-xs transition-all cursor-pointer shadow-md group shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
                  <span>← Return to Home Hub</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Feature 4 Screen
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      AI Call &amp; Message Proxy Screener
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Screening inbound communications for <span className="text-white font-medium">{currentPreset.name}</span>. Proxy policy verdict: <span className="text-purple-300 font-bold">{activeProxyStatus}</span>.
                  </p>
                </div>
              </div>

              {/* Feature 4 Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => executeEvaluation()}
                  disabled={isEvaluating}
                  className="px-3.5 py-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-medium flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Screen Inbound Message
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('prompt_engine')}
                  className="px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next: Prompt Console</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('json')}
                  className="px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-amber-400" />
                  Inspect JSON
                </button>
              </div>
            </div>

            <Feature4CommunicationDelegateComponent
              delegate={evaluation.feature_4_communication_delegate}
              inboundComm={inboundComm}
              fatigueIndex={activeHub.fatigue_index}
              onUpdateInboundComm={(comm) => {
                setInboundComm(comm);
                executeEvaluation({ inbound_comm: comm });
              }}
              onScreenMessage={() => executeEvaluation()}
              isEvaluating={isEvaluating}
            />
          </div>
        ) : activeTab === 'prompt_engine' ? (
          /* PROMPT ENGINE DEDICATED SCREEN */
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-zinc-950 border border-emerald-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate('home')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 hover:border-emerald-500 font-mono text-xs transition-all cursor-pointer shadow-md group shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                  <span>← Return to Home Hub</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Prompt Engine Console
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Natural Language Command Bar &amp; Real-Time Execution Reply
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Execute free-form schedule changes, sleep updates, locations, or proxy commands with multimodal parameter parsing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleNavigate('json')}
                className="px-3.5 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-amber-400" />
                Inspect JSON
              </button>
            </div>

            {/* Prompt Command Bar */}
            <PromptCommandBar
              onProcessPrompt={handleProcessPrompt}
              isProcessing={isEvaluating}
              lastParsedContext={lastParsedContext}
            />

            {/* Prompt Reply Screen */}
            <PromptReplyScreen
              lastPromptText={lastPromptText}
              isProcessing={isEvaluating}
              isCompleted={isPromptCompleted}
              completedAt={promptCompletedAt}
              engineSource={engineSource}
              lastParsedContext={lastParsedContext}
              evaluation={evaluation}
              onRerunPrompt={() => lastPromptText && handleProcessPrompt(lastPromptText)}
            />
          </div>
        ) : activeTab === 'json' ? (
          /* STRICT JSON SCHEMA DEDICATED SCREEN */
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-950 border border-amber-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate('home')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 hover:border-amber-500 font-mono text-xs transition-all cursor-pointer shadow-md group shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
                  <span>← Return to Home Hub</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Machine-Readable Specification
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-amber-400" />
                      Strict Machine-Readable JSON Output Block
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    100% compliant with the required 4-feature LifeOS JSON schema without Markdown formatting outside the block.
                  </p>
                </div>
              </div>
            </div>

            <JsonViewer data={evaluation} engineSource={engineSource} />
          </div>
        ) : (
          /* HOME SCREEN: COMPREHENSIVE OVERVIEW, PERSONA HUD, 4-FEATURE PORTAL & PROMPT BAR */
          <div className="space-y-6">
            
            {/* Persona Context Card & Live Telemetry HUD */}
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentPreset.avatar}
                  alt={currentPreset.name}
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold text-white tracking-tight">
                      {currentPreset.name}
                    </h1>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {currentPreset.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {currentPreset.tagline}
                  </p>
                </div>
              </div>

              {/* Quick HUD Metrics */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px] uppercase">Fatigue Level</span>
                  <span className={`font-bold ${
                    activeHub.fatigue_index === 'Critical' ? 'text-rose-400' :
                    activeHub.fatigue_index === 'High' ? 'text-orange-400' :
                    activeHub.fatigue_index === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {activeHub.fatigue_index}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px] uppercase">Burnout Risk</span>
                  <span className="font-bold text-cyan-400">
                    {activeHub.burnout_risk_percentage}%
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px] uppercase">Focus Window</span>
                  <span className="font-bold text-indigo-300">
                    {activeHub.optimal_focus_window}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px] uppercase">Proxy Status</span>
                  <span className="font-bold text-purple-400">
                    {activeProxyStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Precision Schedule Adherence & Timing Monitor (Critical Directive) */}
            <div className="bg-gradient-to-r from-zinc-900 via-indigo-950/30 to-zinc-900 border border-indigo-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Directive: Schedule Timing Accuracy
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      Live Schedule Evaluation &bull; {currentEvalTime}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Strict adherence to user schedule. Evaluates timing accuracy: matches active tasks, verifies completed tasks, or flags free time.
                  </p>
                </div>

                {/* Quick Time Simulator */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono text-zinc-400 mr-1">Simulate Time:</span>
                  {['09:30 AM', '02:00 PM', '05:30 PM', '08:30 PM', '11:00 PM'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => handleSelectEvalTime(t)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                        currentEvalTime === t
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 scale-105'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status and Active Task Banner */}
              <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] font-mono uppercase">Current Schedule Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      strictDirective.schedule_evaluation.current_status === 'ON_TASK' ? 'bg-emerald-400 animate-pulse' :
                      strictDirective.schedule_evaluation.current_status === 'TRANSITION' ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400'
                    }`} />
                    <span className={`font-bold font-mono text-sm ${
                      strictDirective.schedule_evaluation.current_status === 'ON_TASK' ? 'text-emerald-400' :
                      strictDirective.schedule_evaluation.current_status === 'TRANSITION' ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {strictDirective.schedule_evaluation.current_status}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                    {strictDirective.schedule_evaluation.current_status === 'ON_TASK' ? 'Active scheduled slot in progress' :
                     strictDirective.schedule_evaluation.current_status === 'TRANSITION' ? 'Transitioning to upcoming task' :
                     'Outside scheduled tasks (Free Time)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] font-mono uppercase">Active / Upcoming Task</span>
                  <span className="text-white font-semibold font-mono text-xs mt-1 block truncate">
                    {strictDirective.schedule_evaluation.active_or_upcoming_task || 'Free time / Deload'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                    {strictDirective.schedule_evaluation.active_schedule_count} user scheduled tasks
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono uppercase">Active Directives</span>
                    <span className="text-indigo-400 font-bold font-mono text-sm mt-0.5 block">
                      {strictDirective.reminders_and_checkins.length} Reminders / Check-Ins
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate('schedule')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-mono transition-all cursor-pointer"
                  >
                    Auditor →
                  </button>
                </div>
              </div>
            </div>

            {/* 6 DEDICATED SCREEN PORTAL CARDS - Clean Non-Nested Working Buttons */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  LifeOS Dedicated Feature Screens
                </h2>
                <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                  Click any button to switch directly to its dedicated full-page screen
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* CARD 1: FEATURE 1 - WELLNESS CHECK-IN */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/50 transition-all shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">Feature 1 Screen</span>
                          <h3 className="text-sm font-bold text-white">
                            Wellness Check-In &amp; 5 Questions
                          </h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/40">
                        {wellnessData?.current_time_evaluated || currentEvalTime}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mb-3">
                      Autonomous 5-dimensional well-being queries: meals, sleep ({todaySleepHours}h), tasks, energy ({todayCognitiveFatigue}/10), and physical strain.
                    </p>

                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono text-zinc-300 mb-4 space-y-0.5">
                      <div className="text-emerald-400 font-semibold flex items-center justify-between">
                        <span>5 Check-In Questions:</span>
                        <span>Active</span>
                      </div>
                      <div className="text-zinc-500 text-[10px] truncate">
                        1. Nutrition &bull; 2. Sleep &bull; 3. Tasks &bull; 4. Energy &bull; 5. Strain
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('wellness')}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <span>Open Feature 1: Wellness Screen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* CARD 2: FEATURE 2 - SCHEDULE AUDITOR */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-blue-500/50 transition-all shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">Feature 2 Screen</span>
                          <h3 className="text-sm font-bold text-white">
                            Schedule Auditor &amp; DO/DON&apos;T
                          </h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40">
                        {plannedTasks.length} Tasks
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mb-3">
                      Strict schedule adherence: DO / DON&apos;T / RESCHEDULE audits against fatigue ({activeHub.fatigue_index}) and timing accuracy.
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-xs">
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">DO</span>
                        <span className="text-white font-bold font-mono">
                          {(evaluation.feature_2_schedule_audit || []).filter(i => i.verdict === 'DO').length}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-between">
                        <span className="text-rose-400 font-bold">DON&apos;T</span>
                        <span className="text-white font-bold font-mono">
                          {(evaluation.feature_2_schedule_audit || []).filter(i => i.verdict === "DON'T").length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('schedule')}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <span>Open Feature 2: Schedule Screen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* CARD 3: FEATURE 3 - LOCATION AUTOMATION */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 transition-all shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <Navigation className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Feature 3 Screen</span>
                          <h3 className="text-sm font-bold text-white">
                            Location-Aware Automation
                          </h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                        Geofenced
                      </span>
                    </div>

                    <div className="text-xs font-mono text-zinc-300 mb-2 truncate">
                      📍 {locationContext.detected_location.split('-')[0]?.trim()}
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 mb-4 line-clamp-2">
                      <span className="text-cyan-400 font-semibold font-mono block">Action:</span>
                      {evaluation.feature_3_location_automation?.recommended_action || 'Autonomous Protocol'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('location')}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                  >
                    <span>Open Feature 3: Location Screen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* CARD 4: FEATURE 4 - COMMUNICATION DELEGATE */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/50 transition-all shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Feature 4 Screen</span>
                          <h3 className="text-sm font-bold text-white">
                            Communication Proxy Screener
                          </h3>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        activeProxyStatus === 'ACCEPTED' ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40' :
                        activeProxyStatus === 'DECLINED' ? 'bg-rose-950/70 text-rose-300 border-rose-800/40' :
                        activeProxyStatus === 'RESCHEDULED' ? 'bg-amber-950/70 text-amber-300 border-amber-800/40' :
                        'bg-blue-950/70 text-blue-300 border-blue-800/40'
                      }`}>
                        {activeProxyStatus}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-zinc-300 mb-2 truncate">
                      From: <span className="text-white font-semibold">{inboundComm.incoming_sender}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 mb-4 line-clamp-2">
                      <span className="text-purple-400 font-semibold font-mono block">Automated Proxy Response:</span>
                      &quot;{evaluation.feature_4_communication_delegate?.automated_reply || 'Automated response generated.'}&quot;
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('comms')}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <span>Open Feature 4: Proxy Screen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* CARD 5: PROMPT ENGINE CONSOLE */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 transition-all shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Terminal className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Console Screen</span>
                          <h3 className="text-sm font-bold text-white">
                            Natural Language Prompt Engine
                          </h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                        AI Multimodal
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mb-3">
                      Natural language command bar and real-time execution reply: parse free-form schedule changes, sleep updates, and locations.
                    </p>

                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 mb-4 truncate font-mono">
                      Last prompt: &quot;{lastPromptText}&quot;
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('prompt_engine')}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <span>Open Prompt Console Screen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* CARD 6: STRICT JSON OUTPUT SPECIFICATION */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 transition-all shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Code className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Specification Screen</span>
                          <h3 className="text-sm font-bold text-white">
                            Strict Validated JSON Output
                          </h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        1:1 Strict
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mb-3">
                      100% compliant with the required LifeOS JSON structure without markdown outside the block: schedule evaluation, reminders, audits, &amp; automation.
                    </p>

                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 mb-4 font-mono">
                      {strictDirective.reminders_and_checkins.length} reminders &bull; {strictDirective.schedule_audit.length} task audits
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('json')}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-98 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                  >
                    <span>Open Strict JSON Screen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* OPERATIONAL PHASES MONITOR (User Request 7) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-indigo-950/40 border border-zinc-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-sm">
                  {evaluation.phase_type === 'CHECKIN_GENERATION' ? 'P1' : 'P2'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/40">
                      Operational Flow
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {evaluation.phase_type === 'CHECKIN_GENERATION' ? 'Phase 1: Dynamic Check-In & Question Generation' : 'Phase 2: Analysis, Schedule Audit & Automation'}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {evaluation.phase_type === 'CHECKIN_GENERATION'
                      ? 'Actively evaluating current circadian time against schedule to formulate 5 multidimensional wellness questions.'
                      : 'Analyzing check-in answers alongside schedule context: issuing binary DO/DON\'T verdicts, location drafts, and proxy screening.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    executeEvaluation({ phase_type: 'CHECKIN_GENERATION' });
                    handleTriggerCheckIn('02:00 PM');
                    handleNavigate('wellness');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    evaluation.phase_type === 'CHECKIN_GENERATION'
                      ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  Phase 1: Launch Check-In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    executeEvaluation({ phase_type: 'FULL_EVALUATION' });
                    handleNavigate('schedule');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    evaluation.phase_type === 'FULL_EVALUATION'
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  Phase 2: Full Audit Screen
                </button>
              </div>
            </div>

            {/* PROMPT LINE: Natural Language Co-Pilot Bar */}
            <PromptCommandBar
              onProcessPrompt={handleProcessPrompt}
              isProcessing={isEvaluating}
              lastParsedContext={lastParsedContext}
            />

            {/* PROMPT ENGINE REPLY SCREEN & EXECUTION MONITOR */}
            <PromptReplyScreen
              lastPromptText={lastPromptText}
              isProcessing={isEvaluating}
              isCompleted={isPromptCompleted}
              completedAt={promptCompletedAt}
              engineSource={engineSource}
              lastParsedContext={lastParsedContext}
              evaluation={evaluation}
              onRerunPrompt={() => lastPromptText && handleProcessPrompt(lastPromptText)}
            />

            {/* QUICK ACTIONS & JSON FOOTER BANNER */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-300">
                <Code className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>All 4 features synchronized &bull; Validated strictly against the JSON Output Specification.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('prompt_engine')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Prompt Console
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('json')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Code className="w-3.5 h-3.5" />
                  Inspect Strict JSON
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Active Reminder Modal */}
      {activeReminderTask && (
        <ActiveReminderModal
          task={activeReminderTask}
          auditItem={evaluation?.feature_2_schedule_audit.find(
            (a) => a.task_name === activeReminderTask.task_name || a.time_slot === activeReminderTask.time_slot
          )}
          onDismiss={() => setActiveReminderTask(null)}
          onSnooze={(mins) => {
            setActiveReminderTask(null);
            setTimeout(() => {
              playReminderChime();
              setActiveReminderTask(activeReminderTask);
            }, mins * 60 * 1000);
          }}
          onComplete={() => {
            const updated = plannedTasks.map((t) =>
              t.id === activeReminderTask.id ? { ...t, reminder_status: 'completed' as const } : t
            );
            setPlannedTasks(updated);
            setActiveReminderTask(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-xs text-zinc-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LifeOS Autonomous Schedule Engine &bull; Gemini 3.8 Flash Native Integration</span>
          <span>Validated against 4 Core Features &amp; Strict JSON Output Schema</span>
        </div>
      </footer>
    </div>
  );
}
