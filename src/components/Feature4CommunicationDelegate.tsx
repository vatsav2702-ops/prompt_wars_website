import React, { useState } from 'react';
import { Feature4CommunicationDelegate, InboundCommunication, FatigueLevel, ProxyAction } from '../types/lifeos.ts';
import { MessageSquare, ShieldCheck, Send, PhoneCall, Copy, Check, Sparkles, UserCheck, CornerDownRight, AlertCircle, RefreshCw } from 'lucide-react';
import { SAMPLE_INCOMING_MESSAGES } from '../data/presets.ts';

interface Feature4CommunicationDelegateProps {
  delegate: Feature4CommunicationDelegate;
  inboundComm: InboundCommunication;
  fatigueIndex: FatigueLevel;
  onUpdateInboundComm: (comm: InboundCommunication) => void;
  onScreenMessage: () => void;
  isEvaluating: boolean;
}

export const Feature4CommunicationDelegateComponent: React.FC<Feature4CommunicationDelegateProps> = ({
  delegate,
  inboundComm,
  fatigueIndex,
  onUpdateInboundComm,
  onScreenMessage,
  isEvaluating,
}) => {
  const [copied, setCopied] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customSender, setCustomSender] = useState('');
  const [customRole, setCustomRole] = useState('Colleague / Collaborator');
  const [customMessage, setCustomMessage] = useState('');
  const [customUrgency, setCustomUrgency] = useState<InboundCommunication['urgency']>('medium');

  const handleCopyReply = () => {
    navigator.clipboard.writeText(delegate.automated_reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadge = (action: ProxyAction) => {
    switch (action) {
      case 'ACCEPTED':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/40',
          text: 'text-emerald-300',
          label: 'ACCEPTED',
          desc: 'High value / emergency; slotted into active queue.',
        };
      case 'DECLINED':
        return {
          bg: 'bg-rose-500/20',
          border: 'border-rose-500/40',
          text: 'text-rose-300',
          label: 'DECLINED',
          desc: 'Low priority / solicitation; respectfully rejected.',
        };
      case 'RESCHEDULED':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/40',
          text: 'text-amber-300',
          label: 'RESCHEDULED',
          desc: 'Deferred to next optimal focus window to protect recovery.',
        };
      case 'DELEGATED':
      default:
        return {
          bg: 'bg-indigo-500/20',
          border: 'border-indigo-500/40',
          text: 'text-indigo-300',
          label: 'DELEGATED',
          desc: 'Re-routed to associate peer or support queue.',
        };
    }
  };

  const effectiveAction: ProxyAction = delegate.action_taken || delegate.ai_action_taken || delegate.ai_action || 'RESCHEDULED';
  const actionStyle = getActionBadge(effectiveAction);

  const handleLoadSample = (sample: typeof SAMPLE_INCOMING_MESSAGES[0]) => {
    onUpdateInboundComm({
      ...inboundComm,
      incoming_sender: sample.sender,
      sender_role: sample.role,
      incoming_message: sample.message,
      urgency: sample.urgency,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSender.trim() || !customMessage.trim()) return;

    onUpdateInboundComm({
      ...inboundComm,
      incoming_sender: customSender.trim(),
      sender_role: customRole,
      incoming_message: customMessage.trim(),
      urgency: customUrgency,
    });

    setIsCustomOpen(false);
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800/40">
              Feature 4
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              AI Call &amp; Message Proxy Delegate (Communication Screener)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Screens incoming calls &amp; messages against live fatigue and calendar status. Triages and drafts replies autonomously.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Shield Active
          </span>
          <button
            onClick={onScreenMessage}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>Screen Again</span>
          </button>
        </div>
      </div>

      {/* Inbound Message Sandbox Picker */}
      <div className="mb-5 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            Simulate Inbound Message Feed:
          </label>
          <button
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            {isCustomOpen ? 'Hide Custom Input' : '+ Type Custom Incoming Message'}
          </button>
        </div>

        {/* Quick sample buttons */}
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_INCOMING_MESSAGES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadSample(s)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                inboundComm.incoming_sender === s.sender
                  ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <span className="font-medium text-white">{s.sender.split(' (')[0]}</span>
              <span className="text-[10px] text-zinc-500 ml-1">({s.urgency})</span>
            </button>
          ))}
        </div>

        {/* Custom Input Form */}
        {isCustomOpen && (
          <form onSubmit={handleCustomSubmit} className="mt-3 pt-3 border-t border-zinc-800/80 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={customSender}
                  onChange={(e) => setCustomSender(e.target.value)}
                  placeholder="e.g. Sarah Jenkins (Client)"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Sender Role</label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Faculty Dean, Hiring Manager"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Urgency</label>
                <select
                  value={customUrgency}
                  onChange={(e) => setCustomUrgency(e.target.value as InboundCommunication['urgency'])}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="low">Low (General)</option>
                  <option value="medium">Medium (Today)</option>
                  <option value="high">High (Urgent Request)</option>
                  <option value="critical">Critical (Immediate Blocker)</option>
                </select>
              </div>
            </div>

            <div className="mb-2.5">
              <label className="block text-[10px] text-zinc-400 mb-1">Incoming Message Body</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type what they sent you..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded font-medium"
              >
                Set Message &amp; Screen
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Live Inbound Message vs Decision Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        
        {/* Left: Incoming Message Card (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono text-xs font-bold">
                  {delegate.incoming_sender.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {delegate.incoming_sender}
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {inboundComm.sender_role}
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                inboundComm.urgency === 'critical'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/40 animate-pulse'
                  : inboundComm.urgency === 'high'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {inboundComm.urgency} priority
              </span>
            </div>

            {/* Inbound speech bubble */}
            <div className="mt-3 p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-sans">
              "{delegate.message_received || delegate.incoming_message}"
            </div>
          </div>

          {/* Context considered by AI */}
          <div className="mt-3 pt-2.5 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
            <span>Fatigue State: <strong className="text-zinc-300">{fatigueIndex}</strong></span>
            <span>Mode: Auto-Proxy</span>
          </div>
        </div>

        {/* Right: AI Screener Decision & Automated Reply (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CornerDownRight className="w-4 h-4 text-purple-400" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Autonomous Proxy Decision
                </span>
              </div>

              {/* Action Taken Badge */}
              <div className={`px-3 py-1 rounded-lg font-mono font-black text-xs tracking-wider border shadow-md flex items-center gap-1.5 ${actionStyle.bg} ${actionStyle.border} ${actionStyle.text}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{effectiveAction}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 mb-2.5">
              {actionStyle.desc}
            </p>

            {/* Automated Reply Box */}
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-purple-500/20 text-xs text-purple-100/90 leading-relaxed font-sans relative">
              <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400/80 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Drafted on User's Behalf:
              </div>
              {delegate.automated_reply}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-3 pt-2 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-mono">
              Sent via LifeOS Communication Screener
            </span>

            <button
              onClick={handleCopyReply}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs">Copy Reply</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
