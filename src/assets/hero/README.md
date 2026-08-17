# hero/

Landing-page hero media.

- `hero-carousel-{1,2,3}`: rotating hero stills.
- `hero-pool-optimized.webp`, `wonderlands-hero.*`: static hero art.
- `hero-beach.mp4.asset.json`, `hero-beach-uhd.mp4.asset.json`: CDN pointers for the
  hero video (import the JSON and use its `.url`; the binary is not in the repo).
- Hero images are the only ones allowed to skip `loading="lazy"`.

