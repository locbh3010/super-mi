-- =============================================================
-- profiles: ho so user global, sync tu dong tu auth.users
-- =============================================================

-- Bang profiles
create table if not exists public.profiles (
	id          uuid primary key references auth.users (id) on delete cascade,
	email        text,
	display_name text,
	avatar_url   text,
	created_at  timestamptz not null default now(),
	updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Ho so user global, dong bo tu auth.users.';

-- GRANTS: table-level privileges cho Supabase roles.
-- RLS chi loc row; GRANT moi cap quyen truy cap table.
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

-- =============================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
	on public.profiles
	for select
	using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
	on public.profiles
	for update
	using (auth.uid() = id)
	with check (auth.uid() = id);

-- =============================================================
-- Trigger: tu cap nhat updated_at
-- ================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
	before update on public.profiles
	for each row
	execute function public.handle_updated_at();

-- =============================================================
--- Trigger: sync auth.users -> profiles (insert + update)
-- ================================
create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, email, display_name, avatar_url)
	values (
		new.id,
		new.email,
		coalesce(
			new.raw_user_meta_data ->> 'display_name',
			new.raw_user_meta_data ->> 'full_name',
			new.raw_user_meta_data ->> 'name'
		),
		coalesce(
			new.raw_user_meta_data ->> 'avatar_url',
			new.raw_user_meta_data ->> 'picture'
		)
	)
	on conflict (id) do update
	set
		email        = excluded.email,
		display_name = coalesce(excluded.display_name, public.profiles.display_name),
		avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
		updated_at = now();

	return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row
	execute function public.handle_auth_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
	after update on auth.users
	for each row
	execute function public.handle_auth_user();

-- =============================================================
-- Backfill: user da ton tai truoc khi tao trigger
-- ================================
insert into public.profiles (id, email, display_name, avatar_url)
select
	u.id,
	u.email,
	coalesce(u.raw_user_meta_data ->> 'display_name', u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
	coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
on conflict (id) do nothing;
