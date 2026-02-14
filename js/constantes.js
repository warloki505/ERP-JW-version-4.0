/* =====================================================
   ERP FINANCEIRO JW v4.0 - CONSTANTES OTIMIZADAS
   Data: 12/02/2025
   
   MELHORIAS v4.0:
   - Bancos reduzidos (23 → 15 principais)
   - Formas de pagamento separadas (PIX, Dinheiro)
   - Categorias expandidas (+8 novas)
   - 5 perfis financeiros (era 3)
   - Sistema de alertas e metas
   - Metadata auto-calculado
   ===================================================== */

(function () {
  'use strict';

  // ===============================================
  // CATEGORIAS (47 total)
  // ===============================================
  const CATEGORIES = {
    receita: [
      { id: 'rec_salario', label: 'Salário' },
      { id: 'rec_freelance', label: 'Freelance' },
      { id: 'rec_bonus', label: 'Bônus/Comissão' },
      { id: 'rec_renda_extra', label: 'Renda Extra' },
      { id: 'rec_reembolso', label: 'Reembolso' },
      { id: 'rec_rendimentos', label: 'Rendimentos' },
      { id: 'rec_outros', label: 'Outros' }
    ],

    poupanca: [
      { id: 'pou_reserva_emergencia', label: 'Reserva de Emergência' },
      { id: 'pou_aposentadoria', label: 'Aposentadoria' },
      { id: 'pou_investimento', label: 'Investimento' },
      { id: 'pou_objetivos', label: 'Objetivos Específicos' },
      { id: 'pou_outros', label: 'Outros' }
    ],

    despesa_essencial: [
      { id: 'des_moradia', label: 'MORADIA (Aluguel/Condomínio)' },
      { id: 'des_alimentacao_ess', label: 'ALIMENTAÇÃO ESSENCIAL' },
      { id: 'des_transporte', label: 'TRANSPORTE' },
      { id: 'des_saude', label: 'SAÚDE' },
      { id: 'des_educacao', label: 'EDUCAÇÃO' },
      { id: 'des_comunicacao', label: 'COMUNICAÇÃO (Internet/Cel)' },
      { id: 'des_utilidades', label: 'UTILIDADES (Luz/Água/Gás)' },
      { id: 'des_seguros', label: 'SEGUROS' },
      { id: 'des_impostos', label: 'IMPOSTOS E TRIBUTOS' },
      { id: 'des_cuidado_pessoal', label: 'CUIDADO PESSOAL' },
      { id: 'des_outros_ess', label: 'OUTROS ESSENCIAIS' }
    ],

    despesa_livre: [
      { id: 'des_lazer', label: 'LAZER E ENTRETENIMENTO' },
      { id: 'des_streaming', label: 'STREAMING E ASSINATURAS' },
      { id: 'des_alimentacao_fora', label: 'ALIMENTAÇÃO FORA' },
      { id: 'des_vestuario', label: 'VESTUÁRIO' },
      { id: 'des_viagens', label: 'VIAGENS E PASSEIOS' },
      { id: 'des_hobbies', label: 'HOBBIES' },
      { id: 'des_presentes', label: 'PRESENTES' },
      { id: 'des_outros_liv', label: 'OUTROS LIVRES' }
    ],

    divida: [
      { id: 'div_cartao_credito', label: 'Cartão de Crédito (fatura)' },
      { id: 'div_parcelas_cartao', label: 'Parcelas no cartão' },
      { id: 'div_emprestimo_pessoal', label: 'Empréstimo pessoal' },
      { id: 'div_fin_estudantil', label: 'Financiamento estudantil (FIES)' },
      { id: 'div_fin_imovel', label: 'Financiamento imobiliário' },
      { id: 'div_fin_veiculo', label: 'Financiamento de veículo' },
      { id: 'div_consorcio', label: 'Consórcio' },
      { id: 'div_acordo', label: 'Acordo/Parcelamento' },
      { id: 'div_emprestimo_familiar', label: 'Empréstimo familiar/amigos' },
      { id: 'div_outros', label: 'Outras dívidas' }
    ]
  };

  // ===============================================
  // BANCOS E FORMAS DE PAGAMENTO (15 total)
  // OTIMIZADO: Reduzido de 23 para 15 principais
  // ===============================================
  const BANKS_BASE = [
    // Formas de Pagamento (4)
    { id: 'bank_cartao_credito', label: 'Cartão de Crédito', category: 'payment' },
    { id: 'bank_cartao_debito', label: 'Cartão de Débito', category: 'payment' },
    { id: 'bank_pix', label: 'PIX', category: 'payment' },
    { id: 'bank_dinheiro', label: 'Dinheiro', category: 'payment' },
    
    // Bancos Digitais Top 5
    { id: 'bank_nubank', label: 'Nubank', category: 'digital' },
    { id: 'bank_inter', label: 'Inter', category: 'digital' },
    { id: 'bank_c6', label: 'C6 Bank', category: 'digital' },
    { id: 'bank_mercado_pago', label: 'Mercado Pago', category: 'digital' },
    { id: 'bank_picpay', label: 'PicPay', category: 'digital' },
    
    // Bancos Tradicionais Top 4
    { id: 'bank_itau', label: 'Itaú', category: 'traditional' },
    { id: 'bank_bb', label: 'Banco do Brasil', category: 'traditional' },
    { id: 'bank_caixa', label: 'Caixa', category: 'traditional' },
    { id: 'bank_bradesco', label: 'Bradesco', category: 'traditional' },
    
    // Corretoras/Investimentos Top 2
    { id: 'bank_xp', label: 'XP Investimentos', category: 'broker' },
    { id: 'bank_btg', label: 'BTG Pactual', category: 'broker' },
    
    // Outros
    { id: 'bank_outros', label: 'Outros', category: 'other' }
  ];

  // Defaults por tipo (5-7 por tipo para UX otimizada)
  const BANKS_BY_TYPE_DEFAULT = {
    receita: [
      'Cartão de Débito', 'PIX', 'Nubank', 'Itaú', 'Inter', 'Outros'
    ],
    poupanca: [
      'Nubank', 'Inter', 'XP Investimentos', 'BTG Pactual', 'Itaú', 'Outros'
    ],
    despesa: [
      'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro', 
      'Nubank', 'Mercado Pago', 'Outros'
    ],
    divida: [
      'Cartão de Crédito', 'Nubank', 'Itaú', 'Banco do Brasil', 
      'Caixa', 'Bradesco', 'Outros'
    ]
  };

  // ===============================================
  // PERFIS FINANCEIROS v4.0 (5 perfis)
  // NOVO: Poupador Agressivo e Quitador de Dívidas
  // ===============================================
  const FINANCIAL_PROFILES = {
    responsavel: {
      name: '🎯 Responsável',
      description: 'Equilíbrio entre segurança e qualidade de vida',
      percEssenciais: 50,
      percLivres: 20,
      percPoupanca: 20,
      percQuitacaoDividas: 10
    },
    conservador: {
      name: '🛡️ Conservador',
      description: 'Máxima segurança financeira e reservas',
      percEssenciais: 50,
      percLivres: 10,
      percPoupanca: 30,
      percQuitacaoDividas: 10
    },
    poupador_agressivo: {
      name: '💰 Poupador Agressivo',
      description: 'Foco máximo em construir patrimônio',
      percEssenciais: 45,
      percLivres: 15,
      percPoupanca: 30,
      percQuitacaoDividas: 10
    },
    livre: {
      name: '🌟 Livre',
      description: 'Mais flexibilidade no dia a dia',
      percEssenciais: 50,
      percLivres: 30,
      percPoupanca: 10,
      percQuitacaoDividas: 10
    },
    quitador: {
      name: '🎯 Quitador de Dívidas',
      description: 'Prioridade: zerar dívidas rapidamente',
      percEssenciais: 45,
      percLivres: 15,
      percPoupanca: 15,
      percQuitacaoDividas: 25
    }
  };

  // ===============================================
  // SISTEMA DE ALERTAS E METAS v4.0
  // NOVO: Thresholds para indicadores financeiros
  // ===============================================
  const FINANCIAL_THRESHOLDS = {
    poupanca: {
      excelente: 30,
      otima: 20,
      aceitavel: 10,
      baixa: 5
    },
    endividamento: {
      saudavel: 10,
      atencao: 20,
      perigoso: 30,
      critico: 40
    },
    essenciais: {
      ideal: 50,
      aceitavel: 60,
      alto: 70
    }
  };

  // ===============================================
  // EXPORTAR PARA NAMESPACE GLOBAL
  // ===============================================
  window.ERP_CONST = {
    version: '4.1.0',
    releaseDate: '2026-02-14',
    
    // Dados
    categories: CATEGORIES,
    banksBase: BANKS_BASE,
    banksByTypeDefault: BANKS_BY_TYPE_DEFAULT,
    
    // Perfis e Metas
    financialProfiles: FINANCIAL_PROFILES,
    thresholds: FINANCIAL_THRESHOLDS,
    
    // Metadata (auto-calculado)
    totalCategories: Object.values(CATEGORIES).reduce((sum, arr) => sum + arr.length, 0),
    totalBanks: BANKS_BASE.length,
    totalProfiles: Object.keys(FINANCIAL_PROFILES).length
  };

  console.log(`[ERP v${window.ERP_CONST.version}] Constantes carregadas:`, {
    categorias: window.ERP_CONST.totalCategories,
    bancos: window.ERP_CONST.totalBanks,
    perfis: window.ERP_CONST.totalProfiles
  });

})();
