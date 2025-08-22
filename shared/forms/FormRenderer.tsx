import React, { useState } from "react";
import { FormDto, SubmitFormDto } from "../client";
import type { DisplayBlock } from "./display-blocks";
import type { AnyField, FormSchema } from "./formschema";

interface FormRendererProps {
  form: FormDto["schema"];
  onSubmit: ((data: SubmitFormDto) => void) | null; //null for admin preview
}

const FormRenderer = ({ form, onSubmit }: FormRendererProps) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const schema = form as FormSchema<string, string>;
  const currentPage = schema.pages[currentPageIndex];
  const isLastPage = currentPageIndex === schema.pages.length - 1;
  const isFirstPage = currentPageIndex === 0;

  const updateField = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    if (!isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ responses: formData });
    }
  };

  const renderField = (field: AnyField<string>, index: number) => {
    const value = formData[field.id] || "";

    switch (field.kind) {
      case "text":
        return (
          <div key={index} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={(field as any).placeholder}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={index} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              rows={(field as any).rows || 3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={(field as any).placeholder}
            />
          </div>
        );

      case "email":
        return (
          <div key={index} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="email"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={(field as any).placeholder}
            />
          </div>
        );

      case "number":
        return (
          <div key={index} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) =>
                updateField(field.id, parseFloat(e.target.value) || "")
              }
              required={field.required}
              min={(field as any).min}
              max={(field as any).max}
              step={(field as any).step}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={(field as any).placeholder}
            />
          </div>
        );

      case "checkbox":
        return (
          <div key={index} className="space-y-1">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => updateField(field.id, e.target.checked)}
                required={field.required}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
          </div>
        );

      case "radio":
        return (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {(field as any).options.map((option: any, optIndex: number) => (
                <label key={optIndex} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    required={field.required}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "select":
        return (
          <div key={index} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an option</option>
              {(field as any).options.map((option: any, optIndex: number) => (
                <option key={optIndex} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "multiselect":
        return (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {(field as any).options.map((option: any, optIndex: number) => (
                <label key={optIndex} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(value) && value.includes(option.value)
                    }
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        updateField(field.id, [...currentValues, option.value]);
                      } else {
                        updateField(
                          field.id,
                          currentValues.filter((v) => v !== option.value)
                        );
                      }
                    }}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "date":
        return (
          <div key={index} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case "file":
        return (
          <div key={index} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) =>
                updateField(field.id, e.target.files?.[0] || null)
              }
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderDisplayBlock = (block: DisplayBlock<string>, index: number) => {
    switch (block.kind) {
      case "header":
        return React.createElement(
          `h${(block as any).level || 2}`,
          {
            key: index,
            className: `font-bold text-gray-900 ${
              ((block as any).level || 2) === 1
                ? "text-3xl"
                : ((block as any).level || 2) === 2
                ? "text-2xl"
                : ((block as any).level || 2) === 3
                ? "text-xl"
                : ((block as any).level || 2) === 4
                ? "text-lg"
                : ((block as any).level || 2) === 5
                ? "text-base"
                : "text-sm"
            }`,
          },
          (block as any).text
        );

      case "text":
        return (
          <div key={index} className="text-gray-900">
            {(block as any).markdown ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {(block as any).text}
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{(block as any).text}</p>
            )}
          </div>
        );

      case "label":
        return (
          <span key={index} className="text-sm font-medium text-gray-700">
            {(block as any).text}
          </span>
        );

      case "divider":
        return (
          <hr
            key={index}
            className={`border-gray-300 ${
              (block as any).thickness === "hairline"
                ? "border-t"
                : (block as any).thickness === "thin"
                ? "border-t"
                : (block as any).thickness === "medium"
                ? "border-t-2"
                : (block as any).thickness === "thick"
                ? "border-t-4"
                : "border-t"
            }`}
          />
        );

      case "spacer":
        return (
          <div
            key={index}
            className={`${
              (block as any).size === "xs"
                ? "h-2"
                : (block as any).size === "sm"
                ? "h-4"
                : (block as any).size === "md"
                ? "h-8"
                : (block as any).size === "lg"
                ? "h-16"
                : (block as any).size === "xl"
                ? "h-24"
                : "h-8"
            }`}
          />
        );

      case "html":
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: (block as any).html }}
          />
        );

      case "image":
        return (
          <img
            key={index}
            src={(block as any).src}
            alt={(block as any).alt}
            className="max-w-full h-auto rounded"
            style={{
              aspectRatio: (block as any).aspectRatio
                ? (block as any).aspectRatio.toString()
                : undefined,
            }}
          />
        );

      default:
        return null;
    }
  };

  const renderElement = (
    element: AnyField<string> | DisplayBlock<string>,
    index: number
  ) => {
    // Check if it's a form field (has 'label' property) vs display block
    if ("label" in element) {
      return renderField(element as AnyField<string>, index);
    } else {
      return renderDisplayBlock(element as DisplayBlock<string>, index);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{schema.title}</h1>
          {schema.description && (
            <p className="mt-2 text-gray-600">{schema.description}</p>
          )}
        </div>

        {/* Page Header */}
        {schema.pages.length > 1 && (
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {currentPage.title}
            </h2>
            {currentPage.description && (
              <p className="mt-1 text-gray-600">{currentPage.description}</p>
            )}
          </div>
        )}

        {/* Page Content */}
        <div className="space-y-4">
          {currentPage.fields.map((element, index) =>
            renderElement(element, index)
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div>
            {schema.pages.length > 1 && (
              <span className="text-sm text-gray-500">
                Page {currentPageIndex + 1} of {schema.pages.length}
              </span>
            )}
          </div>

          <div className="flex space-x-3">
            {!isFirstPage && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
              >
                Previous
              </button>
            )}

            {!isLastPage ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md font-medium"
                disabled={!onSubmit}
              >
                {schema.submit?.label || "Submit"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormRenderer;
