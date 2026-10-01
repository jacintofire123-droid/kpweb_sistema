/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BusinessProfile,
  WebProject,
  Transaction,
  PhoneRepairItem,
  SaaSSubscriber,
  FixedSiteClient,
} from '../types';

export const initialProfile: BusinessProfile = {
  companyName: 'Studio Dev Web',
  ownerName: 'Dev & Empreendedor',
  targetCompanyProfit: 8000,   // Meta: R$ 8.000 de lucro da empresa
  targetMonthlyRevenue: 14850, // Meta: R$ 14.850 de faturamento bruto
  targetProlabore: 5000,        // Meta: R$ 5.000 de pró-labore do dono
  monthlyRentAmount: 1400,      // Aluguel prioritário
  freeCashThreshold: 2500,      // Caixa livre necessário antes de virar quinzenal
  initialCashBalance: 1100,     // Caixa atual começando baixo
  monthlyFixedCostTarget: 1850, // Hospedagem, Vercel, Figma, Internet, DAS MEI
  averageTicketSale: 2800,      // Ticket médio por site
  envelopeTaxesPct: 6,          // 6% para Impostos (DAS MEI / Simples Nacional)
  envelopeEmergencyPct: 10,     // 10% para Reserva de Emergência
  envelopeReinvestmentPct: 10,  // 10% para Reinvestimento em Ferramentas e Crescimento
};

const getRecentDate = (dayOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  return d.toISOString().slice(0, 10);
};

export const initialProjects: WebProject[] = [
  {
    id: 'proj-1',
    clientName: 'Dr. Roberto Clínicas',
    projectName: 'Site Institucional + Agendamento',
    projectType: 'Site Institucional',
    totalValue: 3800,
    receivedAmount: 1900,
    startDate: getRecentDate(8),
    deliveryDate: getRecentDate(-4),
    status: 'em_desenvolvimento',
    notes: '50% pago na entrada. 50% na aprovação final.',
  },
  {
    id: 'proj-2',
    clientName: 'Moda Urbana Store',
    projectName: 'E-commerce Integrado com Nuvemshop',
    projectType: 'E-commerce',
    totalValue: 5500,
    receivedAmount: 2750,
    startDate: getRecentDate(14),
    deliveryDate: getRecentDate(-10),
    status: 'em_desenvolvimento',
    notes: 'Catálogo e checkout em andamento. Saldo de R$ 2.750 na entrega.',
  },
  {
    id: 'proj-3',
    clientName: 'Advocacia Santos & Silva',
    projectName: 'Landing Page de Alta Conversão',
    projectType: 'Landing Page',
    totalValue: 2400,
    receivedAmount: 1200,
    startDate: getRecentDate(18),
    deliveryDate: getRecentDate(1),
    status: 'entregue_aguardando',
    notes: 'Site pronto em subdomínio. Aguardando aprovação para receber saldo de R$ 1.200.',
  },
  {
    id: 'proj-4',
    clientName: 'Academia Corpo & Mente',
    projectName: 'Página de Vendas de Planos',
    projectType: 'Landing Page',
    totalValue: 1800,
    receivedAmount: 1800,
    startDate: getRecentDate(25),
    deliveryDate: getRecentDate(5),
    status: 'pago',
    notes: 'Projeto entregue e quitado 100%.',
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Entrada 50% - Site Dr. Roberto Clínicas',
    amount: 1900,
    type: 'income',
    category: 'Venda de Sites',
    scope: 'PJ',
    date: getRecentDate(8),
    status: 'completed',
    projectId: 'proj-1',
  },
  {
    id: 'tx-2',
    description: 'Entrada 50% - E-commerce Moda Urbana',
    amount: 2750,
    type: 'income',
    category: 'Venda de Sites',
    scope: 'PJ',
    date: getRecentDate(14),
    status: 'completed',
    projectId: 'proj-2',
  },
  {
    id: 'tx-3',
    description: 'Entrada 50% - LP Advocacia Santos',
    amount: 1200,
    type: 'income',
    category: 'Venda de Sites',
    scope: 'PJ',
    date: getRecentDate(18),
    status: 'completed',
    projectId: 'proj-3',
  },
  {
    id: 'tx-4',
    description: 'Quitação - Academia Corpo & Mente',
    amount: 1800,
    type: 'income',
    category: 'Venda de Sites',
    scope: 'PJ',
    date: getRecentDate(5),
    status: 'completed',
    projectId: 'proj-4',
  },
  {
    id: 'tx-5',
    description: 'Aluguel (Residencial / Home Office)',
    amount: 1400,
    type: 'expense',
    category: 'Aluguel',
    scope: 'PF',
    date: getRecentDate(3),
    status: 'completed',
  },
  {
    id: 'tx-6',
    description: 'Repasse de Pró-labore para Conta PF',
    amount: 2200,
    type: 'expense',
    category: 'Pró-labore',
    scope: 'PJ',
    date: getRecentDate(4),
    status: 'completed',
  },
  {
    id: 'tx-7',
    description: 'Vercel Pro + Hostinger VPS',
    amount: 190,
    type: 'expense',
    category: 'Hospedagem & Servidores',
    scope: 'PJ',
    date: getRecentDate(9),
    status: 'completed',
  },
  {
    id: 'tx-8',
    description: 'Assinatura Figma + Ferramentas AI',
    amount: 210,
    type: 'expense',
    category: 'Softwares & Ferramentas',
    scope: 'PJ',
    date: getRecentDate(11),
    status: 'completed',
  },
  {
    id: 'tx-9',
    description: 'Internet Fibra 600MB',
    amount: 130,
    type: 'expense',
    category: 'Internet & Telefonia',
    scope: 'PJ',
    date: getRecentDate(12),
    status: 'completed',
  },
  {
    id: 'tx-10',
    description: 'DAS MEI (Imposto)',
    amount: 85,
    type: 'expense',
    category: 'Impostos',
    scope: 'PJ',
    date: getRecentDate(15),
    status: 'completed',
  },
  {
    id: 'tx-11',
    description: 'Mensalidade SaaS PDV - Mercado Central',
    amount: 99,
    type: 'income',
    category: 'SaaS de PDV (Mensalidades)',
    scope: 'PJ',
    date: getRecentDate(6),
    status: 'completed',
  },
  {
    id: 'tx-12',
    description: 'Manutenção Mensal Site - Dra. Roberto Clínicas',
    amount: 250,
    type: 'income',
    category: 'Clientes Fixos (Manutenção de Sites)',
    scope: 'PJ',
    date: getRecentDate(7),
    status: 'completed',
  },
  {
    id: 'tx-13',
    description: 'Venda Aparelho Consertado - iPhone XR 64GB',
    amount: 1150,
    type: 'income',
    category: 'Venda de Celular Consertado',
    scope: 'PJ',
    date: getRecentDate(2),
    status: 'completed',
  },
  {
    id: 'tx-14',
    description: 'Compra iPhone 11 Quebrado (Estoque)',
    amount: 500,
    type: 'expense',
    category: 'Compra de Celular Quebrado',
    scope: 'PJ',
    date: getRecentDate(10),
    status: 'completed',
  },
  {
    id: 'tx-15',
    description: 'Peça: Tela iPhone 11 + Bateria',
    amount: 260,
    type: 'expense',
    category: 'Peças & Telas de Celulares',
    scope: 'PJ',
    date: getRecentDate(9),
    status: 'completed',
  },
];

// 📱 Conserto e Revenda de Celulares (Flip de Smartphones)
export const initialPhones: PhoneRepairItem[] = [
  {
    id: 'phone-1',
    model: 'iPhone XR 64GB Coral',
    issueDescription: 'Comprado com tela quebrada e tampa traseira riscada. Bateria com 78%.',
    purchasePrice: 350,
    partsCost: 220,
    partsNotes: 'Tela Incell alta definição + Bateria premium nova com selo.',
    purchaseDate: getRecentDate(16),
    targetSalePrice: 1150,
    soldPrice: 1150,
    soldDate: getRecentDate(2),
    buyerName: 'Lucas Oliveira (OLX)',
    status: 'vendido',
    notes: 'Vendido à vista no Pix! Lucro líquido real: R$ 580,00 (101% de ROI sobre as peças e aparelho).',
  },
  {
    id: 'phone-2',
    model: 'iPhone 11 128GB Preto',
    issueDescription: 'Comprado no Marketplace com FaceID funcionando, mas vidro frontal estilhaçado.',
    purchasePrice: 500,
    partsCost: 260,
    partsNotes: 'Tela OLED Premium + Película 3D de brinde instalada.',
    purchaseDate: getRecentDate(10),
    targetSalePrice: 1450,
    status: 'pronto_venda',
    notes: 'Aparelho 100% testado, câmeras perfeitas, anunciado na OLX e Instagram por R$ 1.450. Lucro estimado: R$ 690,00.',
  },
  {
    id: 'phone-3',
    model: 'Xiaomi Redmi Note 12 128GB',
    issueDescription: 'Não liga / tela apagada após queda. Placa está 100% viva e vibrando ao plugar no carregador.',
    purchasePrice: 200,
    partsCost: 130,
    partsNotes: 'Tela nova encomendada no fornecedor local de peças.',
    purchaseDate: getRecentDate(3),
    targetSalePrice: 680,
    status: 'em_reparo',
    notes: 'Na bancada aguardando chegada do display. Custo total R$ 330, venda estimada em R$ 680. Lucro previsto: R$ 350,00.',
  },
];

// ⚡ SaaS de PDV (Software para Ponto de Venda com Recorrência Mensal)
export const initialSaaSUsers: SaaSSubscriber[] = [
  {
    id: 'saas-1',
    businessName: 'Mercadinho Bom Preço',
    ownerName: 'Carlos Eduardo',
    plan: 'PDV Essencial + Controle de Estoque',
    monthlyFee: 99,
    billingDay: 5,
    startDate: getRecentDate(60),
    status: 'ativo',
    lastPaymentMonth: new Date().toISOString().slice(0, 7),
    notes: '1 frente de caixa, backup na nuvem ativo.',
  },
  {
    id: 'saas-2',
    businessName: 'Empório & Distribuidora São Jorge',
    ownerName: 'Marcos Vinícius',
    plan: 'PDV Fiscal Pro (Emissão NFC-e + TEF)',
    monthlyFee: 149,
    billingDay: 15,
    startDate: getRecentDate(45),
    status: 'ativo',
    notes: 'Utiliza impressora térmica e emissão fiscal diária.',
  },
  {
    id: 'saas-3',
    businessName: 'Hamburgueria Burger Smash',
    ownerName: 'Camila Rocha',
    plan: 'PDV Mesas + Delivery Integrado',
    monthlyFee: 129,
    billingDay: 20,
    startDate: getRecentDate(30),
    status: 'ativo',
    notes: 'Comanda mobile e terminal de pedidos balcão.',
  },
];

// 🔄 Clientes Fixos de Sites (Manutenção Mensal, Hospedagem e Suporte Contínuo)
export const initialFixedClients: FixedSiteClient[] = [
  {
    id: 'fix-1',
    clientName: 'Dr. Roberto Clínicas Odontológicas',
    websiteUrl: 'drrobertoclinica.com.br',
    scopeDescription: 'Hospedagem VPS dedicada + Backups semanais + 2h suporte/ajustes',
    monthlyFee: 250,
    billingDay: 5,
    startDate: getRecentDate(90),
    status: 'ativo',
    lastPaymentMonth: new Date().toISOString().slice(0, 7),
    notes: 'Cliente muito pontual. Paga sempre via Pix no dia 5.',
  },
  {
    id: 'fix-2',
    clientName: 'Advocacia Santos & Silva',
    websiteUrl: 'santosadvocacia.com.br',
    scopeDescription: 'Manutenção mensal de artigos no blog, otimização SEO e segurança',
    monthlyFee: 200,
    billingDay: 10,
    startDate: getRecentDate(75),
    status: 'ativo',
    notes: 'Postagens de 2 artigos/mês e monitoramento de uptime.',
  },
  {
    id: 'fix-3',
    clientName: 'Academia Corpo & Mente',
    websiteUrl: 'corpoementeacademia.com.br',
    scopeDescription: 'Hospedagem rápida + Atualizações sazonais de tabela de planos',
    monthlyFee: 180,
    billingDay: 25,
    startDate: getRecentDate(50),
    status: 'ativo',
    notes: 'Contrato semestral renovado.',
  },
];

