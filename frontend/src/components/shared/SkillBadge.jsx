import styles from "./SkillBadge.module.css";

function SkillBadge({
  name,
  onRemove,
  onRestore,
  onClick,
  size = "medium",
  className = "",
}) {
  const isRestore = Boolean(onRestore || onClick);

  return (
    <span
      className={`${styles.badge} ${size === "small" ? styles.small : ""} ${
        isRestore ? styles.restoreBadge : ""
      } ${className}`}
      onClick={isRestore ? onRestore || onClick : undefined}
      role={isRestore ? "button" : undefined}
      tabIndex={isRestore ? 0 : undefined}
    >
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${name}`}
        >
          &times;
        </button>
      )}
      {onRestore && (
        <span className={styles.restoreButton} aria-hidden="true">
          +
        </span>
      )}
      <span>{name}</span>
    </span>
  );
}

export default SkillBadge;
