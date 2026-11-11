import React from 'react';

interface ProgressBarProps {
  value: number; // percentage 0-100 (or more if exceeded)
  max?: number;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
  height?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  color = 'auto',
  height = 8,
  className = ''
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  let finalColor = color;
  if (color === 'auto') {
    if (value > 100) finalColor = 'danger';
    else if (value >= 85) finalColor = 'warning';
    else if (value >= 50) finalColor = 'primary';
    else finalColor = 'success';
  }

  return (
    <div className={`progress-container ${className}`}>
      {showLabel && (
        <div className="progress-label-row">
          <span className="progress-label-value">{value.toFixed(1)}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div
          className={`progress-fill progress-fill-${finalColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

