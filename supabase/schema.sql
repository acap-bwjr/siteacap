-- ACAP Futsal — schema do painel de Jogos
-- Rode este script inteiro no Supabase: Project > SQL Editor > New query > Run

create extension if not exists pgcrypto;

create table if not exists jogos (
  id uuid primary key default gen_random_uuid(),
  team text not null check (team in ('time1', 'time2', 'academy')),
  competicao text not null,
  adversario text not null,
  adversario_logo_url text,
  data date not null,
  hora time,
  local_tipo text not null default 'casa' check (local_tipo in ('casa', 'fora')),
  local_nome text,
  categorias text[],
  status text not null default 'agendado' check (status in ('agendado', 'realizado')),
  placar_acap int,
  placar_adversario int,
  created_at timestamptz not null default now()
);

alter table jogos enable row level security;

-- qualquer visitante do site pode LER a agenda
create policy "Leitura publica dos jogos"
  on jogos for select
  using (true);

-- só quem está logado no painel (o admin do clube) pode criar/editar/excluir
create policy "Escrita autenticada dos jogos"
  on jogos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- resultado por categoria, para jogos com mais de uma categoria no mesmo dia/local
-- (quando o jogo tem só 0 ou 1 categoria, usa-se placar_acap/placar_adversario da própria linha em "jogos")
create table if not exists jogos_resultados (
  id uuid primary key default gen_random_uuid(),
  jogo_id uuid not null references jogos(id) on delete cascade,
  categoria text not null,
  placar_acap int,
  placar_adversario int,
  created_at timestamptz not null default now(),
  unique (jogo_id, categoria)
);

create index if not exists jogos_resultados_jogo_id_idx on jogos_resultados(jogo_id);

alter table jogos_resultados enable row level security;

create policy "Leitura publica dos resultados por categoria"
  on jogos_resultados for select
  using (true);

create policy "Escrita autenticada dos resultados por categoria"
  on jogos_resultados for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- bucket de armazenamento para os escudos dos adversários
insert into storage.buckets (id, name, public)
values ('escudos', 'escudos', true)
on conflict (id) do nothing;

create policy "Leitura publica dos escudos"
  on storage.objects for select
  using (bucket_id = 'escudos');

create policy "Upload autenticado de escudos"
  on storage.objects for insert
  with check (bucket_id = 'escudos' and auth.role() = 'authenticated');

create policy "Atualizacao autenticada de escudos"
  on storage.objects for update
  using (bucket_id = 'escudos' and auth.role() = 'authenticated');

create policy "Exclusao autenticada de escudos"
  on storage.objects for delete
  using (bucket_id = 'escudos' and auth.role() = 'authenticated');
