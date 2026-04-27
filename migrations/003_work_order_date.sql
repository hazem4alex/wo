-- Add a separate order_date field (the date on the document, may differ from created_at)
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE;
