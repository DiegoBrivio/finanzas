import { db } from '../db/database.js';
import crypto from 'node:crypto';

export const TransactionController = {
  getAll: (req, res, query) => {
    const { profileId, type, category, search, month, limit = 100 } = query;

    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (profileId) {
      sql += ' AND profile_id = ?';
      params.push(profileId);
    }

    if (type && (type === 'income' || type === 'expense')) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (month) {
      sql += " AND strftime('%Y-%m', date) = ?";
      params.push(month);
    }

    if (search) {
      sql += ' AND (description LIKE ? OR category LIKE ? OR notes LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY date DESC, created_at DESC LIMIT ?';
    params.push(Number(limit) || 100);

    const rows = db.prepare(sql).all(...params);
    return res.json({ success: true, count: rows.length, data: rows });
  },

  create: async (req, res, body) => {
    const { profile_id, type, category, amount, description, date, status = 'completed', account = 'Principal', notes = '' } = body;

    if (!profile_id || !type || !category || amount === undefined || !description || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios: profile_id, type, category, amount, description, date' 
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'El monto debe ser un número positivo' });
    }

    const id = `tx-${crypto.randomUUID().slice(0, 8)}`;

    const stmt = db.prepare(`
      INSERT INTO transactions (id, profile_id, type, category, amount, description, date, status, account, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, profile_id, type, category, numAmount, description, date, status, account, notes);

    const created = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    return res.status(201).json({ success: true, message: 'Transacción registrada con éxito', data: created });
  },

  update: async (req, res, id, body) => {
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }

    const { type, category, amount, description, date, status, account, notes } = body;

    const stmt = db.prepare(`
      UPDATE transactions
      SET type = COALESCE(?, type),
          category = COALESCE(?, category),
          amount = COALESCE(?, amount),
          description = COALESCE(?, description),
          date = COALESCE(?, date),
          status = COALESCE(?, status),
          account = COALESCE(?, account),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `);

    stmt.run(
      type || null,
      category || null,
      amount !== undefined ? parseFloat(amount) : null,
      description || null,
      date || null,
      status || null,
      account || null,
      notes || null,
      id
    );

    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Transacción actualizada', data: updated });
  },

  delete: (req, res, id) => {
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Transacción eliminada con éxito' });
  },

  getCategories: (req, res, query) => {
    const { profileId } = query;
    let sql = 'SELECT DISTINCT category, type FROM transactions';
    const params = [];
    if (profileId) {
      sql += ' WHERE profile_id = ?';
      params.push(profileId);
    }
    sql += ' ORDER BY category ASC';
    const categories = db.prepare(sql).all(...params);
    return res.json({ success: true, data: categories });
  }
};

