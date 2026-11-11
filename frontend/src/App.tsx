import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { KpiGrid } from './components/dashboard/KpiGrid';
import { CashFlowChart } from './components/dashboard/CashFlowChart';
import { CategoryDonutChart } from './components/dashboard/CategoryDonutChart';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { QuickActions } from './components/dashboard/QuickActions';
import { TransactionTable } from './components/transactions/TransactionTable';
import { TransactionModal } from './components/transactions/TransactionModal';
import { BudgetGrid } from './components/budgets/BudgetGrid';
import { InvoiceTable } from './components/company/InvoiceTable';
import { SavingsGoals } from './components/personal/SavingsGoals';
import { FinancialReports } from './components/reports/FinancialReports';
import './App.css';

const MainContent: React.FC = () => {
  const { activeTab, loading, isCompany, theme } = useFinance();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-view-container">
            <KpiGrid />
            <div className="dashboard-charts-grid">
              <CashFlowChart />
              <CategoryDonutChart />
            </div>
            <div className="dashboard-bottom-grid">
              <RecentTransactions />
              <QuickActions
                onOpenNewTx={() => setIsTxModalOpen(true)}
              />
            </div>
          </div>
        );

      case 'transactions':
        return <TransactionTable onOpenNewTx={() => setIsTxModalOpen(true)} />;

      case 'budgets':
        return <BudgetGrid />;

      case 'invoices':
        return <InvoiceTable />;

      case 'goals':
        return <SavingsGoals />;

      case 'reports':
        return <FinancialReports />;

      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className={`app-shell ${isCompany ? 'theme-empresa' : 'theme-personal'} ${theme}`}>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="mobile-backdrop" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`sidebar-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar onItemClick={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main App Body */}
      <div className="app-main-layout">
        <Navbar 
          onOpenNewTransaction={() => setIsTxModalOpen(true)} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="app-content-area">
          {loading ? (
            <div className="loading-state-screen">
              <div className="spinner-large" />
              <p>Sincronizando estado financiero...</p>
            </div>
          ) : (
            renderActiveView()
          )}
        </main>
      </div>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}

export default App;
