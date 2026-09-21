import styles from "./Socials.module.css";
import { useState } from "react";

function Socials({ profile, setProfile }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function handleAddStart() {
    setTitle("");
    setUrl("");
    setIsAdding(true);
  }

  function handleAdd() {
    if (!title.trim() || !url.trim()) {
      return;
    }

    const newSocial = {
      id: crypto.randomUUID(),
      title: title.trim(),
      url: url.trim(),
    };

    setProfile((previous) => ({
      ...previous,
      socials: [...(previous.socials || []), newSocial],
    }));

    handleCancel();
  }

  function handleEditMode() {
    setIsEditing(true);
    setEditingId(null);
  }

  function handleEditSocial(social) {
    setEditingId(social.id);
    setTitle(social.title);
    setUrl(social.url);
  }

  function handleSaveEdit() {
    if (!title.trim() || !url.trim()) {
      return;
    }

    setProfile((previous) => ({
      ...previous,
      socials: previous.socials.map((social) =>
        social.id === editingId
          ? {
              ...social,
              title: title.trim(),
              url: url.trim(),
            }
          : social,
      ),
    }));

    handleCancel();
  }

  function handleDelete() {
    setProfile((previous) => ({
      ...previous,
      socials: previous.socials.filter((social) => social.id !== editingId),
    }));

    handleCancel();
  }

  function handleCancel() {
    setTitle("");
    setUrl("");

    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
  }

  function handleDoneEditing() {
    setIsEditing(false);
    setEditingId(null);
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Socials</h2>

        {/* Normal Mode */}
        {!isAdding && !isEditing && (
          <div className={styles.headerActions}>
            <button
              className={styles.addButton}
              type="button"
              onClick={handleAddStart}
            >
              Add
            </button>

            <button
              className={styles.editButton}
              type="button"
              onClick={handleEditMode}
            >
              Edit
            </button>
          </div>
        )}

        {/* Social Selection Mode */}
        {isEditing && !editingId && (
          <button
            className={styles.cancelButton}
            type="button"
            onClick={handleDoneEditing}
          >
            Done
          </button>
        )}

        {/* Individual Social Editing */}
        {editingId && (
          <div className={styles.headerActions}>
            <button
              className={styles.deleteButton}
              type="button"
              onClick={handleDelete}
            >
              Delete
            </button>

            <button
              className={styles.saveButton}
              type="button"
              onClick={handleSaveEdit}
            >
              Save
            </button>
          </div>
        )}

        {/* Adding New Social */}
        {isAdding && (
          <div className={styles.headerActions}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              className={styles.saveButton}
              type="button"
              onClick={handleAdd}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Add Social*/}

      {isAdding && (
        <div className={styles.addForm}>
          <div className={styles.field}>
            <label htmlFor="socialTitle">Title</label>

            <input
              id="socialTitle"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. LinkedIn"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="socialUrl">Link</label>

            <input
              id="socialUrl"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      )}

      {/*Edit Existing Social*/}

      {editingId && (
        <div className={styles.addForm}>
          <div className={styles.field}>
            <label htmlFor="editSocialTitle">Title</label>

            <input
              id="editSocialTitle"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. LinkedIn"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="editSocialUrl">Link</label>

            <input
              id="editSocialUrl"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      )}

      {!isAdding && !editingId && (
        <div className={styles.socialList}>
          {profile.socials?.length ? (
            profile.socials.map((social) => (
              <div className={styles.socialItem} key={social.id}>
                <span>{social.title}</span>

                {isEditing ? (
                  <button
                    className={styles.itemEditButton}
                    type="button"
                    onClick={() => handleEditSocial(social)}
                  >
                    Edit
                  </button>
                ) : (
                  <a href={social.url} target="_blank" rel="noreferrer">
                    Visit
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className={styles.emptyState}>
              Add links to your professional profiles.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default Socials;
