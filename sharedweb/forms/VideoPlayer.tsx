import { AnalyticsEvent } from "@alliance/common/analytics";
import { captureEvent } from "@alliance/shared/lib/analytics";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { getApiUrl } from "../lib/config";

type VideoPlayerProps = {
  src: string;
  videoId?: number;
  caption?: string;
};

export default function VideoPlayer({
  src,
  videoId,
  caption,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    videoId ? "loading" : "ready",
  );
  const [mediaReady, setMediaReady] = useState(false);
  const hasVideo = !!(src || videoId);
  const lastTrackedTimeRef = useRef(0);

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

  useEffect(() => {
    captureEvent(AnalyticsEvent.VideoSeen, { videoId });
  }, [videoId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hasTrackedPlay = false;
    let hasTrackedComplete = false;

    const onPlay = () => {
      if (hasTrackedPlay) return;
      hasTrackedPlay = true;
      captureEvent(AnalyticsEvent.VideoStarted, {
        videoId,
        src,
      });
    };

    const onTimeUpdate = () => {
      if (hasTrackedComplete || !video.duration) return;
      if (video.duration - video.currentTime <= 3) {
        hasTrackedComplete = true;
        captureEvent(AnalyticsEvent.VideoFullyWatched, {
          videoId,
          src,
        });
      }

      if (video.currentTime > lastTrackedTimeRef.current + 5) {
        lastTrackedTimeRef.current = video.currentTime;
        captureEvent(AnalyticsEvent.VideoProgress, {
          videoId,
          src,
          progress: Math.floor(video.currentTime),
          duration: Math.floor(video.duration),
        });
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [videoId, src]);

  // Initialize HLS playback
  useEffect(() => {
    if (status !== "ready" || !videoRef.current) return;

    const manifestUrl = src.startsWith("http")
      ? `${src}/playlist.m3u8`
      : videoId
        ? `${getApiUrl()}/videos/${videoId}/playlist.m3u8`
        : src;

    const video = videoRef.current;

    const onLoadedData = () => setMediaReady(true);
    video.addEventListener("loadeddata", onLoadedData);

    const onError = () => setStatus("failed");
    video.addEventListener("error", onError);

    if (Hls.isSupported()) {
      const hls = new Hls({
        fragLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 10000,
            maxLoadTimeMs: 10000,
            timeoutRetry: {
              maxNumRetry: 3,
              retryDelayMs: 1000,
              maxRetryDelayMs: 1000,
            },
            errorRetry: {
              maxNumRetry: 3,
              retryDelayMs: 1000,
              maxRetryDelayMs: 1000,
            },
          },
        },
      });
      hlsRef.current = hls;
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setStatus("failed");
      });
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
        if (hls.subtitleTracks.length > 0) {
          hls.subtitleDisplay = false;
        }
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
          <p className="text-sm text-red-600">Could not load video.</p>
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
            <p className="text-sm text-gray-600">{"Loading video..."}</p>
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
