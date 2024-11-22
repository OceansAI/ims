-- Create dedicated schemas
create schema if not exists extensions;
create schema if not exists auth;

-- Enable required extensions
create extension if not exists "uuid-ossp" schema extensions;
create extension if not exists "pgcrypto" schema extensions;
create extension if not exists "vector" schema extensions; -- For full-text search
create extension if not exists "pg_stat_statements" schema extensions; -- For query performance monitoring

-- Create storage buckets
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
insert into storage.buckets (id, name, public) values ('movement-attachments', 'movement-attachments', false);
insert into storage.buckets (id, name, public) values ('customer-documents', 'customer-documents', false);
insert into storage.buckets (id, name, public) values ('reports', 'reports', false);

-- Create storage policies
create policy "Public access to product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated access to movement attachments"
  on storage.objects for select
  using (bucket_id = 'movement-attachments' and auth.role() = 'authenticated');

create policy "Authenticated access to customer documents"
  on storage.objects for select
  using (bucket_id = 'customer-documents' and auth.role() = 'authenticated');

create policy "Authenticated access to reports"
  on storage.objects for select
  using (bucket_id = 'reports' and auth.role() = 'authenticated');

-- Create base tables
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  logo_url text,
  documents jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.product_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sku text not null unique,
  category_id uuid references public.product_categories(id) not null,
  customer_id uuid references public.customers(id) not null,
  description text,
  dimensions text,
  weight numeric(10,2),
  images jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.storage_locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  type text not null,
  capacity numeric(10,2),
  occupied numeric(10,2) default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.inventory_items (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) not null,
  location_id uuid references public.storage_locations(id),
  qty_on_hand integer not null default 0,
  qty_allocated integer not null default 0,
  qty_received integer not null default 0,
  date_received timestamp with time zone,
  qty_shipped integer not null default 0,
  date_shipped timestamp with time zone,
  storage_rate numeric(10,2) not null default 25.00,
  last_audit_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  inventory_item_id uuid references public.inventory_items(id) not null,
  type text not null check (type in ('INBOUND', 'OUTBOUND', 'ADJUSTMENT')),
  quantity integer not null,
  reference_number text,
  carrier text,
  tracking_number text,
  date timestamp with time zone not null,
  notes text,
  attachments jsonb default '[]'::jsonb,
  created_by uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.storage_rates (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) not null,
  rate numeric(10,2) not null,
  effective_date timestamp with time zone not null,
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.audits (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id),
  status text not null check (status in ('in_progress', 'completed')) default 'in_progress',
  date timestamp with time zone not null,
  performed_by uuid not null,
  notes text,
  items_count integer default 0,
  discrepancies_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.audit_items (
  id uuid primary key default uuid_generate_v4(),
  audit_id uuid references public.audits(id) not null,
  product_id uuid references public.products(id) not null,
  expected_qty integer not null,
  actual_qty integer not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tables for settings and reports
create table public.system_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value jsonb not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.report_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  type text not null,
  template jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.generated_reports (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references public.report_templates(id),
  customer_id uuid references public.customers(id),
  name text not null,
  type text not null,
  parameters jsonb,
  file_path text,
  status text not null default 'pending',
  generated_by uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.notification_settings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id),
  type text not null,
  enabled boolean default true,
  recipients jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.rate_schedules (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id),
  name text not null,
  description text,
  active boolean default true,
  effective_date timestamp with time zone not null,
  end_date timestamp with time zone,
  rates jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.billing_cycles (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  status text not null default 'pending',
  total_amount numeric(10,2) not null default 0,
  storage_charges numeric(10,2) not null default 0,
  outbound_charges numeric(10,2) not null default 0,
  additional_charges numeric(10,2) not null default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index idx_products_customer on public.products(customer_id);
create index idx_products_category on public.products(category_id);
create index idx_inventory_items_product on public.inventory_items(product_id);
create index idx_inventory_items_location on public.inventory_items(location_id);
create index idx_inventory_movements_item on public.inventory_movements(inventory_item_id);
create index idx_storage_rates_product on public.storage_rates(product_id);
create index idx_audit_records_item on public.audit_items(audit_id);
create index idx_system_settings_key on public.system_settings(key);
create index idx_report_templates_type on public.report_templates(type);
create index idx_generated_reports_customer on public.generated_reports(customer_id);
create index idx_generated_reports_status on public.generated_reports(status);
create index idx_notification_settings_customer on public.notification_settings(customer_id);
create index idx_rate_schedules_customer on public.rate_schedules(customer_id);
create index idx_rate_schedules_dates on public.rate_schedules(effective_date, end_date);
create index idx_billing_cycles_customer on public.billing_cycles(customer_id);
create index idx_billing_cycles_dates on public.billing_cycles(start_date, end_date);
create index idx_billing_cycles_status on public.billing_cycles(status);

-- Add updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger set_updated_at before update on public.customers
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.product_categories
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.products
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.storage_locations
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.inventory_items
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.inventory_movements
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.storage_rates
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.audits
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.audit_items
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.system_settings
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.report_templates
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.generated_reports
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.notification_settings
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.rate_schedules
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.billing_cycles
  for each row execute function public.handle_updated_at();

-- Enable Row Level Security (RLS)
alter table public.customers enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.storage_locations enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.storage_rates enable row level security;
alter table public.audits enable row level security;
alter table public.audit_items enable row level security;
alter table public.system_settings enable row level security;
alter table public.report_templates enable row level security;
alter table public.generated_reports enable row level security;
alter table public.notification_settings enable row level security;
alter table public.rate_schedules enable row level security;
alter table public.billing_cycles enable row level security;

-- Create RLS policies
create policy "Enable read access for authenticated users"
  on public.customers for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.product_categories for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.products for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.storage_locations for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.inventory_items for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.inventory_movements for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.storage_rates for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.audits for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.audit_items for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.system_settings for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.report_templates for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.generated_reports for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.notification_settings for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.rate_schedules for select
  using (auth.role() = 'authenticated');

create policy "Enable read access for authenticated users"
  on public.billing_cycles for select
  using (auth.role() = 'authenticated');

-- Create function to generate monthly billing
create or replace function public.generate_monthly_billing(
  p_customer_id uuid,
  p_start_date timestamp with time zone,
  p_end_date timestamp with time zone
)
returns uuid
security definer
set search_path = public
language plpgsql as $$
declare
  v_billing_cycle_id uuid;
  v_storage_charges numeric(10,2);
  v_outbound_charges numeric(10,2);
  v_total_amount numeric(10,2);
begin
  -- Calculate charges
  select 
    sum(storage_charges)::numeric(10,2),
    sum(outbound_charges)::numeric(10,2)
  into
    v_storage_charges,
    v_outbound_charges
  from public.calculate_storage_charges(p_customer_id, p_start_date, p_end_date);

  v_total_amount := coalesce(v_storage_charges, 0) + coalesce(v_outbound_charges, 0);

  -- Create billing cycle
  insert into public.billing_cycles (
    customer_id,
    start_date,
    end_date,
    status,
    total_amount,
    storage_charges,
    outbound_charges
  ) values (
    p_customer_id,
    p_start_date,
    p_end_date,
    'pending',
    v_total_amount,
    coalesce(v_storage_charges, 0),
    coalesce(v_outbound_charges, 0)
  ) returning id into v_billing_cycle_id;

  return v_billing_cycle_id;
end;
$$;

-- Create function to get current rate for a product
create or replace function public.get_current_product_rate(
  p_product_id uuid,
  p_date timestamp with time zone default now()
)
returns numeric
security definer
set search_path = public
language plpgsql as $$
declare
  v_rate numeric;
  v_customer_id uuid;
begin
  -- Get customer ID for the product
  select customer_id into v_customer_id
  from public.products
  where id = p_product_id;

  -- Try to get rate from rate schedule first
  select (rates->p_product_id::text)::numeric into v_rate
  from public.rate_schedules
  where customer_id = v_customer_id
    and active = true
    and effective_date <= p_date
    and (end_date is null or end_date >= p_date)
  order by effective_date desc
  limit 1;

  -- If no rate found in schedule, fall back to storage_rates table
  if v_rate is null then
    select rate into v_rate
    from public.storage_rates
    where product_id = p_product_id
      and effective_date <= p_date
      and (end_date is null or end_date >= p_date)
    order by effective_date desc
    limit 1;
  end if;

  -- Return default rate if no other rate found
  return coalesce(v_rate, 25.00);
end;
$$;