import {
  ActionActivityType,
  actionsCreateActivity,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useCallback, useState } from "react";

const ACTIVITY_TYPE_OPTIONS: Array<{
  value: ActionActivityType;
  label: string;
}> = [
  { value: "user_joined", label: "User joined" },
  { value: "user_completed", label: "User completed" },
  { value: "user_declined", label: "User declined" },
  { value: "user_wont_complete", label: "User won't complete" },
];

export interface CreateActivityControlsProps {
  actionId: number;
  userId: number;
  onCreated: () => void;
}

const CreateActivityControls = ({
  actionId,
  userId,
  onCreated,
}: CreateActivityControlsProps) => {
  const [selectedType, setSelectedType] = useState<ActionActivityType | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (isSubmitting) {
      return;
    }
    if (!selectedType) {
      setError("Select an activity type first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await actionsCreateActivity({
        body: {
          actionId,
          userId,
          type: selectedType,
        },
      });

      if (response.error) {
        console.error("Failed to create activity", response.error);
        setError(
          (response.error as { message: string }).message ??
            "Failed to create activity. Try again."
        );
        return;
      }

      onCreated();
    } catch (err) {
      console.error("Failed to create activity", err);
      setError("Failed to create activity. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [actionId, isSubmitting, onCreated, selectedType, userId]);

  return (
    <div className="mt-3 border-t border-zinc-200 pt-3 flex flex-row gap-2 items-center">
      <p className="text-sm font-medium text-zinc-700">
        Manually create activity for this user:
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          id={`create-activity-type-${actionId}`}
          className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-700 sm:w-auto"
          value={selectedType}
          onChange={(event) => {
            const value = event.target.value as ActionActivityType | "";
            setSelectedType(value);
            if (error) {
              setError(null);
            }
          }}
          disabled={isSubmitting}
        >
          <option value="">Select activity type</option>
          {ACTIVITY_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          color={ButtonColor.Blue}
          className="!py-1 !px-2"
          disabled={isSubmitting || !selectedType}
          onClick={() => {
            void handleCreate();
          }}
        >
          {isSubmitting ? "Creating..." : "Create activity"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CreateActivityControls;
