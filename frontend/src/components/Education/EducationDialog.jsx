import styles from "./EducationDialog.module.css";
import { useState } from "react";

function EducationDialog({ education, onSave, onClose, onDelete }) {
  const [formData, setFormData] = useState({
    level: education?.level || "under_graduate",
    degree: education?.degree || "",
    institute: education?.institute || "",
    branch: education?.branch || "",
    gradingSystem: education?.gradingSystem || "",
    grade: education?.grade || "",
    totalMark: education?.totalMark || "",
    startDate: education?.startDate || "",
    endDate: education?.endDate || "",
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
    <div className={styles.dialog}>
      <form className={styles.dialogForm} onSubmit={handleSubmit}>
        <div className={styles.dialogHeader}>
          <h2>{education ? "Edit Education" : "Add Education"}</h2>

          <div className={styles.headerActions}>
            {education && (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={onDelete}
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
              Save
            </button>
          </div>
        </div>

        <div className={styles.formBody}>
          <div className={styles.formField}>
            <label htmlFor="level">Level Of Education</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
            >
              <option value="secondary">Secondary</option>
              <option value="higher_secondary">Higher secondary</option>
              <option value="under_graduate">Undergraduate</option>
              <option value="post_graduate">Postgraduate</option>
              <option value="diploma">Diploma</option>
              <option value="phd">PhD</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="degree">Degree / Qualification</label>
            <input
              id="degree"
              name="degree"
              type="text"
              value={formData.degree}
              placeholder="e.g. Bachelor of Technology"
              onChange={handleChange}
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="institute">Name of Institution</label>
            <input
              id="institute"
              name="institute"
              type="text"
              value={formData.institute}
              placeholder="e.g. XYZ University"
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="branch">Branch / Stream</label>
            <input
              id="branch"
              name="branch"
              type="text"
              value={formData.branch}
              placeholder="e.g. Computer Science"
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="gradingSystem">Grading System</label>
              <input
                id="gradingSystem"
                name="gradingSystem"
                type="text"
                value={formData.gradingSystem}
                placeholder="e.g. CGPA, Percentage"
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="grade">Grade Obtained</label>
              <input
                id="grade"
                name="grade"
                type="text"
                value={formData.grade}
                placeholder="e.g. 9.0 or 91%"
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="totalMark">Total Mark</label>
              <input
                id="totalMark"
                name="totalMark"
                type="number"
                min="0.01"
                step="any"
                value={formData.totalMark}
                placeholder="e.g. 10 or 100"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.dateFields}>
            <div className={styles.formField}>
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="month"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                name="endDate"
                type="month"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EducationDialog;
