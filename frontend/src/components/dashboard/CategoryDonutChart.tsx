import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export const CategoryDonutChart: React.FC = () => {
  const { summary, formatMoney, isCompany } = useFinance();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = summary?.categoryBreakdown || [];

  if (categories.length === 0) {
    return (
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>{isCompany ? 'Estructura de Costos' : 'Desglose por Categoría'}</CardTitle>
          <CardDescription>Distribución porcentual de gastos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="empty-chart-state">
            <span className="empty-chart-icon">🍩</span>
            <p className="font-semibold text-primary">Sin gastos registrados</p>
            <p className="text-sm text-muted">A medida que registres egresos, verás aquí el desglose visual por categoría.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalExpense = categories.reduce((sum, c) => sum + c.amount, 0);

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <Card className="chart-card">
      <CardHeader>
        <CardTitle>{isCompany ? 'Estructura de Costos' : 'Desglose por Categoría'}</CardTitle>
        <CardDescription>
          {isCompany ? 'Distribución porcentual del OPEX' : 'En qué se gasta tu dinero'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="donut-layout">
          <div className="donut-svg-wrapper">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--bg-subtle, #f1f5f9)"
                strokeWidth={strokeWidth}
              />
              {categories.map(cat => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += cat.percentage;
                const isHovered = activeCategory === cat.category;

                return (
                  <circle
                    key={cat.category}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="donut-segment"
                    onMouseEnter={() => setActiveCategory(cat.category)}
                    onMouseLeave={() => setActiveCategory(null)}
                    style={{ transition: 'stroke-width 0.2s ease' }}
                  />
                );
              })}
            </svg>
            <div className="donut-center-text">
              <span className="donut-center-label">Total</span>
              <span className="donut-center-value">{formatMoney(totalExpense)}</span>
            </div>
          </div>

          <div className="donut-legend-list">
            {categories.slice(0, 5).map(cat => {
              const isHovered = activeCategory === cat.category;
              return (
                <div
                  key={cat.category}
                  className={`donut-legend-row ${isHovered ? 'active' : ''}`}
                  onMouseEnter={() => setActiveCategory(cat.category)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <div className="legend-row-left">
                    <span className="donut-legend-pill" style={{ backgroundColor: cat.color }} />
                    <span className="donut-legend-name">{cat.category}</span>
                  </div>
                  <div className="legend-row-right">
                    <span className="donut-legend-amount">{formatMoney(cat.amount)}</span>
                    <span className="donut-legend-pct">{cat.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

