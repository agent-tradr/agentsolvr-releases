import React, { useState, useEffect, useMemo } from 'react';

export interface ProgressData {
  id: string;
  label: string;
  value: number;
  max: number;
  color?: string;
  category?: string;
  timestamp?: Date;
  trend?: 'up' | 'down' | 'stable';
}

export interface ProgressVisualizationProps {
  data: ProgressData[];
  type?: 'bar' | 'circle' | 'line' | 'ring';
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  animated?: boolean;
  sortBy?: 'value' | 'label' | 'category' | 'timestamp';
  sortOrder?: 'asc' | 'desc';
  filterCategory?: string;
  onProgressClick?: (progress: ProgressData) => void;
  height?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  data,
  type = 'bar',
  showLabels = true,
  showValues = true,
  showPercentages = false,
  animated = true,
  sortBy = 'value',
  sortOrder = 'desc',
  filterCategory,
  onProgressClick,
  height = 300,
  className = '',
  theme = 'light'
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const animation = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 100) {
            clearInterval(animation);
            return 100;
          }
          return prev + 2;
        });
      }, 20);

      return () => clearInterval(animation);
    } else {
      setAnimationProgress(100);
    }
  }, [animated, data]);

  const processedData = useMemo(() => {
    let filtered = filterCategory 
      ? data.filter(item => item.category === filterCategory)
      : data;

    return filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'value':
          compareValue = (a.value / a.max) - (b.value / b.max);
          break;
        case 'label':
          compareValue = a.label.localeCompare(b.label);
          break;
        case 'category':
          compareValue = (a.category || '').localeCompare(b.category || '');
          break;
        case 'timestamp':
          const aTime = a.timestamp?.getTime() || 0;
          const bTime = b.timestamp?.getTime() || 0;
          compareValue = aTime - bTime;
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }, [data, sortBy, sortOrder, filterCategory]);

  const getDefaultColor = (index: number): string => {
    const colors = [
      '#2196F3', '#4CAF50', '#FF9800', '#F44336',
      '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'
    ];
    return colors[index % colors.length];
  };

  const getPercentage = (value: number, max: number): number => {
    return Math.round((value / max) * 100);
  };

  const getAnimatedValue = (targetValue: number): number => {
    return (targetValue * animationProgress) / 100;
  };

  const handleItemClick = (item: ProgressData) => {
    if (onProgressClick) {
      onProgressClick(item);
    }
  };

  const renderBarChart = () => (
    <div className="bar-chart">
      {processedData.map((item, index) => {
        const percentage = getPercentage(item.value, item.max);
        const animatedPercentage = getAnimatedValue(percentage);
        const color = item.color || getDefaultColor(index);

        return (
          <div
            key={item.id}
            className="bar-item"
            onClick={() => handleItemClick(item)}
            style={{ cursor: onProgressClick ? 'pointer' : 'default' }}
          >
            {showLabels && (
              <div className="bar-label">
                {item.label}
                {item.trend && (
                  <span className={`trend-indicator ${item.trend}`}>
                    {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                  </span>
                )}
              </div>
            )}
            
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${animatedPercentage}%`,
                  backgroundColor: color,
                  transition: animated ? 'width 0.3s ease' : 'none'
                }}
              />
              
              {(showValues || showPercentages) && (
                <div className="bar-value">
                  {showValues && `${item.value}/${item.max}`}
                  {showValues && showPercentages && ' '}
                  {showPercentages && `(${percentage}%)`}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCircleChart = () => (
    <div className="circle-chart">
      {processedData.map((item, index) => {
        const percentage = getPercentage(item.value, item.max);
        const animatedPercentage = getAnimatedValue(percentage);
        const color = item.color || getDefaultColor(index);
        const circumference = 2 * Math.PI * 45;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (circumference * animatedPercentage) / 100;

        return (
          <div
            key={item.id}
            className="circle-item"
            onClick={() => handleItemClick(item)}
            style={{ cursor: onProgressClick ? 'pointer' : 'default' }}
          >
            <svg className="circle-svg" width="120" height="120">
              <circle
                className="circle-background"
                cx="60"
                cy="60"
                r="45"
                fill="transparent"
                stroke="#e0e0e0"
                strokeWidth="8"
              />
              <circle
                className="circle-progress"
                cx="60"
                cy="60"
                r="45"
                fill="transparent"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 60 60)"
                style={{
                  transition: animated ? 'stroke-dashoffset 0.5s ease' : 'none'
                }}
              />
            </svg>
            
            <div className="circle-content">
              <div className="circle-percentage">{percentage}%</div>
              {showLabels && <div className="circle-label">{item.label}</div>}
              {showValues && (
                <div className="circle-value">{item.value}/{item.max}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderRingChart = () => {
    const totalValue = processedData.reduce((sum, item) => sum + item.value, 0);
    let cumulativeAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return (
      <div className="ring-chart">
        <svg className="ring-svg" width="200" height="200">
          {processedData.map((item, index) => {
            const percentage = (item.value / totalValue) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = cumulativeAngle;
            const endAngle = startAngle + angle;
            
            cumulativeAngle += angle;
            
            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            const color = item.color || getDefaultColor(index);

            return (
              <path
                key={item.id}
                d={pathData}
                fill={color}
                stroke="#fff"
                strokeWidth="2"
                onClick={() => handleItemClick(item)}
                style={{ cursor: onProgressClick ? 'pointer' : 'default' }}
              />
            );
          })}
        </svg>
        
        {showLabels && (
          <div className="ring-legend">
            {processedData.map((item, index) => (
              <div key={item.id} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: item.color || getDefaultColor(index) }}
                />
                <span className="legend-label">{item.label}</span>
                {showValues && (
                  <span className="legend-value">({item.value})</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLineChart = () => (
    <div className="line-chart">
      <svg className="line-svg" width="100%" height={height}>
        {processedData.map((item, index) => {
          const x = (index / (processedData.length - 1)) * 100;
          const percentage = getPercentage(item.value, item.max);
          const y = 100 - percentage;
          const animatedY = 100 - getAnimatedValue(percentage);
          const color = item.color || getDefaultColor(index);

          return (
            <g key={item.id}>
              <circle
                cx={`${x}%`}
                cy={`${animatedY}%`}
                r="4"
                fill={color}
                onClick={() => handleItemClick(item)}
                style={{ cursor: onProgressClick ? 'pointer' : 'default' }}
              />
              {showLabels && (
                <text
                  x={`${x}%`}
                  y="95%"
                  textAnchor="middle"
                  fontSize="12"
                  fill={theme === 'dark' ? '#fff' : '#333'}
                >
                  {item.label}
                </text>
              )}
            </g>
          );
        })}
        
        {processedData.length > 1 && (
          <polyline
            fill="none"
            stroke="#2196F3"
            strokeWidth="2"
            points={processedData.map((item, index) => {
              const x = (index / (processedData.length - 1)) * 100;
              const percentage = getAnimatedValue(getPercentage(item.value, item.max));
              const y = 100 - percentage;
              return `${x}%,${y}%`;
            }).join(' ')}
          />
        )}
      </svg>
    </div>
  );

  const renderVisualization = () => {
    switch (type) {
      case 'circle':
        return renderCircleChart();
      case 'ring':
        return renderRingChart();
      case 'line':
        return renderLineChart();
      case 'bar':
      default:
        return renderBarChart();
    }
  };

  const containerClass = `progress-visualization ${type} ${theme} ${className}`;

  return (
    <div className={containerClass} style={{ height }}>
      {processedData.length > 0 ? (
        renderVisualization()
      ) : (
        <div className="empty-state">
          <p>No progress data available</p>
        </div>
      )}

      <style>{`
        .progress-visualization {
          padding: 16px;
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          border-radius: 8px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
        }

        .bar-item {
          margin-bottom: 8px;
        }

        .bar-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 14px;
          font-weight: 500;
        }

        .trend-indicator {
          font-size: 12px;
          font-weight: bold;
        }

        .trend-indicator.up {
          color: #4CAF50;
        }

        .trend-indicator.down {
          color: #F44336;
        }

        .trend-indicator.stable {
          color: #FF9800;
        }

        .bar-container {
          position: relative;
          height: 24px;
          background: ${theme === 'dark' ? '#404040' : '#f0f0f0'};
          border-radius: 12px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 12px;
        }

        .bar-value {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          font-weight: 500;
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .circle-chart {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          align-items: center;
          height: 100%;
        }

        .circle-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .circle-svg {
          position: relative;
        }

        .circle-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .circle-percentage {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .circle-label {
          font-size: 12px;
          margin-bottom: 2px;
        }

        .circle-value {
          font-size: 10px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .ring-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .ring-svg {
          margin-bottom: 16px;
        }

        .ring-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .line-chart {
          height: 100%;
          position: relative;
        }

        .line-svg {
          width: 100%;
          height: 100%;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ProgressVisualization;