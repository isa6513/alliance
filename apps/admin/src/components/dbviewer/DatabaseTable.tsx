import React from "react";
import type {
  ColumnMetadataDto,
  TableDataDto,
} from "@alliance/shared/client/types.gen";
import type {
  SelectedRowState,
  TableDataQueryState,
} from "./DatabaseViewer.hooks";

interface DatabaseTableProps {
  tableData: TableDataDto;
  selectedTable: string;
  selectedRow: SelectedRowState | null;
  query: TableDataQueryState;
  selectedRows: Set<string | number>;
  highlightedRows: Set<string>;
  onSelectRow: (value: string | number, checked: boolean) => void;
  onSelectAllRows: (checked: boolean) => void;
  onSort: (columnName: string) => void;
  onPageChange: (page: number) => void;
  formatCellValue: (
    value: unknown,
    column: ColumnMetadataDto,
    rowIndex: number,
    columnIndex: number
  ) => React.ReactNode;
  handleCellClick: (
    rowIndex: number,
    columnIndex: number,
    cellValue: unknown,
    column: ColumnMetadataDto
  ) => void;
  getRowPrimaryKey: (
    row: unknown[],
    columns: ColumnMetadataDto[]
  ) => string | number | null;
}

const DatabaseTable: React.FC<DatabaseTableProps> = ({
  tableData,
  selectedTable,
  selectedRow,
  query,
  selectedRows,
  highlightedRows,
  onSelectRow,
  onSelectAllRows,
  onSort,
  onPageChange,
  formatCellValue,
  handleCellClick,
  getRowPrimaryKey,
}) => {
  const isAllSelected =
    tableData.rows.length > 0 &&
    tableData.rows.every((row) => {
      const primaryKeyValue = getRowPrimaryKey(row, tableData.columns);
      return primaryKeyValue !== null && selectedRows.has(primaryKeyValue);
    });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (!el) return;
                    const isIndeterminate =
                      selectedRows.size > 0 &&
                      !tableData.rows.every((row) => {
                        const primaryKeyValue = getRowPrimaryKey(
                          row,
                          tableData.columns
                        );
                        return (
                          primaryKeyValue !== null &&
                          selectedRows.has(primaryKeyValue)
                        );
                      });
                    el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAllRows(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              {tableData.columns.map((column, columnIndex) => (
                <th
                  key={`${column.name}-${columnIndex}`}
                  onClick={() => onSort(column.name)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.name}</span>
                    {column.isPrimary && (
                      <span className="text-yellow-500">🔑</span>
                    )}
                    {column.dataType === "relation" && (
                      <span className="text-blue-500">🔗</span>
                    )}
                    {query.sortBy === column.name && (
                      <span>{query.sortOrder === "ASC" ? "↑" : "↓"}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 normal-case">
                    <span className="font-medium">{column.dataType}</span>
                    {column.rawType &&
                      column.rawType.toLowerCase() !==
                        column.dataType.toLowerCase() && (
                        <span className="text-gray-300 ml-1">
                          ({column.rawType})
                        </span>
                      )}
                    {column.relationTarget && (
                      <span className="text-blue-400">
                        {" "}
                        → {column.relationTarget}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.rows.map((row, rowIndex) => {
              const rowPrimaryKey = getRowPrimaryKey(row, tableData.columns);
              const isSelectedRow =
                selectedRow !== null &&
                selectedRow.tableName === selectedTable &&
                rowPrimaryKey !== null &&
                String(rowPrimaryKey) === String(selectedRow.rowId);
              const isNewRow =
                rowPrimaryKey !== null &&
                highlightedRows.has(String(rowPrimaryKey));

              const uniqueKey =
                rowPrimaryKey !== null
                  ? `${selectedTable}-${rowPrimaryKey}-row${rowIndex}`
                  : `${selectedTable}-page${query.page}-row${rowIndex}`;

              const rowClassName = isNewRow
                ? "new-row-fade border-l-4 border-l-green-500"
                : isSelectedRow
                ? "bg-yellow-50 border-l-4 border-l-yellow-400 hover:bg-yellow-100"
                : rowPrimaryKey !== null && selectedRows.has(rowPrimaryKey)
                ? "bg-blue-50 border-blue-200"
                : "hover:bg-gray-50";

              return (
                <tr key={uniqueKey} className={rowClassName}>
                  <td className="px-6 py-3">
                    {rowPrimaryKey !== null && (
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowPrimaryKey)}
                        onChange={(e) =>
                          onSelectRow(rowPrimaryKey, e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    )}
                  </td>
                  {row.map((cell, cellIndex) => {
                    const column = tableData.columns[cellIndex];
                    const isEditable =
                      !column.isPrimary && column.dataType !== "relation";

                    return (
                      <td
                        key={cellIndex}
                        className={`whitespace-nowrap text-sm text-gray-900 max-w-[300px] overflow-x-clip border border-gray-200 ${
                          isEditable ? "hover:bg-gray-50" : ""
                        } px-5 py-3`}
                        onClick={() =>
                          isEditable
                            ? handleCellClick(rowIndex, cellIndex, cell, column)
                            : undefined
                        }
                      >
                        {formatCellValue(cell, column, rowIndex, cellIndex)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {tableData.totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing page {tableData.page} of {tableData.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(tableData.page - 1)}
                disabled={tableData.page <= 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from(
                  { length: Math.min(5, tableData.totalPages) },
                  (_, index) => {
                    const page = Math.max(1, tableData.page - 2) + index;
                    if (page > tableData.totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          page === tableData.page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => onPageChange(tableData.page + 1)}
                disabled={tableData.page >= tableData.totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseTable;
