import { useState, useEffect, useCallback, useMemo, useRef, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Phone,
  CreditCard,
  Save,
  Truck,
  Lock,
  Users,
  Database,
  Download,
  Upload,
} from "lucide-react";
import { settingsService } from "src/services";
import {
  SettingFormItem,
  SettingsTabs,
} from "src/components/settings";
import GhnSenderAddress from "src/components/settings/GhnSenderAddress";
import type { ISetting, TabConfig } from "src/interfaces";
import AdminLayout from "src/components/layout/AdminLayout";

const getTabConfig = (): TabConfig[] => [
  {
    key: "site",
    title: "Tổng quan",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
    description: "Cấu hình thông tin tổng quan của website.",
  },
  {
    key: "contact",
    title: "Liên hệ",
    icon: Phone,
    color: "from-green-500 to-emerald-500",
    description: "Cấu hình thông tin liên hệ.",
  },
  {
    key: "payment",
    title: "Thanh toán",
    icon: CreditCard,
    color: "from-green-500 to-emerald-500",
    description: "Cấu hình thông tin thanh toán.",
  },
  {
    key: "ghn",
    title: "GHN",
    icon: Truck,
    color: "from-orange-500 to-red-500",
    description: "Cấu hình thông tin GHN (Giao Hàng Nhanh).",
  },
  {
    key: "team",
    title: "Đội ngũ",
    icon: Phone,
    color: "from-purple-500 to-pink-500",
    description: "Cấu hình thông tin đội ngũ hỗ trợ.",
  },
  {
    key: "admin",
    title: "Đổi mật khẩu",
    icon: Lock,
    color: "from-red-500 to-orange-500",
    description: "Thay đổi mật khẩu tài khoản admin.",
  },
  {
    key: "pet",
    title: "Nuôi thú",
    icon: Globe,
    color: "from-pink-500 to-rose-500",
    description: "Cấu hình ưu đãi/giới hạn dùng điểm nuôi thú.",
  },
  {
    key: "backup",
    title: "Sao lưu",
    icon: Database,
    color: "from-indigo-500 to-blue-500",
    description: "Tải bản sao lưu toàn bộ dữ liệu hệ thống.",
  },
];

export default function SettingsPage() {
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTab, setSelectedTab] = useState("site");
  const [list, setList] = useState<ISetting[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const dataChange = useRef<Record<string, any>>({});

  const tabConfig = useMemo(() => getTabConfig(), []);
  const currentTabInfo = useMemo(
    () => tabConfig.find((tab) => tab.key === selectedTab),
    [tabConfig, selectedTab]
  );

  const setVal = useCallback((field: string, val: any) => {
    dataChange.current[field] = val;
    setFormData((prev) => ({ ...prev, [field]: val }));
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await settingsService.getEditableSettings(selectedTab);
      setList(settings || []);

      const initialFormData: Record<string, any> = {};
      (settings || []).forEach((setting: ISetting) => {
        initialFormData[setting.key] = setting.value;
      });
      setFormData(initialFormData);
      dataChange.current = {};
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage({ type: "error", text: "Không thể tải cài đặt" });
    } finally {
      setLoading(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const onFinish = useCallback(async () => {
    try {
      setUpdating(true);
      const changed = { ...dataChange.current };
      const updatePromises = Object.keys(dataChange.current).map((key) =>
        settingsService.update(key, dataChange.current[key])
      );
      await Promise.all(updatePromises);
      setMessage({ type: "success", text: "Cập nhật cài đặt thành công!" });
      console.log("[Admin Settings] Saved settings:", changed);
      dataChange.current = {};
    } catch (error) {
      console.error("Failed to update settings:", error);
      setMessage({ type: "error", text: "Không thể cập nhật cài đặt" });
    } finally {
      setUpdating(false);
    }
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setSelectedTab(tab);
  }, []);

  const hiddenKeys = useMemo(() => {
    if (selectedTab !== "ghn") return new Set<string>();
    return new Set<string>([
      "GHN_SENDER_ADDRESS",
      "GHN_SENDER_PROVINCE_ID",
      "GHN_SENDER_PROVINCE_NAME",
      "GHN_SENDER_DISTRICT_ID",
      "GHN_SENDER_DISTRICT_NAME",
      "GHN_SENDER_WARD_CODE",
      "GHN_SENDER_WARD_NAME",
    ]);
  }, [selectedTab]);

  return (
    <AdminLayout>
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
              Cài đặt hệ thống
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="galaxy-card rounded-xl p-6"
          >
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 px-4 py-3 rounded-lg backdrop-blur-sm ${message.type === "success"
                  ? "bg-green-500/20 text-green-300 border border-green-400/30"
                  : "bg-red-500/20 text-red-300 border border-red-400/30"
                  }`}
              >
                {message.text}
              </motion.div>
            )}

            <SettingsTabs
              activeTab={selectedTab}
              onTabChange={handleTabChange}
              tabs={tabConfig}
            />

            <div className="px-2">
              <div className="mb-6">
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {currentTabInfo?.title}
                </h2>
                <p className="text-purple-300 mt-1">{currentTabInfo?.description}</p>
              </div>

              {selectedTab === "backup" ? (
                <div className="flex flex-col items-center py-16 gap-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                    <Database className="w-10 h-10 text-white" />
                  </div>

                  {/* Backup */}
                  <div className="text-center">
                    <p className="text-purple-200 text-lg mb-1">Tải về toàn bộ dữ liệu hệ thống</p>
                    <p className="text-purple-400 text-sm">File backup sẽ được lưu dưới dạng JSON</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setBackingUp(true);
                        await settingsService.downloadBackup();
                        setMessage({ type: "success", text: "Tải bản sao lưu thành công!" });
                      } catch (error) {
                        console.error("Backup failed:", error);
                        setMessage({ type: "error", text: "Không thể tải bản sao lưu" });
                      } finally {
                        setBackingUp(false);
                      }
                    }}
                    disabled={backingUp}
                    className={`
                      inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg
                      ${backingUp
                        ? "bg-white/10 text-purple-400 cursor-not-allowed border border-purple-500/20"
                        : "bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:opacity-90"
                      }
                    `}
                    style={{
                      boxShadow: backingUp ? "none" : "0 0 25px rgba(99, 102, 241, 0.5)",
                    }}
                  >
                    <Download className="w-5 h-5" />
                    {backingUp ? "Đang tải..." : "Tải bản sao lưu"}
                  </button>

                  {/* Restore */}
                  <div className="w-full border-t border-purple-500/30 pt-8 flex flex-col items-center gap-4">
                    <div className="text-center">
                      <p className="text-purple-200 text-lg mb-1">Khôi phục dữ liệu từ file backup</p>
                      <p className="text-red-400 text-sm">⚠️ Dữ liệu hiện tại sẽ bị ghi đè hoàn toàn</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const confirmed = window.confirm(
                          "⚠️ Toàn bộ dữ liệu hiện tại sẽ bị GHI ĐÈ bởi file backup.\n\nBạn có chắc chắn muốn khôi phục?"
                        );
                        if (!confirmed) {
                          if (fileInputRef.current) fileInputRef.current.value = "";
                          return;
                        }
                        try {
                          setRestoring(true);
                          await settingsService.restoreBackup(file);
                          setMessage({ type: "success", text: "Khôi phục dữ liệu thành công!" });
                        } catch (error) {
                          console.error("Restore failed:", error);
                          setMessage({ type: "error", text: "Không thể khôi phục dữ liệu" });
                        } finally {
                          setRestoring(false);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={restoring}
                      className={`
                        inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg
                        ${restoring
                          ? "bg-white/10 text-purple-400 cursor-not-allowed border border-purple-500/20"
                          : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90"
                        }
                      `}
                      style={{
                        boxShadow: restoring ? "none" : "0 0 25px rgba(239, 68, 68, 0.4)",
                      }}
                    >
                      <Upload className="w-5 h-5" />
                      {restoring ? "Đang khôi phục..." : "Khôi phục dữ liệu"}
                    </button>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                  <span className="ml-3 text-purple-200">Đang tải cài đặt...</span>
                </div>
              ) : list.length === 0 ? (
                <div className="text-center py-16 text-purple-300">
                  <p>Không có cài đặt nào cho mục này.</p>
                </div>
              ) : (
                <>
                  {selectedTab === "ghn" && (
                    <GhnSenderAddress values={formData} onChange={setVal} />
                  )}
                  <div>
                    {list
                      .filter(
                        (setting) =>
                          !hiddenKeys.has(setting.key) &&
                          !setting.key.startsWith("GHN_SENDER_"),
                      )
                      .map((setting) => {
                        const settingWithCurrentValue: ISetting = {
                          ...setting,
                          value: formData[setting.key] ?? setting.value,
                        };
                        return (
                          <SettingFormItem
                            key={setting._id}
                            setting={settingWithCurrentValue}
                            onValueChange={setVal}
                          />
                        );
                      })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-purple-500/30 text-right">
                    <button
                      type="button"
                      onClick={onFinish}
                      disabled={
                        updating || Object.keys(dataChange.current).length === 0
                      }
                      className={`
                        inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg
                        ${updating || Object.keys(dataChange.current).length === 0
                          ? "bg-white/10 text-purple-400 cursor-not-allowed border border-purple-500/20"
                          : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
                        }
                      `}
                      style={{
                        boxShadow: updating || Object.keys(dataChange.current).length === 0
                          ? "none"
                          : "0 0 25px rgba(236, 72, 153, 0.5)",
                      }}
                    >
                      <Save className="w-4 h-4" />
                      {updating ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </AdminLayout>
  );
}

