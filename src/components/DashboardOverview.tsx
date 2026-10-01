/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Transaction,
  BusinessProfile,
  WebProject,
  ProjectStatus,
  PhoneRepairItem,
  SaaSSubscriber,
  FixedSiteClient,
} from '../types';
import { calculateWebAgencyMetrics, formatBRL, formatDateBR, generateCashFlowChartData } from '../utils/formatters';
import { CashFlowProjectionChart, CashFlowChartItem } from './CashFlowProjectionChart';
import { GrowthGoalsManager } from './GrowthGoalsManager';
import { GrowthTipsAdvisor } from './GrowthTipsAdvisor';
import { SmartAlertsCenter } from './SmartAlertsCenter';
import { FreeCashAlertBanner } from './FreeCashAlertBanner';
import { EnvelopesManager } from './EnvelopesManager';
import {
  Wallet,
  Home,
  TrendingUp,
  Plus,
  ArrowRight,
  Trash2,
  CalendarCheck,
  CheckCircle2,
  Smartphone,
  Store,
  Globe,
  Layers,
} from 'lucide-react';

interface DashboardOverviewProps {
  transactions: Transaction[];
  projects: WebProject[];
  profile: BusinessProfile;
  onUpdateProfile: (profile: BusinessProfile) => void;
  onOpenNewProject: () => void;
  onOpenReceivePayment: (project: WebProject) => void;
  onUpdateProjectStatus: (id: string, newStatus: ProjectStatus) => void;
  onDeleteProject: (id: string) => void;
  onExecuteProlaboreTransfer: (amount: number, note: string) => void;
  phones?: PhoneRepairItem[];
  saasSubscribers?: SaaSSubscriber[];
  fixedClients?: FixedSiteClient[];
  onNavigateToStreams?: () => void;
  onCollectFixedClient?: (client: FixedSiteClient) => void;
  onCollectSaaS?: (sub: SaaSSubscriber) => void;
  onPayTaxes?: (amount: number) => void;
  onPayRent?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  projects,
  profile,
  onUpdateProfile,
  onOpenNewProject,
  onOpenReceivePayment,
  onUpdateProjectStatus,
  onDeleteProject,
  onExecuteProlaboreTransfer,
  phones = [],
  saasSubscribers = [],
  fixedClients = [],
  onNavigateToStreams,
  onCollectFixedClient,
  onCollectSaaS,
  onPayTaxes,
  onPayRent,
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const metrics = calculateWebAgencyMetrics(transactions, projects, profile, currentMonthStr);

  // Multi-stream stats for overview card
  const totalPhonesProfit = phones
    .filter((p) => p.status === 'vendido')
    .reduce((acc, p) => acc + ((p.soldPrice || p.targetSalePrice) - (p.purchasePrice + p.partsCost)), 0);
  const phonesInStockCount = phones.filter((p) => p.status !== 'vendido').length;

  const totalSaaSMRR = saasSubscribers
    .filter((s) => s.status === 'ativo')
    .reduce((acc, s) => acc + s.monthlyFee, 0);

  const totalFixedMRR = fixedClients
    .filter((c) => c.status === 'ativo')
    .reduce((acc, c) => acc + c.monthlyFee, 0);

  const totalMRR = totalSaaSMRR + totalFixedMRR;

  // Quick pro-labore split helper
  const [quickInputAmount, setQuickInputAmount] = useState<string>('2000');
  const parsedQuick = parseFloat(quickInputAmount.replace(',', '.')) || 0;

  // Split calculation based on rule:
  const suggestedPF = metrics.isFreeCashAchieved
    ? Math.min(parsedQuick, Math.max(0, profile.targetProlabore - metrics.monthProlaboreTransferred))
    : parsedQuick * 0.5;
  const suggestedPJ = Math.max(0, parsedQuick - suggestedPF);

  // Filter for projects table
  const [projectFilter, setProjectFilter] = useState<'all' | ProjectStatus>('all');
  const filteredProjects = projects.filter((p) => {
    if (projectFilter !== 'all' && p.status !== projectFilter) return false;
    return true;
  });

  const handleQuickTransfer = () => {
    if (suggestedPF <= 0) return;
    onExecuteProlaboreTransfer(
      suggestedPF,
      `Repasse de pró-labore da entrada de site (${formatBRL(parsedQuick)})`
    );
  };

  const handleToggleQuinzenalMode = (active: boolean) => {
    onUpdateProfile({
      ...profile,
      quinzenalModeActive: active,
    });
  };

  const handleExecuteQuinzenalTransfer = () => {
    onExecuteProlaboreTransfer(
      2500,
      'Repasse Quinzenal de Pró-labore (Regra Caixa Livre ≥ R$ 2.500)'
    );
  };

  // Build Recharts data series for projected cash flow vs monthly targets
  const totalTarget = metrics.totalTargetMonthRevenue;
  const totalProjected = metrics.forecastMonthRevenue;
  const totalRealized = metrics.monthIncomeCompleted;
  const chartData: CashFlowChartItem[] = generateCashFlowChartData(metrics);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* SISTEMA DE ALERTA VISUAL: CAIXA LIVRE >= R$ 2.500 E ATIVAÇÃO DO FLUXO QUINZENAL */}
      <section>
        <FreeCashAlertBanner
          currentFreeCash={metrics.currentFreeCash}
          freeCashThreshold={profile.freeCashThreshold || 2500}
          isFreeCashAchieved={metrics.isFreeCashAchieved}
          quinzenalModeActive={profile.quinzenalModeActive || false}
          onToggleQuinzenalMode={handleToggleQuinzenalMode}
          onExecuteQuinzenalTransfer={handleExecuteQuinzenalTransfer}
        />
      </section>

      {/* 4 CLEAN WHITE & BLUE TOP METRIC CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Caixa Livre */}
        <div
          className={`rounded-xl border bg-white p-4 shadow-2xs space-y-2 transition-all ${
            metrics.isFreeCashAchieved ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              {metrics.isFreeCashAchieved && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              )}
              <span>Caixa Livre da Empresa</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Meta: {formatBRL(profile.freeCashThreshold)}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums flex items-baseline justify-between">
            <span>{formatBRL(metrics.currentFreeCash)}</span>
            {metrics.isFreeCashAchieved && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                ≥ R$ 2.5k ✓
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  metrics.isFreeCashAchieved ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
                style={{ width: `${metrics.freeCashProgressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 block truncate">
              {metrics.isFreeCashAchieved
                ? '✓ Modo Quinzenal Pronto (R$ 2.500 dia 5 e 20)'
                : `Faltam ${formatBRL(Math.max(0, profile.freeCashThreshold - metrics.currentFreeCash))} para virar quinzenal`}
            </span>
          </div>
        </div>

        {/* Card 2: Pró-Labore */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pró-Labore Tirado (Mês)</span>
            <Wallet className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-blue-600 tabular-nums">
            {formatBRL(metrics.monthProlaboreTransferred)}
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${metrics.prolaboreProgressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 block truncate">
              {metrics.prolaboreProgressPct.toFixed(0)}% da meta de {formatBRL(profile.targetProlabore)}
            </span>
          </div>
        </div>

        {/* Card 3: Aluguel */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Aluguel do Mês</span>
            <Home className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatBRL(profile.monthlyRentAmount)}
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                metrics.isRentPaid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {metrics.isRentPaid ? 'Aluguel Quitado ✓' : 'Aguardando Pagamento'}
            </span>
          </div>
        </div>

        {/* Card 4: Lucro PJ Previsto */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Previsão Lucro Empresa</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatBRL(metrics.forecastCompanyProfit)}
          </div>
          <span className="text-[11px] text-slate-500 block truncate pt-1">
            Meta: {formatBRL(profile.targetCompanyProfit)} de lucro livre
          </span>
        </div>
      </section>

      {/* CENTRAL PANORÂMICA: MÚLTIPLAS FONTES DE RENDA (CELULARES, SAAS PDV, SITES FIXOS) */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Múltiplas Fontes de Renda Integradas
              </h3>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                4 Motores Ativos
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Além de novos sites, você controla a bancada de conserto de celulares, mensalidades de SaaS PDV e contratos fixos.
            </p>
          </div>

          {onNavigateToStreams && (
            <button
              onClick={onNavigateToStreams}
              className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Gerenciar Fontes Detalhadas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3 Mini Cards for the new streams */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Celulares */}
          <div
            onClick={onNavigateToStreams}
            className="p-3 bg-slate-50 hover:bg-blue-50/40 rounded-lg border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Conserto & Revenda</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                {phonesInStockCount} na bancada
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-[11px] text-slate-500">Lucro embolsado:</span>
              <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                +{formatBRL(totalPhonesProfit)}
              </span>
            </div>
          </div>

          {/* Card 2: SaaS PDV */}
          <div
            onClick={onNavigateToStreams}
            className="p-3 bg-slate-50 hover:bg-amber-50/40 rounded-lg border border-slate-200 hover:border-amber-300 transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span>SaaS de PDV</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                {saasSubscribers.filter((s) => s.status === 'ativo').length} lojas
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-[11px] text-slate-500">MRR Mensal:</span>
              <span className="text-base font-bold font-mono text-amber-700 tabular-nums">
                {formatBRL(totalSaaSMRR)}/mês
              </span>
            </div>
          </div>

          {/* Card 3: Clientes Fixos Sites */}
          <div
            onClick={onNavigateToStreams}
            className="p-3 bg-slate-50 hover:bg-indigo-50/40 rounded-lg border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sites Recorrentes</span>
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                {fixedClients.filter((c) => c.status === 'ativo').length} contratos
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-[11px] text-slate-500">MRR Suporte:</span>
              <span className="text-base font-bold font-mono text-indigo-700 tabular-nums">
                {formatBRL(totalFixedMRR)}/mês
              </span>
            </div>
          </div>
        </div>

        {/* Footer info: Total MRR vs Aluguel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>
              Receita Recorrente Previsível (MRR): <strong className="text-slate-900 font-mono">{formatBRL(totalMRR)}/mês</strong>
            </span>
          </span>
          <span className="text-slate-500 text-[11px]">
            {totalMRR >= profile.monthlyRentAmount
              ? `✓ Seu aluguel de ${formatBRL(profile.monthlyRentAmount)} já está 100% garantido só pelo SaaS e Sites fixos!`
              : `Cobre ${((totalMRR / (profile.monthlyRentAmount || 1400)) * 100).toFixed(0)}% do seu aluguel de forma fixa todo mês.`}
          </span>
        </div>
      </section>

      {/* REPASSE RÁPIDO DE PRÓ-LABORE (CLEAN WHITE & BLUE BOX) */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Fluxo de Repasse de Pró-labore
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  metrics.isFreeCashAchieved
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {metrics.isFreeCashAchieved
                  ? 'Modo Quinzenal Disponível (Caixa ≥ R$ 2.500) ✓'
                  : 'Fase Inicial: Repasse por Entrada'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {metrics.isFreeCashAchieved
                ? 'Como o caixa livre superou R$ 2.500, você pode fazer as retiradas fixas quinzenais de R$ 2.500 ou repassar frações de novas vendas:'
                : 'Caiu uma entrada de site? Digite o valor para fatiar entre o seu sustento e o caixa da empresa:'}
            </p>
          </div>

          {/* Quick Quinzenal Action if Achieved */}
          {metrics.isFreeCashAchieved && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExecuteQuinzenalTransfer}
                className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Efetuar Repasse Quinzenal (R$ 2.500)</span>
              </button>
            </div>
          )}
        </div>

        {/* Input split bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Fatiar entrada avulsa de projeto:
          </span>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Input */}
            <div className="relative w-36">
              <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-400">R$</span>
              <input
                type="number"
                step="100"
                value={quickInputAmount}
                onChange={(e) => setQuickInputAmount(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white tabular-nums"
              />
            </div>

            {/* Quick preview */}
            <div className="text-xs text-slate-700 flex items-center gap-2 whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span>PF: <strong className="text-blue-700 font-mono">{formatBRL(suggestedPF)}</strong></span>
              <span className="text-slate-300">|</span>
              <span>PJ: <strong className="text-slate-900 font-mono">{formatBRL(suggestedPJ)}</strong></span>
            </div>

            {/* Transfer button */}
            <button
              onClick={handleQuickTransfer}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Repassar para PF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* COMPONENTE DE METAS DE CRESCIMENTO (DEFINIÇÃO E PROGRESSO DE FATURAMENTO E LUCRO) */}
      <section>
        <GrowthGoalsManager
          transactions={transactions}
          projects={projects}
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onOpenNewProject={onOpenNewProject}
        />
      </section>

      {/* CENTRAL DE ALERTAS INTELIGENTES & ROTINA PJ */}
      <section>
        <SmartAlertsCenter
          transactions={transactions}
          projects={projects}
          profile={profile}
          fixedClients={fixedClients}
          saasSubscribers={saasSubscribers}
          metrics={metrics}
          onCollectFixedClient={onCollectFixedClient}
          onCollectSaaS={onCollectSaaS}
          onPayTaxes={onPayTaxes}
          onPayRent={onPayRent}
          onNavigateToStreams={onNavigateToStreams}
        />
      </section>

      {/* DICAS DE CRESCIMENTO & DIAGNÓSTICO FINANCEIRO INTELIGENTE */}
      <section>
        <GrowthTipsAdvisor
          transactions={transactions}
          projects={projects}
          profile={profile}
          phones={phones}
          saasSubscribers={saasSubscribers}
          fixedClients={fixedClients}
          metrics={metrics}
          onNavigateToStreams={onNavigateToStreams}
          onOpenNewProject={onOpenNewProject}
        />
      </section>

      {/* SISTEMA DE ENVELOPES E RESERVAS: IMPOSTOS, RESERVA DE EMERGÊNCIA E REINVESTIMENTO */}
      <section>
        <EnvelopesManager
          transactions={transactions}
          projects={projects}
          profile={profile}
          onUpdateProfile={onUpdateProfile}
        />
      </section>

      {/* RECHARTS DATA VISUALIZATION: PROJECTED CASH FLOW VS TARGETS */}
      <section>
        <CashFlowProjectionChart
          data={chartData}
          totalRealized={totalRealized}
          totalProjected={totalProjected}
          totalTarget={totalTarget}
          targetProfit={profile.targetCompanyProfit}
          targetProlabore={profile.targetProlabore}
        />
      </section>

      {/* ESTEIRA DE SITES EM PRODUÇÃO (CLEAN WHITE & BLUE TABLE) */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Table Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900">Vendas & Produção de Sites</h2>
            <span className="text-xs text-slate-500">
              ({projects.length} sites cadastrados)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px]">
              <button
                onClick={() => setProjectFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  projectFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setProjectFilter('em_desenvolvimento')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  projectFilter === 'em_desenvolvimento' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Em Dev
              </button>
              <button
                onClick={() => setProjectFilter('entregue_aguardando')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  projectFilter === 'entregue_aguardando' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aguardando Pagto
              </button>
              <button
                onClick={() => setProjectFilter('pago')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  projectFilter === 'pago' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pagos
              </button>
            </div>

            <button
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Novo Site</span>
            </button>
          </div>
        </div>

        {/* Clean Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium text-[11px] bg-slate-50">
                <th className="py-2.5 px-3">Cliente / Site</th>
                <th className="py-2.5 px-3">Prazo</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
                <th className="py-2.5 px-3 text-right">Já Pago</th>
                <th className="py-2.5 px-3 text-right">Saldo a Receber</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum site cadastrado nesta lista.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const pending = Math.max(0, p.totalValue - p.receivedAmount);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs">
                        <span className="block truncate">{p.projectName}</span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {p.clientName} · {p.projectType}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {formatDateBR(p.deliveryDate)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatBRL(p.totalValue)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 tabular-nums whitespace-nowrap font-medium">
                        {formatBRL(p.receivedAmount)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap font-bold text-blue-700">
                        {formatBRL(pending)}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <select
                          value={p.status}
                          onChange={(e) => onUpdateProjectStatus(p.id, e.target.value as ProjectStatus)}
                          className={`text-[11px] font-medium rounded px-2 py-0.5 border transition-colors cursor-pointer ${
                            p.status === 'em_desenvolvimento'
                              ? 'bg-sky-50 border-sky-200 text-sky-800'
                              : p.status === 'entregue_aguardando'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          <option value="em_desenvolvimento">Em Desenvolvimento</option>
                          <option value="entregue_aguardando">Entregue · Aguardando</option>
                          <option value="pago">Quitado / Pago</option>
                        </select>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {pending > 0 && (
                            <button
                              onClick={() => onOpenReceivePayment(p)}
                              className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                            >
                              + Receber
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteProject(p.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
