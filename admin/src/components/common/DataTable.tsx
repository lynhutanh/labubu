import React from "react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  loadingMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "Không có dữ liệu",
  emptyIcon,
  emptyAction,
  onRowClick,
  keyExtractor,
  loadingMessage = "Đang tải...",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="text-purple-200 mt-4">{loadingMessage}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyIcon && (
          <div className="mb-4 flex justify-center">{emptyIcon}</div>
        )}
        <p className="text-purple-200 mb-4">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  const getAlignClass = (align?: "left" | "right" | "center") => {
    switch (align) {
      case "right":
        return "text-right";
      case "center":
        return "text-center";
      default:
        return "text-left";
    }
  };

  return (
    <div className="galaxy-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className="border-b border-purple-500/30"
            style={{
              background: "rgba(0, 0, 0, 0.3)",
            }}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 ${getAlignClass(column.align)} text-xs font-medium text-purple-300 uppercase tracking-wider ${column.className || ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/20">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-white/5 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 ${getAlignClass(column.align)} text-sm ${column.className || ""}`}
                  >
                    {column.render
                      ? column.render(item, index)
                      : (item as any)[column.key] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
