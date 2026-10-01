/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'income' | 'expense';

export type AccountScope = 'PJ' | 'PF';

export type TransactionStatus = 'completed' | 'pending';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  scope: AccountScope;
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  notes?: string;
  projectId?: string;
}

export type ProjectStatus = 'em_desenvolvimento' | 'entregue_aguardando' | 'pago';

export interface WebProject {
  id: string;
  clientName: string;
  projectName: string;
  projectType: string;
  totalValue: number;
  receivedAmount: number;
  startDate: string;
  deliveryDate: string;
  status: ProjectStatus;
  notes?: string;
}

// Conserto e Revenda de Celulares (Compra de quebrado, peças, conserto e venda com margem)
export type PhoneRepairStatus = 'em_reparo' | 'pronto_venda' | 'vendido';

export interface PhoneRepairItem {
  id: string;
  model: string;              // ex: "iPhone 11 64GB Preto"
  issueDescription: string;   // ex: "Tela trincada e bateria 73%"
  purchasePrice: number;      // Custo de compra do aparelho quebrado (R$)
  partsCost: number;          // Custo total de peças compradas (tela, bateria, conector) (R$)
  partsNotes?: string;        // ex: "Tela Incell + Bateria Premium Foxconn"
  purchaseDate: string;       // YYYY-MM-DD
  targetSalePrice: number;    // Preço estimado ou anunciado de venda (R$)
  soldPrice?: number;         // Preço real pelo qual foi vendido (R$)
  soldDate?: string;          // YYYY-MM-DD
  buyerName?: string;         // Nome do comprador
  status: PhoneRepairStatus;  // em_reparo, pronto_venda, vendido
  notes?: string;
}

// SaaS de PDV (Software para Ponto de Venda com Mensalidade Recorrente)
export type SaaSStatus = 'ativo' | 'inadimplente' | 'cancelado';

export interface SaaSSubscriber {
  id: string;
  businessName: string;       // ex: "Mercado Central & Açougue"
  ownerName: string;          // ex: "Antônio Ferreira"
  plan: string;               // ex: "PDV Básico", "PDV Fiscal Pro"
  monthlyFee: number;         // R$ 99,00 / mês
  billingDay: number;         // Dia do vencimento (ex: 5, 10, 15, 20)
  startDate: string;          // YYYY-MM-DD
  status: SaaSStatus;
  lastPaymentMonth?: string;  // "2026-10" se o mês atual foi pago
  notes?: string;
}

// Clientes Fixos de Sites (Manutenção Mensal, Hospedagem e Suporte Recorrente)
export type FixedClientStatus = 'ativo' | 'pausado' | 'cancelado';

export interface FixedSiteClient {
  id: string;
  clientName: string;         // ex: "Dr. Roberto Odontologia"
  websiteUrl: string;         // ex: "drroberto.com.br"
  scopeDescription: string;   // ex: "Hospedagem VPS + Backup semanal + Suporte"
  monthlyFee: number;         // R$ 250,00 / mês
  billingDay: number;         // Dia de cobrança (ex: 5, 10, 20)
  startDate: string;          // YYYY-MM-DD
  status: FixedClientStatus;
  lastPaymentMonth?: string;  // "2026-10" se o mês atual foi pago
  notes?: string;
}

export interface BusinessProfile {
  companyName: string;
  ownerName: string;
  targetCompanyProfit: number; // Meta: R$ 8.000 / mês
  targetMonthlyRevenue?: number; // Meta de Faturamento Mensal (ex: R$ 14.850)
  targetProlabore: number;      // Meta: R$ 5.000 / mês
  monthlyRentAmount: number;    // Aluguel prioritário (R$ 1.400)
  freeCashThreshold: number;    // R$ 2.500 no caixa livre
  initialCashBalance: number;
  monthlyFixedCostTarget: number; // Custos operacionais (softwares/VPS/internet)
  averageTicketSale?: number;    // Ticket médio por site (ex: R$ 2.800)
  quinzenalModeActive?: boolean; // Se o fluxo de repasse quinzenal (dias 5 e 20) está ativado
  // Metas de Separação de Envelopes & Reservas (%)
  envelopeTaxesPct?: number;         // Impostos (padrão: 6%)
  envelopeEmergencyPct?: number;     // Reserva de Emergência (padrão: 10%)
  envelopeReinvestmentPct?: number;  // Reinvestimento e Crescimento (padrão: 10%)
}

export type ActiveTab = 'overview' | 'streams' | 'goals' | 'cashflow';
