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
values ('00000000-0000-4000-8000-b00000000003', '00000000-0000-4000-8000-a00000000001', 'Uncertainty', 'Where assessment was hardest.', 3);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000004', '00000000-0000-4000-8000-a00000000001', 'Technology & Diagnosis', 'Devices, information gaps, and trust.', 4);
insert into public.sections (id, template_id, title, description, order_index)
values ('00000000-0000-4000-8000-b00000000005', '00000000-0000-4000-8000-a00000000001', 'Workflow & Reflection', 'Bottlenecks and what would help most.', 5);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000000', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000000', 'email', 'short_text'::public.question_type, 'What is your email address?', 'We’ll only use this to follow up if needed.', true, 0, '{"placeholder":"you@example.com","inputType":"email","allowSkip":false}'::jsonb, NULL);
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
values ('00000000-0000-4000-8000-c00000000006', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'scene_followup', 'long_text'::public.question_type, 'What made the initial assessment difficult, and what information was missing?', NULL, true, 6, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000007', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'transport_followup', 'long_text'::public.question_type, 'During transport, what changed — and what did you wish you could monitor continuously?', NULL, true, 7, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000008', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000003', 'handover_followup', 'long_text'::public.question_type, 'What information was lost or re-asked at hospital handover?', NULL, true, 8, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000009', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'devices_routine', 'multiple_select'::public.question_type, 'Which diagnostic devices do you routinely use?', 'Select all that apply.', true, 9, '{}'::jsonb, NULL);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000900', '00000000-0000-4000-8000-c00000000009', 'ECG', 'ecg', 0);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000901', '00000000-0000-4000-8000-c00000000009', 'Pulse Oximeter', 'pulse_oximeter', 1);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000902', '00000000-0000-4000-8000-c00000000009', 'Blood Pressure', 'blood_pressure', 2);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000903', '00000000-0000-4000-8000-c00000000009', 'Capnography', 'capnography', 3);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000904', '00000000-0000-4000-8000-c00000000009', 'Glucose Meter', 'glucose_meter', 4);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000905', '00000000-0000-4000-8000-c00000000009', 'Stethoscope', 'stethoscope', 5);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000906', '00000000-0000-4000-8000-c00000000009', 'Ultrasound', 'ultrasound', 6);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000907', '00000000-0000-4000-8000-c00000000009', 'Thermal Camera', 'thermal_camera', 7);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000908', '00000000-0000-4000-8000-c00000000009', 'Portable Blood Analyzer', 'portable_blood_analyzer', 8);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000000909', '00000000-0000-4000-8000-c00000000009', 'Other', 'other', 9);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000010', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'wish_field_capability', 'long_text'::public.question_type, 'Which diagnostic capability do you most wish you had in the field before hospital arrival?', NULL, true, 10, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000011', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'info_changes_plan', 'long_text'::public.question_type, 'What information changes your treatment plan the most during the first 15 minutes?', NULL, true, 11, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000012', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'hard_conditions', 'multiple_select'::public.question_type, 'Which conditions are hardest to recognize before hospital arrival?', 'Select all that apply.', true, 12, '{}'::jsonb, NULL);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001200', '00000000-0000-4000-8000-c00000000012', 'Internal Bleeding', 'internal_bleeding', 0);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001201', '00000000-0000-4000-8000-c00000000012', 'Stroke', 'stroke', 1);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001202', '00000000-0000-4000-8000-c00000000012', 'Sepsis', 'sepsis', 2);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001203', '00000000-0000-4000-8000-c00000000012', 'Traumatic Brain Injury', 'tbi', 3);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001204', '00000000-0000-4000-8000-c00000000012', 'Pneumothorax', 'pneumothorax', 4);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001205', '00000000-0000-4000-8000-c00000000012', 'Cardiac Conditions', 'cardiac', 5);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001206', '00000000-0000-4000-8000-c00000000012', 'Airway Compromise', 'airway_compromise', 6);
insert into public.question_options (id, question_id, label, value, order_index)
values ('00000000-0000-4000-8000-e00000001207', '00000000-0000-4000-8000-c00000000012', 'Other', 'other', 7);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000013', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'least_trusted_field', 'long_text'::public.question_type, 'Which diagnostic measurements do you trust least in the field, and why?', NULL, true, 13, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000014', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'overrode_device', 'yes_no'::public.question_type, 'Have you ever ignored or overridden a device?', NULL, true, 14, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000015', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000004', 'overrode_device_why', 'long_text'::public.question_type, 'Why did you override or ignore it?', NULL, true, 15, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000016', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000005', 'delay_story', 'long_text'::public.question_type, 'Describe the last time something significantly delayed your assessment.', 'Include roughly how much time was lost and whether it affected care.', true, 16, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000017', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000005', 'wish_hospital_knew', 'long_text'::public.question_type, 'What information do you wish the hospital already knew before the patient arrived?', NULL, true, 17, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000018', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000005', 'one_additional_info', 'long_text'::public.question_type, 'If you could instantly know one additional piece of information about every patient before hospital arrival, what would it be?', NULL, true, 18, '{}'::jsonb, NULL);
insert into public.questions (id, template_id, section_id, key, type, title, description, required, order_index, config, repeat_source_question_id)
values ('00000000-0000-4000-8000-c00000000019', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-b00000000005', 'eliminate_obstacle', 'long_text'::public.question_type, 'If you could eliminate one obstacle from your workflow, what would it be?', NULL, true, 19, '{}'::jsonb, NULL);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000100', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'on_scene', '00000000-0000-4000-8000-c00000000007', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000101', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'on_scene', '00000000-0000-4000-8000-c00000000008', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000200', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'during_transport', '00000000-0000-4000-8000-c00000000006', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000201', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'during_transport', '00000000-0000-4000-8000-c00000000008', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000300', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'hospital_handover', '00000000-0000-4000-8000-c00000000006', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000301', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000005', 'equals'::public.branch_operator, 'hospital_handover', '00000000-0000-4000-8000-c00000000007', 'hide'::public.branch_action, 10);
insert into public.branch_rules (id, template_id, source_question_id, operator, value, target_question_id, action, priority)
values ('00000000-0000-4000-8000-d00000000400', '00000000-0000-4000-8000-a00000000001', '00000000-0000-4000-8000-c00000000014', 'equals'::public.branch_operator, 'yes', '00000000-0000-4000-8000-c00000000015', 'show'::public.branch_action, 20);
commit;
select slug, title, status from public.templates where id = '00000000-0000-4000-8000-a00000000001';
