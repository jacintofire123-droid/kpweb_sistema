/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Transaction,
  WebProject,
  BusinessProfile,
  ActiveTab,
  ProjectStatus,
  PhoneRepairItem,
  SaaSSubscriber,
  FixedSiteClient,
} from './types';
import {
  initialProfile,
  initialTransactions,
  initialProjects,
  initialPhones,
  initialSaaSUsers,
  initialFixedClients,
} from './data/defaultData';
import {
  exportTransactionsToCSV,
  calculateWebAgencyMetrics,
  generateCashFlowChartData,
} from './utils/formatters';
import { TopBar } from './components/TopBar';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionsManager } from './components/TransactionsManager';
import { GrowthGoalsManager } from './components/GrowthGoalsManager';
import { CashFlowProjectionChart } from './components/CashFlowProjectionChart';
import { RevenueStreamsHub } from './components/RevenueStreamsHub';
import { TransactionModal } from './components/TransactionModal';
import { NewProjectModal, ReceivePaymentModal } from './components/ProjectModals';
import { SettingsModal } from './components/SettingsModal';
import { SlidersHorizontal } from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'gestor_clean_tx_v3',
  PROJECTS: 'gestor_clean_proj_v3',
  PROFILE: 'gestor_clean_prof_v3',
  PHONES: 'gestor_clean_phones_v1',
  SAAS: 'gestor_clean_saas_v1',
  FIXED_CLIENTS: 'gestor_clean_fixed_v1',
};

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [projects, setProjects] = useState<WebProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  const [phones, setPhones] = useState<PhoneRepairItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHONES);
      return saved ? JSON.parse(saved) : initialPhones;
    } catch {
      return initialPhones;
    }
  });

  const [saasSubscribers, setSaaSSubscribers] = useState<SaaSSubscriber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAAS);
      return saved ? JSON.parse(saved) : initialSaaSUsers;
    } catch {
      return initialSaaSUsers;
    }
  });

  const [fixedClients, setFixedClients] = useState<FixedSiteClient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FIXED_CLIENTS);
      return saved ? JSON.parse(saved) : initialFixedClients;
    } catch {
      return initialFixedClients;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [paymentModalProject, setPaymentModalProject] = useState<WebProject | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PHONES, JSON.stringify(phones));
    } catch (e) {
      console.error(e);
    }
  }, [phones]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAAS, JSON.stringify(saasSubscribers));
    } catch (e) {
      console.error(e);
    }
  }, [saasSubscribers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FIXED_CLIENTS, JSON.stringify(fixedClients));
    } catch (e) {
      console.error(e);
    }
  }, [fixedClients]);

  // Handlers
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleToggleStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddProject = (newProj: Omit<WebProject, 'id'>, generateIncome: boolean) => {
    const projId = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const project: WebProject = {
      ...newProj,
      id: projId,
    };
    setProjects((prev) => [project, ...prev]);

    if (generateIncome && newProj.receivedAmount > 0) {
      handleAddTransaction({
        description: `Entrada - ${newProj.projectName} (${newProj.clientName})`,
        amount: newProj.receivedAmount,
        type: 'income',
        category: 'Venda de Sites',
        scope: 'PJ',
        date: newProj.startDate || new Date().toISOString().slice(0, 10),
        status: 'completed',
        projectId: projId,
      });
    }
  };

  const handleUpdateProjectStatus = (id: string, newStatus: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const handleReceivePayment = (projectId: string, amount: number, note: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    const newReceived = target.receivedAmount + amount;
    const isCompleted = newReceived >= target.totalValue;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              receivedAmount: newReceived,
              status: isCompleted ? 'pago' : p.status,
            }
          : p
      )
    );

    handleAddTransaction({
      description: `Recebimento - ${target.projectName} (${target.clientName})`,
      amount,
      type: 'income',
      category: 'Venda de Sites',
      scope: 'PJ',
      date: new Date().toISOString().slice(0, 10),
      status: 'completed',
      notes: note,
      projectId,
    });
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleExecuteProlaboreTransfer = (amount: number, note: string) => {
    handleAddTransaction({
      description: note || 'Repasse de Pró-labore para Conta PF',
      amount,
      type: 'expense',
      category: 'Pró-labore',
      scope: 'PJ',
      date: new Date().toISOString().slice(0, 10),
      status: 'completed',
      notes: 'Transferido para sustento pessoal e aluguel',
    });
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions);
  };

  const handleResetToDemo = () => {
    setTransactions(initialTransactions);
    setProjects(initialProjects);
    setProfile(initialProfile);
    setPhones(initialPhones);
    setSaaSSubscribers(initialSaaSUsers);
    setFixedClients(initialFixedClients);
  };

  const handleClearAll = () => {
    setTransactions([]);
    setProjects([]);
    setPhones([]);
    setSaaSSubscribers([]);
    setFixedClients([]);
  };

  const handleCollectFixedClient = (client: FixedSiteClient) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setFixedClients((prev) =>
      prev.map((c) =>
        c.id === client.id ? { ...c, lastPaymentMonth: currentMonth } : c
      )
    );
    handleAddTransaction({
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

  const handleCollectSaaS = (sub: SaaSSubscriber) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setSaaSSubscribers((prev) =>
      prev.map((s) =>
        s.id === sub.id ? { ...s, lastPaymentMonth: currentMonth } : s
      )
    );
    handleAddTransaction({
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

  const handlePayTaxes = (amount: number) => {
    handleAddTransaction({
      description: 'Pagamento DAS MEI / Simples Nacional',
      amount,
      type: 'expense',
      category: 'Impostos',
      scope: 'PJ',
      date: new Date().toISOString().slice(0, 10),
      status: 'completed',
      notes: 'Guia mensal tributária quitada via PGMEI',
    });
  };

  const handlePayRent = () => {
    handleAddTransaction({
      description: 'Aluguel (Residencial / Home Office)',
      amount: profile.monthlyRentAmount || 1400,
      type: 'expense',
      category: 'Aluguel',
      scope: 'PF',
      date: new Date().toISOString().slice(0, 10),
      status: 'completed',
      notes: 'Aluguel prioritário pago',
    });
  };

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const metrics = calculateWebAgencyMetrics(transactions, projects, profile, currentMonthStr);

  // Calculate count of urgent date-based alerts for TopBar badge
  const todayDate = new Date();
  const todayDay = todayDate.getDate();
  const isTaxUrgent = metrics.taxesPaidMonth === 0 && todayDay >= 20;
  const isRentUrgent = !metrics.isRentPaid && todayDay >= 10;
  const overdueFixedCount = fixedClients.filter(
    (c) => c.status === 'ativo' && c.lastPaymentMonth !== currentMonthStr && todayDay >= (c.billingDay || 10)
  ).length;
  const overdueSaaSCount = saasSubscribers.filter(
    (s) => s.status === 'ativo' && s.lastPaymentMonth !== currentMonthStr && todayDay >= (s.billingDay || 10)
  ).length;
  const overdueProjectsCount = projects.filter((p) => {
    if (p.status !== 'em_desenvolvimento') return false;
    const diffDays = Math.ceil((new Date(p.deliveryDate).getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 0;
  }).length;

  const urgentAlertsCount =
    (isTaxUrgent ? 1 : 0) +
    (isRentUrgent ? 1 : 0) +
    overdueFixedCount +
    overdueSaaSCount +
    overdueProjectsCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Clean Top Bar with Notification Alert Center */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenNewExpense={() => setIsTransactionModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isFreeCashAchieved={metrics.isFreeCashAchieved}
        currentFreeCash={metrics.currentFreeCash}
        urgentAlertsCount={urgentAlertsCount}
        onExecuteQuinzenalTransfer={() =>
          handleExecuteProlaboreTransfer(
            2500,
            'Repasse Quinzenal de Pró-labore (Regra Caixa Livre ≥ R$ 2.500)'
          )
        }
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            transactions={transactions}
            projects={projects}
            profile={profile}
            onUpdateProfile={setProfile}
            onOpenNewProject={() => setIsNewProjectModalOpen(true)}
            onOpenReceivePayment={(proj) => setPaymentModalProject(proj)}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            onDeleteProject={handleDeleteProject}
            onExecuteProlaboreTransfer={handleExecuteProlaboreTransfer}
            phones={phones}
            saasSubscribers={saasSubscribers}
            fixedClients={fixedClients}
            onNavigateToStreams={() => setActiveTab('streams')}
            onCollectFixedClient={handleCollectFixedClient}
            onCollectSaaS={handleCollectSaaS}
            onPayTaxes={handlePayTaxes}
            onPayRent={handlePayRent}
          />
        )}

        {activeTab === 'streams' && (
          <RevenueStreamsHub
            phones={phones}
            setPhones={setPhones}
            saasSubscribers={saasSubscribers}
            setSaaSSubscribers={setSaaSSubscribers}
            fixedClients={fixedClients}
            setFixedClients={setFixedClients}
            transactions={transactions}
            projects={projects}
            profile={profile}
            onAddTransaction={handleAddTransaction}
            onOpenNewProject={() => setIsNewProjectModalOpen(true)}
          />
        )}

        {activeTab === 'goals' && (() => {
          const chartData = generateCashFlowChartData(metrics);

          return (
            <div className="space-y-6">
              <GrowthGoalsManager
                transactions={transactions}
                projects={projects}
                profile={profile}
                onUpdateProfile={setProfile}
                onOpenNewProject={() => setIsNewProjectModalOpen(true)}
              />

              <CashFlowProjectionChart
                data={chartData}
                totalRealized={metrics.monthIncomeCompleted}
                totalProjected={metrics.forecastMonthRevenue}
                totalTarget={metrics.totalTargetMonthRevenue}
                targetProfit={profile.targetCompanyProfit}
                targetProlabore={profile.targetProlabore}
              />
            </div>
          );
        })()}

        {activeTab === 'cashflow' && (
          <TransactionsManager
            transactions={transactions}
            onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
            onToggleStatus={handleToggleStatus}
            onDeleteTransaction={handleDeleteTransaction}
            onExportCSV={handleExportCSV}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span>GestorFluxo Dev · Meta: R$ 8k Lucro PJ / R$ 5k Pró-labore</span>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Ajustar Metas</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSave={handleAddProject}
      />

      <ReceivePaymentModal
        project={paymentModalProject}
        onClose={() => setPaymentModalProject(null)}
        onConfirm={handleReceivePayment}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleAddTransaction}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
        onResetToDemo={handleResetToDemo}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
