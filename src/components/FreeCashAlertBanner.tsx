/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { formatBRL } from '../utils/formatters';
import {
  Sparkles,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface FreeCashAlertBannerProps {
  currentFreeCash: number;
  freeCashThreshold: number;
  isFreeCashAchieved: boolean;
  quinzenalModeActive: boolean;
  onToggleQuinzenalMode: (active: boolean) => void;
  onExecuteQuinzenalTransfer: () => void;
}

export const FreeCashAlertBanner: React.FC<FreeCashAlertBannerProps> = ({
  currentFreeCash,
  freeCashThreshold,
  isFreeCashAchieved,
  quinzenalModeActive,
  onToggleQuinzenalMode,
  onExecuteQuinzenalTransfer,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [transferredFeedback, setTransferredFeedback] = useState(false);

  const missingAmount = Math.max(0, freeCashThreshold - currentFreeCash);
  const progressPct = Math.min(100, (currentFreeCash / freeCashThreshold) * 100);

  const handleTransferClick = () => {
    onExecuteQuinzenalTransfer();
    setTransferredFeedback(true);
    setTimeout(() => setTransferredFeedback(false), 2500);
  };

  // =========================================================================
  // SCENARIO 1: FREE CASH ACHIEVED (>= R$ 2.500) -> CELEBRATORY & ACTIONABLE
  // =========================================================================
  if (isFreeCashAchieved) {
    if (isMinimized) {
      return (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 shadow-2xs flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="font-semibold text-emerald-950">
              Caixa Livre Estabilizado: {formatBRL(currentFreeCash)}
            </span>
            <span className="text-emerald-700 hidden sm:inline">
              · Fluxo quinzenal liberado para retiradas nos dias 05 e 20 (R$ 2.500)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleQuinzenalMode(!quinzenalModeActive)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                quinzenalModeActive
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {quinzenalModeActive ? 'Modo Quinzenal Ativo ✓' : 'Ativar Modo Quinzenal'}
            </button>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-emerald-700 hover:text-emerald-900 rounded cursor-pointer"
              title="Expandir notificação"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 via-white to-blue-50/60 p-4 sm:p-5 shadow-xs relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-600" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Zone: Notification Icon, Badge & Explanation */}
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                Alerta do Sistema · Meta de Caixa Livre Alcançada
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700">
                {formatBRL(currentFreeCash)} em Caixa
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>🎉 Parabéns! Sua empresa atingiu a marca de {formatBRL(freeCashThreshold)} no caixa livre!</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              O período de arranque foi superado com sucesso! A empresa agora possui fôlego financeiro suficiente para desligar os repasses manuais picados por cada entrada. Você já pode ativar o <strong>fluxo de repasse quinzenal fixo de R$ 2.500 no dia 05 e dia 20</strong>.
            </p>
          </div>

          {/* Right Zone: Primary Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {/* Toggle Mode */}
            <button
              onClick={() => onToggleQuinzenalMode(!quinzenalModeActive)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                quinzenalModeActive
                  ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-current" />
              <span>{quinzenalModeActive ? 'Modo Quinzenal Ativo ✓' : 'Ativar Modo Quinzenal'}</span>
            </button>

            {/* Quick Quinzenal Transfer */}
            <button
              onClick={handleTransferClick}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              {transferredFeedback ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>R$ 2.500 Transferido!</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Repassar R$ 2.500 Agora</span>
                </>
              )}
            </button>

            {/* Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer self-center sm:self-auto"
              title="Minimizar notificação"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: FREE CASH STILL UNDER R$ 2.500 -> PROGRESS & MOTIVATION
  // =========================================================================
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-2xs space-y-3 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Fase Atual: Construção do Caixa Livre Inicial
          </span>
          <span className="text-[11px] font-mono text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
            {formatBRL(currentFreeCash)} de {formatBRL(freeCashThreshold)} ({progressPct.toFixed(0)}%)
          </span>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Gatilho do Fluxo Quinzenal: {formatBRL(freeCashThreshold)}
        </span>
      </div>

      <div className="space-y-1">
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span>
            Faltam <strong>{formatBRL(missingAmount)}</strong> no caixa da empresa para liberar as retiradas fixas nos dias 05 e 20.
          </span>
          <span className="text-blue-700 font-medium hidden sm:inline">
            Regra em vigor: Repasse automático a cada entrada de site
          </span>
        </div>
      </div>
    </div>
  );
};
