-- Migração: adiciona a coluna de categorias que jogam no dia.
-- Rode isso no SQL Editor do Supabase (sua tabela "jogos" já existe,
-- então só precisa desse ALTER — não precisa rodar o schema.sql de novo).

alter table jogos add column if not exists categorias text[];
