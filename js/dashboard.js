/* =====================================================
   ERP FINANCEIRO JW v3.1 - DASHBOARD
   Features:
   - CRUD completo + navegação de meses + toasts + modal de edição
   - KPI de DÍVIDAS
   - Gerenciador de Categorias/Bancos (config por usuário)
   - Recorrência (Lançamentos Fixos) com proteção anti-duplicação
   ===================================================== */

(function () {
  'use strict';

  // ===============================
  // CONSTANTES E CONFIGURAÇÃO
  // ===============================
  const USER_KEY = "gf_erp_user";
  const LOGGED_KEY = "gf_erp_logged";

  const REC_KEY = "gf_erp_recorrentes";
  const REC_APPLIED_PREFIX = "gf_erp_recorr_applied_"; // + YYYY-MM

  // ===============================
  // GUARDA DE LOGIN
  // ===============================
  if (localStorage.getItem(LOGGED_KEY) !== "true") {
    window.location.href = "index.html";
    return;
  }

  // Garantir configs
  if (!window.ERP_CFG || !window.ERP_CONST) {
    console.error("[ERP] Scripts base não carregados (constantes/config).");
    return;
  }
  ERP_CFG.ensureCategoriesConfig();
  ERP_CFG.ensureBanksConfig();

  // ===============================
  // HELPERS GERAIS
  // ===============================
  const $ = (id) => document.getElementById(id);

  function brl(v) {
    return (Number(v) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function setOptions(select, list) {
    if (!select) return;
    select.innerHTML = `<option value="">Selecione</option>`;
    list.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      select.appendChild(opt);
    });
  }

  function ensureSelectedOption(select, value) {
    if (!select) return;
    const v = ERP_CFG.normalizeLabel(value);
    if (!v) return;
    const exists = Array.from(select.options).some((o) => ERP_CFG.normalizeLabel(o.value) === v);
    if (!exists) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = `${value} (valor antigo)`;
      select.insertBefore(opt, select.firstChild.nextSibling);
    }
    select.value = value;
  }

  function uid() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ===============================
  // CONTROLE DE MÊS ATIVO
  // ===============================
  let activeMonth = getMonthId(new Date());

  function getMonthId(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  function getMonthLabel(monthId) {
    const [year, month] = monthId.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }

  function getTxKey(monthId = activeMonth) {
    return `gf_erp_tx_${monthId}`;
  }

  function daysInMonth(monthId) {
    const [y, m] = monthId.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  }

  function clampDay(monthId, day) {
    const max = daysInMonth(monthId);
    const d = Math.max(1, Math.min(max, Number(day) || 1));
    return String(d).padStart(2, "0");
  }

  function monthInRange(monthId, startMonth, endMonth) {
    // formato YYYY-MM, comparação lexicográfica funciona
    if (startMonth && monthId < startMonth) return false;
    if (endMonth && monthId > endMonth) return false;
    return true;
  }

  // ===============================
  // PERSISTÊNCIA DE TRANSAÇÕES
  // ===============================
  function loadTx(monthId = activeMonth) {
    const key = getTxKey(monthId);
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      return [];
    }
  }

  function saveTx(list, monthId = activeMonth) {
    const key = getTxKey(monthId);
    localStorage.setItem(key, JSON.stringify(list));
  }

  let tx = loadTx(activeMonth);

  // ===============================
  // RECORRÊNCIA (LANÇAMENTOS FIXOS)
  // ===============================
  function loadRecorrentes() {
    try {
      return JSON.parse(localStorage.getItem(REC_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveRecorrentes(list) {
    localStorage.setItem(REC_KEY, JSON.stringify(list));
  }

  function monthAppliedKey(monthId) {
    return `${REC_APPLIED_PREFIX}${monthId}`;
  }

  function wasAppliedThisMonth(monthId, recId) {
    const key = monthAppliedKey(monthId);
    try {
      const map = JSON.parse(localStorage.getItem(key) || "{}");
      return map[recId] === true;
    } catch {
      return false;
    }
  }

  function markAppliedThisMonth(monthId, recId) {
    const key = monthAppliedKey(monthId);
    let map = {};
    try {
      map = JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      map = {};
    }
    map[recId] = true;
    localStorage.setItem(key, JSON.stringify(map));
  }

  function applyRecorrentesForMonth(monthId) {
    const recs = loadRecorrentes();
    if (!Array.isArray(recs) || recs.length === 0) return false;

    let changed = false;
    let monthTx = loadTx(monthId);

    recs.forEach((rec) => {
      if (!rec || !rec.id || !rec.template) return;
      if (!monthInRange(monthId, rec.startMonth, rec.endMonth || null)) return;
      if (wasAppliedThisMonth(monthId, rec.id)) return;

      const t = rec.template;
      const day = clampDay(monthId, t.day || 1);
      const data = `${monthId}-${day}`;

      const newTx = {
        id: uid(),
        tipo: t.tipo,
        subtipo: t.subtipo || undefined,
        data,
        valor: t.valor,
        categoria: t.categoria,
        banco: t.banco,
        descricao: t.descricao || "",
        auto: true,
        recurrenceId: rec.id
      };

      monthTx.push(newTx);
      markAppliedThisMonth(monthId, rec.id);
      changed = true;
    });

    if (changed) {
      saveTx(monthTx, monthId);
    }
    return changed;
  }

  // ===============================
  // CÁLCULO DE RESUMO
  // ===============================
  function calcularResumo(list) {
    let renda = 0;
    let poupanca = 0;
    let essenciais = 0;
    let livres = 0;
    let dividas = 0;

    list.forEach((t) => {
      const v = Number(t.valor) || 0;
      if (t.tipo === "receita") renda += v;
      if (t.tipo === "poupanca") poupanca += v;
      if (t.tipo === "divida") dividas += v;
      if (t.tipo === "despesa" && t.subtipo === "essencial") essenciais += v;
      if (t.tipo === "despesa" && t.subtipo === "livre") livres += v;
    });

    return {
      renda,
      poupanca,
      essenciais,
      livres,
      dividas,
      saldo: renda - poupanca - essenciais - livres - dividas
    };
  }

  // ===============================
  // ELEMENTOS DOM
  // ===============================
  const kpiRenda = $("kpiRenda");
  const kpiPoupanca = $("kpiPoupanca");
  const kpiEssenciais = $("kpiEssenciais");
  const kpiLivres = $("kpiLivres");
  const kpiDividas = $("kpiDividas");
  const kpiSaldo = $("kpiSaldoDistribuir");
  const tbody = $("txTbody");

  const formPoupanca = $("formPoupanca");
  const formReceita = $("formReceita");
  const formDespesa = $("formDespesa");
  const formDivida = $("formDivida");

  const despesaSubtipo = $("despesaSubtipo");
  const despesaCategoria = $("despesaCategoria");

  const logoutBtn = $("logoutBtn");
  const btnPerfil = $("btnPerfil");
  const btnHistorico = $("btnHistorico");
  const btnLimparMes = $("btnLimparMes");

  const monthLabel = $("monthLabel");
  const btnPrevMonth = $("btnPrevMonth");
  const btnCurrentMonth = $("btnCurrentMonth");
  const btnNextMonth = $("btnNextMonth");

  // Modal Edit
  const modalEdit = $("modalEdit");

  // Modal Fixar
  const modalFixar = $("modalFixar");

  // ===============================
  // LISTAS (configuráveis)
  // ===============================
  function catKindFromTx(item) {
    if (item.tipo === "receita") return "receita";
    if (item.tipo === "poupanca") return "poupanca";
    if (item.tipo === "divida") return "divida";
    if (item.tipo === "despesa") {
      return item.subtipo === "essencial" ? "despesa_essencial" : "despesa_livre";
    }
    return "receita";
  }

  function bankTypeFromTx(item) {
    if (item.tipo === "receita") return "receita";
    if (item.tipo === "poupanca") return "poupanca";
    if (item.tipo === "divida") return "divida";
    return "despesa";
  }

  function getActiveCategories(kind) {
    return ERP_CFG.getActiveCategoryLabels(kind);
  }

  function getActiveBanks(type) {
    return ERP_CFG.getActiveBankLabels(type);
  }

  // ===============================
  // RENDERIZAÇÃO
  // ===============================
  function render() {
    if (monthLabel) monthLabel.textContent = getMonthLabel(activeMonth);

    const r = calcularResumo(tx);
    if (kpiRenda) kpiRenda.textContent = brl(r.renda);
    if (kpiPoupanca) kpiPoupanca.textContent = brl(r.poupanca);
    if (kpiEssenciais) kpiEssenciais.textContent = brl(r.essenciais);
    if (kpiLivres) kpiLivres.textContent = brl(r.livres);
    if (kpiDividas) kpiDividas.textContent = brl(r.dividas);
    if (kpiSaldo) kpiSaldo.textContent = brl(r.saldo);

    if (kpiSaldo) {
      if (r.saldo < 0) kpiSaldo.style.color = "#ef4444";
      else if (r.saldo > 0) kpiSaldo.style.color = "#10b981";
      else kpiSaldo.style.color = "";
    }

    if (!tbody) return;

    tbody.innerHTML = "";
    if (tx.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px;">
            <span class="text-muted">Nenhum lançamento neste mês</span>
          </td>
        </tr>
      `;
      return;
    }

    tx
      .slice()
      .sort((a, b) => b.data.localeCompare(a.data))
      .forEach((t) => {
        const tr = document.createElement("tr");

        let badgeClass = "badge-receita";
        let badgeText = "RECEITA";

        if (t.tipo === "poupanca") {
          badgeClass = "badge-poupanca";
          badgeText = "POUPANÇA";
        } else if (t.tipo === "divida") {
          badgeClass = "badge-divida";
          badgeText = "DÍVIDA";
        } else if (t.tipo === "despesa") {
          badgeClass = "badge-despesa";
          badgeText = t.subtipo === "essencial" ? "DESP. ESSENCIAL" : "DESP. LIVRE";
        }

        const pin = t.auto ? `<span class="pin-mark" title="Lançamento fixo aplicado automaticamente">📌</span>` : "";

        tr.innerHTML = `
          <td><span class="badge ${badgeClass}">${badgeText}</span> ${pin}</td>
          <td>${new Date(t.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
          <td style="font-weight: 600;">${brl(t.valor)}</td>
          <td>${t.categoria}</td>
          <td>${t.banco}</td>
          <td class="text-muted">${t.descricao || "-"}</td>
          <td class="td-actions">
            <button class="btn-mini btn-pin" data-id="${t.id}" title="Fixar lançamento">📌</button>
            <button class="btn-mini btn-edit" data-id="${t.id}">✏️ Editar</button>
            <button class="btn-mini btn-del" data-id="${t.id}">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
  }

  // ===============================
  // ADICIONAR LANÇAMENTO
  // ===============================
  function addTx(data) {
    tx.push({ id: uid(), ...data });
    saveTx(tx);
    render();
  }

  // ===============================
  // VALIDAÇÕES
  // ===============================
  function validarValor(valor) {
    const v = parseFloat(valor);
    if (isNaN(v) || v <= 0) {
      showToast("Valor deve ser maior que zero!", "error");
      return false;
    }
    return true;
  }

  // ===============================
  // HANDLERS DE FORMULÁRIO
  // ===============================
  if (formPoupanca) {
    formPoupanca.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!validarValor(f.valor.value)) return;

      addTx({
        tipo: "poupanca",
        data: f.data.value,
        valor: f.valor.value,
        categoria: f.categoria.value,
        banco: f.banco.value,
        descricao: $("poupancaDescricao").value.trim()
      });

      f.reset();
      showToast("✓ Poupança adicionada!", "success");
      setDefaultDates();
    });
  }

  if (formReceita) {
    formReceita.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!validarValor(f.valor.value)) return;

      addTx({
        tipo: "receita",
        data: f.data.value,
        valor: f.valor.value,
        categoria: f.categoria.value,
        banco: f.banco.value,
        descricao: $("receitaDescricao").value.trim()
      });

      f.reset();
      showToast("✓ Receita adicionada!", "success");
      setDefaultDates();
    });
  }

  if (formDespesa) {
    formDespesa.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!validarValor(f.valor.value)) return;

      addTx({
        tipo: "despesa",
        subtipo: despesaSubtipo.value,
        data: f.data.value,
        valor: f.valor.value,
        categoria: despesaCategoria.value,
        banco: $("despesaBanco").value,
        descricao: $("despesaDescricao").value.trim()
      });

      f.reset();
      if (despesaSubtipo) despesaSubtipo.value = "";
      if (despesaCategoria) despesaCategoria.innerHTML = `<option value="">Selecione tipo primeiro</option>`;
      showToast("✓ Despesa adicionada!", "success");
      setDefaultDates();
    });
  }

  if (formDivida) {
    formDivida.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!validarValor(f.valor.value)) return;

      addTx({
        tipo: "divida",
        data: f.data.value,
        valor: f.valor.value,
        categoria: $("dividaCategoria").value,
        banco: $("dividaBanco").value,
        descricao: $("dividaDescricao").value.trim()
      });

      f.reset();
      showToast("⚠️ Dívida registrada. Priorize quitação!", "error");
      setDefaultDates();
    });
  }

  // ===============================
  // MODAL DE EDIÇÃO
  // ===============================
  let editingId = null;

  function openEditModal(id) {
    const item = tx.find((t) => t.id === id);
    if (!item) return;

    editingId = id;

    $("editId").value = id;
    $("editTipo").value = item.tipo;
    $("editData").value = item.data;
    $("editValor").value = item.valor;
    $("editDescricao").value = item.descricao || "";

    const catKind = catKindFromTx(item);
    const bankType = bankTypeFromTx(item);

    const cats = ERP_CFG.ensureValueInList(getActiveCategories(catKind), item.categoria);
    const banks = ERP_CFG.ensureValueInList(getActiveBanks(bankType), item.banco);

    setOptions($("editCategoria"), cats);
    setOptions($("editBanco"), banks);

    ensureSelectedOption($("editCategoria"), item.categoria);
    ensureSelectedOption($("editBanco"), item.banco);

    modalEdit.style.display = "flex";
    modalEdit.classList.remove("hidden");
  }

  window.closeEditModal = function () {
    if (!modalEdit) return;
    modalEdit.style.display = "none";
    modalEdit.classList.add("hidden");
    editingId = null;
  };

  window.saveEdit = function () {
    if (!editingId) return;

    const item = tx.find((t) => t.id === editingId);
    if (!item) return;

    const valor = $("editValor").value;
    if (!validarValor(valor)) return;

    item.data = $("editData").value;
    item.valor = valor;
    item.categoria = $("editCategoria").value;
    item.banco = $("editBanco").value;
    item.descricao = $("editDescricao").value.trim();

    saveTx(tx);
    render();
    window.closeEditModal();
    showToast("✓ Lançamento atualizado!", "success");
  };

  // ===============================
  // REMOVER LANÇAMENTO
  // ===============================
  function deleteTx(id) {
    if (!confirm("⚠️ Confirmar exclusão deste lançamento?")) return;

    tx = tx.filter((t) => t.id !== id);
    saveTx(tx);
    render();
    showToast("✓ Lançamento removido!", "info");
  }

  // ===============================
  // FIXAR LANÇAMENTO (RECORRÊNCIA)
  // ===============================
  let pinningId = null;

  function openFixarModal(id) {
    const item = tx.find((t) => t.id === id);
    if (!item) return;

    pinningId = id;

    // preencher resumo no modal
    $("fixResumo").textContent = `${item.tipo.toUpperCase()} • ${brl(item.valor)} • ${item.categoria} • ${item.banco}`;
    $("fixInicio").value = activeMonth;

    // por padrão: 12 meses
    const [y, m] = activeMonth.split("-").map(Number);
    const end = new Date(y, m - 1);
    end.setMonth(end.getMonth() + 11);
    $("fixFim").value = getMonthId(end);

    $("fixSemFim").checked = false;
    $("fixAplicarAtual").checked = true;

    modalFixar.style.display = "flex";
    modalFixar.classList.remove("hidden");
  }

  window.closeFixarModal = function () {
    if (!modalFixar) return;
    modalFixar.style.display = "none";
    modalFixar.classList.add("hidden");
    pinningId = null;
  };

  function buildRecTemplateFromTx(item) {
    const day = (item.data || "").split("-")[2] || "01";
    return {
      tipo: item.tipo,
      subtipo: item.subtipo || undefined,
      day,
      valor: item.valor,
      categoria: item.categoria,
      banco: item.banco,
      descricao: item.descricao || ""
    };
  }

  window.saveFixar = function () {
    if (!pinningId) return;

    const item = tx.find((t) => t.id === pinningId);
    if (!item) return;

    const startMonth = $("fixInicio").value;
    const semFim = $("fixSemFim").checked;
    const endMonth = semFim ? null : $("fixFim").value;

    if (!startMonth) {
      showToast("Informe o mês de início.", "error");
      return;
    }
    if (!semFim && endMonth && endMonth < startMonth) {
      showToast("Mês final deve ser maior ou igual ao inicial.", "error");
      return;
    }

    const recs = loadRecorrentes();
    const rec = {
      id: uid(),
      createdAt: new Date().toISOString(),
      startMonth,
      endMonth,
      template: buildRecTemplateFromTx(item)
    };

    recs.push(rec);
    saveRecorrentes(recs);

    // aplicar no mês atual, se marcado e se estiver no range
    const applyNow = $("fixAplicarAtual").checked;
    if (applyNow && monthInRange(activeMonth, startMonth, endMonth)) {
      // se já foi aplicado por outro motivo, não reaplica
      if (!wasAppliedThisMonth(activeMonth, rec.id)) {
        markAppliedThisMonth(activeMonth, rec.id); // evita duplicar na sequência
        // adiciona no mês atual COMO AUTO também (ícone)
        const t = rec.template;
        const day = clampDay(activeMonth, t.day || 1);
        tx.push({
          id: uid(),
          tipo: t.tipo,
          subtipo: t.subtipo || undefined,
          data: `${activeMonth}-${day}`,
          valor: t.valor,
          categoria: t.categoria,
          banco: t.banco,
          descricao: t.descricao || "",
          auto: true,
          recurrenceId: rec.id
        });
        saveTx(tx);
        render();
      }
    }

    window.closeFixarModal();
    showToast("📌 Lançamento fixo criado!", "success");
  };

  // ===============================
  // EVENT DELEGATION (TABELA)
  // ===============================
  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const target = e.target;

      const del = target.classList.contains("btn-del") ? target : target.closest(".btn-del");
      if (del) return deleteTx(del.dataset.id);

      const edt = target.classList.contains("btn-edit") ? target : target.closest(".btn-edit");
      if (edt) return openEditModal(edt.dataset.id);

      const pin = target.classList.contains("btn-pin") ? target : target.closest(".btn-pin");
      if (pin) return openFixarModal(pin.dataset.id);
    });
  }

  // ===============================
  // NAVEGAÇÃO DE MESES
  // ===============================
  function loadMonth(monthId) {
    // aplica recorrentes de forma idempotente
    applyRecorrentesForMonth(monthId);
    tx = loadTx(monthId);
    activeMonth = monthId;
    setDefaultDates();
    render();
  }

  if (btnPrevMonth) {
    btnPrevMonth.addEventListener("click", () => {
      const [year, month] = activeMonth.split("-").map(Number);
      const newDate = new Date(year, month - 2);
      loadMonth(getMonthId(newDate));
    });
  }

  if (btnNextMonth) {
    btnNextMonth.addEventListener("click", () => {
      const [year, month] = activeMonth.split("-").map(Number);
      const newDate = new Date(year, month);
      loadMonth(getMonthId(newDate));
    });
  }

  if (btnCurrentMonth) {
    btnCurrentMonth.addEventListener("click", () => {
      loadMonth(getMonthId(new Date()));
    });
  }

  // ===============================
  // LIMPAR MÊS
  // ===============================
  if (btnLimparMes) {
    btnLimparMes.addEventListener("click", () => {
      if (
        !confirm(
          `⚠️ ATENÇÃO!

Isso vai apagar TODOS os lançamentos de ${getMonthLabel(activeMonth)}.

Esta ação não pode ser desfeita. Confirmar?`
        )
      ) {
        return;
      }
      tx = [];
      saveTx(tx);
      render();
      showToast("✓ Todos os dados do mês foram removidos!", "info");
    });
  }

  // ===============================
  // PERFIL E HISTÓRICO
  // ===============================
  if (btnPerfil) btnPerfil.addEventListener("click", () => (window.location.href = "perfil.html"));
  if (btnHistorico) btnHistorico.addEventListener("click", () => (window.location.href = "historico.html"));

  // ===============================
  // LOGOUT
  // ===============================
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Deseja realmente sair?")) {
        localStorage.setItem(LOGGED_KEY, "false");
        window.location.href = "index.html";
      }
    });
  }

  // ===============================
  // NOME DO USUÁRIO
  // ===============================
  const userName = $("userName");
  const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
  if (user && user.nome && userName) {
    userName.textContent = `Olá, ${user.nome.split(" ")[0]}`;
  }

  // ===============================
  // DATAS PADRÃO
  // ===============================
  function setDefaultDates() {
    const today = new Date().toISOString().split("T")[0];
    if ($("receitaData")) $("receitaData").value = today;
    if ($("poupancaData")) $("poupancaData").value = today;
    if ($("despesaData")) $("despesaData").value = today;
    if ($("dividaData")) $("dividaData").value = today;
  }

  // ===============================
  // INICIALIZAÇÃO
  // ===============================
  document.addEventListener("DOMContentLoaded", () => {
    // selects configuráveis
    setOptions($("poupancaCategoria"), getActiveCategories("poupanca"));
    setOptions($("poupancaBanco"), getActiveBanks("poupanca"));

    setOptions($("receitaCategoria"), getActiveCategories("receita"));
    setOptions($("receitaBanco"), getActiveBanks("receita"));

    setOptions($("despesaBanco"), getActiveBanks("despesa"));

    setOptions($("dividaCategoria"), getActiveCategories("divida"));
    setOptions($("dividaBanco"), getActiveBanks("divida"));

    if (despesaCategoria) despesaCategoria.innerHTML = `<option value="">Selecione tipo primeiro</option>`;

    if (despesaSubtipo && despesaCategoria) {
      despesaSubtipo.addEventListener("change", () => {
        if (despesaSubtipo.value === "essencial") {
          setOptions(despesaCategoria, getActiveCategories("despesa_essencial"));
        } else if (despesaSubtipo.value === "livre") {
          setOptions(despesaCategoria, getActiveCategories("despesa_livre"));
        } else {
          despesaCategoria.innerHTML = `<option value="">Selecione tipo primeiro</option>`;
        }
      });
    }

    // Aplicar recorrentes para o mês atual antes do primeiro render
    applyRecorrentesForMonth(activeMonth);
    tx = loadTx(activeMonth);

    setDefaultDates();
    render();

    // animação leve
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.transition = "all 0.4s ease-out";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 50);
    });
  });

  // ===============================
  // FECHAR MODAIS AO CLICAR FORA
  // ===============================
  if (modalEdit) {
    modalEdit.addEventListener("click", (e) => {
      if (e.target === modalEdit) window.closeEditModal();
    });
  }
  if (modalFixar) {
    modalFixar.addEventListener("click", (e) => {
      if (e.target === modalFixar) window.closeFixarModal();
    });
  }

  // ===============================
  // ATALHOS
  // ===============================
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalEdit && !modalEdit.classList.contains("hidden")) window.closeEditModal();
      if (modalFixar && !modalFixar.classList.contains("hidden")) window.closeFixarModal();
    }
  });
})();
