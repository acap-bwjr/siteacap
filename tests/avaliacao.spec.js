const { test, expect } = require("@playwright/test");
const { installMockSupabase } = require("./helpers/mock-supabase");

test.beforeEach(async ({ page }) => {
  await installMockSupabase(page, { jogos: [], jogos_resultados: [], avaliacao_inscricoes: [] });
  await page.goto("/avaliacao.html");
});

test("envia a inscrição e salva os dados corretos", async ({ page }) => {
  await page.fill("#fNomeAtleta", "João Teste");
  await page.fill("#fDataNascimento", "2014-05-10");
  await page.selectOption("#fCategoria", "Sub-12");
  await page.selectOption("#fPosicao", "Ala");
  await page.fill("#fNomeResponsavel", "Maria Teste");
  await page.fill("#fTelefone", "(11) 91234-5678");
  await page.fill("#fEmail", "maria@teste.com");
  await page.fill("#fExperiencia", "Jogou 1 ano em outro clube");
  await page.click("#submitBtn");

  await expect(page.locator("#formMsg .admin-msg--ok")).toBeVisible();

  const inserted = await page.evaluate(() => window.__mockDb.avaliacao_inscricoes);
  expect(inserted).toHaveLength(1);
  expect(inserted[0]).toMatchObject({
    nome_atleta: "João Teste",
    data_nascimento: "2014-05-10",
    categoria_interesse: "Sub-12",
    posicao: "Ala",
    nome_responsavel: "Maria Teste",
    telefone: "(11) 91234-5678",
    email: "maria@teste.com",
    experiencia_anterior: "Jogou 1 ano em outro clube",
    observacoes: null,
  });

  await expect(page.locator("#fNomeAtleta")).toHaveValue("");
});

test("campos obrigatórios impedem o envio do formulário", async ({ page }) => {
  await page.click("#submitBtn");
  const inserted = await page.evaluate(() => window.__mockDb.avaliacao_inscricoes);
  expect(inserted).toHaveLength(0);
});

test('botão "Marque sua avaliação!" no menu leva pra página de avaliação', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/index.html");
  await page.click('.nav__cta--solid');
  await expect(page).toHaveURL(/avaliacao\.html$/);
});
