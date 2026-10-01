/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab } from '../types';
import { Plus, SlidersHorizontal, Bell, CalendarCheck, X } from 'lucide-react';
import { formatBRL } from '../utils/formatters';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewProject: () => void;
  onOpenNewExpense: () => void;
  onOpenSettings: () => void;
  isFreeCashAchieved?: boolean;
  currentFreeCash?: number;
  onExecuteQuinzenalTransfer?: () => void;
  urgentAlertsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewProject,
  onOpenNewExpense,
  onOpenSettings,
  isFreeCashAchieved = false,
  currentFreeCash = 0,
  onExecuteQuinzenalTransfer,
  urgentAlertsCount = 0,
}) => {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    };
    if (isAlertsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAlertsOpen]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Tabs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-lg">
              GestorFluxo
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded">
              Dev
            </span>
          </div>

          {/* Simple Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Painel Geral
            </button>
            <button
              onClick={() => setActiveTab('streams')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'streams'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Fontes de Renda</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'goals'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Metas de Crescimento
            </button>
            <button
              onClick={() => setActiveTab('cashflow')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'cashflow'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Extrato
            </button>
          </div>
        </div>

        {/* Clean Direct Actions */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Bell with alert badge */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              title="Notificações e Alertas do Sistema"
              className={`p-2 rounded-lg border transition-colors cursor-pointer relative ${
                isAlertsOpen
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              {urgentAlertsCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white font-bold text-[9px]">
                  {urgentAlertsCount}
                </span>
              ) : isFreeCashAchieved ? (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              ) : null}
            </button>

            {/* Notification Dropdown Menu */}
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notificações & Rotina PJ</span>
                  </div>
                  <button
                    onClick={() => setIsAlertsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {urgentAlertsCount > 0 && (
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-rose-600"></span>
                      <span className="font-bold text-rose-900">
                        {urgentAlertsCount} Vencimento(s) Pendente(s)
                      </span>
                    </div>
                    <p className="text-rose-800 text-[11px] leading-relaxed">
                      Você tem cobranças de clientes fixos, mensalidades de SaaS PDV ou guias de impostos com vencimento hoje ou em atraso.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('overview');
                        setIsAlertsOpen(false);
                      }}
                      className="w-full mt-1 py-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md transition-colors cursor-pointer text-center text-[11px]"
                    >
                      Abrir Central de Alertas
                    </button>
                  </div>
                )}

                {isFreeCashAchieved ? (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-600"></span>
                      <span className="font-bold text-emerald-900">
                        Caixa Livre Atingiu R$ 2.500!
                      </span>
                    </div>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      Sua empresa possui <strong>{formatBRL(currentFreeCash)}</strong> de caixa livre. O fluxo de repasses quinzenais fixos nos dias <strong>05 e 20</strong> já pode ser ativado!
                    </p>
                    {onExecuteQuinzenalTransfer && (
                      <button
                        onClick={() => {
                          onExecuteQuinzenalTransfer();
                          setIsAlertsOpen(false);
                        }}
                        className="w-full mt-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md transition-colors cursor-pointer text-center text-[11px] flex items-center justify-center gap-1"
                      >
                        <CalendarCheck className="w-3 h-3" />
                        <span>Fazer Repasse Quinzenal (R$ 2.500)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
                    <span className="font-medium text-slate-800 block mb-0.5">
                      Caixa Livre em Construção
                    </span>
                    Atual: {formatBRL(currentFreeCash)} de R$ 2.500. Continue aplicando a regra de divisão proporcional por entrada até atingir a meta!
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            title="Ajustar Metas (R$ 8k Lucro / R$ 5k Pró-labore)"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewExpense}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <span>+ Despesa</span>
          </button>

          <button
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Venda de Site</span>
          </button>
        </div>
      </div>
    </header>
  );
};
