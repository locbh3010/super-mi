-- projects_members: RLS INSERT
-- Cho phep user tu them chinh minh vao project (vd: nguoi tao lam owner).

-- GRANTS: table-level privilege. RLS chi loc row; GRANT moi cap quyen truy cap table.
grant insert on public.projects_members to authenticated;

-- Bat RLS (idempotent).
alter table public.projects_members enable row level security;

-- Policy INSERT: chi duoc them ban ghi cho chinh minh.
drop policy if exists "Users can add themselves to projects" on public.projects_members;
create policy "Users can add themselves to projects"
	on public.projects_members
	for insert
	to authenticated
	with check (user_id = auth.uid());