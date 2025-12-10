-- Ensure 'orders' table has the necessary columns
alter table public.orders add column if not exists total_price numeric;
alter table public.orders add column if not exists items jsonb;
alter table public.orders add column if not exists status text default 'pending';
alter table public.orders add column if not exists user_id text;
alter table public.orders add column if not exists table_number text;

-- Fix staff table too just in case
alter table public.staff add column if not exists email text;
alter table public.staff add column if not exists phone text;
alter table public.staff alter column user_id drop not null;
