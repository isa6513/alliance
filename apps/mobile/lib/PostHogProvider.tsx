import {
  PostHogOptions,
  PostHogProvider as RNPostHogProvider,
} from "posthog-react-native";
import { type ReactNode } from "react";

const { posthogHost, posthogEnabled } = __DEV__
  ? {
      posthogHost: "",
      posthogEnabled: false,
    }
  : {
      posthogHost:
        process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      posthogEnabled: true,
    };

const options: Partial<PostHogOptions> = {
  host: posthogHost,
  enableSessionReplay: true,
  captureAppLifecycleEvents: true,
  sessionReplayConfig: {
    maskAllTextInputs: false,
    captureLog: true,
    captureNetworkTelemetry: true,
    throttleDelayMs: 250,
  },
};

export default function PostHogProvider({ children }: { children: ReactNode }) {
  if (!posthogEnabled) {
    return children;
  }

  return (
    <RNPostHogProvider
      apiKey="phc_4Bkir1Px9qIRnMQfMWQPcGIq6wjodf9jtme8fty3ZLt"
      options={options}
    >
      {children}
    </RNPostHogProvider>
  );
}
