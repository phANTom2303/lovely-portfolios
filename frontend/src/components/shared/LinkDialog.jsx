import styles from "./LinkDialog.module.css";
import { useState } from "react";

function LinkDialog({
  link,
  titleText,
  titlePlaceholder = "e.g. LinkedIn, GitHub, Live Demo",
  urlPlaceholder = "https://...",
  showDescription = true,
  onSave,
  onDelete,
  onClose,
}) {
  const [formData, setFormData] = useState({
    title: link?.title || "",
    url: link?.url || link?.link || "",
    description: link?.description || "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;
    onSave({
      id: link?.id || crypto.randomUUID(),
      title: formData.title.trim(),
      url: formData.url.trim(),
      link: formData.url.trim(),
      description: formData.description ? formData.description.trim() : "",
    });
  }

  const defaultTitle = link ? "Edit Link" : "Add Link";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <form className={styles.dialogForm} onSubmit={handleSubmit}>
          <div className={styles.dialogHeader}>
            <h2>{titleText || defaultTitle}</h2>
            <div className={styles.headerActions}>
              {link && onDelete && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onDelete(link.id)}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
                {link ? "Save" : "Add"}
              </button>
            </div>
          </div>

          <div className={styles.formBody}>
            <div className={styles.formField}>
              <label htmlFor="sharedLinkTitle">Title</label>
              <input
                id="sharedLinkTitle"
                name="title"
                type="text"
                placeholder={titlePlaceholder}
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="sharedLinkUrl">URL</label>
              <input
                id="sharedLinkUrl"
                name="url"
                type="url"
                placeholder={urlPlaceholder}
                value={formData.url}
                onChange={handleChange}
                required
              />
            </div>

            {showDescription && (
              <div className={styles.formField}>
                <label htmlFor="sharedLinkDesc">Description (optional)</label>
                <input
                  id="sharedLinkDesc"
                  name="description"
                  type="text"
                  placeholder="Brief note about the link"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LinkDialog;
