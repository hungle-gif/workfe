import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getStatusLabel } from '../../utils/format';

const COLORS = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  in_progress: '#a855f7',
  completed: '#22c55e',
  cancelled: '#ef4444'
};

export default function OrderStatusChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">Chưa có dữ liệu</div>;
  }

  const chartData = data.map(d => ({
    name: getStatusLabel(d.status),
    value: d.count,
    color: COLORS[d.status] || '#94a3b8'
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
