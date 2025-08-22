/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  tasksCreateForm,
  tasksGetForm,
  tasksUpdateForm,
} from "@alliance/shared/client";
import type {
  DisplayBlock,
  DisplayKind,
} from "@alliance/shared/forms/display-blocks";
import FormRenderer from "@alliance/shared/forms/FormRenderer";
import type {
  AnyField,
  FieldKind,
  FormSchema,
  Page,
} from "@alliance/shared/forms/formschema";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  EditableDividerBlock,
  EditableHeaderBlock,
  EditableHtmlBlock,
  EditableImageBlock,
  EditableLabelBlock,
  EditableSpacerBlock,
  EditableTextBlock,
} from "./display-blocks";
import { ElementSelect } from "./ElementSelect";
import {
  EditableCheckboxField,
  EditableDateField,
  EditableEmailField,
  EditableFileField,
  EditableMultiSelectField,
  EditableNumberField,
  EditableRadioField,
  EditableSelectField,
  EditableTextField,
  EditableTextareaField,
} from "./form-fields";

interface FormBuilderProps {
  onSave?: (schema: FormSchema<string, string>) => void;
  initialSchema?: FormSchema<string, string>;
  actionId?: number;
}

export function FormBuilder({ onSave, initialSchema }: FormBuilderProps) {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get("id");

  const [schema, setSchema] = useState<FormSchema<string, string>>(
    initialSchema || {
      slug: "untitled-form",
      version: 1,
      title: "Untitled Form",
      description: "",
      pages: [
        {
          id: "page-1",
          title: "Page 1",
          fields: [],
        },
      ],
      submit: { label: "Submit" },
    }
  );

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [draggedItem, setDraggedItem] = useState<{
    index: number;
    pageIndex: number;
  } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const currentPage = schema.pages[selectedPageIndex];

  // Load form data when formId changes
  useEffect(() => {
    if (formId && !initialSchema) {
      setIsLoading(true);
      setLoadError(null);

      tasksGetForm({ path: { formId } })
        .then((response) => {
          if (response.data) {
            // Convert the form entity back to FormSchema
            const form = response.data as any;
            if (form.schema) {
              setSchema(form.schema as FormSchema<string, string>);
            }
          }
        })
        .catch((error) => {
          console.error("Failed to load form:", error);
          setLoadError(
            error instanceof Error ? error.message : "Failed to load form"
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [formId, initialSchema]);

  const addField = (kind: FieldKind) => {
    const fieldId = `field-${Date.now()}`;
    let newField: AnyField<string>;

    switch (kind) {
      case "text":
        newField = {
          id: fieldId,
          kind: "text",
          label: "Text Field",
          required: false,
        };
        break;
      case "textarea":
        newField = {
          id: fieldId,
          kind: "textarea",
          label: "Textarea Field",
          required: false,
          rows: 3,
        };
        break;
      case "email":
        newField = {
          id: fieldId,
          kind: "email",
          label: "Email Field",
          required: false,
        };
        break;
      case "number":
        newField = {
          id: fieldId,
          kind: "number",
          label: "Number Field",
          required: false,
        };
        break;
      case "checkbox":
        newField = {
          id: fieldId,
          kind: "checkbox",
          label: "Checkbox Field",
          required: false,
        };
        break;
      case "radio":
        newField = {
          id: fieldId,
          kind: "radio",
          label: "Radio Field",
          required: false,
          options: [{ label: "Option 1", value: "option1" }],
        };
        break;
      case "select":
        newField = {
          id: fieldId,
          kind: "select",
          label: "Select Field",
          required: false,
          options: [{ label: "Option 1", value: "option1" }],
        };
        break;
      case "multiselect":
        newField = {
          id: fieldId,
          kind: "multiselect",
          label: "Multi-Select Field",
          required: false,
          options: [{ label: "Option 1", value: "option1" }],
        };
        break;
      case "date":
        newField = {
          id: fieldId,
          kind: "date",
          label: "Date Field",
          required: false,
        };
        break;
      case "file":
        newField = {
          id: fieldId,
          kind: "file",
          label: "File Field",
          required: false,
        };
        break;
      default:
        return;
    }

    updateSchema({
      ...schema,
      pages: schema.pages.map((page, idx) =>
        idx === selectedPageIndex
          ? { ...page, fields: [...page.fields, newField] }
          : page
      ),
    });
  };

  const addDisplayBlock = (kind: DisplayKind) => {
    const blockId = `block-${Date.now()}`;
    let newBlock: DisplayBlock<string>;

    switch (kind) {
      case "header":
        newBlock = {
          kind: "header",
          id: blockId,
          text: "Header Text",
          level: 2,
        };
        break;
      case "text":
        newBlock = {
          kind: "text",
          id: blockId,
          text: "Text content",
          markdown: false,
        };
        break;
      case "label":
        newBlock = { kind: "label", id: blockId, text: "Label text" };
        break;
      case "divider":
        newBlock = { kind: "divider", id: blockId, thickness: "thin" };
        break;
      case "spacer":
        newBlock = { kind: "spacer", id: blockId, size: "md" };
        break;
      case "html":
        newBlock = {
          kind: "html",
          id: blockId,
          html: "<p>Custom HTML content</p>",
        };
        break;
      case "image":
        newBlock = {
          kind: "image",
          id: blockId,
          alt: "Image",
          src: "https://via.placeholder.com/300x200",
        };
        break;
      default:
        return;
    }

    updateSchema({
      ...schema,
      pages: schema.pages.map((page, idx) =>
        idx === selectedPageIndex
          ? { ...page, fields: [...page.fields, newBlock] }
          : page
      ),
    });
  };

  const updateSchema = (newSchema: FormSchema<string, string>) => {
    setSchema(newSchema);
  };

  const addPage = () => {
    const newPage: Page<string> = {
      id: `page-${schema.pages.length + 1}`,
      title: `Page ${schema.pages.length + 1}`,
      fields: [],
    };
    updateSchema({
      ...schema,
      pages: [...schema.pages, newPage],
    });
  };

  const removePage = (pageIndex: number) => {
    if (schema.pages.length <= 1) return;
    updateSchema({
      ...schema,
      pages: schema.pages.filter((_, i) => i !== pageIndex),
    });
    if (selectedPageIndex >= schema.pages.length - 1) {
      setSelectedPageIndex(Math.max(0, selectedPageIndex - 1));
    }
  };

  const handleSaveForm = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      let response;

      if (formId) {
        // Update existing form
        response = await tasksUpdateForm({
          path: { formId },
          body: {
            title: schema.title,
            schema: schema as unknown as Record<string, unknown>,
          },
        });
      } else {
        // Create new form
        response = await tasksCreateForm({
          body: {
            title: schema.title,
            schema: schema as unknown as Record<string, unknown>,
          },
        });
      }

      if (response.response.ok) {
        setSaveSuccess(true);

        // If creating a new form, update the URL to include the new form ID
        if (!formId && response.data && (response.data as any).id) {
          const newFormId = (response.data as any).id;
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("id", newFormId.toString());
          window.history.replaceState({}, "", newUrl.toString());
        }
      } else {
        setSaveError("Could not save form");
      }

      // Call the optional onSave callback if provided
      if (onSave) {
        onSave(schema);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save form:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save form"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedItem({
      index,
      pageIndex: selectedPageIndex,
    });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!draggedItem || draggedItem.pageIndex !== selectedPageIndex) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? "before" : "after";

    setDragOverIndex(index);
    setDropPosition(position);
  };

  const handleDrop = (dropIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();

    if (
      !draggedItem ||
      draggedItem.pageIndex !== selectedPageIndex ||
      !dropPosition
    ) {
      return;
    }

    const { index: dragIndex } = draggedItem;

    // Calculate the actual insertion index
    let insertionIndex = dropIndex;
    if (dropPosition === "after") {
      insertionIndex = dropIndex + 1;
    }

    // Adjust for the fact that we're removing the dragged item first
    if (dragIndex < insertionIndex) {
      insertionIndex -= 1;
    }

    if (dragIndex === insertionIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    const currentFields = [...currentPage.fields];
    const [draggedField] = currentFields.splice(dragIndex, 1);
    currentFields.splice(insertionIndex, 0, draggedField);

    updateSchema({
      ...schema,
      pages: schema.pages.map((page, idx) =>
        idx === selectedPageIndex ? { ...page, fields: currentFields } : page
      ),
    });

    setDraggedItem(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const renderField = (
    field: AnyField<string> | DisplayBlock<string>,
    index: number
  ) => {
    const updateField = (
      updates: Partial<AnyField<string> | DisplayBlock<string>>
    ) => {
      updateSchema({
        ...schema,
        pages: schema.pages.map((page, idx) =>
          idx === selectedPageIndex
            ? {
                ...page,
                fields: page.fields.map((f, i) =>
                  i === index ? { ...f, ...updates } : f
                ),
              }
            : page
        ),
      });
    };

    const removeField = () => {
      updateSchema({
        ...schema,
        pages: schema.pages.map((page, idx) =>
          idx === selectedPageIndex
            ? { ...page, fields: page.fields.filter((_, i) => i !== index) }
            : page
        ),
      });
    };

    const isDragging =
      draggedItem?.index === index &&
      draggedItem?.pageIndex === selectedPageIndex;
    const showInsertionBar =
      dragOverIndex === index && dropPosition && !isDragging;

    const commonProps = {
      onUpdate: updateField,
      onRemove: removeField,
      onDragStart: handleDragStart(index),
      onDragEnd: handleDragEnd,
      isDragging: isDragging,
    };

    // Render the element with insertion bar indicators
    return (
      <div key={index} className="relative">
        {/* Insertion bar before */}
        {showInsertionBar && dropPosition === "before" && (
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10">
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}

        {/* The actual element */}
        <div
          className="transition-all"
          onDragOver={handleDragOver(index)}
          onDrop={handleDrop(index)}
        >
          {/* Check if it's a form field (has 'label' property) vs display block */}
          {"label" in field
            ? (() => {
                const formField = field as AnyField<string>;
                switch (formField.kind) {
                  case "text":
                    return (
                      <EditableTextField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  case "textarea":
                    return (
                      <EditableTextareaField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  case "email":
                    return (
                      <EditableEmailField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  case "number":
                    return (
                      <EditableNumberField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  case "checkbox":
                    return (
                      <EditableCheckboxField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  case "radio":
                    return (
                      <EditableRadioField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  case "select":
                    return (
                      <EditableSelectField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  case "multiselect":
                    return (
                      <EditableMultiSelectField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  case "date":
                    return (
                      <EditableDateField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  case "file":
                    return (
                      <EditableFileField
                        field={formField as any}
                        {...commonProps}
                      />
                    );
                  default:
                    return null;
                }
              })()
            : (() => {
                const block = field as DisplayBlock<string>;
                switch (block.kind) {
                  case "header":
                    return (
                      <EditableHeaderBlock
                        block={block as any}
                        {...commonProps}
                      />
                    );
                  case "text":
                    return (
                      <EditableTextBlock
                        block={block as any}
                        {...commonProps}
                      />
                    );
                  case "label":
                    return (
                      <EditableLabelBlock
                        block={block as any}
                        {...commonProps}
                      />
                    );
                  case "divider":
                    return (
                      <EditableDividerBlock
                        block={block as any}
                        {...commonProps}
                      />
                    );
                  case "spacer":
                    return (
                      <EditableSpacerBlock
                        block={block as any}
                        {...commonProps}
                      />
                    );
                  case "html":
                    return (
                      <EditableHtmlBlock
                        block={block as any}
                        {...commonProps}
                      />
                    );
                  case "image":
                    return (
                      <EditableImageBlock
                        block={block as any}
                        {...commonProps}
                      />
                    );
                  default:
                    return null;
                }
              })()}
        </div>

        {/* Insertion bar after */}
        {showInsertionBar && dropPosition === "after" && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10">
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-150px)] bg-gray-50">
      {!isPreviewMode && (
        <ElementSelect
          onAddField={addField}
          onAddDisplayBlock={addDisplayBlock}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Form Builder
              </h1>
              <input
                type="text"
                value={schema.title}
                onChange={(e) =>
                  updateSchema({ ...schema, title: e.target.value })
                }
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Form title"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isPreviewMode
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {isPreviewMode ? "Edit Form" : "Preview Form"}
              </button>
              {!isPreviewMode && (
                <button
                  onClick={addPage}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
                >
                  Add Page
                </button>
              )}
              <button
                onClick={handleSaveForm}
                disabled={isSaving || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium"
              >
                {isSaving ? "Saving..." : formId ? "Update Form" : "Save Form"}
              </button>
            </div>
          </div>

          {/* Page tabs - only show in edit mode */}
          {!isPreviewMode && (
            <div className="flex space-x-1 mt-4">
              {schema.pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`flex items-center rounded-md text-sm font-medium ${
                    selectedPageIndex === index
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <button
                    onClick={() => setSelectedPageIndex(index)}
                    className="px-4 py-2 flex-1 text-left"
                  >
                    {page.title}
                  </button>
                  {schema.pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePage(index);
                      }}
                      className="px-2 py-2 text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading/Success/Error Messages */}
        <div className="flex-shrink-0 mx-4 min-h-0">
          {isLoading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 mb-2">
              <span className="block sm:inline">Loading form...</span>
            </div>
          )}
          {loadError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-2">
              <span className="block sm:inline">
                Error loading form: {loadError}
              </span>
            </div>
          )}
          {saveSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-2">
              <span className="block sm:inline">Form saved successfully!</span>
            </div>
          )}
          {saveError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-2">
              <span className="block sm:inline">
                Error saving form: {saveError}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          {isPreviewMode ? (
            <FormRenderer form={schema} onSubmit={null} />
          ) : (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="mb-6">
                <input
                  type="text"
                  value={currentPage.title || ""}
                  onChange={(e) =>
                    updateSchema({
                      ...schema,
                      pages: schema.pages.map((page, idx) =>
                        idx === selectedPageIndex
                          ? { ...page, title: e.target.value }
                          : page
                      ),
                    })
                  }
                  className="text-lg font-medium w-full border-none outline-none"
                  placeholder="Page title"
                />
                {currentPage.description && (
                  <p className="text-gray-600 mt-1">
                    {currentPage.description}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {currentPage.fields.map((field, index) =>
                  renderField(field, index)
                )}

                {/* Drop zone at the end of the list */}
                {draggedItem && currentPage.fields.length > 0 && (
                  <div
                    className="relative h-4 -mt-2"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragOverIndex(currentPage.fields.length);
                      setDropPosition("before");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (
                        !draggedItem ||
                        draggedItem.pageIndex !== selectedPageIndex
                      )
                        return;

                      const { index: dragIndex } = draggedItem;
                      const insertionIndex =
                        currentPage.fields.length -
                        (dragIndex < currentPage.fields.length ? 1 : 0);

                      if (dragIndex === insertionIndex) {
                        setDraggedItem(null);
                        setDragOverIndex(null);
                        setDropPosition(null);
                        return;
                      }

                      const currentFields = [...currentPage.fields];
                      const [draggedField] = currentFields.splice(dragIndex, 1);
                      currentFields.push(draggedField);

                      updateSchema({
                        ...schema,
                        pages: schema.pages.map((page, idx) =>
                          idx === selectedPageIndex
                            ? { ...page, fields: currentFields }
                            : page
                        ),
                      });

                      setDraggedItem(null);
                      setDragOverIndex(null);
                      setDropPosition(null);
                    }}
                  >
                    {dragOverIndex === currentPage.fields.length && (
                      <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10">
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                )}

                {currentPage.fields.length === 0 && (
                  <div
                    className="text-center py-12 text-gray-500 relative"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragOverIndex(0);
                      setDropPosition("before");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (
                        !draggedItem ||
                        draggedItem.pageIndex !== selectedPageIndex
                      )
                        return;

                      // This shouldn't happen since we're on an empty page, but handle it gracefully
                      setDraggedItem(null);
                      setDragOverIndex(null);
                      setDropPosition(null);
                    }}
                  >
                    {draggedItem && dragOverIndex === 0 && (
                      <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10">
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                    <p>
                      No fields added yet. Use the sidebar to add fields and
                      display blocks.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
