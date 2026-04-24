-- Add fine amount and service code for reporting
ALTER TABLE work_order_item ADD COLUMN IF NOT EXISTS fine_amount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE work_order_item ADD COLUMN IF NOT EXISTS service_code VARCHAR(50);
