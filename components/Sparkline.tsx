/**
 * Sparkline — compact SVG line chart for MetricCards.
 * Renders 2-20 data points as a smooth line.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { colors } from './design-tokens';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = colors.accent,
  strokeWidth = 1.2,
}: SparklineProps) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * chartW;
      const y = padding + chartH - ((v - min) / range) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
