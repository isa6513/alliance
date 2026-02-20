import {
  Action,
  actionsAllGeneralUpdatesAdmin,
  actionsFindAllWithDrafts,
  actionsSetPriority,
  SetPriorityDto,
  type GeneralUpdateAdminDto,
} from "@alliance/shared/client";
import { homePagePriorityComparator } from "@alliance/shared/lib/actionUtils";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import { useToast } from "@alliance/sharedweb/ui/ToastProvider";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GripVertical,
  Minus,
  MoveUpIcon,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router";

type PriorityItem =
  | {
      type: "action";
      id: number;
      name: string;
      priority: number;
      suiteName?: string;
    }
  | {
      type: "generalUpdate";
      id: number;
      name: string;
      priority: number;
      suiteName?: string;
    }
  | {
      type: "divider";
      id?: undefined;
      name?: undefined;
      priority?: undefined;
      suiteName?: undefined;
    };

function buildInitialList(
  actions: Action[],
  generalUpdates: GeneralUpdateAdminDto[]
): PriorityItem[] {
  const withRaw: {
    item: PriorityItem;
    raw: Action | GeneralUpdateAdminDto;
  }[] = [
    ...actions.map((a) => ({
      item: {
        type: "action" as const,
        id: a.id,
        name: a.name,
        priority: a.priority,
        suiteName: a.suite?.name,
      },
      raw: a,
    })),
    ...generalUpdates.map((u) => ({
      item: {
        type: "generalUpdate" as const,
        id: u.id,
        name: u.name,
        priority: u.priority,
        suiteName: u.suites?.length
          ? u.suites.map((s) => s.name).join(", ")
          : undefined,
      },
      raw: u,
    })),
  ];
  withRaw.sort((a, b) => homePagePriorityComparator(a.raw, b.raw));
  // Insert "new items" divider above all priority <= 0, below any priority > 0
  const dividerIndex = withRaw.findIndex(({ raw }) => {
    const p = (raw as { priority?: number }).priority;
    return p === undefined || p < 0;
  });
  const insertAt = dividerIndex === -1 ? withRaw.length : dividerIndex;
  const above = withRaw.slice(0, insertAt).map((x) => x.item);
  const below = withRaw.slice(insertAt).map((x) => x.item);
  return [...above, { type: "divider" as const }, ...below];
}

const PriorityPage: React.FC = () => {
  const [items, setItems] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  const dragListenerRef = useRef<((e: DragEvent) => void) | null>(null);
  const transparentDragImageRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const { error: showError } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [actionsRes, updatesRes] = await Promise.all([
        actionsFindAllWithDrafts(),
        actionsAllGeneralUpdatesAdmin(),
      ]);
      const actions = actionsRes.data ?? [];
      const updates = updatesRes.data ?? [];
      setItems(buildInitialList(actions, updates));
    } catch (err) {
      setError("Failed to load actions and general updates");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (dragListenerRef.current) {
        document.removeEventListener("drag", dragListenerRef.current);
        dragListenerRef.current = null;
      }
      if (dragPreviewRef.current?.parentNode) {
        dragPreviewRef.current.parentNode.removeChild(dragPreviewRef.current);
        dragPreviewRef.current = null;
      }
      if (transparentDragImageRef.current?.parentNode) {
        transparentDragImageRef.current.parentNode.removeChild(
          transparentDragImageRef.current
        );
        transparentDragImageRef.current = null;
      }
      draggedIndexRef.current = null;
    };
  }, []);

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index);
    draggedIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Custom preview: clone the row so it follows the cursor, then we remove it on drop (no post-drop animation)
    const source = e.currentTarget as HTMLDivElement;
    const preview = source.cloneNode(true) as HTMLDivElement;
    preview.setAttribute("aria-hidden", "true");
    Object.assign(preview?.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: `${source.offsetWidth}px`,
      pointerEvents: "none",
      opacity: "0.50",
      zIndex: "9999",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      borderRadius: "4px",
      backgroundColor: "white",
    });
    // Override any inherited/class-based transparency in the clone
    preview.querySelectorAll("*").forEach((el) => {
      (el as HTMLElement).style.opacity = "1";
    });
    document.body.appendChild(preview);
    dragPreviewRef.current = preview;
    const offsetX = e.clientX - source.getBoundingClientRect().left;
    const offsetY = e.clientY - source.getBoundingClientRect().top;
    const onDrag = (e: DragEvent) => {
      if (preview && e.clientX !== 0 && e.clientY !== 0) {
        preview.style.left = `${e.clientX - offsetX}px`;
        preview.style.top = `${e.clientY - offsetY}px`;
      }
      updateDropTargetFromPreviewCenter();
    };
    preview.style.left = `${e.clientX - offsetX}px`;
    preview.style.top = `${e.clientY - offsetY}px`;
    document.addEventListener("drag", onDrag);
    dragListenerRef.current = onDrag;
    updateDropTargetFromPreviewCenter();
    // Hide native ghost (it would animate to drop target on release)
    const transparent = document.createElement("div");
    transparent.style.cssText =
      "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
    document.body.appendChild(transparent);
    transparentDragImageRef.current = transparent;
    e.dataTransfer.setDragImage(transparent, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    draggedIndexRef.current = null;
    if (dragListenerRef.current) {
      document.removeEventListener("drag", dragListenerRef.current);
      dragListenerRef.current = null;
    }
    if (dragPreviewRef.current?.parentNode) {
      dragPreviewRef.current.parentNode.removeChild(dragPreviewRef.current);
      dragPreviewRef.current = null;
    }
    if (transparentDragImageRef.current?.parentNode) {
      transparentDragImageRef.current.parentNode.removeChild(
        transparentDragImageRef.current
      );
      transparentDragImageRef.current = null;
    }
  };

  const applyReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setItems((prev) => {
      const next = [...prev];
      const [moving] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moving);
      return next;
    });
  }, []);

  const updateDropTargetFromPreviewCenter = useCallback(() => {
    const preview = dragPreviewRef.current;
    const listEl = listRef.current;
    const currentDragged = draggedIndexRef.current;
    if (!preview || !listEl || currentDragged === null) return;
    const rect = preview.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;
    const rows = listEl.querySelectorAll<HTMLDivElement>("[data-priority-row]");
    for (let i = 0; i < rows.length; i++) {
      const rowRect = rows[i].getBoundingClientRect();
      if (
        centerY >= rowRect.top &&
        centerY <= rowRect.bottom &&
        centerX >= rowRect.left &&
        centerX <= rowRect.right
      ) {
        applyReorder(currentDragged, i);
        draggedIndexRef.current = i;
        setDraggedIndex(i);
        break;
      }
    }
  }, [applyReorder]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleDragEnd();
  };

  const {
    newPriorities,
    newActionPriorityById,
    newGeneralUpdatePriorityById,
    anyChanged,
  } = useMemo(() => {
    const newPriorities: SetPriorityDto = {
      actionPriorities: [],
      generalUpdatePriorities: [],
    };
    const newActionPriorityById: Record<number, number> = {};
    const newGeneralUpdatePriorityById: Record<number, number> = {};
    let anyChanged = false;

    const dividerIndex = items.findIndex((i) => i.type === "divider");
    items.forEach((item, index) => {
      if (item.type === "divider") return;
      const newPriority = dividerIndex - index;
      if (item.type === "action") {
        newPriorities.actionPriorities.push({
          id: item.id,
          priority: newPriority,
        });
        newActionPriorityById[item.id] = newPriority;
        if (newPriority !== item.priority) {
          anyChanged = true;
        }
      }
      if (item.type === "generalUpdate") {
        newPriorities.generalUpdatePriorities.push({
          id: item.id,
          priority: newPriority,
        });
        newGeneralUpdatePriorityById[item.id] = newPriority;
        if (newPriority !== item.priority) {
          anyChanged = true;
        }
      }
    });

    return {
      newPriorities,
      newActionPriorityById,
      newGeneralUpdatePriorityById,
      anyChanged,
    };
  }, [items]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await actionsSetPriority({
        body: newPriorities,
      });
      await load();
    } catch (err) {
      showError("Failed to save priorities");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [newPriorities, load, showError]);

  if (loading) {
    return (
      <div className="p-5">
        <title>Priority - Admin</title>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <title>Priority - Admin</title>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <title>Priority - Admin</title>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-bold text-lg">Priority order</h1>
        <Button
          color={ButtonColor.Green}
          className="text-white !px-4 !py-2 rounded-md"
          onClick={handleSave}
          disabled={saving || !anyChanged}
        >
          {saving ? "Saving…" : anyChanged ? "Save" : "No changes to save"}
        </Button>
      </div>
      <p className="text-sm text-zinc-600">
        Actions/general updates at the top are shown first on the home page.
      </p>
      <ul
        ref={listRef}
        className="border border-zinc-200 rounded-lg divide-y divide-zinc-200 bg-white"
      >
        {items.map((item, index) => {
          const isDragging = draggedIndex === index;
          const isDivider = item.type === "divider";
          const delta = (() => {
            switch (item.type) {
              case "action":
                return (
                  (newActionPriorityById[item.id] ?? item.priority) -
                  item.priority
                );
              case "generalUpdate":
                return (
                  (newGeneralUpdatePriorityById[item.id] ?? item.priority) -
                  item.priority
                );
              case "divider":
                return 0;
              default:
                throw new Error(`Unknown item type: ${item satisfies never}`);
            }
          })();
          return (
            <li
              key={isDivider ? "divider" : `${item.type}-${item.id}`}
              className="relative"
            >
              <div
                data-priority-row
                data-index={index}
                draggable
                onDragStart={handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing transition-opacity ${
                  isDragging
                    ? "opacity-50"
                    : draggedIndex === null
                    ? "hover:bg-zinc-50"
                    : ""
                } ${isDivider ? "bg-zinc-100/80" : ""}`}
              >
                <GripVertical
                  size={18}
                  className="text-zinc-400 shrink-0"
                  aria-hidden
                />
                {isDivider ? (
                  <div className="flex flex-row text-zinc-600 items-center gap-1">
                    <MoveUpIcon size={14} />
                    New actions/general updates will be inserted above
                  </div>
                ) : (
                  <>
                    {delta > 0 ? (
                      <ArrowUpIcon size={14} className="text-green" />
                    ) : delta < 0 ? (
                      <ArrowDownIcon size={14} className="text-orange-600" />
                    ) : (
                      <Minus size={14} className="text-zinc-500" />
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                        item.type === "action"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.type === "action" ? "Action" : "General update"}
                    </span>
                    <span className="font-medium text-zinc-800 min-w-0 truncate">
                      {item.name}
                    </span>
                    {item.suiteName ? (
                      <span className="text-xs text-zinc-500 shrink-0">
                        {item.suiteName}
                      </span>
                    ) : null}
                    <Link
                      to={
                        item.type === "action"
                          ? `/actions/${item.id}`
                          : `/general-updates/${item.id}`
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto shrink-0 rounded px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 transition-colors"
                    >
                      View
                    </Link>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PriorityPage;
