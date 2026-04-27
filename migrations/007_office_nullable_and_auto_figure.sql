-- Office is optional on work orders; automated_figure stored on work_order itself
ALTER TABLE work_order ALTER COLUMN office_id DROP NOT NULL;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS automated_figure VARCHAR(50);
