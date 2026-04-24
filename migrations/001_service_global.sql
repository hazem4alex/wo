-- Make services global (remove office scoping)
ALTER TABLE service DROP CONSTRAINT IF EXISTS service_office_id_fkey;
ALTER TABLE service DROP COLUMN IF EXISTS office_id;

-- Add dynamic meter field flags
ALTER TABLE service ADD COLUMN IF NOT EXISTS require_electricity_meter BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE service ADD COLUMN IF NOT EXISTS require_water_meter BOOLEAN NOT NULL DEFAULT false;
