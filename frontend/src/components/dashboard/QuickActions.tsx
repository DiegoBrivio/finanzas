import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface QuickActionsProps {
  onOpenNewTx: () => void;
  onOpenNewBudget?: () => void;
  onOpenNewInvoice?: () => void;
  onOpenNewGoal?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenNewTx,
  onOpenNewBudget,
  onOpenNewInvoice,
  onOpenNewGoal
}) => {
  const { isCompany, setActiveTab } = useFinance();

  return (
    <Card className="quick-actions-card">
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="quick-actions-grid">
          <Button
            variant="outline"
            icon="plus"
            onClick={onOpenNewTx}
          >
            Nuevo Gasto/Ingreso
          </Button>

          {isCompany ? (
            <>
              <Button
                variant="outline"
                icon="file-text"
                onClick={() => {
                  if (onOpenNewInvoice) onOpenNewInvoice();
                  else setActiveTab('invoices');
                }}
              >
                Emitir Factura
              </Button>
              <Button
                variant="outline"
                icon="layers"
                onClick={() => {
                  if (onOpenNewBudget) onOpenNewBudget();
                  else setActiveTab('budgets');
                }}
              >
                Ajustar Presupuesto
              </Button>
              <Button
                variant="outline"
                icon="trending-up"
                onClick={() => setActiveTab('reports')}
              >
                Reporte EBITDA
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                icon="target"
                onClick={() => {
                  if (onOpenNewGoal) onOpenNewGoal();
                  else setActiveTab('goals');
                }}
              >
                Nueva Meta
              </Button>
              <Button
                variant="outline"
                icon="layers"
                onClick={() => {
                  if (onOpenNewBudget) onOpenNewBudget();
                  else setActiveTab('budgets');
                }}
              >
                Fijar Límite Gasto
              </Button>
              <Button
                variant="outline"
                icon="pie-chart"
                onClick={() => setActiveTab('reports')}
              >
                Balance Personal
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
