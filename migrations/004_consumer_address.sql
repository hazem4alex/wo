-- Multi-address table per consumer (imported from address.csv)
CREATE TABLE IF NOT EXISTS consumer_address (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id       UUID NOT NULL REFERENCES consumer(id) ON DELETE CASCADE,
  governorate_id    UUID REFERENCES governorate(id),
  area_id           UUID REFERENCES area(id),
  office_id         UUID REFERENCES office(id),
  block_no          VARCHAR(50),       -- gada_num / block number
  town              VARCHAR(100),      -- town / quarter number
  street            VARCHAR(255),      -- street name or description
  house_no          VARCHAR(50),
  automated_figure  VARCHAR(50),       -- original meter figure from source system
  note              TEXT,
  is_default        BOOLEAN NOT NULL DEFAULT false,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consumer_address_consumer ON consumer_address(consumer_id);
