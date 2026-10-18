import styles from "./CoreDetails.module.css";
import { useState } from "react";
import CoreDetailsDialog from "./CoreDetailsDialog";

function CoreDetails({ profile, setProfile }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleSave(formData) {
    setProfile((previous) => ({
      ...previous,
      ...formData,
    }));
    setIsDialogOpen(false);
  }

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Core Details</h2>
          <button
            className={styles.editButton}
            type="button"
            onClick={() => setIsDialogOpen(true)}
            aria-label="Edit core details"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>

        <div className={styles.fields}>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <span className={styles.label}>Name</span>
            <p className={styles.value}>{profile.name || "—"}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Gender</span>
            <p className={styles.value}>{profile.gender || "—"}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Phone</span>
            <p className={styles.value}>{profile.phone || "—"}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Professional Title</span>
            <p className={styles.value}>{profile.professionalTitle || "—"}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Current Location</span>
            <p className={styles.value}>{profile.location || "—"}</p>
          </div>
        </div>
      </section>

      {isDialogOpen && (
        <CoreDetailsDialog
          profile={profile}
          onSave={handleSave}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}

export default CoreDetails;
