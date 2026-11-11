import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Icon, type IconName } from '../ui/Icon';

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  badge?: number | string;
  badgeColor?: 'danger' | 'warning' | 'info';
}

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { activeTab, setActiveTab, isCompany, invoices, budgets } = useFinance();

  // Compute alert badges
  const pendingInvoicesCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;
  const exceededBudgetsCount = budgets.filter(b => b.isExceeded).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Panel Principal', icon: 'pie-chart' },
    { id: 'transactions', label: 'Transacciones', icon: 'credit-card' },
    { 
      id: 'budgets', 
      label: isCompany ? 'Presupuesto OPEX' : 'Presupuestos', 
      icon: 'layers',
      badge: exceededBudgetsCount > 0 ? exceededBudgetsCount : undefined,
      badgeColor: 'danger'
    },
    // Contextual item
    ...(isCompany ? [
      { 
        id: 'invoices', 
        label: 'Facturación B2B', 
        icon: 'file-text' as IconName,
        badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : undefined,
        badgeColor: 'warning' as const
      }
    ] : [
      { id: 'goals', label: 'Metas de Ahorro', icon: 'target' as IconName }
    ]),
    { id: 'reports', label: 'Informes & Ratios', icon: 'trending-up' }
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-icon">
          <Icon name="wallet" size={24} />
        </div>
        <div className="brand-text">
          <span className="brand-name">FinanceManager</span>
          <span className="brand-tag">360° Management</span>
        </div>
      </div>

      <div className="sidebar-section-label">NAVEGACIÓN</div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                onItemClick?.();
              }}
            >
              <div className="nav-item-icon">
                <Icon name={item.icon} size={18} />
              </div>
              <span className="nav-item-label">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`nav-item-badge badge-${item.badgeColor || 'info'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status-indicator">
          <span className="status-ping" />
          <div className="status-text">
            <span className="status-title">Supabase Cloud DB</span>
            <span className="status-sub">Sincronización en la nube</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
