import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose }) => {
  const { addGoal } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('0');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState('Seguridad');
  const [icon, setIcon] = useState('target');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const target = parseFloat(targetAmount);
    const initial = parseFloat(initialAmount) || 0;

    if (!title.trim()) {
      setError('El título de la meta es obligatorio');
      return;
    }

    if (isNaN(target) || target <= 0) {
      setError('El monto objetivo debe ser mayor a 0');
      return;
    }

    try {
      setSubmitting(true);
      await addGoal({
        profile_id: '',
        title: title.trim(),
        target_amount: target,
        current_amount: initial,
        target_date: targetDate,
        category,
        icon
      });

      setTitle('');
      setTargetAmount('');
      setInitialAmount('0');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la meta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Meta Financiera"
      subtitle="Define un objetivo y fecha para tus ahorros"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-alert-error">{error}</div>}

        <Input
          label="Nombre de la Meta"
          placeholder="Ej: Fondo de Emergencia, Vacaciones en Europa..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="form-row-2">
          <Input
            label="Monto Objetivo ($)"
            type="number"
            step="10"
            min="10"
            placeholder="Ej: 5000"
            value={targetAmount}
            onChange={e => setTargetAmount(e.target.value)}
            required
          />

          <Input
            label="Monto Inicial Ahorrado ($)"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={initialAmount}
            onChange={e => setInitialAmount(e.target.value)}
          />
        </div>

        <div className="form-row-2">
          <Input
            label="Fecha Límite Deseada"
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            required
          />

          <Select
            label="Categoría"
            value={category}
            onChange={e => setCategory(e.target.value)}
            options={[
              { value: 'Seguridad', label: '🛡️ Seguridad / Fondo Emergencia' },
              { value: 'Vacaciones', label: '✈️ Vacaciones / Viajes' },
              { value: 'Tecnología', label: '💻 Equipamiento / Tecnología' },
              { value: 'Inversión', label: '📈 Inversión / Retiro' },
              { value: 'Vivienda', label: '🏠 Entrada Casa / Remodelación' },
              { value: 'Vehículo', label: '🚗 Coche / Movilidad' }
            ]}
          />
        </div>

        <Select
          label="Icono Representativo"
          value={icon}
          onChange={e => setIcon(e.target.value)}
          options={[
            { value: 'shield', label: '🛡️ Escudo (Seguridad)' },
            { value: 'target', label: '🎯 Diana (Objetivo)' },
            { value: 'plane', label: '✈️ Avión (Viaje)' },
            { value: 'laptop', label: '💻 Ordenador (Tecnología)' },
            { value: 'home', label: '🏠 Casa (Vivienda)' },
            { value: 'trending-up', label: '📈 Gráfico (Inversión)' }
          ]}
        />

        <div className="modal-actions-row">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Guardar Meta
          </Button>
        </div>
      </form>
    </Modal>
  );
};

