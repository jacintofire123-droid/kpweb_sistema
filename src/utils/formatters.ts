/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, WebProject, BusinessProfile } from '../types';

export function formatBRL(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(1).replace('.', ',')}%`;
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export interface DayRevenue {
  dayNumber: number;
  dateStr: string;
  amount: number;
  cumulative: number;
}

export function calculateWebAgencyMetrics(
  transactions: Transaction[],
  projects: WebProject[],
  profile: BusinessProfile,
  filterMonth?: string
) {
  const currentMonth = filterMonth || new Date().toISOString().slice(0, 7);
  const pjTransactions = transactions.filter((t) => t.scope === 'PJ');

  // Realized income in this month
  const monthIncomeCompleted = pjTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => acc + t.amount, 0);

  // Realized operational expenses in this month (excluding pro-labore transfers)
  const monthOperacaoExpenses = pjTransactions
    .filter((t) => t.type === 'expense' && t.category !== 'Pró-labore' && t.status === 'completed' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => acc + t.amount, 0);

  // Total pro-labore transferred so far this month
  const monthProlaboreTransferred = pjTransactions
    .filter((t) => t.type === 'expense' && t.category === 'Pró-labore' && t.status === 'completed' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => acc + t.amount, 0);

  // Pending income from transactions or projects due in this month
  const monthPendingIncome = pjTransactions
    .filter((t) => t.type === 'income' && t.status === 'pending' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => acc + t.amount, 0);

  const monthPendingExpenses = pjTransactions
    .filter((t) => t.type === 'expense' && t.status === 'pending' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => acc + t.amount, 0);

  // Total company net cash position
  const allCompletedIncome = pjTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const allCompletedExpenses = pjTransactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentFreeCash = Math.max(0, profile.initialCashBalance + allCompletedIncome - allCompletedExpenses);

  // Free cash goal progress (target: R$ 2.500)
  const freeCashProgressPct = Math.min(100, (currentFreeCash / (profile.freeCashThreshold || 2500)) * 100);
  const isFreeCashAchieved = currentFreeCash >= (profile.freeCashThreshold || 2500);

  // Pipeline metrics from Web Projects
  const totalInDev = projects
    .filter((p) => p.status === 'em_desenvolvimento')
    .reduce((acc, p) => acc + (p.totalValue - p.receivedAmount), 0);

  const totalDeliveredWaitingPayment = projects
    .filter((p) => p.status === 'entregue_aguardando')
    .reduce((acc, p) => acc + (p.totalValue - p.receivedAmount), 0);

  const totalProjectedReceivables = totalInDev + totalDeliveredWaitingPayment;

  // Month-end Forecast:
  const forecastMonthRevenue = monthIncomeCompleted + monthPendingIncome + totalProjectedReceivables;
  const forecastMonthExpenses = monthOperacaoExpenses + monthPendingExpenses;
  const forecastCompanyProfit = Math.max(0, forecastMonthRevenue - forecastMonthExpenses - profile.targetProlabore);

  // Progress towards user's two major goals:
  const prolaboreProgressPct = Math.min(100, (monthProlaboreTransferred / (profile.targetProlabore || 5000)) * 100);
  const companyProfitProgressPct = Math.min(100, (forecastCompanyProfit / (profile.targetCompanyProfit || 8000)) * 100);

  // Daily revenue breakdown for the month
  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayDate = new Date();
  const isCurrentMonth = todayDate.getFullYear() === year && (todayDate.getMonth() + 1) === month;
  const currentDay = isCurrentMonth ? todayDate.getDate() : daysInMonth;

  const dailyMap: { [day: number]: number } = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap[d] = 0;
  }

  pjTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed' && t.date.startsWith(currentMonth))
    .forEach((t) => {
      const day = parseInt(t.date.split('-')[2], 10);
      if (day >= 1 && day <= daysInMonth) {
        dailyMap[day] = (dailyMap[day] || 0) + t.amount;
      }
    });

  let runningTotal = 0;
  const dailyData: DayRevenue[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayAmount = dailyMap[d] || 0;
    runningTotal += dayAmount;
    dailyData.push({
      dayNumber: d,
      dateStr: `${String(d).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
      amount: dayAmount,
      cumulative: runningTotal,
    });
  }

  const averageDailyRealized = currentDay > 0 ? monthIncomeCompleted / currentDay : 0;
  const totalTargetMonthRevenue =
    profile.targetMonthlyRevenue ||
    (profile.targetCompanyProfit || 8000) + (profile.targetProlabore || 5000) + (profile.monthlyFixedCostTarget || 0);
  const targetDailyRevenue = totalTargetMonthRevenue / daysInMonth;

  // Net profit metrics
  const monthNetProfitRealized = monthIncomeCompleted - monthOperacaoExpenses - monthProlaboreTransferred;
  const revenueProgressRealizedPct = totalTargetMonthRevenue > 0 ? (monthIncomeCompleted / totalTargetMonthRevenue) * 100 : 0;
  const revenueProgressForecastPct = totalTargetMonthRevenue > 0 ? (forecastMonthRevenue / totalTargetMonthRevenue) * 100 : 0;
  const profitTarget = profile.targetCompanyProfit || 8000;
  const profitProgressRealizedPct = profitTarget > 0 ? (Math.max(0, monthNetProfitRealized) / profitTarget) * 100 : 0;
  const profitProgressForecastPct = profitTarget > 0 ? (Math.max(0, forecastCompanyProfit) / profitTarget) * 100 : 0;

  // Rent check
  const rentTransactions = transactions.filter(
    (t) =>
      t.type === 'expense' &&
      t.date.startsWith(currentMonth) &&
      (t.description.toLowerCase().includes('aluguel') || t.category.toLowerCase().includes('aluguel'))
  );
  const isRentPaid = rentTransactions.some((t) => t.status === 'completed');
  const rentPaidAmount = rentTransactions
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  // Envelopes & Reservas
  const taxesPct = profile.envelopeTaxesPct ?? 6;
  const emergencyPct = profile.envelopeEmergencyPct ?? 10;
  const reinvestmentPct = profile.envelopeReinvestmentPct ?? 10;

  const taxesSeparatedRealized = monthIncomeCompleted * (taxesPct / 100);
  const emergencySeparatedRealized = monthIncomeCompleted * (emergencyPct / 100);
  const reinvestmentSeparatedRealized = monthIncomeCompleted * (reinvestmentPct / 100);

  const taxesSeparatedProjected = forecastMonthRevenue * (taxesPct / 100);
  const emergencySeparatedProjected = forecastMonthRevenue * (emergencyPct / 100);
  const reinvestmentSeparatedProjected = forecastMonthRevenue * (reinvestmentPct / 100);

  const taxesPaidMonth = pjTransactions
    .filter((t) => t.type === 'expense' && t.category === 'Impostos' && t.status === 'completed' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => acc + t.amount, 0);

  const emergencyReserveTarget = (profile.monthlyFixedCostTarget || 1850) * 3;

  return {
    monthIncomeCompleted,
    monthOperacaoExpenses,
    monthProlaboreTransferred,
    monthPendingIncome,
    monthPendingExpenses,
    currentFreeCash,
    freeCashProgressPct,
    isFreeCashAchieved,
    totalInDev,
    totalDeliveredWaitingPayment,
    totalProjectedReceivables,
    forecastMonthRevenue,
    forecastCompanyProfit,
    prolaboreProgressPct,
    companyProfitProgressPct,
    dailyData,
    averageDailyRealized,
    targetDailyRevenue,
    totalTargetMonthRevenue,
    monthNetProfitRealized,
    revenueProgressRealizedPct,
    revenueProgressForecastPct,
    profitTarget,
    profitProgressRealizedPct,
    profitProgressForecastPct,
    daysInMonth,
    currentDay,
    isRentPaid,
    rentPaidAmount,
    taxesPct,
    emergencyPct,
    reinvestmentPct,
    taxesSeparatedRealized,
    emergencySeparatedRealized,
    reinvestmentSeparatedRealized,
    taxesSeparatedProjected,
    emergencySeparatedProjected,
    reinvestmentSeparatedProjected,
    taxesPaidMonth,
    emergencyReserveTarget,
  };
}

export function exportTransactionsToCSV(transactions: Transaction[]): void {
  const headers = ['Data', 'Descricao', 'Tipo', 'Conta', 'Categoria', 'Valor', 'Status', 'Observacoes'];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    t.type === 'income' ? 'Receita' : 'Despesa',
    t.scope,
    `"${t.category}"`,
    t.amount.toFixed(2),
    t.status === 'completed' ? 'Realizado' : 'Previsto',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `extrato_webdev_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateCashFlowChartData(
  metrics: ReturnType<typeof calculateWebAgencyMetrics>
) {
  const daysInMonth = metrics.daysInMonth;
  const currentDay = metrics.currentDay;
  const totalTarget = metrics.totalTargetMonthRevenue;
  const totalProjected = metrics.forecastMonthRevenue;

  const dailyMap: { [day: number]: number } = {};
  metrics.dailyData.forEach((d) => {
    dailyMap[d.dayNumber] = d.amount;
  });

  let runningRealized = 0;
  const chartData = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayIncome = dailyMap[d] || 0;
    runningRealized += dayIncome;

    const metaLinear = Math.round((totalTarget / daysInMonth) * d);

    let projetadoVal = runningRealized;
    if (d > currentDay) {
      const remainingDays = Math.max(1, daysInMonth - currentDay);
      const remainingToAdd = Math.max(0, totalProjected - runningRealized);
      const fraction = (d - currentDay) / remainingDays;
      projetadoVal = Math.round(runningRealized + remainingToAdd * fraction);
    }

    chartData.push({
      day: d,
      label: d === 1 || d % 5 === 0 || d === daysInMonth ? `Dia ${String(d).padStart(2, '0')}` : '',
      realizadoDiario: dayIncome,
      realizadoAcumulado: d <= currentDay ? runningRealized : undefined,
      projetadoAcumulado: projetadoVal,
      metaLinear,
    });
  }

  return chartData;
}
