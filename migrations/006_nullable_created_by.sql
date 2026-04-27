-- created_by is a soft audit field; make nullable to survive session/user mismatches
ALTER TABLE work_order ALTER COLUMN created_by DROP NOT NULL;
