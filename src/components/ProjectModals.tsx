/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WebProject, ProjectStatus } from '../types';
import { formatBRL } from '../utils/formatters';
import { X } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (proj: Omit<WebProject, 'id'>, generateIncome: boolean) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Site Institucional');
  const [totalValue, setTotalValue] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalValue.replace(',', '.'));
    const received = parseFloat(receivedAmount.replace(',', '.')) || 0;
    if (!clientName.trim() || !projectName.trim() || isNaN(total) || total <= 0) return;

    let status: ProjectStatus = 'em_desenvolvimento';
    if (received >= total) status = 'pago';

    onSave(
      {
        clientName: clientName.trim(),
        projectName: projectName.trim(),
        projectType,
        totalValue: total,
        receivedAmount: received,
        startDate: new Date().toISOString().slice(0, 10),
        deliveryDate: deliveryDate || new Date().toISOString().slice(0, 10),
        status,
      },
      received > 0
    );

    setClientName('');
    setProjectName('');
    setTotalValue('');
    setReceivedAmount('');
    setDeliveryDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Venda de Site</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Nome do Cliente</label>
            <input
              type="text"
              required
              placeholder="Ex: Clínica Odontológica Dr. Silva"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Título do Projeto</label>
            <input
              type="text"
              required
              placeholder="Ex: Site Institucional + Agendamento"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Valor Total (R$)</label>
              <input
                type="number"
                step="50"
                required
                placeholder="Ex: 3500"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-blue-700 font-medium mb-1">Entrada Paga (R$)</label>
              <input
                type="number"
                step="50"
                placeholder="Ex: 1750 (50%)"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-blue-700 font-mono focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tipo de Site</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="Site Institucional">Site Institucional</option>
                <option value="Landing Page">Landing Page</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Sistema Web">Sistema Web</option>
                <option value="Manutenção">Manutenção Mensal</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Prazo de Entrega</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
              />
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
              Salvar Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ReceivePaymentModalProps {
  project: WebProject | null;
  onClose: () => void;
  onConfirm: (projectId: string, amount: number, note: string) => void;
}

export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  project,
  onClose,
  onConfirm,
}) => {
  if (!project) return null;

  const pending = Math.max(0, project.totalValue - project.receivedAmount);
  const [amount, setAmount] = useState<string>(pending.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;

    onConfirm(
      project.id,
      parsed,
      `Recebimento de saldo do site ${project.projectName}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Receber Saldo do Site</h4>
            <span className="text-[11px] text-slate-500">{project.projectName}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Valor Recebido (R$)
            </label>
            <input
              type="number"
              step="50"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-blue-700 font-mono text-sm focus:bg-white focus:border-blue-600 focus:outline-none tabular-nums font-bold"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Saldo em aberto total: {formatBRL(pending)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
              Confirmar Recebimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
