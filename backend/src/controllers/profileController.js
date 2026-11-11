import { db } from '../db/database.js';
import { FinancialService } from '../services/financialService.js';

export const ProfileController = {
  getAll: (req, res) => {
    const profiles = db.prepare('SELECT * FROM profiles ORDER BY type ASC').all();
    return res.json({ success: true, data: profiles });
  },

  getById: (req, res, id) => {
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
    }
    return res.json({ success: true, data: profile });
  },

  getSummary: (req, res, profileId) => {
    try {
      const summary = FinancialService.getSummary(profileId);
      return res.json({ success: true, data: summary });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};

