import { useState } from "react";
import styles from "./PortfolioCTA.module.css";

function CTABackground() {
  return (
    <svg
      className={styles.backgroundArtwork}
      width="100%"
      height="100%"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMin slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 1. Radiating Radar Beacon Rings (Center) */}
      <g transform="translate(600, 300)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.065" fill="none">
        <circle cx="0" cy="0" r="120" strokeDasharray="3 3" />
        <circle cx="0" cy="0" r="220" />
        <circle cx="0" cy="0" r="320" strokeDasharray="4 4" />
        <circle cx="0" cy="0" r="420" strokeOpacity="0.04" />
        <line x1="-480" y1="0" x2="480" y2="0" strokeOpacity="0.04" />
        <line x1="0" y1="-280" x2="0" y2="280" strokeOpacity="0.04" />
      </g>

      {/* 2. Geometric Envelope / Communication Packet Wireframe (Top Left) */}
      <g transform="translate(100, 80) scale(0.9)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.075" fill="none">
        <rect x="0" y="0" width="100" height="70" rx="6" />
        <polyline points="0,0 50,40 100,0" />
        <line x1="0" y1="70" x2="35" y2="30" strokeDasharray="2 2" />
        <line x1="100" y1="70" x2="65" y2="30" strokeDasharray="2 2" />
      </g>

      {/* 3. Signal Wave Oscillation (Bottom Right) */}
      <g transform="translate(980, 420)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.07" fill="none" strokeLinecap="round">
        <path d="M 0,25 Q 25,0 50,25 T 100,25 T 150,25" />
        <circle cx="0" cy="25" r="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="150" cy="25" r="3" fill="currentColor" fillOpacity="0.1" />
      </g>
    </svg>
  );
}

export default function PortfolioCTA({ contact, cta, location }) {
  const data = contact || cta || {};
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!data?.email) return;
    navigator.clipboard.writeText(data.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <section className={styles.section} id="contact">
      <CTABackground />
      <div className={styles.inner} data-reveal>
        <div className={styles.boardTag}>
          <span>★</span>
          <span>Initiate Contact</span>
        </div>

        <h2 className={styles.headline}>
          {data.headline || "Let's build together."}
        </h2>

        <p className={styles.subline}>
          {data.subheadline ||
            data.subline ||
            "Have an ambitious project, an engineering opening, or just want to talk systems architecture? My inbox is always open."}
        </p>

        {/* Action Dispatch Hub */}
        <div className={styles.dispatchBar}>
          <a href={`mailto:${data.email}`} className={styles.emailButton}>
            <span>Send Email</span>
            <span className={styles.actionIcon} aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
          </a>

          <button
            type="button"
            className={`${styles.copyButton} ${copied ? styles.copyButtonActive : ""}`}
            onClick={handleCopy}
            aria-label="Copy email address"
          >
            {copied ? (
              <>
                <span className={styles.copyCheck}>✓</span>
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <span className={styles.copyIcon}>📋</span>
                <span>{data.email || "hello@developer.com"}</span>
              </>
            )}
          </button>
        </div>

        {/* Dispatch Notes */}
        <div className={styles.footerNote}>
          {location && <span className={styles.locationPill}>📍 {location}</span>}
          <span className={styles.availabilityNote}>
            ⚡ Typically responds within 24 hours
          </span>
        </div>
      </div>
    </section>
  );
}
