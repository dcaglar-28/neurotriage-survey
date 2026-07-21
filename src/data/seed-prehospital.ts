import type { BranchRule, Question, Section, Template } from "@/lib/types";

/** Deterministic valid UUIDs for the seeded NeuroTriage template */
function id(
  kind: "tmpl" | "sect" | "ques" | "rule" | "opt",
  n: number
): string {
  const kindHex: Record<typeof kind, string> = {
    tmpl: "a",
    sect: "b",
    ques: "c",
    rule: "d",
    opt: "e",
  };
  const suffix = `${kindHex[kind]}${String(n).padStart(11, "0")}`;
  return `00000000-0000-4000-8000-${suffix}`;
}

const TEMPLATE_ID = id("tmpl", 1);

const sections: Section[] = [
  {
    id: id("sect", 0),
    templateId: TEMPLATE_ID,
    title: "Contact",
    description: "How we can reach you if needed.",
    orderIndex: 0,
  },
  {
    id: id("sect", 1),
    templateId: TEMPLATE_ID,
    title: "Background",
    description: "Tell us about your clinical role and setting.",
    orderIndex: 1,
  },
  {
    id: id("sect", 2),
    templateId: TEMPLATE_ID,
    title: "Recent Patient",
    description: "Reflect on a recent critically ill or trauma patient.",
    orderIndex: 2,
  },
  {
    id: id("sect", 3),
    templateId: TEMPLATE_ID,
    title: "Uncertainty",
    description: "Where assessment was hardest.",
    orderIndex: 3,
  },
  {
    id: id("sect", 4),
    templateId: TEMPLATE_ID,
    title: "Technology & Diagnosis",
    description: "Devices, information gaps, and trust.",
    orderIndex: 4,
  },
  {
    id: id("sect", 5),
    templateId: TEMPLATE_ID,
    title: "Workflow & Reflection",
    description: "Bottlenecks and what would help most.",
    orderIndex: 5,
  },
];

function opts(
  questionId: string,
  items: Array<{ label: string; value: string }>,
  optionBase: number
) {
  return items.map((item, index) => ({
    id: id("opt", optionBase + index),
    questionId,
    label: item.label,
    value: item.value,
    orderIndex: index,
  }));
}

function q(
  n: number,
  partial: Omit<Question, "id" | "templateId" | "options"> & {
    options?: Array<{ label: string; value: string }>;
  }
): Question {
  const questionId = id("ques", n);
  const { options: optionItems, ...rest } = partial;
  return {
    id: questionId,
    templateId: TEMPLATE_ID,
    ...rest,
    options: opts(questionId, optionItems ?? [], n * 100),
  };
}

/**
 * Hard cap: email + 17 content questions.
 * Adaptive branch = 1 follow-up (of 3) so a full path stays ≤ 18 screens.
 */
const emailQuestion: Question = q(0, {
  sectionId: id("sect", 0),
  key: "email",
  type: "short_text",
  title: "What is your email address?",
  description: "We’ll only use this to follow up if needed.",
  required: true,
  orderIndex: 0,
  config: {
    placeholder: "you@example.com",
    inputType: "email",
    allowSkip: false,
  },
  repeatSourceQuestionId: null,
});

const baseQuestions: Question[] = [
  // 1–3 Background
  q(1, {
    sectionId: id("sect", 1),
    key: "role",
    type: "multiple_choice",
    title: "What best describes your role?",
    description: null,
    required: true,
    orderIndex: 0,
    config: {},
    repeatSourceQuestionId: null,
    options: [
      { label: "EMT", value: "emt" },
      { label: "Paramedic", value: "paramedic" },
      { label: "Emergency Physician", value: "emergency_physician" },
      { label: "Emergency Nurse", value: "emergency_nurse" },
      { label: "Trauma Surgeon", value: "trauma_surgeon" },
      { label: "Military Medic", value: "military_medic" },
      { label: "Disaster Response", value: "disaster_response" },
      { label: "Critical Care Transport", value: "critical_care_transport" },
      { label: "Other", value: "other" },
    ],
  }),
  q(2, {
    sectionId: id("sect", 1),
    key: "years_experience",
    type: "multiple_choice",
    title: "Years of experience",
    description: null,
    required: true,
    orderIndex: 1,
    config: {},
    repeatSourceQuestionId: null,
    options: [
      { label: "<1", value: "lt_1" },
      { label: "1-3", value: "1_3" },
      { label: "4-10", value: "4_10" },
      { label: "10+", value: "10_plus" },
    ],
  }),
  q(3, {
    sectionId: id("sect", 1),
    key: "work_environment",
    type: "multiple_choice",
    title: "Primary work environment",
    description: null,
    required: true,
    orderIndex: 2,
    config: {},
    repeatSourceQuestionId: null,
    options: [
      { label: "Urban EMS", value: "urban_ems" },
      { label: "Rural EMS", value: "rural_ems" },
      { label: "Emergency Department", value: "ed" },
      { label: "Trauma Center", value: "trauma_center" },
      { label: "ICU", value: "icu" },
      { label: "Military", value: "military" },
      { label: "Disaster Response", value: "disaster_response" },
      { label: "Other", value: "other" },
    ],
  }),
  // 4–5 Recent patient
  q(4, {
    sectionId: id("sect", 2),
    key: "recent_patient_story",
    type: "long_text",
    title:
      "Think about the most recent critically ill or trauma patient you treated.",
    description:
      "Briefly describe what happened from first patient contact until hospital handover.",
    required: true,
    orderIndex: 3,
    config: { placeholder: "Describe the encounter…" },
    repeatSourceQuestionId: null,
  }),
  q(5, {
    sectionId: id("sect", 2),
    key: "uncertainty_point",
    type: "multiple_choice",
    title: "At what point were you least certain about what was happening?",
    description: null,
    required: true,
    orderIndex: 4,
    config: {},
    repeatSourceQuestionId: null,
    options: [
      { label: "On Scene", value: "on_scene" },
      { label: "During Transport", value: "during_transport" },
      { label: "Hospital Handover", value: "hospital_handover" },
    ],
  }),
  // 6 Adaptive (only one shown) — ques 6, 7, 8
  q(6, {
    sectionId: id("sect", 3),
    key: "scene_followup",
    type: "long_text",
    title: "What made the initial assessment difficult, and what information was missing?",
    description: null,
    required: true,
    orderIndex: 5,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(7, {
    sectionId: id("sect", 3),
    key: "transport_followup",
    type: "long_text",
    title:
      "During transport, what changed — and what did you wish you could monitor continuously?",
    description: null,
    required: true,
    orderIndex: 6,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(8, {
    sectionId: id("sect", 3),
    key: "handover_followup",
    type: "long_text",
    title:
      "What information was lost or re-asked at hospital handover?",
    description: null,
    required: true,
    orderIndex: 7,
    config: {},
    repeatSourceQuestionId: null,
  }),
  // 7–11 Technology & diagnosis (path numbering after adaptive)
  q(9, {
    sectionId: id("sect", 4),
    key: "devices_routine",
    type: "multiple_select",
    title: "Which diagnostic devices do you routinely use?",
    description: "Select all that apply.",
    required: true,
    orderIndex: 8,
    config: {},
    repeatSourceQuestionId: null,
    options: [
      { label: "ECG", value: "ecg" },
      { label: "Pulse Oximeter", value: "pulse_oximeter" },
      { label: "Blood Pressure", value: "blood_pressure" },
      { label: "Capnography", value: "capnography" },
      { label: "Glucose Meter", value: "glucose_meter" },
      { label: "Stethoscope", value: "stethoscope" },
      { label: "Ultrasound", value: "ultrasound" },
      { label: "Thermal Camera", value: "thermal_camera" },
      { label: "Portable Blood Analyzer", value: "portable_blood_analyzer" },
      { label: "Other", value: "other" },
    ],
  }),
  q(10, {
    sectionId: id("sect", 4),
    key: "wish_field_capability",
    type: "long_text",
    title:
      "Which diagnostic capability do you most wish you had in the field before hospital arrival?",
    description: null,
    required: true,
    orderIndex: 9,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(11, {
    sectionId: id("sect", 4),
    key: "info_changes_plan",
    type: "long_text",
    title:
      "What information changes your treatment plan the most during the first 15 minutes?",
    description: null,
    required: true,
    orderIndex: 10,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(12, {
    sectionId: id("sect", 4),
    key: "hard_conditions",
    type: "multiple_select",
    title: "Which conditions are hardest to recognize before hospital arrival?",
    description: "Select all that apply.",
    required: true,
    orderIndex: 11,
    config: {},
    repeatSourceQuestionId: null,
    options: [
      { label: "Internal Bleeding", value: "internal_bleeding" },
      { label: "Stroke", value: "stroke" },
      { label: "Sepsis", value: "sepsis" },
      { label: "Traumatic Brain Injury", value: "tbi" },
      { label: "Pneumothorax", value: "pneumothorax" },
      { label: "Cardiac Conditions", value: "cardiac" },
      { label: "Airway Compromise", value: "airway_compromise" },
      { label: "Other", value: "other" },
    ],
  }),
  q(13, {
    sectionId: id("sect", 4),
    key: "least_trusted_field",
    type: "long_text",
    title:
      "Which diagnostic measurements do you trust least in the field, and why?",
    description: null,
    required: true,
    orderIndex: 12,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(14, {
    sectionId: id("sect", 4),
    key: "overrode_device",
    type: "yes_no",
    title: "Have you ever ignored or overridden a device?",
    description: null,
    required: true,
    orderIndex: 13,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(15, {
    sectionId: id("sect", 4),
    key: "overrode_device_why",
    type: "long_text",
    title: "Why did you override or ignore it?",
    description: null,
    required: true,
    orderIndex: 14,
    config: {},
    repeatSourceQuestionId: null,
  }),
  // 12–17 Workflow & reflection
  q(16, {
    sectionId: id("sect", 5),
    key: "delay_story",
    type: "long_text",
    title: "Describe the last time something significantly delayed your assessment.",
    description: "Include roughly how much time was lost and whether it affected care.",
    required: true,
    orderIndex: 15,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(17, {
    sectionId: id("sect", 5),
    key: "wish_hospital_knew",
    type: "long_text",
    title:
      "What information do you wish the hospital already knew before the patient arrived?",
    description: null,
    required: true,
    orderIndex: 16,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(18, {
    sectionId: id("sect", 5),
    key: "one_additional_info",
    type: "long_text",
    title:
      "If you could instantly know one additional piece of information about every patient before hospital arrival, what would it be?",
    description: null,
    required: true,
    orderIndex: 17,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(19, {
    sectionId: id("sect", 5),
    key: "eliminate_obstacle",
    type: "long_text",
    title: "If you could eliminate one obstacle from your workflow, what would it be?",
    description: null,
    required: true,
    orderIndex: 18,
    config: {},
    repeatSourceQuestionId: null,
  }),
];

// Path: email + ≤17 content (adaptive follow-up is 1 of 3; override-why only if yes).
const questions: Question[] = [
  emailQuestion,
  ...baseQuestions.map((question, index) => ({
    ...question,
    orderIndex: index + 1,
  })),
];

function hideWhen(
  ruleN: number,
  sourceQuestionId: string,
  value: string,
  targetQuestionIds: string[],
  priority = 10
): BranchRule[] {
  return targetQuestionIds.map((targetQuestionId, i) => ({
    id: id("rule", ruleN * 100 + i),
    templateId: TEMPLATE_ID,
    sourceQuestionId,
    operator: "equals" as const,
    value,
    targetQuestionId,
    action: "hide" as const,
    priority,
  }));
}

const sceneId = id("ques", 6);
const transportId = id("ques", 7);
const handoverId = id("ques", 8);

const branchRules: BranchRule[] = [
  ...hideWhen(1, id("ques", 5), "on_scene", [transportId, handoverId]),
  ...hideWhen(2, id("ques", 5), "during_transport", [sceneId, handoverId]),
  ...hideWhen(3, id("ques", 5), "hospital_handover", [sceneId, transportId]),
  {
    id: id("rule", 400),
    templateId: TEMPLATE_ID,
    sourceQuestionId: id("ques", 14),
    operator: "equals",
    value: "yes",
    targetQuestionId: id("ques", 15),
    action: "show",
    priority: 20,
  },
];

export const PREHOSPITAL_TEMPLATE: Template = {
  id: TEMPLATE_ID,
  title: "Prehospital Emergency Care Discovery",
  description:
    "Help us understand how emergency clinicians assess patients before hospital arrival, identify workflow bottlenecks, diagnostic uncertainty, information gaps, and limitations of current medical technology.",
  slug: "prehospital-emergency-care",
  status: "published",
  thankYouMessage:
    "Thank you for sharing your experience. Your insights help improve prehospital care and medical technology design.",
  createdBy: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections,
  questions,
  branchRules,
};

export const SEED_TEMPLATES: Template[] = [PREHOSPITAL_TEMPLATE];
