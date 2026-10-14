import React, { useState } from 'react';
import {
  Feature4CommunicationDelegate,
  InboundCommunication,
  FatigueLevel,
  ProxyAction,
  KnownContact,
  PlannedTask,
} from '../types/lifeos.ts';
import {
  MessageSquare,
  ShieldCheck,
  Send,
  PhoneCall,
  Copy,
  Check,
  Sparkles,
  UserCheck,
  CornerDownRight,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Users,
  AlertTriangle,
  Mail,
  Phone,
  Edit3,
  Trash2,
  X,
  Search,
  Calendar,
  Clock,
} from 'lucide-react';
import { SAMPLE_INCOMING_MESSAGES } from '../data/presets.ts';

interface Feature4CommunicationDelegateProps {
  delegate: Feature4CommunicationDelegate;
  inboundComm: InboundCommunication;
  fatigueIndex: FatigueLevel;
  knownContacts: KnownContact[];
  plannedTasks: PlannedTask[];
  onUpdateInboundComm: (comm: InboundCommunication) => void;
  onScreenMessage: () => void;
  onAddContact: (contact: KnownContact) => void;
  onEditContact: (contact: KnownContact) => void;
  onDeleteContact: (id: string) => void;
  isEvaluating: boolean;
}

export const Feature4CommunicationDelegateComponent: React.FC<Feature4CommunicationDelegateProps> = ({
  delegate,
  inboundComm,
  fatigueIndex,
  knownContacts,
  plannedTasks,
  onUpdateInboundComm,
  onScreenMessage,
  onAddContact,
  onEditContact,
  onDeleteContact,
  isEvaluating,
}) => {
  const [copied, setCopied] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<KnownContact | null>(null);
  const [searchContactQuery, setSearchContactQuery] = useState('');

  // Custom sender simulation form state
  const [customSender, setCustomSender] = useState('');
  const [customRole, setCustomRole] = useState('Colleague / Collaborator');
  const [customMessage, setCustomMessage] = useState('');
  const [customUrgency, setCustomUrgency] = useState<InboundCommunication['urgency']>('medium');

  // New / Add Contact form state
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelationship, setContactRelationship] = useState<KnownContact['relationship']>('Academic');
  const [contactTrust, setContactTrust] = useState<KnownContact['trustLevel']>('Standard');
  const [contactRule, setContactRule] = useState<KnownContact['autoScreenRule']>('ALLOW_IF_FREE');
  const [contactNotes, setContactNotes] = useState('');

  // Cross-check incoming sender against Known Contacts directory
  const senderClean = inboundComm.incoming_sender.toLowerCase();
  const matchedContact = knownContacts.find((c) => {
    const nameClean = c.name.toLowerCase();
    return senderClean.includes(nameClean) || nameClean.includes(senderClean.split(' (')[0].trim());
  });
  const isKnownSender = !!matchedContact;

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
          desc: 'High value or emergency; slotted into active schedule queue.',
        };
      case 'DECLINED':
        return {
          bg: 'bg-rose-500/20',
          border: 'border-rose-500/40',
          text: 'text-rose-300',
          label: 'DECLINED',
          desc: 'Solicitation or unverified unknown sender; respectfully deflected.',
        };
      case 'RESCHEDULED':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/40',
          text: 'text-amber-300',
          label: 'RESCHEDULED',
          desc: 'Deferred to next optimal focus window to protect focus & recovery.',
        };
      case 'DELEGATED':
      default:
        return {
          bg: 'bg-indigo-500/20',
          border: 'border-indigo-500/40',
          text: 'text-indigo-300',
          label: 'DELEGATED',
          desc: 'Re-routed to associate peer or asynchronous queue.',
        };
    }
  };

  const effectiveAction: ProxyAction =
    delegate.action_taken || delegate.ai_action_taken || delegate.ai_action || 'RESCHEDULED';
  const actionStyle = getActionBadge(effectiveAction);

  const handleLoadSample = (sample: (typeof SAMPLE_INCOMING_MESSAGES)[0]) => {
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

  // Open "Add Contact" popup pre-filled with the unknown sender's information
  const handleOpenAddContactFromSender = () => {
    const rawName = inboundComm.incoming_sender.split(' (')[0].trim();
    setContactName(rawName);
    setContactRole(inboundComm.sender_role || 'New Contact');
    setContactEmail(`${rawName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@network.io`);
    setContactPhone('+1 (555) 000-0000');
    setContactRelationship('Professional');
    setContactTrust('Standard');
    setContactRule('ALLOW_IF_FREE');
    setContactNotes(`Created from inbound message: "${inboundComm.incoming_message.slice(0, 80)}"`);
    setEditingContact(null);
    setIsAddContactModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;

    if (editingContact) {
      onEditContact({
        ...editingContact,
        name: contactName.trim(),
        role: contactRole.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        relationship: contactRelationship,
        trustLevel: contactTrust,
        autoScreenRule: contactRule,
        notes: contactNotes,
      });
    } else {
      const newContact: KnownContact = {
        id: `contact-${Date.now()}`,
        name: contactName.trim(),
        role: contactRole.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        relationship: contactRelationship,
        trustLevel: contactTrust,
        autoScreenRule: contactRule,
        notes: contactNotes,
      };
      onAddContact(newContact);
    }

    setIsAddContactModalOpen(false);
    setEditingContact(null);
    // Trigger immediate re-screen with newly registered contact
    setTimeout(() => {
      onScreenMessage();
    }, 150);
  };

  const handleStartEditContact = (contact: KnownContact) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactRole(contact.role);
    setContactEmail(contact.email);
    setContactPhone(contact.phone);
    setContactRelationship(contact.relationship);
    setContactTrust(contact.trustLevel);
    setContactRule(contact.autoScreenRule);
    setContactNotes(contact.notes || '');
    setIsAddContactModalOpen(true);
  };

  // Filter contacts in Directory Modal
  const filteredContacts = knownContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchContactQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchContactQuery.toLowerCase()) ||
      c.relationship.toLowerCase().includes(searchContactQuery.toLowerCase())
  );

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
              AI Communication Proxy &amp; Known Contact Validator
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Cross-checks incoming senders against Known Contacts. Detects unknown people, screens calendar availability &amp; fatigue, and drafts polite replies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Known Contacts Directory Manager Button */}
          <button
            onClick={() => setIsDirectoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Known Contacts ({knownContacts.length})</span>
          </button>

          <button
            onClick={onScreenMessage}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>Screen Message</span>
          </button>
        </div>
      </div>

      {/* Unknown Person Detected Alert Popup / Card (Mandatory Requirement) */}
      {!isKnownSender && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-zinc-950 border border-amber-500/40 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-300">
                    Unknown Person Detected
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300">
                    Unverified Sender
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1">
                  <strong>&ldquo;{inboundComm.incoming_sender}&rdquo;</strong> is not in your Known Contacts list.
                  Create and add their contact details to establish trusted communication rules.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAddContactFromSender}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add to Known Contacts</span>
            </button>
          </div>
        </div>
      )}

      {/* Inbound Message Sandbox Picker */}
      <div className="mb-5 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            Simulate Inbound Sender &amp; Message Feed:
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
          {SAMPLE_INCOMING_MESSAGES.map((s, idx) => {
            const isSelected = inboundComm.incoming_sender === s.sender;
            return (
              <button
                key={idx}
                onClick={() => handleLoadSample(s)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {s.isKnown ? (
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                )}
                <span className="font-medium text-white">{s.sender.split(' (')[0]}</span>
                <span className="text-[10px] text-zinc-500">
                  {s.isKnown ? '(Known)' : '(Unknown)'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Input Form */}
        {isCustomOpen && (
          <form
            onSubmit={handleCustomSubmit}
            className="mt-3 pt-3 border-t border-zinc-800/80 animate-in fade-in duration-150"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={customSender}
                  onChange={(e) => setCustomSender(e.target.value)}
                  placeholder="e.g. Liam Vance (Headhunter)"
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
                  placeholder="e.g. Faculty Dean, Unknown Student"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Urgency</label>
                <select
                  value={customUrgency}
                  onChange={(e) => setCustomUrgency(e.target.value as InboundCommunication['urgency'])}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
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
                className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded font-medium cursor-pointer"
              >
                Set Message &amp; Screen
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Live Inbound Message vs Decision Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Left: Incoming Message & Sender Profile Card (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                    isKnownSender
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {inboundComm.incoming_sender.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {inboundComm.incoming_sender}
                    </h4>
                    {isKnownSender ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        Unknown
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {matchedContact?.role || inboundComm.sender_role}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                  inboundComm.urgency === 'critical'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800/40 animate-pulse'
                    : inboundComm.urgency === 'high'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {inboundComm.urgency} priority
              </span>
            </div>

            {/* If matched, show contact details card */}
            {matchedContact && (
              <div className="mb-3 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-mono">Relationship:</span>
                  <span className="font-semibold text-purple-300 font-mono">{matchedContact.relationship}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-mono">Trust Level:</span>
                  <span className="font-semibold text-emerald-300 font-mono">{matchedContact.trustLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-mono">Screen Rule:</span>
                  <span className="text-[10px] font-mono text-zinc-400">{matchedContact.autoScreenRule}</span>
                </div>
              </div>
            )}

            {/* Inbound speech bubble */}
            <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-sans">
              &ldquo;{delegate.message_received || delegate.incoming_message}&rdquo;
            </div>
          </div>

          {/* Context considered by AI */}
          <div className="mt-3 pt-2.5 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
            <span>
              Fatigue: <strong className="text-zinc-300">{fatigueIndex}</strong>
            </span>
            <span>
              Schedule: <strong className="text-zinc-300">{plannedTasks.length} slots</strong>
            </span>
            <span>
              Contact: <strong className={isKnownSender ? 'text-emerald-400' : 'text-amber-400'}>{isKnownSender ? 'Known' : 'Unregistered'}</strong>
            </span>
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
              <div
                className={`px-3 py-1 rounded-lg font-mono font-black text-xs tracking-wider border shadow-md flex items-center gap-1.5 ${actionStyle.bg} ${actionStyle.border} ${actionStyle.text}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{effectiveAction}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 mb-2.5">{actionStyle.desc}</p>

            {/* Automated Reply Box */}
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-purple-500/20 text-xs text-purple-100/90 leading-relaxed font-sans relative">
              <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400/80 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Automated Reply Drafted on User's Behalf:
              </div>
              {delegate.automated_reply}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-3 pt-2 flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-mono">
              LifeOS Communication Screener &bull; Auto-Dispatched
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

      {/* Directory Manager Modal / Form */}
      {isDirectoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden text-zinc-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Known Contacts Directory
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {knownContacts.length} Contacts
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingContact(null);
                    setContactName('');
                    setContactRole('');
                    setContactEmail('');
                    setContactPhone('');
                    setContactRelationship('Professional');
                    setContactTrust('Standard');
                    setContactRule('ALLOW_IF_FREE');
                    setContactNotes('');
                    setIsAddContactModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Contact</span>
                </button>
                <button
                  onClick={() => setIsDirectoryOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchContactQuery}
                onChange={(e) => setSearchContactQuery(e.target.value)}
                placeholder="Search contacts by name, role, or relationship..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Contacts List */}
            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {filteredContacts.length === 0 ? (
                <div className="text-center p-8 text-zinc-500 text-xs">
                  No contacts found matching search query.
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{contact.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {contact.relationship}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            {contact.trustLevel} Trust
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{contact.role}</p>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono mt-1">
                          {contact.email && <span>{contact.email}</span>}
                          {contact.phone && <span>{contact.phone}</span>}
                          <span>Rule: {contact.autoScreenRule}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEditContact(contact)}
                        className="p-1.5 text-zinc-400 hover:text-purple-300 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                        title="Edit Contact"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteContact(contact.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Contact Form Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveContact}
            className="bg-zinc-950 border border-purple-500/50 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden text-zinc-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  {editingContact ? 'Edit Known Contact' : 'Add New Known Contact'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Aris Vance"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="e.g. Thesis Advisor, Hiring Lead"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. name@domain.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Relationship</label>
                  <select
                    value={contactRelationship}
                    onChange={(e) =>
                      setContactRelationship(e.target.value as KnownContact['relationship'])
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Professional">Professional</option>
                    <option value="Personal">Personal</option>
                    <option value="VIP">VIP</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Trust Level</label>
                  <select
                    value={contactTrust}
                    onChange={(e) => setContactTrust(e.target.value as KnownContact['trustLevel'])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="VIP">VIP (High Priority)</option>
                    <option value="High">High</option>
                    <option value="Standard">Standard</option>
                    <option value="Restricted">Restricted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Screen Policy</label>
                  <select
                    value={contactRule}
                    onChange={(e) =>
                      setContactRule(e.target.value as KnownContact['autoScreenRule'])
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="ALLOW_IF_FREE">Allow If Free</option>
                    <option value="ALWAYS_URGENT">Always Urgent</option>
                    <option value="DEFER_WHEN_TIRED">Defer When Tired</option>
                    <option value="AUTO_DECLINE">Auto-Decline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Notes / Instructions</label>
                <textarea
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  placeholder="Additional context about this contact..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-sm cursor-pointer"
              >
                {editingContact ? 'Update Contact' : 'Save & Validate Contact'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
