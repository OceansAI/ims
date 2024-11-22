-- Drop existing policies
drop policy if exists "Enable read access for authenticated users" on public.customers;
drop policy if exists "Enable read access for authenticated users" on public.products;
drop policy if exists "Enable read access for authenticated users" on public.inventory_items;
drop policy if exists "Enable read access for authenticated users" on public.inventory_movements;
drop policy if exists "Enable read access for authenticated users" on public.storage_rates;
drop policy if exists "Enable read access for authenticated users" on public.audits;
drop policy if exists "Enable read access for authenticated users" on public.audit_items;

-- Customers table policies
create policy "Enable full access for authenticated users"
  on public.customers
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Products table policies
create policy "Enable full access for authenticated users"
  on public.products
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Inventory items table policies
create policy "Enable full access for authenticated users"
  on public.inventory_items
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Inventory movements table policies
create policy "Enable full access for authenticated users"
  on public.inventory_movements
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage rates table policies
create policy "Enable full access for authenticated users"
  on public.storage_rates
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Audits table policies
create policy "Enable full access for authenticated users"
  on public.audits
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Audit items table policies
create policy "Enable full access for authenticated users"
  on public.audit_items
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage policies for files
create policy "Enable full access to product images"
  on storage.objects for all
  using (bucket_id = 'product-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Enable full access to movement attachments"
  on storage.objects for all
  using (bucket_id = 'movement-attachments' and auth.role() = 'authenticated')
  with check (bucket_id = 'movement-attachments' and auth.role() = 'authenticated');

create policy "Enable full access to customer documents"
  on storage.objects for all
  using (bucket_id = 'customer-documents' and auth.role() = 'authenticated')
  with check (bucket_id = 'customer-documents' and auth.role() = 'authenticated');

create policy "Enable full access to reports"
  on storage.objects for all
  using (bucket_id = 'reports' and auth.role() = 'authenticated')
  with check (bucket_id = 'reports' and auth.role() = 'authenticated');