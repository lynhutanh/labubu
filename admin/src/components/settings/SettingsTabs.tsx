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
      <div className="flex gap-2 py-4 overflow-x-auto border-b border-purple-500/30 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
              flex items-center gap-2 px-5 py-2.5 border-none rounded-lg cursor-pointer
              font-semibold text-sm whitespace-nowrap transition-all duration-200 backdrop-blur-sm
              ${
                isActive
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white/10 text-purple-200 hover:bg-white/20 border border-purple-500/30"
              }
            `}
              style={{
                boxShadow: isActive ? "0 0 20px rgba(236, 72, 153, 0.4)" : "none",
              }}
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

