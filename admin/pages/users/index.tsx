import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Search, Users, Trash2, Filter } from "lucide-react";
import { userService } from "../../src/services";
import { UserResponse, UserSearchParams } from "../../src/interfaces";
import { storage } from "../../src/utils/storage";
import AdminLayout from "../../src/components/layout/AdminLayout";
import DataTable, { Column } from "../../src/components/common/DataTable";
import toast from "react-hot-toast";

const ROLES = [
  { value: "", label: "Tất cả" },
  { value: "user", label: "Người dùng" },
  { value: "admin", label: "Quản trị viên" },
  { value: "seller", label: "Người bán" },
];

const STATUSES = [
  { value: "", label: "Tất cả" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    limit: 20,
    offset: 0,
  });
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setMounted(true);
    const user = storage.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    loadUsers();
  }, [router]);

  useEffect(() => {
    if (mounted) {
      loadUsers();
    }
  }, [searchParams, mounted]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = { ...searchParams };
      if (keyword) {
        params.q = keyword;
      }
      const response = await userService.search(params);
      console.log("Users response:", response);
      setUsers(response?.data || []);
      setTotal(response?.total || 0);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error(
        `Không thể tải danh sách người dùng: ${error.response?.data?.message || error.message || "Lỗi không xác định"}`,
      );
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchParams({ ...searchParams, offset: 0, q: keyword });
  };

  const handleRoleFilter = (role: string) => {
    setSearchParams({ ...searchParams, offset: 0, role: role || undefined });
  };

  const handleStatusFilter = (status: string) => {
    setSearchParams({
      ...searchParams,
      offset: 0,
      status: status || undefined,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}"?`)) {
      return;
    }

    try {
      await userService.delete(id);
      toast.success("Xóa người dùng thành công");
      await loadUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Xóa người dùng thất bại";
      toast.error(message);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Người dùng - Cosmetics Admin</title>
      </Head>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header
          className="sticky top-0 z-10 backdrop-blur-lg border-b border-purple-500/30"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="px-6 py-4">
            <h1
              className="text-2xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Người dùng
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Filters */}
          <div className="galaxy-card rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-300" />
              <h2 className="text-lg font-semibold text-white">Bộ lọc</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Tìm kiếm theo tên, email, username..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={searchParams.role || ""}
                  onChange={(e) => handleRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white backdrop-blur-sm"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={searchParams.status || ""}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white backdrop-blur-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <DataTable
            columns={[
              {
                key: "index",
                label: "STT",
                render: (_, index) => (
                  <span className="text-white">
                    {(searchParams.offset || 0) + index + 1}
                  </span>
                ),
              },
              {
                key: "user",
                label: "Người dùng",
                render: (user) => (
                  <div className="flex items-center gap-3">
                    {user.avatarPath ? (
                      <img
                        src={user.avatarPath}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-purple-500/30"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(79, 70, 229, 0.3))",
                        }}
                      >
                        <span className="text-purple-200 text-sm font-medium">
                          {user.name?.charAt(0)?.toUpperCase() ||
                            user.username?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.name || user.username}
                      </div>
                      {user.username && (
                        <div className="text-xs text-purple-300">
                          @{user.username}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "email",
                label: "Email",
                render: (user) => (
                  <span className="text-sm text-white">{user.email}</span>
                ),
              },
              {
                key: "phone",
                label: "Số điện thoại",
                render: (user) => (
                  <span className="text-sm text-purple-200">
                    {user.phone || "-"}
                  </span>
                ),
              },
              {
                key: "role",
                label: "Vai trò",
                render: (user) => {
                  const roleColors: Record<string, string> = {
                    admin: "bg-red-500/20 text-red-300 border-red-500/30",
                    seller: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                    default: "bg-gray-500/20 text-gray-300 border-gray-500/30",
                  };
                  return (
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${roleColors[user.role] || roleColors.default}`}
                    >
                      {ROLES.find((r) => r.value === user.role)?.label ||
                        user.role}
                    </span>
                  );
                },
              },
              {
                key: "status",
                label: "Trạng thái",
                render: (user) => {
                  const statusColor =
                    user.status === "active"
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : "bg-gray-500/20 text-gray-300 border-gray-500/30";
                  return (
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColor}`}
                    >
                      {STATUSES.find((s) => s.value === user.status)?.label ||
                        user.status}
                    </span>
                  );
                },
              },
              {
                key: "createdAt",
                label: "Ngày tạo",
                render: (user) => (
                  <span className="text-sm text-purple-300">
                    {formatDate(user.createdAt)}
                  </span>
                ),
              },
              {
                key: "actions",
                label: "Thao tác",
                align: "right",
                render: (user) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(user._id, user.name || user.username);
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all border border-red-500/30"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ),
              },
            ]}
            data={users}
            loading={loading}
            emptyMessage="Chưa có người dùng nào"
            emptyIcon={<Users className="w-16 h-16 text-purple-400 mx-auto" />}
            keyExtractor={(user) => user._id}
          />

          {/* Pagination */}
          {total > (searchParams.limit || 20) && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Hiển thị {(searchParams.offset || 0) + 1} đến{" "}
                {Math.min(
                  (searchParams.offset || 0) + (searchParams.limit || 20),
                  total,
                )}{" "}
                trong tổng số {total} người dùng
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSearchParams({
                      ...searchParams,
                      offset: Math.max(
                        0,
                        (searchParams.offset || 0) - (searchParams.limit || 20),
                      ),
                    })
                  }
                  disabled={(searchParams.offset || 0) === 0}
                  className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-white"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-purple-200">
                  Trang{" "}
                  {Math.floor(
                    (searchParams.offset || 0) / (searchParams.limit || 20),
                  ) + 1}{" "}
                  / {Math.ceil(total / (searchParams.limit || 20))}
                </span>
                <button
                  onClick={() =>
                    setSearchParams({
                      ...searchParams,
                      offset:
                        (searchParams.offset || 0) + (searchParams.limit || 20),
                    })
                  }
                  disabled={
                    (searchParams.offset || 0) + (searchParams.limit || 20) >=
                    total
                  }
                  className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-white"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminLayout>
  );
}
