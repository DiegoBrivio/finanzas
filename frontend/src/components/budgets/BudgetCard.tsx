import React from 'react';
import type { Budget } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';

interface BudgetCardProps {
  budget: Budget;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget }) => {
  const { formatMoney, removeBudget } = useFinance();

  const spent = budget.spent || 0;
  const limit = budget.monthly_limit;
  const percentage = budget.percentage || 0;
  const remaining = Math.max(0, limit - spent);

  return (
    <Card className={`budget-card ${budget.isExceeded ? 'budget-exceeded' : ''}`}>
      <CardContent>
        <div className="budget-card-header">
          <div>
            <h4 className="budget-category-title">{budget.category}</h4>
            <span className="budget-period-text">Límite Mensual</span>
          </div>
          <div className="budget-badges">
            {budget.isExceeded ? (
              <Badge variant="danger" size="sm" dot>
                Excedido en {formatMoney(spent - limit)}
              </Badge>
            ) : budget.isNearLimit ? (
              <Badge variant="warning" size="sm" dot>
                Cerca del Límite ({percentage}%)
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                En Meta ({percentage}%)
              </Badge>
            )}
            <button
              type="button"
              className="budget-delete-btn"
              title="Eliminar presupuesto"
              onClick={() => {
                if (window.confirm(`¿Eliminar presupuesto para ${budget.category}?`)) {
                  removeBudget(budget.id);
                }
              }}
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>

        <div className="budget-amounts-row">
          <div className="budget-amount-item">
            <span className="amount-label">Gastado</span>
            <span className={`amount-value ${budget.isExceeded ? 'text-expense' : ''}`}>
              {formatMoney(spent)}
            </span>
          </div>
          <div className="budget-amount-divider">/</div>
          <div className="budget-amount-item">
            <span className="amount-label">Límite</span>
            <span className="amount-value text-muted">{formatMoney(limit)}</span>
          </div>
          <div className="budget-amount-item ml-auto text-right">
            <span className="amount-label">{budget.isExceeded ? 'Exceso' : 'Disponible'}</span>
            <span className={`amount-value font-semibold ${budget.isExceeded ? 'text-expense' : 'text-income'}`}>
              {budget.isExceeded ? `-${formatMoney(spent - limit)}` : formatMoney(remaining)}
            </span>
          </div>
        </div>

        <ProgressBar
          value={percentage}
          height={10}
          color={budget.isExceeded ? 'danger' : budget.isNearLimit ? 'warning' : 'primary'}
          showLabel
        />
      </CardContent>
    </Card>
  );
};
