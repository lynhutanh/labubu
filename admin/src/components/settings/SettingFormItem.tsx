import React, { memo } from "react";
import type { ISetting, SettingFormItemProps } from "src/interfaces";

export const SettingFormItem: React.FC<SettingFormItemProps> = memo(
  ({ setting, onValueChange }) => {
    let { type } = setting;

    if (setting.meta && setting.meta.textarea) {
      type = "textarea";
    }

    const renderFormControl = () => {
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

