-- projects: RLS INSERT
-- Bat ky user dang nhap deu duoc tao project moi.
-- Quyen owner duoc gan rieng qua bang projects_members.

-- GRANTS: table-level privilege. RLS chi loc row; GRANT moi cap quyen truy cap table.
grant insert on public.projects to authenticated;

-- Bat RLS (idempotent).
alter table public.projects enable row level security;

-- Policy INSERT
drop policy if exists "Authenticated users can create projects" on public.projects;
create policy "Authenticated users can create projects"
	on public.projects
	for insert
	to authenticated
	with check (true);