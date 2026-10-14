import { DailyTelemetry, PlannedTask, LocationTriggerContext, InboundCommunication, LifeOSEvaluationPayload } from '../types/lifeos.ts';

export interface PersonaPreset {
  id: string;
  name: string;
  role: string;
  avatar: string;
  tagline: string;
  payload: LifeOSEvaluationPayload;
}

export const PRESETS: PersonaPreset[] = [
  {
    id: 'cs-student-crunch',
    name: 'Alex Chen',
    role: 'Computer Science Undergrad (Junior)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tagline: 'Operating under Operating Systems Midterms & Hackathon Deadlines',
    payload: {
      persona: 'student',
      persona_title: 'Computer Science Major (Midterm Crunch)',
      today_sleep_hours: 4.8,
      today_cognitive_fatigue: 8.2,
      weekly_telemetry: [
        { day: 'Wed', date: 'Oct 07', sleepHours: 6.5, focusMinutes: 280, taskCompletionRate: 88, cognitiveFatigueScore: 4.5 },
        { day: 'Thu', date: 'Oct 08', sleepHours: 5.8, focusMinutes: 320, taskCompletionRate: 80, cognitiveFatigueScore: 6.0 },
        { day: 'Fri', date: 'Oct 09', sleepHours: 5.2, focusMinutes: 350, taskCompletionRate: 75, cognitiveFatigueScore: 7.2 },
        { day: 'Sat', date: 'Oct 10', sleepHours: 6.0, focusMinutes: 410, taskCompletionRate: 70, cognitiveFatigueScore: 7.8 },
        { day: 'Sun', date: 'Oct 11', sleepHours: 4.5, focusMinutes: 460, taskCompletionRate: 65, cognitiveFatigueScore: 8.9 },
        { day: 'Mon', date: 'Oct 12', sleepHours: 5.0, focusMinutes: 390, taskCompletionRate: 68, cognitiveFatigueScore: 8.4 },
        { day: 'Tue', date: 'Oct 13', sleepHours: 4.8, focusMinutes: 310, taskCompletionRate: 62, cognitiveFatigueScore: 8.2 },
      ],
      planned_tasks: [
        {
          id: 'task-1',
          time_slot: '08:30 AM - 10:30 AM',
          task_name: 'Distributed Systems Lecture & Active Recall Notes',
          category: 'study',
          cognitive_load: 'Medium',
        },
        {
          id: 'task-2',
          time_slot: '11:00 AM - 01:00 PM',
          task_name: 'Kernel Memory Allocator Lab Implementation (C/Assembly)',
          category: 'coding',
          cognitive_load: 'High',
        },
        {
          id: 'task-3',
          time_slot: '02:30 PM - 04:30 PM',
          task_name: 'Algorithms Problem Set: Dynamic Programming & Graphs',
          category: 'study',
          cognitive_load: 'Intense',
        },
        {
          id: 'task-4',
          time_slot: '05:30 PM - 06:15 PM',
          task_name: 'Campus Rec Gym: Light Cardio & Mobility Deload',
          category: 'fitness',
          cognitive_load: 'Low',
        },
        {
          id: 'task-5',
          time_slot: '07:30 PM - 10:30 PM',
          task_name: 'Hackathon Project Deep Refactoring & Unit Tests',
          category: 'coding',
          cognitive_load: 'High',
        },
      ],
      location_context: {
        detected_location: 'Campus Science Library - Level 4 Silent Zone',
        location_type: 'library',
        target_output_type: 'study_checklist',
        notes: 'Targeting 90-min uninterrupted deep revision block before lab checkpoint.',
      },
      inbound_comm: {
        incoming_sender: 'Devon Patel (Lab Partner)',
        sender_role: 'Study Group Peer',
        incoming_message: 'Hey Alex! Can you jump on a Discord call right now to debug the virtual memory segment faults together?',
        urgency: 'high',
        user_current_state: 'Active in Library Silent Zone; High Cognitive Fatigue (8.2/10); Planned Lab Slot.',
      },
    },
  },
  {
    id: 'tech-lead-sprint',
    name: 'Elena Rostova',
    role: 'Principal Staff Engineer & Tech Lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    tagline: 'Leading Cloud Architecture Migration & Balancing Stakeholder Inquiries',
    payload: {
      persona: 'professional',
      persona_title: 'Staff Software Architect',
      today_sleep_hours: 6.8,
      today_cognitive_fatigue: 5.5,
      weekly_telemetry: [
        { day: 'Wed', date: 'Oct 07', sleepHours: 7.2, focusMinutes: 310, taskCompletionRate: 92, cognitiveFatigueScore: 4.0 },
        { day: 'Thu', date: 'Oct 08', sleepHours: 7.0, focusMinutes: 340, taskCompletionRate: 90, cognitiveFatigueScore: 4.8 },
        { day: 'Fri', date: 'Oct 09', sleepHours: 6.5, focusMinutes: 290, taskCompletionRate: 85, cognitiveFatigueScore: 5.5 },
        { day: 'Sat', date: 'Oct 10', sleepHours: 8.1, focusMinutes: 120, taskCompletionRate: 95, cognitiveFatigueScore: 2.8 },
        { day: 'Sun', date: 'Oct 11', sleepHours: 7.8, focusMinutes: 90, taskCompletionRate: 100, cognitiveFatigueScore: 3.1 },
        { day: 'Mon', date: 'Oct 12', sleepHours: 6.4, focusMinutes: 380, taskCompletionRate: 84, cognitiveFatigueScore: 5.8 },
        { day: 'Tue', date: 'Oct 13', sleepHours: 6.8, focusMinutes: 350, taskCompletionRate: 88, cognitiveFatigueScore: 5.5 },
      ],
      planned_tasks: [
        {
          id: 'task-1',
          time_slot: '09:00 AM - 11:30 AM',
          task_name: 'Distributed Database Partitioning RFC & Benchmarks',
          category: 'deep_work',
          cognitive_load: 'Intense',
        },
        {
          id: 'task-2',
          time_slot: '11:45 AM - 12:30 PM',
          task_name: 'Cross-Functional Sync: Infrastructure Roadmapping',
          category: 'meeting',
          cognitive_load: 'Medium',
        },
        {
          id: 'task-3',
          time_slot: '02:00 PM - 03:30 PM',
          task_name: 'Critical PR Architecture Reviews for Senior Engineers',
          category: 'deep_work',
          cognitive_load: 'High',
        },
        {
          id: 'task-4',
          time_slot: '04:00 PM - 05:00 PM',
          task_name: 'Inbox Zero & Asynchronous Slack Backlog Clearance',
          category: 'admin',
          cognitive_load: 'Low',
        },
        {
          id: 'task-5',
          time_slot: '06:00 PM - 07:00 PM',
          task_name: 'Late Technical Advisory Panel with Executive Committee',
          category: 'meeting',
          cognitive_load: 'High',
        },
      ],
      location_context: {
        detected_location: 'Headquarters - Innovation Pod 3B',
        location_type: 'office',
        target_output_type: 'project_update',
        notes: 'Pre-migration staging environment verification in progress.',
      },
      inbound_comm: {
        incoming_sender: 'Marcus Vance (VP of Product)',
        sender_role: 'Executive Stakeholder',
        incoming_message: 'Elena, can we squeeze in a 45-minute ad-hoc call at 02:00 PM to re-negotiate the Q4 database cutover timeline with sales?',
        urgency: 'high',
        user_current_state: 'Locked in RFC Deep Work; Moderate Fatigue (5.5/10); Afternoon Architecture Review scheduled.',
      },
    },
  },
  {
    id: 'pre-med-exhaustion',
    name: 'Dr. Priya Sharma',
    role: 'Medical Resident / Clinical Fellow',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    tagline: 'Surviving Intensive ICU Rotation & Board Exam Synthesis',
    payload: {
      persona: 'student',
      persona_title: 'Medical Resident (Intensive Care Rotation)',
      today_sleep_hours: 3.5,
      today_cognitive_fatigue: 9.3,
      weekly_telemetry: [
        { day: 'Wed', date: 'Oct 07', sleepHours: 4.5, focusMinutes: 480, taskCompletionRate: 70, cognitiveFatigueScore: 8.0 },
        { day: 'Thu', date: 'Oct 08', sleepHours: 4.0, focusMinutes: 510, taskCompletionRate: 68, cognitiveFatigueScore: 8.8 },
        { day: 'Fri', date: 'Oct 09', sleepHours: 3.8, focusMinutes: 540, taskCompletionRate: 64, cognitiveFatigueScore: 9.1 },
        { day: 'Sat', date: 'Oct 10', sleepHours: 5.5, focusMinutes: 420, taskCompletionRate: 72, cognitiveFatigueScore: 8.2 },
        { day: 'Sun', date: 'Oct 11', sleepHours: 4.0, focusMinutes: 490, taskCompletionRate: 66, cognitiveFatigueScore: 8.9 },
        { day: 'Mon', date: 'Oct 12', sleepHours: 3.9, focusMinutes: 520, taskCompletionRate: 60, cognitiveFatigueScore: 9.4 },
        { day: 'Tue', date: 'Oct 13', sleepHours: 3.5, focusMinutes: 460, taskCompletionRate: 58, cognitiveFatigueScore: 9.3 },
      ],
      planned_tasks: [
        {
          id: 'task-1',
          time_slot: '07:00 AM - 10:30 AM',
          task_name: 'Morning Clinical Patient Rounds & Charting',
          category: 'deep_work',
          cognitive_load: 'High',
        },
        {
          id: 'task-2',
          time_slot: '11:00 AM - 01:00 PM',
          task_name: 'Mortality & Morbidity Conference Presentation Preparation',
          category: 'study',
          cognitive_load: 'Intense',
        },
        {
          id: 'task-3',
          time_slot: '02:00 PM - 04:30 PM',
          task_name: 'USMLE Step 3 Complex Clinical Vignette Questions (50 Qs)',
          category: 'study',
          cognitive_load: 'Intense',
        },
        {
          id: 'task-4',
          time_slot: '05:00 PM - 06:30 PM',
          task_name: 'Electrophysiology Cardiology Seminar (Mandatory)',
          category: 'meeting',
          cognitive_load: 'Medium',
        },
      ],
      location_context: {
        detected_location: 'Hospital Medical Library - Resident Lounge',
        location_type: 'library',
        target_output_type: 'academic_email',
        notes: 'Post-overnight shift handover required for attending physician.',
      },
      inbound_comm: {
        incoming_sender: 'Dr. Kathryn Walsh (Chief Medical Officer)',
        sender_role: 'Attending Physician',
        incoming_message: 'Priya, can you take on the additional nocturnal telemetry shift tonight for ICU bed transfers?',
        urgency: 'critical',
        user_current_state: 'Severe Sleep Debt (3.5h sleep); Critical Cognitive Fatigue (9.3/10); USMLE prep slot.',
      },
    },
  },
  {
    id: 'balanced-optimal',
    name: 'Kai Nakamura',
    role: 'Product Lead & Marathon Athlete',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tagline: 'Sustained High Performance with Circadian Optimization',
    payload: {
      persona: 'professional',
      persona_title: 'Product Lead & High Performer',
      today_sleep_hours: 8.2,
      today_cognitive_fatigue: 2.4,
      weekly_telemetry: [
        { day: 'Wed', date: 'Oct 07', sleepHours: 8.0, focusMinutes: 300, taskCompletionRate: 95, cognitiveFatigueScore: 2.2 },
        { day: 'Thu', date: 'Oct 08', sleepHours: 8.1, focusMinutes: 320, taskCompletionRate: 96, cognitiveFatigueScore: 2.5 },
        { day: 'Fri', date: 'Oct 09', sleepHours: 7.9, focusMinutes: 280, taskCompletionRate: 98, cognitiveFatigueScore: 2.6 },
        { day: 'Sat', date: 'Oct 10', sleepHours: 8.5, focusMinutes: 180, taskCompletionRate: 100, cognitiveFatigueScore: 1.8 },
        { day: 'Sun', date: 'Oct 11', sleepHours: 8.4, focusMinutes: 140, taskCompletionRate: 100, cognitiveFatigueScore: 1.5 },
        { day: 'Mon', date: 'Oct 12', sleepHours: 8.0, focusMinutes: 340, taskCompletionRate: 94, cognitiveFatigueScore: 2.3 },
        { day: 'Tue', date: 'Oct 13', sleepHours: 8.2, focusMinutes: 330, taskCompletionRate: 96, cognitiveFatigueScore: 2.4 },
      ],
      planned_tasks: [
        {
          id: 'task-1',
          time_slot: '08:00 AM - 10:30 AM',
          task_name: 'Annual Product Strategy Vision & OKR Architecture',
          category: 'deep_work',
          cognitive_load: 'High',
        },
        {
          id: 'task-2',
          time_slot: '11:00 AM - 12:00 PM',
          task_name: 'Keynote Demo Rehearsal with Engineering Directors',
          category: 'meeting',
          cognitive_load: 'Medium',
        },
        {
          id: 'task-3',
          time_slot: '01:30 PM - 02:45 PM',
          task_name: 'Competitive Market Disruption Analysis',
          category: 'deep_work',
          cognitive_load: 'Medium',
        },
        {
          id: 'task-4',
          time_slot: '03:15 PM - 04:30 PM',
          task_name: 'Athletic Recovery & Zone 2 Cardio Ergometer',
          category: 'fitness',
          cognitive_load: 'Low',
        },
      ],
      location_context: {
        detected_location: 'Equinox Athletic Club & Executive Workspace',
        location_type: 'gym',
        target_output_type: 'recovery_protocol',
        notes: 'Midday transition from strategic vision to somatic optimization.',
      },
      inbound_comm: {
        incoming_sender: 'Samantha Reed (Venture Partner)',
        sender_role: 'Board Member & Investor',
        incoming_message: 'Kai, thrilled with the Q3 ARR numbers. Do you have 15 minutes this afternoon to meet our incoming growth advisor?',
        urgency: 'medium',
        user_current_state: 'Peak Neuro-reserve; Low Fatigue (2.4/10); Scheduled Afternoon Strategy Slot.',
      },
    },
  },
];

export const AVAILABLE_LOCATIONS: Array<{ name: string; type: LocationTriggerContext['location_type']; icon: string; defaultAction: string }> = [
  { name: 'Campus Science Library - Level 4 Silent Zone', type: 'library', icon: 'BookOpen', defaultAction: 'Deep revision checklist & silent study protocol' },
  { name: 'Engineering Hardware Lab - Cleanroom 2', type: 'lab', icon: 'Cpu', defaultAction: 'Academic update email & safety verification' },
  { name: 'Equinox Athletic Club & Recovery Studio', type: 'gym', icon: 'Activity', defaultAction: 'Cortisol deload protocol & screen quarantine' },
  { name: 'Home Office - Acoustic Pod', type: 'home', icon: 'Home', defaultAction: 'Asynchronous standup & evening shutdown routine' },
  { name: 'Artisan Cafe & Co-working Lounge', type: 'cafe', icon: 'Coffee', defaultAction: 'Low-cognitive triage & coffee shop focus sprint' },
];

export const SAMPLE_INCOMING_MESSAGES = [
  {
    sender: 'Devon Patel (Lab Partner)',
    role: 'Peer Student',
    message: 'Hey Alex! Can you jump on a Discord call right now to debug the virtual memory segment faults together?',
    urgency: 'high' as const,
  },
  {
    sender: 'Marcus Vance (VP of Product)',
    role: 'Executive Stakeholder',
    message: 'Can we squeeze in a 45-minute ad-hoc sync right now to re-negotiate our Q4 cutover timeline?',
    urgency: 'high' as const,
  },
  {
    sender: 'Prof. Henderson (Faculty Advisor)',
    role: 'University Professor',
    message: 'Alex, please send your thesis chapter 3 draft before 5:00 PM today for committee pre-review.',
    urgency: 'medium' as const,
  },
  {
    sender: 'Dr. Kathryn Walsh (Chief Medical Officer)',
    role: 'Attending Physician',
    message: 'Can you take on an emergency nocturnal ICU transfer shift tonight?',
    urgency: 'critical' as const,
  },
  {
    sender: 'Apex Recruiting Group',
    role: 'External Headhunter',
    message: 'We have an urgent opening for a Staff Systems Engineer at a Series B startup. 15-min chat today?',
    urgency: 'low' as const,
  },
];

export function createInitialEvaluation(preset: PersonaPreset = PRESETS[0]): import('../types/lifeos.ts').LifeOSResponse {
  const payload = preset.payload;
  const isHighFatigue = payload.today_cognitive_fatigue >= 7 || payload.today_sleep_hours < 5.5;
  const fatigueIndex: import('../types/lifeos.ts').FatigueLevel =
    payload.today_cognitive_fatigue >= 8 ? 'Critical' :
    payload.today_cognitive_fatigue >= 6.5 ? 'High' :
    payload.today_cognitive_fatigue >= 4 ? 'Moderate' : 'Low';

  const scheduleAudit: import('../types/lifeos.ts').ScheduleAuditItem[] = payload.planned_tasks.map((task) => {
    const isLate = task.time_slot.includes('PM') && (task.time_slot.includes('07:') || task.time_slot.includes('08:') || task.time_slot.includes('09:') || task.time_slot.includes('02:'));
    const isIntense = task.cognitive_load === 'Intense' || task.cognitive_load === 'High';
    if (isHighFatigue && isIntense && isLate) {
      return {
        time_slot: task.time_slot,
        task_name: task.task_name,
        verdict: "DON'T" as const,
        reasoning: `High cognitive fatigue (${payload.today_cognitive_fatigue}/10) coupled with only ${payload.today_sleep_hours}h sleep makes high-load work risky. Reschedule to morning peak window.`,
      };
    }
    return {
      time_slot: task.time_slot,
      task_name: task.task_name,
      verdict: "DO" as const,
      reasoning: `Fits current focus parameters. Protected focus window 08:30 AM - 11:45 AM.`,
    };
  });

  return {
    phase_type: 'FULL_EVALUATION',
    feature_1_wellness_checkin: {
      current_time: '02:00 PM',
      check_in_triggered: true,
      trigger_reason: 'Circadian post-meal transition & mid-day wellness audit',
      questions_asked: [
        '1. Have you eaten / had your meals today? (Post-meal window check)',
        `2. How many hours did you sleep last night? (${payload.today_sleep_hours}h logged)`,
        '3. Have you completed your specific scheduled morning tasks?',
        `4. What is your current energy/focus level on a scale of 1-10? (${payload.today_cognitive_fatigue}/10)`,
        '5. Are you experiencing any physical fatigue, cervical strain, or eye fatigue?'
      ],
      user_wellness_status: `Active operational status: ${fatigueIndex} fatigue index with ${payload.today_sleep_hours}h sleep. Active co-pilot monitoring enabled.`,
      personalized_suggestions: [
        {
          category: 'Nutrition',
          suggestion: 'Hydrate with 500ml water and electrolytes; avoid high-glycemic snacks to avert mid-afternoon crash.',
          priority: 'High',
        },
        {
          category: 'Energy Management',
          suggestion: 'Engage in a 10-minute non-sleep deep rest (NSDR) or outdoor natural light exposure to reset circadian rhythm.',
          priority: 'High',
        },
        {
          category: 'Schedule Optimization',
          suggestion: 'Prioritize deep cognitive lab work during morning 08:30 AM - 11:45 AM window; protect recovery in evening.',
          priority: 'Medium',
        },
        {
          category: 'Physical Well-being',
          suggestion: 'Practice 20-20-20 rule for screen fatigue and cervical spine decompression stretches.',
          priority: 'Low',
        }
      ],
    },
    feature_1_life_hub_analytics: {
      fatigue_index: fatigueIndex,
      burnout_risk_percentage: isHighFatigue ? 74 : 32,
      optimal_focus_window: '08:30 AM - 11:45 AM',
      weekly_health_summary: `${preset.name} is operating with ${payload.today_sleep_hours}h sleep. Circadian optimization active.`,
    },
    feature_2_schedule_audit: scheduleAudit,
    feature_3_location_automation: {
      detected_location: payload.location_context.detected_location,
      action_triggered: 'Silent study protocol & reference checklist',
      drafted_output: `Location Protocol for ${payload.location_context.detected_location}:\n1. Geofenced focus active\n2. Notifications silenced\n3. Lab/Study material checklist loaded.`,
      automated_action: 'Silent study protocol & reference checklist',
      generated_content: `Location Protocol for ${payload.location_context.detected_location}:\n1. Geofenced focus active\n2. Notifications silenced\n3. Lab/Study material checklist loaded.`,
      recommended_action: 'Silent study protocol & reference checklist',
      auto_generated_content: `Location Protocol for ${payload.location_context.detected_location}:\n1. Geofenced focus active\n2. Notifications silenced\n3. Lab/Study material checklist loaded.`,
    },
    feature_4_communication_delegate: {
      incoming_sender: payload.inbound_comm.incoming_sender,
      message_received: payload.inbound_comm.incoming_message,
      action_taken: 'RESCHEDULED',
      automated_reply: `Thanks for reaching out! ${preset.name} is currently in a deep work block. We can connect tomorrow morning during peak focus hours (09:00 AM).`,
      incoming_message: payload.inbound_comm.incoming_message,
      ai_action: 'RESCHEDULED',
      ai_action_taken: 'RESCHEDULED',
    },
    strict_directive_output: {
      schedule_evaluation: {
        active_schedule_count: payload.planned_tasks.length,
        current_time: "02:00 PM",
        current_status: "ON_TASK",
        active_or_upcoming_task: payload.planned_tasks[1]?.task_name || payload.planned_tasks[0]?.task_name || "Deep Work Block",
      },
      reminders_and_checkins: [
        {
          trigger_time: "02:00 PM",
          associated_task: payload.planned_tasks[0]?.task_name || "Morning Revision",
          reminder_type: "TASK_COMPLETION_CHECK",
          message: `Have you finished ${payload.planned_tasks[0]?.task_name}? Morning slot (${payload.planned_tasks[0]?.time_slot}) has concluded.`,
        },
        {
          trigger_time: "02:00 PM",
          associated_task: payload.planned_tasks[1]?.task_name || "Core Sprint",
          reminder_type: "TASK_START",
          message: `Current time (02:00 PM) matches active slot. Focus on "${payload.planned_tasks[1]?.task_name}".`,
        },
        {
          trigger_time: "02:00 PM",
          associated_task: "Circadian Nutrition",
          reminder_type: "MEAL_CHECK",
          message: "Circadian nutrition check: Verify you have eaten your meal and hydrated prior to your next focused cognitive sprint.",
        },
        {
          trigger_time: "02:00 PM",
          associated_task: "Somatic Health",
          reminder_type: "WELLNESS_CHECK",
          message: `Wellness check: Sleep logged at ${payload.today_sleep_hours}h with fatigue at ${fatigueIndex}. Monitor ocular strain and take 60s postural reset.`,
        },
      ],
      schedule_audit: scheduleAudit,
      location_and_task_automation: {
        detected_location: payload.location_context.detected_location,
        automated_action: "Silent study protocol & reference checklist",
        generated_content: `Location Protocol for ${payload.location_context.detected_location}:\n1. Geofenced focus active\n2. Notifications silenced\n3. Lab/Study material checklist loaded.`,
      },
    },
  };
}
