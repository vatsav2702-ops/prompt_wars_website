import React, { useEffect } from 'react';
import { PlannedTask, ScheduleAuditItem } from '../types/lifeos.ts';
import { Bell, Clock, CheckCircle2, XCircle, Brain, X, Volume2 } from 'lucide-react';
import { playReminderChime } from '../utils/reminderAudio.ts';

interface ActiveReminderModalProps {
  task: PlannedTask;
  auditItem?: ScheduleAuditItem;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onComplete: () => void;
}

export const ActiveReminderModal: React.FC<ActiveReminderModalProps> = ({
  task,
  auditItem,
  onDismiss,
  onSnooze,
  onComplete,
}) => {
  const isDo = auditItem?.verdict === 'DO';

  useEffect(() => {
    playReminderChime();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-indigo-500/50 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden text-zinc-100">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  LifeOS Schedule Reminder
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {task.scheduled_day || 'Today'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">Scheduled slot starting soon</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playReminderChime()}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
              title="Test chime sound"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Details Card */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-cyan-300">
              {task.time_slot}
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              Load: {task.cognitive_load}
            </span>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight mb-2">
            {task.task_name}
          </h3>

          {/* AI Schedule Verdict */}
          {auditItem && (
            <div className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed ${
              isDo
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-1 font-mono uppercase text-[11px]">
                {isDo ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Advisory: DO</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>AI Advisory: DON'T</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-zinc-300">
                {auditItem.reasoning}
              </p>
            </div>
          )}
        </div>

        {/* Quick action controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onSnooze(5)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium transition-colors cursor-pointer"
            >
              Snooze 5 Min
            </button>
            <button
              onClick={() => onSnooze(15)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium transition-colors cursor-pointer"
            >
              Snooze 15 Min
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onComplete}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Mark Completed
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
