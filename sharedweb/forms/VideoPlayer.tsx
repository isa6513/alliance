import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { getApiUrl } from "../lib/config";

type VideoPlayerProps = {
  src: string;
  videoId?: number;
  caption?: string;
};

export default function VideoPlayer({ src, videoId, caption }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    videoId ? "loading" : "ready"
  );
  const [mediaReady, setMediaReady] = useState(false);
  const hasVideo = !!(src || videoId);

  // Reset state when video source changes
  useEffect(() => {
    setStatus(videoId ? "loading" : "ready");
    setMediaReady(false);
  }, [videoId, src]);

  // Check status immediately, then poll if still processing
  useEffect(() => {
    if (!videoId || status !== "loading") return;

    let cancelled = false;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/videos/${videoId}/status`, {
          credentials: "include",
        });
        if (cancelled) return;
        if (res.status === 404) {
          setStatus("failed");
          return true;
        }
        if (!res.ok) return false; // transient error, keep polling
        const data = await res.json();
        if (data.status === "ready" || data.status === "failed") {
          setStatus(data.status);
          return true;
        }
      } catch {
        // ignore polling errors
      }
      return false;
    };

    void checkStatus().then((done) => {
      if (done || cancelled) return;
      const interval = setInterval(async () => {
        const finished = await checkStatus();
        if (finished || cancelled) clearInterval(interval);
      }, 3000);
      cleanupInterval = interval;
    });

    let cleanupInterval: ReturnType<typeof setInterval> | undefined;
    return () => {
      cancelled = true;
      if (cleanupInterval) clearInterval(cleanupInterval);
    };
  }, [videoId, status]);

  // Initialize HLS playback
  useEffect(() => {
    if (status !== "ready" || !videoRef.current) return;

    const manifestUrl = videoId
      ? `${getApiUrl()}/videos/${videoId}/playlist.m3u8`
      : src;

    const video = videoRef.current;

    const onLoadedData = () => setMediaReady(true);
    video.addEventListener("loadeddata", onLoadedData);

    const onError = () => setStatus("failed");

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setStatus("failed");
      });
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      return () => {
        video.removeEventListener("loadeddata", onLoadedData);
        video.removeEventListener("error", onError);
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = manifestUrl;
      video.addEventListener("error", onError);
    }

    return () => {
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", onError);
    };
  }, [status, videoId, src]);

  if (!hasVideo) return null;

  if (status === "failed") {
    return (
      <figure className="mx-auto max-w-full text-center">
        <div className="flex items-center justify-center h-48 bg-red-50 rounded">
          <p className="text-sm text-red-600">
            Could not load video.
          </p>
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-600">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  const showSpinner = status === "loading" || !mediaReady;

  return (
    <figure className="mx-auto max-w-full text-center">
      {showSpinner && (
        <div className="flex items-center justify-center h-48 bg-gray-100 rounded">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {"Loading video..."}
            </p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        className={showSpinner ? "hidden" : "mx-auto max-h-120 w-auto rounded"}
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
