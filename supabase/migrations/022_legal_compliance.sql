-- ============================================================
-- OKnautic — Migration 022: Legal Compliance
-- ============================================================
-- Changes:
--   1. profiles      — add marketing_consent, terms_accepted_at,
--                      seller_terms_accepted_at
--   2. quote_requests — split delivery_location → delivery_area
--                       (visible to matched sellers) +
--                       delivery_address (revealed only after
--                       offer acceptance)
--   3. RLS           — replace unrestricted seller SELECT on
--                      quote_requests with a SECURITY DEFINER
--                      function that enforces column-level masking
--   4. pages         — register legal page slugs
-- ============================================================

-- ── 1. PROFILES: consent & acceptance timestamps ─────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_consent        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at        timestamptz,
  ADD COLUMN IF NOT EXISTS seller_terms_accepted_at timestamptz;

-- ── 2. QUOTE REQUESTS: split delivery field ──────────────────

-- Step a: add new nullable columns
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS delivery_area    text,
  ADD COLUMN IF NOT EXISTS delivery_address text;

-- Step b: backfill — existing rows go entirely into delivery_area
--         (delivery_address remains NULL until buyer fills it on a new RFQ)
UPDATE public.quote_requests
  SET delivery_area = delivery_location
  WHERE delivery_area IS NULL;

-- Step c: enforce NOT NULL after backfill
ALTER TABLE public.quote_requests
  ALTER COLUMN delivery_area SET NOT NULL;

-- Step d: drop the old column
--         Safe: no seller cabinet code exists yet; rfq-actions.ts
--         used "TBD" as a placeholder anyway.
ALTER TABLE public.quote_requests
  DROP COLUMN IF EXISTS delivery_location;

-- ── 3. RLS: staged seller disclosure ─────────────────────────
--
-- Problem: PostgreSQL RLS is row-level only; we need column-level
--   masking (hide delivery_address and customer name until the
--   right moment). Solution: security-definer RPC function.
--   The function runs as the DB owner (bypasses table RLS) but
--   enforces routing + column masking itself. The old open-access
--   seller policy is dropped so direct SELECT is blocked.

DROP POLICY IF EXISTS "quote_requests: seller routing" ON public.quote_requests;

-- Sellers call this via supabase.rpc('get_seller_quote_requests')
-- Disclosure rules:
--   delivery_area      → always visible to matched seller
--   delivery_address   → visible only when THIS seller's offer
--                        is the accepted one
--   customer_display_name → visible when offer accepted OR
--                            when buyer has opened a chat with
--                            this seller for the request
CREATE OR REPLACE FUNCTION public.get_seller_quote_requests()
RETURNS TABLE (
  id                    uuid,
  customer_id           uuid,
  product_id            uuid,
  variant_id            uuid,
  sku                   text,
  product_name          text,
  product_photo         text,
  variant_attrs         jsonb,
  brand_id              uuid,
  category_id           uuid,
  quantity              int,
  delivery_area         text,
  delivery_address      text,
  delivery_datetime     timestamptz,
  additional_comment    text,
  status                text,
  accepted_offer_id     uuid,
  created_at            timestamptz,
  updated_at            timestamptz,
  customer_display_name text
)
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT
    qr.id,
    qr.customer_id,
    qr.product_id,
    qr.variant_id,
    qr.sku,
    qr.product_name,
    qr.product_photo,
    qr.variant_attrs,
    qr.brand_id,
    qr.category_id,
    qr.quantity,
    qr.delivery_area,

    -- exact address: only after this seller's offer is accepted
    CASE
      WHEN EXISTS (
        SELECT 1 FROM public.offers o
        WHERE o.id        = qr.accepted_offer_id
          AND o.seller_id = auth.uid()
      )
      THEN qr.delivery_address
      ELSE NULL
    END,

    qr.delivery_datetime,
    qr.additional_comment,
    qr.status,
    qr.accepted_offer_id,
    qr.created_at,
    qr.updated_at,

    -- customer name: after offer accepted OR after buyer opened chat
    CASE
      WHEN EXISTS (
        SELECT 1 FROM public.offers o
        WHERE o.id        = qr.accepted_offer_id
          AND o.seller_id = auth.uid()
      ) OR EXISTS (
        SELECT 1 FROM public.chats c
        WHERE c.quote_request_id = qr.id
          AND c.seller_id        = auth.uid()
      )
      THEN trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''))
      ELSE NULL
    END

  FROM public.quote_requests qr
  LEFT JOIN public.profiles p ON p.id = qr.customer_id

  WHERE
    qr.status != 'deleted'
    AND public.is_seller()
    AND EXISTS (
      SELECT 1 FROM public.seller_brand_categories sbc
      WHERE sbc.seller_id   = auth.uid()
        AND sbc.brand_id    = qr.brand_id
        AND sbc.category_id = qr.category_id
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_seller_quote_requests() TO authenticated;

-- ── 4. PAGES: register legal document slugs ──────────────────
--
-- These entries act as a registry for navigation and admin.
-- The actual page content is rendered by Next.js TSX files.

INSERT INTO public.pages (slug, title, meta_description)
VALUES
  ('terms-of-use',
   'Terms of Use',
   'Terms governing your use of OKnautic.com'),
  ('seller-terms',
   'Seller Terms',
   'Terms applying to businesses registered as Sellers on OKnautic.com'),
  ('privacy-policy',
   'Privacy Policy',
   'How OKnautic.com collects, uses and protects your personal data'),
  ('legal-notice',
   'Legal Notice',
   'Company and regulatory information for OKnautic.com — Yacht Team DOO')
ON CONFLICT (slug) DO UPDATE
  SET title            = EXCLUDED.title,
      meta_description = EXCLUDED.meta_description,
      updated_at       = now();
