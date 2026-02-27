import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Plus, Trophy, Edit, Trash2, ShieldCheck } from "lucide-react";
import { rankService, Rank } from "../../src/services/rank.service";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import DataTable from "../../src/components/common/DataTable";
import toast from "react-hot-toast";

export default function MembershipsPage() {
    const router = useRouter();
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const user = storage.getUser();
        if (!user) {
            router.push("/login");
            return;
        }
        loadRanks();
    }, [router]);

    const loadRanks = async () => {
        try {
            setLoading(true);
            const response = await rankService.search();
            setRanks(response?.data || []);
        } catch (error: any) {
            console.error("Error loading ranks:", error);
            toast.error("Không thể tải danh sách cấp bậc");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa cấp bậc "${name}"?`)) {
            return;
        }

        try {
            await rankService.delete(id);
            toast.success("Xóa cấp bậc thành công");
            loadRanks();
        } catch (error: any) {
            toast.error("Xóa cấp bậc thất bại");
        }
    };

    if (!mounted) return null;

    return (
        <AdminLayout>
            <Head>
                <title>Cấp bậc thành viên - Labubu Admin</title>
            </Head>

            <div className="flex-1 overflow-y-auto">
                <header
                    className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
                    style={{ background: "rgba(0, 0, 0, 0.3)" }}
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
                            Cấp bậc thành viên
                        </h1>
                        <button
                            onClick={() => router.push("/memberships/create")}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
                            style={{ boxShadow: "0 0 15px rgba(236, 72, 153, 0.4)" }}
                        >
                            <Plus className="w-4 h-4" />
                            Tạo cấp bậc
                        </button>
                    </div>
                </header>

                <main className="p-6">
                    <DataTable
                        columns={[
                            {
                                key: "order",
                                label: "Thứ tự",
                                render: (rank) => <span className="text-white font-medium">{rank.order}</span>,
                            },
                            {
                                key: "rank",
                                label: "Cấp bậc",
                                render: (rank) => (
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/20 shadow-lg"
                                            style={{ background: rank.color || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                                        >
                                            <Trophy className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white uppercase tracking-wider">{rank.name}</div>
                                            <div className="text-xs text-purple-300 font-mono">ID: {rank.key}</div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: "threshold",
                                label: "Ngưỡng chi tiêu",
                                render: (rank) => (
                                    <span className="text-sm font-bold text-pink-400">
                                        {rank.threshold.toLocaleString("vi-VN")}đ
                                    </span>
                                ),
                            },
                            {
                                key: "rewardVoucherCode",
                                label: "Voucher thưởng",
                                render: (rank) => (
                                    <div className="flex items-center gap-2 text-purple-200">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm">{rank.rewardVoucherCode || "Không có"}</span>
                                    </div>
                                ),
                            },
                            {
                                key: "actions",
                                label: "Thao tác",
                                align: "right",
                                render: (rank) => (
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => router.push(`/memberships/edit/${rank._id}`)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all border border-blue-500/30"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rank._id, rank.name)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all border border-red-500/30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        data={ranks}
                        loading={loading}
                        emptyMessage="Chưa có cấp bậc thành viên nào"
                        emptyIcon={<Trophy className="w-16 h-16 text-purple-400 mx-auto" />}
                        keyExtractor={(rank) => rank._id}
                    />
                </main>
            </div>
        </AdminLayout>
    );
}
