import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export const CashFlowChart: React.FC = () => {
  const { summary, formatMoney, isCompany } = useFinance();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = summary?.monthlyTrend || [];
  const hasData = data.some(d => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>{isCompany ? 'Flujo de Caja' : 'Ingresos vs Gastos'}</CardTitle>
          <CardDescription>
            {isCompany ? 'Entradas de capital vs Costos de operación' : 'Comparativa de movimientos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="empty-chart-state">
            <span className="empty-chart-icon">📊</span>
            <p className="font-semibold text-primary">Sin movimientos registrados aún</p>
            <p className="text-sm text-muted">Tus ingresos y gastos aparecerán graficados aquí en cuanto agregues transacciones.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Chart metrics
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1000);
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingBottom = 30;

  const barGroupWidth = (chartWidth - paddingX * 2) / data.length;
  const singleBarWidth = Math.min(28, barGroupWidth * 0.35);

  return (
    <Card className="chart-card">
      <CardHeader>
        <div className="flex-between">
          <div>
            <CardTitle>{isCompany ? 'Flujo de Caja Histórico' : 'Ingresos vs Gastos Mensuales'}</CardTitle>
            <CardDescription>
              {isCompany ? 'Entradas de capital vs Costos de operación' : 'Comparativa de los últimos meses'}
            </CardDescription>
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot dot-income" /> Ingresos</span>
            <span className="legend-item"><span className="legend-dot dot-expense" /> Gastos</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="chart-wrapper">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`}
            className="cashflow-svg"
            preserveAspectRatio="none"
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = chartHeight * (1 - pct);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="var(--border-color, #e2e8f0)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 4}
                    fontSize="10"
                    fill="var(--text-muted, #94a3b8)"
                    textAnchor="end"
                  >
                    {Math.round((maxVal * pct) / 1000)}k
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((item, idx) => {
              const groupCenterX = paddingX + idx * barGroupWidth + barGroupWidth / 2;
              const incomeHeight = (item.income / maxVal) * chartHeight;
              const expenseHeight = (item.expense / maxVal) * chartHeight;

              const incomeX = groupCenterX - singleBarWidth - 2;
              const expenseX = groupCenterX + 2;

              const isHovered = hoveredIndex === idx;

              return (
                <g 
                  key={item.month}
                  className="bar-group"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Background highlight on hover */}
                  {isHovered && (
                    <rect
                      x={groupCenterX - barGroupWidth / 2}
                      y={0}
                      width={barGroupWidth}
                      height={chartHeight}
                      fill="rgba(99, 102, 241, 0.06)"
                      rx="6"
                    />
                  )}

                  {/* Income bar */}
                  <rect
                    x={incomeX}
                    y={chartHeight - incomeHeight}
                    width={singleBarWidth}
                    height={incomeHeight}
                    rx="4"
                    className="bar bar-income"
                  />

                  {/* Expense bar */}
                  <rect
                    x={expenseX}
                    y={chartHeight - expenseHeight}
                    width={singleBarWidth}
                    height={expenseHeight}
                    rx="4"
                    className="bar bar-expense"
                  />

                  {/* Month label */}
                  <text
                    x={groupCenterX}
                    y={chartHeight + 20}
                    fontSize="11"
                    fontWeight={isHovered ? '600' : '400'}
                    fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                    textAnchor="middle"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div className="chart-tooltip">
              <div className="tooltip-title">{data[hoveredIndex].label}</div>
              <div className="tooltip-row">
                <span className="tooltip-label text-income">● Ingresos:</span>
                <span className="tooltip-val">{formatMoney(data[hoveredIndex].income)}</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label text-expense">● Gastos:</span>
                <span className="tooltip-val">{formatMoney(data[hoveredIndex].expense)}</span>
              </div>
              <div className="tooltip-row tooltip-total">
                <span>{isCompany ? 'Utilidad Neta:' : 'Ahorro Neto:'}</span>
                <span className={`tooltip-val ${data[hoveredIndex].net >= 0 ? 'text-income' : 'text-expense'}`}>
                  {formatMoney(data[hoveredIndex].net)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

