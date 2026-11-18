import * as d3 from 'd3';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Vehicle } from '../types/marketplace';

interface PricePoint {
  date: Date;
  label: string;
  marketAvg: number;
}

function generate12MonthTrend(vehicle: Vehicle): PricePoint[] {
  const base = vehicle.fairMarketPrice;
  const seed = vehicle.id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  // Build 12 monthly points ending Nov 2026
  const endYear = 2026;
  const endMonth = 10; // 0-indexed -> November
  const points: PricePoint[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(endYear, endMonth - i, 1);
    // Gentle realistic depreciation / seasonal wave converging onto fairMarketPrice at i=0
    const depreciationFactor = vehicle.condition === 'New' ? 0.0015 : 0.0045;
    const seasonal = Math.sin(((11 - i) + (seed % 5)) * 0.7) * 0.011;
    const microNoise = (((seed * (i + 3)) % 17) - 8) * 0.0012;
    const multiplier = i === 0 ? 1 : 1 + i * depreciationFactor + seasonal + microNoise;
    const marketAvg = Math.round((base * multiplier) / 50) * 50;

    points.push({
      date: d,
      label: d3.timeFormat('%b %Y')(d),
      marketAvg,
    });
  }

  return points;
}

export function MarketPriceTrendChart({ vehicle }: { vehicle: Vehicle }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(640);
  const [hovered, setHovered] = useState<{
    point: PricePoint;
    x: number;
    y: number;
  } | null>(null);

  const series = useMemo(() => generate12MonthTrend(vehicle), [vehicle]);

  const stats = useMemo(() => {
    const prices = series.map((p) => p.marketAvg);
    const high = Math.max(...prices, vehicle.price);
    const low = Math.min(...prices, vehicle.price);
    const first = series[0].marketAvg;
    const last = series[series.length - 1].marketAvg;
    const pctChange = ((last - first) / first) * 100;
    return { high, low, first, last, pctChange };
  }, [series, vehicle.price]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };
    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || width < 200) return;

    const height = 240;
    const margin = { top: 20, right: 20, bottom: 32, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(series, (d) => d.date) as [Date, Date])
      .range([0, innerW]);

    const yMin = Math.min(...series.map((d) => d.marketAvg), vehicle.price) * 0.96;
    const yMax = Math.max(...series.map((d) => d.marketAvg), vehicle.price) * 1.03;

    const y = d3.scaleLinear().domain([yMin, yMax]).nice().range([innerH, 0]);

    // Subtle horizontal gridlines
    const yTicks = y.ticks(4);
    g.append('g')
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#E2E8F0')
      .attr('stroke-dasharray', '3,3');

    // Gradient fill under market trend curve
    const defs = svg.append('defs');
    const grad = defs
      .append('linearGradient')
      .attr('id', `trend-grad-${vehicle.id}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#0F172A').attr('stop-opacity', 0.14);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#0F172A').attr('stop-opacity', 0);

    const area = d3
      .area<PricePoint>()
      .x((d) => x(d.date))
      .y0(innerH)
      .y1((d) => y(d.marketAvg))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(series)
      .attr('fill', `url(#trend-grad-${vehicle.id})`)
      .attr('d', area);

    // Reference dashed line for current listing price
    const listingY = y(vehicle.price);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', listingY)
      .attr('y2', listingY)
      .attr('stroke', '#16A34A')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,4');

    g.append('text')
      .attr('x', innerW - 4)
      .attr('y', Math.max(12, listingY - 6))
      .attr('text-anchor', 'end')
      .attr('fill', '#15803D')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text(`This Listing: $${vehicle.price.toLocaleString()}`);

    // Primary 12-month market price trend line
    const line = d3
      .line<PricePoint>()
      .x((d) => x(d.date))
      .y((d) => y(d.marketAvg))
      .curve(d3.curveMonotoneX);

    const path = g
      .append('path')
      .datum(series)
      .attr('fill', 'none')
      .attr('stroke', '#DC2626')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('d', line);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const totalLength = path.node()?.getTotalLength() ?? 0;
    if (totalLength > 0 && !prefersReduced) {
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(450)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Data point dots
    g.selectAll('circle.trend-dot')
      .data(series)
      .join('circle')
      .attr('class', 'trend-dot')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.marketAvg))
      .attr('r', 3)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#DC2626')
      .attr('stroke-width', 1.75);

    // X Axis
    const xAxis = d3
      .axisBottom(x)
      .ticks(width < 480 ? 4 : 6)
      .tickFormat((d) => d3.timeFormat('%b %y')(d as Date))
      .tickSizeOuter(0);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis)
      .call((axis) => axis.select('.domain').attr('stroke', '#CBD5E1'))
      .call((axis) =>
        axis.selectAll('text').attr('fill', '#64748B').attr('font-size', '11px'),
      );

    // Y Axis
    const yAxis = d3
      .axisLeft(y)
      .ticks(4)
      .tickFormat((d) => `$${Math.round(Number(d) / 1000)}k`)
      .tickSize(0);

    g.append('g')
      .call(yAxis)
      .call((axis) => axis.select('.domain').remove())
      .call((axis) =>
        axis
          .selectAll('text')
          .attr('fill', '#64748B')
          .attr('font-size', '11px')
          .attr('font-family', 'JetBrains Mono, monospace'),
      );

    // Hover crosshair & bisector overlay
    const focusLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .style('opacity', 0);

    const focusDot = g
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#DC2626')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    const bisect = d3.bisector<PricePoint, Date>((d) => d.date).center;

    g.append('rect')
      .attr('width', innerW)
      .attr('height', innerH)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const hoveredDate = x.invert(mx);
        const idx = bisect(series, hoveredDate);
        const pt = series[Math.max(0, Math.min(series.length - 1, idx))];
        const cx = x(pt.date);
        const cy = y(pt.marketAvg);

        focusLine.attr('x1', cx).attr('x2', cx).style('opacity', 1);
        focusDot.attr('cx', cx).attr('cy', cy).style('opacity', 1);

        setHovered({
          point: pt,
          x: cx + margin.left,
          y: cy + margin.top,
        });
      })
      .on('mouseleave', () => {
        focusLine.style('opacity', 0);
        focusDot.style('opacity', 0);
        setHovered(null);
      });
  }, [series, vehicle.id, vehicle.price, width]);

  const isDown = stats.pctChange <= 0;

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-950">
            12-Month Market Price Trend ({vehicle.year} {vehicle.make} {vehicle.model})
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Regional average retail valuation vs. this listing&apos;s asking price. Hover to inspect monthly data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums">
          <div className="flex items-center gap-1.5 font-semibold">
            {isDown ? (
              <TrendingDown className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-4 w-4 text-amber-600" aria-hidden="true" />
            )}
            <span className={isDown ? 'text-emerald-700' : 'text-amber-700'}>
              {stats.pctChange > 0 ? '+' : ''}
              {stats.pctChange.toFixed(1)}% YoY
            </span>
          </div>
          <span className="text-slate-300" aria-hidden="true">&middot;</span>
          <span className="text-slate-600">
            12m Range:{' '}
            <span className="font-mono font-semibold text-slate-900">
              ${stats.low.toLocaleString()}–${stats.high.toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 bg-red-600 inline-block rounded" aria-hidden="true" />
          <span>Regional Market Avg</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-0.5 w-4 border-t-2 border-dashed border-emerald-600 inline-block"
            aria-hidden="true"
          />
          <span>This Listing (${vehicle.price.toLocaleString()})</span>
        </span>
      </div>

      {/* D3 Chart Container */}
      <div ref={containerRef} className="relative mt-3 w-full select-none">
        <svg
          ref={svgRef}
          className="h-[240px] w-full overflow-visible"
          role="img"
          aria-label={`12-month market price trend chart for ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        />

        {hovered && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white shadow-lg"
            style={{
              left: Math.min(Math.max(hovered.x, 85), width - 85),
              top: Math.max(hovered.y - 10, 56),
            }}
          >
            <div className="font-semibold text-slate-300">{hovered.point.label}</div>
            <div className="mt-0.5 font-mono text-sm font-bold tabular-nums">
              ${hovered.point.marketAvg.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 tabular-nums">
              Listing saves ${(hovered.point.marketAvg - vehicle.price).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
