import {
  ActionDto,
  actionsCreateUpdate,
  CreateActionUpdateDto,
} from "@alliance/shared/client";
import ActionUpdateCard from "@alliance/shared/ui/ActionUpdateCard";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card from "@alliance/shared/ui/Card";
import EditableContentForm from "@alliance/shared/ui/EditableContentForm";
import { useState } from "react";

interface ActionUpdatesTabProps {
  actionId: number;
  updates: ActionDto["updates"];
  setUpdates: (updates: ActionDto["updates"]) => unknown;
}

const defaultNewUpdate: CreateActionUpdateDto = {
  title: "",
  content: {
    body: "",
    attachments: [],
  },
  displayDate: new Date().toISOString(),
  visibleAt: new Date().toISOString(),
  notifyType: "none",
};

const ActionUpdatesTab = ({
  actionId,
  updates,
  setUpdates,
}: ActionUpdatesTabProps) => {
  const [newUpdate, setNewUpdate] =
    useState<CreateActionUpdateDto>(defaultNewUpdate);
  const [preview, setPreview] = useState(false);

  const handleSubmit = async () => {
    const response = await actionsCreateUpdate({
      path: { id: actionId },
      body: newUpdate,
    });

    if (response.response.ok && response.data) {
      setUpdates([...updates, response.data]);
      setNewUpdate(defaultNewUpdate);
      setPreview(false);
    }
  };

  return (
    <div className="space-y-2 flex flex-col">
      <div className="flex justify-between items-center">
        <p className="font-bold">Add a status update...</p>
        <div className="flex items-center gap-2">
          <label className="text-sm">Preview?</label>
          <input
            type="checkbox"
            checked={preview}
            onChange={(e) => setPreview(e.target.checked)}
          />
        </div>
      </div>
      {preview ? (
        <ActionUpdateCard update={newUpdate} />
      ) : (
        <Card className="space-y-2">
          <div className="p-2 bg-zinc-100 rounded-md">
            <input
              type="text"
              placeholder="Title..."
              className="w-full p-2 bg-zinc-100 rounded-md font-bold"
              value={newUpdate.title}
              onChange={(e) => {
                setNewUpdate({ ...newUpdate, title: e.target.value });
              }}
              required
            />
            <EditableContentForm
              value={newUpdate.content}
              placeholder="Action update body..."
              onChange={(content) => {
                setNewUpdate({
                  ...newUpdate,
                  content,
                });
              }}
            />
          </div>
        </Card>
      )}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} color={ButtonColor.Black}>
          Add update
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-bold">Existing updates</h2>
      </div>
      <div className="space-y-2 bg-white">
        {updates.map((update) => (
          <ActionUpdateCard key={update.id} update={update} />
        ))}
      </div>
    </div>
  );
};

export default ActionUpdatesTab;
