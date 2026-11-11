import React from 'react';
import { Icon, type IconName } from './Icon';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      <div className="input-wrapper">
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon-left">
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          id={inputId}
          className={`form-input ${icon && iconPosition === 'left' ? 'pl-input-icon' : ''} ${icon && iconPosition === 'right' ? 'pr-input-icon' : ''}`}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="input-icon input-icon-right">
            <Icon name={icon} size={18} />
          </span>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
      {!error && helperText && <span className="form-helper">{helperText}</span>}
    </div>
  );
};
