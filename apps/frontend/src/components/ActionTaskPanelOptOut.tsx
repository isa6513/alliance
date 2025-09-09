import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Dropdown from "@alliance/shared/ui/Dropdown";
import { useState } from "react";
import { useOutsideClick } from "./NotificationsIcon";

export interface ActionTaskPanelOptOutProps {
  onOptOut: (reason: string) => void;
}

const ActionTaskPanelOptOut = ({ onOptOut }: ActionTaskPanelOptOutProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customReason, setCustomReason] = useState("");

  const handleSubmit = () => {
    onOptOut(customReason);
    setDropdownOpen(false);
  };

  const ref = useOutsideClick(() => setDropdownOpen(false));

  return (
    <div className="relative">
      <div className="flex flex-row gap-x-1 w-full items-center relative">
        <span>Can&apos;t complete this action?</span>
        <Button
          color={ButtonColor.White}
          className="flex items-center !p-0 border-none !text-base !h-[45px] cursor-pointer hover:!bg-transparent hover:underline"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <p className="text-gray-500">Let us know.</p>
        </Button>
      </div>
      <Dropdown
        isOpen={dropdownOpen}
        className="absolute top-[45px] left-0 gap-y-2 *:w-full min-w-[300px]"
        ref={ref}
      >
        <textarea
          className=" h-20 border border-gray-300 rounded-md px-3 py-2 text-sm"
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="I can't complete this action because..."
        />
        <Button
          color={ButtonColor.Black}
          onClick={handleSubmit}
          className="w-full"
        >
          Abandon action
        </Button>
      </Dropdown>
    </div>
  );
};

export default ActionTaskPanelOptOut;
