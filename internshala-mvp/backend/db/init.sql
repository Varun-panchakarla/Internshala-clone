-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'candidate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (one-to-one with users)
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  profile_photo TEXT,
  college VARCHAR(255),
  degree VARCHAR(255),
  skills TEXT[] DEFAULT '{}',
  experience VARCHAR(50) DEFAULT 'Fresher',
  preferred_role VARCHAR(255),
  preferred_location VARCHAR(255),
  employment_type VARCHAR(50) DEFAULT 'Full-time',
  resume_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  company VARCHAR(255) NOT NULL,
  company_logo VARCHAR(500) DEFAULT '',
  logo_color VARCHAR(50),
  logo_text VARCHAR(10),
  location VARCHAR(255),
  salary VARCHAR(100),
  experience VARCHAR(50),
  employment_type VARCHAR(50),
  skills TEXT[] DEFAULT '{}',
  description TEXT,
  responsibilities JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  posted_at VARCHAR(100),
  duration VARCHAR(50),
  match_score INTEGER DEFAULT 0,
  source VARCHAR(50),
  redirect_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved jobs (many-to-many: users <-> jobs)
CREATE TABLE IF NOT EXISTS saved_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  job_id VARCHAR(100) REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Applied jobs (many-to-many: users <-> jobs)
CREATE TABLE IF NOT EXISTS applied_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  job_id VARCHAR(100) REFERENCES jobs(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'Pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Indexes for job search performance
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_jobs_experience ON jobs(experience);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);

-- Indexes for user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_applied_jobs_user ON applied_jobs(user_id);

-- Issue reports table
CREATE TABLE IF NOT EXISTS issue_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contact_number VARCHAR(100),
  category VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  screenshot TEXT,
  status VARCHAR(50) DEFAULT 'Open',
  priority VARCHAR(50) DEFAULT 'Normal',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for issue reports user lookup
CREATE INDEX IF NOT EXISTS idx_issue_reports_user ON issue_reports(user_id);

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);

-- Resume templates table
CREATE TABLE IF NOT EXISTS resume_templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_ats BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  is_best_ats BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]'::jsonb,
  accent VARCHAR(7) DEFAULT '#1e293b',
  preview JSONB NOT NULL,
  thumbnail TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Prepopulate default templates
INSERT INTO resume_templates (id, name, description, category, is_ats, is_popular, is_trending, is_best_ats, tags, accent, preview, is_enabled)
VALUES
('professional', 'Professional', 'Classic and timeless layout. Ideal for corporate, finance, and senior roles.', 'Classic', true, true, false, false, $$["ATS Friendly", "Popular"]$$::jsonb, '#1e293b', $${"headerBg": "#ffffff", "headerColor": "#0d0d0d", "accentBar": "#0d0d0d", "bodyFont": "\"Times New Roman\", Times, serif", "sectionColor": "#0d0d0d", "chipBg": "#f4f4f4", "chipBd": "#c8c8c8"}$$, true),
('modern', 'Modern', 'Clean sans-serif with a vibrant blue accent. Perfect for tech and product roles.', 'Modern', true, false, true, false, $$["ATS Friendly", "Trending"]$$::jsonb, '#2563eb', $${"headerBg": "#1e40af", "headerColor": "#ffffff", "accentBar": "#2563eb", "bodyFont": "\"Arial\", sans-serif", "sectionColor": "#1e40af", "chipBg": "#dbeafe", "chipBd": "#93c5fd"}$$, true),
('minimal', 'Minimal', 'Ultra-clean with lots of whitespace. Lets your content breathe and stand out.', 'Minimal', true, false, false, false, $$["ATS Friendly", "Clean"]$$::jsonb, '#64748b', $${"headerBg": "#ffffff", "headerColor": "#0f172a", "accentBar": "#e2e8f0", "bodyFont": "\"Inter\", Arial, sans-serif", "sectionColor": "#475569", "chipBg": "#f8fafc", "chipBd": "#e2e8f0"}$$, true),
('executive', 'Executive', 'Bold dark header strip. Commands authority. Best for senior and C-suite roles.', 'Executive', true, false, false, false, $$["Premium", "ATS Friendly"]$$::jsonb, '#0f172a', $${"headerBg": "#0f172a", "headerColor": "#ffffff", "accentBar": "#f59e0b", "bodyFont": "\"Georgia\", serif", "sectionColor": "#0f172a", "chipBg": "#fef3c7", "chipBd": "#fcd34d"}$$, true),
('creative', 'Creative', 'Two-column layout with a colored sidebar. Stands out for creative and design roles.', 'Creative', false, false, false, false, $$["Visual", "Unique"]$$::jsonb, '#7c3aed', $${"headerBg": "#7c3aed", "headerColor": "#ffffff", "accentBar": "#7c3aed", "bodyFont": "\"Arial\", sans-serif", "sectionColor": "#7c3aed", "chipBg": "#ede9fe", "chipBd": "#c4b5fd"}$$, true),
('fresher', 'Fresher', 'Highlights education and projects. Designed for fresh graduates and students.', 'Entry Level', true, false, false, false, $$["ATS Friendly", "Entry Level"]$$::jsonb, '#059669', $${"headerBg": "#ecfdf5", "headerColor": "#064e3b", "accentBar": "#059669", "bodyFont": "\"Arial\", sans-serif", "sectionColor": "#059669", "chipBg": "#d1fae5", "chipBd": "#6ee7b7"}$$, true),
('simple-ats', 'Simple ATS', 'Maximum ATS compatibility. Pure text, no formatting issues — guaranteed to parse.', 'ATS Optimized', true, false, false, true, $$["Best ATS Score", "Safe"]$$::jsonb, '#374151', $${"headerBg": "#ffffff", "headerColor": "#111827", "accentBar": "#9ca3af", "bodyFont": "\"Arial\", sans-serif", "sectionColor": "#111827", "chipBg": "#ffffff", "chipBd": "#9ca3af"}$$, true),
('corporate', 'Corporate', 'Professional header gradient with structured layout. Great for banking and consulting.', 'Corporate', true, false, false, false, $$["ATS Friendly", "Structured"]$$::jsonb, '#0369a1', $${"headerBg": "#0369a1", "headerColor": "#ffffff", "accentBar": "#0369a1", "bodyFont": "\"Arial\", sans-serif", "sectionColor": "#0369a1", "chipBg": "#e0f2fe", "chipBd": "#7dd3fc"}$$, true)
ON CONFLICT (id) DO NOTHING;
