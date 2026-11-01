import styles from "./ProjectLinksModal.module.css";

function ProjectLinksModal({ projectName, links = [], onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="linksModalTitle"
      >
        <div className={styles.header}>
          <div>
            <h2 id="linksModalTitle" className={styles.title}>
              Project Links
            </h2>
            <span className={styles.subtitle}>{projectName}</span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          {links.length > 0 ? (
            <div className={styles.linksList}>
              {links.map((link) => (
                <a
                  key={link.id || link.url}
                  href={link.url || link.link}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.linkCard}
                >
                  <div className={styles.linkInfo}>
                    <span className={styles.linkTitle}>
                      {link.title || link.url}
                    </span>
                    {link.description && (
                      <span className={styles.linkDesc}>
                        {link.description}
                      </span>
                    )}
                    <span className={styles.linkUrl}>
                      {link.url || link.link}
                    </span>
                  </div>
                  <span className={styles.externalIcon}>↗</span>
                </a>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No links attached to this project yet.</p>
              <span className={styles.emptyHint}>
                Use &quot;Edit Project&quot; to attach website, demo, or repository links.
              </span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectLinksModal;
