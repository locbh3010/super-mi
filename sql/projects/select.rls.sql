-- projects: RLS SELECT
-- Chi member cua project (co dong trong projects_members) moi select duoc.

-- GRANTS
grant select on public.projects to authenticated;

-- Bat RLS
alter table public.projects enable row level security;

-- Helper: kiem tra current user co la member cua project khong.
-- SECURITY DEFINER de tranh de quy RLS khi projects_members cung bat RLS.
create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
	select exists (
		select 1
		from public.projects_members pm
		where pm.project_id = p_project_id
		  and pm.user_id = auth.uid()
	);
$$;

-- Policy SELECT
drop policy if exists "Project members can view projects" on public.projects;
create policy "Project members can view projects"
	on public.projects
	for select
	to authenticated
	using (public.is_project_member(id));