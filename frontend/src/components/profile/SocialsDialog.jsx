import styles from "./SocialsDialog.module.css";
import { useState } from "react";

function SocialsDialog({ socials = [], onSave, onClose }) {
  const [links, setLinks] = useState(
    socials.map((item) => ({
      id: item.id || crypto.randomUUID(),
      title: item.title || "",
      url: item.url || item.link || "",
    })),
  );

  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [inputError, setInputError] = useState("");

  function handleAddLink(event) {
    event.preventDefault();
    const trimmedTitle = newTitle.trim();
    const trimmedUrl = newUrl.trim();

    if (!trimmedTitle || !trimmedUrl) {
      setInputError("Both title and URL are required to add a link.");
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      url: trimmedUrl,
    };

    setLinks((prev) => [...prev, newItem]);
    setNewTitle("");
    setNewUrl("");
    setInputError("");
  }

  function handleRemoveLink(id) {
    setLinks((prev) => prev.filter((item) => item.id !== id));
  }

  function handleUpdateLink(id, field, value) {
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function handleSave() {
    const validLinks = links
      .map((item) => ({
        ...item,
        title: item.title.trim(),
        url: item.url.trim(),
      }))
      .filter((item) => item.title && item.url);

    onSave(validLinks);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h2>Manage Social Links</h2>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>

        <div className={styles.dialogBody}>
          <form className={styles.addSection} onSubmit={handleAddLink}>
            <span className={styles.sectionTitle}>Add New Link</span>
            <div className={styles.addInputsRow}>
              <input
                type="text"
                className={styles.titleInput}
                placeholder="Title (e.g. LinkedIn, GitHub)"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (inputError) setInputError("");
                }}
              />
              <input
                type="url"
                className={styles.urlInput}
                placeholder="https://..."
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  if (inputError) setInputError("");
                }}
              />
              <button type="submit" className={styles.addButton}>
                + Add
              </button>
            </div>
            {inputError && <span className={styles.errorText}>{inputError}</span>}
          </form>

          <div className={styles.linksSection}>
            <div className={styles.linksSectionHeader}>
              <span className={styles.sectionTitle}>
                Your Links ({links.length})
              </span>
            </div>

            {links.length > 0 ? (
              <div className={styles.linksList}>
                {links.map((link) => (
                  <div key={link.id} className={styles.linkRow}>
                    <input
                      type="text"
                      className={styles.rowTitleInput}
                      value={link.title}
                      placeholder="Title"
                      onChange={(e) =>
                        handleUpdateLink(link.id, "title", e.target.value)
                      }
                    />
                    <input
                      type="url"
                      className={styles.rowUrlInput}
                      value={link.url}
                      placeholder="https://..."
                      onChange={(e) =>
                        handleUpdateLink(link.id, "url", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveLink(link.id)}
                      aria-label={`Remove ${link.title || "link"}`}
                      title="Remove link"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyNotice}>
                No links added yet. Use the inputs above to add your first social link.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialsDialog;
