import {
  CommunityDto,
  CreateCommunityDto,
  userUpdateCommunity,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { useCallback, useState } from "react";

export interface CommunityEditFormProps {
  initialValue: CommunityDto;
  onSuccess: () => void;
}

const CommunityEditForm = ({
  initialValue,
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
    <div className="flex flex-col gap-y-1">
      <label className="text-black text-sm font-medium" htmlFor="name">
        Community name
      </label>
      <input
        value={formValues.name}
        onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
        className="border border-zinc-300 rounded px-3 py-2 w-full"
      />
      <label className="text-black text-sm font-medium mt-3" htmlFor="name">
        Description
      </label>
      <textarea
        value={formValues.description}
        onChange={(e) =>
          setFormValues({ ...formValues, description: e.target.value })
        }
        className="border border-zinc-300 rounded px-3 py-2 w-full bg-white"
      />
      <p className="text-xs text-zinc-500 mt-1">
        content will be displayed as markdown
      </p>
      <div className="flex justify-end">
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
