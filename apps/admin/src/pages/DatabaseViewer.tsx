/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  adminViewerCreateRecord,
  adminViewerDeleteRecords,
  adminViewerGetTableData,
  adminViewerGetTables,
  adminViewerUpdateRecord,
} from "@alliance/shared/client";
import type {
  ColumnMetadataDto,
  TableDataDto,
  TableMetadataDto,
} from "@alliance/shared/client/types.gen";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import CellEditor from "../components/CellEditor";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAdminWebSocket } from "../lib/useAdminWebSocket";

interface TableDataQueryDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

const DatabaseViewer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableMetadataDto[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<TableDataDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<{
    tableName: string;
    rowId: string | number;
  } | null>(null);
  const [query, setQuery] = useState<TableDataQueryDto>({
    page: 1,
    limit: 50,
    sortOrder: "ASC",
  });
  const [searchInput, setSearchInput] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [newRows, setNewRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnIndex: number;
    originalValue: any;
  } | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<{
    tableName: string;
    primaryKeyValue: any;
    columnName: string;
    newValue: any;
    originalValue: any;
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );
  const [pendingDelete, setPendingDelete] = useState<{
    tableName: string;
    primaryKeyValues: (string | number)[];
  } | null>(null);
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [newRecordInputs, setNewRecordInputs] = useState<
    Record<string, string>
  >({});
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [newRecordError, setNewRecordError] = useState<string | null>(null);
  const [newRecordFieldErrors, setNewRecordFieldErrors] = useState<
    Record<string, string>
  >({});
  const highlightTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const editableColumns = useMemo(() => {
    if (!tableData) return [] as ColumnMetadataDto[];
    return tableData.columns.filter((column) => {
      const normalized = column.name.toLowerCase();
      return normalized !== "datecreated" && normalized !== "dateupdated";
    });
  }, [tableData]);

  // WebSocket connection for live updates
  const {
    isConnected,
    subscribeToTable,
    unsubscribeFromTable,
    setEventHandlers,
  } = useAdminWebSocket();

  const setDefaultSorting = useCallback(
    async (tableData: TableDataDto) => {
      if (query.sortBy) return;
      if (tableData.columns.some((col) => col.name === "updatedAt")) {
        setQuery((prev) => ({
          ...prev,
          sortBy: "updatedAt",
          sortOrder: "DESC",
        }));
      } else if (tableData.columns.some((col) => col.name === "createdAt")) {
        setQuery((prev) => ({
          ...prev,
          sortBy: "createdAt",
          sortOrder: "DESC",
        }));
      }
    },
    [query]
  );

  const loadTableData = useCallback(async () => {
    if (!selectedTable) return;

    try {
      const response = await adminViewerGetTableData({
        path: { tableName: selectedTable },
        query: {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder as "ASC" | "DESC",
          search: query.search,
        },
      });

      if (response.data) {
        setTableData(response.data);
        setDefaultSorting(response.data);

        // If we have a selected row for this table and it's not visible on this page,
        // try to find it by searching for it
        if (
          selectedRow &&
          selectedRow.tableName === selectedTable &&
          response.data.rows.length > 0
        ) {
          const rowExists = response.data.rows.some((row) => {
            const rowPrimaryKey = getRowPrimaryKey(row, response.data.columns);
            return (
              rowPrimaryKey !== null &&
              String(rowPrimaryKey) === String(selectedRow.rowId)
            );
          });

          // If row not found and we're not already searching, search for the ID
          if (!rowExists && !query.search) {
            setLoading(false);
            setQuery((prev) => ({
              ...prev,
              search: String(selectedRow.rowId),
              page: 1,
            }));
            return;
          }
        }
      }
    } catch (error) {
      console.error("Failed to load table data:", error);
    }
  }, [selectedTable, query, selectedRow, setDefaultSorting]);

  const highlightRow = useCallback(
    (primaryKeyValue: string | number) => {
      const key = String(primaryKeyValue);

      setNewRows((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });

      const existingTimeout = highlightTimeoutsRef.current.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        setNewRows((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        highlightTimeoutsRef.current.delete(key);
      }, 3000);

      highlightTimeoutsRef.current.set(key, timeout);
    },
    [setNewRows]
  );

  //   Set up event handlers
  useEffect(() => {
    setEventHandlers({
      onRowInserted: (event) => {
        if (event.tableName === selectedTable && tableData) {
          console.log("New row inserted:", event.entity);

          // Extract primary key from the new entity
          const primaryKeyColumn = tableData.columns.find(
            (col) => col.isPrimary
          );
          if (primaryKeyColumn && event.entity) {
            const primaryKeyValue = event.entity[primaryKeyColumn.name];
            if (primaryKeyValue !== undefined && primaryKeyValue !== null) {
              highlightRow(primaryKeyValue);
              // Refresh table data to show the new row
              loadTableData();
            }
          }
        }
      },
      onRowUpdated: (event) => {
        if (event.tableName === selectedTable) {
          console.log("Row updated:", event.entity);
          // Refresh table data to show updates
          loadTableData();
        }
      },
      onRowDeleted: (event) => {
        if (event.tableName === selectedTable) {
          console.log("Row deleted:", event.entityId);
          // Refresh table data to reflect deletion
          loadTableData();
        }
      },
    });
  }, [selectedTable, tableData, loadTableData, setEventHandlers, highlightRow]);

  // Initialize selected table and row from URL params
  useEffect(() => {
    const tableFromUrl = searchParams.get("table");
    const rowIdFromUrl = searchParams.get("id");
    if (tableFromUrl) {
      setSelectedTable(tableFromUrl);
    }
    if (rowIdFromUrl && tableFromUrl) {
      setSelectedRow({ tableName: tableFromUrl, rowId: rowIdFromUrl });
    }
  }, [searchParams]);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableData();
    }
  }, [selectedTable, query, loadTableData]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await adminViewerGetTables();
      if (response.data) {
        setTables(response.data.tables);
      }
    } catch (error) {
      console.error("Failed to load tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnName: string) => {
    setQuery((prev) => ({
      ...prev,
      sortBy: columnName,
      sortOrder:
        prev.sortBy === columnName && prev.sortOrder === "ASC" ? "DESC" : "ASC",
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (search: string) => {
    setSearchInput(search);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setQuery((prev) => ({ ...prev, search: search || undefined, page: 1 }));
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      highlightTimeoutsRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      highlightTimeoutsRef.current.clear();
    };
  }, []);

  const handleTableSelect = useCallback(
    (tableName: string) => {
      setSelectedTable(tableName);
      // Update URL params
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("table", tableName);
        // Clear id param when switching tables unless it's the same table
        if (selectedTable !== tableName) {
          newParams.delete("id");
        }
        return newParams;
      });
    },
    [setSearchParams, selectedTable]
  );

  const navigateToRelatedRow = (tableName: string, rowId: string | number) => {
    setSelectedRow({ tableName, rowId });
    handleTableSelect(tableName);
    setQuery((prev) => ({ ...prev, page: 1, search: undefined }));
    // Update URL params to include the row ID
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("table", tableName);
      newParams.set("id", String(rowId));
      return newParams;
    });
  };

  const handleCellClick = (
    rowIndex: number,
    columnIndex: number,
    cellValue: any,
    column: ColumnMetadataDto
  ) => {
    // Don't allow editing primary keys or relation columns
    if (column.isPrimary || column.dataType === "relation") {
      return;
    }

    setEditingCell({
      rowIndex,
      columnIndex,
      originalValue: cellValue,
    });
  };

  const handleCellSave = async (newValue: any) => {
    if (!editingCell || !tableData) return;

    const { rowIndex, columnIndex } = editingCell;
    const column = tableData.columns[columnIndex];
    const row = tableData.rows[rowIndex];
    const primaryKeyColumn = tableData.columns.find((col) => col.isPrimary);

    if (!primaryKeyColumn) {
      alert("Cannot update: No primary key found");
      setEditingCell(null);
      return;
    }

    const primaryKeyIndex = tableData.columns.findIndex((col) => col.isPrimary);
    const primaryKeyValue = row[primaryKeyIndex];

    // Check if value actually changed
    if (newValue === editingCell.originalValue) {
      setEditingCell(null);
      return;
    }

    // Set up pending update for confirmation
    setPendingUpdate({
      tableName: selectedTable,
      primaryKeyValue,
      columnName: column.name,
      newValue,
      originalValue: editingCell.originalValue,
    });

    setEditingCell(null);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const confirmUpdate = async () => {
    if (!pendingUpdate) return;

    try {
      const response = await adminViewerUpdateRecord({
        path: { tableName: pendingUpdate.tableName },
        body: {
          primaryKeyValue: pendingUpdate.primaryKeyValue,
          updates: {
            [pendingUpdate.columnName]: pendingUpdate.newValue,
          },
        },
      });

      if (response.data?.success) {
        // Refresh table data to show the update
        loadTableData();
      } else {
        alert(`Update failed: ${response.data?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert(
        `Update failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setPendingUpdate(null);
    }
  };

  const cancelUpdate = () => {
    setPendingUpdate(null);
  };

  const handleSelectRow = (
    primaryKeyValue: string | number,
    checked: boolean
  ) => {
    setSelectedRows((prev) => {
      const newSelection = new Set(prev);
      if (checked) {
        newSelection.add(primaryKeyValue);
      } else {
        newSelection.delete(primaryKeyValue);
      }
      return newSelection;
    });
  };

  const handleSelectAllRows = (checked: boolean) => {
    if (!tableData) return;

    setSelectedRows((prev) => {
      const newSelection = new Set(prev);

      if (checked) {
        // Add all visible rows to selection
        tableData.rows.forEach((row) => {
          const primaryKeyValue = getRowPrimaryKey(row, tableData.columns);
          if (primaryKeyValue !== null) {
            newSelection.add(primaryKeyValue);
          }
        });
      } else {
        // Remove all visible rows from selection
        tableData.rows.forEach((row) => {
          const primaryKeyValue = getRowPrimaryKey(row, tableData.columns);
          if (primaryKeyValue !== null) {
            newSelection.delete(primaryKeyValue);
          }
        });
      }

      return newSelection;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size === 0 || !selectedTable) return;

    setPendingDelete({
      tableName: selectedTable,
      primaryKeyValues: Array.from(selectedRows),
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      const response = await adminViewerDeleteRecords({
        path: { tableName: pendingDelete.tableName },
        body: {
          primaryKeyValues: pendingDelete.primaryKeyValues.map((value) =>
            String(value)
          ),
        },
      });

      if (response.data?.success) {
        // Clear the selected row if it was one of the deleted rows
        if (
          selectedRow &&
          selectedRow.tableName === pendingDelete.tableName &&
          pendingDelete.primaryKeyValues.some(
            (deletedId) => String(deletedId) === String(selectedRow.rowId)
          )
        ) {
          setSelectedRow(null);
          // Clear the search query that was filtering for this row
          setSearchInput("");
          setQuery((prev) => ({
            ...prev,
            search: undefined,
            page: 1,
          }));
          // Also clear the URL parameter
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.delete("id");
            return newParams;
          });
        }

        setSelectedRows(new Set());
        loadTableData();
        alert(`Successfully deleted ${response.data.deletedCount} record(s)`);
      } else {
        alert(`Delete failed: ${response.data?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert(
        `Delete failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const openAddRowModal = () => {
    if (!tableData) return;

    const initialInputs: Record<string, string> = {};
    editableColumns.forEach((column) => {
      initialInputs[column.name] = "";
    });

    setNewRecordInputs(initialInputs);
    setNewRecordError(null);
    setNewRecordFieldErrors({});
    setIsAddRowOpen(true);
  };

  const closeAddRowModal = () => {
    setIsAddRowOpen(false);
    setNewRecordInputs({});
    setNewRecordError(null);
    setNewRecordFieldErrors({});
  };

  const handleNewRecordInputChange = (columnName: string, value: string) => {
    setNewRecordInputs((prev) => ({
      ...prev,
      [columnName]: value,
    }));

    if (!tableData) return;

    const column = editableColumns.find((col) => col.name === columnName);
    if (!column) return;

    const { error } = parseNewRecordValue(column, value);

    setNewRecordFieldErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[columnName] = error;
      } else {
        delete next[columnName];
      }
      return next;
    });

    setNewRecordError(null);
  };

  const parseNewRecordValue = (
    column: ColumnMetadataDto,
    rawValue: string
  ): { value: unknown; error?: string } => {
    const trimmed = rawValue.trim();

    if (trimmed === "") {
      if (column.isNullable) {
        return { value: null };
      }
      return { value: undefined };
    }

    const columnLabel = `Value for "${column.name}"`;

    switch (column.dataType) {
      case "number": {
        const parsed = Number(trimmed);
        if (Number.isNaN(parsed)) {
          return {
            value: undefined,
            error: `${columnLabel} must be a valid number.`,
          };
        }
        return { value: parsed };
      }

      case "boolean": {
        const lower = trimmed.toLowerCase();
        if (["true", "1"].includes(lower)) {
          return { value: true };
        }
        if (["false", "0"].includes(lower)) {
          return { value: false };
        }
        return {
          value: undefined,
          error: `${columnLabel} must be true/false or 1/0.`,
        };
      }

      case "json": {
        try {
          return { value: JSON.parse(trimmed) };
        } catch {
          return {
            value: undefined,
            error: `${columnLabel} must be valid JSON.`,
          };
        }
      }

      case "date":
      case "datetime":
        if (Number.isNaN(Date.parse(trimmed))) {
          return {
            value: undefined,
            error: `${columnLabel} must be a valid date/time.`,
          };
        }
        return { value: trimmed };

      case "enum": {
        if (column.enumValues && !column.enumValues.includes(trimmed)) {
          return {
            value: undefined,
            error: `${columnLabel} must be one of: ${column.enumValues.join(", ")}.`,
          };
        }
        return { value: trimmed };
      }

      case "uuid": {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(trimmed)) {
          return {
            value: undefined,
            error: `${columnLabel} must be a valid UUID.`,
          };
        }
        return { value: trimmed };
      }

      default:
        return { value: rawValue };
    }
  };

  const handleCreateRecord = async () => {
    if (!selectedTable || !tableData) return;

    setNewRecordError(null);
    const record: Record<string, unknown> = {};
    const fieldErrors: Record<string, string> = {};

    editableColumns.forEach((column) => {
      const rawValue = newRecordInputs[column.name] ?? "";
      const { value, error } = parseNewRecordValue(column, rawValue);

      if (error) {
        fieldErrors[column.name] = error;
        return;
      }

      if (value !== undefined) {
        record[column.name] = value;
      }
    });

    const errorMessages = Object.values(fieldErrors);
    if (errorMessages.length > 0) {
      setNewRecordFieldErrors(fieldErrors);
      setNewRecordError(errorMessages.join("\n"));
      return;
    }

    if (Object.keys(record).length === 0) {
      setNewRecordError("Provide at least one value before creating a record.");
      return;
    }

    try {
      setIsCreatingRecord(true);
      setNewRecordFieldErrors({});
      const response = await adminViewerCreateRecord({
        path: { tableName: selectedTable },
        body: { record },
      });

      if (response.data?.success) {
        alert("Record created successfully");

        const primaryKeyColumn = tableData.columns.find((col) => col.isPrimary);
        if (primaryKeyColumn) {
          const createdRecord = response.data.createdRecord as
            | Record<string, unknown>
            | undefined;
          const primaryKeyValue =
            createdRecord?.[primaryKeyColumn.name] ??
            record[primaryKeyColumn.name];

          if (
            primaryKeyValue !== undefined &&
            primaryKeyValue !== null &&
            (typeof primaryKeyValue === "string" ||
              typeof primaryKeyValue === "number")
          ) {
            highlightRow(primaryKeyValue);
          }
        }

        closeAddRowModal();
        await loadTableData();
      } else {
        setNewRecordError(response.data?.message || "Failed to create record");
      }
    } catch (error) {
      console.error("Failed to create record:", error);
      setNewRecordError(
        error instanceof Error ? error.message : "Unknown error creating record"
      );
    } finally {
      setIsCreatingRecord(false);
    }
  };

  const renderNewRecordField = (column: ColumnMetadataDto) => {
    const value = newRecordInputs[column.name] ?? "";
    const baseInputClasses =
      "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white";
    const hasError = !!newRecordFieldErrors[column.name];
    const inputClasses = `${baseInputClasses} ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

    switch (column.dataType) {
      case "boolean":
        return (
          <select
            value={value}
            onChange={(e) =>
              handleNewRecordInputChange(column.name, e.target.value)
            }
            className={inputClasses}
          >
            <option value="">-- Select --</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );

      case "enum":
        return (
          <select
            value={value}
            onChange={(e) =>
              handleNewRecordInputChange(column.name, e.target.value)
            }
            className={inputClasses}
          >
            <option value="">-- Select --</option>
            {column.enumValues?.map((enumValue) => (
              <option key={enumValue} value={enumValue}>
                {enumValue}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) =>
              handleNewRecordInputChange(column.name, e.target.value)
            }
            className={inputClasses}
            placeholder={column.isNullable ? "Leave blank for NULL" : undefined}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) =>
              handleNewRecordInputChange(column.name, e.target.value)
            }
            className={inputClasses}
          />
        );

      case "datetime":
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) =>
              handleNewRecordInputChange(column.name, e.target.value)
            }
            className={inputClasses}
          />
        );

      case "json":
        return (
          <textarea
            value={value}
            onChange={(e) =>
              handleNewRecordInputChange(column.name, e.target.value)
            }
            className={`${inputClasses} h-32 resize-y`}
            placeholder="Enter valid JSON"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) =>
              handleNewRecordInputChange(column.name, e.target.value)
            }
            className={inputClasses}
            placeholder={column.isNullable ? "Leave blank for NULL" : undefined}
          />
        );
    }
  };

  // Clear table data when changing tables to avoid showing stale data
  useEffect(() => {
    setSearchInput("");
    setNewRows(new Set()); // Clear new row highlights
    setSelectedRows(new Set()); // Clear selected rows
    setQuery((prev) => ({
      ...prev,
      search: undefined,
      page: 1,
      sortBy: undefined,
      sortOrder: "ASC",
    }));
    // Don't clear tableData immediately to prevent flashing
  }, [selectedTable]);

  // Subscribe to WebSocket updates for the current table
  useEffect(() => {
    if (selectedTable) {
      if (isConnected) {
        subscribeToTable(selectedTable);
      }

      return () => {
        if (isConnected) {
          unsubscribeFromTable(selectedTable);
        }
      };
    }
  }, [selectedTable, isConnected, subscribeToTable, unsubscribeFromTable]);

  // Helper function to get the primary key value for a row
  const getRowPrimaryKey = (
    row: unknown[],
    columns: ColumnMetadataDto[]
  ): string | number | null => {
    const primaryKeyColumn = columns.find((col) => col.isPrimary);
    if (!primaryKeyColumn) return null;

    const primaryKeyIndex = columns.findIndex((col) => col.isPrimary);
    return primaryKeyIndex >= 0
      ? (row[primaryKeyIndex] as string | number | null)
      : null;
  };

  const formatCellValue = (
    value: any,
    column: ColumnMetadataDto,
    rowIndex?: number,
    columnIndex?: number
  ) => {
    let editor: React.ReactNode | null = null;

    if (
      editingCell &&
      rowIndex !== undefined &&
      columnIndex !== undefined &&
      editingCell.rowIndex === rowIndex &&
      editingCell.columnIndex === columnIndex
    ) {
      editor = (
        <CellEditor
          value={value}
          column={column}
          onSave={handleCellSave}
          onCancel={handleCellCancel}
        />
      );
    }

    // Add edit cursor for editable cells
    const isEditable = !column.isPrimary && column.dataType !== "relation";
    const baseClassName = isEditable
      ? "cursor-pointer hover:bg-gray-100 p-1 rounded"
      : "";

    let element: React.ReactNode | null = null;
    if (value === null || value === undefined) {
      element = <span className={`text-gray-400 ${baseClassName}`}>null</span>;
    } else {
      switch (column.dataType) {
        case "relation":
          element = (
            <button
              onClick={() =>
                navigateToRelatedRow(column.relationTarget!, value)
              }
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              {value}
            </button>
          );
          break;

        case "boolean":
          element = (
            <span
              className={`${
                value ? "text-green-600" : "text-red-600"
              } ${baseClassName}`}
            >
              {value ? "true" : "false"}
            </span>
          );
          break;

        case "number":
          element = (
            <span className={`text-blue-800 font-mono ${baseClassName}`}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
          );
          break;
        case "date":
          element = (
            <span className={`text-purple-600 ${baseClassName}`}>
              {new Date(value).toLocaleDateString()}
            </span>
          );
          break;
        case "datetime":
          element = (
            <span className={`text-purple-600 ${baseClassName}`}>
              {new Date(value).toLocaleString()}
            </span>
          );
          break;
        case "json":
          element = (
            <div className={`max-w-xs ${baseClassName}`}>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : value}
              </pre>
            </div>
          );
          break;
        case "uuid":
          element = (
            <span
              className={`font-mono text-xs text-gray-600 ${baseClassName}`}
            >
              {value}
            </span>
          );
          break;

        case "enum":
          element = (
            <span
              className={`bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ${baseClassName}`}
            >
              {value}
            </span>
          );
          break;

        case "string":
        default: {
          const stringValue = String(value);
          if (stringValue.length > 100) {
            element = (
              <div className={`max-w-xs ${baseClassName}`}>
                <div className="truncate" title={stringValue}>
                  {stringValue}
                </div>
              </div>
            );
          }
          element = <span className={baseClassName}>{stringValue}</span>;
        }
      }
    }

    return (
      <div className="relative min-w-10">
        <div className={`${editor && "opacity-0"}`}>{element}</div>
        {editor}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-75  border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/")}
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
                window.location.href.includes("localhost")
                  ? "text-gray-900"
                  : "text-red-500"
              }`}
            >
              Database Viewer
            </h1>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-sm text-gray-600 mr-4">{tables.length} tables</p>
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-xs text-gray-500">
              {isConnected ? "Live updates active" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Tables List */}
        <div className="flex-1 overflow-y-auto">
          {loading && !tables.length ? (
            <div className="p-6">
              <div className="animate-pulse space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-1">
              {tables
                .sort((a, b) => {
                  // Sort by record count: non-empty tables first, then empty tables
                  if (a.recordCount === 0 && b.recordCount > 0) return 1;
                  if (a.recordCount > 0 && b.recordCount === 0) return -1;
                  // If both have records or both are empty, sort alphabetically
                  return a.name.localeCompare(b.name);
                })
                .map((table) => (
                  <button
                    key={table.name}
                    onClick={() => handleTableSelect(table.name)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTable === table.name
                        ? "bg-blue-50 border border-blue-200 text-blue-900"
                        : "hover:bg-gray-100 text-gray-700"
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
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {table.recordCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedTable ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="!text-lg font-semibold text-gray-900">
                      {selectedTable}
                    </h2>
                    {selectedRow && selectedRow.tableName === selectedTable && (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Row ID: {selectedRow.rowId}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedRow(null);
                            setSearchInput("");
                            setQuery((prev) => ({
                              ...prev,
                              search: undefined,
                              page: 1,
                            }));
                            // Remove id parameter from URL
                            setSearchParams((prev) => {
                              const newParams = new URLSearchParams(prev);
                              newParams.delete("id");
                              return newParams;
                            });
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="Clear selection"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {tableData && (
                    <p className="text-sm text-gray-600">
                      {tableData.totalCount.toLocaleString()} total records
                      {selectedRow &&
                        selectedRow.tableName === selectedTable &&
                        query.search && (
                          <span className="ml-2 text-yellow-600">
                            (filtered to show selected row)
                          </span>
                        )}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={openAddRowModal}
                    disabled={!tableData || isAddRowOpen}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Add Row</span>
                  </button>
                  {selectedRows.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="px-4 py-2 bg-red-100 text-black border border-red-500 rounded-md hover:bg-red-300 focus:ring-2 focus:ring-red-500 flex items-center space-x-2"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>
                        Delete {selectedRows.size} row
                        {selectedRows.size === 1 ? "" : "s"}
                      </span>
                    </button>
                  )}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search in table..."
                      value={searchInput}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-hidden">
              {loading && !tableData ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : tableData ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={
                                tableData.rows.length > 0 &&
                                tableData.rows.every((row) => {
                                  const primaryKeyValue = getRowPrimaryKey(
                                    row,
                                    tableData.columns
                                  );
                                  return (
                                    primaryKeyValue !== null &&
                                    selectedRows.has(primaryKeyValue)
                                  );
                                })
                              }
                              ref={(el) => {
                                if (el) {
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
                                }
                              }}
                              onChange={(e) =>
                                handleSelectAllRows(e.target.checked)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </th>
                          {tableData.columns.map((column, columnIndex) => (
                            <th
                              key={`${column.name}-${columnIndex}`}
                              onClick={() => handleSort(column.name)}
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
                                  <span>
                                    {query.sortOrder === "ASC" ? "↑" : "↓"}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 normal-case">
                                <span className="font-medium">
                                  {column.dataType}
                                </span>
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
                          const rowPrimaryKey = getRowPrimaryKey(
                            row,
                            tableData.columns
                          );
                          const isSelectedRow =
                            selectedRow !== null &&
                            selectedRow.tableName === selectedTable &&
                            rowPrimaryKey !== null &&
                            String(rowPrimaryKey) === String(selectedRow.rowId);

                          const isNewRow =
                            rowPrimaryKey !== null &&
                            newRows.has(String(rowPrimaryKey));

                          // Use primary key if available, otherwise use page and row index for uniqueness
                          const uniqueKey =
                            rowPrimaryKey !== null
                              ? `${selectedTable}-${rowPrimaryKey}-row${rowIndex}`
                              : `${selectedTable}-page${query.page}-row${rowIndex}`;

                          return (
                            <tr
                              key={uniqueKey}
                              className={`${
                                isNewRow
                                  ? "new-row-fade"
                                  : isSelectedRow
                                  ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                                  : rowPrimaryKey !== null &&
                                    selectedRows.has(rowPrimaryKey)
                                  ? "bg-blue-50 border-blue-200"
                                  : "hover:bg-gray-50"
                              } ${
                                isNewRow
                                  ? "border-l-4 border-l-green-500"
                                  : isSelectedRow
                                  ? "border-l-4 border-l-yellow-400"
                                  : ""
                              }`}
                            >
                              <td className="px-6 py-3">
                                {rowPrimaryKey !== null && (
                                  <input
                                    type="checkbox"
                                    checked={selectedRows.has(rowPrimaryKey)}
                                    onChange={(e) =>
                                      handleSelectRow(
                                        rowPrimaryKey,
                                        e.target.checked
                                      )
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                )}
                              </td>
                              {row.map((cell, cellIndex) => {
                                const column = tableData.columns[cellIndex];
                                const isEditable =
                                  !column.isPrimary &&
                                  column.dataType !== "relation";

                                return (
                                  <td
                                    key={cellIndex}
                                    className={`whitespace-nowrap text-sm text-gray-900 max-w-[300px] overflow-x-clip border border-gray-200 ${
                                      isEditable ? "hover:bg-gray-50" : ""
                                    }r
                                    px-5 py-3`}
                                    onClick={() =>
                                      isEditable
                                        ? handleCellClick(
                                            rowIndex,
                                            cellIndex,
                                            cell,
                                            column
                                          )
                                        : undefined
                                    }
                                  >
                                    {formatCellValue(
                                      cell,
                                      column,
                                      rowIndex,
                                      cellIndex
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {tableData.totalPages > 1 && (
                    <div className="border-t border-gray-200 bg-white px-6 py-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                          Showing page {tableData.page} of{" "}
                          {tableData.totalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePageChange(tableData.page - 1)}
                            disabled={tableData.page <= 1}
                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Previous
                          </button>

                          <div className="flex space-x-1">
                            {Array.from(
                              { length: Math.min(5, tableData.totalPages) },
                              (_, i) => {
                                const page =
                                  Math.max(1, tableData.page - 2) + i;
                                if (page > tableData.totalPages) return null;
                                return (
                                  <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
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
                            onClick={() => handlePageChange(tableData.page + 1)}
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
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No table selected
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Choose a table from the sidebar to view its data
              </p>
            </div>
          </div>
        )}
      </div>

      {isAddRowOpen && tableData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Row to {selectedTable}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Provide values for the columns you want to set. Leave fields
                blank to keep database defaults or NULL for nullable columns.
              </p>
            </div>
            <div className="px-6 py-4 overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-2">
                {editableColumns.map((column) => (
                  <div
                    key={column.name}
                    className={`space-y-1 ${
                      column.dataType === "json" ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {column.name}
                      </label>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{column.dataType}</span>
                        {column.isPrimary && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                            PK
                          </span>
                        )}
                        {column.relationTarget && (
                          <span>↗ {column.relationTarget}</span>
                        )}
                      </div>
                    </div>
                    {renderNewRecordField(column)}
                    {newRecordFieldErrors[column.name] ? (
                      <p className="text-xs text-red-600">
                        {newRecordFieldErrors[column.name]}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {column.isNullable
                          ? "Optional"
                          : column.isPrimary
                          ? "Leave blank to use the auto-generated default"
                          : "Required (may have default)"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {newRecordError && (
              <div className="px-6 text-sm text-red-600 whitespace-pre-line">
                {newRecordError}
              </div>
            )}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeAddRowModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                disabled={isCreatingRecord}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRecord}
                disabled={
                  isCreatingRecord ||
                  Object.keys(newRecordFieldErrors).length > 0
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingRecord ? "Creating..." : "Create Record"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!pendingUpdate}
        title="Confirm Update"
        message={
          pendingUpdate
            ? `Are you sure you want to update "${pendingUpdate.columnName}" from "${pendingUpdate.originalValue}" to "${pendingUpdate.newValue}"?`
            : ""
        }
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={confirmUpdate}
        onCancel={cancelUpdate}
        isLoading={false}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Confirm Delete"
        message={
          pendingDelete
            ? `Are you sure you want to delete ${
                pendingDelete.primaryKeyValues.length
              } record${
                pendingDelete.primaryKeyValues.length === 1 ? "" : "s"
              }? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={false}
      />
    </div>
  );
};

export default DatabaseViewer;
