import styles from "./About.module.css";
import { useState } from "react";

function About({ profile, setProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftAbout, setDraftAbout] = useState(profile.about || "");

  function handleEdit() {
    setDraftAbout(profile.about || "");
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  function handleSave() {
    setProfile((previous) => ({
      ...previous,
      about: draftAbout,
    }));

    setIsEditing(false);
  }

  return (
    <section className={styles.card}>
      {isEditing ? (
        <div className={styles.cardHeaderEdit}>
          <h2>About</h2>

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
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.cardHeader}>
          <h2>About</h2>

          <button
            className={styles.editButton}
            type="button"
            onClick={handleEdit}
          >
            Edit
          </button>
        </div>
      )}

      {isEditing ? (
        <textarea
          className={styles.textarea}
          value={draftAbout}
          onChange={(event) => setDraftAbout(event.target.value)}
          placeholder="Tell people about yourself..."
          rows={6}
        />
      ) : (
        <p className={styles.aboutText}>
          {profile.about || "Tell people about yourself."}
        </p>
      )}
    </section>
  );
}

export default About;
