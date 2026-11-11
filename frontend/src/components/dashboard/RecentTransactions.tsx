import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';

export const RecentTransactions: React.FC = () => {
  const { transactions, formatMoney, setActiveTab } = useFinance();

  const recent = transactions.slice(0, 5);

  return (
    <Card className="recent-tx-card">
      <CardHeader>
        <div className="flex-between">
          <div>
            <CardTitle>Movimientos Recientes</CardTitle>
            <CardDescription>Últimas transacciones registradas</CardDescription>
          </div>
          <button
            type="button"
            className="link-btn"
            onClick={() => setActiveTab('transactions')}
          >
            Ver todas <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {recent.length === 0 ? (
          <div className="empty-tx-placeholder">
            <Icon name="credit-card" size={32} />
            <p>No hay transacciones registradas aún</p>
          </div>
        ) : (
          <div className="recent-tx-list">
            {recent.map(tx => {
              const isIncome = tx.type === 'income';
              return (
                <div key={tx.id} className="recent-tx-item">
                  <div className={`tx-icon-circle ${isIncome ? 'income' : 'expense'}`}>
                    <Icon name={isIncome ? 'arrow-down-left' : 'arrow-up-right'} size={18} />
                  </div>

                  <div className="tx-main-info">
                    <span className="tx-description">{tx.description}</span>
                    <div className="tx-sub-info">
                      <span className="tx-date">{tx.date}</span>
                      <span className="tx-dot">•</span>
                      <Badge variant="neutral" size="sm">{tx.category}</Badge>
                      {tx.account && (
                        <>
                          <span className="tx-dot">•</span>
                          <span className="tx-account">{tx.account}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={`tx-amount-col ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
