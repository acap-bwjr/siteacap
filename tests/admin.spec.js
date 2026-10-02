const { test, expect } = require("@playwright/test");
const { installMockSupabase, MOCK_EMAIL, MOCK_PASSWORD } = require("./helpers/mock-supabase");

function baseSeed() {
  return {
    jogos: [
      {
        id: "jogo-existente",
        team: "time1",
        competicao: "Campeonato Paulista",
        adversario: "Osasco Futsal",
        adversario_logo_url: null,
        data: "2099-02-01",
        hora: "20:00:00",
        local_tipo: "casa",
        local_nome: "Arena ACAP",
        categorias: null,
        status: "agendado",
        placar_acap: null,
        placar_adversario: null,
      },
      {
        id: "jogo-multi-existente",
        team: "time2",
        competicao: "Copa União",
        adversario: "Camilópolis",
        adversario_logo_url: null,
        data: "2020-06-01",
        hora: "14:30:00",
        local_tipo: "casa",
        local_nome: "Ginásio Noemia",
        categorias: ["Sub-12", "Sub-14"],
        status: "realizado",
        placar_acap: null,
        placar_adversario: null,
      },
    ],
    jogos_resultados: [
      { id: "res-1", jogo_id: "jogo-multi-existente", categoria: "Sub-12", placar_acap: 5, placar_adversario: 3 },
      { id: "res-2", jogo_id: "jogo-multi-existente", categoria: "Sub-14", placar_acap: 2, placar_adversario: 4 },
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
});

test("login com credenciais erradas mostra mensagem de erro", async ({ page }) => {
  await page.fill("#loginEmail", "errado@teste.com");
  await page.fill("#loginPassword", "senhaerrada");
  await page.click('#loginForm button[type="submit"]');
  await expect(page.locator("#loginMsg .admin-msg--error")).toBeVisible();
  await expect(page.locator("#adminMain")).toBeHidden();
});

test("login correto mostra o painel e lista os jogos cadastrados", async ({ page }) => {
  await login(page);
  await expect(page.locator("#userEmail")).toHaveText(MOCK_EMAIL);
  await expect(page.locator(".admin-row")).toHaveCount(2);
  await expect(page.locator(".admin-row", { hasText: "Osasco Futsal" })).toBeVisible();
});

test("jogo com resultado por categoria aparece com o placar de cada categoria na lista", async ({ page }) => {
  await login(page);
  const row = page.locator(".admin-row", { hasText: "Camilópolis" });
  await expect(row.locator(".admin-row__title")).toContainText("Sub-12: 5×3");
  await expect(row.locator(".admin-row__title")).toContainText("Sub-14: 2×4");
});

test("cadastra um jogo novo com placar único", async ({ page }) => {
  await login(page);

  await page.selectOption("#fTeam", "time1");
  await page.fill("#fCompeticao", "Amistoso");
  await page.fill("#fAdversario", "São Bernardo Futsal");
  await page.fill("#fData", "2099-03-01");
  await page.check('input[name="fStatus"][value="realizado"]');
  await page.fill("#fPlacarAcap", "4");
  await page.fill("#fPlacarAdversario", "1");
  await page.click("#submitBtn");

  await expect(page.locator("#formMsg .admin-msg--ok")).toBeVisible();
  const row = page.locator(".admin-row", { hasText: "São Bernardo Futsal" });
  await expect(row).toBeVisible();
  await expect(row.locator(".admin-row__title")).toContainText("4 × 1");
});

test("com 2+ categorias marcadas, troca pro placar por categoria e salva os resultados", async ({ page }) => {
  await login(page);

  await page.selectOption("#fTeam", "time2");
  await page.fill("#fCompeticao", "Campeonato Paulista");
  await page.fill("#fAdversario", "Guarulhos Futsal");
  await page.fill("#fData", "2099-04-01");
  await page.check('input[name="fCategorias"][value="Sub-16"]');
  await expect(page.locator("#placarFields")).toBeHidden();

  await page.check('input[name="fCategorias"][value="Sub-18"]');
  await page.check('input[name="fStatus"][value="realizado"]');
  await expect(page.locator("#placarFields")).toBeHidden();
  await expect(page.locator("#placarCategoriasFields")).toBeVisible();

  await page.fill('.fPlacarCategoriaAcap[data-categoria="Sub-16"]', "3");
  await page.fill('.fPlacarCategoriaAdversario[data-categoria="Sub-16"]', "1");
  await page.fill('.fPlacarCategoriaAcap[data-categoria="Sub-18"]', "2");
  await page.fill('.fPlacarCategoriaAdversario[data-categoria="Sub-18"]', "2");
  await page.click("#submitBtn");

  await expect(page.locator("#formMsg .admin-msg--ok")).toBeVisible();
  const row = page.locator(".admin-row", { hasText: "Guarulhos Futsal" });
  await expect(row.locator(".admin-row__title")).toContainText("Sub-16: 3×1");
  await expect(row.locator(".admin-row__title")).toContainText("Sub-18: 2×2");
});

test("editar um jogo existente repopula o formulário, incluindo categorias e placar por categoria", async ({ page }) => {
  await login(page);

  const row = page.locator(".admin-row", { hasText: "Camilópolis" });
  await row.locator("[data-edit]").click();

  await expect(page.locator("#formTitle")).toHaveText("Editar jogo");
  await expect(page.locator("#fAdversario")).toHaveValue("Camilópolis");
  await expect(page.locator('input[name="fCategorias"][value="Sub-12"]')).toBeChecked();
  await expect(page.locator('input[name="fCategorias"][value="Sub-14"]')).toBeChecked();
  await expect(page.locator('.fPlacarCategoriaAcap[data-categoria="Sub-12"]')).toHaveValue("5");
  await expect(page.locator('.fPlacarCategoriaAdversario[data-categoria="Sub-14"]')).toHaveValue("4");
});

test("excluir um jogo remove ele da lista", async ({ page }) => {
  await login(page);
  page.on("dialog", dialog => dialog.accept());

  const row = page.locator(".admin-row", { hasText: "Osasco Futsal" });
  await row.locator("[data-delete]").click();

  await expect(page.locator(".admin-row", { hasText: "Osasco Futsal" })).toHaveCount(0);
  await expect(page.locator(".admin-row")).toHaveCount(1);
});

test("colar mensagem de jogo preenche o formulário, com um jogo por horário/categoria", async ({ page }) => {
  await login(page);

  const msg = `Paulistão GOLD 2026

📆 Sábado dia 03/Out/2026

🏟️Local: Teotônio Vilela

🚗Rua Carlos Clauseti, 19 - Jd Sapopema

⚽ Acap/Bola no Pé
⚽ Taboão/F9

⏰ 13:00h Sub-14

⏰ 13:50h Sub-12`;

  await page.fill("#fPasteMsg", msg);
  await page.click("#parseJogoBtn");

  await expect(page.locator("#fCompeticao")).toHaveValue("Paulistão GOLD 2026");
  await expect(page.locator("#fAdversario")).toHaveValue("Bola no Pé");
  await expect(page.locator("#fData")).toHaveValue("2026-10-03");
  await expect(page.locator("#fLocalNome")).toHaveValue("Teotônio Vilela");
  await expect(page.locator("#fHora")).toHaveValue("13:00");
  await expect(page.locator('input[name="fCategorias"][value="Sub-14"]')).toBeChecked();
  await expect(page.locator('input[name="fCategorias"][value="Sub-12"]')).not.toBeChecked();

  await page.click('[data-parse-index="1"]');

  await expect(page.locator("#fHora")).toHaveValue("13:50");
  await expect(page.locator('input[name="fCategorias"][value="Sub-12"]')).toBeChecked();
  await expect(page.locator('input[name="fCategorias"][value="Sub-14"]')).not.toBeChecked();
  await expect(page.locator("#fAdversario")).toHaveValue("Bola no Pé");
});

test("colar mensagem sem dados reconhecíveis mostra aviso e não mexe no formulário", async ({ page }) => {
  await login(page);

  await page.fill("#fPasteMsg", "oi, bom dia pessoal!");
  await page.click("#parseJogoBtn");

  await expect(page.locator("#parseJogoResult")).toContainText("Não consegui identificar");
  await expect(page.locator("#fCompeticao")).toHaveValue("");
  await expect(page.locator("#fAdversario")).toHaveValue("");
});
