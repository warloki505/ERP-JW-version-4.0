# 📝 CHANGELOG - ERP FINANCEIRO JW

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

---

## [4.0.1] - 2026-02-14 🎯 **CURADORIA E OTIMIZAÇÃO**

### ✨ **ADICIONADO**

**Novo Arquivo:**
- ✨ `js/script.js` - Utilitários globais e melhorias de UX
  - Sistema de temas (dark/light) com persistência
  - Toast notifications padronizadas
  - Navegação automática com classes `js-*`
  - Formatação de moeda, datas e percentuais
  - Namespace `window.ERP` para organização

**Meta Tags (em todas as páginas):**
- ✨ `<meta name="author" content="JW">`
- ✨ `<meta name="theme-color" content="#3b82f6">`
- ✨ `<meta name="apple-mobile-web-app-capable" content="yes">`

**CSS:**
- ✨ Animações `slideOut` para toasts
- ✨ Keyframe `pulseWarning` para KPI de dívidas
- ✨ Utilitários de espaçamento (`.p-*`, `.m-*`)
- ✨ Utilitários de flex e grid
- ✨ Melhorias de acessibilidade

### 🔧 **MODIFICADOS**

**Todas as páginas HTML:**
- ~ Versão atualizada para v4.0
- ~ Script `script.js` adicionado
- ~ Botões com classes `js-logout`, `js-back`, `js-dashboard`
- ~ Botão de tema 🌓 no header

**perfil.html:**
- ~ Perfis atualizados com percentuais corretos

**historico.html:**
- ~ KPI de dívidas adicionado

**style.css:**
- ~ Melhorias de responsividade mobile
- ~ Inputs com `font-size: 16px` no mobile

### 📚 **DOCUMENTAÇÃO**

- ✅ CHANGELOG.md atualizado
- ✅ README.md revisado

### 🐛 **CORREÇÕES**

- ✅ Versões inconsistentes (v3.1 → v4.0)
- ✅ KPI de dívidas faltando no histórico
- ✅ Tema dark não persistia
- ✅ Navegação inconsistente

---

## [4.0.0] - 2025-02-12 🎉 **VERSÃO DEFINITIVA**

### ✨ **ADICIONADO**
- PIX, Dinheiro como formas de pagamento
- +8 categorias (Freelance, Streaming, etc)
- Perfis: Poupador Agressivo e Quitador
- Sistema de alertas

### 🔧 **MODIFICADO**
- Bancos reduzidos de 23 para 15
- Perfis com 4 campos (% dívidas)

---

## [3.1.0] - 2025-02-11
- Modularização do JavaScript
- IDs estáveis para categorias

---

## [3.0.0] - 2025-02-10
- KPI de DÍVIDAS separado
- Destaque visual vermelho pulsante

---

## [2.0.0] - 2025-02-09
- Hash SHA-256 para senhas
- Gráficos com Chart.js

---

## [1.0.0] - 2025-02-08
- Lançamento inicial
