import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PortfolioCard.module.css";

export default function PortfolioCard({
  portfolio,
  onSetActive,
  onDuplicate,
  onDelete,
}) {
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const fullUrl = `${window.location.origin}/portfolio/${portfolio.slug}`;
  const displayPath = `/portfolio/${portfolio.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const formattedDate = portfolio.updatedAt
    ? new Date(portfolio.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <article
      className={`${styles.card} ${portfolio.isActive ? styles.activeCard : ""}`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.badgeGroup}>
          {portfolio.isActive ? (
            <span className={styles.activeBadge}>
              <span className={styles.pulseDot} /> Active
            </span>
          ) : (
            <span className={styles.inactiveBadge}>Inactive</span>
          )}
          <span className={styles.themeBadge} title={`Theme: ${portfolio.theme}`}>
            {portfolio.theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </span>
        </div>

        <div className={styles.metaTime}>Updated {formattedDate}</div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.title}>{portfolio.title}</h3>

        {/* Unique Link Bar */}
        <div className={styles.linkBar}>
          <div className={styles.linkInfo}>
            <span className={styles.linkLabel}>Unique Link</span>
            <span className={styles.linkPath} title={fullUrl}>
              {displayPath}
            </span>
          </div>
          <button
            type="button"
            className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
            onClick={handleCopyLink}
            aria-label="Copy unique link to clipboard"
          >
            {copied ? "Copied! ✓" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Card Actions */}
      <div className={styles.cardFooter}>
        <div className={styles.primaryActions}>
          <Link
            to={`/portfolio/${portfolio.slug}`}
            className={styles.viewButton}
            title="Open and view this portfolio"
          >
            View Portfolio ↗
          </Link>

          <button
            type="button"
            className={
              portfolio.isActive
                ? styles.activeToggleButton
                : styles.setActiveButton
            }
            onClick={() => onSetActive(portfolio.id)}
            title={
              portfolio.isActive
                ? "Click to set as inactive"
                : "Click to set as active"
            }
          >
            {portfolio.isActive ? "Active ✓" : "Set as Active"}
          </button>
        </div>

        <div className={styles.secondaryActions}>
          <Link
            to={`/portfolio/${portfolio.slug || portfolio.id}/edit`}
            className={styles.iconAction}
            title="Edit portfolio content"
          >
            Edit
          </Link>
          <button
            type="button"
            className={styles.iconAction}
            onClick={() => onDuplicate(portfolio.id)}
            title="Duplicate this portfolio"
          >
            Duplicate
          </button>

          {!showConfirmDelete ? (
            <button
              type="button"
              className={`${styles.iconAction} ${styles.deleteAction}`}
              onClick={() => setShowConfirmDelete(true)}
              title="Delete portfolio"
            >
              Delete
            </button>
          ) : (
            <div className={styles.confirmDeleteWrapper}>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={() => onDelete(portfolio.id)}
              >
                Confirm
              </button>
              <button
                type="button"
                className={styles.cancelDeleteBtn}
                onClick={() => setShowConfirmDelete(false)}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
