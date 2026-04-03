import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  Gift,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminLayout from "../../src/components/layout/AdminLayout";
import { fileService } from "../../src/services/file.service";
import { petService, PetChestPrize } from "../../src/services/pet.service";

export default function PetChestConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [openCostPoints, setOpenCostPoints] = useState(10);
  const [prizes, setPrizes] = useState<PetChestPrize[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5001";

  const activePrizeCount = useMemo(
    () => prizes.filter((p) => p.active !== false).length,
    [prizes],
  );

  const totalWeight = useMemo(
    () =>
      prizes
        .filter((p) => p.active !== false)
        .reduce((sum, p) => sum + (Number(p.weight) || 0), 0),
    [prizes],
  );

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const config = await petService.getChestConfig();
        setEnabled(config.enabled !== false);
        setOpenCostPoints(config.openCostPoints || 10);
        setPrizes(
          (config.prizes || []).map((p, index) => ({
            id: p.id || `prize_${index}`,
            name: p.name || "",
            rewardPoints: p.rewardPoints || 0,
            weight: p.weight || 0,
            image: p.image || "",
            active: p.active !== false,
          })),
        );
      } catch (error: any) {
        toast.error(error?.message || "Không thể tải cấu hình rương");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const setPrizeField = (
    index: number,
    field: keyof PetChestPrize,
    value: any,
  ) => {
    setPrizes((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p)),
    );
  };

  const addPrize = () => {
    setPrizes((prev) => [
      ...prev,
      {
        id: `prize_${Date.now()}_${prev.length}`,
        name: "",
        rewardPoints: 1,
        weight: 1,
        image: "",
        active: true,
      },
    ]);
  };

  const removePrize = (index: number) => {
    setPrizes((prev) => prev.filter((_, idx) => idx !== index));
  };

  const getImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  const handleUploadImage = async (index: number, file: File) => {
    try {
      const res = await fileService.uploadProductImage(file);
      setPrizeField(index, "image", res.url || res.filePath || "");
      toast.success("Tải ảnh quà thành công");
    } catch {
      toast.error("Tải ảnh thất bại");
    }
  };

  const handleSave = async () => {
    if (openCostPoints <= 0) {
      toast.error("Điểm mở 1 lần phải lớn hơn 0");
      return;
    }

    if (!prizes.length) {
      toast.error("Cần ít nhất 1 phần quà");
      return;
    }

    const invalidPrize = prizes.find(
      (p) =>
        !p.name?.trim() ||
        Number(p.weight) <= 0,
    );
    if (invalidPrize) {
      toast.error("Moi phan qua can ten va ti le > 0");
      return;
    }

    if (!prizes.some((p) => p.active !== false)) {
      toast.error("Cần bật ít nhất 1 phần quà");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        enabled,
        openCostPoints: Math.floor(openCostPoints),
        prizes: prizes.map((p, index) => ({
          id: p.id || `prize_${Date.now()}_${index}`,
          name: p.name.trim(),
          rewardPoints: Math.max(1, Math.floor(Number(p.rewardPoints) || 1)),
          weight: Number(p.weight) || 0,
          image: p.image || "",
          active: p.active !== false,
        })),
      };

      await petService.updateChestConfig(payload);
      toast.success("Đã lưu cấu hình rương");
    } catch (error: any) {
      toast.error(error?.message || "Lưu cấu hình thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Cấu hình rương may mắn | Labubu Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        <header
          className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/pet"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </Link>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #fbbf24, #f59e0b, #34d399)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Cấu hình rương may mắn
                </h1>
                <p className="text-sm text-purple-200">
                  Thiết lập điểm mở rương và tỉ lệ quà cho Pet Farm
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {loading ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Đang tải cấu hình...</p>
            </div>
          ) : (
            <>
              <div className="galaxy-card rounded-xl p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-purple-300 mb-2">
                      Điểm cần cho 1 lần mở rương
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={openCostPoints}
                      onChange={(e) => setOpenCostPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-purple-300 mb-2">
                      Trạng thái
                    </label>
                    <button
                      onClick={() => setEnabled((v) => !v)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        enabled
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-gray-500/20 text-gray-300 border-gray-500/40"
                      }`}
                    >
                      {enabled ? "Đang bật" : "Đang tắt"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-cyan-200">
                    Quà đang cấu hình: <strong>{prizes.length}</strong>
                  </div>
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-200">
                    Quà đang bật: <strong>{activePrizeCount}</strong>
                  </div>
                  <div className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 text-fuchsia-200">
                    Tổng tỉ lệ (weight): <strong>{totalWeight.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="galaxy-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-300" />
                    Danh sách quà trong rương
                  </h2>
                  <button
                    onClick={addPrize}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-200 border border-purple-500/40 rounded-lg hover:bg-purple-500/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm quà
                  </button>
                </div>

                {!prizes.length ? (
                  <div className="text-center py-8 text-purple-300">
                    Chưa có phần quà nào, hãy thêm mới.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prizes.map((prize, index) => (
                      <div
                        key={prize.id || index}
                        className="rounded-xl border border-purple-500/25 bg-white/5 p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                          <div className="md:col-span-4">
                            <label className="block text-xs text-purple-300 mb-1">
                              Tên quà
                            </label>
                            <input
                              value={prize.name}
                              onChange={(e) =>
                                setPrizeField(index, "name", e.target.value)
                              }
                              placeholder="Ví dụ: Túi may mắn vàng"
                              className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-xs text-purple-300 mb-1">
                              Tỉ lệ (weight)
                            </label>
                            <input
                              type="number"
                              min={0.000001}
                              step="0.01"
                              value={prize.weight}
                              onChange={(e) =>
                                setPrizeField(
                                  index,
                                  "weight",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-xs text-purple-300 mb-1">
                              Ảnh quà (tuỳ chọn)
                            </label>
                            <div className="flex gap-2">
                              <input
                                value={prize.image || ""}
                                onChange={(e) =>
                                  setPrizeField(index, "image", e.target.value)
                                }
                                placeholder="/public/..."
                                className="flex-1 px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <label className="px-3 py-2 rounded-lg border border-purple-500/40 text-purple-200 hover:bg-purple-500/20 cursor-pointer">
                                <Upload className="w-4 h-4" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleUploadImage(index, file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            {!!prize.image && (
                              <img
                                src={getImageUrl(prize.image)}
                                alt={prize.name || "prize"}
                                className="mt-2 w-10 h-10 rounded object-cover border border-purple-500/30"
                              />
                            )}
                          </div>

                          <div className="md:col-span-2 flex md:justify-end gap-2">
                            <button
                              onClick={() =>
                                setPrizeField(
                                  index,
                                  "active",
                                  prize.active === false,
                                )
                              }
                              className={`px-3 py-2 rounded-lg text-xs border ${
                                prize.active !== false
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-gray-500/20 text-gray-300 border-gray-500/40"
                              }`}
                            >
                              {prize.active !== false ? "Đang bật" : "Đang tắt"}
                            </button>
                            <button
                              onClick={() => removePrize(index)}
                              className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
