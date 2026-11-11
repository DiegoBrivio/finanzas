import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ProfileSwitcher } from './ProfileSwitcher';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface NavbarProps {
  onOpenNewTransaction: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTransaction, onToggleSidebar }) => {
  const { activeTab, refreshData, loading, isCompany, theme, toggleTheme } = useFinance();

  const tabTitles: Record<string, string> = {
    dashboard: 'Panel de Control Financiero',
    transactions: 'Registro de Transacciones y Movimientos',
    budgets: isCompany ? 'Control Presupuestario por Centros' : 'Presupuestos Mensuales',
    invoices: 'Gestión de Cuentas por Cobrar y Pagar',
    goals: 'Objetivos Financieros y Metas de Ahorro',
    reports: 'Informes Ejecutivos y Ratios de Liquidez'
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        {onToggleSidebar && (
          <button 
            type="button" 
            className="navbar-mobile-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <Icon name="layers" size={20} />
          </button>
        )}
        <div className="navbar-heading">
          <h1 className="navbar-title">{tabTitles[activeTab] || 'Finanzas'}</h1>
          <span className="navbar-subtitle">{isCompany ? 'Espacio Corporativo' : 'Espacio Personal'}</span>
        </div>
      </div>

      <div className="navbar-right">
        <ProfileSwitcher />

        <button
          type="button"
          className="navbar-icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Alternar tema claro y oscuro"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>

        <button
          type="button"
          className="navbar-icon-btn"
          onClick={() => refreshData()}
          title="Actualizar datos"
          disabled={loading}
        >
          <Icon name="refresh" size={18} className={loading ? 'spin-animation' : ''} />
        </button>

        <Button
          variant={isCompany ? 'success' : 'primary'}
          size="md"
          icon="plus"
          onClick={onOpenNewTransaction}
          className="navbar-new-tx-btn"
        >
          <span className="navbar-btn-text">Nuevo Movimiento</span>
        </Button>
      </div>
    </header>
  );
};