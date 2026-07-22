export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "multiple_select"
  | "dropdown"
  | "yes_no"
  | "rating";

export type TemplateStatus = "draft" | "published" | "archived";
export type SessionStatus = "in_progress" | "completed" | "abandoned";

export type BranchOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "is_answered"
  | "is_empty";

export type BranchAction = "goto" | "show" | "hide" | "end";

export type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

export interface QuestionConfig {
  ratingMax?: 5 | 10;
  placeholder?: string;
  inputType?: "text" | "email";
  /** Populate dropdown options from answers of another question key */
  optionsFromQuestionKey?: string;
  /** Label prefix when this question is repeated per option */
  instanceLabelTemplate?: string;
  /** Show an Other choice with free-text (choice questions). Default true for choice types. */
  allowOther?: boolean;
  /** Allow skipping this question. Default true except email. */
  allowSkip?: boolean;
}

export const SKIPPED_ANSWER = "__skipped__";
export const OTHER_VALUE = "other";

export interface QuestionOption {
  id: string;
  questionId: string;
  label: string;
  value: string;
  orderIndex: number;
}

export interface Question {
  id: string;
  templateId: string;
  sectionId: string | null;
  key: string;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  orderIndex: number;
  config: QuestionConfig;
  repeatSourceQuestionId: string | null;
  options: QuestionOption[];
}

export interface Section {
  id: string;
  templateId: string;
  title: string;
  description: string | null;
  orderIndex: number;
}

export interface BranchRule {
  id: string;
  templateId: string;
  sourceQuestionId: string;
  operator: BranchOperator;
  value: string | null;
  targetQuestionId: string | null;
  action: BranchAction;
  priority: number;
}

export interface Template {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: TemplateStatus;
  thankYouMessage: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
  questions: Question[];
  branchRules: BranchRule[];
}

export interface ResponseRecord {
  id: string;
  sessionId: string;
  questionId: string;
  instanceKey: string | null;
  value: AnswerValue;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSession {
  id: string;
  templateId: string;
  respondentToken: string;
  status: SessionStatus;
  currentQuestionKey: string | null;
  metadata: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
  lastSavedAt: string;
  responses: ResponseRecord[];
}

/** Runtime node after expanding repeats / dynamic options */
export interface RuntimeQuestion {
  /** Stable path id e.g. "device_usefulness::ECG" */
  runtimeId: string;
  question: Question;
  instanceKey: string | null;
  instanceLabel: string | null;
  title: string;
  options: QuestionOption[];
  section: Section | null;
}

export interface TemplateSummary {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: TemplateStatus;
  questionCount: number;
  updatedAt: string;
}

export interface ResultsOverview {
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  completionRate: number;
  averageCompletionMs: number | null;
  sessions: Array<{
    id: string;
    templateId: string;
    templateTitle: string;
    status: SessionStatus;
    startedAt: string;
    completedAt: string | null;
    lastSavedAt: string;
    answeredCount: number;
    durationMs: number | null;
    role?: string;
  }>;
}

export interface GroupedAnswer {
  sessionId: string;
  instanceKey: string | null;
  value: unknown;
  status: SessionStatus;
}
