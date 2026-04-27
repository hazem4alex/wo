-- service_id on work_order is a legacy field; services are stored in work_order_item
ALTER TABLE work_order ALTER COLUMN service_id DROP NOT NULL;
