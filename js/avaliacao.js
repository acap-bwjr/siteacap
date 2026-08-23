/* ---------- ACAP Futsal — formulário público de Avaliação/Peneira ---------- */

document.getElementById("avaliacaoForm")?.addEventListener("submit", handleSubmit);

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
      nome_atleta: document.getElementById("fNomeAtleta").value.trim(),
      data_nascimento: document.getElementById("fDataNascimento").value,
      categoria_interesse: document.getElementById("fCategoria").value,
      posicao: document.getElementById("fPosicao").value || null,
      nome_responsavel: document.getElementById("fNomeResponsavel").value.trim(),
      telefone: document.getElementById("fTelefone").value.trim(),
      email: document.getElementById("fEmail").value.trim(),
      experiencia_anterior: document.getElementById("fExperiencia").value.trim() || null,
      observacoes: document.getElementById("fObservacoes").value.trim() || null,
    };

    const { error } = await supabaseClient.from("avaliacao_inscricoes").insert(payload);
    if (error) throw error;

    formMsg.innerHTML = `<div class="admin-msg admin-msg--ok">Inscrição enviada! Nossa comissão técnica vai entrar em contato em breve.</div>`;
    document.getElementById("avaliacaoForm").reset();
  } catch (err) {
    formMsg.innerHTML = `<div class="admin-msg admin-msg--error">${escapeHtml(err.message || "Não foi possível enviar. Tente novamente.")}</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar inscrição";
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
