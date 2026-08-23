-- adiciona o campo de Instagram no cadastro de patrocinadores
alter table patrocinadores add column if not exists instagram_url text;
