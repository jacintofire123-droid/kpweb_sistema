/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PhoneRepairItem,
  SaaSSubscriber,
  FixedSiteClient,
  Transaction,
  WebProject,
  BusinessProfile,
} from '../types';
import { formatBRL, formatDateBR } from '../utils/formatters';
import {
  Smartphone,
  Store,
  Globe,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Layers,
  Wrench,
  X,
  AlertCircle,
  Repeat,
  Sparkles,
  Filter,
} from 'lucide-react';

interface RevenueStreamsHubProps {
  phones: PhoneRepairItem[];
  setPhones: React.Dispatch<React.SetStateAction<PhoneRepairItem[]>>;
  saasSubscribers: SaaSSubscriber[];
  setSaaSSubscribers: React.Dispatch<React.SetStateAction<SaaSSubscriber[]>>;
  fixedClients: FixedSiteClient[];
  setFixedClients: React.Dispatch<React.SetStateAction<FixedSiteClient[]>>;
  transactions: Transaction[];
  projects: WebProject[];
  profile: BusinessProfile;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onOpenNewProject?: () => void;
}

type StreamTab = 'all' | 'phones' | 'saas' | 'fixed_sites';

export const RevenueStreamsHub: React.FC<RevenueStreamsHubProps> = ({
  phones,
  setPhones,
  saasSubscribers,
  setSaaSSubscribers,
  fixedClients,
  setFixedClients,
  transactions,
  projects,
  profile,
  onAddTransaction,
  onOpenNewProject,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<StreamTab>('all');

  // Modals state
  const [isNewPhoneOpen, setIsNewPhoneOpen] = useState(false);
  const [sellingPhone, setSellingPhone] = useState<PhoneRepairItem | null>(null);
  const [isNewSaaSOpen, setIsNewSaaSOpen] = useState(false);
  const [isNewFixedOpen, setIsNewFixedOpen] = useState(false);

  const currentMonthStr = new Date().toISOString().slice(0, 7);

  // --- CALCULATIONS FOR CELULARES ---
  const totalPhonesSold = phones.filter((p) => p.status === 'vendido');
  const totalPhonesRealizedProfit = totalPhonesSold.reduce((acc, p) => {
    const sale = p.soldPrice || p.targetSalePrice;
    const cost = p.purchasePrice + p.partsCost;
    return acc + (sale - cost);
  }, 0);

  const phonesInStock = phones.filter((p) => p.status !== 'vendido');
  const capitalInvestedInStock = phonesInStock.reduce(
    (acc, p) => acc + (p.purchasePrice + p.partsCost),
    0
  );
  const projectedProfitInStock = phonesInStock.reduce((acc, p) => {
    const cost = p.purchasePrice + p.partsCost;
    return acc + Math.max(0, p.targetSalePrice - cost);
  }, 0);

  // --- CALCULATIONS FOR SAAS PDV ---
  const activeSaaSSubscribers = saasSubscribers.filter((s) => s.status === 'ativo');
  const totalSaaSMRR = activeSaaSSubscribers.reduce((acc, s) => acc + s.monthlyFee, 0);
  const saasPaidThisMonthCount = saasSubscribers.filter(
    (s) => s.lastPaymentMonth === currentMonthStr
  ).length;

  // --- CALCULATIONS FOR CLIENTES FIXOS ---
  const activeFixedClients = fixedClients.filter((c) => c.status === 'ativo');
  const totalFixedMRR = activeFixedClients.reduce((acc, c) => acc + c.monthlyFee, 0);
  const fixedPaidThisMonthCount = fixedClients.filter(
    (c) => c.lastPaymentMonth === currentMonthStr
  ).length;

  // --- CALCULATIONS FOR SITES AVULSOS ---
  const pjTransactions = transactions.filter((t) => t.scope === 'PJ');
  const monthSiteRevenue = pjTransactions
    .filter(
      (t) =>
        t.type === 'income' &&
        t.status === 'completed' &&
        t.category.toLowerCase().includes('site') &&
        !t.category.toLowerCase().includes('fixo') &&
        t.date.startsWith(currentMonthStr)
    )
    .reduce((acc, t) => acc + t.amount, 0);

  // Combined Recurring Revenue (SaaS + Sites Fixos)
  const totalPredictableMRR = totalSaaSMRR + totalFixedMRR;

  // Handlers for Phones
  const handleSavePhone = (item: Omit<PhoneRepairItem, 'id'>, recordExpenses: boolean) => {
    const newId = `phone-${Date.now()}`;
    const newPhone: PhoneRepairItem = { ...item, id: newId };
    setPhones((prev) => [newPhone, ...prev]);

    if (recordExpenses) {
      if (item.purchasePrice > 0) {
        onAddTransaction({
          description: `Compra Aparelho Quebrado: ${item.model}`,
          amount: item.purchasePrice,
          type: 'expense',
          category: 'Compra de Celular Quebrado',
          scope: 'PJ',
          date: item.purchaseDate,
          status: 'completed',
          notes: item.issueDescription,
        });
      }
      if (item.partsCost > 0) {
        onAddTransaction({
          description: `Peças para ${item.model}`,
          amount: item.partsCost,
          type: 'expense',
          category: 'Peças & Telas de Celulares',
          scope: 'PJ',
          date: item.purchaseDate,
          status: 'completed',
          notes: item.partsNotes,
        });
      }
    }
    setIsNewPhoneOpen(false);
  };

  const handleConfirmSalePhone = (
    phoneId: string,
    soldPrice: number,
    buyerName: string,
    recordIncome: boolean
  ) => {
    const target = phones.find((p) => p.id === phoneId);
    if (!target) return;

    const today = new Date().toISOString().slice(0, 10);
    setPhones((prev) =>
      prev.map((p) =>
        p.id === phoneId
          ? {
              ...p,
              status: 'vendido',
              soldPrice,
              buyerName: buyerName.trim() || 'Comprador Particular',
              soldDate: today,
            }
          : p
      )
    );

    if (recordIncome) {
      onAddTransaction({
        description: `Venda Celular Consertado: ${target.model} (${buyerName || 'Cliente'})`,
        amount: soldPrice,
        type: 'income',
        category: 'Venda de Celular Consertado',
        scope: 'PJ',
        date: today,
        status: 'completed',
        notes: `Custo total (aparelho + peças): ${formatBRL(
          target.purchasePrice + target.partsCost
        )}. Lucro líquido: ${formatBRL(soldPrice - (target.purchasePrice + target.partsCost))}`,
      });
    }

    setSellingPhone(null);
  };

  const handleUpdatePhoneStatus = (phoneId: string, newStatus: PhoneRepairItem['status']) => {
    setPhones((prev) =>
      prev.map((p) => (p.id === phoneId ? { ...p, status: newStatus } : p))
    );
  };

  const handleDeletePhone = (phoneId: string) => {
    setPhones((prev) => prev.filter((p) => p.id !== phoneId));
  };

  // Handlers for SaaS
  const handleSaveSaaS = (item: Omit<SaaSSubscriber, 'id'>) => {
    const newId = `saas-${Date.now()}`;
    setSaaSSubscribers((prev) => [{ ...item, id: newId }, ...prev]);
    setIsNewSaaSOpen(false);
  };

  const handleCollectSaaSMonthly = (sub: SaaSSubscriber) => {
    setSaaSSubscribers((prev) =>
      prev.map((s) =>
        s.id === sub.id ? { ...s, lastPaymentMonth: currentMonthStr } : s
      )
    );

    onAddTransaction({
      description: `Mensalidade SaaS PDV - ${sub.businessName} (Dia ${sub.billingDay})`,
      amount: sub.monthlyFee,
      type: 'income',
      category: 'SaaS de PDV (Mensalidades)',
      scope: 'PJ',
      date: new Date().toISOString().slice(0, 10),
      status: 'completed',
      notes: `Plano: ${sub.plan}. Responsável: ${sub.ownerName}`,
    });
  };

  const handleDeleteSaaS = (id: string) => {
    setSaaSSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  // Handlers for Clientes Fixos
  const handleSaveFixed = (item: Omit<FixedSiteClient, 'id'>) => {
    const newId = `fix-${Date.now()}`;
    setFixedClients((prev) => [{ ...item, id: newId }, ...prev]);
    setIsNewFixedOpen(false);
  };

  const handleCollectFixedMonthly = (client: FixedSiteClient) => {
    setFixedClients((prev) =>
      prev.map((c) =>
        c.id === client.id ? { ...c, lastPaymentMonth: currentMonthStr } : c
      )
    );

    onAddTransaction({
      description: `Manutenção Mensal Site - ${client.clientName} (${client.websiteUrl})`,
      amount: client.monthlyFee,
      type: 'income',
      category: 'Clientes Fixos (Manutenção de Sites)',
      scope: 'PJ',
      date: new Date().toISOString().slice(0, 10),
      status: 'completed',
      notes: `Escopo: ${client.scopeDescription}`,
    });
  };

  const handleDeleteFixed = (id: string) => {
    setFixedClients((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* HEADER WITH MULTI-STREAM PRESENTATION */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Hub de Múltiplas Fontes de Renda
              </h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full">
                4 Motores Financeiros
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl">
              Gerencie e acompanhe individualmente cada fonte de receita: <strong>Conserto e Revenda de Celulares</strong>,
              <strong> SaaS de PDV com mensalidades</strong>, <strong>Clientes Fixos de Sites</strong> e <strong>Projetos Web Avulsos</strong>.
            </p>
          </div>

          {/* Quick predictable MRR badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Receita Recorrente Garantida (MRR)
              </span>
              <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                {formatBRL(totalPredictableMRR)}
                <span className="text-xs font-normal text-slate-500"> /mês</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {activeSaaSSubscribers.length} comércios no PDV + {activeFixedClients.length} sites fixos
              </span>
            </div>
          </div>
        </div>

        {/* 4 REVENUE STREAM CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-100">
          {/* Stream 1: Celulares */}
          <div
            onClick={() => setActiveSubTab('phones')}
            className={`rounded-lg border p-3.5 transition-all cursor-pointer ${
              activeSubTab === 'phones'
                ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Conserto & Revenda</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-medium">
                {phones.length} aparelhos
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {formatBRL(totalPhonesRealizedProfit)}
              <span className="text-[10px] font-medium text-slate-500 block">Lucro realizado no bolso</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Em estoque: {phonesInStock.length}</span>
              <span className="text-emerald-700 font-semibold font-mono">+{formatBRL(projectedProfitInStock)} prev.</span>
            </div>
          </div>

          {/* Stream 2: SaaS PDV */}
          <div
            onClick={() => setActiveSubTab('saas')}
            className={`rounded-lg border p-3.5 transition-all cursor-pointer ${
              activeSubTab === 'saas'
                ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-600" />
                <span>SaaS de PDV</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-medium">
                {activeSaaSSubscribers.length} comércios
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {formatBRL(totalSaaSMRR)}
              <span className="text-[10px] font-medium text-slate-500 block">MRR Mensalidade</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
              <span>{saasPaidThisMonthCount} pagos no mês</span>
              <span className="text-blue-700 font-semibold font-mono">
                {formatBRL(saasPaidThisMonthCount * 115)}
              </span>
            </div>
          </div>

          {/* Stream 3: Clientes Fixos Sites */}
          <div
            onClick={() => setActiveSubTab('fixed_sites')}
            className={`rounded-lg border p-3.5 transition-all cursor-pointer ${
              activeSubTab === 'fixed_sites'
                ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>Sites Recorrentes</span>
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-medium">
                {activeFixedClients.length} contratos
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {formatBRL(totalFixedMRR)}
              <span className="text-[10px] font-medium text-slate-500 block">MRR Manutenção</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
              <span>{fixedPaidThisMonthCount} pagos no mês</span>
              <span className="text-emerald-700 font-semibold font-mono">
                {formatBRL(fixedPaidThisMonthCount * 220)}
              </span>
            </div>
          </div>

          {/* Stream 4: Projetos Avulsos Web */}
          <div
            onClick={() => setActiveSubTab('all')}
            className={`rounded-lg border p-3.5 transition-all cursor-pointer ${
              activeSubTab === 'all'
                ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Sites Novos (Avulso)</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-medium">
                {projects.length} projetos
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {formatBRL(monthSiteRevenue)}
              <span className="text-[10px] font-medium text-slate-500 block">Entradas do mês</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Ticket Médio</span>
              <span className="text-slate-700 font-semibold font-mono">
                {formatBRL(profile.averageTicketSale || 2800)}
              </span>
            </div>
          </div>
        </div>

        {/* FILTER SUB-TABS */}
        <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Visão Geral Consolidada
          </button>
          <button
            onClick={() => setActiveSubTab('phones')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'phones'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 Conserto & Revenda de Celulares ({phones.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('saas')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'saas'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>⚡ SaaS de PDV ({saasSubscribers.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('fixed_sites')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'fixed_sites'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🔄 Clientes Fixos de Sites ({fixedClients.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEÇÃO 1: CONSERTO E REVENDA DE CELULARES (FLIP) */}
      {/* ======================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'phones') && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  <Smartphone className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Bancada de Celulares: Compra, Reparo e Revenda com Lucro
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Compre smartphones quebrados (telas trincadas, baterias, conectores), repare e venda a preço de mercado com margens de até 100%.
              </p>
            </div>

            <button
              onClick={() => setIsNewPhoneOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Aparelho Quebrado</span>
            </button>
          </div>

          {/* Quick Metrics Bar for Phones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Lucro Realizado no Bolso</span>
              <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
                {formatBRL(totalPhonesRealizedProfit)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Capital Parado em Estoque</span>
              <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
                {formatBRL(capitalInvestedInStock)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Lucro Projetado em Estoque</span>
              <span className="text-lg font-bold font-mono text-blue-600 tabular-nums">
                +{formatBRL(projectedProfitInStock)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Aparelhos na Bancada / Loja</span>
              <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
                {phonesInStock.length} unidades
              </span>
            </div>
          </div>

          {/* Phones List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {phones.map((phone) => {
              const totalCost = phone.purchasePrice + phone.partsCost;
              const salePrice = phone.soldPrice || phone.targetSalePrice;
              const netProfit = salePrice - totalCost;
              const marginPct = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;

              return (
                <div
                  key={phone.id}
                  className={`rounded-xl border p-4 space-y-3 transition-all ${
                    phone.status === 'vendido'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : phone.status === 'pronto_venda'
                      ? 'border-blue-200 bg-blue-50/20 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{phone.model}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Comprado em {formatDateBR(phone.purchaseDate)}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        phone.status === 'vendido'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : phone.status === 'pronto_venda'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {phone.status === 'vendido'
                        ? 'Vendido com Lucro ✓'
                        : phone.status === 'pronto_venda'
                        ? 'Pronto / Anunciado'
                        : 'Na Bancada (Conserto)'}
                    </span>
                  </div>

                  {/* Problem & Parts Details */}
                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1 border border-slate-100">
                    <p className="text-slate-700">
                      <strong className="text-slate-900">Defeito:</strong> {phone.issueDescription}
                    </p>
                    {phone.partsNotes && (
                      <p className="text-slate-600">
                        <strong className="text-slate-900">Peças:</strong> {phone.partsNotes}
                      </p>
                    )}
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100 font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Custo Compra Aparelho:</span>
                      <span>{formatBRL(phone.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Custo Peças / Reparo:</span>
                      <span>{formatBRL(phone.partsCost)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-dashed border-slate-200">
                      <span>Custo Total Investido:</span>
                      <span>{formatBRL(totalCost)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>{phone.status === 'vendido' ? 'Vendido Por:' : 'Preço de Venda:'}</span>
                      <span className="font-bold text-slate-900">{formatBRL(salePrice)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                      <span className="font-bold text-slate-900">Lucro Líquido:</span>
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        +{formatBRL(netProfit)}{' '}
                        <span className="text-[10px] font-normal text-slate-500">
                          ({marginPct.toFixed(0)}% margem)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Notes / Buyer Info */}
                  {phone.status === 'vendido' && phone.buyerName && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                      Comprador: <strong>{phone.buyerName}</strong> em {formatDateBR(phone.soldDate || '')}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDeletePhone(phone.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Excluir aparelho"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {phone.status === 'em_reparo' && (
                        <button
                          onClick={() => handleUpdatePhoneStatus(phone.id, 'pronto_venda')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Marcar Pronto p/ Venda
                        </button>
                      )}

                      {phone.status === 'pronto_venda' && (
                        <button
                          onClick={() => setSellingPhone(phone)}
                          className="px-3 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Registrar Venda</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SEÇÃO 2: SAAS DE PDV (SOFTWARE PARA PONTO DE VENDA) */}
      {/* ======================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'saas') && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  <Store className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  SaaS de PDV: Assinaturas e Mensalidades Recorrentes
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Controle de comércios assinantes do seu sistema de Ponto de Venda. Receita que cai todo mês automaticamente na sua conta PJ.
              </p>
            </div>

            <button
              onClick={() => setIsNewSaaSOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Assinante PDV</span>
            </button>
          </div>

          {/* Quick Metrics Bar for SaaS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">MRR Total do SaaS</span>
              <span className="text-lg font-bold font-mono text-amber-700 tabular-nums">
                {formatBRL(totalSaaSMRR)}/mês
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Comércios Ativos</span>
              <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
                {activeSaaSSubscribers.length} lojas
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Ticket Médio por PDV</span>
              <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
                {formatBRL(
                  activeSaaSSubscribers.length > 0
                    ? totalSaaSMRR / activeSaaSSubscribers.length
                    : 0
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Pagos no Mês Atual</span>
              <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
                {saasPaidThisMonthCount} de {saasSubscribers.length}
              </span>
            </div>
          </div>

          {/* SaaS Subscribers Cards / List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            {saasSubscribers.map((sub) => {
              const isPaidCurrentMonth = sub.lastPaymentMonth === currentMonthStr;

              return (
                <div
                  key={sub.id}
                  className={`rounded-xl border p-4 space-y-3 transition-all ${
                    isPaidCurrentMonth
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{sub.businessName}</span>
                      <span className="text-xs text-slate-500">Resp: {sub.ownerName}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sub.status === 'ativo'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {sub.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1 border border-slate-100">
                    <p className="text-slate-700">
                      <strong>Plano:</strong> {sub.plan}
                    </p>
                    <p className="text-slate-600">
                      <strong>Vencimento:</strong> Todo dia {sub.billingDay} do mês
                    </p>
                    {sub.notes && <p className="text-slate-500 text-[11px]">{sub.notes}</p>}
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Mensalidade:</span>
                    <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                      {formatBRL(sub.monthlyFee)}
                      <span className="text-[10px] font-normal text-slate-500"> /mês</span>
                    </span>
                  </div>

                  {/* Payment status and button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDeleteSaaS(sub.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Excluir assinante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {isPaidCurrentMonth ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mês Pago ✓</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCollectSaaSMonthly(sub)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Repeat className="w-3 h-3" />
                        <span>Dar Baixa no Mês</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SEÇÃO 3: CLIENTES FIXOS DE SITES (MANUTENÇÃO E HOSPEDAGEM) */}
      {/* ======================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'fixed_sites') && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Globe className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Clientes Fixos de Sites: Manutenção, Suporte e Hospedagem
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Contratos contínuos de clientes que pagam todo mês para manter seus sites no ar, atualizados e seguros.
              </p>
            </div>

            <button
              onClick={() => setIsNewFixedOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Cliente Fixo</span>
            </button>
          </div>

          {/* Quick Metrics Bar for Clientes Fixos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">MRR de Manutenção de Sites</span>
              <span className="text-lg font-bold font-mono text-indigo-700 tabular-nums">
                {formatBRL(totalFixedMRR)}/mês
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Sites Sob Gestão Ativa</span>
              <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
                {activeFixedClients.length} sites
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Ticket Médio Mensal</span>
              <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
                {formatBRL(
                  activeFixedClients.length > 0
                    ? totalFixedMRR / activeFixedClients.length
                    : 0
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Recebidos no Mês</span>
              <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
                {fixedPaidThisMonthCount} de {fixedClients.length}
              </span>
            </div>
          </div>

          {/* Fixed Clients List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            {fixedClients.map((client) => {
              const isPaidCurrentMonth = client.lastPaymentMonth === currentMonthStr;

              return (
                <div
                  key={client.id}
                  className={`rounded-xl border p-4 space-y-3 transition-all ${
                    isPaidCurrentMonth
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{client.clientName}</span>
                      <span className="text-xs text-blue-600 font-mono truncate block">{client.websiteUrl}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        client.status === 'ativo'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {client.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1 border border-slate-100">
                    <p className="text-slate-700">
                      <strong>Escopo:</strong> {client.scopeDescription}
                    </p>
                    <p className="text-slate-600">
                      <strong>Cobrança:</strong> Todo dia {client.billingDay}
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Valor Fixo:</span>
                    <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                      {formatBRL(client.monthlyFee)}
                      <span className="text-[10px] font-normal text-slate-500"> /mês</span>
                    </span>
                  </div>

                  {/* Payment status and button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDeleteFixed(client.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Excluir contrato fixo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {isPaidCurrentMonth ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mês Pago ✓</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCollectFixedMonthly(client)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Repeat className="w-3 h-3" />
                        <span>Confirmar Pagamento</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SEÇÃO 4: IMPACTO FINANCEIRO CONSOLIDADO NO FLUXO DE CAIXA */}
      {/* ======================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Como essas 4 fontes garantem sua tranquilidade financeira:
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <strong className="text-slate-900 block font-semibold">1. Aluguel Pago sem Depender de Sites</strong>
            <p>
              Seu aluguel é de {formatBRL(profile.monthlyRentAmount)}. Com {formatBRL(totalPredictableMRR)} de MRR (SaaS + Sites fixos),
              seu custo de moradia e custos básicos já começam o mês praticamente cobertos!
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <strong className="text-slate-900 block font-semibold">2. Aceleração da Meta dos R$ 2.500</strong>
            <p>
              Cada celular vendido gera de R$ 350 a R$ 700 de lucro líquido rápido no Pix, acelerando o momento de atingir a marca de R$ 2.500 para fazer a retirada quinzenal.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <strong className="text-slate-900 block font-semibold">3. Menos Pressão em Vendas Avulsas</strong>
            <p>
              Você não precisa fechar 4 sites todo santo mês no desespero. Você combina receita pontual de alto valor (sites novos) com caixa ágil (celulares) e receita previsível (SaaS e manutenção).
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODAL: NOVO CELULAR QUEBRADO */}
      {/* ======================================================== */}
      {isNewPhoneOpen && (
        <NewPhoneModal
          isOpen={isNewPhoneOpen}
          onClose={() => setIsNewPhoneOpen(false)}
          onSave={handleSavePhone}
        />
      )}

      {/* MODAL: REGISTRAR VENDA DE CELULAR */}
      {sellingPhone && (
        <SellPhoneModal
          phone={sellingPhone}
          isOpen={Boolean(sellingPhone)}
          onClose={() => setSellingPhone(null)}
          onConfirm={handleConfirmSalePhone}
        />
      )}

      {/* MODAL: NOVO ASSINANTE SAAS PDV */}
      {isNewSaaSOpen && (
        <NewSaaSModal
          isOpen={isNewSaaSOpen}
          onClose={() => setIsNewSaaSOpen(false)}
          onSave={handleSaveSaaS}
        />
      )}

      {/* MODAL: NOVO CLIENTE FIXO DE SITE */}
      {isNewFixedOpen && (
        <NewFixedClientModal
          isOpen={isNewFixedOpen}
          onClose={() => setIsNewFixedOpen(false)}
          onSave={handleSaveFixed}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// MODAIS AUXILIARES
// -------------------------------------------------------------

interface NewPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phone: Omit<PhoneRepairItem, 'id'>, recordExpenses: boolean) => void;
}

const NewPhoneModal: React.FC<NewPhoneModalProps> = ({ isOpen, onClose, onSave }) => {
  const [model, setModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [partsNotes, setPartsNotes] = useState('');
  const [targetSalePrice, setTargetSalePrice] = useState('');
  const [recordExpenses, setRecordExpenses] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const purchase = parseFloat(purchasePrice.replace(',', '.')) || 0;
    const parts = parseFloat(partsCost.replace(',', '.')) || 0;
    const targetSale = parseFloat(targetSalePrice.replace(',', '.')) || 0;

    if (!model.trim() || purchase <= 0 || targetSale <= 0) return;

    onSave(
      {
        model: model.trim(),
        issueDescription: issueDescription.trim() || 'Tela quebrada / Revisão',
        purchasePrice: purchase,
        partsCost: parts,
        partsNotes: partsNotes.trim() || undefined,
        purchaseDate: new Date().toISOString().slice(0, 10),
        targetSalePrice: targetSale,
        status: partsCost ? 'pronto_venda' : 'em_reparo',
      },
      recordExpenses
    );
  };

  const totalCost = (parseFloat(purchasePrice.replace(',', '.')) || 0) + (parseFloat(partsCost.replace(',', '.')) || 0);
  const targetSale = parseFloat(targetSalePrice.replace(',', '.')) || 0;
  const estimatedProfit = targetSale - totalCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Cadastrar Celular Quebrado</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Modelo do Celular</label>
            <input
              type="text"
              required
              placeholder="Ex: iPhone 11 128GB Preto, Xiaomi Note 12"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Defeito / O que precisa arrumar?</label>
            <input
              type="text"
              required
              placeholder="Ex: Tela trincada + Bateria viciada (FaceID ok)"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Valor Pago no Quebrado (R$)</label>
              <input
                type="number"
                step="10"
                required
                placeholder="Ex: 400"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Custo das Peças / Tela (R$)</label>
              <input
                type="number"
                step="10"
                placeholder="Ex: 220 (Tela + Bateria)"
                value={partsCost}
                onChange={(e) => setPartsCost(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Detalhes das Peças (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Tela OLED Incell + Bateria Foxconn com selo"
              value={partsNotes}
              onChange={(e) => setPartsNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Preço Estimado de Venda (R$)</label>
            <input
              type="number"
              step="50"
              required
              placeholder="Ex: 1100"
              value={targetSalePrice}
              onChange={(e) => setTargetSalePrice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
            />
          </div>

          {/* Quick Realtime Preview */}
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 block">Custo Total: {formatBRL(totalCost)}</span>
              <span className="text-emerald-800 font-semibold">Lucro Estimado no Bolso:</span>
            </div>
            <span className="text-sm font-bold font-mono text-emerald-800 tabular-nums">
              +{formatBRL(Math.max(0, estimatedProfit))}
            </span>
          </div>

          <label className="flex items-center gap-2 pt-1 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={recordExpenses}
              onChange={(e) => setRecordExpenses(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span>Lançar compra e peças automaticamente como despesa no Extrato PJ</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Salvar na Bancada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SellPhoneModalProps {
  phone: PhoneRepairItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phoneId: string, soldPrice: number, buyerName: string, recordIncome: boolean) => void;
}

const SellPhoneModal: React.FC<SellPhoneModalProps> = ({
  phone,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [soldPrice, setSoldPrice] = useState(String(phone.targetSalePrice));
  const [buyerName, setBuyerName] = useState('');
  const [recordIncome, setRecordIncome] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrice = parseFloat(soldPrice.replace(',', '.'));
    if (isNaN(finalPrice) || finalPrice <= 0) return;
    onConfirm(phone.id, finalPrice, buyerName, recordIncome);
  };

  const totalCost = phone.purchasePrice + phone.partsCost;
  const currentSale = parseFloat(soldPrice.replace(',', '.')) || 0;
  const realizedProfit = currentSale - totalCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Registrar Venda do Celular</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">{phone.model}</span>
            <div className="flex justify-between text-slate-500 font-mono text-[11px]">
              <span>Custo total investido:</span>
              <span>{formatBRL(totalCost)}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Preço Final de Venda (R$)</label>
            <input
              type="number"
              step="10"
              required
              value={soldPrice}
              onChange={(e) => setSoldPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Nome do Comprador / Canal</label>
            <input
              type="text"
              placeholder="Ex: João (OLX), Loja do Bairro, Amigo"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-emerald-800 font-semibold block">Lucro Líquido Realizado:</span>
              <span className="text-[10px] text-slate-500">Direto no seu bolso/caixa</span>
            </div>
            <span className="text-base font-bold font-mono text-emerald-800 tabular-nums">
              +{formatBRL(realizedProfit)}
            </span>
          </div>

          <label className="flex items-center gap-2 pt-1 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={recordIncome}
              onChange={(e) => setRecordIncome(e.target.checked)}
              className="rounded text-blue-600"
            />
            <span>Lançar valor da venda automaticamente como receita no Extrato PJ</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Confirmar Venda & Lucro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface NewSaaSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Omit<SaaSSubscriber, 'id'>) => void;
}

const NewSaaSModal: React.FC<NewSaaSModalProps> = ({ isOpen, onClose, onSave }) => {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [plan, setPlan] = useState('PDV Essencial');
  const [monthlyFee, setMonthlyFee] = useState('99');
  const [billingDay, setBillingDay] = useState('10');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(monthlyFee.replace(',', '.'));
    const day = parseInt(billingDay, 10) || 10;
    if (!businessName.trim() || isNaN(fee) || fee <= 0) return;

    onSave({
      businessName: businessName.trim(),
      ownerName: ownerName.trim() || 'Comerciante',
      plan,
      monthlyFee: fee,
      billingDay: day,
      startDate: new Date().toISOString().slice(0, 10),
      status: 'ativo',
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Novo Assinante SaaS de PDV</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Nome do Estabelecimento / Loja</label>
            <input
              type="text"
              required
              placeholder="Ex: Padaria Central, Mercado do Bairro, Pet Shop Dog"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Nome do Responsável / Contato</label>
            <input
              type="text"
              placeholder="Ex: Carlos Eduardo"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Plano do Sistema</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="PDV Básico">PDV Básico (Frente de Caixa)</option>
                <option value="PDV Essencial">PDV Essencial + Estoque</option>
                <option value="PDV Fiscal Pro">PDV Fiscal (NFC-e / SAT)</option>
                <option value="PDV Delivery & Mesas">PDV Delivery & Mesas</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Valor Mensal (R$/mês)</label>
              <input
                type="number"
                step="5"
                required
                placeholder="Ex: 99"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Dia do Vencimento Mensal</label>
            <select
              value={billingDay}
              onChange={(e) => setBillingDay(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="5">Todo dia 05</option>
              <option value="10">Todo dia 10</option>
              <option value="15">Todo dia 15</option>
              <option value="20">Todo dia 20</option>
              <option value="25">Todo dia 25</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Observações (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: 2 computadores interligados, impressora térmica instalada"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
            >
              Salvar Assinante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface NewFixedClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<FixedSiteClient, 'id'>) => void;
}

const NewFixedClientModal: React.FC<NewFixedClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [clientName, setClientName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scopeDescription, setScopeDescription] = useState('Hospedagem VPS + Backup semanal + Suporte');
  const [monthlyFee, setMonthlyFee] = useState('250');
  const [billingDay, setBillingDay] = useState('10');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(monthlyFee.replace(',', '.'));
    const day = parseInt(billingDay, 10) || 10;
    if (!clientName.trim() || isNaN(fee) || fee <= 0) return;

    onSave({
      clientName: clientName.trim(),
      websiteUrl: websiteUrl.trim() || 'meusite.com.br',
      scopeDescription: scopeDescription.trim(),
      monthlyFee: fee,
      billingDay: day,
      startDate: new Date().toISOString().slice(0, 10),
      status: 'ativo',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Novo Cliente Fixo de Site</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Nome do Cliente / Empresa</label>
            <input
              type="text"
              required
              placeholder="Ex: Clínica Odonto Silva, Escritório Santos Advocacia"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Domínio / Site</label>
            <input
              type="text"
              placeholder="Ex: odontosilva.com.br"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Escopo do Pacote Mensal</label>
            <input
              type="text"
              required
              placeholder="Ex: Hospedagem VPS + Backup diário + 2h suporte"
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Valor Mensal (R$/mês)</label>
              <input
                type="number"
                step="10"
                required
                placeholder="Ex: 250"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Dia do Vencimento</label>
              <select
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="5">Todo dia 05</option>
                <option value="10">Todo dia 10</option>
                <option value="15">Todo dia 15</option>
                <option value="20">Todo dia 20</option>
                <option value="25">Todo dia 25</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Salvar Contrato Fixo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
