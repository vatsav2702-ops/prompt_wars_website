import React, { useState } from 'react';
import { ScheduleAuditItem, PlannedTask, FatigueLevel } from '../types/lifeos.ts';
import { Calendar, CheckCircle2, XCircle, AlertTriangle, Clock, Plus, Trash2, Sparkles, Filter, Bell, BellRing, BellOff, Volume2, Send, Terminal } from 'lucide-react';
import { requestNotificationPermission } from '../utils/reminderAudio.ts';

interface Feature2ScheduleAuditorProps {
  auditItems: ScheduleAuditItem[];
  plannedTasks: PlannedTask[];
  fatigueIndex: FatigueLevel;
  optimalFocusWindow: string;
  onAddTask: (task: PlannedTask) => void;
  onDeleteTask: (id: string) => void;
  onSmartRebalance: () => void;
  onReAudit: () => void;
  onToggleReminder: (taskId: string) => void;
  onUpdateReminderLeadTime: (taskId: string, minutes: number) => void;
  onTriggerTestReminder: (task: PlannedTask) => void;
  onPromptScheduleForDay: (day: string, promptText: string) => void;
}

const DAYS_OF_WEEK = ['All Days', 'Today', 'Tomorrow', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const Feature2ScheduleAuditor: React.FC<Feature2ScheduleAuditorProps> = ({
  auditItems,
  plannedTasks,
  fatigueIndex,
  optimalFocusWindow,
  onAddTask,
  onDeleteTask,
  onSmartRebalance,
  onReAudit,
  onToggleReminder,
  onUpdateReminderLeadTime,
  onTriggerTestReminder,
  onPromptScheduleForDay,
}) => {
  const [filter, setFilter] = useState<'all' | 'do' | 'dont'>('all');
  const [selectedDay, setSelectedDay] = useState<string>('All Days');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPromptScheduleOpen, setIsPromptScheduleOpen] = useState(false);

  // Prompt schedule for a particular day
  const [dayPromptText, setDayPromptText] = useState('');
  const [targetDayPrompt, setTargetDayPrompt] = useState('Tomorrow');

  // New task form state
  const [newTaskSlot, setNewTaskSlot] = useState('02:00 PM - 04:00 PM');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<PlannedTask['category']>('deep_work');
  const [newTaskLoad, setNewTaskLoad] = useState<PlannedTask['cognitive_load']>('High');
  const [newTaskDay, setNewTaskDay] = useState('Today');
  const [newTaskReminder, setNewTaskReminder] = useState(true);
  const [newTaskLeadTime, setNewTaskLeadTime] = useState(15);

  const doCount = auditItems.filter((i) => i.verdict === 'DO').length;
  const dontCount = auditItems.filter((i) => i.verdict === "DON'T").length;
  const armedRemindersCount = plannedTasks.filter((t) => t.reminder_enabled !== false).length;

  // Filter by DO/DON'T and by Day
  const filteredTasks = plannedTasks.filter((t) => {
    if (selectedDay !== 'All Days') {
      const taskDay = t.scheduled_day || 'Today';
      if (taskDay.toLowerCase() !== selectedDay.toLowerCase()) return false;
    }
    const audit = auditItems.find((a) => a.task_name === t.task_name || a.time_slot === t.time_slot);
    if (filter === 'do') return audit?.verdict === 'DO';
    if (filter === 'dont') return audit?.verdict === "DON'T";
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const task: PlannedTask = {
      id: `task-${Date.now()}`,
      time_slot: newTaskSlot,
      task_name: newTaskName.trim(),
      category: newTaskCategory,
      cognitive_load: newTaskLoad,
      scheduled_day: newTaskDay,
      reminder_enabled: newTaskReminder,
      reminder_minutes_before: newTaskLeadTime,
      reminder_status: 'armed',
    };

    onAddTask(task);
    setNewTaskName('');
    setIsAddOpen(false);
  };

  const handleDayPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayPromptText.trim()) return;
    onPromptScheduleForDay(targetDayPrompt, dayPromptText.trim());
    setDayPromptText('');
    setIsPromptScheduleOpen(false);
  };

  const getLoadBadgeColor = (load?: string) => {
    switch (load) {
      case 'Intense':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/40';
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
      {/* Background ambient glow */}
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40">
              Feature 2
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              AI Schedule Auditor, Day Planner &amp; Reminders
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Prompt-based multi-day schedule builder, binary DO/DON'T cognitive audit, and autonomous audio reminders.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPromptScheduleOpen(!isPromptScheduleOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prompt Day Schedule</span>
          </button>

          <button
            onClick={onSmartRebalance}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg transition-all cursor-pointer"
            title="Automatically reschedule DON'T tasks"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rebalance</span>
          </button>

          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* PROMPT-TO-SCHEDULE DRAWER FOR A PARTICULAR DAY */}
      {isPromptScheduleOpen && (
        <form onSubmit={handleDayPromptSubmit} className="mb-5 p-4 rounded-xl bg-zinc-950 border border-indigo-500/40 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold">
                Add Schedule for a Particular Day via Natural Language Prompt
              </h4>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Auto-audited &amp; Reminders Armed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mb-2.5">
            <div className="sm:col-span-1">
              <label className="block text-[11px] text-zinc-400 mb-1">Target Day</label>
              <select
                value={targetDayPrompt}
                onChange={(e) => setTargetDayPrompt(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
              >
                <option value="Today">Today (Tuesday)</option>
                <option value="Tomorrow">Tomorrow (Wednesday)</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] text-zinc-400 mb-1">
                Describe your planned schedule on {targetDayPrompt}
              </label>
              <input
                type="text"
                value={dayPromptText}
                onChange={(e) => setDayPromptText(e.target.value)}
                placeholder="e.g. 9am-11am Compiler architecture, 1pm lunch sync, 3pm-5pm lab problem sets, 6:30pm gym"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-500 font-mono">
              LifeOS will parse time slots, categorize cognitive loads, assign DO/DON'T, and set reminders.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPromptScheduleOpen(false)}
                className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add &amp; Audit Schedule</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Particular Day Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 shrink-0">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-300">
            <BellRing className="w-3.5 h-3.5 text-indigo-400" />
            <span>{armedRemindersCount} Reminders Armed</span>
          </div>

          <button
            onClick={() => requestNotificationPermission()}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 underline"
            title="Enable native desktop notifications"
          >
            Enable Desktop Alerts
          </button>
        </div>
      </div>

      {/* Audit Verdict Summary & DO/DON'T Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono font-medium text-emerald-400">
              {doCount} DO Verdicts
            </span>
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs font-mono font-medium text-rose-400">
              {dontCount} DON'T Warnings
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-400 font-mono pl-2">
            <span>Peak Focus Corridor:</span>
            <span className="text-indigo-300 font-semibold">{optimalFocusWindow}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'all' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({plannedTasks.length})
          </button>
          <button
            onClick={() => setFilter('do')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'do' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DO ({doCount})
          </button>
          <button
            onClick={() => setFilter('dont')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'dont' ? 'bg-rose-950 text-rose-300 border border-rose-800/50 font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DON'T ({dontCount})
          </button>
        </div>
      </div>

      {/* Add Task Modal / Drawer */}
      {isAddOpen && (
        <form onSubmit={handleCreateTask} className="mb-5 p-4 rounded-xl bg-zinc-950 border border-cyan-800/40 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">
              Insert Planned Slot for AI Audit &amp; Reminders
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">Evaluated instantly</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] text-zinc-400 mb-1">Day</label>
              <select
                value={newTaskDay}
                onChange={(e) => setNewTaskDay(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[11px] text-zinc-400 mb-1">Time Slot</label>
              <input
                type="text"
                value={newTaskSlot}
                onChange={(e) => setNewTaskSlot(e.target.value)}
                placeholder="02:00 PM - 04:00 PM"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-zinc-400 mb-1">Task Title / Activity</label>
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="e.g. Distributed Database Architecture RFC"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] text-zinc-400 mb-1">Category</label>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value as PlannedTask['category'])}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="deep_work">Deep Work / Problem Solving</option>
                <option value="coding">Software / Coding</option>
                <option value="study">Academic Study / Memorization</option>
                <option value="meeting">Meetings &amp; Presentations</option>
                <option value="fitness">Exercise &amp; Movement</option>
                <option value="recovery">Active Recovery &amp; Rest</option>
                <option value="admin">Admin &amp; Email</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[11px] text-zinc-400 mb-1">Cognitive Load</label>
              <select
                value={newTaskLoad}
                onChange={(e) => setNewTaskLoad(e.target.value as PlannedTask['cognitive_load'])}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Intense">Intense</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[11px] text-zinc-400 mb-1">Reminder Lead Time</label>
              <select
                value={newTaskLeadTime}
                onChange={(e) => setNewTaskLeadTime(parseInt(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value={0}>At start time</option>
                <option value={5}>5 mins before</option>
                <option value={15}>15 mins before</option>
                <option value={30}>30 mins before</option>
              </select>
            </div>
          </div>

          <div className="mt-3.5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-sm"
            >
              Schedule &amp; Arm Reminder
            </button>
          </div>
        </form>
      )}

      {/* Schedule Audit & Reminder Timeline List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
            No schedule slots found for <strong className="text-zinc-300">{selectedDay}</strong> matching filter. Click &ldquo;Prompt Day Schedule&rdquo; above to generate one!
          </div>
        ) : (
          filteredTasks.map((task) => {
            const audit = auditItems.find((a) => a.task_name === task.task_name || a.time_slot === task.time_slot);
            const isDo = audit ? audit.verdict === 'DO' : true;
            const reminderArmed = task.reminder_enabled !== false;
            const leadMinutes = task.reminder_minutes_before ?? 15;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  isDo
                    ? 'border-emerald-500/25 bg-emerald-950/10 hover:border-emerald-500/40'
                    : 'border-rose-500/30 bg-rose-950/15 hover:border-rose-500/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Left: Time Slot, Day Badge, Category & Task */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-semibold text-zinc-300 flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {task.time_slot}
                      </span>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                        {task.scheduled_day || 'Today'}
                      </span>

                      {task.cognitive_load && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getLoadBadgeColor(task.cognitive_load)}`}>
                          Load: {task.cognitive_load}
                        </span>
                      )}

                      {task.category && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {task.category.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      {task.task_name}
                    </h4>

                    {/* Reasoning callout */}
                    {audit && (
                      <p className={`text-xs mt-2 leading-relaxed ${isDo ? 'text-zinc-300' : 'text-rose-200/90'}`}>
                        {audit.reasoning}
                      </p>
                    )}

                    {/* Reminder Status & Quick Lead Time Pill */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <button
                        onClick={() => onToggleReminder(task.id)}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          reminderArmed
                            ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60 hover:bg-indigo-900'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                        }`}
                      >
                        {reminderArmed ? <BellRing className="w-3 h-3 text-indigo-400 animate-pulse" /> : <BellOff className="w-3 h-3" />}
                        <span>{reminderArmed ? `Reminder Armed (${leadMinutes}m before)` : 'Reminder Disabled'}</span>
                      </button>

                      {reminderArmed && (
                        <>
                          <select
                            value={leadMinutes}
                            onChange={(e) => onUpdateReminderLeadTime(task.id, parseInt(e.target.value))}
                            className="bg-zinc-900 text-zinc-300 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] focus:outline-none cursor-pointer"
                          >
                            <option value={0}>At start</option>
                            <option value={5}>5m before</option>
                            <option value={15}>15m before</option>
                            <option value={30}>30m before</option>
                          </select>

                          <button
                            onClick={() => onTriggerTestReminder(task)}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline ml-1 cursor-pointer"
                            title="Play reminder chime and test modal alert"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Test Alert</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Binary Verdict Badge & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0">
                    <div
                      className={`px-3.5 py-1.5 rounded-lg font-mono font-black text-xs tracking-wider flex items-center gap-1.5 shadow-md ${
                        isDo
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                          : 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-rose-500/20 animate-pulse'
                      }`}
                    >
                      {isDo ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>DO</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>DON'T</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-zinc-500 hover:text-zinc-300 text-[11px] flex items-center gap-1 p-1 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                      title="Remove task from schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sm:hidden">Remove</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
