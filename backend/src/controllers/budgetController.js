import { db } from '../db/database.js';
import { FinancialService } from '../services/financialService.js';
import crypto from 'node:crypto';

export const BudgetController = {
  getAll: (req, res, query) => {
    const { profileId, period = '2026-10' } = query;
    if (!profileId) {
      return res.status(400).json({ success: false, message: 'profileId es requerido' });
    }

    try {
      const budgets = FinancialService.getBudgets(profileId, period);
      return res.json({ success: true, data: budgets });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  create: (req, res, body) => {
    const { profile_id, category, monthly_limit, period = '2026-10', alert_threshold = 0.85 } = body;

    if (!profile_id || !category || monthly_limit === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos: profile_id, category, monthly_limit' 
      });
    }

    const limit = parseFloat(monthly_limit);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ success: false, message: 'El límite mensual debe ser un número positivo' });
    }

    // Check if budget for category already exists in this period
    const existing = db.prepare(`
      SELECT id FROM budgets WHERE profile_id = ? AND category = ? AND period = ?
    `).get(profile_id, category, period);

    if (existing) {
      db.prepare(`
        UPDATE budgets 
        SET monthly_limit = ?, alert_threshold = ?
        WHERE id = ?
      `).run(limit, alert_threshold, existing.id);

      return res.json({ success: true, message: 'Presupuesto actualizado con éxito' });
    }

    const id = `b-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO budgets (id, profile_id, category, monthly_limit, period, alert_threshold)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, profile_id, category, limit, period, alert_threshold);

    return res.status(201).json({ success: true, message: 'Presupuesto creado con éxito' });
  },

  delete: (req, res, id) => {
    const existing = db.prepare('SELECT id FROM budgets WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Presupuesto no encontrado' });
    }

    db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Presupuesto eliminado con éxito' });
  }
};

