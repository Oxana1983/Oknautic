CREATE TABLE contact_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  phone      text,
  message    text        NOT NULL,
  status     text        NOT NULL DEFAULT 'new'
);

CREATE INDEX contact_messages_created_at_idx ON contact_messages (created_at DESC);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
CREATE POLICY "contact_messages_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);
