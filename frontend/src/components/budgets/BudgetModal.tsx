import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_PERSONAL_CATEGORIES = [
  'Vivienda',
  'Alimentación',
  'Servicios',
  'Transporte',
  'Salud & Bienestar',
  'Ocio & Entretenimiento',
  'Educación',
  'Ropa & Calzado',
  'Otros Gastos'
];

const COMMON_EMPRESA_CATEGORIES = [
  'Nómina & Sueldos',
  'Infraestructura Cloud',
  'Alquiler Oficina',
  'Marketing & Ads',
  'Software & SaaS',
  'Impuestos & Tasas',
  'Proveedores Externos',
  'Operaciones',
  'Servicios Legales & Contables'
];

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
  const { addBudget, isCompany } = useFinance();

  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [limit, setLimit] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('0.85');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = isCompany ? COMMON_EMPRESA_CATEGORIES : COMMON_PERSONAL_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalCategory = isCustom ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Por favor selecciona o ingresa una categoría');
      return;
    }

    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('El límite mensual debe ser mayor a 0');
      return;
    }

    try {
      setSubmitting(true);
      await addBudget({
        profile_id: '',
        category: finalCategory,
        monthly_limit: numLimit,
        period: '2026-10',
        alert_threshold: parseFloat(alertThreshold)
      });

      setCategory('');
      setCustomCategory('');
      setIsCustom(false);
      setLimit('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el presupuesto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Presupuesto Mensual"
      subtitle="Define un límite máximo de gasto para este período"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-alert-error">{error}</div>}

        {!isCustom ? (
          <Select
            label="Categoría a Presupuestar"
            value={category}
            onChange={e => {
              if (e.target.value === '__custom__') setIsCustom(true);
              else setCategory(e.target.value);
            }}
            options={[
              { value: '', label: '-- Seleccionar Categoría --' },
              ...categories.map(c => ({ value: c, label: c })),
              { value: '__custom__', label: '➕ Otra categoría (escribir)...' }
            ]}
            required
          />
        ) : (
          <div>
            <Input
              label="Nombre de la Categoría"
              placeholder="Ej: Suscripciones o Cafetería"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              required
            />
            <button
              type="button"
              className="link-btn text-xs mt-1"
              onClick={() => setIsCustom(false)}
            >
              Volver a lista predeterminada
            </button>
          </div>
        )}

        <Input
          label="Límite Máximo Mensual ($)"
          type="number"
          step="1"
          min="1"
          placeholder="Ej: 500"
          value={limit}
          onChange={e => setLimit(e.target.value)}
          required
        />

        <Select
          label="Umbral de Alerta Temprana"
          value={alertThreshold}
          onChange={e => setAlertThreshold(e.target.value)}
          options={[
            { value: '0.70', label: 'Avisar al alcanzar el 70% del límite' },
            { value: '0.80', label: 'Avisar al alcanzar el 80% del límite' },
            { value: '0.85', label: 'Avisar al alcanzar el 85% del límite (Recomendado)' },
            { value: '0.90', label: 'Avisar al alcanzar el 90% del límite' }
          ]}
        />

        <div className="modal-actions-row">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Guardar Presupuesto
          </Button>
        </div>
      </form>
    </Modal>
  );
};

