import { useOutsideClick } from "@alliance/shared/lib/useOutsideClick";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Dropdown from "@alliance/shared/ui/Dropdown";
import { useState } from "react";
import ActionCommitButton from "./ActionCommitButton";

export interface ActionTaskPanelCommitProps {
  onCommit: () => void;
  onDecline: (moral: boolean, reason: string) => void;
}

const ActionTaskPanelCommit = ({
  onCommit,
  onDecline,
}: ActionTaskPanelCommitProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [otherReasonSelected, setOtherReasonSelected] = useState(false);
  const [moralObjectionSelected, setMoralObjectionSelected] = useState(false);
  const [customReason, setCustomReason] = useState("");

  const handleMoralObjection = () => {
    setMoralObjectionSelected(!moralObjectionSelected);
    if (otherReasonSelected) {
      setOtherReasonSelected(false);
    }
  };

  const handleOtherReason = () => {
    setOtherReasonSelected(!otherReasonSelected);
    if (moralObjectionSelected) {
      setMoralObjectionSelected(false);
    }
  };

  const handleSubmit = () => {
    onDecline(moralObjectionSelected, customReason);
    setDropdownOpen(false);
  };

  const ref = useOutsideClick(() => setDropdownOpen(false));

  return (
    <div className="relative">
      <div className="flex flex-row gap-x-2 w-full items-center relative">
        <ActionCommitButton
          committed={false}
          isAuthenticated={true}
          onCommit={onCommit}
          className="flex-1"
        />
        <Button
          color={ButtonColor.White}
          className="px-4 flex items-center !pb-3 !h-[45px] cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <p className="text-gray-500">...</p>
        </Button>
      </div>
      <Dropdown
        isOpen={dropdownOpen}
        className="absolute top-[55px] right-0 gap-y-2 *:w-full w-[300px]"
        ref={ref}
      >
        <p className="mb-1 text-center">
          Can&apos;t participate in this action?
        </p>
        <Button
          color={ButtonColor.White}
          className={`!items-start !justify-start text-left !font-normal ${
            moralObjectionSelected ? "!bg-zinc-100" : ""
          }`}
          onClick={handleMoralObjection}
        >
          I have a moral objection
        </Button>
        <Button
          color={ButtonColor.White}
          className={`!items-start !justify-start text-left !font-normal ${
            otherReasonSelected ? "!bg-zinc-100" : ""
          }`}
          onClick={handleOtherReason}
        >
          Other reason
        </Button>
        {(otherReasonSelected || moralObjectionSelected) && (
          <>
            <textarea
              className="w-full h-20 border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Explain in more detail..."
            />
            <Button
              color={ButtonColor.Black}
              onClick={handleSubmit}
              className="w-full"
            >
              Confirm absence
            </Button>
          </>
        )}
      </Dropdown>
    </div>
  );
};

export default ActionTaskPanelCommit;
