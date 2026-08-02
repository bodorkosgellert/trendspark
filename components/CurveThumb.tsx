import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { palette } from '@/lib/palette';

/**
 * State of the signal, not an identity colour.
 *
 * A hue derived from the signal id would look livelier but it would put arbitrary
 * colours into a palette where accent means "rising" and amber means "closing".
 * The variation between tiles is the curve itself, which is the only part that
 * carries information a user can check against the full chart.
 */
export type CurveTone = 'up' | 'hot' | 'down';

const TONE_COLOR: Record<CurveTone, string> = {
  up: palette.accent,
  hot: palette.hot,
  down: palette.down,
};

interface CurveThumbProps {
  series: number[];
  size?: number;
  tone?: CurveTone;
  /** SVG gradient ids are global, so each tile needs its own. */
  gradientId: string;
}

const PAD = 5;

/** How many trailing days the tile draws. Enough to show a shape, not a wall. */
const POINTS = 30;

function buildTile(series: number[], size: number) {
  const points = series.slice(-POINTS);
  if (points.length === 0) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const inner = size - PAD * 2;
  const step = points.length > 1 ? inner / (points.length - 1) : inner;

  const coords = points.map((value, index) => ({
    x: PAD + index * step,
    y: PAD + inner - ((value - min) / range) * inner,
  }));

  const line = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
  const floor = (size - PAD).toFixed(1);
  const area = `${line} L${floor} ${floor} L${PAD} ${floor} Z`;

  return { line, area, last: coords[coords.length - 1] };
}

/**
 * Thumbnail-sized version of a signal's interest curve, for dense list rows.
 *
 * It reads like a list thumbnail but it is generated from the same series the
 * detail chart draws, so it is data rather than decoration — a user can check the
 * tile against the full timeline.
 */
export function CurveThumb({ series, size = 52, tone = 'up', gradientId }: CurveThumbProps) {
  const tile = buildTile(series, size);
  const color = TONE_COLOR[tone];

  return (
    <View
      className="border-border bg-panel-raised overflow-hidden rounded-xl border"
      style={{ width: size, height: size }}
    >
      {tile ? (
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.35} />
              <Stop offset="1" stopColor={color} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>
          <Path d={tile.area} fill={`url(#${gradientId})`} />
          <Path
            d={tile.line}
            stroke={color}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={tile.last.x} cy={tile.last.y} r={2.1} fill={color} />
        </Svg>
      ) : null}
    </View>
  );
}
