/* =====================================================
   ERP FINANCEIRO JW v3.1 - CONFIG HELPERS
   - Gera e mantém configurações de categorias/bancos
   - Garante defaults e persistência no localStorage
   ===================================================== */

(function () {
  'use strict';

  if (!window.ERP_CONST) {
    console.error('[ERP] ERP_CONST não carregado. Verifique a ordem dos scripts.');
    return;
  }

  const CFG_KEYS = {
    categories: 'gf_erp_cfg_categorias',
    banks: 'gf_erp_cfg_bancos'
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('[ERP] Falha ao ler JSON:', key, e);
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeLabel(s) {
    return String(s || '').trim();
  }

  // -------------------------------
  // CATEGORIAS
  // -------------------------------
  function buildDefaultCategoriesConfig() {
    const out = {};
    const base = window.ERP_CONST.categories;

    Object.keys(base).forEach((kind) => {
      out[kind] = base[kind].map((c) => ({
        id: c.id,
        originalLabel: c.label,
        label: c.label,
        active: true
      }));
    });

    return out;
  }

  function ensureCategoriesConfig() {
    const cfg = loadJSON(CFG_KEYS.categories, null);
    if (cfg && typeof cfg === 'object') return cfg;

    const fresh = buildDefaultCategoriesConfig();
    saveJSON(CFG_KEYS.categories, fresh);
    return fresh;
  }

  function getCategoryConfig(kind) {
    const cfg = ensureCategoriesConfig();
    return Array.isArray(cfg[kind]) ? cfg[kind] : [];
  }

  function setCategoryConfig(kind, items) {
    const cfg = ensureCategoriesConfig();
    cfg[kind] = items;
    saveJSON(CFG_KEYS.categories, cfg);
  }

  function getActiveCategoryLabels(kind) {
    return getCategoryConfig(kind)
      .filter((i) => i.active)
      .map((i) => i.label);
  }

  // -------------------------------
  // BANCOS
  // -------------------------------
  function buildDefaultBanksConfig() {
    const base = window.ERP_CONST.banksBase;
    const defaults = window.ERP_CONST.banksByTypeDefault;

    const makeType = (type) => {
      const activeSet = new Set((defaults[type] || []).map(normalizeLabel));
      return base.map((b) => {
        const label = b.label;
        return {
          id: b.id,
          originalLabel: label,
          label,
          active: activeSet.has(normalizeLabel(label))
        };
      });
    };

    return {
      receita: makeType('receita'),
      poupanca: makeType('poupanca'),
      despesa: makeType('despesa'),
      divida: makeType('divida')
    };
  }

  function ensureBanksConfig() {
    const cfg = loadJSON(CFG_KEYS.banks, null);
    if (cfg && typeof cfg === 'object') return cfg;

    const fresh = buildDefaultBanksConfig();
    saveJSON(CFG_KEYS.banks, fresh);
    return fresh;
  }

  function getBankConfig(type) {
    const cfg = ensureBanksConfig();
    return Array.isArray(cfg[type]) ? cfg[type] : [];
  }

  function setBankConfig(type, items) {
    const cfg = ensureBanksConfig();
    cfg[type] = items;
    saveJSON(CFG_KEYS.banks, cfg);
  }

  function getActiveBankLabels(type) {
    return getBankConfig(type)
      .filter((i) => i.active)
      .map((i) => i.label);
  }

  // -------------------------------
  // UTIL: injeção temporária em selects
  // -------------------------------
  function ensureValueInList(list, value) {
    const v = normalizeLabel(value);
    if (!v) return list.slice();
    const exists = list.some((x) => normalizeLabel(x) === v);
    if (exists) return list.slice();
    return [value, ...list];
  }

  window.ERP_CFG = {
    // categories
    ensureCategoriesConfig,
    getCategoryConfig,
    setCategoryConfig,
    getActiveCategoryLabels,

    // banks
    ensureBanksConfig,
    getBankConfig,
    setBankConfig,
    getActiveBankLabels,

    // util
    ensureValueInList,
    normalizeLabel
  };
})();
