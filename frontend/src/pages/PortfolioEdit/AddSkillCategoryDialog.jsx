import { useState } from "react";
import styles from "./AddSkillCategoryDialog.module.css";

export default function AddSkillCategoryDialog({ isOpen, onClose, onAdd }) {
  const [categoryName, setCategoryName] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const parsedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onAdd({
      name: categoryName.trim(),
      skills: parsedSkills,
    });

    setCategoryName("");
    setSkillsInput("");
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className={styles.header}>
            <h3 className={styles.title}>Add Skill Category</h3>
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
            {/* Category Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Category Name *</label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="e.g. Languages or Frameworks"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Skills */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Skills *</label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="e.g. React, Node.js, PostgreSQL (comma-separated)"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
