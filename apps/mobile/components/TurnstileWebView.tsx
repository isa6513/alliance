import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { getBaseUrl } from "../lib/config";

// The non-interactive badge is ~65px, but an interactive challenge expands well
// beyond that. The WebView reports its real content height (see buildHtml) and
// we clamp it to this range so the widget is never clipped, yet an empty/slow
// frame still reserves space.
const MIN_HEIGHT = 70;
const MAX_HEIGHT = 320;

export interface TurnstileWebViewHandle {
  /** Discard the current token and render a fresh challenge (tokens are single-use). */
  reset: () => void;
}

interface TurnstileWebViewProps {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

/**
 * Renders a Cloudflare Turnstile widget inside a WebView so the native signup
 * flow can produce a real verification token.
 *
 * `@marsidev/react-turnstile` (used on web) is DOM-only, so on React Native we
 * host Cloudflare's `api.js` in a tiny HTML document and bridge the callbacks
 * back over `postMessage`. The WebView's `baseUrl` is set to the site's origin
 * so the widget passes Turnstile's domain check (the site key is shared with web).
 *
 * Interactive challenges render taller than the resting badge, so the document
 * also reports its content height back to React Native and the container grows
 * to fit — otherwise the challenge would be clipped and impossible to complete.
 */
const buildHtml = (siteKey: string): string => `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body { margin: 0; padding: 0; background: transparent; }
      #cf { display: flex; justify-content: center; }
    </style>
  </head>
  <body>
    <div id="cf"></div>
    <script>
      var widgetId;
      function post(msg) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        }
      }
      function postHeight() {
        post({ type: "resize", height: document.body.scrollHeight });
      }
      // Report height as the challenge grows/shrinks (and once on first paint).
      if (window.ResizeObserver) {
        new ResizeObserver(postHeight).observe(document.body);
      }
      window.__resetTurnstile = function () {
        if (window.turnstile && widgetId !== undefined) {
          window.turnstile.reset(widgetId);
        }
      };
      window.onTurnstileLoad = function () {
        widgetId = window.turnstile.render("#cf", {
          sitekey: ${JSON.stringify(siteKey)},
          callback: function (token) { post({ type: "token", token: token }); },
          "expired-callback": function () { post({ type: "expired" }); },
          "error-callback": function () { post({ type: "error" }); },
        });
        postHeight();
      };
    </script>
    <script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
      async
      defer
    ></script>
  </body>
</html>`;

const TurnstileWebView = forwardRef<
  TurnstileWebViewHandle,
  TurnstileWebViewProps
>(({ siteKey, onToken, onExpire, onError }, ref) => {
  const webViewRef = useRef<WebView>(null);
  const html = useMemo(() => buildHtml(siteKey), [siteKey]);
  const [height, setHeight] = useState(MIN_HEIGHT);

  useImperativeHandle(ref, () => ({
    reset: () => {
      webViewRef.current?.injectJavaScript(
        "window.__resetTurnstile && window.__resetTurnstile(); true;",
      );
    },
  }));

  const handleMessage = (event: WebViewMessageEvent) => {
    let message: { type?: string; token?: string; height?: number };
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    switch (message.type) {
      case "token":
        if (message.token) {
          onToken(message.token);
        }
        break;
      case "expired":
        onExpire?.();
        break;
      case "error":
        onError?.();
        break;
      case "resize":
        if (typeof message.height === "number") {
          setHeight(
            Math.min(
              MAX_HEIGHT,
              Math.max(MIN_HEIGHT, Math.ceil(message.height)),
            ),
          );
        }
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html, baseUrl: getBaseUrl() }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        style={styles.webview}
      />
    </View>
  );
});

TurnstileWebView.displayName = "TurnstileWebView";

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  webview: {
    backgroundColor: "transparent",
  },
});

export default TurnstileWebView;
