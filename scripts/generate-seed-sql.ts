import { writeFileSync } from "fs";
import { PREHOSPITAL_TEMPLATE as t } from "../src/data/seed-prehospital";

function esc(s: string | null | undefined) {
  if (s === null || s === undefined) return "NULL";
  return `'${String(s).replace(/'/g, "''")}'`;
}

function jsonb(v: unknown) {
  return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
}

const lines: string[] = [];
lines.push("-- NeuroTriage seed (run in Supabase SQL Editor after 001 + 002)");
lines.push("begin;");
lines.push(`delete from public.templates where id = ${esc(t.id)};`);
lines.push(`insert into public.templates (id, title, description, slug, status, thank_you_message, created_at, updated_at)
values (${esc(t.id)}, ${esc(t.title)}, ${esc(t.description)}, ${esc(t.slug)}, ${esc(t.status)}, ${esc(t.thankYouMessage)}, now(), now());`);

for (const s of t.sections) {
  lines.push(`insert into public.sections (id, template_id, title, description, order_index)
values (${esc(s.id)}, ${esc(s.templateId)}, ${esc(s.title)}, ${esc(s.description)}, ${s.orderIndex});`);
}

const base = t.questions.filter((q) => !q.repeatSourceQuestionId);
const repeats = t.questions.filter((q) => q.repeatSourceQuestionId);

function insertQ(q: (typeof t.questions)[0]) {
  lines.push(`insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values (${esc(q.id)}, ${esc(q.templateId)}, ${esc(q.sectionId)}, ${esc(q.key)}, ${esc(q.type)}::public.question_type, ${esc(q.title)}, ${esc(q.description)}, ${q.required}, ${q.orderIndex}, ${jsonb(q.config)}, ${esc(q.repeatSourceQuestionId)});`);
  for (const o of q.options) {
    lines.push(`insert into public.question_options (id, question_id, label, value, order_index)
values (${esc(o.id)}, ${esc(o.questionId)}, ${esc(o.label)}, ${esc(o.value)}, ${o.orderIndex});`);
  }
}

base.forEach(insertQ);
repeats.forEach(insertQ);

for (const r of t.branchRules) {
  lines.push(`insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values (${esc(r.id)}, ${esc(r.templateId)}, ${esc(r.sourceQuestionId)}, ${esc(r.operator)}::public.branch_operator, ${esc(r.value)}, ${esc(r.targetQuestionId)}, ${esc(r.action)}::public.branch_action, ${r.priority});`);
}

lines.push("commit;");
lines.push(
  `select slug, title, status from public.templates where id = ${esc(t.id)};`
);

writeFileSync("supabase/seed-prehospital.sql", lines.join("\n") + "\n");
console.log(`Wrote supabase/seed-prehospital.sql (${lines.length} lines)`);
