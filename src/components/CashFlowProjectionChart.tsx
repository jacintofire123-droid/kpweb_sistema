/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { formatBRL } from '../utils/formatters';
import { Target, TrendingUp, DollarSign } from 'lucide-react';

export interface CashFlowChartItem {
  day: number;
  label: string;
  realizadoDiario: number;
  realizadoAcumulado?: number;
  projetadoAcumulado: number;
  metaLinear: number;
}

interface CashFlowProjectionChartProps {
  data: CashFlowChartItem[];
  totalRealized: number;
  totalProjected: number;
  totalTarget: number;
  targetProfit: number;
  targetProlabore: number;
}

export const CashFlowProjectionChart: React.FC<CashFlowProjectionChartProps> = ({
  data,
  totalRealized,
  totalProjected,
  totalTarget,
  targetProfit,
  targetProlabore,
}) => {
  const percentRealized = totalTarget > 0 ? (totalRealized / totalTarget) * 100 : 0;
  const percentProjected = totalTarget > 0 ? (totalProjected / totalTarget) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      {/* Header with Title and Comparison Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              Fluxo de Caixa Projetado vs Meta Mensal
            </span>
            <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
              Mês Vigente
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparação da evolução real das entradas contra a meta de R$ {targetProfit.toLocaleString('pt-BR')} (Lucro) + R$ {targetProlabore.toLocaleString('pt-BR')} (Pró-labore)
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Realizado</span>
            <span className="text-slate-900 font-bold text-sm tabular-nums">
              {formatBRL(totalRealized)}
            </span>
            <span className="text-[10px] text-emerald-600 block">
              {percentRealized.toFixed(0)}% da meta
            </span>
          </div>

          <div className="border-l border-slate-200 pl-3 sm:pl-5">
            <span className="text-[10px] text-slate-400 block font-sans">Projetado (Fim do Mês)</span>
            <span className="text-blue-700 font-bold text-sm tabular-nums">
              {formatBRL(totalProjected)}
            </span>
            <span className="text-[10px] text-blue-600 block">
              {percentProjected.toFixed(0)}% da meta
            </span>
          </div>

          <div className="border-l border-slate-200 pl-3 sm:pl-5">
            <span className="text-[10px] text-slate-400 block font-sans">Meta Estabelecida</span>
            <span className="text-slate-600 font-bold text-sm tabular-nums">
              {formatBRL(totalTarget)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              100% alvo
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {/* Gradient for Realized Cash Flow Area */}
              <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />

            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0]?.payload as CashFlowChartItem;

                return (
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
                    <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                      {label}
                    </span>

                    {d.realizadoAcumulado !== undefined && (
                      <div className="flex items-center justify-between text-blue-700">
                        <span>Realizado Acumulado:</span>
                        <span className="font-mono font-bold">{formatBRL(d.realizadoAcumulado)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sky-600">
                      <span>Projetado com Sites:</span>
                      <span className="font-mono font-bold">{formatBRL(d.projetadoAcumulado)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>Meta Linear Alvo:</span>
                      <span className="font-mono">{formatBRL(d.metaLinear)}</span>
                    </div>

                    {d.realizadoDiario > 0 && (
                      <div className="flex items-center justify-between text-emerald-600 pt-1 border-t border-slate-100 font-semibold">
                        <span>Entrada neste dia:</span>
                        <span className="font-mono">+{formatBRL(d.realizadoDiario)}</span>
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />

            {/* Target line across the month */}
            <Line
              type="monotone"
              name="Meta Estabelecida"
              dataKey="metaLinear"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
            />

            {/* Projected total (including receivables) */}
            <Line
              type="monotone"
              name="Fluxo Projetado (Com Saldos)"
              dataKey="projetadoAcumulado"
              stroke="#0284c7"
              strokeWidth={2}
              dot={false}
            />

            {/* Realized cumulative inflow area */}
            <Area
              type="monotone"
              name="Entradas Realizadas"
              dataKey="realizadoAcumulado"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#colorRealizado)"
              dot={{ r: 3, fill: '#2563eb' }}
            />

            {/* Target Ceiling Reference Line */}
            <ReferenceLine
              y={totalTarget}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{
                value: `Meta Final: R$ ${(totalTarget / 1000).toFixed(1)}k`,
                fill: '#059669',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
