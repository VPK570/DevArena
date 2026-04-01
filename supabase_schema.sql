-- ============================================================
-- DevArena Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ──────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verdict_type AS ENUM ('pass', 'partial', 'fail');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── USERS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  elo_rating  INTEGER NOT NULL DEFAULT 1200,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── CHALLENGES TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenges (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT UNIQUE NOT NULL,
  title             TEXT NOT NULL,
  short_description TEXT,
  description       TEXT NOT NULL,
  difficulty        difficulty_level NOT NULL,
  test_cases        JSONB NOT NULL DEFAULT '[]',
  starter_code      TEXT,
  solution          TEXT,
  hints             JSONB DEFAULT '[]',
  constraints       JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUBMISSIONS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submissions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id   UUID NOT NULL REFERENCES public.challenges(id),
  code           TEXT NOT NULL,
  language       TEXT NOT NULL DEFAULT 'javascript',
  score          INTEGER CHECK (score >= 0 AND score <= 100),
  verdict        verdict_type,
  execution_time INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON public.submissions(challenge_id);

-- ─── DRAFTS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.drafts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  code         TEXT NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, challenge_id)
);

DROP TRIGGER IF EXISTS drafts_updated_at ON public.drafts;
CREATE TRIGGER drafts_updated_at
  BEFORE UPDATE ON public.drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- DROP ALL POLICIES FIRST TO RE-RUN SAFELY
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- RE-CREATE POLICIES
CREATE POLICY "Public profiles are viewable" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Challenges are public" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Submissions are public" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Users can insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own drafts" ON public.drafts USING (auth.uid() = user_id);

-- ─── TRIGGER: Auto-create user profile on sign-up ────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED INITIAL DATA (All Static Challenges)
INSERT INTO public.challenges (slug, title, short_description, description, difficulty, starter_code, hints, constraints) VALUES
(
  'counter-button', 
  'Interactive Counter', 
  'Build a standard interactive counter using React hooks.',
  '### Task: Simple React Counter\n\nCreate a functional counter button using React''s useState hook. The button should display the current count and increment by 1 each time it is clicked.\n\n### Requirements:\n1. Initialize count at 0\n2. Update the button text to show: "Current Count: {count}"\n3. The count must increment by exactly 1 per click', 
  'easy', 
  'import React, { useState } from ''react'';\n\n/**\n * Task: Implement a counter that increments on click.\n * Use React.useState().\n */\nexport default function Counter() {\n    // WRITE YOUR CODE HERE\n    return (\n        <button id="counter-btn" style={{ padding: ''12px 24px'', borderRadius: ''8px'', background: ''#4F46E5'', color: ''white'', border: ''none'', cursor: ''pointer'' }}>\n            Count: 0\n        </button>\n    );\n}',
  '["Import { useState } from ''react''", "Call useState(0) to initialize state", "Add an onClick handler to the button"]',
  '["Must use React hooks", "Must be functional component", "Should not use external libraries for state"]'
),
(
  'todo-list', 
  'Dynamic Todo List', 
  'Implement a list where users can add and remove items dynamically.',
  '### Task: Dynamic Todo List\n\nBuild a basic Todo list application where users can input text into a field and add it to a list. Each item should have a "Delete" button that removes it from the list.\n\n### Requirements:\n1. Controlled input field for new tasks\n2. "Add" button to append task to list\n3. Map over tasks to render them\n4. Remove individual tasks via a delete button',
  'medium', 
  'import React, { useState } from ''react'';\n\nexport default function TodoList() {\n    const [tasks, setTasks] = useState([]);\n    const [inputValue, setInputValue] = useState('''');\n\n    const addTask = () => {\n        if (!inputValue) return;\n        setTasks([...tasks, inputValue]);\n        setInputValue('''');\n    };\n\n    const removeTask = (index) => {\n        setTasks(tasks.filter((_, idx) => idx !== index));\n    };\n\n    return (\n        <div style={{ padding: ''20px'' }}>\n            <input \n                value={inputValue} \n                onChange={(e) => setInputValue(e.target.value)}\n                style={{ background: ''#333'', color: ''#fff'', border: ''1px solid #555'', padding: ''8px'' }}\n            />\n            <button onClick={addTask} style={{ marginLeft: ''10px'' }}>Add</button>\n            <ul>\n                {tasks.map((task, i) => (\n                    <li key={i}>\n                        {task} <button onClick={() => removeTask(i)}>X</button>\n                    </li>\n                ))}\n            </ul>\n        </div>\n    );\n}',
  '["Use an array for state", "Use .filter() for removal", "Prevent adding empty strings"]',
  '["Items must be unique-ish (index is fine for basic)", "State must be handled in React"]'
),
(
  'css-layout-ninja', 
  'CSS Layout Ninja', 
  'Replicate a complex grid-based dashboard layout using pure CSS.',
  '### Task: Grid-Based Dashboard\n\nYour task is to create a responsive dashboard layout using CSS Grid and Flexbox. \n\n### Requirements:\n1. A sidebar that takes 25% width on desktop and hides on mobile.\n2. A main content area with at least 4 cards.\n3. A header that sticks to the top.\n4. Use Tailwind CSS classes if possible, or inline styles for this sandbox.',
  'hard', 
  'import React from ''react'';\n\nexport default function Dashboard() {\n    return (\n        <div style={{ display: ''grid'', gridTemplateColumns: ''250px 1fr'', height: ''100vh'', background: ''#0f172a'' }}>\n            <aside style={{ background: ''#1e293b'', borderRight: ''1px solid #334155'', padding: ''16px'' }}>\n                <h3 style={{ color: ''#94a3b8'' }}>Sidebar</h3>\n            </aside>\n            <main style={{ padding: ''24px'' }}>\n                <header style={{ marginBottom: ''24px'', display: ''flex'', justifyContent: ''space-between'' }}>\n                    <h1 style={{ color: ''#fff'' }}>Overview</h1>\n                    <div style={{ display: ''flex'', gap: ''8px'' }}>\n                        <div style={{ width: ''32px'', height: ''32px'', borderRadius: ''50%'', background: ''#4F46E5'' }}></div>\n                    </div>\n                </header>\n                <div style={{ display: ''grid'', gridTemplateColumns: ''repeat(auto-fill, minmax(200px, 1fr))'', gap: ''16px'' }}>\n                   {/* Add your cards here */}\n                   <div style={{ background: ''#1e293b'', padding: ''20px'', borderRadius: ''12px'', border: ''1px solid #334155'', color: ''#fff'' }}>\n                        Card 1\n                   </div>\n                </div>\n            </main>\n        </div>\n    );\n}',
  '["Use display: grid", "Use media queries via @media or responsive utilities"]',
  '["Must be responsive", "No external grid libraries"]'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  starter_code = EXCLUDED.starter_code,
  hints = EXCLUDED.hints,
  constraints = EXCLUDED.constraints;
