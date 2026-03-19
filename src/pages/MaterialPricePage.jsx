import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function fmt(v) { return v ? Number(v).toLocaleString('vi-VN') : '0'; }

const defaultCategories = [
  'Ống đồng & phụ kiện',
  'Dây điện & phụ kiện điện',
  'Gas lạnh',
  'Giá đỡ & khung treo',
  'Vật tư thi công',
  'Linh kiện thay thế',
  'Khác'
];

export default function MaterialPricePage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ category: '', name: '', unit: 'cái', price: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const isDirector = user.department === 'director';

  useEffect(() => { loadMaterials(); }, []);

  const loadMaterials = async () => {
    try {
      const res = await api.get('/decisions/materials');
      setMaterials(res.data.materials);
      setCategories(res.data.categories);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ category: defaultCategories[0], name: '', unit: 'cái', price: '', description: '' });
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({ category: m.category, name: m.name, unit: m.unit, price: m.price, description: m.description || '' });
    setShowForm(true);
  };

  const saveForm = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/decisions/materials/${editingId}`, { ...form, price: Number(form.price) || 0, active: 1 });
      } else {
        await api.post('/decisions/materials', { ...form, price: Number(form.price) || 0 });
      }
      setShowForm(false);
      setEditingId(null);
      loadMaterials();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deleteMaterial = async (id) => {
    if (!confirm('Xóa vật tư này?')) return;
    try {
      await api.delete(`/decisions/materials/${id}`);
      loadMaterials();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Đang tải...</div>;

  // Filter
  const filtered = materials.filter(m => {
    if (filterCat !== 'all' && m.category !== filterCat) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group filtered by category
  const grouped = {};
  for (const m of filtered) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  const allCats = [...new Set([...Object.keys(categories), ...defaultCategories])];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Bảng giá Vật tư</h1>
            <p className="text-sm text-gray-500">Nguyên liệu lắp đặt, bảo trì điều hòa ({materials.length} mục)</p>
          </div>
          {isDirector && (
            <button onClick={openAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              + Thêm vật tư
            </button>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white border-b px-6 py-3 flex gap-3">
        <input
          type="text" placeholder="Tìm kiếm vật tư..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="all">Tất cả danh mục</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Add/Edit form */}
        {showForm && isDirector && (
          <div className="max-w-3xl mb-6 bg-white rounded-xl p-5 shadow-sm border-2 border-blue-200">
            <h3 className="font-semibold text-gray-700 mb-3">{editingId ? 'Sửa vật tư' : 'Thêm vật tư mới'}</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Danh mục</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  {defaultCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tên vật tư</label>
                <input type="text" placeholder="VD: Ống đồng 9.52mm" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Đơn vị</label>
                <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  {['cái', 'mét', 'cuộn', 'bộ', 'kg', 'bình', 'hộp', 'gói', 'cặp'].map(u =>
                    <option key={u} value={u}>{u}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Đơn giá (VNĐ)</label>
                <input type="number" placeholder="0" value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Mô tả</label>
                <input type="text" placeholder="Ghi chú thêm" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveForm} disabled={saving || !form.name}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Materials by category */}
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔧</div>
            <div className="text-gray-500">Chưa có vật tư nào</div>
            {isDirector && <div className="text-sm text-gray-400 mt-1">Bấm "Thêm vật tư" để bắt đầu</div>}
          </div>
        ) : (
          <div className="max-w-5xl space-y-6">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {cat} ({items.length})
                </h3>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Tên vật tư</th>
                        <th className="text-center px-4 py-2.5 font-medium text-gray-600">Đơn vị</th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-600">Đơn giá</th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-600">Mô tả</th>
                        {isDirector && <th className="text-center px-4 py-2.5 font-medium text-gray-600 w-24"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(m => (
                        <tr key={m.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{m.unit}</td>
                          <td className="px-4 py-3 text-right font-semibold text-blue-700">{fmt(m.price)}đ</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{m.description || '-'}</td>
                          {isDirector && (
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => openEdit(m)}
                                className="text-blue-600 hover:text-blue-800 text-xs mr-2">Sửa</button>
                              <button onClick={() => deleteMaterial(m.id)}
                                className="text-red-500 hover:text-red-700 text-xs">Xóa</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
