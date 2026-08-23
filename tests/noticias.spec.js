const { test, expect } = require("@playwright/test");
const { installMockSupabase } = require("./helpers/mock-supabase");

const SEED = {
  jogos: [],
  jogos_resultados: [],
  noticias: [
    {
      id: "n1",
      titulo: "ACAP vence Campeonato Paulista Sub-14",
      resumo: "Time sub-14 conquista o título após vitória de virada na final.",
      corpo: "Depois de sair atrás no placar, o time sub-14 virou o jogo no segundo tempo.",
      categoria: "Conquistas",
      data_publicacao: "2026-08-15",
      imagem_url: null,
    },
    {
      id: "n2",
      titulo: "Inscrições abertas para avaliação 2026",
      resumo: "ACAP abre novas vagas para avaliação de atletas em todas as categorias.",
      corpo: null,
      categoria: "Institucional",
      data_publicacao: "2026-08-10",
      imagem_url: null,
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await installMockSupabase(page, structuredClone(SEED));
  await page.goto("/noticias.html");
  await page.waitForSelector(".noticia-card");
});

test("lista as notícias mais recentes primeiro, com categoria e data", async ({ page }) => {
  const cards = page.locator(".noticia-card");
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0).locator(".noticia-card__title")).toHaveText("ACAP vence Campeonato Paulista Sub-14");
  await expect(cards.nth(0).locator(".noticia-card__categoria")).toHaveText("Conquistas");
});

test('"Ler mais" expande o corpo da notícia, e some quando não há corpo', async ({ page }) => {
  const firstCard = page.locator(".noticia-card").nth(0);
  await expect(firstCard.locator(".noticia-card__corpo")).toBeHidden();
  await firstCard.locator(".noticia-card__toggle").click();
  await expect(firstCard).toHaveClass(/is-expanded/);
  await expect(firstCard.locator(".noticia-card__corpo")).toBeVisible();

  const secondCard = page.locator(".noticia-card").nth(1);
  await expect(secondCard.locator(".noticia-card__toggle")).toHaveCount(0);
});
