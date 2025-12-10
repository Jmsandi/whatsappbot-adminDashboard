-- Seed data for the WhatsApp Bot Admin Dashboard
-- Run this after 001_create_tables.sql

-- =============================================
-- SEED USERS
-- =============================================
INSERT INTO users (phone, name, status, tags, messages_count, last_active, created_at) VALUES
('+234 801 234 5678', 'John Doe', 'active', ARRAY['VIP'], 156, NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '30 days'),
('+234 802 345 6789', 'Jane Smith', 'active', ARRAY['Staff'], 89, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '25 days'),
('+234 803 456 7890', 'Mike Johnson', 'banned', ARRAY['Blacklist'], 234, NOW() - INTERVAL '2 days', NOW() - INTERVAL '45 days'),
('+234 804 567 8901', 'Sarah Wilson', 'active', ARRAY[]::TEXT[], 45, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '5 days'),
('+234 805 678 9012', 'Chris Brown', 'active', ARRAY['VIP', 'Staff'], 312, NOW() - INTERVAL '1 minute', NOW() - INTERVAL '60 days'),
('+234 806 789 0123', 'Emily Davis', 'inactive', ARRAY[]::TEXT[], 12, NOW() - INTERVAL '7 days', NOW() - INTERVAL '40 days'),
('+234 807 890 1234', 'David Lee', 'active', ARRAY['VIP'], 89, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '35 days'),
('+234 808 901 2345', 'Lisa Chen', 'active', ARRAY[]::TEXT[], 67, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '8 days')
ON CONFLICT (phone) DO NOTHING;

-- =============================================
-- SEED SPECIAL CONTACTS
-- =============================================
INSERT INTO special_contacts (name, phone, email, role, status) VALUES
('Dr. Sarah Adams', '+234 701 111 2222', 'sarah.adams@health.gov', 'Health Worker', 'active'),
('Chief John Okoro', '+234 702 222 3333', 'john.okoro@admin.gov', 'Admin', 'active'),
('Mary Thompson', '+234 703 333 4444', 'mary.thompson@support.com', 'Supervisor', 'active'),
('James Wilson', '+234 704 444 5555', 'james.wilson@support.com', 'Support', 'inactive')
ON CONFLICT (phone) DO NOTHING;

-- =============================================
-- SEED INTENTS
-- =============================================
INSERT INTO intents (name, description, color, qa_count) VALUES
('Greeting', 'Initial greetings and welcome messages', 'bg-chart-1', 12),
('FAQ', 'Frequently asked questions', 'bg-chart-2', 45),
('Support', 'Customer support requests', 'bg-chart-3', 23),
('Order', 'Order tracking and delivery', 'bg-chart-4', 18),
('Feedback', 'User feedback and complaints', 'bg-chart-5', 8)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEED TRAINING DATA
-- =============================================
INSERT INTO training_data (intent, question, answer, added_by, status) VALUES
('Greeting', 'Hello', 'Hi there! How can I help you today?', 'Admin John', 'active'),
('FAQ', 'What are your business hours?', 'Our business hours are 9 AM to 6 PM, Monday to Friday.', 'Admin Sarah', 'active'),
('Support', 'I need help with my order', 'I''d be happy to help you with your order. Could you please provide your order number?', 'Admin Mike', 'active'),
('Order', 'How do I track my delivery?', 'You can track your delivery using the tracking link sent to your email, or by providing your order number here.', 'Admin John', 'active'),
('Feedback', 'I want to make a complaint', 'I''m sorry to hear that. Please share the details of your complaint, and we''ll do our best to resolve it.', 'Admin Lisa', 'needs_review'),
('FAQ', 'Do you offer refunds?', 'Yes, we offer refunds within 30 days of purchase. Please contact our support team with your order details.', 'Admin Sarah', 'active');

-- =============================================
-- SEED CORRECTIONS
-- =============================================
INSERT INTO corrections (question, wrong_answer, correct_answer, reported_by, status) VALUES
('What''s your phone number?', 'Our phone number is 123-456-7890', 'Our phone number is +234 800 123 4567', '+234 801 234 5678', 'pending'),
('Where are you located?', 'We are located in New York', 'We are located in Lagos, Nigeria', '+234 802 345 6789', 'pending');

-- =============================================
-- SEED BOT SETTINGS
-- =============================================
INSERT INTO bot_settings (key, value, updated_by) VALUES
('welcome_message', 'Welcome to our WhatsApp Bot! How can I assist you today?', 'System'),
('fallback_message', 'I''m sorry, I didn''t understand that. Could you please rephrase your question?', 'System'),
('bot_name', 'AssistBot', 'System'),
('auto_reply_enabled', 'true', 'System'),
('business_hours_only', 'false', 'System'),
('language', 'en', 'System')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- SEED ADMINS
-- =============================================
INSERT INTO admins (name, email, role, status) VALUES
('John Administrator', 'john@admin.com', 'Super Admin', 'active'),
('Sarah Trainer', 'sarah@admin.com', 'Bot Trainer', 'active'),
('Mike Support', 'mike@admin.com', 'Support Admin', 'active'),
('Lisa Annotator', 'lisa@admin.com', 'Data Annotator', 'active')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- SEED BROADCASTS
-- =============================================
INSERT INTO broadcasts (title, message, target, target_count, status, delivered_count, read_count, created_by, scheduled_at) VALUES
('Holiday Greetings', 'Happy holidays from our team! We hope you have a wonderful celebration.', 'All Users', 12847, 'sent', 12500, 8900, 'Admin John', NOW() - INTERVAL '5 days'),
('New Feature Announcement', 'Exciting news! We''ve added new features to help you better. Check them out!', 'Active Users', 8234, 'scheduled', 0, 0, 'Admin Sarah', NOW() + INTERVAL '2 days'),
('VIP Exclusive Offer', 'As a VIP member, you get exclusive access to our new premium features!', 'VIP Only', 156, 'draft', 0, 0, 'Admin John', NULL);

-- =============================================
-- SEED SYSTEM LOGS
-- =============================================
INSERT INTO system_logs (action, action_type, admin_name, details) VALUES
('User banned: Mike Johnson', 'update', 'Admin John', '{"user_id": "3", "reason": "Spam messages"}'),
('Training data added: New FAQ', 'create', 'Admin Sarah', '{"intent": "FAQ", "question": "Do you offer refunds?"}'),
('Bot settings updated', 'settings', 'Admin John', '{"setting": "welcome_message", "old_value": "Hello!", "new_value": "Welcome to our WhatsApp Bot!"}'),
('Broadcast sent: Holiday Greetings', 'broadcast', 'Admin John', '{"broadcast_id": "1", "recipients": 12500}'),
('Admin login', 'login', 'Admin Sarah', '{"ip": "192.168.1.1"}'),
('User data exported', 'export', 'Admin Mike', '{"format": "CSV", "records": 500}');
