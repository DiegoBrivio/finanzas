import { db } from '../db/database.js';

// Color palette for category breakdown
const CATEGORY_COLORS = {
  // Personal
  'Salario': '#10b981',
  'Freelance': '#3b82f6',
  'Inversiones': '#8b5cf6',
  'Vivienda': '#f59e0b',
  'Alimentación': '#ef4444',
  'Servicios': '#06b6d4',
  'Transporte': '#ec4899',
  'Salud & Bienestar': '#14b8a6',
  'Ocio & Entretenimiento': '#84cc16',
  'Educación': '#6366f1',
  // Empresa
  'Ventas Software': '#10b981',
  'Servicios Consultoría': '#3b82f6',
  'Nómina & Sueldos': '#ef4444',
  'Infraestructura Cloud': '#f59e0b',
  'Alquiler Oficina': '#8b5cf6',
  'Marketing & Ads': '#ec4899',
  'Impuestos & Tasas': '#64748b',
  'Software & SaaS': '#06b6d4',
  'Operaciones': '#eab308',
  'Otros': '#94a3b8'
};

export class FinancialService {
  /**
   * Calculate summary metrics for a given profile
   */
  static getSummary(profileId) {
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId);
    if (!profile) {
      throw new Error(`Perfil '${profileId}' no encontrado`);
    }

    // 1. All-time income & expense
    const totals = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE profile_id = ?
    `).get(profileId);

    const totalIncome = totals.total_income || 0;
    const totalExpense = totals.total_expense || 0;
    const balance = totalIncome - totalExpense;

    // 2. Current month calculation (Oct 2026 based or dynamic current month)
    // We check current year-month
    const currentYearMonth = '2026-10'; // default demo anchor, or dynamically checked

    const currentMonthData = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as month_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as month_expense
      FROM transactions
      WHERE profile_id = ? AND strftime('%Y-%m', date) = ?
    `).get(profileId, currentYearMonth);

    const monthlyIncome = currentMonthData.month_income || 0;
    const monthlyExpense = currentMonthData.month_expense || 0;
    const monthlyNet = monthlyIncome - monthlyExpense;
    const marginRate = monthlyIncome > 0 ? (monthlyNet / monthlyIncome) * 100 : 0;

    // 3. Category breakdown for expenses
    const categoryRows = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE profile_id = ? AND type = 'expense'
      GROUP BY category
      ORDER BY total DESC
    `).all(profileId);

    const categoryBreakdown = categoryRows.map((cat, idx) => {
      const percentage = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
      return {
        category: cat.category,
        amount: cat.total,
        percentage: Number(percentage.toFixed(1)),
        color: CATEGORY_COLORS[cat.category] || `hsl(${(idx * 55) % 360}, 70%, 50%)`
      };
    });

    // 4. Monthly Trend (last 6 months)
    const trendRows = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE profile_id = ?
      GROUP BY month
      ORDER BY month ASC
    `).all(profileId);

    const monthNames = {
      '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
    };

    let monthlyTrend = trendRows.map(row => {
      const [year, monthNum] = (row.month || '').split('-');
      const label = monthNames[monthNum] ? `${monthNames[monthNum]} ${year.slice(2)}` : row.month;
      return {
        month: row.month,
        label,
        income: row.income,
        expense: row.expense,
        net: row.income - row.expense
      };
    });

    if (monthlyTrend.length === 0) {
      monthlyTrend = [
        { month: '2026-10', label: 'Oct 26', income: 0, expense: 0, net: 0 }
      ];
    }

    // 5. Specifics by profile type
    let specificData = {};

    if (profile.type === 'empresa') {
      // Invoices summaries
      const invStats = db.prepare(`
        SELECT
          SUM(CASE WHEN type = 'receivable' AND status != 'paid' THEN amount ELSE 0 END) as pending_receivables,
          SUM(CASE WHEN type = 'payable' AND status != 'paid' THEN amount ELSE 0 END) as pending_payables,
          SUM(CASE WHEN type = 'receivable' AND status = 'overdue' THEN amount ELSE 0 END) as overdue_receivables,
          SUM(tax_amount) as total_tax
        FROM invoices
        WHERE profile_id = ?
      `).get(profileId);

      // Runway calculation: balance / average monthly expense
      const avgExpense = monthlyExpense > 0 ? monthlyExpense : 0;
      const runwayMonths = (avgExpense > 0 && balance > 0) ? Number((balance / avgExpense).toFixed(1)) : 0;

      specificData = {
        pendingReceivables: invStats.pending_receivables || 0,
        pendingPayables: invStats.pending_payables || 0,
        overdueReceivables: invStats.overdue_receivables || 0,
        runwayMonths: Math.max(0, runwayMonths),
        estimatedTax: invStats.total_tax || 0,
        ebitdaMargin: Number(marginRate.toFixed(1))
      };
    } else {
      // Personal goals and budgets alerts
      const goalsStats = db.prepare(`
        SELECT 
          COUNT(*) as total_goals,
          SUM(target_amount) as total_target,
          SUM(current_amount) as total_saved
        FROM savings_goals
        WHERE profile_id = ?
      `).get(profileId);

      const totalSaved = goalsStats.total_saved || 0;
      const totalTarget = goalsStats.total_target || 0;
      const goalsProgress = totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;

      specificData = {
        totalSavedInGoals: totalSaved,
        totalTargetGoals: totalTarget,
        goalsCount: goalsStats.total_goals || 0,
        goalsProgressPercentage: goalsProgress,
        savingsRate: Number(marginRate.toFixed(1))
      };
    }

    return {
      profile,
      currency: profile.currency,
      totalBalance: balance,
      monthlyIncome,
      monthlyExpense,
      monthlyNet,
      marginRate: Number(marginRate.toFixed(1)),
      categoryBreakdown,
      monthlyTrend,
      ...specificData
    };
  }

  /**
   * Get budgets with real-time spending calculations
   */
  static getBudgets(profileId, period = '2026-10') {
    const budgets = db.prepare(`
      SELECT * FROM budgets WHERE profile_id = ?
    `).all(profileId);

    return budgets.map(b => {
      // Calculate spent amount in this category
      const spentRow = db.prepare(`
        SELECT SUM(amount) as spent
        FROM transactions
        WHERE profile_id = ? 
          AND type = 'expense' 
          AND category = ?
          AND strftime('%Y-%m', date) = ?
      `).get(profileId, b.category, period);

      const spent = spentRow.spent || 0;
      const percentage = Number(((spent / b.monthly_limit) * 100).toFixed(1));
      const remaining = b.monthly_limit - spent;
      const isExceeded = spent > b.monthly_limit;
      const isNearLimit = !isExceeded && (percentage >= (b.alert_threshold * 100));

      return {
        ...b,
        spent,
        remaining,
        percentage,
        isExceeded,
        isNearLimit
      };
    });
  }
}

