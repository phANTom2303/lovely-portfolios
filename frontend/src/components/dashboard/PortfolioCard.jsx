import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PortfolioCard.module.css";

const STATUS_BADGES = {
  published: { label: "Published", className: "activeBadge", pulse: true },
  draft: { label: "Draft", className: "inactiveBadge" },
  archived: { label: "Archived", className: "archivedBadge" },
};

export default function PortfolioCard({
  portfolio,
  isBusy = false,
  onChangeStatus,
  onDuplicate,
  onDelete,
}) {
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const id = portfolio.portfolio_id;
  const status = portfolio.status || "draft";
  const isPublished = status === "published";
  const isArchived = status === "archived";
  const badge = STATUS_BADGES[status] || STATUS_BADGES.draft;
  const theme = portfolio.profile_data?.theme === "dark" ? "dark" : "light";

  const displayPath = `/portfolio/${id}`;
  const fullUrl = `${window.location.origin}${displayPath}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const formattedDate = portfolio.create_date
    ? new Date(portfolio.create_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <article className={`${styles.card} ${isPublished ? styles.activeCard : ""}`}>
      <div className={styles.cardHeader}>
        <div className={styles.badgeGroup}>
          <span className={styles[badge.className]}>
            {badge.pulse && <span className={styles.pulseDot} />} {badge.label}
          </span>
          <span className={styles.themeBadge} title={`Theme: ${theme}`}>
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </span>
        </div>

        <div className={styles.metaTime}>Created {formattedDate}</div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.title}>{portfolio.portfolio_name}</h3>

        {/* Unique Link Bar */}
        <div className={styles.linkBar}>
          <div className={styles.linkInfo}>
            <span className={styles.linkLabel}>
              {isPublished ? "Public Link" : "Publish to share"}
            </span>
            <span className={styles.linkPath} title={fullUrl}>
              {displayPath}
            </span>
          </div>
          <button
            type="button"
            className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
            onClick={handleCopyLink}
            disabled={!isPublished}
            title={isPublished ? "Copy public link" : "Only published portfolios are publicly visible"}
            aria-label="Copy public link to clipboard"
          >
            {copied ? "Copied! ✓" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Card Actions */}
      <div className={styles.cardFooter}>
        <div className={styles.primaryActions}>
          {isPublished ? (
            <Link
              to={displayPath}
              className={styles.viewButton}
              title="Open the public portfolio page"
            >
              View Live ↗
            </Link>
          ) : (
            <Link
              to={`/portfolio/${id}/preview`}
              className={styles.viewButton}
              title="Preview this portfolio (only visible to you)"
            >
              Preview ↗
            </Link>
          )}

          {isPublished ? (
            <button
              type="button"
              className={styles.activeToggleButton}
              onClick={() => onChangeStatus(id, "draft")}
              disabled={isBusy}
              title="Click to unpublish (move back to draft)"
            >
              Published ✓
            </button>
          ) : (
            <button
              type="button"
              className={styles.setActiveButton}
              onClick={() => onChangeStatus(id, isArchived ? "draft" : "published")}
              disabled={isBusy}
              title={isArchived ? "Move back to drafts" : "Make this portfolio publicly visible"}
            >
              {isArchived ? "Restore to Draft" : "Publish"}
            </button>
          )}
        </div>

        <div className={styles.secondaryActions}>
          <Link
            to={`/portfolio/${id}/edit`}
            className={styles.iconAction}
            title="Edit portfolio content"
          >
            Edit
          </Link>
          <button
            type="button"
            className={styles.iconAction}
            onClick={() => onDuplicate(id)}
            disabled={isBusy}
            title="Duplicate this portfolio as a new draft"
          >
            Duplicate
          </button>
          {!isArchived && (
            <button
              type="button"
              className={styles.iconAction}
              onClick={() => onChangeStatus(id, "archived")}
              disabled={isBusy}
              title="Archive this portfolio"
            >
              Archive
            </button>
          )}

          {!showConfirmDelete ? (
            <button
              type="button"
              className={`${styles.iconAction} ${styles.deleteAction}`}
              onClick={() => setShowConfirmDelete(true)}
              disabled={isBusy}
              title="Delete portfolio"
            >
              Delete
            </button>
          ) : (
            <div className={styles.confirmDeleteWrapper}>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={() => onDelete(id)}
                disabled={isBusy}
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
