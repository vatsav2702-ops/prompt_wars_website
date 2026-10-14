/**
 * LifeOS TypeScript Interface Definitions
 * Strictly matches the required 4-feature output JSON schema
 */

export type FatigueLevel = "Low" | "Moderate" | "High" | "Critical";
export type Verdict = "DO" | "DON'T" | "RESCHEDULE";
export type ProxyAction = "ACCEPTED" | "DECLINED" | "RESCHEDULED" | "DELEGATED";
export type PhaseType = "CHECKIN_GENERATION" | "FULL_EVALUATION";

export interface WellnessSuggestionItem {
  category: "Nutrition" | "Energy Management" | "Schedule Optimization" | "Physical Well-being" | string;
  suggestion: string;
  priority: "Low" | "Medium" | "High";
}

export interface Feature1WellnessCheckin {
  current_time: string;
  check_in_triggered: boolean;
  trigger_reason: string;
  questions_asked: string[]; // 1. Meals, 2. Sleep, 3. Task completion, 4. Energy 1-10, 5. Physical strain
  user_wellness_status: string;
  personalized_suggestions: WellnessSuggestionItem[];
}

export interface Feature1LifeHubAnalytics {
  fatigue_index: FatigueLevel;
  burnout_risk_percentage: number;
  optimal_focus_window: string;
  weekly_health_summary: string;
}

export interface ScheduleAuditItem {
  time_slot: string;
  task_name: string;
  verdict: Verdict;
  reasoning: string;
}

export interface Feature3LocationAutomation {
  detected_location: string;
  action_triggered: string;
  drafted_output: string;
  // Aliases for compatibility
  automated_action?: string;
  recommended_action: string;
  generated_content?: string;
  auto_generated_content: string;
}

export interface Feature4CommunicationDelegate {
  incoming_sender: string;
  message_received: string;
  action_taken: ProxyAction;
  automated_reply: string;
  // Aliases for compatibility
  incoming_message: string;
  ai_action?: ProxyAction;
  ai_action_taken: ProxyAction;
}

/**
 * EXACT STRICT JSON OUTPUT SCHEMA demanded by the prompt:
 * {
 *   "schedule_evaluation": { ... },
 *   "reminders_and_checkins": [ ... ],
 *   "schedule_audit": [ ... ],
 *   "location_and_task_automation": { ... }
 * }
 */
export interface ScheduleEvaluation {
  active_schedule_count: number;
  current_time: string;
  current_status: "ON_TASK" | "TRANSITION" | "FREE_TIME";
  active_or_upcoming_task: string | null;
}

export interface ReminderAndCheckinItem {
  trigger_time: string;
  associated_task: string;
  reminder_type: "TASK_START" | "TASK_COMPLETION_CHECK" | "MEAL_CHECK" | "WELLNESS_CHECK";
  message: string;
}

export interface StrictLifeOSOutput {
  schedule_evaluation: ScheduleEvaluation;
  reminders_and_checkins: ReminderAndCheckinItem[];
  schedule_audit: ScheduleAuditItem[];
  location_and_task_automation: {
    detected_location: string;
    automated_action: string;
    generated_content: string;
  };
}

export interface LifeOSUnifiedSchema {
  phase_type: PhaseType;
  feature_1_wellness_checkin: Feature1WellnessCheckin;
  feature_2_schedule_audit: ScheduleAuditItem[];
  feature_3_location_automation: Feature3LocationAutomation;
  feature_4_communication_delegate: Feature4CommunicationDelegate;
}

// Full response supporting both unified schema, strict directive, and hub metrics
export interface LifeOSResponse extends LifeOSUnifiedSchema {
  feature_1_life_hub_analytics: Feature1LifeHubAnalytics;
  strict_directive_output?: StrictLifeOSOutput;
}

// User telemetry and input types
export interface DailyTelemetry {
  day: string;
  date: string;
  sleepHours: number;
  focusMinutes: number;
  taskCompletionRate: number;
  cognitiveFatigueScore: number;
}

export interface PlannedTask {
  id: string;
  time_slot: string;
  task_name: string;
  category: "deep_work" | "study" | "meeting" | "coding" | "fitness" | "admin" | "recovery";
  cognitive_load: "Low" | "Medium" | "High" | "Intense";
  scheduled_day?: string;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
  reminder_status?: 'armed' | 'fired' | 'snoozed' | 'completed';
}

export interface LocationTriggerContext {
  detected_location: string;
  location_type: "library" | "gym" | "home" | "lab" | "office" | "cafe";
  target_output_type: "academic_email" | "study_checklist" | "chapter_summary" | "recovery_protocol" | "project_update";
  notes?: string;
}

export interface InboundCommunication {
  incoming_sender: string;
  sender_role: string;
  incoming_message: string;
  urgency: "low" | "medium" | "high" | "critical";
  user_current_state: string;
}

export interface LifeOSEvaluationPayload {
  persona: "student" | "professional";
  persona_title: string;
  weekly_telemetry: DailyTelemetry[];
  today_sleep_hours: number;
  today_cognitive_fatigue: number;
  planned_tasks: PlannedTask[];
  location_context: LocationTriggerContext;
  inbound_comm: InboundCommunication;
  phase_type?: PhaseType;
  current_time?: string;
  checkin_answers?: CheckInAnswers;
}

export interface ParsedPromptContext {
  today_sleep_hours?: number;
  today_cognitive_fatigue?: number;
  detected_location?: string;
  location_type?: LocationTriggerContext['location_type'];
  target_output_type?: LocationTriggerContext['target_output_type'];
  planned_tasks?: PlannedTask[];
  inbound_comm?: InboundCommunication;
  prompt_summary?: string;
}

export interface PromptProcessResponse {
  success: boolean;
  source: string;
  parsed_context: ParsedPromptContext;
  data: LifeOSResponse;
}

export interface CheckInAnswers {
  sleep_response: string;
  nutrition_response?: string;
  meals_response?: string;
  hydration_breaks_response?: string;
  task_completion_response?: string;
  tasks_response?: string;
  energy_score?: number;
  fatigue_level_score?: number;
  strain_response?: string;
}

export interface WellnessCheckInSuggestion {
  category: string;
  suggestion_title: string;
  actionable_advice: string;
  priority_level: "Low" | "Medium" | "High";
}

export interface WellnessCheckInResponse {
  current_time_evaluated: string;
  check_in_triggered: boolean;
  trigger_reason: string;
  check_in_questions: string[];
  personalized_suggestions: WellnessCheckInSuggestion[];
  wellness_summary: string;
}

export type ActiveTab = 
  | 'home'
  | 'wellness'
  | 'schedule'
  | 'location'
  | 'comms'
  | 'prompt_engine'
  | 'json';

