-- Add placeholder photos for products that have none
-- picsum.photos/seed/{sku} gives a stable, unique image per product
update public.products
set photos = array['https://picsum.photos/seed/' || sku || '/600/450']
where photos = '{}' or array_length(photos, 1) is null;
