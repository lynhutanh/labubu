import React, { memo, useState, useRef, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { fileService } from "src/services";
import type { ISetting, SettingFormItemProps } from "src/interfaces";
import toast from "react-hot-toast";

export const SettingFormItem: React.FC<SettingFormItemProps> = memo(
  ({ setting, onValueChange }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(
      setting.value && (setting.value.startsWith("http") || setting.value.startsWith("/")) ? setting.value : null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    let { type } = setting;

    if (setting.meta && setting.meta.textarea) {
      type = "textarea";
    }
    
    const isAvatarField = setting.key.includes("avatar");
    
    useEffect(() => {
      if (setting.value && (setting.value.startsWith("http") || setting.value.startsWith("/"))) {
        setPreview(setting.value);
      } else {
        setPreview(null);
      }
    }, [setting.value]);

    const renderFormControl = () => {
      if (isAvatarField) {
        type = "file";
      }
      
      switch (type) {
        case "textarea":
          return (
            <textarea
              rows={4}
              value={setting.value || ""}
              onChange={(e) => onValueChange(setting.key, e.target.value)}
              placeholder="Nhập giá trị..."
              className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm resize-y"
            />
          );

        case "number":
          return (
            <input
              type="number"
              min={setting.meta?.min}
              max={setting.meta?.max}
              step={setting.meta?.step || 1}
              value={setting.value || ""}
              onChange={(e) =>
                onValueChange(setting.key, parseFloat(e.target.value))
              }
              placeholder="Nhập một số..."
              className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
            />
          );

        case "boolean":
        case "toggle":
          const booleanValue =
            setting.value === true ||
            setting.value === "true" ||
            setting.value === 1 ||
            setting.value === "1";
          return (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onValueChange(setting.key, booleanValue ? "false" : "true")
                }
                className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                ${booleanValue ? "bg-gradient-to-r from-pink-500 to-purple-600" : "bg-white/20"}
              `}
              >
                <span
                  className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                  ${booleanValue ? "translate-x-6" : "translate-x-1"}
                `}
                />
              </button>
              <span className="text-purple-200">
                {booleanValue ? "Bật" : "Tắt"}
              </span>
            </div>
          );

        case "select":
          const metaOptions =
            (setting as any).validation?.options ||
            (setting.meta as any)?.value ||
            (setting.meta as any)?.options ||
            [];
          const selectOptions =
            Array.isArray(metaOptions) &&
            metaOptions.length > 0 &&
            typeof metaOptions[0] === "string"
              ? metaOptions.map((option: string) => ({
                  value: option,
                  label: option,
                }))
              : metaOptions.map((option: any) => ({
                  value: option.key || option.value || option,
                  label: option.name || option.label || option,
                }));

          return (
            <select
              value={setting.value || ""}
              onChange={(e) => onValueChange(setting.key, e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white backdrop-blur-sm"
            >
              <option value="" className="bg-gray-900">Chọn một tùy chọn...</option>
              {selectOptions.map((option: any) => (
                <option key={option.value} value={option.value} className="bg-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
          );

        case "password":
          return (
            <input
              type="password"
              value={setting.value || ""}
              onChange={(e) => onValueChange(setting.key, e.target.value)}
              placeholder="Nhập giá trị..."
              className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
            />
          );

        case "file":
        case "image":
          return (
            <div className="space-y-4">
              {preview && (
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-purple-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      onValueChange(setting.key, "");
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                      toast.error("Vui lòng chọn file ảnh");
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Kích thước file không được vượt quá 5MB");
                      return;
                    }

                    try {
                      setUploading(true);
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setPreview(e.target?.result as string);
                      };
                      reader.readAsDataURL(file);

                      const uploaded = await fileService.uploadAvatar(file);
                      onValueChange(setting.key, uploaded.url);
                      toast.success("Upload ảnh thành công!");
                    } catch (error: any) {
                      console.error("Upload error:", error);
                      toast.error(error?.message || "Không thể upload ảnh");
                      setPreview(null);
                    } finally {
                      setUploading(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang upload...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{preview ? "Thay đổi ảnh" : "Chọn ảnh"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );

        default:
          return (
            <input
              type="text"
              value={setting.value || ""}
              onChange={(e) => onValueChange(setting.key, e.target.value)}
              placeholder="Nhập giá trị..."
              className="w-full px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm"
            />
          );
      }
    };

    return (
      <div className="mb-6">
        <label className="block font-semibold text-purple-200 mb-2 text-sm">
          {setting.name}
          {setting.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {renderFormControl()}
        {setting.description && (
          <p className="mt-2 text-xs text-purple-300">{setting.description}</p>
        )}
      </div>
    );
  }
);

SettingFormItem.displayName = "SettingFormItem";

export default SettingFormItem;

