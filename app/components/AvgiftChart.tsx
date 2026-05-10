'use client';

import dynamic from 'next/dynamic';

const LineChart   = dynamic(() => import('recharts').then(m => m.LineChart),   { ssr: false });
const Line        = dynamic(() => import('recharts').then(m => m.Line),        { ssr: false });
const XAxis       = dynamic(() => import('recharts').then(m => m.XAxis),       { ssr: false });
const YAxis       = dynamic(() => import('recharts').then(m => m.YAxis),       { ssr: false });
const Tooltip     = dynamic(() => import('recharts').then(m => m.Tooltip),     { ssr: false });
const ResponsiveContainer = dynamic(
  () => import('recharts').then(m => m.ResponsiveContainer),
  { ssr: false },
);

type Point = { year: number; avgift: number };

export function AvgiftChart({ data }: { data: Point[] }) {
  if (data.length < 2) return null;

  const min = Math.min(...data.map(d => d.avgift));
  const max = Math.max(...data.map(d => d.avgift));
  const pad = (max - min) * 0.25 || 5;

  return (
    <div className="w-full" style={{ height: 140 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="year"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: '#8A8580' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[min - pad, max + pad]}
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: '#8A8580' }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
            width={36}
          />
          <Tooltip
            contentStyle={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              background: '#F6F2EB',
              border: '0.5px solid #D8D2C4',
              borderRadius: 0,
              padding: '6px 10px',
            }}
            formatter={(v: unknown) => {
              const n = typeof v === 'number' ? v : 0;
              return [`${n.toFixed(0)} kr/kvm`, 'Avgift'];
            }}
            labelFormatter={(y: unknown) => String(y)}
          />
          <Line
            type="monotone"
            dataKey="avgift"
            stroke="#8B2E2E"
            strokeWidth={1.5}
            dot={{ r: 3, fill: '#8B2E2E', strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
