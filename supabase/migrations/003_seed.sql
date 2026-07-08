-- ============================================================
-- OKnautic — Migration 003: Seed Data
-- 10 brands · 21 categories (8 root + 13 sub, all show_in_menu)
-- · 30 products with category_id · 8 products with 4-type variants
-- ============================================================

-- ── 10 Brands ────────────────────────────────────────────────

insert into public.brands (name, slug, logo_url, sort_order) values
  ('Vetus',      'vetus',      '/brands/vetus.svg',      1),
  ('Garmin',     'garmin',     '/brands/garmin.svg',     2),
  ('Raymarine',  'raymarine',  '/brands/raymarine.svg',  3),
  ('Lewmar',     'lewmar',     '/brands/lewmar.svg',     4),
  ('Harken',     'harken',     '/brands/harken.svg',     5),
  ('Furuno',     'furuno',     '/brands/furuno.svg',     6),
  ('Maxwell',    'maxwell',    '/brands/maxwell.svg',    7),
  ('Navico',     'navico',     '/brands/navico.svg',     8),
  ('Plastimo',   'plastimo',   '/brands/plastimo.svg',   9),
  ('Jotun',      'jotun',      '/brands/jotun.svg',      10);

-- ── 21 Categories for 3×7 menu grid ─────────────────────────
-- 8 root categories (show_in_menu = true)
-- 13 subcategories (show_in_menu = true)  → total 21
-- Additional subcategories with show_in_menu = false exist for product classification

insert into public.categories (name, slug, show_in_menu, sort_order) values
  ('Navigation',    'navigation',    true, 1),
  ('Anchoring',     'anchoring',     true, 2),
  ('Deck Hardware', 'deck-hardware', true, 3),
  ('Mooring',       'mooring',       true, 4),
  ('Engines',       'engines',       true, 5),
  ('Electrical',    'electrical',    true, 6),
  ('Safety',        'safety',        true, 7),
  ('Rigging',       'rigging',       true, 8);  -- 8th root

-- Subcategories with show_in_menu = true (13 rows → total menu items = 8 + 13 = 21)
insert into public.categories (parent_id, name, slug, show_in_menu, sort_order)
select id, 'Chartplotters',    'chartplotters',    true, 1 from public.categories where slug = 'navigation'    union all
select id, 'VHF Radios',       'vhf-radios',       true, 2 from public.categories where slug = 'navigation'    union all
select id, 'AIS Systems',      'ais-systems',      true, 3 from public.categories where slug = 'navigation'    union all
select id, 'Windlasses',       'windlasses',       true, 1 from public.categories where slug = 'anchoring'     union all
select id, 'Anchors',          'anchors',          true, 2 from public.categories where slug = 'anchoring'     union all
select id, 'Chain & Rope',     'chain-rope',       true, 3 from public.categories where slug = 'anchoring'     union all
select id, 'Winches',          'winches',          true, 1 from public.categories where slug = 'deck-hardware' union all
select id, 'Cleats & Blocks',  'cleats-blocks',    true, 2 from public.categories where slug = 'deck-hardware' union all
select id, 'Fenders',          'fenders',          true, 1 from public.categories where slug = 'mooring'       union all
select id, 'Mooring Lines',    'mooring-lines',    true, 2 from public.categories where slug = 'mooring'       union all
select id, 'Diesel Engines',   'diesel-engines',   true, 1 from public.categories where slug = 'engines'       union all
select id, 'Life Jackets',     'life-jackets',     true, 1 from public.categories where slug = 'safety'        union all
select id, 'Standing Rigging', 'standing-rigging', true, 1 from public.categories where slug = 'rigging';

-- Additional subcategories for product classification (not in 3×7 menu)
insert into public.categories (parent_id, name, slug, show_in_menu, sort_order)
select id, 'Engine Parts',     'engine-parts',     false, 2 from public.categories where slug = 'engines'  union all
select id, 'Flares & Signals', 'flares-signals',   false, 2 from public.categories where slug = 'safety'   union all
select id, 'Running Rigging',  'running-rigging',  false, 2 from public.categories where slug = 'rigging';

-- ── 30 Products ──────────────────────────────────────────────

do $$
declare
  -- Brand IDs
  b_vetus     uuid; b_garmin  uuid; b_raymarine uuid;
  b_lewmar    uuid; b_harken  uuid; b_furuno    uuid;
  b_maxwell   uuid; b_navico  uuid; b_plastimo  uuid; b_jotun uuid;
  -- Category IDs (leaf/subcategory)
  c_chart     uuid; c_vhf     uuid; c_ais      uuid;
  c_windlass  uuid; c_anchors uuid; c_chain    uuid;
  c_winches   uuid; c_cleats  uuid;
  c_fenders   uuid; c_mooring uuid;
  c_diesel    uuid; c_parts   uuid;
  c_lifejack  uuid; c_flares  uuid;
  c_srigging  uuid; c_rrigging uuid;
  -- Product IDs for variant attachment
  p1  uuid; p2  uuid; p3  uuid; p4  uuid; p5  uuid;
  p6  uuid; p7  uuid; p8  uuid; p9  uuid; p10 uuid;
  p11 uuid; p12 uuid; p13 uuid; p14 uuid; p15 uuid;
  p16 uuid; p17 uuid; p18 uuid; p19 uuid; p20 uuid;
  p21 uuid; p22 uuid; p23 uuid; p24 uuid; p25 uuid;
  p26 uuid; p27 uuid; p28 uuid; p29 uuid; p30 uuid;
begin
  -- Load brand IDs
  select id into b_vetus     from public.brands where slug = 'vetus';
  select id into b_garmin    from public.brands where slug = 'garmin';
  select id into b_raymarine from public.brands where slug = 'raymarine';
  select id into b_lewmar    from public.brands where slug = 'lewmar';
  select id into b_harken    from public.brands where slug = 'harken';
  select id into b_furuno    from public.brands where slug = 'furuno';
  select id into b_maxwell   from public.brands where slug = 'maxwell';
  select id into b_navico    from public.brands where slug = 'navico';
  select id into b_plastimo  from public.brands where slug = 'plastimo';
  select id into b_jotun     from public.brands where slug = 'jotun';

  -- Load category IDs
  select id into c_chart    from public.categories where slug = 'chartplotters';
  select id into c_vhf      from public.categories where slug = 'vhf-radios';
  select id into c_ais      from public.categories where slug = 'ais-systems';
  select id into c_windlass from public.categories where slug = 'windlasses';
  select id into c_anchors  from public.categories where slug = 'anchors';
  select id into c_chain    from public.categories where slug = 'chain-rope';
  select id into c_winches  from public.categories where slug = 'winches';
  select id into c_cleats   from public.categories where slug = 'cleats-blocks';
  select id into c_fenders  from public.categories where slug = 'fenders';
  select id into c_mooring  from public.categories where slug = 'mooring-lines';
  select id into c_diesel   from public.categories where slug = 'diesel-engines';
  select id into c_parts    from public.categories where slug = 'engine-parts';
  select id into c_lifejack from public.categories where slug = 'life-jackets';
  select id into c_flares   from public.categories where slug = 'flares-signals';
  select id into c_srigging from public.categories where slug = 'standing-rigging';
  select id into c_rrigging from public.categories where slug = 'running-rigging';

  -- ── Navigation (1–5) ────────────────────────────────────────

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_garmin, c_chart, 'GRM-ECHOMAP94SV', 'Garmin ECHOMAP Ultra 94sv Chartplotter', 1299.00)
  returning id into p1;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_raymarine, c_chart, 'RAY-A97HYBRID', 'Raymarine Axiom Pro 9 RVX MFD', 1799.00)
  returning id into p2;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_navico, c_vhf, 'NAV-RS100B', 'Navico RS100-B DSC VHF Radio', 349.00)
  returning id into p3;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_furuno, c_ais, 'FUR-FA170', 'Furuno FA-170 Class B AIS Transponder', 699.00)
  returning id into p4;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_garmin, c_vhf, 'GRM-VHF215I', 'Garmin VHF 215i Marine Radio', 279.00)
  returning id into p5;

  -- ── Anchoring (6–10) ────────────────────────────────────────

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_maxwell, c_windlass, 'MAX-RC10-12V', 'Maxwell RC10 Windlass 12V', 889.00)
  returning id into p6;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_lewmar, c_windlass, 'LEW-H3-12V', 'Lewmar H3 Horizontal Windlass 12V', 749.00)
  returning id into p7;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_anchors, 'VET-ANCH-DELTA20', 'Vetus Delta Anchor 20 kg', 219.00)
  returning id into p8;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_plastimo, c_anchors, 'PLS-CQR15', 'Plastimo CQR Anchor 15 kg', 179.00)
  returning id into p9;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_chain, 'VET-CHAIN-8-50', 'Vetus G40 Anchor Chain 8mm × 50m', 349.00)
  returning id into p10;

  -- ── Deck Hardware (11–15) ───────────────────────────────────

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_lewmar, c_winches, 'LEW-40CSTD', 'Lewmar Ocean 40 Self-Tailing Winch', 499.00)
  returning id into p11;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_harken, c_winches, 'HAR-40.2STA', 'Harken 40.2 Self-Tailing Winch', 589.00)
  returning id into p12;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_lewmar, c_cleats, 'LEW-CLT-10', 'Lewmar Cleat 10" Aluminium', 34.00)
  returning id into p13;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_harken, c_cleats, 'HAR-BLK-57MM', 'Harken 57mm Carbo Block Single', 89.00)
  returning id into p14;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_cleats, 'VET-FAIRLEAD-6', 'Vetus Stainless Fairlead 6-Hole', 49.00)
  returning id into p15;

  -- ── Mooring (16–20) ─────────────────────────────────────────

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_plastimo, c_fenders, 'PLS-F1-WH', 'Plastimo Fender F1', 24.00)
  returning id into p16;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_fenders, 'VET-FEND-SPORT', 'Vetus Sport Fender', 19.00)
  returning id into p17;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_plastimo, c_mooring, 'PLS-MLINE-10', 'Plastimo Mooring Line 10mm', 29.00)
  returning id into p18;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_mooring, 'VET-MLINE-12', 'Vetus Double-Braid Mooring Line 12mm', 45.00)
  returning id into p19;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_lewmar, c_cleats, 'LEW-SNATCH-M', 'Lewmar Snatch Block Medium', 129.00)
  returning id into p20;

  -- ── Engines (21–25) ─────────────────────────────────────────

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_diesel, 'VET-M4-14', 'Vetus M4.14 Marine Diesel Engine 14 HP', 4299.00)
  returning id into p21;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_diesel, 'VET-M4-29', 'Vetus M4.29 Marine Diesel Engine 29 HP', 5999.00)
  returning id into p22;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_parts, 'VET-IMPELLER-M4', 'Vetus Raw Water Impeller M4 Series', 39.00)
  returning id into p23;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_parts, 'VET-ZINCANODE-50', 'Vetus Zinc Anode 50mm Shaft', 14.00)
  returning id into p24;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_vetus, c_parts, 'VET-BELLOWS-38', 'Vetus Exhaust Bellows 38mm', 29.00)
  returning id into p25;

  -- ── Safety (26–28) ──────────────────────────────────────────

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_plastimo, c_lifejack, 'PLS-IRIS100-M', 'Plastimo Iris 100N Life Jacket Manual', 89.00)
  returning id into p26;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_plastimo, c_lifejack, 'PLS-PILOT165-A', 'Plastimo Pilot 165N Life Jacket Auto', 149.00)
  returning id into p27;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_plastimo, c_flares, 'PLS-FLARE-KIT6', 'Plastimo Flare Kit 6-Piece SOLAS', 79.00)
  returning id into p28;

  -- ── Rigging / Paint (29–30) ─────────────────────────────────

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_jotun, c_parts, 'JOT-ANTI-ULTRA', 'Jotun Antifouling Ultra', 129.00)
  returning id into p29;

  insert into public.products (brand_id, category_id, sku, name, avg_price)
  values (b_jotun, c_parts, 'JOT-PRIMER', 'Jotun Primocon Primer', 59.00)
  returning id into p30;

  -- ── Variant Types (4 types per product) ─────────────────────

  insert into public.product_variant_types (product_id, name, sort_order) values
    -- p1: Garmin ECHOMAP chartplotter
    (p1, 'Screen Size',     1), (p1, 'Transducer',    2), (p1, 'Bundle',       3), (p1, 'Mount Type',    4),
    -- p2: Raymarine MFD
    (p2, 'Screen Size',     1), (p2, 'Transducer',    2), (p2, 'Bundle',       3), (p2, 'Mount Type',    4),
    -- p6: Maxwell windlass
    (p6, 'Chain Diameter',  1), (p6, 'Load Capacity', 2), (p6, 'Voltage',      3), (p6, 'Rope Diameter', 4),
    -- p8: Vetus Delta anchor
    (p8, 'Weight',          1), (p8, 'Material',      2), (p8, 'Boat Length',  3), (p8, 'Shackle Size',  4),
    -- p11: Lewmar winch
    (p11,'Size',            1), (p11,'Action',        2), (p11,'Material',     3), (p11,'Speed',         4),
    -- p16: Plastimo fender
    (p16,'Size',            1), (p16,'Color',         2), (p16,'Rope Diameter',3), (p16,'Rope Length',   4),
    -- p19: Vetus mooring line
    (p19,'Diameter',        1), (p19,'Length',        2), (p19,'Color',        3), (p19,'Eye Splice',    4),
    -- p27: Plastimo life jacket
    (p27,'Size',            1), (p27,'Buoyancy',      2), (p27,'Harness',      3), (p27,'Light',         4);

  -- ── Variants (4 per product, unique SKU per combination) ────

  -- p1: Garmin ECHOMAP — 4 screen sizes
  insert into public.product_variants (product_id, sku, attributes) values
    (p1, 'GRM-ECHOMAP74SV',    '{"Screen Size":"7\"",  "Transducer":"GT54UHD",    "Bundle":"Without", "Mount Type":"Bail"}'),
    (p1, 'GRM-ECHOMAP94SV',    '{"Screen Size":"9\"",  "Transducer":"GT54UHD",    "Bundle":"Without", "Mount Type":"Bail"}'),
    (p1, 'GRM-ECHOMAP94SV-T',  '{"Screen Size":"9\"",  "Transducer":"GT54UHD-TM", "Bundle":"With",    "Mount Type":"Bail"}'),
    (p1, 'GRM-ECHOMAP104SV',   '{"Screen Size":"10\"", "Transducer":"GT54UHD",    "Bundle":"Without", "Mount Type":"Flush"}');

  -- p6: Maxwell RC10 windlass — voltage × chain diameter
  insert into public.product_variants (product_id, sku, attributes) values
    (p6, 'MAX-RC10-8-12V',   '{"Chain Diameter":"8mm",  "Load Capacity":"600kg", "Voltage":"12V", "Rope Diameter":"14mm"}'),
    (p6, 'MAX-RC10-10-12V',  '{"Chain Diameter":"10mm", "Load Capacity":"600kg", "Voltage":"12V", "Rope Diameter":"16mm"}'),
    (p6, 'MAX-RC10-8-24V',   '{"Chain Diameter":"8mm",  "Load Capacity":"600kg", "Voltage":"24V", "Rope Diameter":"14mm"}'),
    (p6, 'MAX-RC10-10-24V',  '{"Chain Diameter":"10mm", "Load Capacity":"600kg", "Voltage":"24V", "Rope Diameter":"16mm"}');

  -- p8: Vetus Delta anchor — weight × material
  insert into public.product_variants (product_id, sku, attributes) values
    (p8, 'VET-ANCH-DELTA10',  '{"Weight":"10 kg", "Material":"Galvanised", "Boat Length":"≤10m", "Shackle Size":"10mm"}'),
    (p8, 'VET-ANCH-DELTA15',  '{"Weight":"15 kg", "Material":"Galvanised", "Boat Length":"≤14m", "Shackle Size":"12mm"}'),
    (p8, 'VET-ANCH-DELTA20',  '{"Weight":"20 kg", "Material":"Galvanised", "Boat Length":"≤18m", "Shackle Size":"14mm"}'),
    (p8, 'VET-ANCH-DELTA20S', '{"Weight":"20 kg", "Material":"Stainless",  "Boat Length":"≤18m", "Shackle Size":"14mm"}');

  -- p11: Lewmar winch — size × speed
  insert into public.product_variants (product_id, sku, attributes) values
    (p11, 'LEW-40CSTD-2S',  '{"Size":"40C", "Action":"2-Speed", "Material":"Chrome", "Speed":"Standard"}'),
    (p11, 'LEW-40CSTD-2SR', '{"Size":"40C", "Action":"2-Speed", "Material":"Chrome", "Speed":"Ratchet"}'),
    (p11, 'LEW-48CSTD-2S',  '{"Size":"48C", "Action":"2-Speed", "Material":"Chrome", "Speed":"Standard"}'),
    (p11, 'LEW-55CSTD-3S',  '{"Size":"55C", "Action":"3-Speed", "Material":"Chrome", "Speed":"Standard"}');

  -- p16: Plastimo fender — size × color
  insert into public.product_variants (product_id, sku, attributes) values
    (p16, 'PLS-F1-WH-S',  '{"Size":"S (11×31cm)", "Color":"White", "Rope Diameter":"6mm",  "Rope Length":"1m"}'),
    (p16, 'PLS-F1-WH-M',  '{"Size":"M (14×41cm)", "Color":"White", "Rope Diameter":"8mm",  "Rope Length":"1.2m"}'),
    (p16, 'PLS-F1-BK-M',  '{"Size":"M (14×41cm)", "Color":"Black", "Rope Diameter":"8mm",  "Rope Length":"1.2m"}'),
    (p16, 'PLS-F1-WH-L',  '{"Size":"L (18×51cm)", "Color":"White", "Rope Diameter":"10mm", "Rope Length":"1.5m"}');

  -- p19: Vetus mooring line — diameter × length
  insert into public.product_variants (product_id, sku, attributes) values
    (p19, 'VET-MLINE-10-10-BL', '{"Diameter":"10mm", "Length":"10m", "Color":"Blue",  "Eye Splice":"Single"}'),
    (p19, 'VET-MLINE-12-10-BL', '{"Diameter":"12mm", "Length":"10m", "Color":"Blue",  "Eye Splice":"Single"}'),
    (p19, 'VET-MLINE-12-15-BL', '{"Diameter":"12mm", "Length":"15m", "Color":"Blue",  "Eye Splice":"Double"}'),
    (p19, 'VET-MLINE-16-15-BL', '{"Diameter":"16mm", "Length":"15m", "Color":"Blue",  "Eye Splice":"Double"}');

  -- p27: Plastimo Pilot 165N — size × harness
  insert into public.product_variants (product_id, sku, attributes) values
    (p27, 'PLS-PILOT165-A-XS', '{"Size":"XS (<40kg)",  "Buoyancy":"165N", "Harness":"Without", "Light":"No"}'),
    (p27, 'PLS-PILOT165-A-S',  '{"Size":"S (40–60kg)", "Buoyancy":"165N", "Harness":"Without", "Light":"No"}'),
    (p27, 'PLS-PILOT165-AH-M', '{"Size":"M (60–90kg)", "Buoyancy":"165N", "Harness":"With",    "Light":"Yes"}'),
    (p27, 'PLS-PILOT165-AH-L', '{"Size":"L (>90kg)",   "Buoyancy":"165N", "Harness":"With",    "Light":"Yes"}');

  -- p2: Raymarine Axiom MFD — screen × transducer
  insert into public.product_variants (product_id, sku, attributes) values
    (p2, 'RAY-A79HYBRID',  '{"Screen Size":"7\"",  "Transducer":"RV-100", "Bundle":"Without", "Mount Type":"Bail"}'),
    (p2, 'RAY-A97HYBRID',  '{"Screen Size":"9\"",  "Transducer":"RV-100", "Bundle":"Without", "Mount Type":"Bail"}'),
    (p2, 'RAY-A97HYBRID-T','{"Screen Size":"9\"",  "Transducer":"RV-100", "Bundle":"With",    "Mount Type":"Bail"}'),
    (p2, 'RAY-A127HYBRID', '{"Screen Size":"12\"", "Transducer":"RV-100", "Bundle":"Without", "Mount Type":"Flush"}');

end $$;

-- ── Content Seed ─────────────────────────────────────────────

insert into public.pages (slug, title, content, meta_description) values
  ('insurance',              'Marine Insurance',          '<p>Content coming soon.</p>', 'Marine yacht insurance services'),
  ('agents',                 'Find an Agent',             '<p>Content coming soon.</p>', 'Find a local marine agent'),
  ('for-sellers',            'For Sellers',               '<p>Content coming soon.</p>', 'Sell marine parts on OKnautic'),
  ('privacy-policy',         'Privacy Policy',            '<p>Content coming soon.</p>', 'OKnautic privacy policy'),
  ('personal-data-agreement','Personal Data Agreement',   '<p>Content coming soon.</p>', 'Personal data processing agreement');

insert into public.homepage_slides (title, subtitle, image_url, link_page, button_text, sort_order) values
  ('Personal Assistance', 'Expert help finding the right marine parts',       '/slides/assistance.jpg', 'personal-assistance', 'More details', 1),
  ('Marine Insurance',    'Protect your vessel with comprehensive cover',     '/slides/insurance.jpg',  'insurance',           'More details', 2),
  ('Find an Agent',       'Connect with certified marine agents worldwide',   '/slides/agents.jpg',     'agents',              'More details', 3);

insert into public.assistance_topics (name, sort_order) values
  ('Managing Account',       1),
  ('Working with Dashboard', 2),
  ('Find Product',           3),
  ('Insurance',              4),
  ('Find Agent',             5);
