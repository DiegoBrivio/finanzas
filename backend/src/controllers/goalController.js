import { db } from '../db/database.js';
import crypto from 'node:crypto';

export const GoalController = {
  getAll: (req, res, query) => {
    const { profileId = 'personal' } = query;
    const goals = db.prepare('SELECT * FROM savings_goals WHERE profile_id = ? ORDER BY target_date ASC').all(profileId);

    const enriched = goals.map(g => {
      const percentage = g.target_amount > 0 ? Math.min(100, Number(((g.current_amount / g.target_amount) * 100).toFixed(1))) : 0;
      const remaining = Math.max(0, g.target_amount - g.current_amount);
      const isCompleted = g.current_amount >= g.target_amount;
      return {
        ...g,
        percentage,
        remaining,
        isCompleted
      };
    });

    return res.json({ success: true, count: enriched.length, data: enriched });
  },

  create: (req, res, body) => {
    const { profile_id = 'personal', title, target_amount, current_amount = 0, target_date, category = 'Ahorro', icon = 'target' } = body;

    if (!title || target_amount === undefined || !target_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos: title, target_amount, target_date' 
      });
    }

    const target = parseFloat(target_amount);
    const current = parseFloat(current_amount) || 0;

    if (isNaN(target) || target <= 0) {
      return res.status(400).json({ success: false, message: 'La meta debe ser un número mayor a 0' });
    }

    const id = `g-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO savings_goals (id, profile_id, title, target_amount, current_amount, target_date, category, icon)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, profile_id, title, target, current, target_date, category, icon);

    const created = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id);
    return res.status(201).json({ success: true, message: 'Meta de ahorro creada', data: created });
  },

  contribute: (req, res, id, body) => {
    const { amount, notes = '', recordExpense = false } = body;
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount === 0) {
      return res.status(400).json({ success: false, message: 'El importe debe ser diferente de 0' });
    }

    const existing = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Meta no encontrada' });
    }

    const newCurrent = Math.max(0, existing.current_amount + numAmount);
    db.prepare('UPDATE savings_goals SET current_amount = ? WHERE id = ?').run(newCurrent, id);

    // If requested, register as a savings transaction
    if (recordExpense && numAmount > 0) {
      const txId = `tx-goal-${crypto.randomUUID().slice(0, 8)}`;
      const today = new Date().toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO transactions (id, profile_id, type, category, amount, description, date, status, account, notes)
        VALUES (?, ?, 'expense', 'Ahorro e Inversión', ?, ?, ?, 'completed', 'Cuenta de Ahorros', ?)
      `).run(txId, existing.profile_id, numAmount, `Aporte a meta: ${existing.title}`, today, notes || 'Aporte directo a meta financiera');
    }

    const updated = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Aporte registrado con éxito', data: updated });
  },

  delete: (req, res, id) => {
    const existing = db.prepare('SELECT id FROM savings_goals WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Meta no encontrada' });
    }

    db.prepare('DELETE FROM savings_goals WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Meta eliminada con éxito' });
  }
};

