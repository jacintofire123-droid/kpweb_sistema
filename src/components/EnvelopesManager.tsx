/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, BusinessProfile } from '../types';
import { calculateWebAgencyMetrics, formatBRL, formatPercent } from '../utils/formatters';
import {
  ShieldCheck,
  Receipt,
  Rocket,
  Sliders,
  Sparkles,
  Calculator,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface EnvelopesManagerProps {
  transactions: Transaction[];
  projects: any[];
  profile: BusinessProfile;
  onUpdateProfile: (updated: BusinessProfile) => void;
  onOpenNewExpense?: () => void;
}

export const EnvelopesManager: React.FC<EnvelopesManagerProps> = ({
  transactions,
  projects,
  profile,
  onUpdateProfile,
  onOpenNewExpense,
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const metrics = calculateWebAgencyMetrics(transactions, projects, profile, currentMonthStr);

  const [isEditing, setIsEditing] = useState(false);
  const [taxesPctInput, setTaxesPctInput] = useState(String(profile.envelopeTaxesPct ?? 6));
  const [emergencyPctInput, setEmergencyPctInput] = useState(String(profile.envelopeEmergencyPct ?? 10));
  const [reinvestmentPctInput, setReinvestmentPctInput] = useState(String(profile.envelopeReinvestmentPct ?? 10));
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Interactive split simulation
  const [simulatedRevenue, setSimulatedRevenue] = useState<string>('3000');
  const simVal = parseFloat(simulatedRevenue) || 0;

  const currentTaxesPct = profile.envelopeTaxesPct ?? 6;
  const currentEmergencyPct = profile.envelopeEmergencyPct ?? 10;
  const currentReinvestmentPct = profile.envelopeReinvestmentPct ?? 10;
  const currentOperationAndProfitPct = Math.max(
    0,
    100 - currentTaxesPct - currentEmergencyPct - currentReinvestmentPct
  );

  const handleSaveEnvelopes = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BusinessProfile = {
      ...profile,
      envelopeTaxesPct: Math.max(0, Math.min(30, parseFloat(taxesPctInput) || 6)),
      envelopeEmergencyPct: Math.max(0, Math.min(40, parseFloat(emergencyPctInput) || 10)),
      envelopeReinvestmentPct: Math.max(0, Math.min(40, parseFloat(reinvestmentPctInput) || 10)),
    };
    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 600);
  };

  // Sim calculation
  const simTaxes = simVal * (currentTaxesPct / 100);
  const simEmergency = simVal * (currentEmergencyPct / 100);
  const simReinvestment = simVal * (currentReinvestmentPct / 100);
  const simOperationAndDraw = simVal * (currentOperationAndProfitPct / 100);

  // Total percentages sum check
  const totalReservedPct = currentTaxesPct + currentEmergencyPct + currentReinvestmentPct;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Sistema de Envelopes & Reservas da Empresa
              </h2>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                Separação Automática
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Separe automaticamente fatias da receita para impostos, colchão de segurança e reinvestimento.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer self-start sm:self-auto ${
            isEditing
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span>{isEditing ? 'Fechar Configuração' : 'Ajustar % dos Envelopes'}</span>
        </button>
      </div>

      {/* EDITING FORM FOR ENVELOPES */}
      {isEditing && (
        <form
          onSubmit={handleSaveEnvelopes}
          className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-blue-100">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Configurar Porcentagem de Separação da Receita</span>
            </span>
            <span className="text-[11px] text-blue-700">
              Total reservado: <strong>{totalReservedPct}%</strong> · Sobra para Pró-labore/Operação: <strong>{currentOperationAndProfitPct}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Impostos */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Impostos & DAS (%)</span>
                <span className="text-[10px] text-slate-500 font-normal">Sugerido: 6%</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="30"
                  value={taxesPctInput}
                  onChange={(e) => setTaxesPctInput(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">%</span>
              </div>
            </div>

            {/* Reserva de Emergência */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Reserva de Emergência (%)</span>
                <span className="text-[10px] text-slate-500 font-normal">Sugerido: 10%</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="40"
                  value={emergencyPctInput}
                  onChange={(e) => setEmergencyPctInput(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">%</span>
              </div>
            </div>

            {/* Reinvestimento */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Reinvestimento & Escala (%)</span>
                <span className="text-[10px] text-slate-500 font-normal">Sugerido: 10%</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="40"
                  value={reinvestmentPctInput}
                  onChange={(e) => setReinvestmentPctInput(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setTaxesPctInput('6');
                setEmergencyPctInput('10');
                setReinvestmentPctInput('10');
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Restaurar Padrão (6% / 10% / 10%)
            </button>
            <button
              type="submit"
              className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Configuração Salva!</span>
                </>
              ) : (
                <span>Salvar Porcentagens</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* HORIZONTAL ALLOCATION BAR (VISÃO GERAL DO FATIAMENTO DA RECEITA) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-900">
            Fatiamento de Cada R$ 1,00 Faturado na Agência:
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Receita Realizada no Mês: <strong>{formatBRL(metrics.monthIncomeCompleted)}</strong>
          </span>
        </div>

        <div className="relative w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex border border-slate-200">
          {/* Impostos Segment */}
          <div
            className="bg-amber-500 h-full transition-all"
            style={{ width: `${currentTaxesPct}%` }}
            title={`Impostos: ${currentTaxesPct}% (${formatBRL(metrics.taxesSeparatedRealized)})`}
          />
          {/* Reserva Segment */}
          <div
            className="bg-blue-600 h-full transition-all"
            style={{ width: `${currentEmergencyPct}%` }}
            title={`Reserva de Emergência: ${currentEmergencyPct}% (${formatBRL(metrics.emergencySeparatedRealized)})`}
          />
          {/* Reinvestimento Segment */}
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${currentReinvestmentPct}%` }}
            title={`Reinvestimento: ${currentReinvestmentPct}% (${formatBRL(metrics.reinvestmentSeparatedRealized)})`}
          />
          {/* Operação & Pró-labore Segment */}
          <div
            className="bg-slate-300 h-full transition-all"
            style={{ width: `${currentOperationAndProfitPct}%` }}
            title={`Pró-labore & Operação: ${currentOperationAndProfitPct}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Impostos: <strong>{currentTaxesPct}%</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>Reserva de Emergência: <strong>{currentEmergencyPct}%</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Reinvestimento: <strong>{currentReinvestmentPct}%</strong></span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span>Operação & Pró-labore: <strong>{currentOperationAndProfitPct}%</strong></span>
          </span>
        </div>
      </div>

      {/* 3 DETAILED ENVELOPE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: IMPOSTOS & TRIBUTAÇÃO */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Impostos (DAS / NFS-e)
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100/80 text-amber-800 border border-amber-300">
              {currentTaxesPct}% da Receita
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-500 block">Separado da Receita do Mês</span>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {formatBRL(metrics.taxesSeparatedRealized)}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-amber-200/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Previsão Total no Fechamento:</span>
              <strong className="font-mono text-slate-900">{formatBRL(metrics.taxesSeparatedProjected)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Já Quitado no Mês:</span>
              <strong className="font-mono text-emerald-700">{formatBRL(metrics.taxesPaidMonth)}</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Vencimento no dia 20 de cada mês</span>
            {onOpenNewExpense && (
              <button
                onClick={onOpenNewExpense}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                + Pagar DAS
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: RESERVA DE EMERGÊNCIA */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/20 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Reserva de Emergência
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100/80 text-blue-800 border border-blue-300">
              {currentEmergencyPct}% da Receita
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-500 block">Guardado da Receita do Mês</span>
            <div className="text-xl font-bold font-mono text-blue-700 tabular-nums">
              {formatBRL(metrics.emergencySeparatedRealized)}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-blue-200/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Previsão de Aporte no Mês:</span>
              <strong className="font-mono text-slate-900">{formatBRL(metrics.emergencySeparatedProjected)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Meta Colchão (3 meses custos):</span>
              <strong className="font-mono text-slate-900">{formatBRL(metrics.emergencyReserveTarget)}</strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Proteção contra cancelamentos</span>
            <span className="font-mono text-slate-600">Colchão PJ</span>
          </div>
        </div>

        {/* CARD 3: REINVESTIMENTO & CRESCIMENTO */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Reinvestimento & Escala
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-300">
              {currentReinvestmentPct}% da Receita
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-500 block">Acumulado para Escala no Mês</span>
            <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
              {formatBRL(metrics.reinvestmentSeparatedRealized)}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Previsão Total no Fechamento:</span>
              <strong className="font-mono text-slate-900">{formatBRL(metrics.reinvestmentSeparatedProjected)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Finalidade:</span>
              <span className="text-emerald-800 font-medium">Tráfego, Plugins & IA</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Fundo para captar mais clientes</span>
            <span className="font-mono text-emerald-700">Máquina de Vendas</span>
          </div>
        </div>
      </div>

      {/* SIMULADOR DE FATIAMENTO POR ENTRADA DE PROJETO */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Simulador de Entrada: Para Onde Vai o Dinheiro de um Site?
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-600 font-medium">Valor do Projeto:</span>
            <div className="relative w-32">
              <span className="absolute left-2.5 top-1.5 text-xs font-mono text-slate-400">R$</span>
              <input
                type="number"
                step="100"
                value={simulatedRevenue}
                onChange={(e) => setSimulatedRevenue(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
          {/* Impostos */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
              1. Impostos ({currentTaxesPct}%)
            </span>
            <span className="text-base font-bold font-mono text-amber-700 tabular-nums block">
              {formatBRL(simTaxes)}
            </span>
            <span className="text-[10px] text-slate-400 block">Guardar p/ DAS</span>
          </div>

          {/* Reserva */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
              2. Reserva ({currentEmergencyPct}%)
            </span>
            <span className="text-base font-bold font-mono text-blue-700 tabular-nums block">
              {formatBRL(simEmergency)}
            </span>
            <span className="text-[10px] text-slate-400 block">Fundo de segurança</span>
          </div>

          {/* Reinvestimento */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
              3. Reinvestimento ({currentReinvestmentPct}%)
            </span>
            <span className="text-base font-bold font-mono text-emerald-700 tabular-nums block">
              {formatBRL(simReinvestment)}
            </span>
            <span className="text-[10px] text-slate-400 block">Anúncios & ferramentas</span>
          </div>

          {/* Operação & Pró-labore */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
              4. Pró-labore / Caixa ({currentOperationAndProfitPct}%)
            </span>
            <span className="text-base font-bold font-mono text-slate-900 tabular-nums block">
              {formatBRL(simOperationAndDraw)}
            </span>
            <span className="text-[10px] text-slate-400 block">Sustento & Operação</span>
          </div>
        </div>
      </div>
    </div>
  );
};
