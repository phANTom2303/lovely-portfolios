import { useState } from "react";
import styles from "./AddSocialLinkDialog.module.css";

export default function AddSocialLinkDialog({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    onAdd({
      title: title.trim(),
      url: url.trim(),
    });
    setTitle("");
    setUrl("");
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className={styles.header}>
            <h3 className={styles.title}>Add Social Link</h3>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          <div className={styles.body}>
            {/* Platform Title */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Platform Name *</label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="e.g. GitHub, LinkedIn, Twitter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* URL */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Profile / Target URL *</label>
              <input
                type="url"
                required
                className={styles.input}
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
