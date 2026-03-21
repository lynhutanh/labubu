import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Plus, Trash2, Edit, Save, X, Calendar, Settings, Award, Image as ImageIcon, Target,
} from "lucide-react";
import {
  slotMachineService, SlotMachineConfigResponse, SlotMachineJackpotCombo,
} from "../../src/services/slot-machine.service";
import { fileService } from "../../src/services/file.service";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

type SymbolItem = { label: string; image: string };
type PrizeItem = { label: string; image: string };

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
  const [winRate] = useState(0);
  const [status, setStatus] = useState("active");
  const [symbols, setSymbols] = useState<SymbolItem[]>([]);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [jackpotCombos, setJackpotCombos] = useState<SlotMachineJackpotCombo[]>([]);
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
    setMaxSpinsPerUser(0); setStatus("active");
    setSymbols([]); setPrizes([]); setJackpotCombos([]); setEditingId(null); setShowForm(false);
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
    setStatus(config.status);
    setSymbols(config.symbols.map((s) => ({ ...s })));
    setPrizes(config.prizes.map((p) => ({ ...p })));
    setJackpotCombos((config.jackpotCombos || []).map((c) => ({ ...c })));
    setShowForm(true);
  };

  const addSymbol = () => setSymbols([...symbols, { label: "", image: "" }]);
  const removeSymbol = (i: number) => setSymbols(symbols.filter((_, idx) => idx !== i));
  const updateSymbol = (i: number, field: string, value: string) => {
    const u = [...symbols]; (u[i] as any)[field] = value; setSymbols(u);
  };


  const addCombo = () => {
    const usedIndexes = jackpotCombos.map((c) => c.symbolIndex);
    const nextIndex = symbols.findIndex((_, si) => !usedIndexes.includes(si));
    if (nextIndex === -1) { toast.error("Đã dùng hết symbol"); return; }
    setJackpotCombos([...jackpotCombos, { symbolIndex: nextIndex, prizeLabel: "", prizeImage: "", rate: 0 }]);
  };
  const removeCombo = (i: number) => setJackpotCombos(jackpotCombos.filter((_, idx) => idx !== i));
  const updateCombo = (i: number, field: keyof SlotMachineJackpotCombo, value: string | number) => {
    const u = [...jackpotCombos]; (u[i] as any)[field] = value; setJackpotCombos(u);
  };

  const handleUploadSymbolImage = async (index: number, file: File) => {
    try {
      const res = await fileService.uploadProductImage(file);
      updateSymbol(index, "image", res.url || res.filePath);
      toast.success("Tải ảnh thành công");
    } catch { toast.error("Tải ảnh thất bại"); }
  };

  const handleUploadComboImage = async (index: number, file: File) => {
    try {
      const res = await fileService.uploadProductImage(file);
      updateCombo(index, "prizeImage", res.url || res.filePath);
      toast.success("Tải ảnh thành công");
    } catch { toast.error("Tải ảnh thất bại"); }
  };

  const totalComboRate = jackpotCombos.reduce((sum, c) => sum + (Number(c.rate) || 0), 0);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Nhập tên sự kiện"); return; }
    if (!startDate || !endDate) { toast.error("Chọn thời gian sự kiện"); return; }
    if (symbols.length < 3) { toast.error("Cần ít nhất 3 ký hiệu"); return; }
    if (jackpotCombos.length > 0 && totalComboRate > 100) {
      toast.error(`Tổng tỉ lệ combo không được vượt quá 100% (hiện tại: ${totalComboRate}%)`); return;
    }

    const payload = {
      name, winRate,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      minSpentAmount, maxSpinsPerUser, status, symbols, prizes,
      jackpotCombos: jackpotCombos.length > 0 ? jackpotCombos : undefined,
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
    items: SymbolItem[],
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
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) onUpload(index, e.target.files[0]);
                  }} />
                </label>
              )}
            </div>
            <input
              value={item.label} onChange={(e) => onUpdate(index, "label", e.target.value)}
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

  const renderJackpotCombos = () => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-medium text-purple-200">Jackpot Combos — tỉ lệ theo từng combo ({jackpotCombos.length})</h3>
          {jackpotCombos.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${totalComboRate === 100 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
              Tổng: {totalComboRate}%
            </span>
          )}
        </div>
        <button onClick={addCombo} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs hover:bg-yellow-500/30 transition-all">
          <Plus className="w-3 h-3" /> Thêm combo
        </button>
      </div>
      {jackpotCombos.length === 0 ? (
        <p className="text-xs text-purple-400 bg-white/5 rounded-lg p-3 border border-purple-500/20">
          Không có combo → khi trúng sẽ random prize từ danh sách Phần thưởng bên trên.
        </p>
      ) : (
        <div className="space-y-3">
          {jackpotCombos.map((combo, index) => (
            <div key={index} className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-sm font-mono w-6">{index + 1}</span>
                <span className="text-yellow-300 text-xs font-semibold">COMBO</span>
                <button onClick={() => removeCombo(index)} className="ml-auto text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pl-8">
                <div>
                  <label className="block text-xs text-purple-300 mb-1">Symbol (index trong danh sách)</label>
                  <select
                    value={combo.symbolIndex}
                    onChange={(e) => updateCombo(index, "symbolIndex", Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white/10 border border-purple-500/30 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {symbols
                      .filter((_, si) => si === combo.symbolIndex || !jackpotCombos.some((c, ci) => ci !== index && c.symbolIndex === si))
                      .map((s, si) => {
                        const origIdx = symbols.indexOf(s);
                        return <option key={origIdx} value={origIdx} className="bg-gray-900">{origIdx + 1}. {s.label || `Symbol ${origIdx + 1}`}</option>;
                      })}
                    {symbols.length === 0 && <option value={0} className="bg-gray-900">— Thêm ký hiệu trước —</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-purple-300 mb-1">Tỉ lệ ra combo này (%)</label>
                  <input
                    type="number" min={0} max={100} step={0.1}
                    value={combo.rate}
                    onChange={(e) => updateCombo(index, "rate", Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white/10 border border-purple-500/30 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-purple-300 mb-1">Tên phần thưởng khi ra combo</label>
                  <input
                    value={combo.prizeLabel}
                    onChange={(e) => updateCombo(index, "prizeLabel", e.target.value)}
                    placeholder="VD: Xe máy Honda"
                    className="w-full px-2 py-1.5 bg-white/10 border border-purple-500/30 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-purple-300 mb-1">Ảnh phần thưởng</label>
                  <div className="flex items-center gap-2">
                    {combo.prizeImage ? (
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <img src={combo.prizeImage} alt="" className="w-10 h-10 rounded object-cover" />
                        <button onClick={() => updateCombo(index, "prizeImage", "")} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-10 h-10 border-2 border-dashed border-purple-500/30 rounded flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors flex-shrink-0">
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          if (e.target.files?.[0]) handleUploadComboImage(index, e.target.files[0]);
                        }} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className="pl-8">
                <p className="text-xs text-yellow-300/70">
                  3× <strong>{symbols[combo.symbolIndex]?.label || `Symbol ${combo.symbolIndex + 1}`}</strong> → <strong>{combo.prizeLabel || "(chưa đặt tên)"}</strong> ({combo.rate}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
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
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Trạng thái</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="active" className="bg-gray-900">Hoạt động</option>
                    <option value="inactive" className="bg-gray-900">Tắt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Bắt đầu</label>
                  <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Kết thúc</label>
                  <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Tỉ lệ trúng thưởng</label>
                  <div className="px-3 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-400">🏆 Trúng (tổng combo)</span>
                      <span className="text-green-400 font-bold">{totalComboRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">😔 Chúc bạn may mắn</span>
                      <span className="text-gray-400 font-bold">{Math.max(0, 100 - totalComboRate)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Số tiền mua tối thiểu / lượt (VNĐ)</label>
                  <input type="number" value={minSpentAmount} onChange={(e) => setMinSpentAmount(Number(e.target.value))} min={0} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Số lần chơi tối đa / người</label>
                  <input type="number" value={maxSpinsPerUser} onChange={(e) => setMaxSpinsPerUser(Number(e.target.value))} min={0} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <p className="text-xs text-purple-400 mt-1">0 = không giới hạn</p>
                </div>
              </div>

              {renderItemList(symbols, "Ký hiệu trên cuộn quay", addSymbol, removeSymbol, updateSymbol, handleUploadSymbolImage)}


              <div className="border-t border-purple-500/20 pt-4">
                {renderJackpotCombos()}
              </div>

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
              {configs.map((config) => {
                const isActive = config.status === "active";
                const now = new Date();
                const isRunning = isActive && new Date(config.startDate) <= now && new Date(config.endDate) >= now;
                const combos = config.jackpotCombos || [];

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
                          <span>Combos: <span className="text-yellow-400">{combos.length}</span></span>
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
                      {combos.length > 0 && (
                        <div>
                          <h4 className="text-sm text-purple-400 mb-2">Jackpot Combos</h4>
                          <div className="space-y-1">
                            {combos.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 bg-yellow-500/10 rounded-lg px-2 py-1 border border-yellow-500/20">
                                {c.prizeImage && <img src={c.prizeImage} alt="" className="w-6 h-6 rounded object-cover" />}
                                <span className="text-yellow-400 text-xs">
                                  3× {config.symbols[c.symbolIndex]?.label || `#${c.symbolIndex}`} → {c.prizeLabel} ({c.rate}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
