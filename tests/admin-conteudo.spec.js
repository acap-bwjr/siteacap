const { test, expect } = require("@playwright/test");
const { installMockSupabase, MOCK_EMAIL, MOCK_PASSWORD } = require("./helpers/mock-supabase");

function baseSeed() {
  return {
    jogos: [],
    jogos_resultados: [],
    noticias: [
      {
        id: "n1",
        titulo: "ACAP vence Campeonato Paulista",
        resumo: "Resumo da conquista.",
        corpo: "Corpo completo.",
        categoria: "Conquistas",
        data_publicacao: "2026-08-01",
        imagem_url: null,
      },
    ],
    patrocinadores: [
      { id: "p1", nome: "Empresa X", logo_url: "https://example.com/x.png", link_url: "https://empresax.com", categoria: "Master", ordem: 0 },
    ],
    avaliacao_inscricoes: [
      {
        id: "a1",
        nome_atleta: "Pedro Silva",
        data_nascimento: "2014-01-01",
        categoria_interesse: "Sub-12",
        posicao: "Ala",
        nome_responsavel: "Ana Silva",
        telefone: "11999998888",
        email: "ana@teste.com",
        experiencia_anterior: null,
        observacoes: null,
        created_at: "2026-08-10T10:00:00Z",
      },
    ],
    patrocinador_leads: [
      {
        id: "pl1",
        nome_empresa: "Empresa Y",
        nome_contato: "Bruno",
        telefone: "11977776666",
        email: "bruno@empresay.com",
        mensagem: "Interesse em patrocinar",
        created_at: "2026-08-11T14:00:00Z",
      },
    ],
  };
}

async function login(page) {
  await page.fill("#loginEmail", MOCK_EMAIL);
  await page.fill("#loginPassword", MOCK_PASSWORD);
  await page.click('#loginForm button[type="submit"]');
  await page.waitForSelector("#adminMain:not([hidden])");
}

test.beforeEach(async ({ page }) => {
  await installMockSupabase(page, baseSeed());
  await page.goto("/admin.html");
  await login(page);
});

test("aba Notícias: cadastra uma notícia nova e lista as existentes", async ({ page }) => {
  await page.click('[data-admin-tab="noticias"]');
  await expect(page.locator(".admin-row", { hasText: "ACAP vence Campeonato Paulista" })).toBeVisible();

  await page.fill("#fTitulo", "Nova conquista da Academy");
  await page.fill("#fResumo", "Resumo curto da notícia.");
  await page.fill("#fCorpo", "Texto completo da notícia.");
  await page.fill("#fCategoria", "Institucional");
  await page.fill("#fDataPublicacao", "2026-08-17");
  await page.click("#noticiaSubmitBtn");

  await expect(page.locator("#noticiaFormMsg .admin-msg--ok")).toBeVisible();
  await expect(page.locator(".admin-row", { hasText: "Nova conquista da Academy" })).toBeVisible();
});

test("aba Notícias: editar repopula o formulário", async ({ page }) => {
  await page.click('[data-admin-tab="noticias"]');
  const row = page.locator(".admin-row", { hasText: "ACAP vence Campeonato Paulista" });
  await row.locator("[data-edit]").click();

  await expect(page.locator("#noticiaFormTitle")).toHaveText("Editar notícia");
  await expect(page.locator("#fTitulo")).toHaveValue("ACAP vence Campeonato Paulista");
  await expect(page.locator("#fResumo")).toHaveValue("Resumo da conquista.");
});

test("aba Patrocinadores: cadastra um patrocinador novo (exige logo)", async ({ page }) => {
  await page.click('[data-admin-tab="patrocinadores"]');
  await expect(page.locator(".admin-row", { hasText: "Empresa X" })).toBeVisible();

  await page.fill("#fNome", "Empresa Nova");
  await page.click("#patrocinadorSubmitBtn");
  await expect(page.locator("#patrocinadorFormMsg .admin-msg--error")).toBeVisible();

  const inserted = await page.evaluate(() => window.__mockDb.patrocinadores.length);
  expect(inserted).toBe(1);
});

test("aba Patrocinadores: editar repopula o formulário", async ({ page }) => {
  await page.click('[data-admin-tab="patrocinadores"]');
  const row = page.locator(".admin-row", { hasText: "Empresa X" });
  await row.locator("[data-edit]").click();

  await expect(page.locator("#patrocinadorFormTitle")).toHaveText("Editar patrocinador");
  await expect(page.locator("#fNome")).toHaveValue("Empresa X");
  await expect(page.locator("#fLinkUrl")).toHaveValue("https://empresax.com");
});

test("aba Leads: mostra inscrições de avaliação e propostas de patrocínio, com exclusão", async ({ page }) => {
  await page.click('[data-admin-tab="leads"]');

  await expect(page.locator("#avaliacaoLeadsList")).toContainText("Pedro Silva");
  await expect(page.locator("#avaliacaoLeadsList")).toContainText("Ana Silva");
  await expect(page.locator("#patrocinioLeadsList")).toContainText("Empresa Y");
  await expect(page.locator("#patrocinioLeadsList")).toContainText("Bruno");

  page.on("dialog", dialog => dialog.accept());
  await page.locator("#patrocinioLeadsList [data-delete-lead]").click();
  await expect(page.locator("#patrocinioLeadsList")).toContainText("Nenhuma proposta recebida ainda.");
});
