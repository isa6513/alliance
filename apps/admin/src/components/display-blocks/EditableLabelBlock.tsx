import type { LabelBlock } from "@alliance/common/forms/display-blocks";
import { DisplayBlockWrapper } from "./DisplayBlockWrapper";
import type { BaseDisplayBlockProps } from "./types";

export function EditableLabelBlock(props: BaseDisplayBlockProps<LabelBlock>) {
  return (
    <DisplayBlockWrapper {...props}>
      {({ block: activeBlock, onUpdate: handleUpdate }) => (
        <input
          type="text"
          value={activeBlock.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          className="text-sm font-medium text-gray-700 border-none outline-none bg-transparent w-full"
          placeholder="Enter label text"
        />
      )}
    </DisplayBlockWrapper>
  );
}
