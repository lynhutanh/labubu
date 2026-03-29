import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Plus, Trash2, Edit, Save, X, Image as ImageIcon, Award,
} from "lucide-react";
import {
  petService, PetResponse,
} from "../../src/services/pet.service";
import { fileService } from "../../src/services/file.service";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import toast from "react-hot-toast";

export default function PetConfigPage() {
  const router = useRouter();
  const [pets, setPets] = useState<PetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [order, setOrder] = useState(0);
  const [minPoints, setMinPoints] = useState(0);
  const [crackPoints, setCrackPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(0);
  const [eggImage, setEggImage] = useState("");
  const [crackImage, setCrackImage] = useState("");
  const [hatchImage, setHatchImage] = useState("");
  const [rewardPoints, setRewardPoints] = useState(0);
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5001";

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) { router.push("/login"); return; }
    loadPets();
  }, [router]);

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = await petService.getPets();
      setPets(data);
    } catch {
      toast.error("Không thể tải danh sách con vật");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setBackgroundImage("");
    setOrder(pets.length);
    setMinPoints(0);
    setCrackPoints(0);
    setMaxPoints(0);
    setEggImage("");
    setCrackImage("");
    setHatchImage("");
    setRewardPoints(0);
    setStatus("active");
    setEditingId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setOrder(pets.length);
    setShowForm(true);
  };

  const openEditForm = (pet: PetResponse) => {
    setEditingId(pet._id);
    setName(pet.name);
    setDescription(pet.description || "");
    setBackgroundImage(pet.backgroundImage || "");
    setOrder(pet.order);
    setMinPoints(pet.minPoints);
    setCrackPoints(pet.crackPoints);
    setMaxPoints(pet.maxPoints);
    setEggImage(pet.eggImage || "");
    setCrackImage(pet.crackImage || "");
    setHatchImage(pet.hatchImage || "");
    setRewardPoints(pet.rewardPoints);
    setStatus(pet.status);
    setShowForm(true);
  };

  const handleUploadImage = async (
    setter: (url: string) => void,
    file: File,
  ) => {
    try {
      const res = await fileService.uploadProductImage(file);
      setter(res.url || res.filePath);
      toast.success("Tải ảnh thành công");
    } catch {
      toast.error("Tải ảnh thất bại");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Nhập tên con vật"); return; }
    if (rewardPoints <= 0) { toast.error("Điểm thưởng phải lớn hơn 0"); return; }
    if (minPoints >= crackPoints) { toast.error("Mốc Trứng vỡ phải lớn hơn mốc bắt đầu"); return; }
    if (crackPoints >= maxPoints) { toast.error("Mốc Nở phải lớn hơn mốc Trứng vỡ"); return; }

    const payload = {
      name, description, backgroundImage, order,
      minPoints, crackPoints, maxPoints,
      eggImage, crackImage, hatchImage,
      rewardPoints, status,
    };

    try {
      setSaving(true);
      if (editingId) {
        await petService.updatePet(editingId, payload);
        toast.success("Cập nhật thành công");
      } else {
        await petService.createPet(payload);
        toast.success("Tạo thành công");
      }
      resetForm();
      loadPets();
    } catch (error: any) {
      toast.error(error?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa con vật này?")) return;
    try {
      await petService.deletePet(id);
      toast.success("Đã xóa");
      loadPets();
    } catch (err: any) {
      toast.error(err?.message || "Xóa thất bại");
    }
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
    return ["mp4", "webm", "mov", "avi"].includes(ext);
  };

  const renderMediaUpload = (
    label: string,
    value: string,
    setter: (v: string) => void,
  ) => (
    <div>
      <label className="block text-sm text-purple-300 mb-1">{label}</label>
      {value ? (
        <div className="relative w-20 h-20 inline-block">
          {isVideo(value) ? (
            <video
              src={getImageUrl(value)}
              className="w-20 h-20 rounded-lg object-cover border border-purple-500/30"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={getImageUrl(value)}
              alt=""
              className="w-20 h-20 rounded-lg object-cover border border-purple-500/30"
            />
          )}
          <button
            onClick={() => setter("")}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <label className="w-20 h-20 border-2 border-dashed border-purple-500/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <input
            type="file"
            accept="image/*,video/*,.gif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleUploadImage(setter, e.target.files[0]);
            }}
          />
        </label>
      )}
    </div>
  );

  if (!mounted) return null;

  return (
    <AdminLayout>
      <Head><title>Nuôi Vật - Labubu Admin</title></Head>
      <div className="flex-1 overflow-y-auto">
        <header
          className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <h1
              className="text-2xl font-bold"
              style={{
                background: "linear-gradient(135deg, #34d399, #06b6d4, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              🐾 Quản lý Con Vật
            </h1>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              style={{ boxShadow: "0 0 20px rgba(16,185,129,0.4)" }}
            >
              <Plus className="w-5 h-5" /> Tạo con vật
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {showForm && (
            <div className="galaxy-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  {editingId ? "Sửa con vật" : "Tạo con vật mới"}
                </h2>
                <button onClick={resetForm} className="text-purple-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Tên con vật</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Rồng Cam"
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active" className="bg-gray-900">Hoạt động</option>
                    <option value="inactive" className="bg-gray-900">Tắt</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-purple-300 mb-1">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Điểm thưởng khi hoàn thành</label>
                  <input
                    type="number"
                    value={rewardPoints}
                    onChange={(e) => setRewardPoints(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-purple-400 mt-1">
                    Quy đổi: {rewardPoints} điểm = {(rewardPoints * 1000).toLocaleString("vi-VN")}đ vào ví
                  </p>
                </div>
              </div>

              {/* Khoảng điểm */}
              <div>
                <h3 className="text-sm font-medium text-purple-200 mb-3">
                  📊 Khoảng điểm (mỗi 10.000đ mua hàng = 1 điểm)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-purple-300 mb-1">
                      🥚 Mốc bắt đầu (Trứng)
                    </label>
                    <input
                      type="number"
                      value={minPoints}
                      onChange={(e) => setMinPoints(Number(e.target.value))}
                      min={0}
                      className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-purple-400 mt-1">
                      = {(minPoints * 10000).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-purple-300 mb-1">
                      🐣 Mốc Trứng vỡ
                    </label>
                    <input
                      type="number"
                      value={crackPoints}
                      onChange={(e) => setCrackPoints(Number(e.target.value))}
                      min={0}
                      className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-purple-400 mt-1">
                      = {(crackPoints * 10000).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-purple-300 mb-1">
                      🐲 Mốc Nở (Hoàn thành)
                    </label>
                    <input
                      type="number"
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(Number(e.target.value))}
                      min={0}
                      className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-purple-400 mt-1">
                      = {(maxPoints * 10000).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              </div>

              {/* Ảnh 3 giai đoạn */}
              <div>
                <h3 className="text-sm font-medium text-purple-200 mb-3">
                  🖼️ Ảnh / GIF / Video 3 giai đoạn
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {renderMediaUpload("🥚 Trứng", eggImage, setEggImage)}
                  {renderMediaUpload("🐣 Trứng vỡ", crackImage, setCrackImage)}
                  {renderMediaUpload("🐲 Nở ra", hatchImage, setHatchImage)}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
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
          ) : pets.length === 0 && !showForm ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <Award className="w-16 h-16 text-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Chưa có con vật nào</p>
              <button
                onClick={openCreateForm}
                className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-all"
              >
                Tạo con vật đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pets.map((pet) => {
                const isActive = pet.status === "active";
                return (
                  <div key={pet._id} className="galaxy-card rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            🐾 {pet.name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              isActive
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }`}
                          >
                            {isActive ? "Hoạt động" : "Tắt"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-purple-300">
                          <span>
                            📊 Khoảng:{" "}
                            <span className="text-cyan-400">
                              {pet.minPoints} → {pet.crackPoints} → {pet.maxPoints} điểm
                            </span>
                          </span>
                          <span>
                            🏆 Thưởng:{" "}
                            <span className="text-yellow-400">
                              {pet.rewardPoints} điểm ({(pet.rewardPoints * 1000).toLocaleString("vi-VN")}đ)
                            </span>
                          </span>
                        </div>
                        {pet.description && (
                          <p className="text-xs text-purple-400 mt-1">{pet.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(pet)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs hover:bg-blue-500/30 transition-all"
                        >
                          <Edit className="w-3 h-3" /> Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(pet._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 className="w-3 h-3" /> Xóa
                        </button>
                      </div>
                    </div>

                    {/* 3 stage preview */}
                    <div className="flex items-center gap-3">
                      {[
                        { label: "Trứng", image: pet.eggImage, points: pet.minPoints },
                        { label: "Trứng vỡ", image: pet.crackImage, points: pet.crackPoints },
                        { label: "Nở ra", image: pet.hatchImage, points: pet.maxPoints },
                      ].map((stage, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-emerald-500/20">
                            {stage.image && (
                              isVideo(stage.image) ? (
                                <video
                                  src={getImageUrl(stage.image)}
                                  className="w-10 h-10 rounded object-cover"
                                  autoPlay loop muted playsInline
                                />
                              ) : (
                                <img
                                  src={getImageUrl(stage.image)}
                                  alt=""
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )
                            )}
                            <div>
                              <p className="text-white text-sm font-medium">{stage.label}</p>
                              <p className="text-xs text-purple-400">
                                {stage.points} điểm
                              </p>
                            </div>
                          </div>
                          {i < 2 && <span className="text-purple-500">→</span>}
                        </div>
                      ))}
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
