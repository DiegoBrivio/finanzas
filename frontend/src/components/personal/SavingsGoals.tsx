import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { SavingsGoal } from '../../types/finance';
import { GoalModal } from './GoalModal';
import { GoalContributeModal } from './GoalContributeModal';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';

export const SavingsGoals: React.FC = () => {
  const { goals, removeGoal, formatMoney } = useFinance();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [contributeTarget, setContributeTarget] = useState<SavingsGoal | null>(null);

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const overallPct = totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;

  return (
    <div className="goals-view">
      {/* Top Stats */}
      <div className="goals-stats-grid">
        <Card className="goal-stat-card">
          <CardContent>
            <div className="goal-stat-icon text-income">
              <Icon name="shield" size={24} />
            </div>
            <div>
              <span className="stat-label">Total Reservado en Metas</span>
              <div className="stat-val text-income">{formatMoney(totalSaved)}</div>
              <span className="stat-sub">Dinero acumulado en fondos de ahorro</span>
            </div>
          </CardContent>
        </Card>

        <Card className="goal-stat-card">
          <CardContent>
            <div className="goal-stat-icon text-primary">
              <Icon name="target" size={24} />
            </div>
            <div>
              <span className="stat-label">Objetivo Financiero Global</span>
              <div className="stat-val text-primary">{formatMoney(totalTarget)}</div>
              <span className="stat-sub">{overallPct}% completado en conjunto</span>
            </div>
          </CardContent>
        </Card>

        <Card className="goal-stat-card">
          <CardContent>
            <div className="goal-stat-icon text-muted">
              <Icon name="clock" size={24} />
            </div>
            <div>
              <span className="stat-label">Metas Activas</span>
              <div className="stat-val">{goals.length}</div>
              <span className="stat-sub">
                {goals.filter(g => g.isCompleted).length} metas alcanzadas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Header */}
      <div className="goals-action-bar">
        <div>
          <h2 className="section-title">Metas de Ahorro y Fondos de Reserva</h2>
          <p className="section-subtitle">
            Planifica tus objetivos personales a corto y largo plazo con seguimiento visual de progreso.
          </p>
        </div>

        <Button
          variant="primary"
          icon="plus"
          onClick={() => setIsCreateOpen(true)}
        >
          Nueva Meta de Ahorro
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card>
          <CardContent>
            <div className="empty-state-large">
              <Icon name="target" size={40} />
              <h3>No tienes metas de ahorro definidas</h3>
              <p>Define un objetivo financiero (ej. Fondo de emergencia o Viaje) para empezar a ahorrar con propósito.</p>
              <Button variant="primary" icon="plus" onClick={() => setIsCreateOpen(true)}>
                Crear Primera Meta
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="goals-cards-grid">
          {goals.map(goal => {
            const isCompleted = (goal.current_amount >= goal.target_amount);
            const percentage = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);

            return (
              <Card key={goal.id} className={`goal-card ${isCompleted ? 'goal-completed' : ''}`}>
                <CardContent>
                  <div className="goal-card-top">
                    <div className="goal-icon-badge">
                      <Icon name={goal.icon || 'target'} size={20} />
                    </div>
                    <div className="goal-title-area">
                      <h4 className="goal-card-title">{goal.title}</h4>
                      <span className="goal-category-tag">{goal.category}</span>
                    </div>
                    {isCompleted ? (
                      <Badge variant="success" size="sm" dot>
                        ¡Completada!
                      </Badge>
                    ) : (
                      <Badge variant="info" size="sm">
                        {percentage.toFixed(0)}%
                      </Badge>
                    )}
                  </div>

                  <div className="goal-amount-row">
                    <div>
                      <span className="amount-label">Ahorrado</span>
                      <div className="amount-val text-income font-bold">
                        {formatMoney(goal.current_amount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="amount-label">Objetivo</span>
                      <div className="amount-val text-muted">
                        {formatMoney(goal.target_amount)}
                      </div>
                    </div>
                  </div>

                  <ProgressBar
                    value={percentage}
                    height={10}
                    color={isCompleted ? 'success' : 'primary'}
                  />

                  <div className="goal-card-footer">
                    <div className="goal-due-date">
                      <Icon name="calendar" size={14} />
                      <span>Objetivo: {goal.target_date}</span>
                    </div>

                    {!isCompleted && (
                      <span className="goal-remaining-text">
                        Faltan {formatMoney(remaining)}
                      </span>
                    )}
                  </div>

                  <div className="goal-actions-row">
                    <Button
                      variant={isCompleted ? 'outline' : 'primary'}
                      size="sm"
                      icon="plus"
                      onClick={() => setContributeTarget(goal)}
                    >
                      {isCompleted ? 'Aportar Extra' : 'Abonar a la Meta'}
                    </Button>

                    <button
                      type="button"
                      className="goal-delete-btn"
                      title="Eliminar meta"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar la meta '${goal.title}'?`)) {
                          removeGoal(goal.id);
                        }
                      }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <GoalModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {contributeTarget && (
        <GoalContributeModal
          isOpen={Boolean(contributeTarget)}
          goal={contributeTarget}
          onClose={() => setContributeTarget(null)}
        />
      )}
    </div>
  );
};
