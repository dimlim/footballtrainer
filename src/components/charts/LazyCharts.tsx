import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading placeholder for charts
const ChartLoader = ({ height = 200 }: { height?: number }) => (
  <div 
    className="flex items-center justify-center bg-gray-50 rounded-xl animate-pulse"
    style={{ height }}
  >
    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
  </div>
);

// Wrapper components that lazy load recharts
interface BarChartProps {
  data: any[];
  height?: number;
  children?: React.ReactNode;
  className?: string;
}

export const LazyBarChart: React.FC<BarChartProps> = ({ data, height = 200, children, className }) => {
  return (
    <Suspense fallback={<ChartLoader height={height} />}>
      <LazyBarChartInner data={data} height={height} className={className}>
        {children}
      </LazyBarChartInner>
    </Suspense>
  );
};

const LazyBarChartInner: React.FC<BarChartProps> = ({ data, height, children, className }) => {
  const [Recharts, setRecharts] = React.useState<any>(null);

  React.useEffect(() => {
    import('recharts').then(module => {
      setRecharts(module);
    });
  }, []);

  if (!Recharts) return <ChartLoader height={height} />;

  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }} 
          />
          {children || <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface AreaChartProps {
  data: any[];
  height?: number;
  dataKey?: string;
  color?: string;
  className?: string;
}

export const LazyAreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  height = 200, 
  dataKey = 'value',
  color = '#3b82f6',
  className 
}) => {
  return (
    <Suspense fallback={<ChartLoader height={height} />}>
      <LazyAreaChartInner 
        data={data} 
        height={height} 
        dataKey={dataKey}
        color={color}
        className={className}
      />
    </Suspense>
  );
};

const LazyAreaChartInner: React.FC<AreaChartProps> = ({ data, height, dataKey, color, className }) => {
  const [Recharts, setRecharts] = React.useState<any>(null);

  React.useEffect(() => {
    import('recharts').then(module => {
      setRecharts(module);
    });
  }, []);

  if (!Recharts) return <ChartLoader height={height} />;

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export { ChartLoader };
