const { test, expect } = require("@playwright/test");
const { installMockSupabase } = require("./helpers/mock-supabase");

const SEED = {
  jogos: [
    {
      id: "jogo-time1-proximo",
      team: "time1",
      competicao: "Campeonato Paulista",
      adversario: "São Bernardo Futsal",
      adversario_logo_url: null,
      data: "2099-01-10",
      hora: "20:00:00",
      local_tipo: "casa",
      local_nome: "Arena ACAP",
      categorias: null,
      status: "agendado",
      placar_acap: null,
      placar_adversario: null,
    },
    {
      id: "jogo-time2-proximo",
      team: "time2",
      competicao: "Copa União",
      adversario: "Camilópolis",
      adversario_logo_url: null,
      data: "2099-01-17",
      hora: "14:30:00",
      local_tipo: "casa",
      local_nome: "Ginásio Noemia",
      categorias: ["Sub-12", "Sub-14"],
      status: "agendado",
      placar_acap: null,
      placar_adversario: null,
    },
    {
      id: "jogo-academy-proximo",
      team: "academy",
      competicao: "Amistoso",
      adversario: "Guarulhos Futsal",
      adversario_logo_url: null,
      data: "2099-01-24",
      hora: "10:00:00",
      local_tipo: "fora",
      local_nome: null,
      categorias: null,
      status: "agendado",
      placar_acap: null,
      placar_adversario: null,
    },
    {
      id: "jogo-time1-resultado",
      team: "time1",
      competicao: "Campeonato Paulista",
      adversario: "Osasco Futsal",
      adversario_logo_url: null,
      data: "2020-05-01",
      hora: "19:00:00",
      local_tipo: "casa",
      local_nome: "Arena ACAP",
      categorias: null,
      status: "realizado",
      placar_acap: 5,
      placar_adversario: 2,
    },
    {
      id: "jogo-time2-resultado-multi",
      team: "time2",
      competicao: "Campeonato Paulista",
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
    { id: "res-1", jogo_id: "jogo-time2-resultado-multi", categoria: "Sub-12", placar_acap: 5, placar_adversario: 3 },
    { id: "res-2", jogo_id: "jogo-time2-resultado-multi", categoria: "Sub-14", placar_acap: 2, placar_adversario: 4 },
  ],
};

test.beforeEach(async ({ page }) => {
  await installMockSupabase(page, structuredClone(SEED));
  await page.goto("/jogos.html");
  await page.waitForSelector("#jogosProximos .jogo-card");
});

test("mostra os próximos jogos com a marca certa por time", async ({ page }) => {
  const cards = page.locator("#jogosProximos .jogo-card");
  await expect(cards).toHaveCount(3);

  const time1Card = page.locator('#jogosProximos .jogo-card[data-team="time1"]');
  await expect(time1Card.locator(".jogo-card__side span").first()).toHaveText("ACAP");

  const time2Card = page.locator('#jogosProximos .jogo-card[data-team="time2"]');
  await expect(time2Card.locator(".jogo-card__side span").first()).toHaveText('ACAP "2"');
  await expect(time2Card.locator(".jogo-card__cat-pill")).toHaveText(["Sub-12", "Sub-14"]);

  const academyCard = page.locator('#jogosProximos .jogo-card[data-team="academy"]');
  await expect(academyCard.locator(".jogo-card__side span").first()).toHaveText("ACAP ACADEMY");
});

test("filtro por time esconde os cards dos outros times", async ({ page }) => {
  await page.click('[data-team-filter="time2"]');
  const visible = page.locator("#jogosProximos .jogo-card:visible");
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveAttribute("data-team", "time2");

  await page.click('[data-team-filter="todos"]');
  await expect(page.locator("#jogosProximos .jogo-card:visible")).toHaveCount(3);
});

test("aba Resultados: placar único mostra score e resultado por categoria mostra uma linha por categoria", async ({ page }) => {
  await page.click('[data-status-filter="resultados"]');
  const cards = page.locator("#jogosResultados .jogo-card");
  await expect(cards).toHaveCount(2);

  const singleCard = page.locator("#jogosResultados .jogo-card#nope, #jogosResultados .jogo-card").filter({ hasText: "Osasco Futsal" });
  await expect(singleCard.locator(".jogo-card__score")).toHaveText("5 – 2");
  await expect(singleCard.locator(".jogo-card__result-badge")).toHaveText("Vitória");
  await expect(singleCard.locator(".jogo-card__resultados-categorias")).toHaveCount(0);

  const multiCard = page.locator("#jogosResultados .jogo-card").filter({ hasText: "Camilópolis" });
  await expect(multiCard.locator(".jogo-card__score")).toHaveCount(0);
  await expect(multiCard.locator(".jogo-card__categorias")).toHaveCount(0);
  const rows = multiCard.locator(".jogo-card__resultado-categoria");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).locator(".jogo-card__resultado-categoria__nome")).toHaveText("Sub-12");
  await expect(rows.nth(0).locator(".jogo-card__resultado-categoria__placar")).toHaveText("5 – 3");
  await expect(rows.nth(0).locator(".jogo-card__result-badge")).toHaveText("Vitória");
  await expect(rows.nth(1).locator(".jogo-card__result-badge")).toHaveText("Derrota");
});
