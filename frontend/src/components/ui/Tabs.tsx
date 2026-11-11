import React from 'react';
import { Icon, type IconName } from './Icon';

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  className = ''
}) => {
  return (
    <div className={`tabs-container ${className}`}>
      <div className="tabs-list" role="tablist">
        {items.map(item => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              className={`tab-btn ${isActive ? 'tab-btn-active' : ''}`}
              onClick={() => onChange(item.id)}
            >
              {item.icon && <Icon name={item.icon} size={16} />}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`tab-badge ${isActive ? 'tab-badge-active' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
