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

  const totalExpense = categories.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  // Dimensiones SVG
  const size = 180;
  const strokeWidth = 24;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Categoría actualmente seleccionada o hovered
  const hoveredCategoryData = categories.find(c => c.category === activeCategory);

  // Cálculo acumulado exacto basado en montos reales (sin errores de redondeo)
  let accumulatedOffset = 0;

  return (
    <Card className="chart-card">
      <CardHeader>
        <CardTitle>{isCompany ? 'Estructura de Costos' : 'Desglose por Categoría'}</CardTitle>
        <CardDescription>
          {isCompany ? 'Distribución porcentual del OPEX' : 'En qué se distribuye tu dinero'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="donut-layout">
          <div className="donut-svg-wrapper">
            <svg 
              width={size} 
              height={size} 
              viewBox={`0 0 ${size} ${size}`} 
              style={{ overflow: 'visible', display: 'block' }}
            >
              {/* Grupo rotado exactamente sobre el centro del SVG */}
              <g transform={`rotate(-90 ${center} ${center})`}>
                {/* Círculo base de fondo */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="var(--bg-subtle, #e2e8f0)"
                  strokeWidth={strokeWidth}
                />

                {/* Segmentos de la dona */}
                {categories.map(cat => {
                  const amount = Number(cat.amount || 0);
                  const fraction = totalExpense > 0 ? (amount / totalExpense) : 0;
                  const strokeDasharray = `${fraction * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedOffset;
                  accumulatedOffset += fraction * circumference;

                  const isHovered = activeCategory === cat.category;
                  const isAnyHovered = activeCategory !== null;

                  return (
                    <circle
                      key={cat.category}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={cat.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="donut-segment"
                      onMouseEnter={() => setActiveCategory(cat.category)}
                      onMouseLeave={() => setActiveCategory(null)}
                      style={{
                        cursor: 'pointer',
                        transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                        opacity: isAnyHovered ? (isHovered ? 1 : 0.45) : 1
                      }}
                    >
                      <title>{`${cat.category}: ${formatMoney(amount)} (${cat.percentage}%)`}</title>
                    </circle>
                  );
                })}
              </g>
            </svg>

            {/* Texto dinámico central */}
            <div className="donut-center-text" style={{ pointerEvents: 'none' }}>
              <span className="donut-center-label" style={{ maxWidth: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {hoveredCategoryData ? hoveredCategoryData.category : 'Total'}
              </span>
              <span className="donut-center-value">
                {hoveredCategoryData 
                  ? formatMoney(hoveredCategoryData.amount)
                  : formatMoney(totalExpense)}
              </span>
              {hoveredCategoryData && (
                <span style={{ fontSize: '11px', color: hoveredCategoryData.color, fontWeight: 700 }}>
                  {hoveredCategoryData.percentage}%
                </span>
              )}
            </div>
          </div>

          {/* Lista de categorías (leyenda) */}
          <div className="donut-legend-list">
            {categories.slice(0, 6).map(cat => {
              const isHovered = activeCategory === cat.category;
              return (
                <div
                  key={cat.category}
                  className={`donut-legend-row ${isHovered ? 'active' : ''}`}
                  onMouseEnter={() => setActiveCategory(cat.category)}
                  onMouseLeave={() => setActiveCategory(null)}
                  style={{
                    backgroundColor: isHovered ? 'var(--bg-subtle)' : 'transparent',
                    cursor: 'pointer'
                  }}
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
