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
  const [status, setStatus] = useState<"processing" | "ready" | "failed">(
    videoId ? "processing" : "ready"
  );
  const hasVideo = !!(src || videoId);

  // Check status immediately, then poll if still processing
  useEffect(() => {
    if (!videoId || status !== "processing") return;

    let cancelled = false;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/videos/${videoId}/status`, {
          credentials: "include",
        });
        if (!res.ok || cancelled) return;
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

    // Check immediately on mount
    void checkStatus().then((done) => {
      if (done || cancelled) return;
      // Only start polling if still processing
      const interval = setInterval(async () => {
        const finished = await checkStatus();
        if (finished || cancelled) clearInterval(interval);
      }, 3000);
      // Store for cleanup
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

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = manifestUrl;
    }
  }, [status, videoId, src]);

  if (!hasVideo) return null;

  if (status === "processing") {
    return (
      <figure className="mx-auto max-w-full text-center">
        <div className="flex items-center justify-center h-48 bg-gray-100 rounded">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-gray-600">Processing video...</p>
          </div>
        </div>
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-600">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (status === "failed") {
    return (
      <figure className="mx-auto max-w-full text-center">
        <div className="flex items-center justify-center h-48 bg-red-50 rounded">
          <p className="text-sm text-red-600">
            Video processing failed. Please try uploading again.
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

  return (
    <figure className="mx-auto max-w-full text-center">
      <video
        ref={videoRef}
        controls
        className="mx-auto max-h-120 w-auto rounded"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
