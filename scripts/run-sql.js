// Aplica um arquivo .sql direto no Postgres do Supabase, lendo DATABASE_URL de .env.local.
// Uso: node scripts/run-sql.js supabase/minha-migracao.sql
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
}

async function main() {
  loadEnvLocal();
  const sqlPath = process.argv[2];
  if (!sqlPath) {
    console.error("Uso: node scripts/run-sql.js <caminho-do-arquivo.sql>");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL não encontrada. Crie um .env.local com DATABASE_URL=postgresql://...");
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf8");
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`OK: ${sqlPath} aplicado com sucesso.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Erro ao aplicar SQL:", err.message);
  process.exit(1);
});
