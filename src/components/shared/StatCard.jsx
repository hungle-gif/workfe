const colorMap = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  purple: 'bg-purple-50 text-purple-700',
  emerald: 'bg-emerald-50 text-emerald-700'
};

export default function StatCard({ title, value, icon, color = 'blue' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${colorMap[color]}`}>{icon}</span>
      </div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
