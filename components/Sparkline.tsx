import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { palette } from '@/lib/palette';

interface SparklineProps {
  series: number[];
  height?: number;
  color?: string;
  /** Fill the area under the line with a fading gradient. */
  area?: boolean;
  strokeWidth?: number;
  gradientId?: string;
}

function buildPaths(series: number[], width: number, height: number) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const step = series.length > 1 ? width / (series.length - 1) : width;
  const pad = 2;
  const usable = height - pad * 2;

  const points = series.map((value, index) => {
    const x = index * step;
    const y = pad + usable - ((value - min) / range) * usable;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point}`).join(' ');
  const area = `${line} L${width.toFixed(2)} ${height} L0 ${height} Z`;
  return { line, area };
}

export function Sparkline({
  series,
  height = 44,
  color = palette.accent,
  area = true,
  strokeWidth = 2,
  gradientId = 'sparkFill',
}: SparklineProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    if (Math.abs(next - width) > 1) setWidth(next);
  };

  const paths = width > 0 ? buildPaths(series, width, height) : null;

  return (
    <View onLayout={onLayout} style={{ height, width: '100%' }}>
      {paths ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.28} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {area ? <Path d={paths.area} fill={`url(#${gradientId})`} /> : null}
          <Path
            d={paths.line}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}
