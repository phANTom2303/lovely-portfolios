import styles from "./AboutDialog.module.css";
import { useState } from "react";

function AboutDialog({ about, onSave, onClose }) {
  const [draftAbout, setDraftAbout] = useState(about || "");

  function handleSubmit(event) {
    event.preventDefault();
    onSave(draftAbout);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <form className={styles.dialogForm} onSubmit={handleSubmit}>
          <div className={styles.dialogHeader}>
            <h2>Edit About</h2>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
                Save
              </button>
            </div>
          </div>

          <div className={styles.formBody}>
            <div className={styles.formField}>
              <label htmlFor="aboutText">About You</label>
              <textarea
                id="aboutText"
                className={styles.textarea}
                value={draftAbout}
                onChange={(event) => setDraftAbout(event.target.value)}
                placeholder="Tell people about yourself, your background, and your interests..."
                rows={6}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AboutDialog;
