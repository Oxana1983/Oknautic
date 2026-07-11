-- Tracks which incoming requests each seller has opened (per-request read status)
CREATE TABLE IF NOT EXISTS seller_request_reads (
  seller_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE CASCADE,
  PRIMARY KEY (seller_id, quote_request_id)
);

ALTER TABLE seller_request_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller can manage own reads"
  ON seller_request_reads FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);
