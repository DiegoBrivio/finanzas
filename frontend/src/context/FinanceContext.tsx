import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  Profile, 
  Transaction, 
  Budget, 
  Invoice, 
  SavingsGoal, 
  FinancialSummary 
} from '../types/finance';
import { api } from '../services/api';

interface FinanceContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
  switchProfile: (profileId: string) => void;
  summary: FinancialSummary | null;
  transactions: Transaction[];
  budgets: Budget[];
  invoices: Invoice[];
  goals: SavingsGoal[];
  loading: boolean;
  error: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  addInvoice: (inv: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: 'pending' | 'paid' | 'overdue') => Promise<void>;
  removeInvoice: (id: string) => Promise<void>;
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  contributeGoal: (id: string, amount: number) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Helpers
  formatMoney: (amount?: number) => string;
  isPersonal: boolean;
  isCompany: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string>('personal');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('finanzflow_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('finanzflow_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const currentProfile = useMemo(() => {
    return profiles.find(p => p.id === currentProfileId) || profiles[0] || null;
  }, [profiles, currentProfileId]);

  const isPersonal = currentProfile?.type === 'personal';
  const isCompany = currentProfile?.type === 'empresa';

  // Load profiles on mount
  useEffect(() => {
    async function initProfiles() {
      try {
        const loadedProfiles = await api.getProfiles();
        setProfiles(loadedProfiles);
        if (loadedProfiles.length > 0 && !currentProfileId) {
          setCurrentProfileId(loadedProfiles[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    initProfiles();
  }, []);

  // Fetch all data for active profile
  const refreshData = useCallback(async () => {
    if (!currentProfileId) return;
    setLoading(true);
    setError(null);
    try {
      const [sumData, txData, budData, invData, goalData] = await Promise.all([
        api.getSummary(currentProfileId),
        api.getTransactions(currentProfileId),
        api.getBudgets(currentProfileId),
        api.getInvoices(currentProfileId),
        api.getGoals(currentProfileId)
      ]);

      setSummary(sumData);
      setTransactions(txData);
      setBudgets(budData);
      setInvoices(invData);
      setGoals(goalData);
    } catch (err: any) {
      console.error('Error fetching financial data:', err);
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const switchProfile = (profileId: string) => {
    setCurrentProfileId(profileId);
    // If switching to company and was on goals tab, redirect to invoices
    if (profileId === 'empresa' && activeTab === 'goals') {
      setActiveTab('invoices');
    }
    // If switching to personal and was on invoices tab, redirect to goals
    if (profileId === 'personal' && activeTab === 'invoices') {
      setActiveTab('goals');
    }
  };

  // Transaction mutations
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    await api.createTransaction({
      ...tx,
      profile_id: currentProfileId
    });
    await refreshData();
  };

  const removeTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    await refreshData();
  };

  // Budget mutations
  const addBudget = async (b: Omit<Budget, 'id'>) => {
    await api.createBudget({
      ...b,
      profile_id: currentProfileId
    });
    await refreshData();
  };

  const removeBudget = async (id: string) => {
    await api.deleteBudget(id);
    await refreshData();
  };

  // Invoice mutations
  const addInvoice = async (inv: Omit<Invoice, 'id'>) => {
    await api.createInvoice({
      ...inv,
      profile_id: currentProfileId
    });
    await refreshData();
  };

  const updateInvoiceStatus = async (id: string, status: 'pending' | 'paid' | 'overdue') => {
    await api.updateInvoiceStatus(id, status, true);
    await refreshData();
  };

  const removeInvoice = async (id: string) => {
    await api.deleteInvoice(id);
    await refreshData();
  };

  // Goal mutations
  const addGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    await api.createGoal({
      ...goal,
      profile_id: currentProfileId
    });
    await refreshData();
  };

  const contributeGoal = async (id: string, amount: number) => {
    await api.contributeGoal(id, amount, true);
    await refreshData();
  };

  const removeGoal = async (id: string) => {
    await api.deleteGoal(id);
    await refreshData();
  };

  // Format currency helper
  const formatMoney = useCallback((amount?: number): string => {
    if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
    const currency = currentProfile?.currency || 'USD';
    const formatted = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    return formatted;
  }, [currentProfile]);

  return (
    <FinanceContext.Provider
      value={{
        currentProfile,
        profiles,
        switchProfile,
        summary,
        transactions,
        budgets,
        invoices,
        goals,
        loading,
        error,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        addTransaction,
        removeTransaction,
        addBudget,
        removeBudget,
        addInvoice,
        updateInvoiceStatus,
        removeInvoice,
        addGoal,
        contributeGoal,
        removeGoal,
        refreshData,
        formatMoney,
        isPersonal,
        isCompany
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
