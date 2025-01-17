/*
  # Initial Schema Setup for Ideas Management System

  1. Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - full_name (text)
      - avatar_url (text, optional)
      - department (text)
      - role (text)
    - ideas
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - category (text)
      - status (text)
      - votes (integer)
      - user_id (uuid, foreign key)
    - comments
      - id (uuid, primary key)
      - content (text)
      - user_id (uuid, foreign key)
      - idea_id (uuid, foreign key)
    - attachments
      - id (uuid, primary key)
      - file_name (text)
      - file_url (text)
      - file_type (text)
      - idea_id (uuid, foreign key)
    - votes
      - id (uuid, primary key)
      - idea_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - type (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  department text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ideas table
CREATE TABLE ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  votes integer DEFAULT 0,
  user_id uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  idea_id uuid REFERENCES ideas(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attachments table
CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  idea_id uuid REFERENCES ideas(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES ideas(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(idea_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can read ideas"
  ON ideas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ideas"
  ON ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
  ON ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read attachments"
  ON attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create attachments"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM ideas
    WHERE id = idea_id AND user_id = auth.uid()
  ));

CREATE POLICY "Anyone can read votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function to update idea votes count
CREATE OR REPLACE FUNCTION update_idea_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ideas
  SET votes = (
    SELECT COUNT(CASE WHEN type = 'up' THEN 1 END) - COUNT(CASE WHEN type = 'down' THEN 1 END)
    FROM votes
    WHERE idea_id = NEW.idea_id
  )
  WHERE id = NEW.idea_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_idea_votes_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_idea_votes();
