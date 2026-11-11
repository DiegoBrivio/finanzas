import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StatCard } from '../ui/StatCard';

export const KpiGrid: React.FC = () => {
  const { summary, formatMoney, isCompany } = useFinance();

  if (!summary) return null;

  if (isCompany) {
    return (
      <div className="kpi-grid">
        <StatCard
          title="Tesorería Total"
          value={formatMoney(summary.totalBalance)}
          subtitle="Saldo disponible en cuentas"
          icon="wallet"
          variant="primary"
        />

        <StatCard
          title="Facturación del Mes"
          value={formatMoney(summary.monthlyIncome)}
          subtitle="Ingresos operacionales"
          icon="trending-up"
          variant="success"
        />

        <StatCard
          title="Gastos Operativos (OPEX)"
          value={formatMoney(summary.monthlyExpense)}
          subtitle="Nóminas, servicios y costes"
          icon="trending-down"
          variant="warning"
        />

        <StatCard
          title="Utilidad Neta (EBITDA)"
          value={formatMoney(summary.monthlyNet)}
          subtitle={`Margen: ${summary.marginRate || 0}%`}
          icon="dollar"
          variant={summary.monthlyNet >= 0 ? 'success' : 'danger'}
        />
      </div>
    );
  }

  // Personal KPIs
  return (
    <div className="kpi-grid">
      <StatCard
        title="Balance Total"
        value={formatMoney(summary.totalBalance)}
        subtitle="Patrimonio neto disponible"
        icon="wallet"
        variant="primary"
      />

      <StatCard
        title="Ingresos del Mes"
        value={formatMoney(summary.monthlyIncome)}
        subtitle="Sueldos, freelance y ventas"
        icon="trending-up"
        variant="success"
      />

      <StatCard
        title="Gastos del Mes"
        value={formatMoney(summary.monthlyExpense)}
        subtitle="Gastos fijos y variables"
        icon="trending-down"
        variant={summary.monthlyExpense > summary.monthlyIncome ? 'danger' : 'warning'}
      />

      <StatCard
        title="Ahorro del Mes"
        value={formatMoney(summary.monthlyNet)}
        subtitle={`Tasa de ahorro: ${summary.savingsRate || 0}%`}
        icon="target"
        variant={summary.monthlyNet >= 0 ? 'success' : 'danger'}
      />
    </div>
  );
};
