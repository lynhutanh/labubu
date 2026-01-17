import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Phone,
  CreditCard,
  DollarSign,
  Save,
  Truck,
} from "lucide-react";
import { settingsService } from "src/services";
import {
  SettingFormItem,
  SettingsTabs,
} from "src/components/settings";
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
];

export default function SettingsPage() {
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
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
      const updatePromises = Object.keys(dataChange.current).map((key) =>
        settingsService.update(key, dataChange.current[key])
      );
      await Promise.all(updatePromises);
      setMessage({ type: "success", text: "Cập nhật cài đặt thành công!" });
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

              {loading ? (
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
                  <div>
                    {list.map((setting) => {
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

