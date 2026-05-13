import { cn } from "@alliance/shared/styles/util";
import React from "react";

const VIDEO_ID = "m8y-wAVbCh4";
const EMBED_QUERY = "si=ywbalh2SpOz2cyxs";

/** YouTube thumbnail until hover or keyboard activation, then full embed (lazy iframe). */
export default function AllianceIntroYouTubeEmbed() {
  const [playerActive, setPlayerActive] = React.useState(false);
  const title = "Alliance introduction video";

  return (
    <div
      tabIndex={playerActive ? -1 : 0}
      role={playerActive ? undefined : "button"}
      aria-label={
        playerActive
          ? undefined
          : `${title}. Hover or press Enter to load the player.`
      }
      className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
      onPointerEnter={() => setPlayerActive(true)}
      onFocus={() => {
        if (!playerActive) setPlayerActive(true);
      }}
      onKeyDown={(e) => {
        if (playerActive) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setPlayerActive(true);
        }
      }}
    >
      {playerActive ? (
        <iframe
          className="absolute inset-0 h-full w-full border-0"
          src={`https://www.youtube.com/embed/${VIDEO_ID}?${EMBED_QUERY}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : null}
      <div
        className={cn(
          "absolute inset-0 z-10 bg-cover bg-center transition-opacity duration-300",
          playerActive ? "pointer-events-none opacity-0" : "opacity-100",
        )}
        style={{
          backgroundImage: `url(https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg)`,
        }}
        aria-hidden
      />
    </div>
  );
}
