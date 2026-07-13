CREATE TABLE insurance_leads (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               timestamptz NOT NULL DEFAULT now(),
  user_id                  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Контакт
  full_name                text        NOT NULL,
  email                    text        NOT NULL,
  phone                    text,
  preferred_language       text,

  -- Судно
  vessel_type              text,          -- motor/sailing/catamaran/rib/other
  brand                    text,
  model                    text,
  year_built               int,
  length_m                 numeric,
  hull_material            text,          -- grp/aluminium/steel/wood/other
  vessel_value_eur         numeric        NOT NULL,
  flag_country             text,

  -- Эксплуатация
  navigation_area          text,          -- adriatic/mediterranean/worldwide
  home_port                text,
  usage_type               text,          -- private/charter/commercial
  season                   text,          -- year_round/seasonal

  -- Опыт
  skipper_experience_years int,
  has_license              boolean,
  claims_last_5_years      boolean,
  claims_details           text,

  -- Покрытие
  coverage_types           text[],
  deductible_preference    text,
  current_insurer          text,
  policy_renewal_date      date,

  comment                  text,
  status                   text        NOT NULL DEFAULT 'new',
  admin_notes              text
);

CREATE INDEX insurance_leads_status_idx     ON insurance_leads (status);
CREATE INDEX insurance_leads_created_at_idx ON insurance_leads (created_at DESC);

ALTER TABLE insurance_leads ENABLE ROW LEVEL SECURITY;

-- Анонимные и авторизованные могут создавать заявки
CREATE POLICY "insurance_leads_insert" ON insurance_leads
  FOR INSERT WITH CHECK (true);

-- Авторизованный пользователь видит только свои заявки
CREATE POLICY "insurance_leads_select_own" ON insurance_leads
  FOR SELECT USING (auth.uid() = user_id);
