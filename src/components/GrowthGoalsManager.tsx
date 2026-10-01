/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, BusinessProfile, WebProject } from '../types';
import { calculateWebAgencyMetrics, formatBRL, formatPercent } from '../utils/formatters';
import {
  Target,
  TrendingUp,
  DollarSign,
  Sliders,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Calculator,
  ArrowUpRight,
} from 'lucide-react';

interface GrowthGoalsManagerProps {
  transactions: Transaction[];
  projects: WebProject[];
  profile: BusinessProfile;
  onUpdateProfile: (updated: BusinessProfile) => void;
  onOpenNewProject?: () => void;
}

export const GrowthGoalsManager: React.FC<GrowthGoalsManagerProps> = ({
  transactions,
  projects,
  profile,
  onUpdateProfile,
  onOpenNewProject,
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const metrics = calculateWebAgencyMetrics(transactions, projects, profile, currentMonthStr);

  const [isEditing, setIsEditing] = useState(false);

  // Form state for defining goals
  const [formProfitGoal, setFormProfitGoal] = useState<string>(
    String(profile.targetCompanyProfit || 8000)
  );
  const [formRevenueGoal, setFormRevenueGoal] = useState<string>(
    String(
      profile.targetMonthlyRevenue ||
        (profile.targetCompanyProfit || 8000) +
          (profile.targetProlabore || 5000) +
          (profile.monthlyFixedCostTarget || 1850)
    )
  );
  const [formProlaboreGoal, setFormProlaboreGoal] = useState<string>(
    String(profile.targetProlabore || 5000)
  );
  const [formFixedCosts, setFormFixedCosts] = useState<string>(
    String(profile.monthlyFixedCostTarget || 1850)
  );
  const [formTicket, setFormTicket] = useState<string>(
    String(profile.averageTicketSale || 2800)
  );

  const [saveFeedback, setSaveFeedback] = useState(false);

  // Auto-calculate suggested revenue based on desired profit + prolabore + costs
  const handleAutoCalculateRevenue = () => {
    const profit = parseFloat(formProfitGoal) || 0;
    const prolabore = parseFloat(formProlaboreGoal) || 0;
    const costs = parseFloat(formFixedCosts) || 0;
    setFormRevenueGoal(String(profit + prolabore + costs));
  };

  const handleApplyPreset = (profit: number, prolabore: number, costs: number, ticket: number) => {
    setFormProfitGoal(String(profit));
    setFormProlaboreGoal(String(prolabore));
    setFormFixedCosts(String(costs));
    setFormRevenueGoal(String(profit + prolabore + costs));
    setFormTicket(String(ticket));
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BusinessProfile = {
      ...profile,
      targetCompanyProfit: Math.max(0, parseFloat(formProfitGoal) || 8000),
      targetMonthlyRevenue: Math.max(0, parseFloat(formRevenueGoal) || 14850),
      targetProlabore: Math.max(0, parseFloat(formProlaboreGoal) || 5000),
      monthlyFixedCostTarget: Math.max(0, parseFloat(formFixedCosts) || 1850),
      averageTicketSale: Math.max(500, parseFloat(formTicket) || 2800),
    };
    onUpdateProfile(updated);
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
      setIsEditing(false);
    }, 600);
  };

  // Calculations for display
  const targetRevenue = metrics.totalTargetMonthRevenue;
  const realizedRevenue = metrics.monthIncomeCompleted;
  const pendingRevenue = metrics.totalProjectedReceivables + metrics.monthPendingIncome;
  const projectedRevenue = metrics.forecastMonthRevenue;

  const targetProfit = profile.targetCompanyProfit || 8000;
  const realizedProfit = metrics.monthNetProfitRealized;
  const projectedProfit = metrics.forecastCompanyProfit;

  // Percentage calculations
  const revenueRealizedPct = targetRevenue > 0 ? (realizedRevenue / targetRevenue) * 100 : 0;
  const revenuePipelinePct = targetRevenue > 0 ? (pendingRevenue / targetRevenue) * 100 : 0;
  const revenueTotalProjectedPct = targetRevenue > 0 ? (projectedRevenue / targetRevenue) * 100 : 0;

  const profitRealizedPct = targetProfit > 0 ? (Math.max(0, realizedProfit) / targetProfit) * 100 : 0;
  const profitProjectedPct = targetProfit > 0 ? (Math.max(0, projectedProfit) / targetProfit) * 100 : 0;

  // Differences
  const revenueMissingRealized = Math.max(0, targetRevenue - realizedRevenue);
  const revenueMissingProjected = Math.max(0, targetRevenue - projectedRevenue);

  const profitMissingRealized = Math.max(0, targetProfit - realizedProfit);
  const profitMissingProjected = Math.max(0, targetProfit - projectedProfit);

  // Operational pacing
  const averageTicket = profile.averageTicketSale || 2800;
  const sitesNeededToTargetRevenue = Math.max(0, Math.ceil(revenueMissingProjected / averageTicket));
  const daysInMonth = metrics.daysInMonth;
  const currentDay = metrics.currentDay;
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  const dailyNeededRemaining = revenueMissingRealized / daysRemaining;

  // Linear expected pace (where we should be on day X)
  const linearExpectedPct = Math.round((currentDay / daysInMonth) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Metas de Crescimento Mensal
              </h2>
              <p className="text-xs text-slate-500">
                Acompanhe o faturamento bruto e o lucro líquido da empresa em relação aos objetivos de crescimento.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
            Dia {currentDay} de {daysInMonth} ({linearExpectedPct}% do mês)
          </span>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isEditing
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>{isEditing ? 'Fechar Edição' : 'Definir / Ajustar Metas'}</span>
          </button>
        </div>
      </div>

      {/* EDITING PANEL (DEFINIR METAS) */}
      {isEditing && (
        <form
          onSubmit={handleSaveGoals}
          className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Definição e Planejamento de Metas Mensais
              </span>
            </div>
            <span className="text-[11px] text-blue-700 font-medium">
              Altere os valores para recalcular projeções em tempo real
            </span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Cenários Pré-configurados:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleApplyPreset(4000, 3500, 1500, 2000)}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors cursor-pointer text-[11px]"
              >
                1. Validação: Fat R$ 9k | Lucro R$ 4k
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(8000, 5000, 1850, 2800)}
                className="px-2.5 py-1 rounded-md bg-blue-100/70 border border-blue-300 font-semibold text-blue-900 hover:bg-blue-100 transition-colors cursor-pointer text-[11px]"
              >
                2. Meta Atual: Fat R$ 14,8k | Lucro R$ 8k | Pró-labore R$ 5k
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(12000, 6500, 2500, 3500)}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors cursor-pointer text-[11px]"
              >
                3. Expansão: Fat R$ 21k | Lucro R$ 12k
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(20000, 8000, 4000, 4500)}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors cursor-pointer text-[11px]"
              >
                4. Escala: Fat R$ 32k | Lucro R$ 20k
              </button>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2">
            {/* Meta de Lucro Líquido */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Meta de Lucro Líquido PJ (R$)</span>
                <span className="text-[10px] text-blue-600 font-normal">Sua meta de sobra</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">R$</span>
                <input
                  type="number"
                  step="100"
                  value={formProfitGoal}
                  onChange={(e) => setFormProfitGoal(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Meta de Faturamento Mensal */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">
                  Meta de Faturamento Bruto (R$)
                </label>
                <button
                  type="button"
                  onClick={handleAutoCalculateRevenue}
                  title="Calcular Faturamento = Lucro + Pró-labore + Custos Fixos"
                  className="text-[10px] text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Calculator className="w-3 h-3" />
                  <span>Auto-somar</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">R$</span>
                <input
                  type="number"
                  step="100"
                  value={formRevenueGoal}
                  onChange={(e) => setFormRevenueGoal(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold text-blue-700 bg-white border border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Meta de Pró-labore */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Meta Pró-labore Pessoal (R$)</span>
                <span className="text-[10px] text-slate-500 font-normal">Sustento do dono</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">R$</span>
                <input
                  type="number"
                  step="100"
                  value={formProlaboreGoal}
                  onChange={(e) => setFormProlaboreGoal(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Custos Operacionais Fixos */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Custos Fixos Operacionais (R$)</span>
                <span className="text-[10px] text-slate-500 font-normal">Hospedagem, Figma, DAS</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">R$</span>
                <input
                  type="number"
                  step="50"
                  value={formFixedCosts}
                  onChange={(e) => setFormFixedCosts(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Ticket Médio por Projeto */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Ticket Médio por Site (R$)</span>
                <span className="text-[10px] text-slate-500 font-normal">Para desdobramento</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">R$</span>
                <input
                  type="number"
                  step="100"
                  value={formTicket}
                  onChange={(e) => setFormTicket(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                {saveFeedback ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Metas Salvas!</span>
                  </>
                ) : (
                  <span>Salvar Metas Definidas</span>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TWO PRIMARY VISUAL PROGRESS CARDS: FATURAMENTO & LUCRO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ========================================================
            CARD 1: PROGRESSO DA META DE FATURAMENTO MENSAL
            ======================================================== */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Meta de Faturamento Mensal
              </span>
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                revenueTotalProjectedPct >= 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : revenueTotalProjectedPct >= 75
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {revenueTotalProjectedPct >= 100
                ? 'Meta Superada ✓'
                : revenueTotalProjectedPct >= linearExpectedPct
                ? 'No Rumo da Meta'
                : 'Atenção ao Ritmo'}
            </span>
          </div>

          {/* Primary Numbers */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Faturado Realizado (Recebido)</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {formatBRL(realizedRevenue)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Meta Estabelecida</span>
              <span className="text-xl font-bold font-mono text-blue-600 tabular-nums">
                {formatBRL(targetRevenue)}
              </span>
            </div>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="space-y-1.5">
            <div className="relative w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
              {/* Realized segment */}
              <div
                className="bg-blue-600 h-full transition-all"
                style={{ width: `${Math.min(100, revenueRealizedPct)}%` }}
                title={`Realizado: ${formatBRL(realizedRevenue)} (${revenueRealizedPct.toFixed(1)}%)`}
              />
              {/* Projected in pipeline segment */}
              <div
                className="bg-sky-400 h-full transition-all"
                style={{ width: `${Math.min(100 - Math.min(100, revenueRealizedPct), revenuePipelinePct)}%` }}
                title={`Em Pipeline: ${formatBRL(pendingRevenue)} (${revenuePipelinePct.toFixed(1)}%)`}
              />
            </div>

            {/* Progress Bar Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  <span>Realizado: <strong>{formatPercent(revenueRealizedPct)}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                  <span>Pipeline: <strong>+{formatPercent(revenuePipelinePct)}</strong></span>
                </span>
              </div>
              <span className="font-semibold text-slate-800">
                Total Previsto: {formatPercent(revenueTotalProjectedPct)}
              </span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">A Receber de Sites Ativos</span>
              <span className="font-mono font-semibold text-sky-700">
                {formatBRL(pendingRevenue)}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Previsão Fechamento Mês</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatBRL(projectedRevenue)}
              </span>
            </div>
          </div>

          {/* Difference notice */}
          <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span>
              {revenueMissingProjected > 0 ? (
                <>Faltam <strong>{formatBRL(revenueMissingProjected)}</strong> em novas vendas para atingir a meta mensal.</>
              ) : (
                <strong className="text-emerald-700">Meta mensal de faturamento 100% coberta pelos projetos em andamento!</strong>
              )}
            </span>
            {revenueMissingProjected > 0 && onOpenNewProject && (
              <button
                onClick={onOpenNewProject}
                className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer ml-2 whitespace-nowrap"
              >
                <span>+ Novo Projeto</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            CARD 2: PROGRESSO DA META DE LUCRO LÍQUIDO MENSAL (PJ)
            ======================================================== */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Meta de Lucro Líquido PJ
              </span>
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                profitProjectedPct >= 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : profitProjectedPct >= 75
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {profitProjectedPct >= 100
                ? 'Lucro Alvo Garantido ✓'
                : `Projetado: ${formatBRL(projectedProfit)}`}
            </span>
          </div>

          {/* Primary Numbers */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Lucro Realizado no Caixa</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {formatBRL(Math.max(0, realizedProfit))}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Meta Lucro Líquido</span>
              <span className="text-xl font-bold font-mono text-blue-600 tabular-nums">
                {formatBRL(targetProfit)}
              </span>
            </div>
          </div>

          {/* Profit Progress Bar */}
          <div className="space-y-1.5">
            <div className="relative w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
              {/* Realized profit */}
              <div
                className="bg-blue-700 h-full transition-all"
                style={{ width: `${Math.min(100, profitRealizedPct)}%` }}
                title={`Lucro Realizado: ${formatBRL(realizedProfit)} (${profitRealizedPct.toFixed(1)}%)`}
              />
              {/* Additional projected profit */}
              <div
                className="bg-sky-400 h-full transition-all"
                style={{
                  width: `${Math.min(
                    100 - Math.min(100, profitRealizedPct),
                    Math.max(0, profitProjectedPct - profitRealizedPct)
                  )}%`,
                }}
                title={`Lucro Projetado Total: ${formatBRL(projectedProfit)} (${profitProjectedPct.toFixed(1)}%)`}
              />
            </div>

            {/* Profit Bar Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-700 inline-block" />
                  <span>Realizado: <strong>{formatPercent(profitRealizedPct)}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                  <span>Projetado: <strong>{formatPercent(profitProjectedPct)}</strong></span>
                </span>
              </div>
              <span className="font-semibold text-slate-800">
                Margem Líquida Est.: {targetRevenue > 0 ? formatPercent((projectedProfit / targetRevenue) * 100) : '0%'}
              </span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Dedução Pró-labore</span>
              <span className="font-mono font-semibold text-slate-700">
                - {formatBRL(profile.targetProlabore)}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Custos Fixos Previstos</span>
              <span className="font-mono font-semibold text-slate-700">
                - {formatBRL(profile.monthlyFixedCostTarget)}
              </span>
            </div>
          </div>

          {/* Profit status message */}
          <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span>
              {profitMissingProjected > 0 ? (
                <>Faltam <strong>{formatBRL(profitMissingProjected)}</strong> de lucro para atingir o objetivo de R$ 8.000 livres.</>
              ) : (
                <strong className="text-emerald-700">Meta de lucro líquido 100% atingida na projeção do mês!</strong>
              )}
            </span>
            <span className="font-mono text-slate-400 text-[10px]">
              PJ Seguro
            </span>
          </div>
        </div>
      </div>

      {/* OPERATIONAL BREAKDOWN: ACTIONS NEEDED TO HIT GOALS */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Desdobramento Operacional: O Que Falta Para Bater as Metas
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sites a fechar */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block">Vendas Necessárias de Sites</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-slate-900">
                {sitesNeededToTargetRevenue === 0 ? '0 sites' : `~${sitesNeededToTargetRevenue} novos sites`}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Considerando ticket médio de {formatBRL(averageTicket)}
            </span>
          </div>

          {/* Ritmo Diário Restante */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block">Ritmo Diário até o Fim do Mês</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-blue-600 tabular-nums">
                {formatBRL(dailyNeededRemaining)}
              </span>
              <span className="text-[11px] text-slate-500">/ dia</span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Nos próximos {daysRemaining} dias restantes
            </span>
          </div>

          {/* Caixa Livre & Transição Quinzenal */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block">Reserva de Caixa Livre</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {formatBRL(metrics.currentFreeCash)}
              </span>
              <span className="text-[11px] text-slate-500">
                / {formatBRL(profile.freeCashThreshold)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              {metrics.isFreeCashAchieved
                ? '✓ Retiradas quinzenais (dia 5 e 20) liberadas'
                : `Faltam ${formatBRL(Math.max(0, profile.freeCashThreshold - metrics.currentFreeCash))} para estabilizar`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
