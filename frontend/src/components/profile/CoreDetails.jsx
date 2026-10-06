import styles from "./CoreDetails.module.css";
import { useState } from "react";
function CoreDetails({ profile, setProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftProfile, setDraftProfile] = useState(profile);
  function handleEdit() {
    setDraftProfile(profile);
    setIsEditing(true);
  }
  function handleCancel() {
    setIsEditing(false);
  }
  function handleSave() {
    setProfile(draftProfile);
    setIsEditing(false);
  }
  function handleChange(event) {
    const { name, value } = event.target;
    setDraftProfile((previous) => ({ ...previous, [name]: value }));
  }
  return (
    <section className={styles.card}>
      {isEditing ? (
        <div className={styles.cardHeaderEdit}>
          <h2>Core Details</h2>
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
          <h2>Core Details</h2>
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
        <div>
          <form className={styles.formFields}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <span className={styles.label}>Name</span>
              <input
                className={styles.name}
                name="name"
                value={draftProfile.name}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Gender</span>
              <input
                className={styles.value}
                name="gender"
                value={draftProfile.gender}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Phone</span>
              <input
                className={styles.value}
                name="phone"
                value={draftProfile.phone}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Professional Title</span>
              <input
                className={styles.value}
                name="professionalTitle"
                value={draftProfile.professionalTitle}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Current Location</span>
              <input
                className={styles.value}
                name="location"
                value={draftProfile.location}
                onChange={handleChange}
              />
            </div>
          </form>
        </div>
      ) : (
        <div className={styles.fields}>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <span className={styles.label}>Name</span>
            <p className={styles.value}>{profile.name}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Gender</span>
            <p className={styles.value}>{profile.gender}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Phone</span>
            <p className={styles.value}>{profile.phone}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Professional Title</span>
            <p className={styles.value}>{profile.professionalTitle}</p>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Current Location</span>
            <p className={styles.value}>{profile.location}</p>
          </div>
        </div>
      )}
    </section>
  );
}
export default CoreDetails;
