-- Automated Health Awareness Broadcast System - Database Schema
-- Creates tables for health topics, automated broadcasts, and user interactions

-- =============================================
-- HEALTH TOPICS TABLE (Content library)
-- =============================================
CREATE TABLE IF NOT EXISTS health_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  short_message TEXT NOT NULL,
  detailed_info TEXT NOT NULL,
  prevention_tips TEXT[] NOT NULL,
  icon_emoji TEXT DEFAULT '🏥',
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 1,
  times_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUTOMATED BROADCASTS TABLE (Scheduled sends)
-- =============================================
CREATE TABLE IF NOT EXISTS automated_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES health_topics(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  target_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BROADCAST INTERACTIONS TABLE (User engagement)
-- =============================================
CREATE TABLE IF NOT EXISTS broadcast_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES automated_broadcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('learn_more', 'prevention_tips', 'ask_question', 'share')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Update USERS table with subscription fields
-- =============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscribed_to_broadcasts BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_broadcast_received TIMESTAMPTZ;

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_health_topics_active ON health_topics(is_active);
CREATE INDEX IF NOT EXISTS idx_health_topics_category ON health_topics(category);
CREATE INDEX IF NOT EXISTS idx_automated_broadcasts_status ON automated_broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_automated_broadcasts_scheduled ON automated_broadcasts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_broadcast_interactions_type ON broadcast_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_users_subscribed ON users(subscribed_to_broadcasts);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE health_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all health_topics" ON health_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert health_topics" ON health_topics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update health_topics" ON health_topics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete health_topics" ON health_topics FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all automated_broadcasts" ON automated_broadcasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert automated_broadcasts" ON automated_broadcasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update automated_broadcasts" ON automated_broadcasts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete automated_broadcasts" ON automated_broadcasts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins can view all broadcast_interactions" ON broadcast_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert broadcast_interactions" ON broadcast_interactions FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- Function to auto-update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_health_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_health_topics_updated_at ON health_topics;
CREATE TRIGGER update_health_topics_updated_at
    BEFORE UPDATE ON health_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_health_topics_updated_at();

-- =============================================
-- SEED INITIAL HEALTH TOPICS
-- =============================================

INSERT INTO health_topics (title, category, short_message, detailed_info, prevention_tips, icon_emoji, priority) VALUES
(
  'Handwashing',
  'hygiene',
  'Good hygiene keeps you and your family safe! Wash your hands with soap before eating, after using the toilet, and whenever returning home. This simple habit protects you from many infections.',
  'Handwashing with soap is one of the most effective ways to prevent diseases. It removes germs that cause diarrhea, respiratory infections, and other illnesses. Clean hands save lives by stopping the spread of harmful bacteria and viruses from person to person and throughout communities.',
  ARRAY[
    'Wash hands before preparing or eating food',
    'Wash hands after using the toilet or changing diapers',
    'Wet hands with clean water, apply soap, and scrub for at least 20 seconds',
    'Clean under nails and between fingers thoroughly',
    'Rinse well with clean running water',
    'Dry hands with a clean towel or air dry'
  ],
  '🧼',
  5
),
(
  'Household Hygiene',
  'hygiene',
  'A clean home is a healthy home! Regular cleaning, proper ventilation, and pest control keep your family safe from diseases. Small daily habits make a big difference in preventing illness.',
  'Maintaining household hygiene prevents the spread of diseases and creates a healthy living environment. Regular cleaning removes dirt, germs, and pests that can cause illness. Good ventilation reduces indoor air pollution and prevents respiratory problems.',
  ARRAY[
    'Sweep and mop floors daily to remove dirt and germs',
    'Open windows daily for fresh air and ventilation',
    'Keep kitchen and bathroom areas clean and dry',
    'Store food in covered containers to prevent pests',
    'Remove standing water to prevent mosquito breeding',
    'Dispose of garbage properly in covered bins'
  ],
  '🏠',
  4
),
(
  'Safe Drinking Water',
  'water_safety',
  'Clean water is essential for good health! Boil water before drinking, store it in clean covered containers, and protect water sources from contamination. Safe water prevents many diseases.',
  'Unsafe water causes diarrhea, cholera, typhoid, and other waterborne diseases. Boiling water kills harmful germs. Proper storage prevents recontamination. Protecting water sources ensures long-term community health.',
  ARRAY[
    'Boil water for at least 1 minute before drinking',
    'Store boiled water in clean, covered containers',
    'Use clean cups to scoop water, never dip hands in storage containers',
    'Keep water storage containers off the ground',
    'Protect wells and springs from animal and human waste',
    'Wash water containers regularly with soap and clean water'
  ],
  '💧',
  5
),
(
  'Mosquito Bite Prevention',
  'vector_control',
  'Protect yourself from malaria and dengue! Sleep under treated mosquito nets, remove standing water, and use repellent. These simple steps can save your life.',
  'Mosquitoes spread deadly diseases like malaria, dengue, and yellow fever. Malaria is a leading cause of death in Sierra Leone. Prevention is easier and cheaper than treatment. Protecting yourself protects your whole community.',
  ARRAY[
    'Sleep under insecticide-treated mosquito nets every night',
    'Remove standing water where mosquitoes breed (old tires, containers, puddles)',
    'Wear long sleeves and pants during dawn and dusk',
    'Use mosquito repellent on exposed skin',
    'Keep windows and doors screened or closed',
    'Seek immediate treatment if you have fever with chills'
  ],
  '🦟',
  5
),
(
  'Food Safety',
  'food_safety',
  'Safe food handling prevents illness! Cook food thoroughly, keep raw and cooked foods separate, and store food properly. These practices protect your family from food poisoning.',
  'Foodborne illnesses cause diarrhea, vomiting, and can be life-threatening, especially for children. Proper cooking kills harmful bacteria. Good storage prevents contamination. Clean preparation areas stop cross-contamination.',
  ARRAY[
    'Wash hands before preparing food',
    'Cook meat, fish, and eggs thoroughly until no pink remains',
    'Keep raw and cooked foods separate using different utensils',
    'Store cooked food in covered containers in cool places',
    'Reheat leftover food until steaming hot before eating',
    'Wash fruits and vegetables with clean water before eating'
  ],
  '🍽️',
  4
),
(
  'Waste Management',
  'sanitation',
  'Proper waste disposal protects your community! Separate waste, dispose of it properly, and keep your surroundings clean. Good waste management prevents disease and pollution.',
  'Poor waste management attracts pests, contaminates water sources, and spreads diseases. Proper disposal protects the environment and public health. Community cleanliness benefits everyone.',
  ARRAY[
    'Separate organic waste (food scraps) from non-organic waste (plastic, metal)',
    'Use covered bins to prevent pests and odors',
    'Dispose of waste in designated collection points',
    'Never burn plastic or rubber as it releases toxic fumes',
    'Compost organic waste for gardening when possible',
    'Keep drainage channels clear of waste to prevent flooding'
  ],
  '🗑️',
  3
),
(
  'Respiratory Hygiene',
  'hygiene',
  'Cover your coughs and sneezes! Use a tissue or your elbow, wash hands frequently, and wear a mask when sick. Protect others from respiratory infections.',
  'Respiratory infections like flu, tuberculosis, and COVID-19 spread through droplets when we cough or sneeze. Simple hygiene practices can dramatically reduce transmission and protect vulnerable people.',
  ARRAY[
    'Cover mouth and nose with tissue when coughing or sneezing',
    'If no tissue, cough into your elbow, not your hands',
    'Dispose of used tissues immediately in a covered bin',
    'Wash hands with soap after coughing, sneezing, or blowing nose',
    'Wear a mask when you have cold or flu symptoms',
    'Maintain distance from others when sick'
  ],
  '😷',
  4
),
(
  'Sexual Health',
  'sexual_health',
  'Protect yourself and your partner! Use condoms correctly, get tested regularly, and communicate openly. Safe practices prevent STIs and unplanned pregnancies.',
  'Sexually transmitted infections (STIs) including HIV are preventable. Regular testing allows early treatment. Open communication with partners builds trust and safety. Knowledge empowers healthy choices.',
  ARRAY[
    'Use condoms correctly and consistently during sex',
    'Get tested for HIV and STIs regularly',
    'Limit number of sexual partners',
    'Communicate openly with partners about sexual health',
    'Seek medical care immediately if you notice unusual symptoms',
    'Know your HIV status and encourage partners to know theirs'
  ],
  '❤️',
  3
),
(
  'Mental Wellness',
  'mental_health',
  'Your mental health matters! Talk to someone you trust, practice self-care, and seek help when needed. Taking care of your mind is as important as caring for your body.',
  'Mental health affects how we think, feel, and act. Stress, anxiety, and depression are common but treatable. Seeking help is a sign of strength, not weakness. Everyone deserves mental wellness.',
  ARRAY[
    'Talk to trusted friends or family when feeling overwhelmed',
    'Practice daily relaxation through prayer, meditation, or deep breathing',
    'Get enough sleep (7-8 hours) and eat regular meals',
    'Stay physically active with walking or exercise',
    'Limit alcohol and avoid drugs',
    'Seek professional help if sadness or worry persists for weeks'
  ],
  '🧠',
  3
),
(
  'Immunization',
  'immunization',
  'Vaccines save lives! Ensure your children receive all recommended vaccines on schedule. Immunization protects against deadly diseases and builds community immunity.',
  'Vaccines prevent diseases like measles, polio, tetanus, and many others that once killed thousands of children. They are safe, effective, and free at health centers. Vaccinating your child protects them and helps protect others who cannot be vaccinated.',
  ARRAY[
    'Follow the national immunization schedule from birth',
    'Keep your child''s immunization card safe and bring it to every visit',
    'Visit the nearest health center for free vaccinations',
    'Complete all doses in the vaccine series for full protection',
    'Adults should get tetanus boosters every 10 years',
    'Pregnant women should receive recommended vaccines to protect baby'
  ],
  '💉',
  4
);
