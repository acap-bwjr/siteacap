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

-- inscrições do formulário de Avaliação/Peneira (leads)
create table if not exists avaliacao_inscricoes (
  id uuid primary key default gen_random_uuid(),
  nome_atleta text not null,
  data_nascimento date not null,
  categoria_interesse text not null,
  posicao text,
  nome_responsavel text not null,
  telefone text not null,
  email text not null,
  experiencia_anterior text,
  observacoes text,
  created_at timestamptz not null default now()
);

alter table avaliacao_inscricoes enable row level security;

-- qualquer visitante pode ENVIAR uma inscrição (formulário público)
create policy "Envio publico de inscricoes"
  on avaliacao_inscricoes for insert
  with check (true);

-- só quem está logado no painel pode LER/gerenciar as inscrições (dados de contato do lead)
create policy "Leitura e gestao autenticada das inscricoes"
  on avaliacao_inscricoes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- notícias do clube
create table if not exists noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  resumo text not null,
  corpo text,
  imagem_url text,
  categoria text,
  data_publicacao date not null default current_date,
  created_at timestamptz not null default now()
);

alter table noticias enable row level security;

create policy "Leitura publica das noticias"
  on noticias for select
  using (true);

create policy "Escrita autenticada das noticias"
  on noticias for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- patrocinadores atuais (vitrine pública)
create table if not exists patrocinadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  logo_url text not null,
  link_url text,
  instagram_url text,
  categoria text,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

alter table patrocinadores enable row level security;

create policy "Leitura publica dos patrocinadores"
  on patrocinadores for select
  using (true);

create policy "Escrita autenticada dos patrocinadores"
  on patrocinadores for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- leads de empresas interessadas em patrocinar (captação)
create table if not exists patrocinador_leads (
  id uuid primary key default gen_random_uuid(),
  nome_empresa text not null,
  nome_contato text not null,
  telefone text not null,
  email text not null,
  mensagem text,
  created_at timestamptz not null default now()
);

alter table patrocinador_leads enable row level security;

create policy "Envio publico de leads de patrocinio"
  on patrocinador_leads for insert
  with check (true);

create policy "Leitura e gestao autenticada dos leads de patrocinio"
  on patrocinador_leads for all
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

-- bucket de imagens das notícias
insert into storage.buckets (id, name, public)
values ('noticias', 'noticias', true)
on conflict (id) do nothing;

create policy "Leitura publica das imagens de noticias"
  on storage.objects for select
  using (bucket_id = 'noticias');

create policy "Upload autenticado de imagens de noticias"
  on storage.objects for insert
  with check (bucket_id = 'noticias' and auth.role() = 'authenticated');

create policy "Atualizacao autenticada de imagens de noticias"
  on storage.objects for update
  using (bucket_id = 'noticias' and auth.role() = 'authenticated');

create policy "Exclusao autenticada de imagens de noticias"
  on storage.objects for delete
  using (bucket_id = 'noticias' and auth.role() = 'authenticated');

-- bucket de logos dos patrocinadores
insert into storage.buckets (id, name, public)
values ('patrocinadores', 'patrocinadores', true)
on conflict (id) do nothing;

create policy "Leitura publica dos logos de patrocinadores"
  on storage.objects for select
  using (bucket_id = 'patrocinadores');

create policy "Upload autenticado de logos de patrocinadores"
  on storage.objects for insert
  with check (bucket_id = 'patrocinadores' and auth.role() = 'authenticated');

create policy "Atualizacao autenticada de logos de patrocinadores"
  on storage.objects for update
  using (bucket_id = 'patrocinadores' and auth.role() = 'authenticated');

create policy "Exclusao autenticada de logos de patrocinadores"
  on storage.objects for delete
  using (bucket_id = 'patrocinadores' and auth.role() = 'authenticated');
