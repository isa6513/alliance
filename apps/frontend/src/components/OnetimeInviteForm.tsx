import { onetimeInviteCreation } from "@alliance/shared/lib/copy";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import AppMarkdownWrapper from "@alliance/sharedweb/ui/AppMarkdownWrapper";
import TextareaAutosize from "react-textarea-autosize";

type OnetimeInviteFormProps = {
  title?: string;
  explanation?: readonly string[];
  inviteePlaceholder?: string;
  contextExplanation?: string;
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
  inviteePlaceholder = "Enter the invitee's first name",
  contextExplanation = onetimeInviteCreation.inviteeContextExplanation,
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
          <p className="text-xl font-semibold text-zinc-900">{title}</p>
          <AppMarkdownWrapper
            className="text-invite-form-body"
            markdownContent={explanation.join("\n\n")}
          />
        </div>
      )}
      <div className="flex flex-col gap-y-4">
        <input
          type="text"
          className="border border-zinc-300 rounded px-3 py-2 flex-1"
          placeholder={inviteePlaceholder}
          value={inviteeName}
          onChange={(e) => setInviteeName(e.target.value)}
        />
        <p className="text-invite-form-body">
          {contextExplanation}
        </p>
        <TextareaAutosize
          className="border border-zinc-300 rounded px-3 py-2 bg-white overflow-hidden"
          placeholder="Context for the office"
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
