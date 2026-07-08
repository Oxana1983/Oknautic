-- Assign categories to products that were auto-created from inventory uploads
-- Uses brand-name heuristic; safe to re-run (only updates where category_id is null)

update public.products p
set category_id = c.id
from public.brands b
join public.categories c on c.slug = case lower(b.name)
  when 'garmin'           then 'navigation'
  when 'raymarine'        then 'navigation'
  when 'simrad'           then 'navigation'
  when 'furuno'           then 'navigation'
  when 'b&g'              then 'navigation'
  when 'humminbird'       then 'navigation'
  when 'standard horizon' then 'navigation'
  when 'navionics'        then 'navigation'
  when 'airmar'           then 'navigation'
  when 'volvo penta'      then 'engines'
  when 'yanmar'           then 'engines'
  when 'mtu'              then 'engines'
  when 'caterpillar'      then 'engines'
  when 'cummins'          then 'engines'
  when 'mercruiser'       then 'engines'
  when 'honda'            then 'engines'
  when 'tohatsu'          then 'engines'
  when 'lewmar'           then 'anchoring'
  when 'maxwell'          then 'anchoring'
  when 'lofrans'          then 'anchoring'
  when 'quick'            then 'anchoring'
  when 'muir'             then 'anchoring'
  when 'harken'           then 'deck-hardware'
  when 'ronstan'          then 'deck-hardware'
  when 'spinlock'         then 'deck-hardware'
  when 'antal'            then 'deck-hardware'
  when 'selden'           then 'rigging'
  when 'navtec'           then 'rigging'
  when 'victron'          then 'electrical'
  when 'victron energy'   then 'electrical'
  when 'mastervolt'       then 'electrical'
  when 'xantrex'          then 'electrical'
  when 'plastimo'         then 'safety'
  when 'ocean signal'     then 'safety'
  when 'acr'              then 'safety'
  when 'kannad'           then 'safety'
  when 'mcmurdo'          then 'safety'
  when 'viking'           then 'safety'
  else null
end
where p.brand_id = b.id
  and p.category_id is null
  and c.id is not null;
