import {
  CommunityDto,
  CreateCommunityDto,
  userUpdateCommunity,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useCallback, useState } from "react";

export interface CommunityEditFormProps {
  initialValue: CommunityDto;
  onCancel: () => void;
  onSuccess: () => void;
}

const CommunityEditForm = ({
  initialValue,
  onCancel,
  onSuccess,
}: CommunityEditFormProps) => {
  const [formValues, setFormValues] =
    useState<CreateCommunityDto>(initialValue);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const response = await userUpdateCommunity({
      path: { communityId: initialValue.id },
      body: formValues,
    });
    if (response.data) {
      setFormValues(response.data);
      onSuccess();
    } else {
      setError("Failed to update community");
    }
  }, [formValues]);

  return (
    <div className="flex flex-col gap-y-2">
      <label className="text-black text-sm font-semibold" htmlFor="name">
        Name
      </label>
      <input
        value={formValues.name}
        onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
        className="border border-zinc-300 rounded px-3 py-2 w-full"
      />
      <label className="text-black text-sm font-semibold mt-3" htmlFor="name">
        Description
      </label>
      <textarea
        value={formValues.description}
        onChange={(e) =>
          setFormValues({ ...formValues, description: e.target.value })
        }
        className="border border-zinc-300 rounded px-3 py-2 w-full bg-white"
      />
      <div className="flex gap-x-1 justify-end">
        <Button onClick={onCancel} className="mt-1" color={ButtonColor.Grey}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="mt-1"
          color={ButtonColor.Black}
        >
          Save
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CommunityEditForm;
