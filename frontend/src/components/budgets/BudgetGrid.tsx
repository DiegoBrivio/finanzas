import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { BudgetCard } from './BudgetCard';
import { BudgetModal } from './BudgetModal';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export const BudgetGrid: React.FC = () => {
  const { budgets, formatMoney, isCompany } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalLimit = budgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overallPercentage = totalLimit > 0 ? Number(((totalSpent / totalLimit) * 100).toFixed(1)) : 0;

  return (
    <div className="budgets-view">
      {/* Overview Metric Header */}
      <div className="budgets-overview-grid">
        <Card className="budget-stat-box">
          <CardContent>
            <span className="stat-box-title">Presupuesto Asignado Total</span>
            <div className="stat-box-num">{formatMoney(totalLimit)}</div>
            <span className="stat-box-desc">Suma de límites fijados para este mes</span>
          </CardContent>
        </Card>

        <Card className="budget-stat-box">
          <CardContent>
            <span className="stat-box-title">Total Consumido a la Fecha</span>
            <div className={`stat-box-num ${totalSpent > totalLimit ? 'text-expense' : ''}`}>
              {formatMoney(totalSpent)}
            </div>
            <span className="stat-box-desc">{overallPercentage}% del presupuesto global</span>
          </CardContent>
        </Card>

        <Card className="budget-stat-box">
          <CardContent>
            <span className="stat-box-title">Margen Remanente Disponible</span>
            <div className={`stat-box-num ${totalRemaining === 0 ? 'text-expense' : 'text-income'}`}>
              {formatMoney(totalRemaining)}
            </div>
            <span className="stat-box-desc">Disponible para gastar sin excederse</span>
          </CardContent>
        </Card>
      </div>

      {/* Action Header */}
      <div className="budgets-action-bar">
        <div>
          <h2 className="section-title">
            {isCompany ? 'Centros de Costo y Techos de Gasto' : 'Presupuestos por Categoría'}
          </h2>
          <p className="section-subtitle">
            Monitorea el gasto en tiempo real y recibe advertencias antes de exceder el límite establecido.
          </p>
        </div>

        <Button
          variant={isCompany ? 'success' : 'primary'}
          icon="plus"
          onClick={() => setIsModalOpen(true)}
        >
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent>
            <div className="empty-state-large">
              <Icon name="layers" size={40} />
              <h3>No tienes presupuestos configurados</h3>
              <p>Establece límites de gasto mensuales para mantener tus finanzas bajo control.</p>
              <Button variant="primary" icon="plus" onClick={() => setIsModalOpen(true)}>
                Crear Mi Primer Presupuesto
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="budgets-cards-grid">
          {budgets.map(b => (
            <BudgetCard key={b.id} budget={b} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <BudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

