-- Store the phone number used on a work order so it can be edited per order
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS consumer_phone VARCHAR(50);

-- Meter readings should be optional; do not force empty old readings to 0.000
ALTER TABLE work_order ALTER COLUMN electricity_old_reading DROP DEFAULT;
ALTER TABLE work_order ALTER COLUMN electricity_old_reading DROP NOT NULL;
ALTER TABLE work_order ALTER COLUMN water_old_reading DROP DEFAULT;
ALTER TABLE work_order ALTER COLUMN water_old_reading DROP NOT NULL;
