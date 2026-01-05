import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Globe,
  Phone,
  CreditCard,
  DollarSign,
  Save,
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
    key: "paymentZalopay",
    title: "ZaloPay",
    icon: CreditCard,
    color: "from-blue-600 to-blue-400",
    description: "Cấu hình cổng thanh toán ZaloPay.",
  },
  {
    key: "paymentPaypal",
    title: "PayPal",
    icon: DollarSign,
    color: "from-indigo-500 to-purple-500",
    description: "Cấu hình cổng thanh toán PayPal.",
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
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <SettingsTabs
          activeTab={selectedTab}
          onTabChange={handleTabChange}
          tabs={tabConfig}
        />

        <div className="px-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentTabInfo?.title}
            </h2>
            <p className="text-gray-500 mt-1">{currentTabInfo?.description}</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">Đang tải cài đặt...</span>
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
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

              <div className="mt-8 pt-6 border-t border-gray-200 text-right">
                <button
                  type="button"
                  onClick={onFinish}
                  disabled={
                    updating || Object.keys(dataChange.current).length === 0
                  }
                  className={`
                    inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                    ${
                      updating || Object.keys(dataChange.current).length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow"
                    }
                  `}
                >
                  <Save className="w-4 h-4" />
                  {updating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}

