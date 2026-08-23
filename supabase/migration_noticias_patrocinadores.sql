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
