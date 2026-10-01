/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, TransactionType, AccountScope, TransactionStatus } from '../types';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
}

const DEFAULT_CATEGORIES = {
  income: [
    'Venda de Sites',
    'Clientes Fixos (Manutenção de Sites)',
    'SaaS de PDV (Mensalidades)',
    'Venda de Celular Consertado',
    'Serviço Avulso de Celular',
    'Manutenção & Suporte',
    'Consultoria Web',
    'Outras Receitas',
  ],
  expense: [
    'Compra de Celular Quebrado',
    'Peças & Telas de Celulares',
    'Pró-labore (Salário do Dono)',
    'Aluguel (Residencial / Escritório)',
    'Hospedagem & Servidores (VPS/Vercel)',
    'Softwares & Ferramentas (Figma/AI)',
    'Internet & Telefonia',
    'Impostos (MEI / Simples)',
    'Outras Despesas',
  ],
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [scope, setScope] = useState<AccountScope>('PJ');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES.expense[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TransactionStatus>('completed');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(DEFAULT_CATEGORIES[newType][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!description.trim()) return;

    onSave({
      description: description.trim(),
      amount: parsedAmount,
      type,
      scope,
      category,
      date,
      status,
      notes: notes.trim() || undefined,
    });

    setDescription('');
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Novo Lançamento Financeiro</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-3 rounded-lg border font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Receita (+ Entrou)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-3 rounded-lg border font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Despesa (- Saiu)</span>
            </button>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Aluguel, Servidor Vercel, Entrada de Site"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Conta
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as AccountScope)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="PJ">Conta PJ (Empresa)</option>
                <option value="PF">Conta PF (Pessoal)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                {DEFAULT_CATEGORIES[type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Status
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`flex-1 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                  status === 'completed'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Realizado (Pago)
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`flex-1 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                  status === 'pending'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                A Vencer (Previsto)
              </button>
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
              className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
