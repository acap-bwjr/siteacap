/* ---------- ACAP Futsal — vitrine de patrocinadores + captação de leads ---------- */

if (typeof isSupabaseConfigured !== "undefined" && isSupabaseConfigured) {
  carregarPatrocinadores();
}

async function carregarPatrocinadores() {
  const { data, error } = await supabaseClient
    .from("patrocinadores")
    .select("*")
    .order("ordem", { ascending: true });

  if (error || !data || data.length === 0) return;

  const grid = document.getElementById("patrocinadoresGrid");
  if (!grid) return;

  grid.innerHTML = data.map(p => {
    const inner = `
      <img src="${p.logo_url}" alt="${p.nome}">
      <span class="patrocinador-card__nome">${p.nome}</span>
      ${p.categoria ? `<span class="patrocinador-card__categoria">${p.categoria}</span>` : ""}
    `;
    return p.link_url
      ? `<a href="${p.link_url}" target="_blank" rel="noopener" class="patrocinador-card reveal is-visible">${inner}</a>`
      : `<div class="patrocinador-card reveal is-visible">${inner}</div>`;
  }).join("");
}

document.getElementById("patrocinioForm")?.addEventListener("submit", handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("submitBtn");
  const formMsg = document.getElementById("formMsg");
  formMsg.innerHTML = "";

  if (typeof isSupabaseConfigured === "undefined" || !isSupabaseConfigured) {
    formMsg.innerHTML = `<div class="admin-msg admin-msg--error">Formulário indisponível no momento. Tente novamente mais tarde.</div>`;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    const payload = {
      nome_empresa: document.getElementById("fNomeEmpresa").value.trim(),
      nome_contato: document.getElementById("fNomeContato").value.trim(),
      telefone: document.getElementById("fTelefone").value.trim(),
      email: document.getElementById("fEmail").value.trim(),
      mensagem: document.getElementById("fMensagem").value.trim() || null,
    };

    const { error } = await supabaseClient.from("patrocinador_leads").insert(payload);
    if (error) throw error;

    formMsg.innerHTML = `<div class="admin-msg admin-msg--ok">Proposta enviada! Nossa equipe vai entrar em contato em breve.</div>`;
    document.getElementById("patrocinioForm").reset();
  } catch (err) {
    formMsg.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(err.message || "Não foi possível enviar. Tente novamente.")}</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar proposta";
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
