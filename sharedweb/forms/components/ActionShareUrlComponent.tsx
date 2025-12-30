import type { CustomComponentProps } from "./types";
import Card from "../../ui/Card";
import { useEffect, useState } from "react";
import { actionsGetShareLink } from "@alliance/shared/client";
import Button, { ButtonColor } from "../../ui/Button";
import { CardStyle } from "@alliance/shared/styles/card";

const ActionShareUrlComponent = ({ field }: CustomComponentProps) => {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const actionId =
    typeof field.componentConfig?.actionId === "number"
      ? field.componentConfig?.actionId
      : null;

  useEffect(() => {
    const fetchShareUrl = async () => {
      if (!actionId) {
        return;
      }
      const shareUrlRes = await actionsGetShareLink({
        path: { id: actionId },
      });
      if (shareUrlRes.data) {
        setShareUrl(shareUrlRes.data);
      }
    };
    fetchShareUrl();
  }, [actionId]);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  }, [copied]);

  return (
    <Card style={CardStyle.Grey} className="flex-row items-center !p-0">
      <p className="flex-1 p-2 pl-3">{shareUrl}</p>
      <Button
        color={ButtonColor.Transparent}
        onClick={() => {
          navigator.clipboard.writeText(shareUrl);
          setCopied(true);
        }}
        className="text-sm !p-3 !px-3 text-green"
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
    </Card>
  );
};

export default ActionShareUrlComponent;
