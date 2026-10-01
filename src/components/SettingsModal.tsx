/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { X, Building2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  onSaveProfile: (profile: BusinessProfile) => void;
  onResetToDemo: () => void;
  onClearAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetToDemo,
  onClearAll,
}) => {
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [targetCompanyProfit, setTargetCompanyProfit] = useState((profile.targetCompanyProfit || 8000).toString());
  const [targetProlabore, setTargetProlabore] = useState((profile.targetProlabore || 5000).toString());
  const [monthlyRentAmount, setMonthlyRentAmount] = useState((profile.monthlyRentAmount || 1400).toString());
  const [freeCashThreshold, setFreeCashThreshold] = useState((profile.freeCashThreshold || 2500).toString());
  const [initialCashBalance, setInitialCashBalance] = useState((profile.initialCashBalance || 1100).toString());
  const [monthlyFixedCostTarget, setMonthlyFixedCostTarget] = useState((profile.monthlyFixedCostTarget || 1850).toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      companyName: companyName.trim() || 'Studio Dev Web',
      ownerName: ownerName.trim() || 'Desenvolvedor',
      targetCompanyProfit: parseFloat(targetCompanyProfit) || 8000,
      targetProlabore: parseFloat(targetProlabore) || 5000,
      monthlyRentAmount: parseFloat(monthlyRentAmount) || 1400,
      freeCashThreshold: parseFloat(freeCashThreshold) || 2500,
      initialCashBalance: parseFloat(initialCashBalance) || 0,
      monthlyFixedCostTarget: parseFloat(monthlyFixedCostTarget) || 1850,
      targetMonthlyRevenue:
        profile.targetMonthlyRevenue ||
        (parseFloat(targetCompanyProfit) || 8000) +
          (parseFloat(targetProlabore) || 5000) +
          (parseFloat(monthlyFixedCostTarget) || 1850),
      averageTicketSale: profile.averageTicketSale || 2800,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Ajustar Metas Financeiras</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Personalize o lucro da empresa, pró-labore, aluguel e caixa livre
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Nome da Agência / Empresa
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Seu Nome
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
            <div>
              <label className="block text-slate-800 font-semibold mb-1">
                Meta Lucro Empresa (PJ)
              </label>
              <input
                type="number"
                step="500"
                value={targetCompanyProfit}
                onChange={(e) => setTargetCompanyProfit(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-blue-700 font-mono focus:border-blue-600 focus:outline-none tabular-nums font-bold"
              />
              <span className="text-[10px] text-slate-500">Meta: R$ 8.000</span>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">
                Meta Pró-Labore Dono (PF)
              </label>
              <input
                type="number"
                step="500"
                value={targetProlabore}
                onChange={(e) => setTargetProlabore(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-blue-700 font-mono focus:border-blue-600 focus:outline-none tabular-nums font-bold"
              />
              <span className="text-[10px] text-slate-500">Meta: R$ 5.000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Valor do Seu Aluguel (R$)
              </label>
              <input
                type="number"
                step="50"
                value={monthlyRentAmount}
                onChange={(e) => setMonthlyRentAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Caixa Livre para Virar Quinzenal (R$)
              </label>
              <input
                type="number"
                step="100"
                value={freeCashThreshold}
                onChange={(e) => setFreeCashThreshold(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
              <span className="text-[10px] text-slate-400">Gatilho dia 5 e 20 (R$ 2.500)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Caixa Atual da Empresa (R$)
              </label>
              <input
                type="number"
                step="50"
                value={initialCashBalance}
                onChange={(e) => setInitialCashBalance(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Custos Operacionais Fixos (R$)
              </label>
              <input
                type="number"
                step="50"
                value={monthlyFixedCostTarget}
                onChange={(e) => setMonthlyFixedCostTarget(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Recarregar dados de exemplo?')) {
                  onResetToDemo();
                  onClose();
                }
              }}
              className="text-slate-500 hover:text-slate-800 underline cursor-pointer text-[11px]"
            >
              Recarregar Exemplo
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
