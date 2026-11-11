import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';

export const FinancialReports: React.FC = () => {
  const { summary, transactions, formatMoney, isCompany } = useFinance();

  if (!summary) return null;

  const currentYM = new Date().toISOString().slice(0, 7);
  const currentMonthTx = transactions.filter(t => t.date.startsWith(currentYM));
  const hasTransactions = currentMonthTx.length > 0;

  // Export report
  const handleExportReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(summary, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `informe_financiero_${isCompany ? 'empresa' : 'personal'}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-view">
      {/* Top Header */}
      <div className="reports-header-row">
        <div>
          <h2 className="section-title">
            {isCompany ? 'Estado de Resultados (P&L)' : 'Reporte de Salud Financiera'}
          </h2>
          <p className="section-subtitle">
            Análisis cuantitativo de ingresos, gastos y márgenes del período actual.
          </p>
        </div>

        <Button variant="outline" icon="download" onClick={handleExportReport}>
          Exportar JSON
        </Button>
      </div>

      {!hasTransactions ? (
        <Card>
          <CardContent>
            <div className="empty-state-large">
              <Icon name="trending-up" size={40} />
              <h3>Sin movimientos registrados</h3>
              <p>El informe financiero se generará automáticamente en cuanto registres tus primeros ingresos o gastos.</p>
            </div>
          </CardContent>
        </Card>
      ) : isCompany ? (
        /* Empresa P&L and Business Ratios */
        <div className="reports-grid">
          {/* P&L Statement */}
          <Card className="report-card">
            <CardHeader>
              <CardTitle>Estado de Resultados Operativo</CardTitle>
              <CardDescription>Resumen de facturación y costes operacionales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pl-statement">
                <div className="pl-row pl-header-row">
                  <span className="font-semibold text-income">1. Ingresos Operacionales</span>
                  <span className="font-bold text-income">{formatMoney(summary.monthlyIncome)}</span>
                </div>
                <div className="pl-subrows">
                  {currentMonthTx
                    .filter(t => t.type === 'income')
                    .map(t => (
                      <div key={t.id} className="pl-subrow">
                        <span>• {t.description}</span>
                        <span>{formatMoney(t.amount)}</span>
                      </div>
                    ))}
                </div>

                <div className="pl-divider" />

                <div className="pl-row pl-header-row">
                  <span className="font-semibold text-expense">2. Costes de Operación (OPEX)</span>
                  <span className="font-bold text-expense">-{formatMoney(summary.monthlyExpense)}</span>
                </div>
                <div className="pl-subrows">
                  {summary.categoryBreakdown.map(cat => (
                    <div key={cat.category} className="pl-subrow">
                      <span>• {cat.category}</span>
                      <span>{formatMoney(cat.amount)} ({cat.percentage}%)</span>
                    </div>
                  ))}
                </div>

                <div className="pl-divider-double" />

                <div className="pl-row pl-total-row">
                  <span className="font-bold text-lg">Resultado Operativo Neto (EBITDA)</span>
                  <span className={`font-bold text-lg ${summary.monthlyNet >= 0 ? 'text-income' : 'text-expense'}`}>
                    {formatMoney(summary.monthlyNet)}
                  </span>
                </div>
                <div className="pl-subrow text-right">
                  <span className="text-muted">Margen Operativo sobre Ventas:</span>
                  <Badge variant={summary.marginRate >= 20 ? 'success' : 'warning'} size="sm">
                    {summary.marginRate}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Health Ratios */}
          <div className="reports-column">
            <Card className="report-card">
              <CardHeader>
                <CardTitle>Ratios Financieros Clave</CardTitle>
                <CardDescription>Indicadores de solvencia y liquidez</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="ratios-list">
                  <div className="ratio-item">
                    <div className="ratio-info">
                      <span className="ratio-title">Cash Runway (Autonomía)</span>
                      <span className="ratio-desc">Meses de cobertura operativa con saldo en caja</span>
                    </div>
                    <div className="ratio-val-badge">
                      <span className="text-xl font-bold">{summary.runwayMonths} meses</span>
                    </div>
                  </div>

                  <div className="ratio-item">
                    <div className="ratio-info">
                      <span className="ratio-title">Cuentas por Cobrar Pendientes</span>
                      <span className="ratio-desc">Facturas emitidas pendientes de pago</span>
                    </div>
                    <div className="ratio-val-badge">
                      <span className="text-xl font-bold">{formatMoney(summary.pendingReceivables || 0)}</span>
                    </div>
                  </div>

                  <div className="ratio-item">
                    <div className="ratio-info">
                      <span className="ratio-title">Cuentas por Pagar</span>
                      <span className="ratio-desc">Compromisos con proveedores</span>
                    </div>
                    <div className="ratio-val-badge">
                      <span className="text-xl font-bold">{formatMoney(summary.pendingPayables || 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Personal Financial Health & 50/30/20 Rule */
        <div className="reports-grid">
          {/* Income vs Spending summary */}
          <Card className="report-card">
            <CardHeader>
              <CardTitle>Balance y Ahorro</CardTitle>
              <CardDescription>Desglose de ingresos vs gastos del período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pl-statement">
                <div className="pl-row pl-header-row">
                  <span className="font-semibold text-income">Ingresos del Mes</span>
                  <span className="font-bold text-income">{formatMoney(summary.monthlyIncome)}</span>
                </div>

                <div className="pl-subrows">
                  {currentMonthTx
                    .filter(t => t.type === 'income')
                    .map(t => (
                      <div key={t.id} className="pl-subrow">
                        <span>• {t.description} ({t.category})</span>
                        <span>{formatMoney(t.amount)}</span>
                      </div>
                    ))}
                </div>

                <div className="pl-divider" />

                <div className="pl-row pl-header-row">
                  <span className="font-semibold text-expense">Gastos Totales</span>
                  <span className="font-bold text-expense">-{formatMoney(summary.monthlyExpense)}</span>
                </div>

                <div className="pl-subrows">
                  {summary.categoryBreakdown.map(cat => (
                    <div key={cat.category} className="pl-subrow">
                      <span>• {cat.category}</span>
                      <span>{formatMoney(cat.amount)} ({cat.percentage}%)</span>
                    </div>
                  ))}
                </div>

                <div className="pl-divider-double" />

                <div className="pl-row pl-total-row">
                  <span className="font-bold text-lg">Ahorro Neto</span>
                  <span className={`font-bold text-lg ${summary.monthlyNet >= 0 ? 'text-income' : 'text-expense'}`}>
                    {formatMoney(summary.monthlyNet)}
                  </span>
                </div>

                <div className="pl-subrow text-right">
                  <span className="text-muted">Tasa de Ahorro:</span>
                  <Badge variant={Number(summary.savingsRate) >= 20 ? 'success' : 'info'} size="sm">
                    {summary.savingsRate}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 50/30/20 Rule Analysis */}
          <div className="reports-column">
            <Card className="report-card">
              <CardHeader>
                <CardTitle>Distribución de Ingresos (Regla 50 / 30 / 20)</CardTitle>
                <CardDescription>Guía estándar de asignación de finanzas personales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rule-breakdown-list">
                  <div className="rule-item">
                    <div className="rule-top">
                      <span className="font-semibold">🏠 50% Necesidades Básicas</span>
                      <span className="text-sm font-bold">Meta: {formatMoney(summary.monthlyIncome * 0.5)}</span>
                    </div>
                    <div className="rule-bottom">
                      <span>Vivienda, despensa, transporte y servicios</span>
                    </div>
                  </div>

                  <div className="rule-item">
                    <div className="rule-top">
                      <span className="font-semibold">☕ 30% Deseos y Estilo de Vida</span>
                      <span className="text-sm font-bold">Meta: {formatMoney(summary.monthlyIncome * 0.3)}</span>
                    </div>
                    <div className="rule-bottom">
                      <span>Restaurantes, ocio y compras personales</span>
                    </div>
                  </div>

                  <div className="rule-item">
                    <div className="rule-top">
                      <span className="font-semibold">🎯 20% Ahorro e Inversión</span>
                      <span className="text-sm font-bold">Meta: {formatMoney(summary.monthlyIncome * 0.2)}</span>
                    </div>
                    <div className="rule-bottom">
                      <span>Fondo de emergencia, aportes y metas</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
