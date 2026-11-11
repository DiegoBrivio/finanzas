import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';

interface TransactionTableProps {
  onOpenNewTx: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ onOpenNewTx }) => {
  const { transactions, removeTransaction, formatMoney, isCompany } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  // Totals for filtered transactions
  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredNet = filteredIncome - filteredExpense;

  // Export CSV helper
  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Cuenta', 'Notas'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.account || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transacciones_${isCompany ? 'empresa' : 'personal'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="transactions-view">
      {/* Top Filter Bar */}
      <Card className="filter-card">
        <CardContent>
          <div className="filter-bar">
            <div className="filter-search-col">
              <Input
                placeholder="Buscar por descripción, concepto o notas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                icon="search"
              />
            </div>

            <div className="filter-select-col">
              <Select
                options={[
                  { value: 'all', label: 'Todos los Tipos' },
                  { value: 'income', label: '🟢 Solo Ingresos' },
                  { value: 'expense', label: '🔴 Solo Gastos' }
                ]}
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
              />
            </div>

            <div className="filter-select-col">
              <Select
                options={[
                  { value: 'all', label: 'Todas las Categorías' },
                  ...categories.map(c => ({ value: c, label: c }))
                ]}
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              />
            </div>

            <div className="filter-actions-col">
              <Button
                variant="outline"
                size="md"
                icon="download"
                onClick={handleExportCSV}
                title="Exportar listado a CSV"
              >
                CSV
              </Button>
              <Button
                variant={isCompany ? 'success' : 'primary'}
                size="md"
                icon="plus"
                onClick={onOpenNewTx}
              >
                Nuevo Movimiento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Stats Bar */}
      <div className="table-stats-bar">
        <div className="stats-bar-item">
          <span className="stats-bar-label">Registros visibles:</span>
          <span className="stats-bar-val">{filteredTransactions.length}</span>
        </div>
        <div className="stats-bar-item">
          <span className="stats-bar-label">Ingresos filtrados:</span>
          <span className="stats-bar-val text-income">+{formatMoney(filteredIncome)}</span>
        </div>
        <div className="stats-bar-item">
          <span className="stats-bar-label">Gastos filtrados:</span>
          <span className="stats-bar-val text-expense">-{formatMoney(filteredExpense)}</span>
        </div>
        <div className="stats-bar-item">
          <span className="stats-bar-label">Balance neto filtrado:</span>
          <span className={`stats-bar-val ${filteredNet >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatMoney(filteredNet)}
          </span>
        </div>
      </div>

      {/* Transactions Table Card */}
      <Card className="table-card">
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="empty-state-large">
              <Icon name="search" size={40} />
              <h3>No se encontraron movimientos</h3>
              <p>Prueba a cambiar los filtros de búsqueda o agrega un nuevo movimiento financiero.</p>
              <Button variant="primary" icon="plus" onClick={onOpenNewTx}>
                Agregar Transacción
              </Button>
            </div>
          ) : (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Cuenta / Método</th>
                    <th className="text-right">Monto</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id}>
                        <td className="font-mono text-muted">{tx.date}</td>
                        <td>
                          <Badge variant={isIncome ? 'success' : 'danger'} size="sm">
                            <Icon name={isIncome ? 'arrow-down-left' : 'arrow-up-right'} size={12} />
                            <span>{isIncome ? 'Ingreso' : 'Gasto'}</span>
                          </Badge>
                        </td>
                        <td>
                          <div className="tx-table-desc">
                            <span className="tx-table-title">{tx.description}</span>
                            {tx.notes && <span className="tx-table-notes">{tx.notes}</span>}
                          </div>
                        </td>
                        <td>
                          <span className="category-pill">{tx.category}</span>
                        </td>
                        <td className="text-muted">{tx.account || 'Cuenta Principal'}</td>
                        <td className={`text-right font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                          {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="table-action-btn delete-btn"
                            title="Eliminar movimiento"
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar '${tx.description}'?`)) {
                                removeTransaction(tx.id);
                              }
                            }}
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
