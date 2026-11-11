import { db } from '../db/database.js';
import crypto from 'node:crypto';

export const InvoiceController = {
  getAll: (req, res, query) => {
    const { profileId = 'empresa', type, status, search } = query;

    let sql = 'SELECT * FROM invoices WHERE profile_id = ?';
    const params = [profileId];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (invoice_number LIKE ? OR entity_name LIKE ? OR notes LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY due_date ASC';

    const invoices = db.prepare(sql).all(...params);
    return res.json({ success: true, count: invoices.length, data: invoices });
  },

  create: (req, res, body) => {
    const { 
      profile_id = 'empresa', 
      type, 
      invoice_number, 
      entity_name, 
      amount, 
      tax_amount = 0, 
      issue_date, 
      due_date, 
      status = 'pending', 
      notes = '' 
    } = body;

    if (!type || !invoice_number || !entity_name || amount === undefined || !issue_date || !due_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos obligatorios: type, invoice_number, entity_name, amount, issue_date, due_date' 
      });
    }

    const numAmount = parseFloat(amount);
    const numTax = parseFloat(tax_amount) || 0;
    const id = `inv-${crypto.randomUUID().slice(0, 8)}`;

    const stmt = db.prepare(`
      INSERT INTO invoices (id, profile_id, type, invoice_number, entity_name, amount, tax_amount, issue_date, due_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, profile_id, type, invoice_number, entity_name, numAmount, numTax, issue_date, due_date, status, notes);

    const created = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    return res.status(201).json({ success: true, message: 'Factura registrada con éxito', data: created });
  },

  updateStatus: (req, res, id, body) => {
    const { status, recordTransaction = false } = body;
    if (!status || !['pending', 'paid', 'overdue'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado inválido. Debe ser: pending, paid o overdue' });
    }

    const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(status, id);

    // If marked as paid and requested, record a transaction
    if (status === 'paid' && recordTransaction && existing.status !== 'paid') {
      const txId = `tx-inv-${crypto.randomUUID().slice(0, 8)}`;
      const txType = existing.type === 'receivable' ? 'income' : 'expense';
      const category = existing.type === 'receivable' ? 'Cobro Factura Clientes' : 'Pago Factura Proveedores';
      const desc = `${existing.type === 'receivable' ? 'Cobro' : 'Pago'} Factura ${existing.invoice_number} - ${existing.entity_name}`;
      const today = new Date().toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO transactions (id, profile_id, type, category, amount, description, date, status, account, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', 'Banco Corporativo', ?)
      `).run(txId, existing.profile_id, txType, category, existing.amount, desc, today, `Liquidación de factura ${existing.invoice_number}`);
    }

    const updated = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Estado de factura actualizado', data: updated });
  },

  delete: (req, res, id) => {
    const existing = db.prepare('SELECT id FROM invoices WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Factura eliminada con éxito' });
  }
};

