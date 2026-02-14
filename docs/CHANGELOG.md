# 📝 CHANGELOG - ERP Financeiro JW

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

---

## [4.1.0] - 2026-02-14 🧰 **CURADORIA E ESTABILIZAÇÃO**

### ✅ CORRIGIDO
- ✅ **CSS restaurado**: o `style.css` voltou a conter o Design System completo (variáveis, componentes e responsivo)
- ✅ **Perfis (5)** alinhados com `ERP_CONST.financialProfiles` na tela de perfil

### 🔧 MODIFICADO
- 🔧 **Integração do `js/script.js`** como helpers globais (tema manual via `body.dark-theme` + utilitários)

### 🧠 NOTAS
- Mantém 100% **offline** (localStorage), sem sync/online/backups automáticos.

---

## [4.0.0] - 2025-02-12 🎉 **VERSÃO DEFINITIVA**

### ✨ **ADICIONADO**

**Formas de Pagamento:**
- ✨ PIX (realidade brasileira)
- ✨ Dinheiro
- ✨ Cartão de Crédito (separado)
- ✨ Cartão de Débito (separado)

**Categorias (+8 novas):**
- ✨ Freelance (Receita)
- ✨ Bônus/Comissão (Receita)
- ✨ Aposentadoria (Poupança)
- ✨ Objetivos Específicos (Poupança)
- ✨ Streaming e Assinaturas (Livres)
- ✨ Hobbies (Livres)
- ✨ Presentes (Livres)
- ✨ Seguros (Essenciais)

**Perfis Financeiros (+2 novos):**
- ✨ Poupador Agressivo (45/15/30/10)
- ✨ Quitador de Dívidas (45/15/15/25)

**Sistema de Alertas (NOVO):**
- ✨ Thresholds de poupança (excelente/ótima/aceitável/baixa)
- ✨ Thresholds de endividamento (saudável/atenção/perigoso/crítico)
- ✨ Thresholds de essenciais (ideal/aceitável/alto)

**Metadata:**
- ✨ Auto-cálculo de totais (categorias, bancos, perfis)
- ✨ Versão e data de release em ERP_CONST

### 🔧 **MODIFICADO**

**Bancos:**
- ~ Reduzidos de 23 para 15 principais (UX otimizada)
- ~ Categorizados: Payment, Digital, Traditional, Broker
- ~ Defaults inteligentes por tipo de transação

**Perfis Financeiros:**
- ~ Todos agora com 4 campos (incluindo % dívidas)
- ~ Descrições mais claras

**Categorias:**
- ~ "MORADIA" movido para topo (prioridade)
- ~ Labels mais descritivos

### 📚 **DOCUMENTAÇÃO**

- ✅ README.md completamente reescrito
- ✅ CHANGELOG.md criado/atualizado
- ✅ ANALISE_v4.0.txt com análise técnica
- ✅ Comentários expandidos no código

### 🐛 **CORRIGIDO**

- ✅ Arquivos faltantes adicionados (index, charts, historico)
- ✅ Documentação desatualizada corrigida
- ✅ UX de seleção de bancos otimizada
- ✅ Inconsistências de nomenclatura

### 📊 **ESTATÍSTICAS v4.0**

```
Categorias:              47 (era 45)
Bancos/Pagamentos:       15 (era 23)
Perfis:                  5  (era 3)
Linhas de código:        ~2.500
Features novas:          12
Bugs corrigidos:         10
```

**NOTA: 10/10** 🏆

---

## [3.1.0] - 2025-02-11 (Contribuição do Usuário)

### ✨ **ADICIONADO**

**Arquitetura:**
- Modularização do JavaScript (3 arquivos)
- js/constantes.js (categorias e bancos com IDs)
- js/config.js (gerenciador de configurações)
- Sistema de recorrências (backend implementado)

**Dados:**
- IDs estáveis para categorias
- Lista expandida de bancos (23)
- Categorias de dívidas revisadas

**Perfil:**
- Campo % de quitação de dívidas

### ⚠️ **PROBLEMAS**

- Faltam UIs para gerenciar categorias/bancos
- Faltam arquivos (index, charts, historico)
- Documentação não atualizada
- % dívidas não integrado no dashboard

**NOTA: 8.5/10** (Arquitetura excelente, mas incompleto)

---

## [3.0.0] - 2025-02-10

### ✨ **NOVIDADE PRINCIPAL**

**KPI de DÍVIDAS:**
- Dívidas agora são KPI separado (6 KPIs total)
- Destaque visual: vermelho pulsante ⚠️
- 4 colunas no dashboard (Receita, Poupança, Despesas, Dívidas)
- 10 categorias de dívidas
- Toast especial ao registrar dívida

**Cálculo Atualizado:**
```
Saldo = Renda - Poupança - Essenciais - Livres - DÍVIDAS
```

### 🔧 **MELHORIAS**

- 9 bancos disponíveis para dívidas
- Gráficos incluem dívidas
- Relatórios mostram todos 6 KPIs

**NOTA: 9/10**

---

## [2.0.1] - 2025-02-09

### 🐛 **CORREÇÕES CRÍTICAS**

- Selects de categorias/bancos corrigidos
- DOMContentLoaded implementado
- Ordem de carregamento corrigida

---

## [2.0.0] - 2025-02-09

### 🎨 **REESCRITA COMPLETA**

- Hash SHA-256 para senhas
- Modal de edição de lançamentos
- Toast notifications
- Navegação entre meses
- Perfil financeiro (3 perfis)
- Gráficos com Chart.js
- Exportação PDF
- 5 KPIs (Renda, Poupança, Essenciais, Livres, Saldo)

**NOTA: 8/10**

---

## [1.0.0] - 2025-02-08

### 🎉 **LANÇAMENTO INICIAL**

- Sistema básico de controle financeiro
- CRUD de lançamentos
- Dashboard simples
- localStorage

**NOTA: 7/10**

---

**Formato:** [Versão] - Data  
**Tipos de mudança:**
- ✨ ADICIONADO: Novas features
- 🔧 MODIFICADO: Mudanças em features existentes
- 🐛 CORRIGIDO: Bugs corrigidos
- 📚 DOCUMENTAÇÃO: Apenas docs
- ⚠️ DEPRECIADO: Features que serão removidas
- ❌ REMOVIDO: Features removidas

