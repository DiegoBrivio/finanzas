import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';

export const ProfileSwitcher: React.FC = () => {
  const { currentProfile, profiles, switchProfile, isPersonal } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="profile-switcher-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`profile-switcher-trigger ${isPersonal ? 'mode-personal' : 'mode-empresa'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="profile-avatar">
          <Icon name={isPersonal ? 'user' : 'building'} size={18} />
        </div>
        <div className="profile-info">
          <span className="profile-label">
            {isPersonal ? 'FINANZAS PERSONALES' : 'FINANZAS EMPRESARIALES'}
          </span>
          <span className="profile-name">{currentProfile?.name}</span>
        </div>
        <Icon name="arrow-right" size={14} className={`profile-chevron ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <span>Seleccionar Espacio de Trabajo</span>
          </div>
          <div className="profile-dropdown-list">
            {profiles.map(p => {
              const isSelected = p.id === currentProfile?.id;
              const isP = p.type === 'personal';
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`profile-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    switchProfile(p.id);
                    setIsOpen(false);
                  }}
                >
                  <div className={`dropdown-item-avatar ${isP ? 'bg-indigo' : 'bg-emerald'}`}>
                    <Icon name={isP ? 'user' : 'building'} size={18} />
                  </div>
                  <div className="dropdown-item-details">
                    <div className="dropdown-item-top">
                      <span className="dropdown-item-name">{p.name}</span>
                      <Badge variant={isP ? 'info' : 'success'} size="sm">
                        {isP ? 'Personal' : 'Empresa'}
                      </Badge>
                    </div>
                    <span className="dropdown-item-id">
                      {isP ? 'Control de ingresos, gastos y ahorro' : 'Tesorería, facturación y costes'}
                    </span>
                  </div>
                  {isSelected && (
                    <Icon name="check-circle" size={18} className="text-primary selected-check" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};