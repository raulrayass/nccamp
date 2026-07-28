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

-- Verify the changes
SELECT table_name, column_name FROM information_schema.columns 
WHERE table_name IN ('transactions', 'attendee_payments', 'teams') 
AND column_name IN ('paymentMethod', 'country');
