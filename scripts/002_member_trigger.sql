-- Auto-create member profile when a new user signs up
create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'Goblin'),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_member on auth.users;

create trigger on_auth_user_created_member
  after insert on auth.users
  for each row
  execute function public.handle_new_member();
