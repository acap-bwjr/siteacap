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

create policy "Envio publico de inscricoes"
  on avaliacao_inscricoes for insert
  with check (true);

create policy "Leitura e gestao autenticada das inscricoes"
  on avaliacao_inscricoes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
