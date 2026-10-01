/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Transaction, AccountScope, TransactionType } from '../types';
import { formatBRL, formatDateBR } from '../utils/formatters';
import {
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Download,
} from 'lucide-react';

interface TransactionsManagerProps {
  transactions: Transaction[];
  onOpenNewTransaction: () => void;
  onToggleStatus: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCSV: () => void;
}

export const TransactionsManager: React.FC<TransactionsManagerProps> = ({
  transactions,
  onOpenNewTransaction,
  onToggleStatus,
  onDeleteTransaction,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | AccountScope>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (
        searchTerm &&
        !tx.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tx.category.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(tx.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (scopeFilter !== 'all' && tx.scope !== scopeFilter) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, typeFilter, scopeFilter]);

  const totalIn = filteredTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOut = filteredTransactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Extrato Financeiro</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Entradas de sites e despesas da empresa (PJ) e pessoais (PF)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            + Lançamento
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Clean segment buttons */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                typeFilter === 'income' ? 'bg-white text-emerald-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                typeFilter === 'expense' ? 'bg-white text-rose-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Despesas
            </button>
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setScopeFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                scopeFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PJ + PF
            </button>
            <button
              onClick={() => setScopeFilter('PJ')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                scopeFilter === 'PJ' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Apenas PJ
            </button>
            <button
              onClick={() => setScopeFilter('PF')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                scopeFilter === 'PF' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Apenas PF
            </button>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex items-center justify-between text-xs px-3.5 py-2.5 bg-white rounded-lg border border-slate-200 font-mono shadow-2xs">
        <span className="text-slate-600">
          Entradas: <strong className="text-emerald-600">{formatBRL(totalIn)}</strong>
        </span>
        <span className="text-slate-600">
          Saídas: <strong className="text-rose-600">{formatBRL(totalOut)}</strong>
        </span>
        <span className="text-slate-600">
          Saldo Líquido:{' '}
          <strong className={totalIn - totalOut >= 0 ? 'text-slate-900 font-bold' : 'text-rose-600 font-bold'}>
            {formatBRL(totalIn - totalOut)}
          </strong>
        </span>
      </div>

      {/* Clean Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-medium text-[11px] bg-slate-50">
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3">Descrição</th>
              <th className="py-2.5 px-3">Conta</th>
              <th className="py-2.5 px-3">Categoria</th>
              <th className="py-2.5 px-3 text-right">Valor</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isCompleted = tx.status === 'completed';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {formatDateBR(tx.date)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 font-medium max-w-xs">
                      <div className="flex items-center gap-1.5">
                        {isIncome ? (
                          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        )}
                        <span className="truncate">{tx.description}</span>
                      </div>
                      {tx.notes && (
                        <span className="text-[10px] text-slate-400 block truncate pl-5">
                          {tx.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <span className={tx.scope === 'PJ' ? 'text-blue-700 font-semibold' : 'text-slate-600'}>
                        {tx.scope}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                      {tx.category}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(tx.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                          isCompleted
                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                            : 'border-amber-200 text-amber-700 bg-amber-50'
                        }`}
                      >
                        {isCompleted ? 'Pago' : 'A Vencer'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
