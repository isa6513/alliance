import { CreateActionDto, FormDto } from "@alliance/shared/client";
import React, { useRef } from "react";

interface ActionFormProps {
  form: CreateActionDto & { taskFormId?: number };
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  uploadingImage: boolean;
  imagePreview: string | null;
  isNew: boolean;
  onCancel?: () => void;
  onDelete?: () => void;
  baseUrl?: string;
  availableForms?: FormDto[];
}

const ActionForm: React.FC<ActionFormProps> = ({
  form,
  onInputChange,
  onImageChange,
  onSubmit,
  saving,
  uploadingImage,
  imagePreview,
  isNew,
  onCancel,
  onDelete,
  baseUrl,
  availableForms = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block font-medium text-gray-700 mb-1"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block font-medium text-gray-700 mb-1"
          >
            Category *
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={form.category}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block font-medium text-gray-700 mb-1"
          >
            Type
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Activity">Activity</option>
            <option value="Funding">Funding</option>
            <option value="Ongoing">Ongoing</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="timeEstimate"
            className="block font-medium text-gray-700 mb-1"
          >
            Time Estimate (minutes)
          </label>
          <input
            type="number"
            id="timeEstimate"
            name="timeEstimate"
            value={form.timeEstimate}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Threshold Settings */}
      {form.type === "Funding" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="donationThreshold"
              className="block font-medium text-gray-700 mb-1"
            >
              Donation Threshold (cents)
            </label>
            <input
              type="number"
              id="donationThreshold"
              name="donationThreshold"
              value={form.donationThreshold || ""}
              onChange={onInputChange}
              min="0"
              step="0.01"
              placeholder="Total donations needed"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="donationAmount"
              className="block font-medium text-gray-700 mb-1"
            >
              Suggested Donation (cents)
            </label>
            <input
              type="number"
              id="donationAmount"
              name="donationAmount"
              value={form.donationAmount || ""}
              onChange={onInputChange}
              min="0"
              step="0.01"
              placeholder="Suggested amount per person"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : (
        <div>
          <label
            htmlFor="commitmentThreshold"
            className="block font-medium text-gray-700 mb-1"
          >
            Commitment Threshold
          </label>
          <input
            type="number"
            id="commitmentThreshold"
            name="commitmentThreshold"
            value={form.commitmentThreshold || ""}
            onChange={onInputChange}
            min="1"
            placeholder="Number of commitments needed"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Task Form Selection for Activity type actions */}
      {form.type === "Activity" && (
        <div>
          <label
            htmlFor="taskFormId"
            className="block font-medium text-gray-700 mb-1"
          >
            Task Form
          </label>
          <select
            id="taskFormId"
            name="taskFormId"
            value={form.taskFormId || ""}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No form required</option>
            {availableForms.map((formOption) => (
              <option key={formOption.id} value={formOption.id}>
                {formOption.title || `Form ${formOption.id}`}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Optional form that users must complete when finishing this activity
          </p>
        </div>
      )}

      <div>
        <label htmlFor="body" className="block font-medium text-gray-700 mb-1">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          value={form.body}
          onChange={onInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="shortDescription"
          className="block font-medium text-gray-700 mb-1"
        >
          Short Description
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          value={form.shortDescription}
          onChange={onInputChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {form.type !== "Funding" && (
        <div>
          <label
            htmlFor="taskContents"
            className="block font-medium text-gray-700 mb-1"
          >
            Task Contents
          </label>
          <textarea
            id="taskContents"
            name="taskContents"
            value={form.taskContents || ""}
            onChange={onInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label htmlFor="image" className="block font-medium text-gray-700 mb-1">
          Image
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={onImageChange}
          ref={fileInputRef}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {imagePreview && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isNew ? "Image Preview:" : "New Image Preview:"}
            </p>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-w-md h-auto rounded-md border border-gray-300"
            />
          </div>
        )}

        {!imagePreview && !isNew && form.image && baseUrl && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Current Image:
            </p>
            <img
              src={`${baseUrl}/images/${form.image}`}
              alt="Current"
              className="w-full max-w-md h-auto rounded-md border border-gray-300"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
        )}
        {!isNew && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 bg-red-200 text-red-700 border border-red-400 rounded-md hover:bg-red-300/70 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            disabled={saving}
          >
            Delete Action
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-200 text-blue-700 border border-blue-400 rounded-md hover:bg-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={saving || uploadingImage}
        >
          {saving || uploadingImage
            ? uploadingImage
              ? "Uploading Image..."
              : isNew
              ? "Creating..."
              : "Updating..."
            : isNew
            ? "Create Action"
            : "Update Action"}
        </button>
      </div>
    </form>
  );
};

export default ActionForm;
