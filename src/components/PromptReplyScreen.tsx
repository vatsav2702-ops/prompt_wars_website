import React, { useState } from 'react';
import { LifeOSResponse, ParsedPromptContext } from '../types/lifeos.ts';
import { Terminal, CheckCircle2, Clock, Cpu, Activity, Calendar, Navigation, ShieldCheck, Copy, Check, ChevronDown, ChevronUp, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';

interface PromptReplyScreenProps {
  lastPromptText: string;
  isProcessing: boolean;
  isCompleted: boolean;
  completedAt: string | null;
  engineSource: string;
  lastParsedContext: ParsedPromptContext | null;
  evaluation: LifeOSResponse | null;
  onRerunPrompt?: () => void;
}

export const PromptReplyScreen: React.FC<PromptReplyScreenProps> = ({
  lastPromptText,
  isProcessing,
  isCompleted,
  completedAt,
  engineSource,
  lastParsedContext,
  evaluation,
  onRerunPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleCopySummary = () => {
    if (!evaluation) return;
    const hub = evaluation.feature_1_life_hub_analytics || {
      fatigue_index: 'Moderate' as const,
      burnout_risk_percentage: 45,
      optimal_focus_window: '08:30 AM - 11:45 AM',
      weekly_health_summary: 'Baseline operational cognitive reserve.'
    };
    const locAction = evaluation.feature_3_location_automation.action_triggered || evaluation.feature_3_location_automation.recommended_action || 'Autonomous Protocol';
    const commAction = evaluation.feature_4_communication_delegate.action_taken || evaluation.feature_4_communication_delegate.ai_action_taken || 'RESCHEDULED';
    const summaryText = `[LifeOS Engine Response for: "${lastPromptText}"]
Status: COMPLETED (${engineSource})
- Fatigue Index: ${hub.fatigue_index} (Burnout Risk: ${hub.burnout_risk_percentage}%)
- Focus Window: ${hub.optimal_focus_window}
- Schedule Audit: ${(evaluation.feature_2_schedule_audit || []).map(t => `${t.time_slot} [${t.verdict}]: ${t.task_name}`).join('; ')}
- Location Trigger: ${evaluation.feature_3_location_automation.detected_location} (${locAction})
- Communication Proxy: ${commAction} for ${evaluation.feature_4_communication_delegate.incoming_sender}
Reply: "${evaluation.feature_4_communication_delegate.automated_reply}"`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background ambient glow */}
      <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
        isProcessing ? 'bg-amber-500/10' : isCompleted ? 'bg-emerald-500/10' : 'bg-indigo-500/5'
      }`} />

      {/* Top Monitor Header: Shows if it is Processing or Completed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono border ${
            isProcessing
              ? 'bg-amber-950/60 border-amber-700/60 text-amber-400'
              : isCompleted
              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}>
            <Terminal className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Prompt Engine Reply Screen &amp; Execution Monitor
              </h3>
              
              {/* PRIMARY STATUS BADGE */}
              {isProcessing ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  PROCESSING PROMPT...
                </span>
              ) : isCompleted ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  PROMPT COMPLETED &amp; APPLIED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800 text-[10px] font-mono">
                  Awaiting Test Prompt
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
              <span>Engine: <strong className="text-zinc-200">{engineSource}</strong></span>
              {completedAt && (
                <>
                  <span>&bull;</span>
                  <span>Completed at {completedAt}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {evaluation && (
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Reply</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Reply</span>
                </>
              )}
            </button>
          )}

          {lastPromptText && onRerunPrompt && (
            <button
              onClick={onRerunPrompt}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Re-Test</span>
            </button>
          )}
        </div>
      </div>

      {/* When Processing: Animated Progress Steps */}
      {isProcessing && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 mb-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-amber-300">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Currently Processing Prompt Telemetry...</span>
          </div>
          <p className="text-xs text-amber-200/80 mb-3">
            Testing against your natural language prompt: &ldquo;{lastPromptText}&rdquo;
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-400">
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>1. Sleep &amp; Load Parsing</span>
            </div>
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>2. DO/DON&apos;T Schedule Audit</span>
            </div>
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>3. Geofence Trigger Draft</span>
            </div>
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>4. Comm Screener Proxy</span>
            </div>
          </div>
        </div>
      )}

      {/* When Completed: Detailed Breakdown of How the Engine Responded to the Test */}
      {isCompleted && evaluation && (
        <div className="space-y-4">
          
          {/* Tested Prompt Banner */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              Tested Natural Language Input:
            </span>
            <p className="text-zinc-200 italic font-sans leading-relaxed">
              &ldquo;{lastPromptText}&rdquo;
            </p>
          </div>

          {/* 4 Feature Response Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Feature 1 Response */}
            {(() => {
              const hub = evaluation.feature_1_life_hub_analytics || {
                fatigue_index: 'Moderate' as const,
                burnout_risk_percentage: 45,
                optimal_focus_window: '08:30 AM - 11:45 AM',
                weekly_health_summary: 'Baseline operational cognitive reserve.'
              };
              const locAction = evaluation.feature_3_location_automation.action_triggered || evaluation.feature_3_location_automation.recommended_action || 'Autonomous Protocol';
              const locDraft = evaluation.feature_3_location_automation.drafted_output || evaluation.feature_3_location_automation.auto_generated_content || '';
              const commAction = evaluation.feature_4_communication_delegate.action_taken || evaluation.feature_4_communication_delegate.ai_action_taken || 'RESCHEDULED';

              return (
                <>
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                          <Activity className="w-3.5 h-3.5" />
                          <span>Feature 1: Life Hub Response</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          hub.fatigue_index === 'Critical' ? 'bg-rose-950 text-rose-300' :
                          hub.fatigue_index === 'High' ? 'bg-orange-950 text-orange-300' :
                          'bg-emerald-950 text-emerald-300'
                        }`}>
                          {hub.fatigue_index} Fatigue
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300">
                        Burnout Risk evaluated at <strong className="text-cyan-400 font-mono">{hub.burnout_risk_percentage}%</strong>. Peak focus corridor: <strong className="text-indigo-300 font-mono">{hub.optimal_focus_window}</strong>.
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-zinc-500 truncate font-mono">
                      {hub.weekly_health_summary}
                    </div>
                  </div>

                  {/* Feature 2 Response */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Feature 2: Schedule Audit Response</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {(evaluation.feature_2_schedule_audit || []).length} Slots Audited
                        </span>
                      </div>
                      
                      {/* List of verdicts */}
                      <div className="space-y-1 mt-1">
                        {(evaluation.feature_2_schedule_audit || []).slice(0, 2).map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300 truncate max-w-[200px]">{item.task_name}</span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              item.verdict === 'DO' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                            }`}>
                              {item.verdict}
                            </span>
                          </div>
                        ))}
                        {(evaluation.feature_2_schedule_audit || []).length > 2 && (
                          <div className="text-[10px] text-zinc-500 font-mono">
                            + {evaluation.feature_2_schedule_audit.length - 2} more tasks scheduled &amp; evaluated
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Feature 3 Response */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Feature 3: Location Automation</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {(evaluation.feature_3_location_automation.detected_location || '').split(' - ')[0]}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 font-medium">
                        {locAction}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-zinc-500 line-clamp-2 font-mono">
                      {locDraft ? `${locDraft.slice(0, 120)}...` : 'Contextual draft executed.'}
                    </div>
                  </div>

                  {/* Feature 4 Response */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Feature 4: Comm Screener</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          commAction === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300' :
                          commAction === 'DECLINED' ? 'bg-rose-950 text-rose-300' :
                          commAction === 'DELEGATED' ? 'bg-indigo-950 text-indigo-300' :
                          'bg-amber-950 text-amber-300'
                        }`}>
                          {commAction}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300">
                        Triaged sender: <strong className="text-white">{evaluation.feature_4_communication_delegate.incoming_sender}</strong>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-purple-300/80 italic line-clamp-2 font-sans bg-zinc-950/60 p-1.5 rounded border border-zinc-800">
                      &ldquo;{evaluation.feature_4_communication_delegate.automated_reply}&rdquo;
                    </div>
                  </div>
                </>
              );
            })()}
            </div>

          {/* Toggle Raw JSON Response */}
          <div className="pt-1">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors font-mono cursor-pointer"
            >
              {showRawJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showRawJson ? 'Hide Raw Engine JSON' : 'View Complete Raw Engine Reply JSON'}</span>
            </button>

            {showRawJson && (
              <pre className="mt-2 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-56 leading-relaxed">
                {JSON.stringify(evaluation, null, 2)}
              </pre>
            )}
          </div>

        </div>
      )}

      {/* When Idle / No prompt run yet */}
      {!isProcessing && !isCompleted && (
        <div className="p-6 text-center rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800 text-xs text-zinc-500">
          <Terminal className="w-5 h-5 mx-auto mb-1.5 text-zinc-600" />
          <span>Type any schedule or daily life update in the prompt line above, or click one of the quick scenario buttons to test the engine. The reply screen will show live processing and completion details here.</span>
        </div>
      )}
    </div>
  );
};
