import React from 'react';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { Badge } from './Badge';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: IconName;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default'
}) => {
  return (
    <Card className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className={`stat-card-icon-wrapper stat-card-icon-${variant}`}>
          <Icon name={icon} size={20} />
        </div>
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {(subtitle || trend) && (
          <div className="stat-card-footer">
            {trend && (
              <Badge 
                variant={trend.isPositive ? 'success' : 'danger'} 
                size="sm"
                className="stat-card-badge"
              >
                <Icon 
                  name={trend.isPositive ? 'trending-up' : 'trending-down'} 
                  size={12} 
                />
                <span>{trend.value}</span>
              </Badge>
            )}
            {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};
