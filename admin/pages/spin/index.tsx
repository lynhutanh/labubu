import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Plus, Trash2, Edit, Save, X, Calendar, Settings, Award, Image as ImageIcon,
} from "lucide-react";
import { spinService, SpinConfigResponse } from "../../src/services/spin.service";
import { fileService } from "../../src/services/file.service";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

const SLOT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  prize: { label: "Giải thưởng", color: "text-yellow-400" },
  lose: { label: "May mắn lần sau", color: "text-gray-400" },
  extra_turn: { label: "+1 Lượt quay", color: "text-green-400" },
};

export default function SpinConfigPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<SpinConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minSpentAmount, setMinSpentAmount] = useState(0);
  const [maxSpinsPerUser, setMaxSpinsPerUser] = useState(0);
  const [status, setStatus] = useState("active");
  const [slots, setSlots] = useState<Array<{
    label: string;
    image: string;
    rate: number;
    type: "prize" | "lose" | "extra_turn";
  }>>([]);
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
      const data = await spinService.getConfigs();
      setConfigs(data);
    } catch {
      toast.error("Không thể tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setStartDate("");
    setEndDate("");
    setMinSpentAmount(0);
    setMaxSpinsPerUser(0);
    setStatus("active");
    setSlots([]);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (config: SpinConfigResponse) => {
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
    setSlots(config.slots.map(s => ({ ...s })));
    setShowForm(true);
  };

  const addSlot = (type: "prize" | "lose" | "extra_turn") => {
    setSlots([
      ...slots,
      {
        label: type === "lose" ? "Chúc bạn may mắn lần sau" : type === "extra_turn" ? "+1 Lượt quay" : "",
        image: "",
        rate: 0,
        type,
      },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: any) => {
    const updated = [...slots];
    (updated[index] as any)[field] = value;
    setSlots(updated);
  };

  const handleUploadImage = async (index: number, file: File) => {
    try {
      const res = await fileService.uploadProductImage(file);
      updateSlot(index, "image", res.url || res.filePath);
      toast.success("Tải ảnh thành công");
    } catch {
      toast.error("Tải ảnh thất bại");
    }
  };

  const totalRate = slots.reduce((sum, s) => sum + Number(s.rate), 0);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Nhập tên sự kiện"); return; }
    if (!startDate || !endDate) { toast.error("Chọn thời gian sự kiện"); return; }
    if (slots.length < 2) { toast.error("Cần ít nhất 2 ô"); return; }
    if (totalRate !== 100) { toast.error(`Tổng tỉ lệ phải = 100%, hiện tại: ${totalRate}%`); return; }

    const payload = {
      name,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      minSpentAmount,
      maxSpinsPerUser,
      status,
      slots: slots.map(s => ({ ...s, rate: Number(s.rate) })),
    };

    try {
      setSaving(true);
      if (editingId) {
        await spinService.updateConfig(editingId, payload);
        toast.success("Cập nhật thành công");
      } else {
        await spinService.createConfig(payload);
        toast.success("Tạo thành công");
      }
      resetForm();
      loadConfigs();
    } catch (error: any) {
      toast.error(error?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa cấu hình này?")) return;
    try {
      await spinService.deleteConfig(id);
      toast.success("Đã xóa");
      loadConfigs();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  if (!mounted) return null;

  return (
    <AdminLayout>
      <Head><title>Vòng quay may mắn - Labubu Admin</title></Head>
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Cấu hình vòng quay
            </h1>
            <div className="flex gap-2">
              <a href="/spin/results" className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg font-medium hover:bg-white/20 transition-all">
                <Award className="w-5 h-5" /> Kết quả quay
              </a>
              <button onClick={openCreateForm} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all" style={{ boxShadow: "0 0 20px rgba(236,72,153,0.4)" }}>
                <Plus className="w-5 h-5" /> Tạo sự kiện
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Form */}
          {showForm && (
            <div className="galaxy-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {editingId ? "Sửa cấu hình" : "Tạo cấu hình mới"}
                </h2>
                <button onClick={resetForm} className="text-purple-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
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
                  <label className="block text-sm text-purple-300 mb-1">Số tiền mua hàng tối thiểu để được 1 lượt quay (VNĐ)</label>
                  <input type="number" value={minSpentAmount} onChange={e => setMinSpentAmount(Number(e.target.value))} min={0} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <p className="text-xs text-purple-400 mt-1">VD: Nhập 500000 → Mỗi 500.000đ mua hàng = 1 lượt quay. Nhập 0 = không giới hạn.</p>
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Số lần quay tối đa / người</label>
                  <input type="number" value={maxSpinsPerUser} onChange={e => setMaxSpinsPerUser(Number(e.target.value))} min={0} className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <p className="text-xs text-purple-400 mt-1">Nhập 0 = không giới hạn số lần quay.</p>
                </div>
              </div>

              {/* Slots */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-purple-200">
                    Các ô vòng quay ({slots.length} ô) — Tổng tỉ lệ:{" "}
                    <span className={totalRate === 100 ? "text-green-400" : "text-red-400"}>{totalRate}%</span>
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => addSlot("prize")} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs hover:bg-yellow-500/30 transition-all">
                      <Plus className="w-3 h-3" /> Giải thưởng
                    </button>
                    <button onClick={() => addSlot("extra_turn")} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs hover:bg-green-500/30 transition-all">
                      <Plus className="w-3 h-3" /> Thêm lượt
                    </button>
                    <button onClick={() => addSlot("lose")} className="flex items-center gap-1 px-3 py-1.5 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg text-xs hover:bg-gray-500/30 transition-all">
                      <Plus className="w-3 h-3" /> May mắn lần sau
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {slots.map((slot, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-purple-500/20">
                      <span className="text-purple-400 text-sm font-mono mt-2 w-6">{index + 1}</span>

                      {/* Image */}
                      <div className="flex-shrink-0">
                        {slot.image ? (
                          <div className="relative w-16 h-16">
                            <img src={slot.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                            <button onClick={() => updateSlot(index, "image", "")} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-16 h-16 border-2 border-dashed border-purple-500/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
                            <ImageIcon className="w-5 h-5 text-purple-400" />
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                              if (e.target.files?.[0]) handleUploadImage(index, e.target.files[0]);
                            }} />
                          </label>
                        )}
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          value={slot.label}
                          onChange={e => updateSlot(index, "label", e.target.value)}
                          placeholder="Tên ô"
                          className="col-span-2 px-2 py-1.5 bg-white/10 border border-purple-500/30 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={slot.rate}
                            onChange={e => updateSlot(index, "rate", Number(e.target.value))}
                            min={0}
                            max={100}
                            className="w-full px-2 py-1.5 bg-white/10 border border-purple-500/30 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <span className="text-purple-300 text-sm">%</span>
                        </div>
                      </div>

                      <span className={`text-xs px-2 py-1 rounded border mt-1.5 whitespace-nowrap ${slot.type === "prize" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : slot.type === "extra_turn" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                        {SLOT_TYPE_LABELS[slot.type]?.label}
                      </span>

                      <button onClick={() => removeSlot(index)} className="text-red-400 hover:text-red-300 mt-1.5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={resetForm} className="px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg hover:bg-white/20 transition-all">
                  Hủy
                </button>
                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          )}

          {/* Config List */}
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
                          <h3 className="text-lg font-semibold text-white">{config.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${isRunning ? "bg-green-500/20 text-green-400 border-green-500/30" : isActive ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                            {isRunning ? "Đang chạy" : isActive ? "Chờ chạy" : "Tắt"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-purple-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(config.startDate)} ~ {formatDate(config.endDate)}
                          </span>
                          <span>
                            Điều kiện: {config.minSpentAmount > 0 ? `${config.minSpentAmount.toLocaleString("vi-VN")}đ / lượt` : "Không giới hạn"}
                          </span>
                          <span>
                            Tối đa: {config.maxSpinsPerUser > 0 ? `${config.maxSpinsPerUser} lần/người` : "Không giới hạn"}
                          </span>
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

                    {/* Slots table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-purple-400 border-b border-purple-500/20">
                            <th className="text-left py-2 px-2">#</th>
                            <th className="text-left py-2 px-2">Hình</th>
                            <th className="text-left py-2 px-2">Tên ô</th>
                            <th className="text-left py-2 px-2">Loại</th>
                            <th className="text-right py-2 px-2">Tỉ lệ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {config.slots.map((slot, i) => (
                            <tr key={i} className="border-b border-purple-500/10 text-purple-200">
                              <td className="py-2 px-2">{i + 1}</td>
                              <td className="py-2 px-2">
                                {slot.image ? (
                                  <img src={slot.image} alt="" className="w-10 h-10 rounded object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-purple-500" />
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-2 text-white">{slot.label}</td>
                              <td className="py-2 px-2">
                                <span className={SLOT_TYPE_LABELS[slot.type]?.color}>{SLOT_TYPE_LABELS[slot.type]?.label}</span>
                              </td>
                              <td className="py-2 px-2 text-right font-mono">{slot.rate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
