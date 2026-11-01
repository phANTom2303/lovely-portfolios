import styles from "./CoreDetailsDialog.module.css";
import { useState } from "react";

function CoreDetailsDialog({ profile, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    gender: profile?.gender || "",
    phone: profile?.phone || "",
    professionalTitle: profile?.professionalTitle || "",
    location: profile?.location || "",
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
    onSave(formData);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <form className={styles.dialogForm} onSubmit={handleSubmit}>
          <div className={styles.dialogHeader}>
            <h2>Edit Core Details</h2>
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
            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Sterling"
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className={styles.formField}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <label htmlFor="professionalTitle">Professional Title</label>
                <input
                  id="professionalTitle"
                  name="professionalTitle"
                  type="text"
                  value={formData.professionalTitle}
                  onChange={handleChange}
                  placeholder="e.g. Software Developer"
                />
              </div>

              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <label htmlFor="location">Current Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru, India"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CoreDetailsDialog;
