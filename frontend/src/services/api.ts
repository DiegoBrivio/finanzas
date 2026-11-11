import { supabase } from './supabase';
import type { 
  Profile, 
  Transaction, 
  Budget, 
  Invoice, 
  SavingsGoal, 
  FinancialSummary,
  CategoryBreakdown,
  MonthlyTrend
} from '../types/finance';

const INITIAL_PROFILES: Profile[] = [
  { id: 'personal', name: 'Finanzas Personales', type: 'personal', currency: 'USD' },
  { id: 'empresa', name: 'Finanzas de la Empresa', type: 'empresa', currency: 'USD' }
];

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const api = {
  // Profiles
  async getProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.warn('Supabase getProfiles error, using defaults:', error.message);
        return INITIAL_PROFILES;
      }

      if (data && data.length > 0) {
        return data as Profile[];
      }

      // Si la tabla profiles existe pero está vacía, intentamos inicializar los perfiles base
      try {
        await supabase.from('profiles').insert(INITIAL_PROFILES);
      } catch (insertErr) {
        console.warn('Could not auto-seed profiles in Supabase:', insertErr);
      }
      return INITIAL_PROFILES;
    } catch (err) {
      console.warn('Supabase connection error in getProfiles:', err);
      return INITIAL_PROFILES;
    }
  },

  // Financial Summary
  async getSummary(profileId: string): Promise<FinancialSummary> {
    const profiles = await this.getProfiles();
    const profile = profiles.find(p => p.id === profileId) || profiles[0] || INITIAL_PROFILES[0];
    const currency = profile.currency || 'USD';

    try {
      // 1. Obtener transacciones del perfil
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('profile_id', profileId);

      const transactions: Transaction[] = (!txError && txData) ? txData : [];

      // 2. Obtener facturas si es empresa
      const { data: invData } = await supabase
        .from('invoices')
        .select('*')
        .eq('profile_id', profileId);
      const invoices: Invoice[] = invData || [];

      // 3. Obtener metas si es personal
      const { data: goalData } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('profile_id', profileId);
      const goals: SavingsGoal[] = goalData || [];

      // Cálculos totales
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount || 0), 0);

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount || 0), 0);

      const totalBalance = totalIncome - totalExpense;

      // Mes actual (YYYY-MM)
      const currentYearMonth = new Date().toISOString().slice(0, 7);
      const currentMonthTx = transactions.filter(t => (t.date || '').startsWith(currentYearMonth));

      const monthlyIncome = currentMonthTx
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount || 0), 0);

      const monthlyExpense = currentMonthTx
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount || 0), 0);

      const monthlyNet = monthlyIncome - monthlyExpense;
      const marginRate = monthlyIncome > 0 
        ? Number(((monthlyNet / monthlyIncome) * 100).toFixed(1)) 
        : 0;

      // Desglose por categoría para gastos
      const catMap: Record<string, number> = {};
      for (const tx of transactions.filter(t => t.type === 'expense')) {
        const cat = tx.category || 'Otros';
        catMap[cat] = (catMap[cat] || 0) + Number(tx.amount || 0);
      }

      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
      const categoryBreakdown: CategoryBreakdown[] = Object.entries(catMap)
        .map(([category, amount], idx) => ({
          category,
          amount,
          percentage: totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0,
          color: colors[idx % colors.length]
        }))
        .sort((a, b) => b.amount - a.amount);

      // Tendencia mensual histórica
      const trendMap: Record<string, { income: number; expense: number }> = {};
      for (const tx of transactions) {
        if (!tx.date) continue;
        const ym = tx.date.slice(0, 7);
        if (!trendMap[ym]) trendMap[ym] = { income: 0, expense: 0 };
        if (tx.type === 'income') trendMap[ym].income += Number(tx.amount || 0);
        else trendMap[ym].expense += Number(tx.amount || 0);
      }

      const monthlyTrend: MonthlyTrend[] = Object.keys(trendMap).length > 0
        ? Object.entries(trendMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([ym, data]) => ({
              month: ym,
              label: ym,
              income: data.income,
              expense: data.expense,
              net: data.income - data.expense
            }))
        : [{ month: currentYearMonth, label: 'Mes Actual', income: 0, expense: 0, net: 0 }];

      // Métricas de empresa
      const pendingReceivables = invoices
        .filter(i => i.type === 'receivable' && i.status !== 'paid')
        .reduce((a, b) => a + Number(b.amount || 0), 0);

      const pendingPayables = invoices
        .filter(i => i.type === 'payable' && i.status !== 'paid')
        .reduce((a, b) => a + Number(b.amount || 0), 0);

      const overdueReceivables = invoices
        .filter(i => i.type === 'receivable' && i.status === 'overdue')
        .reduce((a, b) => a + Number(b.amount || 0), 0);

      const totalTax = invoices.reduce((a, b) => a + Number(b.tax_amount || 0), 0);

      // Métricas de metas personales
      const totalSavedInGoals = goals.reduce((a, b) => a + Number(b.current_amount || 0), 0);
      const totalTargetGoals = goals.reduce((a, b) => a + Number(b.target_amount || 0), 0);

      return {
        profile,
        currency,
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        monthlyNet,
        marginRate,
        categoryBreakdown,
        monthlyTrend,
        pendingReceivables,
        pendingPayables,
        overdueReceivables,
        runwayMonths: (monthlyExpense > 0 && totalBalance > 0) ? Number((totalBalance / monthlyExpense).toFixed(1)) : 0,
        estimatedTax: totalTax,
        ebitdaMargin: marginRate,
        totalSavedInGoals,
        totalTargetGoals,
        goalsCount: goals.length,
        goalsProgressPercentage: totalTargetGoals > 0 ? Number(((totalSavedInGoals / totalTargetGoals) * 100).toFixed(1)) : 0,
        savingsRate: marginRate
      };
    } catch (err) {
      console.error('Error computing summary from Supabase:', err);
      return {
        profile,
        currency,
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        monthlyNet: 0,
        marginRate: 0,
        categoryBreakdown: [],
        monthlyTrend: [{ month: new Date().toISOString().slice(0, 7), label: 'Mes Actual', income: 0, expense: 0, net: 0 }],
        pendingReceivables: 0,
        pendingPayables: 0,
        overdueReceivables: 0,
        runwayMonths: 0,
        estimatedTax: 0,
        ebitdaMargin: 0,
        totalSavedInGoals: 0,
        totalTargetGoals: 0,
        goalsCount: 0,
        goalsProgressPercentage: 0,
        savingsRate: 0
      };
    }
  },

  // Transactions
  async getTransactions(profileId: string, filter?: { type?: string; category?: string; search?: string }): Promise<Transaction[]> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('profile_id', profileId)
        .order('date', { ascending: false });

      if (filter?.type && filter.type !== 'all') {
        query = query.eq('type', filter.type);
      }
      if (filter?.category && filter.category !== 'all') {
        query = query.eq('category', filter.category);
      }
      if (filter?.search) {
        query = query.ilike('description', `%${filter.search}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Supabase getTransactions error:', error);
        return [];
      }
      return (data || []) as Transaction[];
    } catch (err) {
      console.error('Error in getTransactions:', err);
      return [];
    }
  },

  async createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      id: generateId('tx')
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTx])
      .select()
      .single();

    if (error) {
      console.error('Supabase createTransaction error:', error);
      throw new Error(error.message);
    }
    return (data || newTx) as Transaction;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteTransaction error:', error);
      return false;
    }
    return true;
  },

  // Budgets
  async getBudgets(profileId: string): Promise<Budget[]> {
    try {
      const { data: budgetsData, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('profile_id', profileId);

      if (error) {
        console.error('Supabase getBudgets error:', error);
        return [];
      }

      const budgets: Budget[] = budgetsData || [];
      const currentYM = new Date().toISOString().slice(0, 7);

      // Traer gastos del mes actual para calcular 'spent'
      const { data: txsData } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('profile_id', profileId)
        .eq('type', 'expense')
        .gte('date', `${currentYM}-01`)
        .lte('date', `${currentYM}-31`);

      const txs = txsData || [];

      return budgets.map(b => {
        const spent = txs
          .filter(t => t.category === b.category)
          .reduce((acc, t) => acc + Number(t.amount || 0), 0);

        const limit = Number(b.monthly_limit || 0);
        const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;
        const remaining = Math.max(0, limit - spent);
        const isExceeded = spent > limit;
        const isNearLimit = !isExceeded && percentage >= ((b.alert_threshold || 0.85) * 100);

        return {
          ...b,
          spent,
          remaining,
          percentage,
          isExceeded,
          isNearLimit
        };
      });
    } catch (err) {
      console.error('Error in getBudgets:', err);
      return [];
    }
  },

  async createBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const newBudget: Budget = {
      ...budget,
      id: generateId('b')
    };

    const { data, error } = await supabase
      .from('budgets')
      .insert([newBudget])
      .select()
      .single();

    if (error) {
      console.error('Supabase createBudget error:', error);
      throw new Error(error.message);
    }
    return (data || newBudget) as Budget;
  },

  async deleteBudget(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteBudget error:', error);
      return false;
    }
    return true;
  },

  // Invoices (Empresa)
  async getInvoices(profileId: string = 'empresa'): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('profile_id', profileId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Supabase getInvoices error:', error);
        return [];
      }
      return (data || []) as Invoice[];
    } catch (err) {
      console.error('Error in getInvoices:', err);
      return [];
    }
  },

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    const newInv: Invoice = {
      ...invoice,
      id: generateId('inv')
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert([newInv])
      .select()
      .single();

    if (error) {
      console.error('Supabase createInvoice error:', error);
      throw new Error(error.message);
    }
    return (data || newInv) as Invoice;
  },

  async updateInvoiceStatus(id: string, status: 'pending' | 'paid' | 'overdue', recordTransaction: boolean = true): Promise<boolean> {
    try {
      // 1. Obtener datos de la factura
      const { data: inv, error: fetchErr } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !inv) {
        console.error('Invoice not found:', fetchErr);
        return false;
      }

      // 2. Actualizar estado en Supabase
      const { error: updateErr } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id);

      if (updateErr) {
        console.error('Error updating invoice status:', updateErr);
        return false;
      }

      // 3. Si se marcó como pagada y se solicita registrar la transacción
      if (status === 'paid' && recordTransaction) {
        const isReceivable = inv.type === 'receivable';
        await this.createTransaction({
          profile_id: inv.profile_id,
          type: isReceivable ? 'income' : 'expense',
          category: isReceivable ? 'Cobro Factura Clientes' : 'Pago Factura Proveedores',
          amount: Number(inv.amount),
          description: `${isReceivable ? 'Cobro' : 'Pago'} Factura ${inv.invoice_number} - ${inv.entity_name}`,
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
          account: 'Banco Corporativo'
        });
      }

      return true;
    } catch (err) {
      console.error('Error in updateInvoiceStatus:', err);
      return false;
    }
  },

  async deleteInvoice(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteInvoice error:', error);
      return false;
    }
    return true;
  },

  // Savings Goals (Personal)
  async getGoals(profileId: string = 'personal'): Promise<SavingsGoal[]> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('profile_id', profileId)
        .order('target_date', { ascending: true });

      if (error) {
        console.error('Supabase getGoals error:', error);
        return [];
      }

      const goals: SavingsGoal[] = data || [];
      return goals.map(g => {
        const target = Number(g.target_amount || 0);
        const current = Number(g.current_amount || 0);
        const percentage = target > 0 ? Math.min(100, Number(((current / target) * 100).toFixed(1))) : 0;
        const remaining = Math.max(0, target - current);
        const isCompleted = current >= target;

        return {
          ...g,
          target_amount: target,
          current_amount: current,
          percentage,
          remaining,
          isCompleted
        };
      });
    } catch (err) {
      console.error('Error in getGoals:', err);
      return [];
    }
  },

  async createGoal(goal: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> {
    const newGoal: SavingsGoal = {
      ...goal,
      id: generateId('g')
    };

    const { data, error } = await supabase
      .from('savings_goals')
      .insert([newGoal])
      .select()
      .single();

    if (error) {
      console.error('Supabase createGoal error:', error);
      throw new Error(error.message);
    }
    return (data || newGoal) as SavingsGoal;
  },

  async contributeGoal(id: string, amount: number, recordExpense: boolean = true): Promise<boolean> {
    try {
      const { data: goal, error: fetchErr } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !goal) {
        console.error('Goal not found:', fetchErr);
        return false;
      }

      const newCurrent = Math.max(0, Number(goal.current_amount || 0) + Number(amount));

      const { error: updateErr } = await supabase
        .from('savings_goals')
        .update({ current_amount: newCurrent })
        .eq('id', id);

      if (updateErr) {
        console.error('Error updating goal amount:', updateErr);
        return false;
      }

      if (recordExpense && amount > 0) {
        await this.createTransaction({
          profile_id: goal.profile_id,
          type: 'expense',
          category: 'Ahorro e Inversión',
          amount: Number(amount),
          description: `Aporte a meta: ${goal.title}`,
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
          account: 'Cuenta de Ahorros'
        });
      }

      return true;
    } catch (err) {
      console.error('Error in contributeGoal:', err);
      return false;
    }
  },

  async deleteGoal(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteGoal error:', error);
      return false;
    }
    return true;
  }
};
