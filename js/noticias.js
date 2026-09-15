/* ---------- ACAP Futsal — renderiza notícias vindas do Supabase ---------- */

if (typeof isSupabaseConfigured !== "undefined" && isSupabaseConfigured) {
  carregarNoticias();
}

async function carregarNoticias() {
  const { data, error } = await supabaseClient
    .from("noticias")
    .select("*")
    .order("data_publicacao", { ascending: false });

  if (error || !data || data.length === 0) return;

  renderNoticias(data);
}

function renderNoticias(noticias) {
  const grid = document.getElementById("noticiasGrid");
  if (!grid) return;

  grid.innerHTML = noticias.map(noticia => {
    const imageHtml = noticia.imagem_url
      ? `<img class="noticia-card__image" src="${escapeHtml(noticia.imagem_url)}" alt="${escapeHtml(noticia.titulo)}">`
      : `<span class="noticia-card__image-placeholder"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M18 10h-8"/><path d="M4 4h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg></span>`;

    const corpoHtml = noticia.corpo
      ? `
        <p class="noticia-card__corpo">${escapeHtml(noticia.corpo)}</p>
        <button class="noticia-card__toggle" type="button" data-toggle>
          <span class="noticia-card__toggle-label">Ler mais</span>
          <span class="noticia-card__toggle-label--close">Ler menos</span>
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>`
      : "";

    return `
      <div class="noticia-card reveal is-visible">
        ${imageHtml}
        <div class="noticia-card__body">
          <div class="noticia-card__meta">
            ${noticia.categoria ? `<span class="noticia-card__categoria">${escapeHtml(noticia.categoria)}</span> ·` : ""}
            <span>${formatarDataBR(noticia.data_publicacao)}</span>
          </div>
          <h3 class="noticia-card__title">${escapeHtml(noticia.titulo)}</h3>
          <p class="noticia-card__resumo">${escapeHtml(noticia.resumo)}</p>
          ${corpoHtml}
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll("[data-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".noticia-card").classList.toggle("is-expanded");
    });
  });
}

function formatarDataBR(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
