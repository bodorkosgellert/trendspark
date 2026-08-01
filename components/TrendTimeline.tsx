import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui/Text';
import { palette } from '@/lib/palette';

interface TrendTimelineProps {
  /** Daily interest points, oldest first. */
  history: number[];
  /** How many trailing days to draw. */
  range: number;
  /** Index into `history` where tracking began; draws a dashed marker. */
  markerIndex?: number;
  markerLabel?: string;
  height?: number;
  gradientId: string;
  color?: string;
  /** A second series drawn on the same scale, for comparing two markets. */
  compare?: number[];
  compareColor?: string;
}

interface Bounds {
  min: number;
  max: number;
}

function boundsOf(series: number[][]): Bounds {
  const all = series.flat();
  const min = Math.min(...all);
  const max = Math.max(...all);
  return { min, max: max === min ? min + 1 : max };
}

function buildGeometry(series: number[], width: number, height: number, bounds: Bounds) {
  const span = bounds.max - bounds.min || 1;
  const step = series.length > 1 ? width / (series.length - 1) : width;
  const pad = 4;
  const usable = height - pad * 2;

  const coords = series.map((value, index) => ({
    x: index * step,
    y: pad + usable - ((value - bounds.min) / span) * usable,
  }));

  const line = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
  const area = `${line} L${width.toFixed(2)} ${height} L0 ${height} Z`;

  return { line, area, coords };
}

export function TrendTimeline({
  history,
  range,
  markerIndex,
  markerLabel,
  height = 132,
  gradientId,
  color = palette.accent,
  compare,
  compareColor = palette.inkDim,
}: TrendTimelineProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    if (Math.abs(next - width) > 1) setWidth(next);
  };

  const visible = history.slice(-range);
  const compareVisible = compare ? compare.slice(-range) : null;
  const offset = history.length - visible.length;
  const marker =
    markerIndex === undefined || markerIndex - offset < 0 ? null : markerIndex - offset;

  const drawable = width > 0 && visible.length > 1;
  const bounds = drawable ? boundsOf(compareVisible ? [visible, compareVisible] : [visible]) : null;
  const geometry = bounds ? buildGeometry(visible, width, height, bounds) : null;
  const compareGeometry =
    bounds && compareVisible && compareVisible.length > 1
      ? buildGeometry(compareVisible, width, height, bounds)
      : null;

  const markerPoint = geometry && marker !== null ? geometry.coords[marker] : null;
  const nowPoint = geometry ? geometry.coords[geometry.coords.length - 1] : null;
  const comparePoint = compareGeometry
    ? compareGeometry.coords[compareGeometry.coords.length - 1]
    : null;

  return (
    <View className="gap-2">
      <View onLayout={onLayout} style={{ height, width: '100%' }}>
        {geometry ? (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.26} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={geometry.area} fill={`url(#${gradientId})`} />
            {markerPoint ? (
              <>
                <Line
                  x1={markerPoint.x}
                  y1={0}
                  x2={markerPoint.x}
                  y2={height}
                  stroke={palette.muted}
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
                <Circle
                  cx={markerPoint.x}
                  cy={markerPoint.y}
                  r={3.5}
                  fill={palette.canvas}
                  stroke={palette.muted}
                  strokeWidth={1.5}
                />
              </>
            ) : null}
            {compareGeometry ? (
              <Path
                d={compareGeometry.line}
                stroke={compareColor}
                strokeWidth={1.6}
                strokeDasharray="5 4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {comparePoint ? (
              <Circle cx={comparePoint.x - 1} cy={comparePoint.y} r={2.6} fill={compareColor} />
            ) : null}
            <Path
              d={geometry.line}
              stroke={color}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {nowPoint ? <Circle cx={nowPoint.x - 1} cy={nowPoint.y} r={3.5} fill={color} /> : null}
          </Svg>
        ) : null}
      </View>

      <View className="flex-row items-center justify-between">
        <AppText weight="medium" className="text-ink-dim text-[10px]">
          {visible.length}d ago
        </AppText>
        {markerPoint && markerLabel ? (
          <AppText weight="medium" className="text-muted text-[10px]">
            {markerLabel}
          </AppText>
        ) : null}
        <AppText weight="medium" className="text-ink-dim text-[10px]">
          Today
        </AppText>
      </View>
    </View>
  );
}
