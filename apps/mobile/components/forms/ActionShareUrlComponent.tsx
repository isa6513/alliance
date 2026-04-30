import { useEffect, useState } from "react";
import { setStringAsync as setClipboardStringAsync } from "expo-clipboard";
import { useQuery } from "@tanstack/react-query";
import { actionsGetShareLink } from "@alliance/shared/client";
import { CardStyle } from "@alliance/shared/styles/card";
import Card from "../system/Card";
import Button, { ButtonColor, ButtonSize } from "../system/Button";
import Text from "../system/Text";
import type { CustomComponentProps } from "@alliance/shared/forms/customComponents";

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

  const handleCopy = async () => {
    if (!shareUrl) return;
    await setClipboardStringAsync(shareUrl);
    setCopied(true);
  };

  if (actionId === null) {
    return (
      <Card cardStyle={CardStyle.Grey} className="flex-row items-center !p-0">
        <Text className="flex-1 p-2 pl-3 text-zinc-500">
          No action configured
        </Text>
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
    <Card cardStyle={CardStyle.Grey} className="flex-row items-center !p-0">
      <Text className={`flex-1 p-2 pl-3 ${showMuted ? "text-zinc-500" : ""}`}>
        {message}
      </Text>
      <Button
        color={ButtonColor.Transparent}
        size={ButtonSize.Custom}
        onPress={handleCopy}
        disabled={showMuted}
        className="px-3 py-3"
        title={copied ? "Copied!" : "Copy"}
      />
    </Card>
  );
};

export default ActionShareUrlComponent;
