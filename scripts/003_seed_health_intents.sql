-- Seed Health-Specific Intents for Kai
-- Run this in Supabase SQL Editor

-- Clear existing generic intents
DELETE FROM intents WHERE name IN ('Greeting', 'FAQ', 'Support', 'Order', 'Feedback');

-- Insert health-specific intents
INSERT INTO intents (name, description, color, qa_count) VALUES
('Greeting', 'Initial greetings and welcome messages', 'bg-green-500', 0),
('Symptom Check', 'Users describing symptoms or health complaints', 'bg-red-500', 0),
('Malaria Query', 'Questions about malaria, prevention, and treatment', 'bg-orange-500', 0),
('Cholera Query', 'Questions about cholera, ORS, and dehydration', 'bg-yellow-500', 0),
('Typhoid Query', 'Questions about typhoid fever', 'bg-amber-500', 0),
('COVID Query', 'Questions about COVID-19 and vaccinations', 'bg-purple-500', 0),
('Pregnancy Query', 'Maternal health, antenatal care, and pregnancy questions', 'bg-pink-500', 0),
('Child Health', 'Child health, immunization, and infant care', 'bg-blue-500', 0),
('Facility Query', 'Finding health facilities and clinics', 'bg-cyan-500', 0),
('Medication Query', 'Questions about medicines and dosages', 'bg-indigo-500', 0),
('Prevention Query', 'Disease prevention and health education', 'bg-teal-500', 0),
('Emergency', 'Emergency and urgent health situations', 'bg-red-700', 0),
('Escalation Request', 'User requesting to speak to health worker', 'bg-orange-700', 0),
('Health Alert Query', 'Questions about outbreaks and health campaigns', 'bg-rose-500', 0),
('General Health', 'General health, nutrition, and wellness questions', 'bg-emerald-500', 0),
('Unknown', 'Unrecognized or unclear messages', 'bg-gray-500', 0)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color;

-- Verify intents
SELECT name, description, qa_count FROM intents ORDER BY name;
