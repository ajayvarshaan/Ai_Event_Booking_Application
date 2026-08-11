import React, { useId } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#667eea',
  fill = true,
  width = 120,
  height = 36,
}) => {
  const rawId = useId();
  const gid = `spark-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const linePoints = points.map((p) => `${p[0]},${p[1]}`).join(' ');
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <polygon points={areaPoints} fill={`url(#${gid})`} />}
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
