import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { InvoiceType, InvoiceStatus } from '../../types/finance';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: InvoiceType;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'receivable'
}) => {
  const { addInvoice } = useFinance();

  const [type, setType] = useState<InvoiceType>(defaultType);
  const [invoiceNumber, setInvoiceNumber] = useState(`FAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [entityName, setEntityName] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState('16'); // 16% IVA default
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<InvoiceStatus>('pending');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    if (!entityName.trim()) {
      setError('El nombre del cliente o proveedor es obligatorio');
      return;
    }

    const calculatedTax = (numAmount * (parseFloat(taxRate) || 0)) / 100;

    try {
      setSubmitting(true);
      await addInvoice({
        profile_id: '',
        type,
        invoice_number: invoiceNumber.trim(),
        entity_name: entityName.trim(),
        amount: numAmount,
        tax_amount: calculatedTax,
        issue_date: issueDate,
        due_date: dueDate,
        status,
        notes: notes.trim()
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar factura');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'receivable' ? 'Emitir Factura a Cliente' : 'Registrar Factura de Proveedor'}
      subtitle="Control de cuentas corporativas por cobrar y pagar"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-alert-error">{error}</div>}

        <div className="type-toggle-pills mb-4">
          <button
            type="button"
            className={`type-pill ${type === 'receivable' ? 'active income' : ''}`}
            onClick={() => setType('receivable')}
          >
            📥 Por Cobrar (Factura a Cliente)
          </button>
          <button
            type="button"
            className={`type-pill ${type === 'payable' ? 'active expense' : ''}`}
            onClick={() => setType('payable')}
          >
            📤 Por Pagar (Factura Proveedor)
          </button>
        </div>

        <div className="form-row-2">
          <Input
            label="Número de Factura"
            placeholder="FAC-2026-001"
            value={invoiceNumber}
            onChange={e => setInvoiceNumber(e.target.value)}
            required
          />

          <Input
            label={type === 'receivable' ? 'Nombre del Cliente' : 'Nombre del Proveedor'}
            placeholder={type === 'receivable' ? 'Ej: Empresa Global S.A.' : 'Ej: AWS EMEA'}
            value={entityName}
            onChange={e => setEntityName(e.target.value)}
            required
          />
        </div>

        <div className="form-row-2">
          <Input
            label="Monto Total ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />

          <Select
            label="Tasa de Impuesto / IVA"
            value={taxRate}
            onChange={e => setTaxRate(e.target.value)}
            options={[
              { value: '0', label: '0% Exento de IVA' },
              { value: '10', label: '10% Reducido' },
              { value: '16', label: '16% Estándar' },
              { value: '21', label: '21% General' }
            ]}
          />
        </div>

        <div className="form-row-2">
          <Input
            label="Fecha de Emisión"
            type="date"
            value={issueDate}
            onChange={e => setIssueDate(e.target.value)}
            required
          />

          <Input
            label="Fecha de Vencimiento"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            required
          />
        </div>

        <Select
          label="Estado Inicial de la Factura"
          value={status}
          onChange={e => setStatus(e.target.value as InvoiceStatus)}
          options={[
            { value: 'pending', label: '⏳ Pendiente de Pago' },
            { value: 'paid', label: '✅ Pagada / Cobrada' },
            { value: 'overdue', label: '⚠️ Vencida (En Mora)' }
          ]}
        />

        <div className="form-group">
          <label className="form-label">Concepto o Notas del Servicio</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Detalle de ítems, términos comerciales, orden de compra..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-actions-row">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" loading={submitting}>
            Guardar Factura
          </Button>
        </div>
      </form>
    </Modal>
  );
};
