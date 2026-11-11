export type ProfileType = 'personal' | 'empresa';
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending';
export type InvoiceType = 'receivable' | 'payable'; // 'receivable' = Por Cobrar, 'payable' = Por Pagar
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Profile {
  id: string;
  name: string;
  type: ProfileType;
  currency: string;
  tax_id?: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  profile_id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: TransactionStatus;
  account?: string;
  notes?: string;
  created_at?: string;
}

export interface Budget {
  id: string;
  profile_id: string;
  category: string;
  monthly_limit: number;
  period: string;
  alert_threshold?: number;
  spent?: number;
  remaining?: number;
  percentage?: number;
  isExceeded?: boolean;
  isNearLimit?: boolean;
}

export interface Invoice {
  id: string;
  profile_id: string;
  type: InvoiceType;
  invoice_number: string;
  entity_name: string;
  amount: number;
  tax_amount?: number;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  notes?: string;
  created_at?: string;
}

export interface SavingsGoal {
  id: string;
  profile_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  icon?: string;
  percentage?: number;
  remaining?: number;
  isCompleted?: boolean;
  created_at?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface FinancialSummary {
  profile: Profile;
  currency: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  marginRate: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
  // Empresa specifics
  pendingReceivables?: number;
  pendingPayables?: number;
  overdueReceivables?: number;
  runwayMonths?: number;
  estimatedTax?: number;
  ebitdaMargin?: number;
  // Personal specifics
  totalSavedInGoals?: number;
  totalTargetGoals?: number;
  goalsCount?: number;
  goalsProgressPercentage?: number;
  savingsRate?: number;
}

