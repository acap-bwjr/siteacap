/* ---------- ACAP Futsal — renderiza jogos vindos do Supabase ---------- */

if (typeof isSupabaseConfigured !== "undefined" && isSupabaseConfigured) {
  carregarJogos();
}

async function carregarJogos() {
  const { data, error } = await supabaseClient
    .from("jogos")
    .select("*")
    .order("data", { ascending: true });

  if (error || !data) return;

  const { data: resultadosData } = await supabaseClient.from("jogos_resultados").select("*");
  const resultadosPorJogo = {};
  (resultadosData || []).forEach(r => { (resultadosPorJogo[r.jogo_id] ||= []).push(r); });
  data.forEach(j => { j._resultados = resultadosPorJogo[j.id] || []; });

  const hoje = todayLocalISO();
  const proximos = data.filter(j => j.status !== "realizado" && j.data >= hoje);
  const resultados = data
    .filter(j => j.status === "realizado")
    .sort((a, b) => (a.data < b.data ? 1 : -1));

  renderPainel("jogosProximos", proximos, false);
  renderPainel("jogosResultados", resultados, true);

  document.querySelectorAll(".jogos-empty").forEach(el => el.remove());
  if (proximos.length === 0) restoreEmptyState("jogosProximos");
  if (resultados.length === 0) restoreEmptyState("jogosResultados");
}

function renderPainel(containerId, jogos, isResultado) {
  const container = document.getElementById(containerId);
  if (!container || jogos.length === 0) return;

  const teamLabel = { time1: "Time 1", time2: "Time 2", academy: "Academy" };
  const resultLabel = { vitoria: "Vitória", empate: "Empate", derrota: "Derrota" };

  container.innerHTML = jogos.map((jogo, index) => {
    const isNext = !isResultado && index === 0;
    const logoHtml = jogo.adversario_logo_url
      ? `<img class="jogo-card__opponent-photo" src="${escapeHtml(jogo.adversario_logo_url)}" alt="">`
      : `<span class="jogo-card__opponent-placeholder">?</span>`;

    const temResultadosPorCategoria = isResultado && jogo._resultados && jogo._resultados.length > 0;

    const middleHtml = isResultado && !temResultadosPorCategoria
      ? `<span class="jogo-card__score">${jogo.placar_acap ?? "-"} – ${jogo.placar_adversario ?? "-"}</span>`
      : `<span class="jogo-card__vs">×</span>`;

    let resultBadge = "";
    if (isResultado && !temResultadosPorCategoria && jogo.placar_acap !== null && jogo.placar_adversario !== null) {
      const outcome = jogo.placar_acap > jogo.placar_adversario ? "vitoria"
        : jogo.placar_acap < jogo.placar_adversario ? "derrota"
        : "empate";
      resultBadge = `<span class="jogo-card__result-badge jogo-card__result-badge--${outcome}">${resultLabel[outcome]}</span>`;
    }

    const resultadosCategoriasHtml = temResultadosPorCategoria
      ? `<div class="jogo-card__resultados-categorias">${jogo._resultados.map(r => {
          let badge = "";
          if (r.placar_acap !== null && r.placar_adversario !== null) {
            const outcome = r.placar_acap > r.placar_adversario ? "vitoria"
              : r.placar_acap < r.placar_adversario ? "derrota"
              : "empate";
            badge = `<span class="jogo-card__result-badge jogo-card__result-badge--${outcome}">${resultLabel[outcome]}</span>`;
          }
          return `
            <div class="jogo-card__resultado-categoria">
              <span class="jogo-card__resultado-categoria__nome">${escapeHtml(r.categoria)}</span>
              <span class="jogo-card__resultado-categoria__placar">${r.placar_acap ?? "-"} – ${r.placar_adversario ?? "-"}</span>
              ${badge}
            </div>`;
        }).join("")}</div>`
      : "";

    const acapCrest = jogo.team === "time2" ? "assets/img/acap-crest-time2.webp" : "assets/img/acap-crest.webp";
    const acapLabel = jogo.team === "time2" ? 'ACAP "2"' : jogo.team === "academy" ? "ACAP ACADEMY" : "ACAP";
    const dataFmt = formatarDataBR(jogo.data);
    const horaFmt = jogo.hora ? ` · ${jogo.hora.slice(0, 5)}` : "";
    const localFmt = jogo.local_tipo === "casa" ? "Casa" : "Fora";
    const localNome = jogo.local_nome ? ` · ${escapeHtml(jogo.local_nome)}` : "";

    return `
      <div class="jogo-card reveal is-visible${isNext ? " jogo-card--next" : ""}" data-team="${jogo.team}">
        ${isNext ? `<span class="jogo-card__next-badge">Próximo jogo</span>` : ""}
        <div class="jogo-card__top">
          <span class="jogo-card__team jogo-card__team--${jogo.team}">${teamLabel[jogo.team] || jogo.team}</span>
          <span class="jogo-card__competicao">${escapeHtml(jogo.competicao)}</span>
        </div>
        <div class="jogo-card__match">
          <div class="jogo-card__side">
            <img class="jogo-card__acap-crest" src="${acapCrest}" alt="">
            <span>${acapLabel}</span>
          </div>
          ${middleHtml}
          <div class="jogo-card__side">
            ${logoHtml}
            <span>${escapeHtml(jogo.adversario)}</span>
          </div>
        </div>
        <div class="jogo-card__meta">
          <span><svg aria-hidden="true" class="lucide lucide-calendar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M8 2v3" /> <path d="M16 2v3" /> <rect x="3" y="3" width="18" height="18" rx="2" /> <path d="M3 9h18" /> </svg> ${dataFmt}${horaFmt}</span>
          <span><svg aria-hidden="true" class="lucide lucide-map-pin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /> <circle cx="12" cy="10" r="3" /> </svg> ${localFmt}${localNome}</span>
        </div>
        ${jogo.categorias && jogo.categorias.length && !temResultadosPorCategoria
          ? `<div class="jogo-card__categorias">${jogo.categorias.map(c => `<span class="jogo-card__cat-pill">${escapeHtml(c)}</span>`).join("")}</div>`
          : ""}
        ${resultadosCategoriasHtml}
        ${resultBadge ? `<div class="jogo-card__meta">${resultBadge}</div>` : ""}
      </div>
    `;
  }).join("");
}

function restoreEmptyState(containerId) {
  const container = document.getElementById(containerId);
  if (!container || container.querySelector(".jogo-card")) return;
  const isResultados = containerId === "jogosResultados";
  container.innerHTML = `
    <div class="jogos-empty reveal is-visible">
      <span class="jogos-empty__icon">${isResultados ? `<svg aria-hidden="true" class="lucide lucide-trophy" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2" /> <path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2" /> <path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3" /> <path d="M4 22h16" /> <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" /> <path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3" /> </svg>` : `<svg aria-hidden="true" class="lucide lucide-calendar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M8 2v3" /> <path d="M16 2v3" /> <rect x="3" y="3" width="18" height="18" rx="2" /> <path d="M3 9h18" /> </svg>`}</span>
      <h3>${isResultados ? "Nenhum resultado registrado ainda" : "Tabela ainda não divulgada"}</h3>
      <p>${isResultados
        ? "Os resultados do Time 1, do Time 2 e da ACAP Academy vão aparecer aqui conforme os jogos acontecem."
        : "Assim que a Federação divulgar o calendário da temporada, os próximos jogos do Time 1, do Time 2 e da ACAP Academy aparecem aqui."}</p>
      ${isResultados ? "" : `<a href="https://www.instagram.com/acap_futsal/" target="_blank" rel="noopener" class="btn btn--ghost">Acompanhar no Instagram</a>`}
    </div>
  `;
}

function formatarDataBR(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

// Data local (não UTC) no formato YYYY-MM-DD. `toISOString().slice(0, 10)`
// converte para UTC antes de fatiar, o que faz a data "virar" mais cedo do
// que o esperado em fusos atrás de UTC (ex.: America/Sao_Paulo, UTC-3) —
// um jogo agendado para hoje à noite sumia da lista de "Próximos jogos".
function todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
