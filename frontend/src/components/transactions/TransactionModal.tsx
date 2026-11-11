import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { TransactionType } from '../../types/finance';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERSONAL_CATEGORIES_INCOME = ['Salario', 'Freelance', 'Inversiones', 'Venta Personal', 'Regalos & Otros'];
const PERSONAL_CATEGORIES_EXPENSE = [
  'Vivienda',
  'Alimentación',
  'Servicios',
  'Transporte',
  'Salud & Bienestar',
  'Ocio & Entretenimiento',
  'Educación',
  'Ropa & Calzado',
  'Ahorro e Inversión',
  'Otros Gastos'
];

const EMPRESA_CATEGORIES_INCOME = [
  'Ventas Software',
  'Servicios Consultoría',
  'Suscripciones SaaS',
  'Venta de Productos',
  'Rendimientos Financieros',
  'Otros Ingresos'
];
const EMPRESA_CATEGORIES_EXPENSE = [
  'Nómina & Sueldos',
  'Infraestructura Cloud',
  'Alquiler Oficina',
  'Marketing & Ads',
  'Software & SaaS',
  'Impuestos & Tasas',
  'Proveedores Externos',
  'Viáticos & Viajes',
  'Operaciones',
  'Servicios Legales & Contables'
];

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, isCompany } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [account, setAccount] = useState<string>(isCompany ? 'Banco Corporativo' : 'Banco Principal');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available categories based on profile and type
  const availableCategories = isCompany
    ? type === 'income' ? EMPRESA_CATEGORIES_INCOME : EMPRESA_CATEGORIES_EXPENSE
    : type === 'income' ? PERSONAL_CATEGORIES_INCOME : PERSONAL_CATEGORIES_EXPENSE;

  // Reset or initialize category on type change
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory('');
    setIsCustomCategory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Por favor selecciona o escribe una categoría');
      return;
    }

    if (!description.trim()) {
      setError('La descripción del movimiento es obligatoria');
      return;
    }

    if (!date) {
      setError('La fecha es obligatoria');
      return;
    }

    try {
      setSubmitting(true);
      await addTransaction({
        profile_id: '',
        type,
        category: finalCategory,
        amount: numAmount,
        description: description.trim(),
        date,
        status: 'completed',
        account,
        notes: notes.trim()
      });

      // Reset form
      setAmount('');
      setDescription('');
      setNotes('');
      setCategory('');
      setCustomCategory('');
      setIsCustomCategory(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la transacción');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Movimiento Financiero"
      subtitle={isCompany ? 'Registrar en libros corporativos' : 'Registrar en finanzas personales'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-alert-error">{error}</div>}

        {/* Type Toggle Pill */}
        <div className="type-toggle-container">
          <label className="form-label">Tipo de Movimiento</label>
          <div className="type-toggle-pills">
            <button
              type="button"
              className={`type-pill ${type === 'expense' ? 'active expense' : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              🔴 Gasto / Egreso
            </button>
            <button
              type="button"
              className={`type-pill ${type === 'income' ? 'active income' : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              🟢 Ingreso
            </button>
          </div>
        </div>

        {/* Amount & Date in 2 columns */}
        <div className="form-row-2">
          <Input
            label="Monto ($)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Fecha"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <Input
          label="Descripción o Concepto"
          type="text"
          placeholder={isCompany ? 'Ej: Factura cliente Acme Inc o Nómina quincenal' : 'Ej: Compra supermercado o Salario mensual'}
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />

        {/* Category & Account */}
        <div className="form-row-2">
          {!isCustomCategory ? (
            <div>
              <Select
                label="Categoría"
                value={category}
                onChange={e => {
                  if (e.target.value === '__custom__') {
                    setIsCustomCategory(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                options={[
                  { value: '', label: '-- Seleccionar Categoría --' },
                  ...availableCategories.map(c => ({ value: c, label: c })),
                  { value: '__custom__', label: '➕ Otra categoría (escribir)...' }
                ]}
              />
            </div>
          ) : (
            <div>
              <Input
                label="Categoría Personalizada"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="Escribe el nombre de la categoría"
                helperText="Haz clic abajo para volver a la lista"
              />
              <button
                type="button"
                className="link-btn text-xs mt-1"
                onClick={() => setIsCustomCategory(false)}
              >
                Volver a categorías predeterminadas
              </button>
            </div>
          )}

          <Select
            label="Cuenta / Método de Pago"
            value={account}
            onChange={e => setAccount(e.target.value)}
            options={
              isCompany
                ? [
                    { value: 'Banco Corporativo', label: 'Banco Corporativo' },
                    { value: 'Tarjeta Corporativa', label: 'Tarjeta Corporativa' },
                    { value: 'Caja Chica', label: 'Caja Chica' },
                    { value: 'Pasarela Stripe/PayPal', label: 'Pasarela Stripe/PayPal' }
                  ]
                : [
                    { value: 'Banco Principal', label: 'Banco Principal' },
                    { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
                    { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
                    { value: 'Efectivo', label: 'Efectivo' },
                    { value: 'Cuenta de Ahorros', label: 'Cuenta de Ahorros' }
                  ]
            }
          />
        </div>

        {/* Notes (Optional) */}
        <div className="form-group">
          <label className="form-label">Notas Adicionales (Opcional)</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Número de comprobante, detalles, cliente..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-actions-row">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={type === 'income' ? 'success' : isCompany ? 'primary' : 'primary'}
            loading={submitting}
          >
            Guardar Movimiento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
