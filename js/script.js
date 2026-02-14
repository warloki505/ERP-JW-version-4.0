/* =====================================================
   ERP FINANCEIRO JW v4.0.1 - SCRIPT PRINCIPAL
   Data: 14/02/2026
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
        version: '4.0.1',
        appName: 'ERP Financeiro JW',
        storagePrefix: 'gf_erp_',
        debug: false,
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
        keys: {
            user: 'gf_erp_user',
            logged: 'gf_erp_logged'
        },

        isLoggedIn: function() {
            return localStorage.getItem(this.keys.logged) === 'true';
        },

        requireAuth: function(redirectTo = 'index.html') {
            if (!this.isLoggedIn() && !window.location.pathname.includes(redirectTo)) {
                window.location.href = redirectTo;
                return false;
            }
            return true;
        },

        getCurrentUser: function() {
            try {
                return JSON.parse(localStorage.getItem(this.keys.user) || 'null');
            } catch (e) {
                return null;
            }
        },

        logout: function(redirectTo = 'index.html') {
            if (confirm('Deseja realmente sair?')) {
                localStorage.setItem(this.keys.logged, 'false');
                window.location.href = redirectTo;
            }
        },

        getDisplayName: function() {
            const user = this.getCurrentUser();
            if (user && user.nome) {
                return user.nome.split(' ')[0];
            }
            return 'Usuário';
        }
    };

    // ===============================
    // UTILITIES DE FORMATAÇÃO
    // ===============================
    const Formatters = {
        currency: function(value) {
            return (Number(value) || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        },

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

        monthLabel: function(monthId) {
            if (!monthId) return '';
            const [year, month] = monthId.split('-');
            return new Date(year, month - 1).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
            });
        },

        percent: function(value, decimals = 1) {
            return (Number(value) || 0).toFixed(decimals) + '%';
        }
    };

    // ===============================
    // UTILITIES DE DOM
    // ===============================
    const DOM = {
        $: function(id) {
            return document.getElementById(id);
        },

        q: function(selector, context = document) {
            return context.querySelector(selector);
        },

        qq: function(selector, context = document) {
            return context.querySelectorAll(selector);
        },

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

        toggle: function(element, show) {
            if (!element) return;
            if (show === undefined) {
                show = element.style.display === 'none';
            }
            element.style.display = show ? '' : 'none';
            element.classList.toggle('hidden', !show);
        },

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
        },
        
        toggle: function() {
            const current = this.getCurrent();
            this.setTheme(current === 'light' ? 'dark' : 'light');
            return this.getCurrent();
        },
        
        init: function() {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const savedTheme = this.getCurrent();
            if (savedTheme === 'dark' || (savedTheme === 'light' && prefersDark)) {
                this.setTheme('dark');
            } else {
                this.setTheme('light');
            }
        }
    };

    // ===============================
    // GERENCIADOR DE NAVEGAÇÃO
    // ===============================
    const Navigation = {
        goTo: function(page) {
            const target = ERP_CONFIG.pages[page] || page;
            window.location.href = target;
        },

        backToDashboard: function() {
            this.goTo('dashboard');
        },

        initNavButtons: function() {
            DOM.qq('.js-back').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.history.back();
                });
            });

            DOM.qq('.js-dashboard').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.backToDashboard();
                });
            });

            DOM.qq('.js-logout').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    Auth.logout();
                });
            });

            DOM.qq('.js-theme-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    Theme.toggle();
                    Toast.info(`Tema alterado`);
                });
            });
        }
    };

    // ===============================
    // EXPORTAÇÃO PARA USO GLOBAL
    // ===============================
    window.ERP = {
        config: ERP_CONFIG,
        logger,
        auth: Auth,
        format: Formatters,
        dom: DOM,
        toast: Toast,
        theme: Theme,
        nav: Navigation,
        $: DOM.$,
        q: DOM.q,
        qq: DOM.qq,
        version: ERP_CONFIG.version,
        
        init: function() {
            this.theme.init();
            this.nav.initNavButtons();
            if (!window.location.pathname.includes('index.html')) {
                this.auth.requireAuth();
            }
            const userNameEl = this.$('userName');
            if (userNameEl && this.auth.isLoggedIn()) {
                userNameEl.textContent = `Olá, ${this.auth.getDisplayName()}`;
            }
        }
    };

    // ===============================
    // INICIALIZA AUTOMATICAMENTE
    // ===============================
    document.addEventListener('DOMContentLoaded', () => {
        window.ERP.init();
    });

})();
