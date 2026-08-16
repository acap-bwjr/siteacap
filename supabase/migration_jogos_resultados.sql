-- resultado por categoria, para jogos com mais de uma categoria no mesmo dia/local
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
