
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS employee_id text;

-- Create avatar bucket if not exists (User needs to do this in UI usually, but SQL can trigger it if extensions enabled, otherwise just instruction)
-- For now just the column.
