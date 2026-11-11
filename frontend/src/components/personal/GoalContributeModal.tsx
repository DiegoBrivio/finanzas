import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { SavingsGoal } from '../../types/finance';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface GoalContributeModalProps {
  isOpen: boolean;
  goal: SavingsGoal;
  onClose: () => void;
}

export const GoalContributeModal: React.FC<GoalContributeModalProps> = ({
  isOpen,
  goal,
  onClose
}) => {
  const { contributeGoal, formatMoney } = useFinance();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    try {
      setSubmitting(true);
      await contributeGoal(goal.id, numAmount);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar aporte');
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Abonar a "${goal.title}"`}
      subtitle={`Faltan ${formatMoney(remaining)} para completar el objetivo`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-alert-error">{error}</div>}

        <div className="current-goal-summary">
          <div className="summary-row">
            <span>Ahorrado actualmente:</span>
            <span className="font-semibold">{formatMoney(goal.current_amount)}</span>
          </div>
          <div className="summary-row">
            <span>Meta total:</span>
            <span className="font-semibold text-muted">{formatMoney(goal.target_amount)}</span>
          </div>
        </div>

        <Input
          label="Monto a Depositar / Abonar ($)"
          type="number"
          step="1"
          min="1"
          placeholder="Ej: 100"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          autoFocus
        />

        <div className="quick-amount-buttons">
          {[50, 100, 250, 500].map(val => (
            <button
              key={val}
              type="button"
              className="quick-amount-btn"
              onClick={() => setAmount(String(val))}
            >
              +${val}
            </button>
          ))}
          {remaining > 0 && (
            <button
              type="button"
              className="quick-amount-btn highlight"
              onClick={() => setAmount(String(remaining))}
            >
              Completar meta (${remaining})
            </button>
          )}
        </div>

        <p className="form-helper text-xs text-muted mt-2">
          ℹ️ Este abono se registrará automáticamente en tu historial como un movimiento de ahorro e inversión.
        </p>

        <div className="modal-actions-row">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Confirmar Abono
          </Button>
        </div>
      </form>
    </Modal>
  );
};
