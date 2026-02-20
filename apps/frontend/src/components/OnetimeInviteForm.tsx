import { onetimeInviteCreation } from "@alliance/shared/lib/copy";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import AppMarkdownWrapper from "@alliance/sharedweb/ui/AppMarkdownWrapper";
import TextareaAutosize from "react-textarea-autosize";

type OnetimeInviteFormProps = {
  title?: string;
  explanation?: readonly string[];
  inviteeName: string;
  setInviteeName: (value: string) => void;
  info: string;
  setInfo: (value: string) => void;
  onSubmit?: () => void;
  submitText?: string;
  submittingText?: string;
  creatingInvite?: boolean;
};

const OnetimeInviteForm = ({
  title,
  explanation,
  inviteeName,
  setInviteeName,
  info,
  setInfo,
  onSubmit,
  submitText = "Create invite",
  submittingText = "Creating invite...",
  creatingInvite = false,
}: OnetimeInviteFormProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      {title && explanation && (
        <div className="flex flex-col gap-y-2">
          <p className="text-xl font-semibold">{title}</p>
          <div className="text-zinc-500">
            <AppMarkdownWrapper markdownContent={explanation.join("\n\n")} />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-y-2">
        <input
          type="text"
          className="border border-zinc-300 rounded px-3 py-2 flex-1"
          placeholder="Enter the invitee's first name"
          value={inviteeName}
          onChange={(e) => setInviteeName(e.target.value)}
        />
        <p className="my-2 text-zinc-500">
          {onetimeInviteCreation.inviteeContextExplanation}
        </p>
        <TextareaAutosize
          className="border border-zinc-300 rounded px-3 py-2 bg-white overflow-hidden"
          placeholder="Context for the office about the invitation (not included in the invite!)"
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          minRows={2}
          style={{ resize: "none" }}
        />
        {onSubmit && (
          <Button
            color={ButtonColor.Black}
            onClick={onSubmit}
            disabled={creatingInvite || !inviteeName.trim()}
            className="w-full"
          >
            {creatingInvite ? submittingText : submitText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnetimeInviteForm;
