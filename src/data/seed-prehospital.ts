import type { BranchRule, Question, Section, Template } from "@/lib/types";

function id(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}-0000-0000-000000000001`;
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
    title: "Adaptive Workflow",
    description: "Questions adapt based on where uncertainty was highest.",
    orderIndex: 3,
  },
  {
    id: id("sect", 4),
    templateId: TEMPLATE_ID,
    title: "Current Medical Technology",
    description: "Devices you use and what they leave out.",
    orderIndex: 4,
  },
  {
    id: id("sect", 5),
    templateId: TEMPLATE_ID,
    title: "Diagnostic Challenges",
    description: "Hard-to-recognize conditions before hospital arrival.",
    orderIndex: 5,
  },
  {
    id: id("sect", 6),
    templateId: TEMPLATE_ID,
    title: "Technology Trust",
    description: "When measurements help — and when they don’t.",
    orderIndex: 6,
  },
  {
    id: id("sect", 7),
    templateId: TEMPLATE_ID,
    title: "Workflow Bottlenecks",
    description: "Delays, repeated assessments, and information gaps.",
    orderIndex: 7,
  },
  {
    id: id("sect", 8),
    templateId: TEMPLATE_ID,
    title: "Final Reflection",
    description: "What would change prehospital care the most?",
    orderIndex: 8,
  },
];

function opts(
  questionId: string,
  items: Array<{ label: string; value: string }>
) {
  return items.map((item, index) => ({
    id: `${questionId}-opt-${index}`,
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
    options: opts(questionId, optionItems ?? []),
  };
}

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
  },
  repeatSourceQuestionId: null,
});

const baseQuestions: Question[] = [
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
  // On Scene branch
  q(6, {
    sectionId: id("sect", 3),
    key: "scene_assessment_difficulty",
    type: "long_text",
    title: "What made the initial assessment difficult?",
    description: null,
    required: true,
    orderIndex: 5,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(7, {
    sectionId: id("sect", 3),
    key: "scene_immediate_decisions",
    type: "long_text",
    title: "Which decisions had to be made immediately?",
    description: null,
    required: true,
    orderIndex: 6,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(8, {
    sectionId: id("sect", 3),
    key: "scene_unavailable_info",
    type: "long_text",
    title: "What information was unavailable at the time?",
    description: null,
    required: true,
    orderIndex: 7,
    config: {},
    repeatSourceQuestionId: null,
  }),
  // Transport branch
  q(9, {
    sectionId: id("sect", 3),
    key: "transport_condition_changed",
    type: "yes_no",
    title: "Did the patient's condition change during transport?",
    description: null,
    required: true,
    orderIndex: 8,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(10, {
    sectionId: id("sect", 3),
    key: "transport_vitals_frequency",
    type: "short_text",
    title: "How often were vital signs reassessed?",
    description: null,
    required: true,
    orderIndex: 9,
    config: { placeholder: "e.g. every 5 minutes" },
    repeatSourceQuestionId: null,
  }),
  q(11, {
    sectionId: id("sect", 3),
    key: "transport_wish_monitor",
    type: "long_text",
    title: "What information did you wish you could monitor continuously?",
    description: null,
    required: true,
    orderIndex: 10,
    config: {},
    repeatSourceQuestionId: null,
  }),
  // Handover branch
  q(12, {
    sectionId: id("sect", 3),
    key: "handover_repeated_assessments",
    type: "long_text",
    title: "Which assessments were repeated after arrival?",
    description: null,
    required: true,
    orderIndex: 11,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(13, {
    sectionId: id("sect", 3),
    key: "handover_lost_info",
    type: "long_text",
    title: "What information was lost during handover?",
    description: null,
    required: true,
    orderIndex: 12,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(14, {
    sectionId: id("sect", 3),
    key: "handover_questions_again",
    type: "long_text",
    title: "What questions does the receiving team almost always ask again?",
    description: null,
    required: true,
    orderIndex: 13,
    config: {},
    repeatSourceQuestionId: null,
  }),
  // Technology
  q(15, {
    sectionId: id("sect", 4),
    key: "devices_routine",
    type: "multiple_select",
    title: "Which diagnostic devices do you routinely use?",
    description: "Select all that apply.",
    required: true,
    orderIndex: 14,
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
  q(16, {
    sectionId: id("sect", 4),
    key: "device_usefulness",
    type: "rating",
    title: "How useful is this device?",
    description: null,
    required: true,
    orderIndex: 15,
    config: {
      ratingMax: 5,
      instanceLabelTemplate: "How useful is {{option}}?",
    },
    repeatSourceQuestionId: id("ques", 15),
  }),
  q(17, {
    sectionId: id("sect", 4),
    key: "device_limitations",
    type: "long_text",
    title: "What limitations does it have?",
    description: null,
    required: true,
    orderIndex: 16,
    config: {
      instanceLabelTemplate: "What limitations does {{option}} have?",
    },
    repeatSourceQuestionId: id("ques", 15),
  }),
  q(18, {
    sectionId: id("sect", 4),
    key: "most_valuable_device",
    type: "dropdown",
    title:
      "Which device provides the most valuable information during the first 15 minutes of patient care?",
    description: null,
    required: true,
    orderIndex: 17,
    config: { optionsFromQuestionKey: "devices_routine" },
    repeatSourceQuestionId: null,
  }),
  q(19, {
    sectionId: id("sect", 4),
    key: "wish_hospital_tool",
    type: "long_text",
    title:
      "Which hospital-only diagnostic tool do you wish you had access to before arriving at the hospital?",
    description: null,
    required: true,
    orderIndex: 18,
    config: {},
    repeatSourceQuestionId: null,
  }),
  // Diagnostic challenges
  q(20, {
    sectionId: id("sect", 5),
    key: "info_changes_plan",
    type: "long_text",
    title:
      "What information changes your treatment plan the most during the first 15 minutes?",
    description: null,
    required: true,
    orderIndex: 19,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(21, {
    sectionId: id("sect", 5),
    key: "hard_conditions",
    type: "multiple_select",
    title: "Which conditions are hardest to recognize before hospital arrival?",
    description: "Select all that apply.",
    required: true,
    orderIndex: 20,
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
  q(22, {
    sectionId: id("sect", 5),
    key: "condition_recognition_difficulty",
    type: "long_text",
    title: "What makes this condition difficult to recognize?",
    description: null,
    required: true,
    orderIndex: 21,
    config: {
      instanceLabelTemplate:
        "What makes {{option}} difficult to recognize?",
    },
    repeatSourceQuestionId: id("ques", 21),
  }),
  q(23, {
    sectionId: id("sect", 5),
    key: "condition_confidence_info",
    type: "long_text",
    title: "What information would improve your confidence?",
    description: null,
    required: true,
    orderIndex: 22,
    config: {
      instanceLabelTemplate:
        "What information would improve your confidence for {{option}}?",
    },
    repeatSourceQuestionId: id("ques", 21),
  }),
  // Technology trust
  q(24, {
    sectionId: id("sect", 6),
    key: "trusted_measurements",
    type: "long_text",
    title: "Which diagnostic measurements do you trust the most?",
    description: null,
    required: true,
    orderIndex: 23,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(25, {
    sectionId: id("sect", 6),
    key: "least_trusted_measurements",
    type: "long_text",
    title: "Which diagnostic measurements do you trust the least?",
    description: null,
    required: true,
    orderIndex: 24,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(26, {
    sectionId: id("sect", 6),
    key: "overrode_device",
    type: "yes_no",
    title: "Have you ever ignored or overridden a device?",
    description: null,
    required: true,
    orderIndex: 25,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(27, {
    sectionId: id("sect", 6),
    key: "overrode_device_why",
    type: "long_text",
    title: "Why?",
    description: "Tell us about overriding or ignoring a device reading.",
    required: true,
    orderIndex: 26,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(28, {
    sectionId: id("sect", 6),
    key: "unreliable_field_measurements",
    type: "long_text",
    title: "Which measurements are unreliable in the field?",
    description: null,
    required: true,
    orderIndex: 27,
    config: {},
    repeatSourceQuestionId: null,
  }),
  // Bottlenecks
  q(29, {
    sectionId: id("sect", 7),
    key: "delay_story",
    type: "long_text",
    title: "Describe the last time something significantly delayed your assessment.",
    description: null,
    required: true,
    orderIndex: 28,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(30, {
    sectionId: id("sect", 7),
    key: "delay_time_lost",
    type: "short_text",
    title: "Approximately how much time was lost?",
    description: null,
    required: true,
    orderIndex: 29,
    config: { placeholder: "e.g. 10 minutes" },
    repeatSourceQuestionId: null,
  }),
  q(31, {
    sectionId: id("sect", 7),
    key: "delay_affected_care",
    type: "yes_no",
    title: "Did the delay affect patient care?",
    description: null,
    required: true,
    orderIndex: 30,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(32, {
    sectionId: id("sect", 7),
    key: "repeated_at_hospital",
    type: "long_text",
    title: "Which assessments are routinely repeated after hospital arrival?",
    description: null,
    required: true,
    orderIndex: 31,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(33, {
    sectionId: id("sect", 7),
    key: "why_repeated",
    type: "long_text",
    title: "Why are they repeated?",
    description: null,
    required: true,
    orderIndex: 32,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(34, {
    sectionId: id("sect", 7),
    key: "wish_hospital_knew",
    type: "long_text",
    title:
      "What information do you wish the hospital already knew before the patient arrived?",
    description: null,
    required: true,
    orderIndex: 33,
    config: {},
    repeatSourceQuestionId: null,
  }),
  // Final reflection
  q(35, {
    sectionId: id("sect", 8),
    key: "one_additional_info",
    type: "long_text",
    title:
      "If you could instantly know one additional piece of information about every patient before arriving at the hospital, what would it be?",
    description: null,
    required: true,
    orderIndex: 34,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(36, {
    sectionId: id("sect", 8),
    key: "eliminate_obstacle",
    type: "long_text",
    title: "If you could eliminate one obstacle from your workflow, what would it be?",
    description: null,
    required: true,
    orderIndex: 35,
    config: {},
    repeatSourceQuestionId: null,
  }),
  q(37, {
    sectionId: id("sect", 8),
    key: "anything_else",
    type: "long_text",
    title:
      "Is there anything about prehospital patient assessment we didn't ask that you think is important?",
    description: "Optional — share anything we missed.",
    required: false,
    orderIndex: 36,
    config: {},
    repeatSourceQuestionId: null,
  }),
];

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

const sceneIds = [id("ques", 6), id("ques", 7), id("ques", 8)];
const transportIds = [id("ques", 9), id("ques", 10), id("ques", 11)];
const handoverIds = [id("ques", 12), id("ques", 13), id("ques", 14)];

const branchRules: BranchRule[] = [
  ...hideWhen(1, id("ques", 5), "on_scene", [...transportIds, ...handoverIds]),
  ...hideWhen(2, id("ques", 5), "during_transport", [...sceneIds, ...handoverIds]),
  ...hideWhen(3, id("ques", 5), "hospital_handover", [...sceneIds, ...transportIds]),
  // Show "why override" only when yes
  {
    id: id("rule", 400),
    templateId: TEMPLATE_ID,
    sourceQuestionId: id("ques", 26),
    operator: "equals",
    value: "yes",
    targetQuestionId: id("ques", 27),
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
