/*
  Configuração do Supabase — ACAP Futsal.

  1. Crie um projeto gratuito em https://supabase.com
  2. Rode o script em supabase/schema.sql (Project > SQL Editor)
  3. Em Project Settings > API, copie a "Project URL" e a chave "anon public"
     e cole abaixo. Essas duas informações são seguras para ficar no código
     do site — quem protege os dados são as políticas de acesso (RLS) do
     schema.sql, não o sigilo dessas chaves.
  4. Em Authentication > Users, crie o login (e-mail + senha) que vai usar
     para entrar em admin.html.
*/

const SUPABASE_URL = "https://xldjreudwovbwzhhsffj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KZqdjxPvLKAR9qYAHbk3YA_W1TNvGUO";

const isSupabaseConfigured =
  !SUPABASE_URL.includes("COLOQUE_") && !SUPABASE_ANON_KEY.includes("COLOQUE_");

const supabaseClient = isSupabaseConfigured
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
