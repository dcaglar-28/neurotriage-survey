-- NeuroTriage seed (run in Supabase SQL Editor after 001 + 002)
begin;
delete from public.templates where id = '00000000-0000-4000-8000-a00000000001';
insert into public.templates (id, title, description, slug, status, thank_you_message, created_at, updated_at)
values ('00000000-0000-4000-8000-a00000000001', 'Prehospital Emergency Care Discovery', 'Help us understand how emergency clinicians assess patients before hospital arrival, identify workflow bottlenecks, diagnostic uncertainty, information gaps, and limitations of current medical technology.', 'prehospital-emergency-care', 'published', 'Thank you for sharing your experience. Your insights help improve prehospital care and medical technology design.', now(), now());
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000000', '00000000-0000-4000-8000-a00000000001', 'Contact', 'How we can reach you if needed.', 0);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000001', '00000000-0000-4000-8000-a00000000001', 'Background', 'Tell us about your clinical role and setting.', 1);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000002', '00000000-0000-4000-8000-a00000000001', 'Recent Patient', 'Reflect on a recent critically ill or trauma patient.', 2);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000003', '00000000-0000-4000-8000-a00000000001', 'Adaptive Workflow', 'Questions adapt based on where uncertainty was highest.', 3);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000004', '00000000-0000-4000-8000-a00000000001', 'Current Medical Technology', 'Devices you use and what they leave out.', 4);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000005', '00000000-0000-4000-8000-a00000000001', 'Diagnostic Challenges', 'Hard-to-recognize conditions before hospital arrival.', 5);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000006', '00000000-0000-4000-8000-a00000000001', 'Technology Trust', 'When measurements help — and when they don’t.', 6);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000007', '00000000-0000-4000-8000-a00000000001', 'Workflow Bottlenecks', 'Delays, repeated assessments, and information gaps.', 7);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000008', '00000000-0000-4000-8000-a00000000001', 'Final Reflection', 'What would change prehospital care the most?', 8);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000000', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000000', 'email', 'short_text'::public.question_type, 'What is your email address?', 'We’ll only use this to follow up if needed.', true, 0, '{"placeholder":"you@example.com","inputType":"email"}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000001', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000001', 'role', 'multiple_choice'::public.question_type, 'What best describes your role?', NULL, true, 1, '{}'::jsonb, NULL);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000100', '00000000-0000-4000-8000-c00000000001', 'EMT', 'emt', 0);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000101', '00000000-0000-4000-8000-c00000000001', 'Paramedic', 'paramedic', 1);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000102', '00000000-0000-4000-8000-c00000000001', 'Emergency Physician', 'emergency_physician', 2);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000103', '00000000-0000-4000-8000-c00000000001', 'Emergency Nurse', 'emergency_nurse', 3);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000104', '00000000-0000-4000-8000-c00000000001', 'Trauma Surgeon', 'trauma_surgeon', 4);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000105', '00000000-0000-4000-8000-c00000000001', 'Military Medic', 'military_medic', 5);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000106', '00000000-0000-4000-8000-c00000000001', 'Disaster Response', 'disaster_response', 6);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000107', '00000000-0000-4000-8000-c00000000001', 'Critical Care Transport', 'critical_care_transport', 7);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000108', '00000000-0000-4000-8000-c00000000001', 'Other', 'other', 8);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000002', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000001', 'years_experience', 'multiple_choice'::public.question_type, 'Years of experience', NULL, true, 2, '{}'::jsonb, NULL);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000200', '00000000-0000-4000-8000-c00000000002', '<1', 'lt_1', 0);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000201', '00000000-0000-4000-8000-c00000000002', '1-3', '1_3', 1);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000202', '00000000-0000-4000-8000-c00000000002', '4-10', '4_10', 2);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000203', '00000000-0000-4000-8000-c00000000002', '10+', '10_plus', 3);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000003', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000001', 'work_environment', 'multiple_choice'::public.question_type, 'Primary work environment', NULL, true, 3, '{}'::jsonb, NULL);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000300', '00000000-0000-4000-8000-c00000000003', 'Urban EMS', 'urban_ems', 0);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000301', '00000000-0000-4000-8000-c00000000003', 'Rural EMS', 'rural_ems', 1);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000302', '00000000-0000-4000-8000-c00000000003', 'Emergency Department', 'ed', 2);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000303', '00000000-0000-4000-8000-c00000000003', 'Trauma Center', 'trauma_center', 3);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000304', '00000000-0000-4000-8000-c00000000003', 'ICU', 'icu', 4);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000305', '00000000-0000-4000-8000-c00000000003', 'Military', 'military', 5);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000306', '00000000-0000-4000-8000-c00000000003', 'Disaster Response', 'disaster_response', 6);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000307', '00000000-0000-4000-8000-c00000000003', 'Other', 'other', 7);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000004', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000002', 'recent_patient_story', 'long_text'::public.question_type, 'Think about the most recent critically ill or trauma patient you treated.', 'Briefly describe what happened from first patient contact until hospital handover.', true, 4, '{"placeholder":"Describe the encounter…"}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000005', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000002', 'uncertainty_point', 'multiple_choice'::public.question_type, 'At what point were you least certain about what was happening?', NULL, true, 5, '{}'::jsonb, NULL);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000500', '00000000-0000-4000-8000-c00000000005', 'On Scene', 'on_scene', 0);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000501', '00000000-0000-4000-8000-c00000000005', 'During Transport', 'during_transport', 1);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000502', '00000000-0000-4000-8000-c00000000005', 'Hospital Handover', 'hospital_handover', 2);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000006', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'scene_assessment_difficulty', 'long_text'::public.question_type, 'What made the initial assessment difficult?', NULL, true, 6, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000007', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'scene_immediate_decisions', 'long_text'::public.question_type, 'Which decisions had to be made immediately?', NULL, true, 7, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000008', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'scene_unavailable_info', 'long_text'::public.question_type, 'What information was unavailable at the time?', NULL, true, 8, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000009', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'transport_condition_changed', 'yes_no'::public.question_type, 'Did the patient''s condition change during transport?', NULL, true, 9, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000010', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'transport_vitals_frequency', 'short_text'::public.question_type, 'How often were vital signs reassessed?', NULL, true, 10, '{"placeholder":"e.g. every 5 minutes"}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000011', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'transport_wish_monitor', 'long_text'::public.question_type, 'What information did you wish you could monitor continuously?', NULL, true, 11, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000012', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'handover_repeated_assessments', 'long_text'::public.question_type, 'Which assessments were repeated after arrival?', NULL, true, 12, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000013', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'handover_lost_info', 'long_text'::public.question_type, 'What information was lost during handover?', NULL, true, 13, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000014', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'handover_questions_again', 'long_text'::public.question_type, 'What questions does the receiving team almost always ask again?', NULL, true, 14, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000015', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'devices_routine', 'multiple_select'::public.question_type, 'Which diagnostic devices do you routinely use?', 'Select all that apply.', true, 15, '{}'::jsonb, NULL);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001500', '00000000-0000-4000-8000-c00000000015', 'ECG', 'ecg', 0);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001501', '00000000-0000-4000-8000-c00000000015', 'Pulse Oximeter', 'pulse_oximeter', 1);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001502', '00000000-0000-4000-8000-c00000000015', 'Blood Pressure', 'blood_pressure', 2);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001503', '00000000-0000-4000-8000-c00000000015', 'Capnography', 'capnography', 3);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001504', '00000000-0000-4000-8000-c00000000015', 'Glucose Meter', 'glucose_meter', 4);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001505', '00000000-0000-4000-8000-c00000000015', 'Stethoscope', 'stethoscope', 5);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001506', '00000000-0000-4000-8000-c00000000015', 'Ultrasound', 'ultrasound', 6);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001507', '00000000-0000-4000-8000-c00000000015', 'Thermal Camera', 'thermal_camera', 7);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001508', '00000000-0000-4000-8000-c00000000015', 'Portable Blood Analyzer', 'portable_blood_analyzer', 8);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001509', '00000000-0000-4000-8000-c00000000015', 'Other', 'other', 9);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000018', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'most_valuable_device', 'dropdown'::public.question_type, 'Which device provides the most valuable information during the first 15 minutes of patient care?', NULL, true, 18, '{"optionsFromQuestionKey":"devices_routine"}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000019', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'wish_hospital_tool', 'long_text'::public.question_type, 'Which hospital-only diagnostic tool do you wish you had access to before arriving at the hospital?', NULL, true, 19, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000020', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000005', 'info_changes_plan', 'long_text'::public.question_type, 'What information changes your treatment plan the most during the first 15 minutes?', NULL, true, 20, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000021', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000005', 'hard_conditions', 'multiple_select'::public.question_type, 'Which conditions are hardest to recognize before hospital arrival?', 'Select all that apply.', true, 21, '{}'::jsonb, NULL);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000002100', '00000000-0000-4000-8000-c00000000021', 'Internal Bleeding', 'internal_bleeding', 0);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000002101', '00000000-0000-4000-8000-c00000000021', 'Stroke', 'stroke', 1);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000002102', '00000000-0000-4000-8000-c00000000021', 'Sepsis', 'sepsis', 2);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000002103', '00000000-0000-4000-8000-c00000000021', 'Traumatic Brain Injury', 'tbi', 3);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000002104', '00000000-0000-4000-8000-c00000000021', 'Pneumothorax', 'pneumothorax', 4);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000002105', '00000000-0000-4000-8000-c00000000021', 'Cardiac Conditions', 'cardiac', 5);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000002106', '00000000-0000-4000-8000-c00000000021', 'Airway Compromise', 'airway_compromise', 6);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000002107', '00000000-0000-4000-8000-c00000000021', 'Other', 'other', 7);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000024', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000006', 'trusted_measurements', 'long_text'::public.question_type, 'Which diagnostic measurements do you trust the most?', NULL, true, 24, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000025', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000006', 'least_trusted_measurements', 'long_text'::public.question_type, 'Which diagnostic measurements do you trust the least?', NULL, true, 25, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000026', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000006', 'overrode_device', 'yes_no'::public.question_type, 'Have you ever ignored or overridden a device?', NULL, true, 26, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000027', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000006', 'overrode_device_why', 'long_text'::public.question_type, 'Why?', 'Tell us about overriding or ignoring a device reading.', true, 27, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000028', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000006', 'unreliable_field_measurements', 'long_text'::public.question_type, 'Which measurements are unreliable in the field?', NULL, true, 28, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000029', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000007', 'delay_story', 'long_text'::public.question_type, 'Describe the last time something significantly delayed your assessment.', NULL, true, 29, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000030', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000007', 'delay_time_lost', 'short_text'::public.question_type, 'Approximately how much time was lost?', NULL, true, 30, '{"placeholder":"e.g. 10 minutes"}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000031', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000007', 'delay_affected_care', 'yes_no'::public.question_type, 'Did the delay affect patient care?', NULL, true, 31, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000032', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000007', 'repeated_at_hospital', 'long_text'::public.question_type, 'Which assessments are routinely repeated after hospital arrival?', NULL, true, 32, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000033', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000007', 'why_repeated', 'long_text'::public.question_type, 'Why are they repeated?', NULL, true, 33, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000034', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000007', 'wish_hospital_knew', 'long_text'::public.question_type, 'What information do you wish the hospital already knew before the patient arrived?', NULL, true, 34, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000035', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000008', 'one_additional_info', 'long_text'::public.question_type, 'If you could instantly know one additional piece of information about every patient before arriving at the hospital, what would it be?', NULL, true, 35, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000036', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000008', 'eliminate_obstacle', 'long_text'::public.question_type, 'If you could eliminate one obstacle from your workflow, what would it be?', NULL, true, 36, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000037', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000008', 'anything_else', 'long_text'::public.question_type, 'Is there anything about prehospital patient assessment we didn''t ask that you think is important?', 'Optional — share anything we missed.', false, 37, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000016', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'device_usefulness', 'rating'::public.question_type, 'How useful is this device?', NULL, true, 16, '{"ratingMax":5,"instanceLabelTemplate":"How useful is {{option}}?"}'::jsonb, '00000000-0000-4000-8000-c00000000015');
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000017', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'device_limitations', 'long_text'::public.question_type, 'What limitations does it have?', NULL, true, 17, '{"instanceLabelTemplate":"What limitations does {{option}} have?"}'::jsonb, '00000000-0000-4000-8000-c00000000015');
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000022', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000005', 'condition_recognition_difficulty', 'long_text'::public.question_type, 'What makes this condition difficult to recognize?', NULL, true, 22, '{"instanceLabelTemplate":"What makes {{option}} difficult to recognize?"}'::jsonb, '00000000-0000-4000-8000-c00000000021');
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000023', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000005', 'condition_confidence_info', 'long_text'::public.question_type, 'What information would improve your confidence?', NULL, true, 23, '{"instanceLabelTemplate":"What information would improve your confidence for {{option}}?"}'::jsonb, '00000000-0000-4000-8000-c00000000021');
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000100', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'on_scene', '00000000-0000-4000-8000-c00000000009', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000101', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'on_scene', '00000000-0000-4000-8000-c00000000010', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000102', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'on_scene', '00000000-0000-4000-8000-c00000000011', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000103', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'on_scene', '00000000-0000-4000-8000-c00000000012', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000104', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'on_scene', '00000000-0000-4000-8000-c00000000013', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000105', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'on_scene', '00000000-0000-4000-8000-c00000000014', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000200', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'during_transport', '00000000-0000-4000-8000-c00000000006', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000201', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'during_transport', '00000000-0000-4000-8000-c00000000007', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000202', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'during_transport', '00000000-0000-4000-8000-c00000000008', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000203', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'during_transport', '00000000-0000-4000-8000-c00000000012', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000204', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'during_transport', '00000000-0000-4000-8000-c00000000013', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000205', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'during_transport', '00000000-0000-4000-8000-c00000000014', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000300', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'hospital_handover', '00000000-0000-4000-8000-c00000000006', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000301', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'hospital_handover', '00000000-0000-4000-8000-c00000000007', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000302', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'hospital_handover', '00000000-0000-4000-8000-c00000000008', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000303', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'hospital_handover', '00000000-0000-4000-8000-c00000000009', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000304', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'hospital_handover', '00000000-0000-4000-8000-c00000000010', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000305', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'hospital_handover', '00000000-0000-4000-8000-c00000000011', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000400', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000026', 'equals'::public.branch_operator, 'yes', '00000000-0000-4000-8000-c00000000027', 'show'::public.branch_action, 20);
commit;
select slug, title, status from public.templates where id = '00000000-0000-4000-8000-a00000000001';
