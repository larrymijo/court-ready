import { useState } from 'react';
import { Platform, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { formatShortDate } from '@/lib/format';
import { C } from '@/theme';

const FONT = Platform.OS === 'web' ? 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' : undefined;

export interface ChartPoint {
  x: number;
  y: number;
}

/** Small line chart: time on x, one measure on y, labels at the extremes. */
export function LineChart({
  points,
  height = 160,
  color = C.accent,
  formatY = (v: number) => String(Math.round(v)),
}: {
  points: ChartPoint[];
  height?: number;
  color?: string;
  formatY?: (v: number) => string;
}) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const padL = 8;
  const padR = 44;
  const padT = 14;
  const padB = 22;

  let content = null;
  if (width > 0 && points.length > 0) {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    let minY = Math.min(...ys);
    let maxY = Math.max(...ys);
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }
    const spread = maxY - minY;
    minY -= spread * 0.1;
    maxY += spread * 0.1;
    const w = width - padL - padR;
    const h = height - padT - padB;
    const sx = (x: number) => padL + (maxX === minX ? w / 2 : ((x - minX) / (maxX - minX)) * w);
    const sy = (y: number) => padT + (1 - (y - minY) / (maxY - minY)) * h;
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
    const hi = Math.max(...ys);
    const lo = Math.min(...ys);
    const last = points[points.length - 1];

    content = (
      <Svg width={width} height={height}>
        {[0, 0.5, 1].map((f) => (
          <Line
            key={f}
            x1={padL}
            x2={padL + w}
            y1={padT + f * h}
            y2={padT + f * h}
            stroke={C.border}
            strokeWidth={1}
          />
        ))}
        <SvgText x={padL + w + 6} y={sy(hi) + 4} fill={C.muted} fontSize={11} fontFamily={FONT}>
          {formatY(hi)}
        </SvgText>
        {lo !== hi ? (
          <SvgText x={padL + w + 6} y={sy(lo) + 4} fill={C.muted} fontSize={11} fontFamily={FONT}>
            {formatY(lo)}
          </SvgText>
        ) : null}
        {points.length > 1 ? <Path d={d} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" /> : null}
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={p === last ? 4.5 : 3}
            fill={p === last ? color : C.bg}
            stroke={color}
            strokeWidth={2}
          />
        ))}
        <SvgText x={padL} y={height - 5} fill={C.faint} fontSize={11} fontFamily={FONT}>
          {formatShortDate(minX)}
        </SvgText>
        {maxX !== minX ? (
          <SvgText x={padL + w} y={height - 5} fill={C.faint} fontSize={11} fontFamily={FONT} textAnchor="end">
            {formatShortDate(maxX)}
          </SvgText>
        ) : null}
      </Svg>
    );
  }

  return (
    <View onLayout={onLayout} style={{ height, width: '100%' }}>
      {content}
    </View>
  );
}
