-- ============================================================
-- OKnautic — Migration 011: Product i18n (JSONB translations)
-- ============================================================

-- Add translation columns to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name_i18n        jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description_i18n jsonb NOT NULL DEFAULT '{}';

-- GIN indexes for fast JSONB lookup
CREATE INDEX IF NOT EXISTS products_name_i18n_gin ON public.products USING GIN (name_i18n);
CREATE INDEX IF NOT EXISTS products_desc_i18n_gin ON public.products USING GIN (description_i18n);

-- pg_trgm indexes for ILIKE search on extracted locale values
-- (used for locale-aware search: name_i18n->>'ru' ILIKE '%query%')
CREATE INDEX IF NOT EXISTS products_name_i18n_ru_trgm
  ON public.products USING GIN ((name_i18n->>'ru') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS products_name_i18n_en_trgm
  ON public.products USING GIN ((name_i18n->>'en') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS products_name_i18n_it_trgm
  ON public.products USING GIN ((name_i18n->>'it') gin_trgm_ops);
