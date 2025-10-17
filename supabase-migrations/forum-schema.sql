-- Forum Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create forum_categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '💬',
  color TEXT DEFAULT 'blue',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE
);

-- 2. Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for forum_categories

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON forum_categories
  FOR SELECT USING (is_active = TRUE);

-- Admin can insert categories
CREATE POLICY "Admin can insert categories" ON forum_categories
  FOR INSERT WITH CHECK (
    auth.uid() = '5bc2da58-8e69-4779-ba02-52e6182b9668'::uuid
  );

-- Admin can update categories
CREATE POLICY "Admin can update categories" ON forum_categories
  FOR UPDATE USING (
    auth.uid() = '5bc2da58-8e69-4779-ba02-52e6182b9668'::uuid
  );

-- Admin can delete categories
CREATE POLICY "Admin can delete categories" ON forum_categories
  FOR DELETE USING (
    auth.uid() = '5bc2da58-8e69-4779-ba02-52e6182b9668'::uuid
  );

-- 6. RLS Policies for forum_topics

-- Anyone can view topics
CREATE POLICY "Anyone can view topics" ON forum_topics
  FOR SELECT USING (true);

-- Authenticated users can create topics
CREATE POLICY "Authenticated users can create topics" ON forum_topics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own topics
CREATE POLICY "Users can update their own topics" ON forum_topics
  FOR UPDATE USING (author_id = auth.uid());

-- Users can delete their own topics OR admin can delete any
CREATE POLICY "Users or admin can delete topics" ON forum_topics
  FOR DELETE USING (
    author_id = auth.uid() 
    OR auth.uid() = '5bc2da58-8e69-4779-ba02-52e6182b9668'::uuid
  );

-- 7. RLS Policies for forum_replies

-- Anyone can view replies
CREATE POLICY "Anyone can view replies" ON forum_replies
  FOR SELECT USING (true);

-- Authenticated users can create replies
CREATE POLICY "Authenticated users can create replies" ON forum_replies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own replies
CREATE POLICY "Users can update their own replies" ON forum_replies
  FOR UPDATE USING (author_id = auth.uid());

-- Users can delete their own replies OR admin can delete any
CREATE POLICY "Users or admin can delete replies" ON forum_replies
  FOR DELETE USING (
    author_id = auth.uid() 
    OR auth.uid() = '5bc2da58-8e69-4779-ba02-52e6182b9668'::uuid
  );

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_categories_display_order ON forum_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_activity ON forum_topics(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at DESC);

-- 9. Create function to update topic reply count and last activity
CREATE OR REPLACE FUNCTION update_topic_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics 
    SET 
      replies_count = replies_count + 1,
      last_activity_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics 
    SET 
      replies_count = GREATEST(replies_count - 1, 0),
      updated_at = NOW()
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for topic stats
DROP TRIGGER IF EXISTS trigger_update_topic_stats ON forum_replies;
CREATE TRIGGER trigger_update_topic_stats
AFTER INSERT OR DELETE ON forum_replies
FOR EACH ROW EXECUTE FUNCTION update_topic_stats();

-- 11. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_forum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_update_topics_updated_at ON forum_topics;
CREATE TRIGGER trigger_update_topics_updated_at
BEFORE UPDATE ON forum_topics
FOR EACH ROW EXECUTE FUNCTION update_forum_updated_at();

DROP TRIGGER IF EXISTS trigger_update_replies_updated_at ON forum_replies;
CREATE TRIGGER trigger_update_replies_updated_at
BEFORE UPDATE ON forum_replies
FOR EACH ROW EXECUTE FUNCTION update_forum_updated_at();

-- Function to increment topic view count
CREATE OR REPLACE FUNCTION increment_topic_views(topic_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE forum_topics
  SET views_count = views_count + 1
  WHERE id = topic_id;
END;
$$;

-- 13. Insert default categories
INSERT INTO forum_categories (name, description, icon, color, display_order, created_by) VALUES
  ('General Discussion', 'Chat about wheelchair racing and related topics', '💬', 'blue', 1, '5bc2da58-8e69-4779-ba02-52e6182b9668'),
  ('Training & Technique', 'Share training tips and discuss racing techniques', '🏃‍♂️', 'green', 2, '5bc2da58-8e69-4779-ba02-52e6182b9668'),
  ('Equipment & Gear', 'Discuss racing wheelchairs, gear, and equipment reviews', '⚙️', 'purple', 3, '5bc2da58-8e69-4779-ba02-52e6182b9668'),
  ('Events & Races', 'Share information about upcoming races and events', '🏁', 'red', 4, '5bc2da58-8e69-4779-ba02-52e6182b9668')
ON CONFLICT (name) DO NOTHING;

-- 14. Insert sample topics (2 per category)
-- Get category IDs
DO $$
DECLARE
  general_id UUID;
  training_id UUID;
  equipment_id UUID;
  events_id UUID;
  admin_id UUID := '5bc2da58-8e69-4779-ba02-52e6182b9668';
BEGIN
  SELECT id INTO general_id FROM forum_categories WHERE name = 'General Discussion';
  SELECT id INTO training_id FROM forum_categories WHERE name = 'Training & Technique';
  SELECT id INTO equipment_id FROM forum_categories WHERE name = 'Equipment & Gear';
  SELECT id INTO events_id FROM forum_categories WHERE name = 'Events & Races';

  -- General Discussion topics
  INSERT INTO forum_topics (category_id, title, content, author_id, author_name) VALUES
    (general_id, 'Welcome to the Wheelchair Racer Forum!', 
     E'Hello everyone!\n\nWelcome to our brand new community forum! This is a space for wheelchair racers of all levels to connect, share experiences, and support each other.\n\nFeel free to introduce yourself, ask questions, and share your journey. Let''s build a strong and supportive community together!\n\nHappy racing! 🏁', 
     admin_id, 'Admin'),
    (general_id, 'Looking for training partners in my area', 
     E'Hi all,\n\nI''m based in Manchester and looking for training partners for weekend sessions. I usually train early mornings (6-8am) on Saturdays.\n\nAnyone interested? Would love to have some company and push each other!\n\nCheers!', 
     admin_id, 'SpeedyAnna');

  -- Training & Technique topics
  INSERT INTO forum_topics (category_id, title, content, author_id, author_name) VALUES
    (training_id, 'Best training schedule for marathon preparation?', 
     E'I''m planning to compete in my first wheelchair marathon in 6 months. What would you recommend for a training schedule?\n\nCurrently, I can comfortably do 10k, but need to build up endurance. Any tips on balancing speed work and long distance training?\n\nThanks in advance!', 
     admin_id, 'RacerMike92'),
    (training_id, 'Proper hand positioning for maximum power', 
     E'I''ve been racing for about a year now, and I''m working on improving my technique. Specifically, I''m curious about optimal hand positioning on the wheels for generating maximum power during pushes.\n\nDoes anyone have tips or resources they could share? Are there specific drills that helped you improve?\n\nAppreciate any guidance!', 
     admin_id, 'TechniqueSeeker');

  -- Equipment & Gear topics
  INSERT INTO forum_topics (category_id, title, content, author_id, author_name) VALUES
    (equipment_id, 'Racing wheelchair maintenance tips', 
     E'What are your essential maintenance routines for keeping your racing chair in top condition?\n\nI want to make sure I''m taking proper care of my equipment. Things like:\n- How often to check wheel alignment\n- Best way to clean bearings\n- When to replace tires\n\nWhat''s your routine? Thanks!', 
     admin_id, 'TechGuru'),
    (equipment_id, 'Recommendations for first racing wheelchair', 
     E'I''ve been using a day chair for local 5k races but want to invest in my first proper racing chair. Budget is around £2000-3000.\n\nWhat brands and models would you recommend for someone just getting serious about the sport? New or used?\n\nAny advice would be greatly appreciated!', 
     admin_id, 'NewbiRacer');

  -- Events & Races topics
  INSERT INTO forum_topics (category_id, title, content, author_id, author_name) VALUES
    (events_id, 'Boston Marathon 2026 - Who''s planning to participate?', 
     E'Boston Marathon registration is coming up! Who else is planning to compete in 2026?\n\nWould love to connect with others who are training for it. Maybe we could share training tips and meet up at the event!\n\nThis will be my third Boston - absolutely love the course and atmosphere. Can''t wait!', 
     admin_id, 'MarathonDreamer'),
    (events_id, 'Local wheelchair racing events in the UK', 
     E'I''m compiling a list of wheelchair racing events across the UK for 2026. Here''s what I have so far:\n\n- London Marathon (April)\n- Great North Run (September)\n- Various parkrun events\n\nWhat other events should be on this list? Let''s create a comprehensive calendar for the community!\n\nPlease share any events you know about!', 
     admin_id, 'EventTracker');
END $$;

-- 15. Insert sample replies (1-2 per topic)
DO $$
DECLARE
  welcome_topic_id UUID;
  partners_topic_id UUID;
  marathon_topic_id UUID;
  technique_topic_id UUID;
  maintenance_topic_id UUID;
  first_chair_topic_id UUID;
  boston_topic_id UUID;
  uk_events_topic_id UUID;
  admin_id UUID := '5bc2da58-8e69-4779-ba02-52e6182b9668';
BEGIN
  SELECT id INTO welcome_topic_id FROM forum_topics WHERE title = 'Welcome to the Wheelchair Racer Forum!';
  SELECT id INTO partners_topic_id FROM forum_topics WHERE title = 'Looking for training partners in my area';
  SELECT id INTO marathon_topic_id FROM forum_topics WHERE title = 'Best training schedule for marathon preparation?';
  SELECT id INTO technique_topic_id FROM forum_topics WHERE title = 'Proper hand positioning for maximum power';
  SELECT id INTO maintenance_topic_id FROM forum_topics WHERE title = 'Racing wheelchair maintenance tips';
  SELECT id INTO first_chair_topic_id FROM forum_topics WHERE title = 'Recommendations for first racing wheelchair';
  SELECT id INTO boston_topic_id FROM forum_topics WHERE title = 'Boston Marathon 2026 - Who''s planning to participate?';
  SELECT id INTO uk_events_topic_id FROM forum_topics WHERE title = 'Local wheelchair racing events in the UK';

  -- Replies for welcome topic
  INSERT INTO forum_replies (topic_id, content, author_id, author_name) VALUES
    (welcome_topic_id, 'Thanks for setting this up! Excited to be part of the community. Looking forward to learning from everyone here!', admin_id, 'JohnSpeed'),
    (welcome_topic_id, 'Great to have a dedicated forum for wheelchair racers. This is exactly what the community needed!', admin_id, 'RacerSarah');

  -- Reply for partners topic
  INSERT INTO forum_replies (topic_id, content, author_id, author_name) VALUES
    (partners_topic_id, 'I''m in Salford and could potentially join you on Saturdays! Sent you a DM.', admin_id, 'ManchesterMike');

  -- Replies for marathon topic
  INSERT INTO forum_replies (topic_id, content, author_id, author_name) VALUES
    (marathon_topic_id, 'I''d recommend a 16-week program. Start with building base mileage, then add in tempo runs and intervals. Long runs on weekends are crucial!', admin_id, 'CoachEmily'),
    (marathon_topic_id, 'Don''t forget rest days! They''re just as important as training days. Good luck with your first marathon!', admin_id, 'VeteranRacer');

  -- Reply for technique topic
  INSERT INTO forum_replies (topic_id, content, author_id, author_name) VALUES
    (technique_topic_id, 'Hand position is crucial! I find that gripping closer to 12 o''clock gives me better power transfer. Experiment and see what works for you.', admin_id, 'TechniquePro');

  -- Replies for maintenance topic
  INSERT INTO forum_replies (topic_id, content, author_id, author_name) VALUES
    (maintenance_topic_id, 'I clean my bearings every month and check wheel alignment before every race. Makes a huge difference!', admin_id, 'MechHead'),
    (maintenance_topic_id, 'Great topic! I also recommend keeping your chair in a cool, dry place when not in use.', admin_id, 'CareTaker');

  -- Reply for first chair topic
  INSERT INTO forum_replies (topic_id, content, author_id, author_name) VALUES
    (first_chair_topic_id, 'Top End and Colours are both excellent brands in that price range. I''d recommend trying before buying if possible!', admin_id, 'EquipmentExpert');

  -- Replies for Boston topic
  INSERT INTO forum_replies (topic_id, content, author_id, author_name) VALUES
    (boston_topic_id, 'I''m in! Will be my first Boston. Any tips for a first-timer?', admin_id, 'BostonBound'),
    (boston_topic_id, 'Count me in too! Let''s plan a meetup the day before the race!', admin_id, 'MarathonMike');

  -- Reply for UK events topic
  INSERT INTO forum_replies (topic_id, content, author_id, author_name) VALUES
    (uk_events_topic_id, 'Don''t forget the Birmingham 10k and Manchester Marathon! Both great events.', admin_id, 'UKRacer');
END $$;
