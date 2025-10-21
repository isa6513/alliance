import { ActionDto } from "@alliance/shared/client";
import Button from "@alliance/shared/ui/Button";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import { useEffect, useState } from "react";
import FormInput from "@alliance/shared/ui/FormInput";

export interface ActionSharePanelProps {
  action: ActionDto;
}

const ActionSharePanel = ({ action }: ActionSharePanelProps) => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, [action]);

  return (
    <Card style={CardStyle.Outline}>
      <p className="font-bold">Invite a friend to participate</p>

      <div className="text-md bg-gray-100 p-4 rounded-md flex flex-row gap-x-2">
        <p>{url}</p>
        <img
          src="/icons/copy.svg"
          alt="Copy"
          className="w-4 h-4"
          onClick={() => {
            navigator.clipboard.writeText(url);
          }}
        />
      </div>

      <p>
        Let them join as easily as possible by pre-filling their information:
      </p>

      <div className="flex flex-row gap-x-2 flex-wrap">
        <FormInput
          name="name"
          label="First Name"
          type="text"
          placeholder="First Name"
          value=""
          onChange={() => {}}
        />
        <FormInput
          name="email"
          label="Last Name"
          placeholder="Last Name"
          type="email"
          value=""
          onChange={() => {}}
        />
        <FormInput
          name="phone"
          label="Phone"
          placeholder="Phone"
          type="tel"
          value=""
          onChange={() => {}}
        />
      </div>

      <Button onClick={() => {}}>Generate invite link</Button>
    </Card>
  );
};

export default ActionSharePanel;
