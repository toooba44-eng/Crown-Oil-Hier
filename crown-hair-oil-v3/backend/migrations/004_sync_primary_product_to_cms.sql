-- Keep the primary Crown Hair Oil product in the commerce database
-- synchronized with the product block rendered by the storefront CMS.

create or replace function public.sync_primary_product_to_cms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  product_json jsonb;
begin
  if new.slug <> 'crown-hair-oil' then
    return new;
  end if;

  product_json := jsonb_build_object(
    'name', coalesce(nullif(new.name_en, ''), nullif(new.name_ar, ''), 'Crown Hair Oil'),
    'price', new.price_sar,
    'size', new.size_label,
    'description', coalesce(nullif(new.description_ar, ''), nullif(new.description_en, ''), ''),
    'sku', new.sku,
    'stockQty', new.stock_qty,
    'active', new.active
  );

  update public.content_blocks
  set content = jsonb_set(
      jsonb_set(
        content,
        '{draft,product}',
        coalesce(content #> '{draft,product}', '{}'::jsonb) || product_json,
        true
      ),
      '{published,product}',
      coalesce(content #> '{published,product}', '{}'::jsonb) || product_json,
      true
    ),
    updated_at = now()
  where key = 'site';

  return new;
end;
$$;

drop trigger if exists products_sync_primary_to_cms on public.products;
create trigger products_sync_primary_to_cms
after insert or update of name_ar, name_en, description_ar, description_en, price_sar, size_label, sku, stock_qty, active
on public.products
for each row
execute function public.sync_primary_product_to_cms();

-- Apply the current primary product values once so existing CMS content is aligned.
update public.products
set updated_at = now()
where slug = 'crown-hair-oil';
