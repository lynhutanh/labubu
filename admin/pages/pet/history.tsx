import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Gift,
  Image as ImageIcon,
  Clock,
  Truck,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import AdminLayout from "../../src/components/layout/AdminLayout";
import { storage } from "../../src/utils/storage";
import {
  petService,
  AdminPetChestHistoryItem,
  PetChestDeliveryStatus,
} from "../../src/services/pet.service";
import toast from "react-hot-toast";

const DELIVERY_LABELS: Record<
  PetChestDeliveryStatus,
  { label: string; className: string; icon: any }
> = {
  pending: {
    label: "Chua gui",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: Clock,
  },
  shipped: {
    label: "Da gui",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Truck,
  },
  delivered: {
    label: "Da nhan",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: CheckCircle,
  },
};

export default function PetChestHistoryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState("");
  const [keyword, setKeyword] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState<PetChestDeliveryStatus | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [results, setResults] = useState<AdminPetChestHistoryItem[]>([]);
  const limit = 20;

  const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:5001";

  const getImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, page, deliveryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await petService.searchChestHistory({
        keyword: keyword || undefined,
        deliveryStatus: deliveryFilter || undefined,
        page,
        limit,
      });
      setResults(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      toast.error(error?.message || "Khong the tai lich su trung");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (page === 1) loadData();
    else setPage(1);
  };

  const handleUpdateStatus = async (
    row: AdminPetChestHistoryItem,
    deliveryStatus: PetChestDeliveryStatus,
  ) => {
    const key = `${row.userId}-${row.historyId}-${deliveryStatus}`;
    try {
      setUpdatingKey(key);
      await petService.updateChestHistoryDeliveryStatus(
        row.userId,
        row.historyId,
        { deliveryStatus },
      );
      toast.success("Da cap nhat trang thai");
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Cap nhat that bai");
    } finally {
      setUpdatingKey("");
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleString("vi-VN", { hour12: false });
  };

  if (!mounted) return null;

  return (
    <AdminLayout>
      <Head>
        <title>Lich su trung ruong - Labubu Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        <header
          className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <h1
              className="text-2xl font-bold"
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Lich su trung ruong
            </h1>
            <a
              href="/pet/chest"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
            >
              ← Cau hinh ruong
            </a>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tim ten, email, SDT, dia chi, ten qua..."
                className="w-full pl-9 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300 text-sm"
              />
            </div>

            <select
              value={deliveryFilter}
              onChange={(e) => {
                setDeliveryFilter(e.target.value as PetChestDeliveryStatus | "");
                setPage(1);
              }}
              className="px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-gray-900">
                Tat ca trang thai gui
              </option>
              <option value="pending" className="bg-gray-900">
                Chua gui
              </option>
              <option value="shipped" className="bg-gray-900">
                Da gui
              </option>
              <option value="delivered" className="bg-gray-900">
                Da nhan
              </option>
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all"
            >
              Tim kiem
            </button>
          </div>

          {loading ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Dang tai...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="galaxy-card rounded-xl p-8 text-center">
              <Gift className="w-14 h-14 text-purple-400 mx-auto" />
              <p className="mt-4 text-purple-200">Chua co lich su trung nao</p>
            </div>
          ) : (
            <div className="galaxy-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-purple-400 border-b border-purple-500/30 bg-white/5">
                      <th className="text-left py-3 px-4">Thoi gian</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Qua trung</th>
                      <th className="text-left py-3 px-4">Gia tri</th>
                      <th className="text-left py-3 px-4">Trang thai gui</th>
                      <th className="text-center py-3 px-4">Hanh dong</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row) => {
                      const delivery = DELIVERY_LABELS[row.deliveryStatus] || DELIVERY_LABELS.pending;
                      const DeliveryIcon = delivery.icon;

                      return (
                        <tr
                          key={`${row.userId}-${row.historyId}`}
                          className="border-b border-purple-500/10 text-purple-200 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-xs">
                            {formatDate(row.openedAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-xs space-y-0.5">
                              <p className="text-white font-medium">
                                {row.userName || "(Khong ten)"}
                              </p>
                              <p>{row.userPhone || "--"}</p>
                              <p>{row.userEmail || "--"}</p>
                              <p className="text-purple-400">{row.userAddress || "--"}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {row.prizeImage ? (
                                <img
                                  src={getImageUrl(row.prizeImage)}
                                  alt={row.prizeName}
                                  className="w-10 h-10 rounded object-cover border border-purple-500/30"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-white/5 border border-purple-500/20 flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-purple-500" />
                                </div>
                              )}
                              <span className="text-white font-medium">
                                {row.prizeName || "Phan qua"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-xs">
                              <p className="text-emerald-300 font-semibold">
                                +{Number(row.rewardVnd || 0).toLocaleString("vi-VN")}d
                              </p>
                              <p className="text-purple-400">
                                Cost: {Number(row.openCostPoints || 0)} diem
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${delivery.className}`}
                            >
                              <DeliveryIcon className="w-3 h-3" />
                              {delivery.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-1">
                              {row.deliveryStatus !== "pending" && (
                                <button
                                  onClick={() => handleUpdateStatus(row, "pending")}
                                  disabled={updatingKey === `${row.userId}-${row.historyId}-pending`}
                                  className="px-2 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded text-xs hover:bg-yellow-500/30 transition-all disabled:opacity-50"
                                  title="Chuyen ve chua gui"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              )}
                              {row.deliveryStatus !== "shipped" && (
                                <button
                                  onClick={() => handleUpdateStatus(row, "shipped")}
                                  disabled={updatingKey === `${row.userId}-${row.historyId}-shipped`}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-xs hover:bg-blue-500/30 transition-all disabled:opacity-50"
                                  title="Danh dau da gui"
                                >
                                  <Truck className="w-3 h-3" />
                                </button>
                              )}
                              {row.deliveryStatus !== "delivered" && (
                                <button
                                  onClick={() => handleUpdateStatus(row, "delivered")}
                                  disabled={updatingKey === `${row.userId}-${row.historyId}-delivered`}
                                  className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-xs hover:bg-green-500/30 transition-all disabled:opacity-50"
                                  title="Danh dau da nhan"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg disabled:opacity-40 hover:bg-white/20 transition-all text-sm"
              >
                Truoc
              </button>
              <span className="text-purple-300 text-sm">
                Trang {page}/{totalPages} ({total} ket qua)
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white/10 border border-purple-500/30 text-white rounded-lg disabled:opacity-40 hover:bg-white/20 transition-all text-sm"
              >
                Sau
              </button>
            </div>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
