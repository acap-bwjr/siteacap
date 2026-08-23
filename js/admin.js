/* ---------- ACAP Futsal — painel de jogos ---------- */

const configWarning = document.getElementById("configWarning");
const loginScreen = document.getElementById("loginScreen");
const adminMain = document.getElementById("adminMain");
const headerActions = document.getElementById("headerActions");
const userEmailEl = document.getElementById("userEmail");

if (!isSupabaseConfigured) {
  configWarning.hidden = false;
} else {
  boot();
}

async function boot() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  renderAuthState(session);

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    renderAuthState(session);
  });

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  document.getElementById("jogoForm").addEventListener("submit", handleSubmit);
  document.getElementById("cancelEditBtn").addEventListener("click", resetForm);
  document.getElementById("fLogo").addEventListener("change", handleLogoPreview);
  document.querySelectorAll('input[name="fStatus"]').forEach(r =>
    r.addEventListener("change", () => updatePlacarFields())
  );
  document.querySelectorAll('input[name="fCategorias"]').forEach(cb =>
    cb.addEventListener("change", () => updatePlacarFields())
  );
  updatePlacarFields();

  initAdminTabs();

  document.getElementById("noticiaForm").addEventListener("submit", handleNoticiaSubmit);
  document.getElementById("noticiaCancelEditBtn").addEventListener("click", () => resetNoticiaForm());
  document.getElementById("fImagem").addEventListener("change", handleImagemPreview);

  document.getElementById("patrocinadorForm").addEventListener("submit", handlePatrocinadorSubmit);
  document.getElementById("patrocinadorCancelEditBtn").addEventListener("click", () => resetPatrocinadorForm());
  document.getElementById("fPatrocinadorLogo").addEventListener("change", handlePatrocinadorLogoPreview);

  resetNoticiaForm();
}

function initAdminTabs() {
  const tabs = document.querySelectorAll("[data-admin-tab]");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.toggle("active", t === tab));
      document.querySelectorAll("[data-admin-panel]").forEach(panel => {
        panel.hidden = panel.dataset.adminPanel !== tab.dataset.adminTab;
      });
    });
  });
}

function renderAuthState(session) {
  if (session) {
    loginScreen.hidden = true;
    adminMain.hidden = false;
    headerActions.hidden = false;
    userEmailEl.textContent = session.user.email;
    loadJogos();
    loadNoticias();
    loadPatrocinadores();
    loadLeads();
  } else {
    loginScreen.hidden = false;
    adminMain.hidden = true;
    headerActions.hidden = true;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msgEl = document.getElementById("loginMsg");
  msgEl.innerHTML = "";

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    msgEl.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(error.message)}</div>`;
  }
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
}

function selectedCategorias() {
  return [...document.querySelectorAll('input[name="fCategorias"]:checked')].map(c => c.value);
}

function updatePlacarFields(prefillResultados) {
  const status = document.querySelector('input[name="fStatus"]:checked').value;
  const categorias = selectedCategorias();
  const isRealizado = status === "realizado";
  const isMulti = categorias.length >= 2;

  document.getElementById("placarFields").classList.toggle("is-visible", isRealizado && !isMulti);
  document.getElementById("placarCategoriasFields").classList.toggle("is-visible", isRealizado && isMulti);

  const list = document.getElementById("placarCategoriasList");
  if (!isRealizado || !isMulti) {
    list.innerHTML = "";
    return;
  }

  const resultadosMap = {};
  (prefillResultados || []).forEach(r => { resultadosMap[r.categoria] = r; });

  list.innerHTML = categorias.map(cat => {
    const r = resultadosMap[cat] || {};
    return `
      <div class="field--row">
        <span class="field--row__label">${cat}</span>
        <div class="field">
          <label>Placar ACAP</label>
          <input type="number" min="0" class="fPlacarCategoriaAcap" data-categoria="${cat}" value="${r.placar_acap ?? ""}">
        </div>
        <div class="field">
          <label>Placar adversário</label>
          <input type="number" min="0" class="fPlacarCategoriaAdversario" data-categoria="${cat}" value="${r.placar_adversario ?? ""}">
        </div>
      </div>
    `;
  }).join("");
}

let pendingLogoFile = null;

function handleLogoPreview(e) {
  const file = e.target.files[0];
  pendingLogoFile = file || null;
  const preview = document.getElementById("logoPreview");
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.classList.add("is-visible");
  } else {
    preview.classList.remove("is-visible");
  }
}

function resetForm(clearMsg = true) {
  document.getElementById("jogoForm").reset();
  document.getElementById("jogoId").value = "";
  document.getElementById("fLogoUrl").value = "";
  document.getElementById("logoPreview").classList.remove("is-visible");
  document.getElementById("formTitle").textContent = "Novo jogo";
  document.getElementById("submitBtn").textContent = "Salvar jogo";
  document.getElementById("cancelEditBtn").hidden = true;
  if (clearMsg) document.getElementById("formMsg").innerHTML = "";
  pendingLogoFile = null;
  updatePlacarFields();
}

async function handleSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("submitBtn");
  const formMsg = document.getElementById("formMsg");
  formMsg.innerHTML = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Salvando...";

  try {
    let logoUrl = document.getElementById("fLogoUrl").value || null;

    if (pendingLogoFile) {
      const ext = pendingLogoFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabaseClient.storage
        .from("escudos")
        .upload(path, pendingLogoFile);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabaseClient.storage.from("escudos").getPublicUrl(path);
      logoUrl = publicUrlData.publicUrl;
    }

    const status = document.querySelector('input[name="fStatus"]:checked').value;
    const categorias = selectedCategorias();
    const isMulti = categorias.length >= 2;

    const payload = {
      team: document.getElementById("fTeam").value,
      competicao: document.getElementById("fCompeticao").value.trim(),
      adversario: document.getElementById("fAdversario").value.trim(),
      adversario_logo_url: logoUrl,
      data: document.getElementById("fData").value,
      hora: document.getElementById("fHora").value || null,
      local_tipo: document.querySelector('input[name="fLocalTipo"]:checked').value,
      local_nome: document.getElementById("fLocalNome").value.trim() || null,
      categorias: categorias.length ? categorias : null,
      status,
      placar_acap: status === "realizado" && !isMulti ? toIntOrNull(document.getElementById("fPlacarAcap").value) : null,
      placar_adversario: status === "realizado" && !isMulti ? toIntOrNull(document.getElementById("fPlacarAdversario").value) : null,
    };

    const id = document.getElementById("jogoId").value;
    let jogoId = id;
    if (id) {
      const { error } = await supabaseClient.from("jogos").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { data: inserted, error } = await supabaseClient.from("jogos").insert(payload).select().single();
      if (error) throw error;
      jogoId = inserted.id;
    }

    if (status === "realizado" && isMulti) {
      const resultados = categorias.map(cat => ({
        jogo_id: jogoId,
        categoria: cat,
        placar_acap: toIntOrNull(document.querySelector(`.fPlacarCategoriaAcap[data-categoria="${cat}"]`).value),
        placar_adversario: toIntOrNull(document.querySelector(`.fPlacarCategoriaAdversario[data-categoria="${cat}"]`).value),
      }));
      const { error: delError } = await supabaseClient.from("jogos_resultados").delete().eq("jogo_id", jogoId);
      if (delError) throw delError;
      const { error: insError } = await supabaseClient.from("jogos_resultados").insert(resultados);
      if (insError) throw insError;
    } else {
      const { error: delError } = await supabaseClient.from("jogos_resultados").delete().eq("jogo_id", jogoId);
      if (delError) throw delError;
    }

    formMsg.innerHTML = `<div class="admin-msg admin-msg--ok">Jogo salvo com sucesso.</div>`;
    resetForm(false);
    loadJogos();
  } catch (err) {
    formMsg.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(err.message || "Erro ao salvar.")}</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Salvar jogo";
  }
}

async function loadJogos() {
  const listEl = document.getElementById("jogosList");
  const { data, error } = await supabaseClient
    .from("jogos")
    .select("*")
    .order("data", { ascending: false });

  if (error) {
    listEl.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    listEl.innerHTML = `<p class="admin-empty">Nenhum jogo cadastrado ainda.</p>`;
    return;
  }

  const { data: resultadosData } = await supabaseClient.from("jogos_resultados").select("*");
  const resultadosPorJogo = {};
  (resultadosData || []).forEach(r => { (resultadosPorJogo[r.jogo_id] ||= []).push(r); });
  data.forEach(j => { j._resultados = resultadosPorJogo[j.id] || []; });

  const teamLabel = { time1: "Time 1", time2: "Time 2", academy: "Academy" };

  listEl.innerHTML = data.map(jogo => {
    const dataFmt = formatDateBR(jogo.data);
    const placar = jogo._resultados.length
      ? jogo._resultados.map(r => `${escapeHtml(r.categoria)}: ${r.placar_acap ?? "-"}×${r.placar_adversario ?? "-"}`).join(" · ")
      : jogo.status === "realizado"
        ? `${jogo.placar_acap ?? "-"} × ${jogo.placar_adversario ?? "-"}`
        : (jogo.hora ? jogo.hora.slice(0, 5) : "horário a definir");
    const logo = jogo.adversario_logo_url
      ? `<img class="admin-row__logo" src="${escapeHtml(jogo.adversario_logo_url)}" alt="">`
      : `<span class="admin-row__logo-placeholder">?</span>`;

    return `
      <div class="admin-row" data-id="${jogo.id}">
        ${logo}
        <div class="admin-row__info">
          <div class="admin-row__title">ACAP × ${escapeHtml(jogo.adversario)} — ${placar}</div>
          <div class="admin-row__meta">${teamLabel[jogo.team] || jogo.team} · ${escapeHtml(jogo.competicao)} · ${dataFmt} · ${jogo.local_tipo === "casa" ? "Casa" : "Fora"}${jogo.local_nome ? " · " + escapeHtml(jogo.local_nome) : ""} · ${jogo.status === "realizado" ? "Realizado" : "Agendado"}${jogo.categorias && jogo.categorias.length ? " · " + jogo.categorias.join(", ") : ""}</div>
        </div>
        <div class="admin-row__actions">
          <button class="btn--icon" type="button" data-edit="${jogo.id}" title="Editar"><svg aria-hidden="true" class="lucide lucide-pencil" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" /> </svg></button>
          <button class="btn--icon btn--icon--danger" type="button" data-delete="${jogo.id}" title="Excluir"><svg aria-hidden="true" class="lucide lucide-trash-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 11v6" /> <path d="M14 11v6" /> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /> <path d="M3 6h18" /> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /> </svg></button>
        </div>
      </div>
    `;
  }).join("");

  listEl.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => editJogo(btn.dataset.edit, data))
  );
  listEl.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", () => deleteJogo(btn.dataset.delete))
  );
}

function editJogo(id, data) {
  const jogo = data.find(j => j.id === id);
  if (!jogo) return;

  document.getElementById("jogoId").value = jogo.id;
  document.getElementById("fTeam").value = jogo.team;
  document.getElementById("fCompeticao").value = jogo.competicao;
  document.getElementById("fAdversario").value = jogo.adversario;
  document.getElementById("fLogoUrl").value = jogo.adversario_logo_url || "";
  document.getElementById("fData").value = jogo.data;
  document.getElementById("fHora").value = jogo.hora ? jogo.hora.slice(0, 5) : "";
  document.getElementById("fLocalNome").value = jogo.local_nome || "";
  document.querySelector(`input[name="fLocalTipo"][value="${jogo.local_tipo}"]`).checked = true;
  document.querySelector(`input[name="fStatus"][value="${jogo.status}"]`).checked = true;
  document.getElementById("fPlacarAcap").value = jogo.placar_acap ?? "";
  document.getElementById("fPlacarAdversario").value = jogo.placar_adversario ?? "";

  const categoriasSelecionadas = jogo.categorias || [];
  document.querySelectorAll('input[name="fCategorias"]').forEach(cb => {
    cb.checked = categoriasSelecionadas.includes(cb.value);
  });

  const preview = document.getElementById("logoPreview");
  if (jogo.adversario_logo_url) {
    preview.src = jogo.adversario_logo_url;
    preview.classList.add("is-visible");
  } else {
    preview.classList.remove("is-visible");
  }

  pendingLogoFile = null;
  updatePlacarFields(jogo._resultados);
  document.getElementById("formTitle").textContent = "Editar jogo";
  document.getElementById("submitBtn").textContent = "Atualizar jogo";
  document.getElementById("cancelEditBtn").hidden = false;
  document.getElementById("jogoForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteJogo(id) {
  if (!confirm("Excluir este jogo? Essa ação não pode ser desfeita.")) return;
  const { error } = await supabaseClient.from("jogos").delete().eq("id", id);
  if (error) {
    alert("Erro ao excluir: " + error.message);
    return;
  }
  loadJogos();
}

function toIntOrNull(v) {
  return v === "" || v === null || v === undefined ? null : parseInt(v, 10);
}

function formatDateBR(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ==================================================================
   NOTÍCIAS
   ================================================================== */

let pendingImagemFile = null;

function handleImagemPreview(e) {
  const file = e.target.files[0];
  pendingImagemFile = file || null;
  const preview = document.getElementById("imagemPreview");
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.classList.add("is-visible");
  } else {
    preview.classList.remove("is-visible");
  }
}

function resetNoticiaForm(clearMsg = true) {
  document.getElementById("noticiaForm").reset();
  document.getElementById("noticiaId").value = "";
  document.getElementById("fImagemUrl").value = "";
  document.getElementById("imagemPreview").classList.remove("is-visible");
  document.getElementById("fDataPublicacao").value = new Date().toISOString().slice(0, 10);
  document.getElementById("noticiaFormTitle").textContent = "Nova notícia";
  document.getElementById("noticiaSubmitBtn").textContent = "Salvar notícia";
  document.getElementById("noticiaCancelEditBtn").hidden = true;
  if (clearMsg) document.getElementById("noticiaFormMsg").innerHTML = "";
  pendingImagemFile = null;
}

async function handleNoticiaSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("noticiaSubmitBtn");
  const formMsg = document.getElementById("noticiaFormMsg");
  formMsg.innerHTML = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Salvando...";

  try {
    let imagemUrl = document.getElementById("fImagemUrl").value || null;

    if (pendingImagemFile) {
      const ext = pendingImagemFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabaseClient.storage
        .from("noticias")
        .upload(path, pendingImagemFile);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabaseClient.storage.from("noticias").getPublicUrl(path);
      imagemUrl = publicUrlData.publicUrl;
    }

    const payload = {
      titulo: document.getElementById("fTitulo").value.trim(),
      resumo: document.getElementById("fResumo").value.trim(),
      corpo: document.getElementById("fCorpo").value.trim() || null,
      categoria: document.getElementById("fCategoria").value.trim() || null,
      data_publicacao: document.getElementById("fDataPublicacao").value,
      imagem_url: imagemUrl,
    };

    const id = document.getElementById("noticiaId").value;
    const { error } = id
      ? await supabaseClient.from("noticias").update(payload).eq("id", id)
      : await supabaseClient.from("noticias").insert(payload);
    if (error) throw error;

    formMsg.innerHTML = `<div class="admin-msg admin-msg--ok">Notícia salva com sucesso.</div>`;
    resetNoticiaForm(false);
    loadNoticias();
  } catch (err) {
    formMsg.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(err.message || "Erro ao salvar.")}</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Salvar notícia";
  }
}

async function loadNoticias() {
  const listEl = document.getElementById("noticiasList");
  const { data, error } = await supabaseClient
    .from("noticias")
    .select("*")
    .order("data_publicacao", { ascending: false });

  if (error) {
    listEl.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    listEl.innerHTML = `<p class="admin-empty">Nenhuma notícia cadastrada ainda.</p>`;
    return;
  }

  listEl.innerHTML = data.map(noticia => {
    const imagem = noticia.imagem_url
      ? `<img class="admin-row__logo" src="${escapeHtml(noticia.imagem_url)}" alt="">`
      : `<span class="admin-row__logo-placeholder">?</span>`;

    return `
      <div class="admin-row" data-id="${noticia.id}">
        ${imagem}
        <div class="admin-row__info">
          <div class="admin-row__title">${escapeHtml(noticia.titulo)}</div>
          <div class="admin-row__meta">${formatDateBR(noticia.data_publicacao)}${noticia.categoria ? " · " + escapeHtml(noticia.categoria) : ""}</div>
        </div>
        <div class="admin-row__actions">
          <button class="btn--icon" type="button" data-edit="${noticia.id}" title="Editar"><svg aria-hidden="true" class="lucide lucide-pencil" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" /> </svg></button>
          <button class="btn--icon btn--icon--danger" type="button" data-delete="${noticia.id}" title="Excluir"><svg aria-hidden="true" class="lucide lucide-trash-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 11v6" /> <path d="M14 11v6" /> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /> <path d="M3 6h18" /> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /> </svg></button>
        </div>
      </div>
    `;
  }).join("");

  listEl.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => editNoticia(btn.dataset.edit, data))
  );
  listEl.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", () => deleteNoticia(btn.dataset.delete))
  );
}

function editNoticia(id, data) {
  const noticia = data.find(n => n.id === id);
  if (!noticia) return;

  document.getElementById("noticiaId").value = noticia.id;
  document.getElementById("fTitulo").value = noticia.titulo;
  document.getElementById("fResumo").value = noticia.resumo;
  document.getElementById("fCorpo").value = noticia.corpo || "";
  document.getElementById("fCategoria").value = noticia.categoria || "";
  document.getElementById("fDataPublicacao").value = noticia.data_publicacao;
  document.getElementById("fImagemUrl").value = noticia.imagem_url || "";

  const preview = document.getElementById("imagemPreview");
  if (noticia.imagem_url) {
    preview.src = noticia.imagem_url;
    preview.classList.add("is-visible");
  } else {
    preview.classList.remove("is-visible");
  }

  pendingImagemFile = null;
  document.getElementById("noticiaFormTitle").textContent = "Editar notícia";
  document.getElementById("noticiaSubmitBtn").textContent = "Atualizar notícia";
  document.getElementById("noticiaCancelEditBtn").hidden = false;
  document.getElementById("noticiaForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteNoticia(id) {
  if (!confirm("Excluir esta notícia? Essa ação não pode ser desfeita.")) return;
  const { error } = await supabaseClient.from("noticias").delete().eq("id", id);
  if (error) {
    alert("Erro ao excluir: " + error.message);
    return;
  }
  loadNoticias();
}

/* ==================================================================
   PATROCINADORES
   ================================================================== */

let pendingPatrocinadorLogoFile = null;

function handlePatrocinadorLogoPreview(e) {
  const file = e.target.files[0];
  pendingPatrocinadorLogoFile = file || null;
  const preview = document.getElementById("patrocinadorLogoPreview");
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.classList.add("is-visible");
  } else {
    preview.classList.remove("is-visible");
  }
}

function resetPatrocinadorForm(clearMsg = true) {
  document.getElementById("patrocinadorForm").reset();
  document.getElementById("patrocinadorId").value = "";
  document.getElementById("fPatrocinadorLogoUrl").value = "";
  document.getElementById("patrocinadorLogoPreview").classList.remove("is-visible");
  document.getElementById("fOrdem").value = "0";
  document.getElementById("patrocinadorFormTitle").textContent = "Novo patrocinador";
  document.getElementById("patrocinadorSubmitBtn").textContent = "Salvar patrocinador";
  document.getElementById("patrocinadorCancelEditBtn").hidden = true;
  if (clearMsg) document.getElementById("patrocinadorFormMsg").innerHTML = "";
  pendingPatrocinadorLogoFile = null;
}

async function handlePatrocinadorSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("patrocinadorSubmitBtn");
  const formMsg = document.getElementById("patrocinadorFormMsg");
  formMsg.innerHTML = "";

  const id = document.getElementById("patrocinadorId").value;
  let logoUrl = document.getElementById("fPatrocinadorLogoUrl").value || null;

  if (!id && !pendingPatrocinadorLogoFile && !logoUrl) {
    formMsg.innerHTML = `<div class="admin-msg admin-msg--error">Selecione um logo para o patrocinador.</div>`;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Salvando...";

  try {
    if (pendingPatrocinadorLogoFile) {
      const ext = pendingPatrocinadorLogoFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabaseClient.storage
        .from("patrocinadores")
        .upload(path, pendingPatrocinadorLogoFile);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabaseClient.storage.from("patrocinadores").getPublicUrl(path);
      logoUrl = publicUrlData.publicUrl;
    }

    const payload = {
      nome: document.getElementById("fNome").value.trim(),
      logo_url: logoUrl,
      link_url: document.getElementById("fLinkUrl").value.trim() || null,
      categoria: document.getElementById("fPatrocinadorCategoria").value.trim() || null,
      ordem: toIntOrNull(document.getElementById("fOrdem").value) ?? 0,
    };

    const { error } = id
      ? await supabaseClient.from("patrocinadores").update(payload).eq("id", id)
      : await supabaseClient.from("patrocinadores").insert(payload);
    if (error) throw error;

    formMsg.innerHTML = `<div class="admin-msg admin-msg--ok">Patrocinador salvo com sucesso.</div>`;
    resetPatrocinadorForm(false);
    loadPatrocinadores();
  } catch (err) {
    formMsg.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(err.message || "Erro ao salvar.")}</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Salvar patrocinador";
  }
}

async function loadPatrocinadores() {
  const listEl = document.getElementById("patrocinadoresList");
  const { data, error } = await supabaseClient
    .from("patrocinadores")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) {
    listEl.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    listEl.innerHTML = `<p class="admin-empty">Nenhum patrocinador cadastrado ainda.</p>`;
    return;
  }

  listEl.innerHTML = data.map(p => `
      <div class="admin-row" data-id="${p.id}">
        <img class="admin-row__logo" src="${escapeHtml(p.logo_url)}" alt="">
        <div class="admin-row__info">
          <div class="admin-row__title">${escapeHtml(p.nome)}</div>
          <div class="admin-row__meta">Ordem ${p.ordem}${p.categoria ? " · " + escapeHtml(p.categoria) : ""}${p.link_url ? " · " + escapeHtml(p.link_url) : ""}</div>
        </div>
        <div class="admin-row__actions">
          <button class="btn--icon" type="button" data-edit="${p.id}" title="Editar"><svg aria-hidden="true" class="lucide lucide-pencil" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" /> </svg></button>
          <button class="btn--icon btn--icon--danger" type="button" data-delete="${p.id}" title="Excluir"><svg aria-hidden="true" class="lucide lucide-trash-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 11v6" /> <path d="M14 11v6" /> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /> <path d="M3 6h18" /> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /> </svg></button>
        </div>
      </div>
    `).join("");

  listEl.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => editPatrocinador(btn.dataset.edit, data))
  );
  listEl.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", () => deletePatrocinador(btn.dataset.delete))
  );
}

function editPatrocinador(id, data) {
  const p = data.find(item => item.id === id);
  if (!p) return;

  document.getElementById("patrocinadorId").value = p.id;
  document.getElementById("fNome").value = p.nome;
  document.getElementById("fPatrocinadorLogoUrl").value = p.logo_url || "";
  document.getElementById("fLinkUrl").value = p.link_url || "";
  document.getElementById("fPatrocinadorCategoria").value = p.categoria || "";
  document.getElementById("fOrdem").value = p.ordem ?? 0;

  const preview = document.getElementById("patrocinadorLogoPreview");
  if (p.logo_url) {
    preview.src = p.logo_url;
    preview.classList.add("is-visible");
  } else {
    preview.classList.remove("is-visible");
  }

  pendingPatrocinadorLogoFile = null;
  document.getElementById("patrocinadorFormTitle").textContent = "Editar patrocinador";
  document.getElementById("patrocinadorSubmitBtn").textContent = "Atualizar patrocinador";
  document.getElementById("patrocinadorCancelEditBtn").hidden = false;
  document.getElementById("patrocinadorForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deletePatrocinador(id) {
  if (!confirm("Excluir este patrocinador? Essa ação não pode ser desfeita.")) return;
  const { error } = await supabaseClient.from("patrocinadores").delete().eq("id", id);
  if (error) {
    alert("Erro ao excluir: " + error.message);
    return;
  }
  loadPatrocinadores();
}

/* ==================================================================
   LEADS (inscrições de avaliação + propostas de patrocínio)
   ================================================================== */

async function loadLeads() {
  await Promise.all([loadAvaliacaoLeads(), loadPatrocinioLeads()]);
}

async function loadAvaliacaoLeads() {
  const listEl = document.getElementById("avaliacaoLeadsList");
  const { data, error } = await supabaseClient
    .from("avaliacao_inscricoes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    listEl.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    listEl.innerHTML = `<p class="admin-empty">Nenhuma inscrição recebida ainda.</p>`;
    return;
  }

  listEl.innerHTML = data.map(lead => `
    <div class="admin-lead-row" data-id="${lead.id}">
      <div>
        <div class="admin-lead-row__title">${escapeHtml(lead.nome_atleta)} — ${escapeHtml(lead.categoria_interesse)}${lead.posicao ? " · " + escapeHtml(lead.posicao) : ""}</div>
        <div class="admin-lead-row__meta">
          <strong>Responsável:</strong> ${escapeHtml(lead.nome_responsavel)} · ${escapeHtml(lead.telefone)} · ${escapeHtml(lead.email)}<br>
          Nascimento: ${formatDateBR(lead.data_nascimento)} · Recebido em ${formatDateTimeBR(lead.created_at)}
          ${lead.experiencia_anterior ? `<br><strong>Experiência:</strong> ${escapeHtml(lead.experiencia_anterior)}` : ""}
          ${lead.observacoes ? `<br><strong>Observações:</strong> ${escapeHtml(lead.observacoes)}` : ""}
        </div>
      </div>
      <button class="btn--icon btn--icon--danger" type="button" data-delete-lead="${lead.id}" title="Excluir"><svg aria-hidden="true" class="lucide lucide-trash-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 11v6" /> <path d="M14 11v6" /> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /> <path d="M3 6h18" /> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /> </svg></button>
    </div>
  `).join("");

  listEl.querySelectorAll("[data-delete-lead]").forEach(btn =>
    btn.addEventListener("click", () => deleteLead("avaliacao_inscricoes", btn.dataset.deleteLead, loadAvaliacaoLeads))
  );
}

async function loadPatrocinioLeads() {
  const listEl = document.getElementById("patrocinioLeadsList");
  const { data, error } = await supabaseClient
    .from("patrocinador_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    listEl.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    listEl.innerHTML = `<p class="admin-empty">Nenhuma proposta recebida ainda.</p>`;
    return;
  }

  listEl.innerHTML = data.map(lead => `
    <div class="admin-lead-row" data-id="${lead.id}">
      <div>
        <div class="admin-lead-row__title">${escapeHtml(lead.nome_empresa)}</div>
        <div class="admin-lead-row__meta">
          <strong>Contato:</strong> ${escapeHtml(lead.nome_contato)} · ${escapeHtml(lead.telefone)} · ${escapeHtml(lead.email)}<br>
          Recebido em ${formatDateTimeBR(lead.created_at)}
          ${lead.mensagem ? `<br><strong>Mensagem:</strong> ${escapeHtml(lead.mensagem)}` : ""}
        </div>
      </div>
      <button class="btn--icon btn--icon--danger" type="button" data-delete-lead="${lead.id}" title="Excluir"><svg aria-hidden="true" class="lucide lucide-trash-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 11v6" /> <path d="M14 11v6" /> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /> <path d="M3 6h18" /> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /> </svg></button>
    </div>
  `).join("");

  listEl.querySelectorAll("[data-delete-lead]").forEach(btn =>
    btn.addEventListener("click", () => deleteLead("patrocinador_leads", btn.dataset.deleteLead, loadPatrocinioLeads))
  );
}

async function deleteLead(table, id, reload) {
  if (!confirm("Excluir este registro? Essa ação não pode ser desfeita.")) return;
  const { error } = await supabaseClient.from(table).delete().eq("id", id);
  if (error) {
    alert("Erro ao excluir: " + error.message);
    return;
  }
  reload();
}

function formatDateTimeBR(isoDateTime) {
  const d = new Date(isoDateTime);
  return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
