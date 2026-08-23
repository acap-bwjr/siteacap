const { test, expect } = require("@playwright/test");
const { installMockSupabase } = require("./helpers/mock-supabase");

const SEED = {
  jogos: [],
  jogos_resultados: [],
  patrocinadores: [
    { id: "p1", nome: "Empresa X", logo_url: "https://example.com/x.png", link_url: "https://empresax.com", categoria: "Master", ordem: 0 },
    { id: "p2", nome: "Empresa Y", logo_url: "https://example.com/y.png", link_url: null, categoria: "Apoiador", ordem: 1 },
  ],
  patrocinador_leads: [],
};

test.beforeEach(async ({ page }) => {
  await installMockSupabase(page, structuredClone(SEED));
  await page.goto("/patrocinadores.html");
  await page.waitForSelector(".patrocinador-card");
});

test("lista os patrocinadores cadastrados, em ordem", async ({ page }) => {
  const cards = page.locator(".patrocinador-card");
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0).locator(".patrocinador-card__nome")).toHaveText("Empresa X");
  await expect(cards.nth(0)).toHaveAttribute("href", "https://empresax.com");
  await expect(cards.nth(1)).not.toHaveAttribute("href", /.+/);
});

test("envia a proposta de patrocínio e salva os dados corretos", async ({ page }) => {
  await page.fill("#fNomeEmpresa", "Empresa Teste LTDA");
  await page.fill("#fNomeContato", "Carlos Teste");
  await page.fill("#fTelefone", "(11) 98888-7777");
  await page.fill("#fEmail", "carlos@empresateste.com");
  await page.fill("#fMensagem", "Queremos patrocinar o Time 1");
  await page.click("#submitBtn");

  await expect(page.locator("#formMsg .admin-msg--ok")).toBeVisible();

  const inserted = await page.evaluate(() => window.__mockDb.patrocinador_leads);
  expect(inserted).toHaveLength(1);
  expect(inserted[0]).toMatchObject({
    nome_empresa: "Empresa Teste LTDA",
    nome_contato: "Carlos Teste",
    telefone: "(11) 98888-7777",
    email: "carlos@empresateste.com",
    mensagem: "Queremos patrocinar o Time 1",
  });

  await expect(page.locator("#fNomeEmpresa")).toHaveValue("");
});

test("campos obrigatórios impedem o envio da proposta", async ({ page }) => {
  await page.click("#submitBtn");
  const inserted = await page.evaluate(() => window.__mockDb.patrocinador_leads);
  expect(inserted).toHaveLength(0);
});
