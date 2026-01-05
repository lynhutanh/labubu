import React, { memo } from "react";
import type { TabConfig } from "src/interfaces";

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: TabConfig[];
}

export const SettingsTabs = memo<SettingsTabsProps>(
  ({ activeTab, onTabChange, tabs }) => {
    return (
      <div className="flex gap-2 py-4 overflow-x-auto border-b border-gray-200 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
              flex items-center gap-2 px-5 py-2.5 border-none rounded-lg cursor-pointer
              font-semibold text-sm whitespace-nowrap transition-all duration-200
              ${isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
            `}
            >
              <span className="flex items-center text-lg">
                <IconComponent />
              </span>
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>
    );
  }
);

SettingsTabs.displayName = "SettingsTabs";

export default SettingsTabs;

