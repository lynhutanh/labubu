import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Plus, Trash2, Edit, Save, X, Calendar, Settings, Award, Image as ImageIcon,
} from "lucide-react";
import { slotMachineService, SlotMachineConfigResponse } from "../../src/services/slot-machine.service";
import { fileService } from "../../src/services/file.service";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

export default function SlotMachineConfigPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<SlotMachineConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minSpentAmount, setMinSpentAmount] = useState(0);
  const [maxSpinsPerUser, setMaxSpinsPerUser] = useState(0);
  const [winRate, setWinRate] = useState(5);
  const [status, setStatus] = useState("active");
  const [symbols, setSymbols] = useState<Array<{ label: string; image: string }>>([]);
  const [prizes, setPrizes] = useState<Array<{ label: string; image: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) { router.push("/login"); return; }
    loadConfigs();
  }, [router]);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await slotMachineService.getConfigs();
      setConfigs(data);
    } catch {
      toast.error("Không thể tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(""); setStartDate(""); setEndDate(""); setMinSpentAmount(0);
    setMaxSpinsPerUser(0); setWinRate(5); setStatus("active");
    setSymbols([]); setPrizes([]); setEditingId(null); setShowForm(false);
  };

  const openCreateForm = () => { resetForm(); setShowForm(true); };

  const openEditForm = (config: SlotMachineConfigResponse) => {
    setEditingId(config._id);
    setName(config.name);
    const toLocal = (d: string) => {
      const dt = new Date(d);
      dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
      return dt.toISOString().slice(0, 16);
    };
    setStartDate(config.startDate ? toLocal(config.startDate) : "");
    setEndDate(config.endDate ? toLocal(config.endDate) : "");
    setMinSpentAmount(config.minSpentAmount || 0);
    setMaxSpinsPerUser(config.maxSpinsPerUser || 0);
    setWinRate(config.winRate);
    setStatus(config.status);
    setSymbols(config.symbols.map(s => ({ ...s })));
    setPrizes(config.prizes.map(p => ({ ...p })));
    setShowForm(true);
  };

  const addSymbol = () => setSymbols([...symbols, { label: "", image: "" }]);
  const removeSymbol = (i: number) => setSymbols(symbols.filter((_, idx) => idx !== i));
  const updateSymbol = (i: number, field: string, value: string) => {
    const u = [...symbols]; (u[i] as any)[field] = value; setSymbols(u);
  };

  const addPrize = () => setPrizes([...prizes, { label: "", image: "" }]);
  const removePrize = (i: number) => setPrizes(prizes.filter((_, idx) => idx !== i));
  const updatePrize = (i: number, field: string, value: string) => {
    const u = [...prizes]; (u[i] as any)[field] = value; setPrizes(u);
  };

  const handleUploadSymbolImage = async (index: number, file: File) => {
    try {
      const res = await fileService.uploadProductImage(file);
      updateSymbol(index, "image", res.url || res.filePath);
      toast.success("Tải ảnh thành công");
    } catch { toast.error("Tải ảnh thất bại"); }
  };

  const handleUploadPrizeImage = async (index: number, file: File) => {
    try {
      const res = await fileService.uploadProductImage(file);
      updatePrize(index, "image", res.url || res.filePath);
      toast.success("Tải ảnh thành công");
    } catch { toast.error("Tải ảnh thất bại"); }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Nhập tên sự kiện"); return; }
    if (!startDate || !endDate) { toast.error("Chọn thời gian sự kiện"); return; }
    if (symbols.length < 3) { toast.error("Cần ít nhất 3 ký hiệu"); return; }
    if (prizes.length < 1) { toast.error("Cần ít nhất 1 phần thưởng"); return; }

    const payload = {
      name, winRate,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      minSpentAmount, maxSpinsPerUser, status, symbols, prizes,
    };

    try {
      setSaving(true);
      if (editingId) {
        await slotMachineService.updateConfig(editingId, payload);
        toast.success("Cập nhật thành công");
      } else {
        await slotMachineService.createConfig(payload);
        toast.success("Tạo thành công");
      }
      resetForm(); loadConfigs();
    } catch (error: any) {
      toast.error(error?.message || "Lưu thất bại");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa cấu hình này?")) return;
    try {
      await slotMachineService.deleteConfig(id);
      toast.success("Đã xóa"); loadConfigs();
    } catch { toast.error("Xóa thất bại"); }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString("vi-VN");

  if (!mounted) return null;

  const renderItemList = (
    items: Array<{ label: string; image: string }>,
    title: string,
    onAdd: () => void,
    onRemove: (i: number) => void,
    onUpdate: (i: number, field: string, value: string) => void,
    onUpload: (i: number, file: File) => void,
  ) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-purple-200">{title} ({items.length})</h3>
        <button onClick={onAdd} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs hover:bg-yellow-500/30 transition-all">
          <Plus className="w-3 h-3" /> Thêm
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-purple-500/20">
            <span className="text-purple-400 text-sm font-mono mt-2 w-6">{index + 1}</span>
            <div className="flex-shrink-0">
              {item.image ? (
                <div className="relative w-16 h-16">
                  <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <button onClick={() => onUpdate(index, "image", "")} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 border-2 border-dashed border-purple-500/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    if (e.target.files?.[0]) onUpload(index, e.target.files[0]);
                  }} />
                </label>
              )}
            </div>
            <input
              value={item.label} onChange={e => onUpdate(index, "label", e.target.value)}
              placeholder="Tên" className="flex-1 px-2 py-1.5 bg-white/10 border border-purple-500/30 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-300 mt-1.5">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <Head><title>Slot Machine - Labubu Admin</title></Head>
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              🎰 Cấu hình Slot Machine
            </h1>
            <div className="flex gap-2">
              <a href="/slot-machine/results" className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg font-medium hover:bg-white/20 transition-all">
                <Award className="w-5 h-5" /> Kết quả
              </a>
              <button onClick={openCreateForm} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all" style={{ boxShadow: "0 0 20px rgba(236,72,153,0.4)" }}>
                <Plus className="w-5 h-5" /> Tạo sự kiện
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {showForm && (
            <div className="galaxy-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{editingId ? "Sửa cấu hình" : "Tạo cấu hình mới"}</h2>
                <button onClick={resetForm} className="text-purple-300 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Tên sự kiện</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Trạng thái</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="active" className="bg-gray-900">Hoạt động</option>
                    <option value="inactive" className="bg-gray-900">Tắt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Bắt đầu</label>
                  <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Kết thúc</label>
                  <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Tỉ lệ trúng thưởng (%)</label>
                  <input type="number" value={winRate} onChange={e => setWinRate(Number(e.target.value))} min={0} max={100} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <p className="text-xs text-purple-400 mt-1">VD: 5 = 5% cơ hội ra 3 ký hiệu giống nhau</p>
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Số tiền mua tối thiểu / lượt (VNĐ)</label>
                  <input type="number" value={minSpentAmount} onChange={e => setMinSpentAmount(Number(e.target.value))} min={0} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Số lần chơi tối đa / người</label>
                  <input type="number" value={maxSpinsPerUser} onChange={e => setMaxSpinsPerUser(Number(e.target.value))} min={0} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <p className="text-xs text-purple-400 mt-1">0 = không giới hạn</p>
                </div>
              </div>

              {renderItemList(symbols, "Ký hiệu trên cuộn quay", addSymbol, removeSymbol, updateSymbol, handleUploadSymbolImage)}
              {renderItemList(prizes, "Phần thưởng khi trúng", addPrize, removePrize, updatePrize, handleUploadPrizeImage)}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={resetForm} className="px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg hover:bg-white/20 transition-all">Hủy</button>
                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Đang tải...</p>
            </div>
          ) : configs.length === 0 && !showForm ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <Settings className="w-16 h-16 text-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Chưa có cấu hình nào</p>
              <button onClick={openCreateForm} className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
                Tạo sự kiện đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map(config => {
                const isActive = config.status === "active";
                const now = new Date();
                const isRunning = isActive && new Date(config.startDate) <= now && new Date(config.endDate) >= now;

                return (
                  <div key={config._id} className="galaxy-card rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">🎰 {config.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${isRunning ? "bg-green-500/20 text-green-400 border-green-500/30" : isActive ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                            {isRunning ? "Đang chạy" : isActive ? "Chờ chạy" : "Tắt"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-purple-300">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(config.startDate)} ~ {formatDate(config.endDate)}</span>
                          <span>Tỉ lệ trúng: <span className="text-yellow-400">{config.winRate}%</span></span>
                          <span>Ký hiệu: {config.symbols.length}</span>
                          <span>Phần thưởng: {config.prizes.length}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditForm(config)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs hover:bg-blue-500/30 transition-all">
                          <Edit className="w-3 h-3" /> Sửa
                        </button>
                        <button onClick={() => handleDelete(config._id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-500/30 transition-all">
                          <Trash2 className="w-3 h-3" /> Xóa
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm text-purple-400 mb-2">Ký hiệu</h4>
                        <div className="flex flex-wrap gap-2">
                          {config.symbols.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                              {s.image && <img src={s.image} alt="" className="w-8 h-8 rounded object-cover" />}
                              <span className="text-white text-sm">{s.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm text-purple-400 mb-2">Phần thưởng</h4>
                        <div className="flex flex-wrap gap-2">
                          {config.prizes.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 bg-yellow-500/10 rounded-lg px-2 py-1 border border-yellow-500/20">
                              {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />}
                              <span className="text-yellow-400 text-sm">{p.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
