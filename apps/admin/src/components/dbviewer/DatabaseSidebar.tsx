import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { TableMetadataDto } from "@alliance/shared/client/types.gen";
import { isProduction } from "@alliance/sharedweb/lib/config";

interface DatabaseSidebarProps {
  tables: TableMetadataDto[];
  selectedTable: string;
  onSelectTable: (tableName: string) => void;
  loading: boolean;
  isConnected: boolean;
  onNavigateHome: () => void;
}

const DatabaseSidebar: React.FC<DatabaseSidebarProps> = ({
  tables,
  selectedTable,
  onSelectTable,
  loading,
  onNavigateHome,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const sortedTables = useMemo(() => {
    return [...tables].sort((a, b) => {
      if (a.recordCount === 0 && b.recordCount > 0) return 1;
      if (a.recordCount > 0 && b.recordCount === 0) return -1;
      return a.name.localeCompare(b.name);
    });
  }, [tables]);

  const filteredTables = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sortedTables;
    return sortedTables
      .map((table, index) => {
        const name = table.name.toLowerCase();
        const entityName = table.entityName?.toLowerCase() ?? "";
        const matches = name.includes(query) || entityName.includes(query);
        if (!matches) return null;
        const score = name.startsWith(query)
          ? 0
          : entityName.startsWith(query)
          ? 1
          : 2;
        return { table, index, score };
      })
      .filter(
        (
          entry
        ): entry is { table: TableMetadataDto; index: number; score: number } =>
          Boolean(entry)
      )
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .map((entry) => entry.table);
  }, [searchTerm, sortedTables]);

  return (
    <div className="w-75 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-white pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateHome}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Back to Admin Panel"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1
            className={`!text-xl font-bold ${
              isProduction() ? "text-red-500" : "text-gray-900"
            }`}
          >
            Database Viewer
          </h1>
        </div>
      </div>
      <div className="relative">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search tables"
          aria-label="Search tables"
          autoFocus
          className="w-full rounded-none border-b border-gray-200 px-2 py-2 pr-7 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && !tables.length ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-14 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {filteredTables.map((table) => (
              <div
                key={table.name}
                onClick={() => onSelectTable(table.name)}
                className={`w-full text-left p-3 rounded-lg ${
                  selectedTable === table.name
                    ? "bg-blue-200"
                    : "hover:bg-gray-100 text-gray-700 cursor-pointer"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {table.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {table.entityName}
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedTable === table.name
                          ? " text-black"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {table.recordCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {!filteredTables.length && (
              <div className="p-3 text-sm text-gray-500">
                No tables match that search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseSidebar;
