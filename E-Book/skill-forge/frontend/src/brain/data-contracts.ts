/** AddUserSkillRequest */
export interface AddUserSkillRequest {
  /** Skill Name */
  skill_name: string;
  /** Skill Level */
  skill_level: string;
}

/** AskAIRequest */
export interface AskAIRequest {
  /** Messages */
  messages: Record<string, string>[];
}

/** AskAIResponse */
export interface AskAIResponse {
  /** Content */
  content: string;
}

/** AssessmentQuestion */
export interface AssessmentQuestion {
  /** Id */
  id: number;
  /** Question Text */
  question_text: string;
  /** Options */
  options: string[];
}

/** AssessmentState */
export interface AssessmentState {
  /** Id */
  id: number;
  /** Status */
  status: string;
  /** Skill Name */
  skill_name: string;
  /** Score */
  score?: number | null;
  next_question?: AssessmentQuestion | null;
}

/** Badge */
export interface Badge {
  /** Id */
  id: number;
  /** Skill Name */
  skill_name: string;
  /** Skill Level */
  skill_level: string;
  /**
   * Issued At
   * @format date-time
   */
  issued_at: string;
}

/** CreateJobRequest */
export interface CreateJobRequest {
  /** Org Id */
  org_id: number;
  /** Title */
  title: string;
  /** Description */
  description?: string | null;
  /**
   * Skill Graph Json
   * @example {"javascript":"Advanced","python":"Working"}
   */
  skill_graph_json: Record<string, any>;
  /**
   * Location Type
   * @default "Remote"
   */
  location_type?: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** IssueBadgeRequest */
export interface IssueBadgeRequest {
  /** Assessment Id */
  assessment_id: number;
}

/** Job */
export interface Job {
  /** Id */
  id: number;
  /** Org Id */
  org_id: number;
  /** Org Name */
  org_name: string;
  /** Title */
  title: string;
  /** Description */
  description: string | null;
  /** Skill Graph Json */
  skill_graph_json: Record<string, any> | null;
  /** Location Type */
  location_type: string | null;
  /** Status */
  status: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** Skill */
export interface Skill {
  /** Name */
  name: string;
}

/** StartAssessmentRequest */
export interface StartAssessmentRequest {
  /** Skill Name */
  skill_name: string;
}

/** SubmitAnswerRequest */
export interface SubmitAnswerRequest {
  /** Question Id */
  question_id: number;
  /** Answer Index */
  answer_index: number;
}

/**
 * TelemetryEvent
 * Represents a single telemetry event sent from the frontend.
 */
export interface TelemetryEvent {
  /** Event Type */
  event_type: string;
  /** Timestamp */
  timestamp: string;
  /** Payload */
  payload: Record<string, any>;
}

/**
 * TelemetryIngestRequest
 * The request body for the telemetry ingestion endpoint.
 * It contains a batch of events.
 */
export interface TelemetryIngestRequest {
  /** Events */
  events: TelemetryEvent[];
}

/** UserSkill */
export interface UserSkill {
  /** Id */
  id: number;
  /** Skill Name */
  skill_name: string;
  /** Skill Level */
  skill_level: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

/** Response Get Available Skills */
export type GetAvailableSkillsData = Skill[];

/** Response Get User Skills */
export type GetUserSkillsData = UserSkill[];

export type AddUserSkillData = UserSkill;

export type AddUserSkillError = HTTPValidationError;

export type StartAssessmentData = AssessmentState;

export type StartAssessmentError = HTTPValidationError;

export interface GetAssessmentStateParams {
  /** Assessment Id */
  assessmentId: number;
}

export type GetAssessmentStateData = AssessmentState;

export type GetAssessmentStateError = HTTPValidationError;

export interface SubmitAnswerParams {
  /** Assessment Id */
  assessmentId: number;
}

export type SubmitAnswerData = AssessmentState;

export type SubmitAnswerError = HTTPValidationError;

export type AskAiData = AskAIResponse;

export type AskAiError = HTTPValidationError;

export type IssueBadgeData = Badge;

export type IssueBadgeError = HTTPValidationError;

/** Response Get User Badges */
export type GetUserBadgesData = Badge[];

/** Response List Jobs */
export type ListJobsData = Job[];

export type CreateJobData = Job;

export type CreateJobError = HTTPValidationError;

export type IngestTelemetryData = any;

export type IngestTelemetryError = HTTPValidationError;
