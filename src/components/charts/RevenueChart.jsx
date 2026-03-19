import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatAmount = (value) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'tr';
  if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
  return value;
};

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">Chưa có dữ liệu</div>;
  }

  const chartData = data.map(d => ({
    month: d.month,
    'Thu': d.income,
    'Chi': d.expense
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatAmount} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'} />
        <Legend />
        <Bar dataKey="Thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Chi" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
