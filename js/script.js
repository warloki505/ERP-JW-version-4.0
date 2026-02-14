/* =====================================================
   ERP FINANCEIRO JW v4.0 - SCRIPT PRINCIPAL
   Data: 14/02/2026
   
   FUNÇÕES:
   - Gerenciamento de navegação entre páginas
   - Utilities globais compartilhadas
   - Inicialização de componentes comuns
   - Integração com constantes.js e config.js
   ===================================================== */

(function() {
    'use strict';

    // ===============================
    // VERIFICAÇÃO DE DEPENDÊNCIAS
    // ===============================
    if (!window.ERP_CONST) {
        console.warn('[ERP] ERP_CONST não encontrado. Certifique-se que constantes.js foi carregado.');
    }

    // ===============================
    // NAMESPACE PRINCIPAL
    // ===============================
    window.ERP = window.ERP || {};

    // ===============================
    // CONFIGURAÇÕES GLOBAIS
    // ===============================
    const ERP_CONFIG = {
        version: '4.0.0',
        appName: 'ERP Financeiro JW',
        storagePrefix: 'gf_erp_',
        debug: false, // Mude para true para logs de depuração
        pages: {
            index: 'index.html',
            dashboard: 'dashboard.html',
            perfil: 'perfil.html',
            historico: 'historico.html',
            charts: 'charts.html'
        }
    };

    // ===============================
    // UTILITIES DE LOG
    // ===============================
    const logger = {
        log: function(...args) {
            if (ERP_CONFIG.debug) console.log('[ERP]', ...args);
        },
        warn: function(...args) {
            console.warn('[ERP]', ...args);
        },
        error: function(...args) {
            console.error('[ERP]', ...args);
        }
    };

    // ===============================
    // GERENCIAMENTO DE AUTENTICAÇÃO
    // ===============================
    const Auth = {
        // Chaves do localStorage
        keys: {
            user: 'gf_erp_user',
            logged: 'gf_erp_logged'
        },

        // Verifica se usuário está logado
        isLoggedIn: function() {
            return localStorage.getItem(this.keys.logged) === 'true';
        },

        // Redireciona se não estiver logado
        requireAuth: function(redirectTo = 'index.html') {
            if (!this.isLoggedIn() && !window.location.pathname.includes(redirectTo)) {
                logger.log('Usuário não autenticado, redirecionando...');
                window.location.href = redirectTo;
                return false;
            }
            return true;
        },

        // Obtém dados do usuário atual
        getCurrentUser: function() {
            try {
                return JSON.parse(localStorage.getItem(this.keys.user) || 'null');
            } catch (e) {
                logger.error('Erro ao carregar usuário:', e);
                return null;
            }
        },

        // Faz logout
        logout: function(redirectTo = 'index.html') {
            if (confirm('Deseja realmente sair?')) {
                localStorage.setItem(this.keys.logged, 'false');
                window.location.href = redirectTo;
            }
        },

        // Nome de exibição do usuário
        getDisplayName: function() {
            const user = this.getCurrentUser();
            if (user && user.nome) {
                return user.nome.split(' ')[0]; // Primeiro nome
            }
            return 'Usuário';
        }
    };

    // ===============================
    // UTILITIES DE FORMATAÇÃO
    // ===============================
    const Formatters = {
        // Formata valor para moeda BRL
        currency: function(value) {
            return (Number(value) || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        },

        // Formata data
        date: function(dateStr, format = 'short') {
            if (!dateStr) return '';
            
            try {
                const date = new Date(dateStr + 'T00:00:00');
                
                if (format === 'short') {
                    return date.toLocaleDateString('pt-BR');
                } else if (format === 'long') {
                    return date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    });
                } else if (format === 'month') {
                    return date.toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric'
                    });
                }
                
                return date.toLocaleDateString('pt-BR');
            } catch (e) {
                return dateStr;
            }
        },

        // Formata mês (YYYY-MM para nome do mês)
        monthLabel: function(monthId) {
            if (!monthId) return '';
            const [year, month] = monthId.split('-');
            return new Date(year, month - 1).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
            });
        },

        // Formata percentual
        percent: function(value, decimals = 1) {
            return (Number(value) || 0).toFixed(decimals) + '%';
        },

        // Abrevia números grandes (1.5k, 1M, etc)
        compact: function(value) {
            const num = Number(value) || 0;
            
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'k';
            }
            
            return num.toFixed(2);
        }
    };

    // ===============================
    // UTILITIES DE DOM
    // ===============================
    const DOM = {
        // Get element by ID
        $: function(id) {
            return document.getElementById(id);
        },

        // Query selector
        q: function(selector, context = document) {
            return context.querySelector(selector);
        },

        // Query selector all
        qq: function(selector, context = document) {
            return context.querySelectorAll(selector);
        },

        // Cria elemento com atributos
        create: function(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'textContent') {
                    element.textContent = value;
                } else if (key === 'innerHTML') {
                    element.innerHTML = value;
                } else if (key.startsWith('on') && typeof value === 'function') {
                    element.addEventListener(key.slice(2), value);
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
            
            return element;
        },

        // Mostra/esconde elemento
        toggle: function(element, show) {
            if (!element) return;
            if (show === undefined) {
                show = element.style.display === 'none';
            }
            element.style.display = show ? '' : 'none';
            element.classList.toggle('hidden', !show);
        },

        // Limpa elemento
        empty: function(element) {
            if (element) element.innerHTML = '';
        }
    };

    // ===============================
    // SISTEMA DE NOTIFICAÇÕES (TOAST)
    // ===============================
    const Toast = {
        show: function(message, type = 'success', duration = 3000) {
            const toast = DOM.create('div', {
                className: `toast toast--${type}`,
                textContent: message
            });
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },

        success: function(message) {
            this.show(message, 'success');
        },

        error: function(message) {
            this.show(message, 'error');
        },

        info: function(message) {
            this.show(message, 'info');
        },

        warning: function(message) {
            this.show(message, 'warning');
        }
    };

    // ===============================
    // GERENCIADOR DE TEMAS
    // ===============================
    const Theme = {
        key: 'gf_erp_theme',
        
        getCurrent: function() {
            return localStorage.getItem(this.key) || 'light';
        },
        
        setTheme: function(theme) {
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            localStorage.setItem(this.key, theme);
            logger.log(`Tema alterado para: ${theme}`);
        },
        
        toggle: function() {
            const current = this.getCurrent();
            this.setTheme(current === 'light' ? 'dark' : 'light');
            return this.getCurrent();
        },
        
        init: function() {
            // Detecta preferência do sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const savedTheme = this.getCurrent();
            
            if (savedTheme === 'dark' || (savedTheme === 'light' && prefersDark)) {
                this.setTheme('dark');
            } else {
                this.setTheme('light');
            }
            
            // Observa mudanças na preferência do sistema
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.key)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    };

    // ===============================
    // GERENCIADOR DE NAVEGAÇÃO
    // ===============================
    const Navigation = {
        // Vai para uma página
        goTo: function(page) {
            const target = ERP_CONFIG.pages[page] || page;
            window.location.href = target;
        },

        // Voltar para dashboard
        backToDashboard: function() {
            this.goTo('dashboard');
        },

        // Recarrega página atual
        reload: function() {
            window.location.reload();
        },

        // Obtém parâmetros da URL
        getParams: function() {
            const params = new URLSearchParams(window.location.search);
            const result = {};
            for (const [key, value] of params) {
                result[key] = value;
            }
            return result;
        },

        // Adiciona botões de navegação automáticos
        initNavButtons: function() {
            // Botão de voltar
            DOM.qq('.js-back').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.history.back();
                });
            });

            // Botão de dashboard
            DOM.qq('.js-dashboard').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.backToDashboard();
                });
            });

            // Botão de logout
            DOM.qq('.js-logout').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    Auth.logout();
                });
            });

            // Botão de tema
            DOM.qq('.js-theme-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const newTheme = Theme.toggle();
                    Toast.info(`Tema ${newTheme} ativado`);
                });
            });
        }
    };

    // ===============================
    // UTILITIES DE DADOS
    // ===============================
    const DataUtils = {
        // Gera ID único
        uid: function() {
            return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);
        },

        // Calcula resumo do mês (mesma lógica do dashboard)
        calculateSummary: function(transactions) {
            let renda = 0, poupanca = 0, essenciais = 0, livres = 0, dividas = 0;
            
            (transactions || []).forEach(t => {
                const v = Number(t.valor) || 0;
                if (t.tipo === 'receita') renda += v;
                else if (t.tipo === 'poupanca') poupanca += v;
                else if (t.tipo === 'divida') dividas += v;
                else if (t.tipo === 'despesa') {
                    if (t.subtipo === 'essencial') essenciais += v;
                    else if (t.subtipo === 'livre') livres += v;
                }
            });
            
            return {
                renda,
                poupanca,
                essenciais,
                livres,
                dividas,
                saldo: renda - poupanca - essenciais - livres - dividas,
                totalDespesas: essenciais + livres,
                totalGeral: renda + poupanca + essenciais + livres + dividas
            };
        },

        // Obtém mês atual no formato YYYY-MM
        getCurrentMonthId: function() {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        },

        // Obtém ID do mês a partir de uma data
        getMonthId: function(date = new Date()) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        },

        // Carrega transações de um mês
        loadTransactions: function(monthId) {
            try {
                return JSON.parse(localStorage.getItem(`gf_erp_tx_${monthId}`) || '[]');
            } catch (e) {
                logger.error('Erro ao carregar transações:', e);
                return [];
            }
        },

        // Salva transações de um mês
        saveTransactions: function(monthId, transactions) {
            localStorage.setItem(`gf_erp_tx_${monthId}`, JSON.stringify(transactions));
        },

        // Obtém lista de meses com dados
        getAvailableMonths: function() {
            return Object.keys(localStorage)
                .filter(key => key.startsWith('gf_erp_tx_'))
                .map(key => key.replace('gf_erp_tx_', ''))
                .sort((a, b) => b.localeCompare(a)); // Mais recente primeiro
        }
    };

    // ===============================
    // EXPORTAÇÃO PARA USO GLOBAL
    // ===============================
    window.ERP = {
        // Configurações
        config: ERP_CONFIG,
        
        // Módulos
        logger,
        auth: Auth,
        format: Formatters,
        dom: DOM,
        toast: Toast,
        theme: Theme,
        nav: Navigation,
        data: DataUtils,
        
        // Utilities avulsas
        $: DOM.$,
        q: DOM.q,
        qq: DOM.qq,
        
        // Versão
        version: ERP_CONFIG.version,
        
        // Inicializador
        init: function() {
            logger.log(`Iniciando ERP Financeiro v${this.version}`);
            
            // Inicializa tema
            this.theme.init();
            
            // Inicializa navegação
            this.nav.initNavButtons();
            
            // Verifica autenticação (exceto na página de login)
            if (!window.location.pathname.includes('index.html')) {
                this.auth.requireAuth();
            }
            
            // Adiciona nome do usuário se elemento existir
            const userNameEl = this.$('userName');
            if (userNameEl && this.auth.isLoggedIn()) {
                userNameEl.textContent = `Olá, ${this.auth.getDisplayName()}`;
            }
            
            logger.log('ERP Financeiro inicializado com sucesso!');
        }
    };

    // ===============================
    // INICIALIZA AUTOMATICAMENTE
    // ===============================
    document.addEventListener('DOMContentLoaded', () => {
        window.ERP.init();
    });

    // ===============================
    // EXPÕE FUNÇÕES ÚTEIS NO CONSOLE (para debug)
    // ===============================
    if (ERP_CONFIG.debug) {
        window.ERP_debug = window.ERP;
        console.log('✨ ERP Financeiro disponível no console como window.ERP ou window.ERP_debug');
    }

})();
