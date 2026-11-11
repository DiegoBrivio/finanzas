import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { InvoiceType, InvoiceStatus } from '../../types/finance';
import { InvoiceModal } from './InvoiceModal';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';

export const InvoiceTable: React.FC = () => {
  const { invoices, updateInvoiceStatus, removeInvoice, formatMoney } = useFinance();
  const [activeTab, setActiveTab] = useState<InvoiceType>('receivable');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredInvoices = invoices.filter(inv => inv.type === activeTab);

  // Stats
  const totalReceivablePending = invoices
    .filter(i => i.type === 'receivable' && i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalOverdue = invoices
    .filter(i => i.type === 'receivable' && i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalPayablePending = invoices
    .filter(i => i.type === 'payable' && i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" size="sm" dot>Cobrada / Pagada</Badge>;
      case 'overdue':
        return <Badge variant="danger" size="sm" dot>Vencida (Mora)</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning" size="sm" dot>Pendiente</Badge>;
    }
  };

  return (
    <div className="invoices-view">
      {/* Overview Cards */}
      <div className="invoices-stats-grid">
        <Card className="invoice-stat-card">
          <CardContent>
            <div className="invoice-stat-icon text-income">
              <Icon name="arrow-down-left" size={24} />
            </div>
            <div>
              <span className="stat-label">Cuentas por Cobrar Pendientes</span>
              <div className="stat-val text-income">{formatMoney(totalReceivablePending)}</div>
              <span className="stat-sub">Facturas emitidas a clientes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="invoice-stat-card">
          <CardContent>
            <div className="invoice-stat-icon text-expense">
              <Icon name="alert-circle" size={24} />
            </div>
            <div>
              <span className="stat-label">Cuentas Vencidas (Mora)</span>
              <div className="stat-val text-expense">{formatMoney(totalOverdue)}</div>
              <span className="stat-sub">Requieren gestión de cobranza urgente</span>
            </div>
          </CardContent>
        </Card>

        <Card className="invoice-stat-card">
          <CardContent>
            <div className="invoice-stat-icon text-muted">
              <Icon name="arrow-up-right" size={24} />
            </div>
            <div>
              <span className="stat-label">Cuentas por Pagar a Proveedores</span>
              <div className="stat-val text-expense">{formatMoney(totalPayablePending)}</div>
              <span className="stat-sub">Compromisos de pago asumidos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Header & Tabs */}
      <div className="invoices-action-bar">
        <div className="invoices-subtabs">
          <button
            type="button"
            className={`subtab-btn ${activeTab === 'receivable' ? 'active' : ''}`}
            onClick={() => setActiveTab('receivable')}
          >
            <Icon name="file-text" size={16} />
            <span>Por Cobrar (Clientes)</span>
            <span className="subtab-count">
              {invoices.filter(i => i.type === 'receivable').length}
            </span>
          </button>
          <button
            type="button"
            className={`subtab-btn ${activeTab === 'payable' ? 'active' : ''}`}
            onClick={() => setActiveTab('payable')}
          >
            <Icon name="credit-card" size={16} />
            <span>Por Pagar (Proveedores)</span>
            <span className="subtab-count">
              {invoices.filter(i => i.type === 'payable').length}
            </span>
          </button>
        </div>

        <Button
          variant="success"
          icon="plus"
          onClick={() => setIsModalOpen(true)}
        >
          {activeTab === 'receivable' ? 'Emitir Factura a Cliente' : 'Registrar Factura Proveedor'}
        </Button>
      </div>

      {/* Invoices Table */}
      <Card className="table-card">
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="empty-state-large">
              <Icon name="file-text" size={40} />
              <h3>No hay facturas registradas</h3>
              <p>Comienza registrando tus cuentas por cobrar o facturas de proveedores.</p>
              <Button variant="primary" icon="plus" onClick={() => setIsModalOpen(true)}>
                Registrar Factura
              </Button>
            </div>
          ) : (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nº Factura</th>
                    <th>{activeTab === 'receivable' ? 'Cliente' : 'Proveedor'}</th>
                    <th>Emisión</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                    <th className="text-right">Monto Bruto</th>
                    <th className="text-right">IVA Est.</th>
                    <th className="text-center">Cambiar Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => {
                    return (
                      <tr key={inv.id}>
                        <td className="font-mono font-semibold">{inv.invoice_number}</td>
                        <td>
                          <div className="entity-info">
                            <span className="font-medium">{inv.entity_name}</span>
                            {inv.notes && <span className="entity-notes">{inv.notes}</span>}
                          </div>
                        </td>
                        <td className="text-muted">{inv.issue_date}</td>
                        <td className="font-mono">
                          <span className={inv.status === 'overdue' ? 'text-expense font-semibold' : 'text-muted'}>
                            {inv.due_date}
                          </span>
                        </td>
                        <td>{getStatusBadge(inv.status)}</td>
                        <td className="text-right font-semibold">
                          {formatMoney(inv.amount)}
                        </td>
                        <td className="text-right text-muted font-mono">
                          {formatMoney(inv.tax_amount || 0)}
                        </td>
                        <td className="text-center">
                          {inv.status !== 'paid' ? (
                            <Button
                              variant="success"
                              size="sm"
                              icon="check-circle"
                              onClick={() => {
                                updateInvoiceStatus(inv.id, 'paid');
                              }}
                              title="Marcar como pagada y registrar ingreso en cuenta"
                            >
                              Marcar Pagada
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateInvoiceStatus(inv.id, 'pending')}
                              title="Reabrir factura"
                            >
                              Reabrir
                            </Button>
                          )}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="table-action-btn delete-btn"
                            title="Eliminar factura"
                            onClick={() => {
                              if (window.confirm(`¿Seguro de eliminar la factura ${inv.invoice_number}?`)) {
                                removeInvoice(inv.id);
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

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={activeTab}
      />
    </div>
  );
};
