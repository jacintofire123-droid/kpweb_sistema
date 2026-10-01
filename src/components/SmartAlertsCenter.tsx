/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Transaction,
  WebProject,
  BusinessProfile,
  FixedSiteClient,
  SaaSSubscriber,
} from '../types';
import { formatBRL, formatDateBR } from '../utils/formatters';
import {
  Bell,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Copy,
  Check,
  Building,
  Store,
  Globe,
  DollarSign,
  FileText,
  Home,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface SmartAlertsCenterProps {
  transactions: Transaction[];
  projects: WebProject[];
  profile: BusinessProfile;
  fixedClients?: FixedSiteClient[];
  saasSubscribers?: SaaSSubscriber[];
  metrics: ReturnType<typeof import('../utils/formatters').calculateWebAgencyMetrics>;
  onCollectFixedClient?: (client: FixedSiteClient) => void;
  onCollectSaaS?: (sub: SaaSSubscriber) => void;
  onPayTaxes?: (amount: number) => void;
  onPayRent?: () => void;
  onNavigateToStreams?: () => void;
}

export type AlertFilter = 'all' | 'urgent' | 'upcoming' | 'completed';

export interface RoutineAlert {
  id: string;
  category: 'imposto' | 'cliente_fixo' | 'saas_pdv' | 'projeto_prazo' | 'aluguel' | 'quinzenal';
  urgency: 'overdue' | 'today' | 'upcoming' | 'done';
  title: string;
  entityName: string;
  dueDateStr: string;
  daysDiff: number; // < 0 overdue, 0 today, > 0 future
  amount?: number;
  description: string;
  whatsappMessage?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const SmartAlertsCenter: React.FC<SmartAlertsCenterProps> = ({
  transactions,
  projects,
  profile,
  fixedClients = [],
  saasSubscribers = [],
  metrics,
  onCollectFixedClient,
  onCollectSaaS,
  onPayTaxes,
  onPayRent,
  onNavigateToStreams,
}) => {
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthStr = today.toISOString().slice(0, 7);
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1;

  const handleCopyWhatsApp = (alertId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(alertId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // -------------------------------------------------------------
  // DYNAMIC ALERT GENERATION BASED ON ACTUAL DATES & STATUSES
  // -------------------------------------------------------------
  const alerts: RoutineAlert[] = [];

  // 1. IMPOSTOS PJ (DAS MEI / SIMPLES NACIONAL - VENCIMENTO DIA 20)
  const dasDueDateDay = 20;
  const isTaxesPaidThisMonth = metrics.taxesPaidMonth > 0;
  const taxesAmount = metrics.taxesSeparatedRealized || 85;

  if (isTaxesPaidThisMonth) {
    alerts.push({
      id: 'alert-tax-paid',
      category: 'imposto',
      urgency: 'done',
      title: 'DAS MEI / Tributos do Mês Quitados',
      entityName: 'Receita Federal / Simples',
      dueDateStr: `Dia 20/${String(currentMonthNum).padStart(2, '0')}`,
      daysDiff: 0,
      amount: metrics.taxesPaidMonth,
      description: `Guia de impostos de ${formatBRL(
        metrics.taxesPaidMonth
      )} já foi paga e lançada no seu extrato PJ. Rotina fiscal em dia!`,
    });
  } else {
    const taxDiffDays = dasDueDateDay - currentDay;
    let urgency: RoutineAlert['urgency'] = 'upcoming';
    if (taxDiffDays < 0) urgency = 'overdue';
    else if (taxDiffDays === 0) urgency = 'today';

    alerts.push({
      id: 'alert-tax-pending',
      category: 'imposto',
      urgency,
      title:
        taxDiffDays < 0
          ? `DAS MEI Vencido há ${Math.abs(taxDiffDays)} dias`
          : taxDiffDays === 0
          ? 'DAS MEI VENCE HOJE!'
          : `DAS MEI vence em ${taxDiffDays} dias (Dia 20)`,
      entityName: 'Receita Federal / DAS MEI',
      dueDateStr: `20/${String(currentMonthNum).padStart(2, '0')}/${currentYear}`,
      daysDiff: taxDiffDays,
      amount: taxesAmount,
      description: `O imposto mensal da sua empresa vence todo dia 20. Valor provisionado no envelope: ${formatBRL(
        taxesAmount
      )}. Mantenha o saldo em conta para emitir o boleto ou Pix pelo PGMEI.`,
      actionLabel: onPayTaxes ? 'Registrar Pagamento do DAS' : undefined,
      onAction: onPayTaxes ? () => onPayTaxes(taxesAmount) : undefined,
    });
  }

  // 2. CLIENTES FIXOS DE SITES (MANUTENÇÃO / HOSPEDAGEM)
  fixedClients.forEach((client) => {
    const isPaid = client.lastPaymentMonth === currentMonthStr;
    const clientBillingDay = client.billingDay || 10;
    const diff = clientBillingDay - currentDay;

    if (isPaid) {
      alerts.push({
        id: `alert-fixed-${client.id}-done`,
        category: 'cliente_fixo',
        urgency: 'done',
        title: `Mensalidade Paga: ${client.clientName}`,
        entityName: client.websiteUrl,
        dueDateStr: `Dia ${clientBillingDay}`,
        daysDiff: 0,
        amount: client.monthlyFee,
        description: `Contrato de suporte e hospedagem pago neste mês (${formatBRL(
          client.monthlyFee
        )}).`,
      });
    } else {
      let urgency: RoutineAlert['urgency'] = 'upcoming';
      if (diff < 0) urgency = 'overdue';
      else if (diff === 0) urgency = 'today';

      const whatsappText = `Olá! Tudo bem? Passando para lembrar da mensalidade de manutenção e hospedagem do site ${client.websiteUrl} no valor de ${formatBRL(
        client.monthlyFee
      )} (vencimento dia ${clientBillingDay}). Caso precise da chave Pix, me avise por aqui. Abraços!`;

      alerts.push({
        id: `alert-fixed-${client.id}`,
        category: 'cliente_fixo',
        urgency,
        title:
          diff < 0
            ? `Mensalidade Atrasada (${Math.abs(diff)} dias): ${client.clientName}`
            : diff === 0
            ? `Mensalidade VENCE HOJE: ${client.clientName}`
            : `Vence em ${diff} dias: ${client.clientName}`,
        entityName: client.websiteUrl,
        dueDateStr: `Dia ${clientBillingDay}/${String(currentMonthNum).padStart(2, '0')}`,
        daysDiff: diff,
        amount: client.monthlyFee,
        description: `Cliente com contrato fixo de ${formatBRL(
          client.monthlyFee
        )}/mês. Escopo: ${client.scopeDescription}.`,
        whatsappMessage: whatsappText,
        actionLabel: onCollectFixedClient ? 'Confirmar Recebimento Pix' : undefined,
        onAction: onCollectFixedClient ? () => onCollectFixedClient(client) : undefined,
      });
    }
  });

  // 3. SAAS DE PDV (ASSINATURAS RECORRENTES)
  saasSubscribers.forEach((sub) => {
    const isPaid = sub.lastPaymentMonth === currentMonthStr;
    const subBillingDay = sub.billingDay || 10;
    const diff = subBillingDay - currentDay;

    if (isPaid) {
      alerts.push({
        id: `alert-saas-${sub.id}-done`,
        category: 'saas_pdv',
        urgency: 'done',
        title: `Assinatura Paga: ${sub.businessName}`,
        entityName: sub.ownerName,
        dueDateStr: `Dia ${subBillingDay}`,
        daysDiff: 0,
        amount: sub.monthlyFee,
        description: `Mensalidade do sistema de PDV (${sub.plan}) quitada este mês.`,
      });
    } else {
      let urgency: RoutineAlert['urgency'] = 'upcoming';
      if (diff < 0) urgency = 'overdue';
      else if (diff === 0) urgency = 'today';

      const whatsappText = `Olá ${sub.ownerName}! Tudo bem? Lembramos que a mensalidade do sistema de PDV do ${sub.businessName} no valor de ${formatBRL(
        sub.monthlyFee
      )} vence dia ${subBillingDay}. Segue nossa chave Pix para renovação. Qualquer dúvida com o suporte, estamos à disposição!`;

      alerts.push({
        id: `alert-saas-${sub.id}`,
        category: 'saas_pdv',
        urgency,
        title:
          diff < 0
            ? `Assinatura PDV Atrasada (${Math.abs(diff)} dias): ${sub.businessName}`
            : diff === 0
            ? `Assinatura PDV VENCE HOJE: ${sub.businessName}`
            : `Assinatura PDV vence em ${diff} dias: ${sub.businessName}`,
        entityName: `${sub.businessName} (${sub.ownerName})`,
        dueDateStr: `Dia ${subBillingDay}/${String(currentMonthNum).padStart(2, '0')}`,
        daysDiff: diff,
        amount: sub.monthlyFee,
        description: `Licença ativa do ${sub.plan}. Valor: ${formatBRL(sub.monthlyFee)}/mês.`,
        whatsappMessage: whatsappText,
        actionLabel: onCollectSaaS ? 'Dar Baixa no Mês' : undefined,
        onAction: onCollectSaaS ? () => onCollectSaaS(sub) : undefined,
      });
    }
  });

  // 4. PRAZOS DE ENTREGA DE PROJETOS WEB
  projects
    .filter((p) => p.status === 'em_desenvolvimento')
    .forEach((proj) => {
      const delivery = new Date(proj.deliveryDate);
      const diffMs = delivery.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let urgency: RoutineAlert['urgency'] = 'upcoming';
      if (diffDays < 0) urgency = 'overdue';
      else if (diffDays === 0) urgency = 'today';

      const pendingBalance = proj.totalValue - proj.receivedAmount;

      alerts.push({
        id: `alert-proj-${proj.id}`,
        category: 'projeto_prazo',
        urgency,
        title:
          diffDays < 0
            ? `Prazo Estourado há ${Math.abs(diffDays)} dias: ${proj.projectName}`
            : diffDays === 0
            ? `ENTREGA HOJE: ${proj.projectName}`
            : `Entrega em ${diffDays} dias: ${proj.projectName}`,
        entityName: proj.clientName,
        dueDateStr: formatDateBR(proj.deliveryDate),
        daysDiff: diffDays,
        amount: pendingBalance,
        description: `Site em desenvolvimento. Saldo restante a receber na entrega: ${formatBRL(
          pendingBalance
        )}. Finalize os testes para aprovação do cliente.`,
      });
    });

  // 5. ALUGUEL PRIORITÁRIO (R$ 1.400)
  if (!metrics.isRentPaid) {
    const rentDueDay = 10;
    const diff = rentDueDay - currentDay;
    let urgency: RoutineAlert['urgency'] = 'upcoming';
    if (diff < 0) urgency = 'overdue';
    else if (diff === 0) urgency = 'today';

    alerts.push({
      id: 'alert-rent-pending',
      category: 'aluguel',
      urgency,
      title:
        diff < 0
          ? `Aluguel Pendente (Vencimento estimado dia ${rentDueDay})`
          : diff === 0
          ? 'ALUGUEL VENCE HOJE!'
          : `Aluguel vence em ${diff} dias`,
      entityName: 'Moradia & Home Office',
      dueDateStr: `Dia ${rentDueDay}/${String(currentMonthNum).padStart(2, '0')}`,
      daysDiff: diff,
      amount: profile.monthlyRentAmount || 1400,
      description: `Aluguel prioritário de ${formatBRL(
        profile.monthlyRentAmount || 1400
      )} ainda não consta como pago no extrato. A prioridade nº 1 de moradia deve ser preservada.`,
      actionLabel: onPayRent ? 'Registrar Pagamento Aluguel' : undefined,
      onAction: onPayRent,
    });
  }

  // Sort alerts: Overdue first, then Today, then Upcoming, then Done
  const urgencyWeight: Record<RoutineAlert['urgency'], number> = {
    overdue: 1,
    today: 2,
    upcoming: 3,
    done: 4,
  };

  alerts.sort((a, b) => {
    if (urgencyWeight[a.urgency] !== urgencyWeight[b.urgency]) {
      return urgencyWeight[a.urgency] - urgencyWeight[b.urgency];
    }
    return a.daysDiff - b.daysDiff;
  });

  // Filter alerts
  const filteredAlerts = alerts.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return item.urgency === 'overdue' || item.urgency === 'today';
    if (filter === 'upcoming') return item.urgency === 'upcoming';
    if (filter === 'completed') return item.urgency === 'done';
    return true;
  });

  const urgentCount = alerts.filter((a) => a.urgency === 'overdue' || a.urgency === 'today').length;
  const upcomingCount = alerts.filter((a) => a.urgency === 'upcoming').length;
  const completedCount = alerts.filter((a) => a.urgency === 'done').length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-50 text-rose-700 border border-rose-200 relative">
              <Calendar className="w-4 h-4 text-rose-600" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Central de Alertas & Rotina PJ Inteligente
            </h3>
            {urgentCount > 0 ? (
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                {urgentCount} urgente(s)
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Rotina em Dia ✓
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            Lembretes automáticos baseados nas datas de vencimento de impostos (DAS dia 20), cobranças de clientes fixos, mensalidades de SaaS PDV e prazos de sites.
          </p>
        </div>

        {/* Quick summary badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-medium">
            Hoje: <strong className="text-slate-900 font-mono">{String(currentDay).padStart(2, '0')}/{String(currentMonthNum).padStart(2, '0')}</strong>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Todos os Lembretes ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filter === 'urgent'
              ? 'bg-rose-600 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Vencendo Hoje / Atrasados ({urgentCount})</span>
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Próximos Vencimentos ({upcomingCount})</span>
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Concluídos no Mês ({completedCount})</span>
        </button>
      </div>

      {/* Alerts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <span className="text-xs font-semibold text-slate-800 block">Nenhum alerta pendente nessa categoria</span>
            <p className="text-[11px] text-slate-500">Todas as datas e rotinas selecionadas estão 100% regulares.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isDone = alert.urgency === 'done';
            const isToday = alert.urgency === 'today';
            const isOverdue = alert.urgency === 'overdue';

            // Visual setup
            const borderClass = isOverdue
              ? 'border-rose-300 bg-rose-50/30'
              : isToday
              ? 'border-amber-300 bg-amber-50/30'
              : isDone
              ? 'border-emerald-200 bg-emerald-50/20'
              : 'border-slate-200 bg-white';

            const badgeClass = isOverdue
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : isToday
              ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
              : isDone
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-blue-100 text-blue-800 border-blue-200';

            const categoryIcon = {
              imposto: FileText,
              cliente_fixo: Globe,
              saas_pdv: Store,
              projeto_prazo: Calendar,
              aluguel: Home,
              quinzenal: DollarSign,
            }[alert.category];

            const CategoryIconComp = categoryIcon;

            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 space-y-3 flex flex-col justify-between transition-all ${borderClass}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg border bg-white text-slate-700 shadow-3xs">
                        <CategoryIconComp className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate block">
                        {alert.entityName}
                      </span>
                    </div>

                    {/* Urgency Badge */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeClass}`}>
                      {alert.dueDateStr}
                    </span>
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold ${isDone ? 'text-slate-700' : isOverdue ? 'text-rose-900' : 'text-slate-900'}`}>
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>

                  {alert.amount !== undefined && alert.amount > 0 && (
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 font-mono">
                      <span className="text-slate-500">Valor da Operação:</span>
                      <span className="font-bold text-slate-900">{formatBRL(alert.amount)}</span>
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* WhatsApp Quick Billing Text */}
                  {alert.whatsappMessage && !isDone ? (
                    <button
                      onClick={() => handleCopyWhatsApp(alert.id, alert.whatsappMessage!)}
                      className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Copiar texto de cobrança amigável para colar no WhatsApp"
                    >
                      {copiedId === alert.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>Copiar Msg WhatsApp</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span />
                  )}

                  {/* Direct Action Button */}
                  {alert.actionLabel && alert.onAction && !isDone && (
                    <button
                      onClick={alert.onAction}
                      className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>{alert.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
