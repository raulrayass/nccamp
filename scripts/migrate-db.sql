-- Add paymentMethod column to transactions table if it doesn't exist
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS paymentMethod text DEFAULT 'cash';

-- Add paymentMethod column to attendee_payments table if it doesn't exist
ALTER TABLE attendee_payments
ADD COLUMN IF NOT EXISTS paymentMethod text DEFAULT 'cash';

-- Update all existing records to have 'cash' as default if NULL
UPDATE transactions SET paymentMethod = 'cash' WHERE paymentMethod IS NULL;
UPDATE attendee_payments SET paymentMethod = 'cash' WHERE paymentMethod IS NULL;

-- Add country column to teams table if it doesn't exist
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS country text;

-- Fase A: Create events table (multi-event support)
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  location TEXT,
  isDefault BOOLEAN NOT NULL DEFAULT false,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Fase A: Create event_members table for event access control
CREATE TABLE IF NOT EXISTS event_members (
  id SERIAL PRIMARY KEY,
  eventId INTEGER NOT NULL,
  userId TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Fase B: Add eventId column to attendees table (nullable for multi-event support)
ALTER TABLE attendees
ADD COLUMN IF NOT EXISTS eventId integer;

-- Fase B: Add eventId column to teams table (nullable for multi-event support)
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS eventId integer;

-- Fase B: Add eventId column to games table (nullable for multi-event support)
ALTER TABLE games
ADD COLUMN IF NOT EXISTS eventId integer;

-- Fase B: Add eventId column to game_scores table (nullable for multi-event support)
ALTER TABLE game_scores
ADD COLUMN IF NOT EXISTS eventId integer;

-- Verify the changes
SELECT table_name, column_name FROM information_schema.columns 
WHERE table_name IN ('transactions', 'attendee_payments', 'teams', 'attendees', 'events', 'event_members') 
AND column_name IN ('paymentMethod', 'country', 'eventId', 'isDefault', 'role');
