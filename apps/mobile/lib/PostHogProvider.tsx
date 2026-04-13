import {
  PostHogProvider as RNPostHogProvider,
  PostHogProviderProps,
} from "posthog-react-native";
import { type ReactNode } from "react";

const postHogProviderProps: Omit<PostHogProviderProps, "children"> = __DEV__
  ? {
      apiKey: "phc_4Bkir1Px9qIRnMQfMWQPcGIq6wjodf9jtme8fty3ZLt",
      options: {
        host: "https://us.i.posthog.com",
        defaultOptIn: false,
      },
      autocapture: false,
    }
  : {
      apiKey: "phc_4Bkir1Px9qIRnMQfMWQPcGIq6wjodf9jtme8fty3ZLt",
      options: {
        host:
          process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        enableSessionReplay: true,
        captureAppLifecycleEvents: true,
        sessionReplayConfig: {
          maskAllTextInputs: false,
          captureLog: true,
          captureNetworkTelemetry: true,
          throttleDelayMs: 250,
        },
      },
    };

export default function PostHogProvider({ children }: { children: ReactNode }) {
  return (
    <RNPostHogProvider {...postHogProviderProps}>{children}</RNPostHogProvider>
  );
}
