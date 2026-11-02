import { useState, useRef } from "react";
import styles from "./MediaGallery.module.css";

/**
 * Normalizes different media representations into a uniform list:
 * - String URL: "https://..."
 * - Object: { url, type, poster, caption, description, title }
 * - Array of strings / objects
 */
function normalizeMediaItems(rawAssets, rawImages, singleImage) {
  let list = [];

  if (Array.isArray(rawAssets) && rawAssets.length > 0) {
    list = rawAssets;
  } else if (Array.isArray(rawImages) && rawImages.length > 0) {
    list = rawImages;
  } else if (typeof singleImage === "string" && singleImage.trim() !== "") {
    list = [{ url: singleImage }];
  } else if (typeof rawAssets === "string" && rawAssets.trim() !== "") {
    list = [{ url: rawAssets }];
  }

  return list.map((item, idx) => {
    if (typeof item === "string") {
      const isVideo = isVideoUrl(item);
      return {
        id: `media-${idx}`,
        url: item,
        type: isVideo ? "video" : "image",
        caption: null,
        title: null,
      };
    }

    const url = item.url || item.src || "";
    const isVideo =
      item.type === "video" ||
      isVideoUrl(url) ||
      Boolean(item.videoUrl);

    return {
      id: item.id || `media-${idx}`,
      url: item.videoUrl || url,
      type: isVideo ? "video" : "image",
      title: item.title || null,
      caption: item.caption || item.description || null,
    };
  });
}

function isVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  const clean = url.toLowerCase().split("?")[0];
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    url.includes("youtube.com/embed") ||
    url.includes("player.vimeo.com")
  );
}

function isEmbedUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.includes("youtube.com/embed") || url.includes("player.vimeo.com");
}

export default function MediaGallery({
  assets,
  media,
  images,
  image,
  altTitle = "Visual preview",
  aspectRatio = "16/10",
  className = "",
  emptyFallback = null,
}) {
  const items = normalizeMediaItems(assets || media, images, image);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef(null);

  if (items.length === 0) {
    return emptyFallback || null;
  }

  const safeIndex = activeIndex < items.length ? activeIndex : 0;
  const current = items[safeIndex] || items[0];
  const hasMultiple = items.length > 1;

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const isEmbed = isEmbedUrl(current.url);

  return (
    <div
      className={`${styles.galleryRoot} ${className}`}
      style={{ "--gallery-aspect-ratio": aspectRatio }}
    >
      <div className={styles.viewport}>
        {/* Media Item Display */}
        {current.type === "video" ? (
          isEmbed ? (
            <iframe
              src={current.url}
              title={current.title || altTitle}
              className={styles.mediaFrame}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              key={current.url}
              src={current.url}
              controls
              playsInline
              preload="metadata"
              className={styles.mediaVideo}
            >
              Your browser does not support the video tag.
            </video>
          )
        ) : (
          <img
            key={current.url}
            src={current.url}
            alt={current.caption || current.title || altTitle}
            className={styles.mediaImage}
            decoding="async"
          />
        )}

        {/* Counter Badge (discreetly shown only when multiple items exist) */}
        {hasMultiple && (
          <div className={styles.topBadgeRow}>
            <span className={styles.counterBadge}>
              {activeIndex + 1} / {items.length}
            </span>
          </div>
        )}

        {/* Navigation Arrows for Multiple Items */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className={`${styles.navBtn} ${styles.navBtnPrev}`}
              aria-label="Previous media"
              title="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              className={`${styles.navBtn} ${styles.navBtnNext}`}
              aria-label="Next media"
              title="Next"
            >
              ›
            </button>
          </>
        )}

        {/* Caption Overlay (if title or caption exists) */}
        {(current.caption || current.title) && (
          <div className={styles.captionOverlay}>
            {current.title && (
              <strong className={styles.captionTitle}>{current.title}</strong>
            )}
            {current.caption && (
              <p className={styles.captionText}>{current.caption}</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination Dot Strip for Multiple Items */}
      {hasMultiple && (
        <div className={styles.paginationStrip}>
          {items.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`${styles.dot} ${
                idx === activeIndex ? styles.dotActive : ""
              }`}
              aria-label={`View media ${idx + 1}: ${item.title || item.type}`}
              title={item.title || `Media ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
