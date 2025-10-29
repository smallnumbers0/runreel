-- Create NextAuth tables for Supabase Adapter
-- Based on: https://authjs.dev/reference/adapter/supabase

-- Users table (if not using Supabase Auth)
CREATE TABLE IF NOT EXISTS next_auth_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE,
  name text,
  image text,
  email_verified timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Accounts table
CREATE TABLE IF NOT EXISTS next_auth_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(provider, provider_account_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS next_auth_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires timestamp NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS next_auth_verification_tokens (
  identifier text NOT NULL,
  token text NOT NULL,
  expires timestamp NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_next_auth_accounts_user_id ON next_auth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_next_auth_sessions_user_id ON next_auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_next_auth_sessions_session_token ON next_auth_sessions(session_token);

-- Enable RLS
ALTER TABLE next_auth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for next_auth_accounts
CREATE POLICY "Users can view their own accounts" ON next_auth_accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for next_auth_sessions
CREATE POLICY "Users can view their own sessions" ON next_auth_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow public access for verification tokens (needed for auth flow)
CREATE POLICY "Public access for verification tokens" ON next_auth_verification_tokens
  FOR ALL USING (true);