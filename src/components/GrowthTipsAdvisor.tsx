/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Transaction,
  WebProject,
  BusinessProfile,
  PhoneRepairItem,
  SaaSSubscriber,
  FixedSiteClient,
} from '../types';
import { formatBRL, formatPercent } from '../utils/formatters';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldAlert,
  Smartphone,
  Store,
  Globe,
  Filter,
  Check,
} from 'lucide-react';

interface GrowthTipsAdvisorProps {
  transactions: Transaction[];
  projects: WebProject[];
  profile: BusinessProfile;
  phones?: PhoneRepairItem[];
  saasSubscribers?: SaaSSubscriber[];
  fixedClients?: FixedSiteClient[];
  metrics: ReturnType<typeof import('../utils/formatters').calculateWebAgencyMetrics>;
  onNavigateToStreams?: () => void;
  onOpenNewProject?: () => void;
}

export type TipCategory = 'all' | 'cost' | 'revenue' | 'mrr';

interface GrowthTip {
  id: string;
  category: 'cost' | 'revenue' | 'mrr';
  type: 'warning' | 'opportunity' | 'achievement' | 'action';
  title: string;
  description: string;
  metricBadge: string;
  actionText?: string;
  onAction?: () => void;
}

export const GrowthTipsAdvisor: React.FC<GrowthTipsAdvisorProps> = ({
  transactions,
  projects,
  profile,
  phones = [],
  saasSubscribers = [],
  fixedClients = [],
  metrics,
  onNavigateToStreams,
  onOpenNewProject,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TipCategory>('all');
  const [completedTipIds, setCompletedTipIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gestor_clean_completed_tips');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleCompleteTip = (tipId: string) => {
    setCompletedTipIds((prev) => {
      const next = prev.includes(tipId)
        ? prev.filter((id) => id !== tipId)
        : [...prev, tipId];
      try {
        localStorage.setItem('gestor_clean_completed_tips', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // -------------------------------------------------------------------------
  // FINANCIAL CALCULATIONS & RULES ENGINE FOR GROWTH TIPS
  // -------------------------------------------------------------------------
  const tips: GrowthTip[] = [];

  // 1. MARGEM DE LUCRO LÍQUIDO REALIZADA
  const incomeCompleted = metrics.monthIncomeCompleted;
  const opExpenses = metrics.monthOperacaoExpenses;
  const netProfit = metrics.monthNetProfitRealized;
  const profitMarginPct = incomeCompleted > 0 ? (netProfit / incomeCompleted) * 100 : 0;
  const costRatioPct = incomeCompleted > 0 ? (opExpenses / incomeCompleted) * 100 : 0;

  if (incomeCompleted > 0 && profitMarginPct < 20) {
    tips.push({
      id: 'tip-low-profit-margin',
      category: 'cost',
      type: 'warning',
      title: 'Margem de Lucro abaixo de 20%: reduza custos operacionais',
      description: `Sua margem de lucro líquido realizada este mês está em ${formatPercent(
        profitMarginPct
      )} (ideal: 25% a 35%). Seus custos fixos/ferramentas somam ${formatBRL(
        opExpenses
      )} (${costRatioPct.toFixed(0)}% da receita). Revise assinaturas recorrentes de softwares, planos de hospedagem ociosos ou aumente o ticket dos próximos sites.`,
      metricBadge: `Margem: ${formatPercent(profitMarginPct)}`,
    });
  } else if (incomeCompleted > 0 && profitMarginPct >= 35) {
    tips.push({
      id: 'tip-high-profit-margin',
      category: 'revenue',
      type: 'achievement',
      title: 'Excelente Margem de Lucro Líquido (+35%)',
      description: `Parabéns! Sua rentabilidade líquida está em ${formatPercent(
        profitMarginPct
      )}. Aproveite a sobra de caixa para antecipar aportes na Reserva de Emergência (${formatBRL(
        metrics.emergencySeparatedRealized
      )}) ou adquirir ferramentas que acelerem seu desenvolvimento.`,
      metricBadge: `Margem: ${formatPercent(profitMarginPct)} ✓`,
    });
  }

  // 2. RECEITA RECORRENTE (MRR) VS ALUGUEL PRIORITÁRIO
  const totalSaaSMRR = saasSubscribers
    .filter((s) => s.status === 'ativo')
    .reduce((acc, s) => acc + s.monthlyFee, 0);

  const totalFixedMRR = fixedClients
    .filter((c) => c.status === 'ativo')
    .reduce((acc, c) => acc + c.monthlyFee, 0);

  const combinedMRR = totalSaaSMRR + totalFixedMRR;
  const rent = profile.monthlyRentAmount || 1400;

  if (combinedMRR < rent) {
    const diff = rent - combinedMRR;
    const neededSaaS = Math.ceil(diff / 100);
    const neededSites = Math.ceil(diff / 250);

    tips.push({
      id: 'tip-mrr-rent-gap',
      category: 'mrr',
      type: 'opportunity',
      title: `Acelere o MRR: faltam ${formatBRL(diff)} para cobrir 100% do seu aluguel`,
      description: `Sua receita previsível (SaaS PDV + Sites Fixos) está em ${formatBRL(
        combinedMRR
      )}/mês. Fechando apenas +${neededSaaS} assinantes de PDV ou +${neededSites} contrato(s) de suporte/hospedagem de site, seu aluguel de ${formatBRL(
        rent
      )} será pago 100% no piloto automático sem você depender de fechar projetos novos!`,
      metricBadge: `MRR: ${formatBRL(combinedMRR)} / ${formatBRL(rent)}`,
      actionText: 'Abrir Fontes de Renda',
      onAction: onNavigateToStreams,
    });
  } else {
    tips.push({
      id: 'tip-mrr-rent-covered',
      category: 'mrr',
      type: 'achievement',
      title: 'Aluguel 100% blindado por receita recorrente!',
      description: `Seu MRR somado (${formatBRL(
        combinedMRR
      )}) já cobre com folga seu aluguel de ${formatBRL(
        rent
      )}. Agora o próximo salto de escala é fazer o MRR cobrir também todos os custos operacionais (${formatBRL(
        profile.monthlyFixedCostTarget
      )}).`,
      metricBadge: `MRR: ${formatBRL(combinedMRR)}/mês ✓`,
    });
  }

  // 3. RECEBÍVEIS TRAVADOS EM SITES ENTREGUES AGUARDANDO PAGAMENTO
  const waitingDeliveredProjects = projects.filter((p) => p.status === 'entregue_aguardando');
  const waitingDeliveredAmount = waitingDeliveredProjects.reduce(
    (acc, p) => acc + (p.totalValue - p.receivedAmount),
    0
  );

  if (waitingDeliveredAmount > 0) {
    tips.push({
      id: 'tip-waiting-receivables',
      category: 'revenue',
      type: 'action',
      title: `Destrave ${formatBRL(waitingDeliveredAmount)} de sites já entregues`,
      description: `Você tem ${waitingDeliveredProjects.length} projeto(s) com entrega realizada aguardando aprovação final para quitar o saldo (ex: ${waitingDeliveredProjects[0].projectName}). Envie uma mensagem rápida de alinhamento com o link para o cliente homologar e liberar o Pix hoje mesmo no seu caixa!`,
      metricBadge: `+${formatBRL(waitingDeliveredAmount)} a entrar`,
    });
  }

  // 4. BANCADA DE CELULARES: CAPITAL PARADO & OPORTUNIDADE DE GIRO
  const phonesReadyToSell = phones.filter((p) => p.status === 'pronto_venda');
  const phonesInRepair = phones.filter((p) => p.status === 'em_reparo');

  if (phonesReadyToSell.length > 0) {
    const readySaleValue = phonesReadyToSell.reduce(
      (acc, p) => acc + p.targetSalePrice,
      0
    );
    const readyProfit = phonesReadyToSell.reduce(
      (acc, p) => acc + (p.targetSalePrice - (p.purchasePrice + p.partsCost)),
      0
    );

    tips.push({
      id: 'tip-phones-ready',
      category: 'revenue',
      type: 'opportunity',
      title: `Gire o estoque de celulares: ${formatBRL(readyProfit)} de lucro pronto`,
      description: `Você tem ${phonesReadyToSell.length} aparelho(s) consertado(s) e pronto(s) para venda (ex: ${phonesReadyToSell[0].model}). Faça anúncios na OLX, Marketplace do Facebook e divulgue nos stories do WhatsApp para transformar esse estoque em ${formatBRL(
        readySaleValue
      )} de dinheiro vivo no caixa.`,
      metricBadge: `+${formatBRL(readyProfit)} lucro previsto`,
      actionText: 'Ver Aparelhos na Bancada',
      onAction: onNavigateToStreams,
    });
  }

  if (phonesInRepair.length > 1) {
    const repairCapital = phonesInRepair.reduce(
      (acc, p) => acc + p.purchasePrice,
      0
    );
    tips.push({
      id: 'tip-phones-repair-pace',
      category: 'cost',
      type: 'warning',
      title: `Evite capital travado: ${phonesInRepair.length} celulares na bancada`,
      description: `Você possui ${phonesInRepair.length} celulares aguardando peças ou reparo, imobilizando ${formatBRL(
        repairCapital
      )} de caixa. Finalize a manutenção do próximo aparelho antes de comprar novos quebrados para manter seu giro de caixa rápido.`,
      metricBadge: `${phonesInRepair.length} na bancada`,
      actionText: 'Gerenciar Bancada',
      onAction: onNavigateToStreams,
    });
  }

  // 5. CAIXA LIVRE E META DOS R$ 2.500 PARA VIRADA QUINZENAL
  if (!metrics.isFreeCashAchieved) {
    const cashRemaining = Math.max(0, (profile.freeCashThreshold || 2500) - metrics.currentFreeCash);
    tips.push({
      id: 'tip-free-cash-quinzenal',
      category: 'cost',
      type: 'action',
      title: `Faltam ${formatBRL(cashRemaining)} no caixa livre para a virada quinzenal`,
      description: `Seu caixa livre atual é de ${formatBRL(
        metrics.currentFreeCash
      )}. Mantenha a regra de fatiar 50% de cada entrada de site para seu sustento e 50% retido na conta PJ até ultrapassar a marca de R$ 2.500. Assim que atingir, você ativará os repasses quinzenais fixos sem oscilação.`,
      metricBadge: `Meta: ${formatBRL(profile.freeCashThreshold || 2500)}`,
    });
  }

  // 6. TICKET MÉDIO DE PROJETOS WEB
  const ticket = profile.averageTicketSale || 2800;
  if (ticket < 3500) {
    tips.push({
      id: 'tip-upsell-ticket',
      category: 'revenue',
      type: 'opportunity',
      title: `Aumente seu ticket médio oferecendo contrato de manutenção no fechamento`,
      description: `Seu ticket médio por site está em ${formatBRL(
        ticket
      )}. Para chegar à meta de ${formatBRL(
        profile.targetCompanyProfit
      )} de lucro com menos esforço, embale a venda do site com "3 meses de suporte grátis + R$ 200/mês a partir do 4º mês". Isso sobe o valor percebido e já cria clientes recorrentes de imediato!`,
      metricBadge: `Ticket atual: ${formatBRL(ticket)}`,
      actionText: 'Novo Projeto',
      onAction: onOpenNewProject,
    });
  }

  // 7. ENVELOPE DE IMPOSTOS E TRIBUTAÇÃO
  if (metrics.taxesSeparatedRealized > metrics.taxesPaidMonth) {
    const taxesDiff = metrics.taxesSeparatedRealized - metrics.taxesPaidMonth;
    tips.push({
      id: 'tip-envelope-taxes-reminder',
      category: 'cost',
      type: 'action',
      title: `Guarde ${formatBRL(taxesDiff)} para o pagamento de impostos (DAS/Simples)`,
      description: `Com base nas receitas que entraram este mês, a provisão recomendada é de ${formatBRL(
        metrics.taxesSeparatedRealized
      )} (${metrics.taxesPct}%). Mantenha esse saldo separado na conta PJ para não ser pego de surpresa no vencimento da guia tributária.`,
      metricBadge: `DAS: ${formatBRL(taxesDiff)}`,
    });
  }

  // Filtered tips based on active category
  const filteredTips = tips.filter((tip) => {
    if (selectedCategory === 'all') return true;
    return tip.category === selectedCategory;
  });

  // Calculate dynamic health score
  let healthScore = 70;
  if (metrics.isFreeCashAchieved) healthScore += 10;
  if (combinedMRR >= rent) healthScore += 10;
  if (profitMarginPct >= 25) healthScore += 10;
  if (profitMarginPct < 15 && incomeCompleted > 0) healthScore -= 15;
  if (waitingDeliveredAmount > 1500) healthScore -= 5;
  healthScore = Math.max(30, Math.min(100, healthScore));

  const getScoreBadge = () => {
    if (healthScore >= 85) {
      return { label: 'Excelente', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
    if (healthScore >= 65) {
      return { label: 'Estável e em Crescimento', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    }
    return { label: 'Atenção aos Custos', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  };

  const scoreBadge = getScoreBadge();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header with Health Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
              <Lightbulb className="w-4 h-4 text-blue-600" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Dicas de Crescimento & Diagnóstico Financeiro
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Recomendações automáticas baseadas nas suas receitas, margem de lucro, custos fixos, estoque de celulares e contratos de MRR.
          </p>
        </div>

        {/* Health score indicator */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Saúde do Negócio
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                {healthScore}/100
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${scoreBadge.color}`}>
                {scoreBadge.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Todas as Dicas ({tips.length})
        </button>
        <button
          onClick={() => setSelectedCategory('cost')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
            selectedCategory === 'cost'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span>Custos & Margens ({tips.filter((t) => t.category === 'cost').length})</span>
        </button>
        <button
          onClick={() => setSelectedCategory('revenue')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
            selectedCategory === 'revenue'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span>Oportunidades de Caixa ({tips.filter((t) => t.category === 'revenue').length})</span>
        </button>
        <button
          onClick={() => setSelectedCategory('mrr')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
            selectedCategory === 'mrr'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-3 h-3 text-indigo-600" />
          <span>Recorrência & MRR ({tips.filter((t) => t.category === 'mrr').length})</span>
        </button>
      </div>

      {/* Tips Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {filteredTips.map((tip) => {
          const isDone = completedTipIds.includes(tip.id);

          // Card styles based on tip type
          const typeConfig = {
            warning: {
              border: 'border-amber-200 hover:border-amber-300',
              bg: 'bg-amber-50/30',
              iconBg: 'bg-amber-100 text-amber-800 border-amber-300',
              icon: AlertTriangle,
              badge: 'bg-amber-100 text-amber-900 border-amber-300',
            },
            opportunity: {
              border: 'border-blue-200 hover:border-blue-300',
              bg: 'bg-blue-50/30',
              iconBg: 'bg-blue-100 text-blue-800 border-blue-300',
              icon: TrendingUp,
              badge: 'bg-blue-100 text-blue-900 border-blue-300',
            },
            achievement: {
              border: 'border-emerald-200 hover:border-emerald-300',
              bg: 'bg-emerald-50/30',
              iconBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              icon: CheckCircle2,
              badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
            },
            action: {
              border: 'border-indigo-200 hover:border-indigo-300',
              bg: 'bg-indigo-50/30',
              iconBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
              icon: Zap,
              badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
            },
          }[tip.type];

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={tip.id}
              className={`rounded-xl border p-4 transition-all space-y-3 flex flex-col justify-between ${
                isDone
                  ? 'opacity-60 bg-slate-50 border-slate-200'
                  : `${typeConfig.border} ${typeConfig.bg} shadow-2xs`
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border ${typeConfig.iconBg}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeConfig.badge}`}>
                      {tip.metricBadge}
                    </span>
                  </div>

                  {/* Checklist mark as done button */}
                  <button
                    onClick={() => toggleCompleteTip(tip.id)}
                    title={isDone ? 'Desmarcar dica' : 'Marcar dica como revisada/feita'}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span className="text-[10px] font-medium">{isDone ? 'Feito' : 'Concluir'}</span>
                  </button>
                </div>

                <h4 className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {tip.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {tip.description}
                </p>
              </div>

              {/* Action button if present */}
              {tip.actionText && tip.onAction && !isDone && (
                <div className="pt-2 border-t border-slate-100/80 flex justify-end">
                  <button
                    onClick={tip.onAction}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-50/60 border border-blue-200 px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-3xs"
                  >
                    <span>{tip.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
