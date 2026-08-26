import * as React from "react";
const { useState } = React;
import heroVideo from "@/assets/hero/hero-beach.mp4.asset.json";

/**
 * HeroVideo — shared ambient cover video.
 *
 * NOTE (for maintainers): the FLIP first page and the site header (Hero) both
 * use this component so the same footage plays in both places. The published
 * CDN occasionally serves the .mp4 with a wrong MIME type, so a still fallback
 * image always renders underneath; if the video errors we simply drop it and
 * the still remains — the page can never go blank.
 */
const HeroVideo: React.FC<{ poster: string; alt: string; className?: string }> = ({
  poster,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
}) => {
  const [videoOk, setVideoOk] = useState(true);
  return (
    <>
      <img src={poster} alt={alt} loading="eager" decoding="async" className={className} />
      {videoOk && (
        <video
          src={heroVideo.url}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoOk(false)}
          className={className}
          aria-hidden
        />
      )}
    </>
  );
};

export default HeroVideo;
