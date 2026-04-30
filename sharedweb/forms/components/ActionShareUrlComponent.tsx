import type { CustomComponentProps } from "@alliance/shared/forms/customComponents";
import Card from "../../ui/Card";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { actionsGetShareLink } from "@alliance/shared/client";
import Button, { ButtonColor } from "../../ui/Button";
import { CardStyle } from "@alliance/shared/styles/card";

const ActionShareUrlComponent = ({ field }: CustomComponentProps) => {
  const [copied, setCopied] = useState(false);

  const actionId =
    typeof field.componentConfig?.actionId === "number"
      ? field.componentConfig?.actionId
      : null;

  const {
    data: shareUrl,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["actionsGetShareLink", actionId],
    queryFn: async () => {
      const res = await actionsGetShareLink({ path: { id: actionId! } });
      if (res.error || !res.data) {
        throw res.error ?? new Error("Failed to load share link");
      }
      return res.data.url;
    },
    enabled: actionId !== null,
  });

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (actionId === null) {
    return (
      <Card style={CardStyle.Grey} className="flex-row items-center !p-0">
        <p className="flex-1 p-2 pl-3 text-zinc-500">No action configured</p>
      </Card>
    );
  }

  const isLoading = isPending;
  const message = isError
    ? "Unable to load share link"
    : isLoading
      ? "Loading…"
      : shareUrl;
  const showMuted = isLoading || isError || !shareUrl;
  return (
    <Card style={CardStyle.Grey} className="flex-row items-center !p-0">
      <p className={`flex-1 p-2 pl-3 ${showMuted ? "text-zinc-500" : ""}`}>
        {message}
      </p>
      <Button
        color={ButtonColor.Transparent}
        onClick={() => {
          if (showMuted || !shareUrl) return;
          navigator.clipboard.writeText(shareUrl);
          setCopied(true);
        }}
        disabled={showMuted}
        className="text-sm !p-3 !px-3 text-green"
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
    </Card>
  );
};

export default ActionShareUrlComponent;
