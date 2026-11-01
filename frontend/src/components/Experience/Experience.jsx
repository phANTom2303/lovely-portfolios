import styles from "./Experience.module.css";
import { useState } from "react";
import ExperienceCard from "./ExperienceCard";
import ResumeEntityDialog from "../resumeEntity/ResumeEntityDialog";
import sampleExperience from "../../data/sampleExperience";

function formatDateRange(startDate, endDate, isCurrent) {
  function formatMonthYear(val) {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  const start = formatMonthYear(startDate);
  const end = isCurrent ? "Present" : formatMonthYear(endDate);
  if (!start && !end) return "";
  if (!end) return start;
  return `${start} — ${end}`;
}

function Experience() {
  const [experiences, setExperiences] = useState(sampleExperience);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

  function handleOpenAdd() {
    setEditingExperience(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(exp) {
    setEditingExperience(exp);
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setEditingExperience(null);
  }

  function handleSaveExperience(formData) {
    if (editingExperience) {
      setExperiences((previous) =>
        previous.map((item) =>
          item.id === editingExperience.id ? { ...item, ...formData } : item,
        ),
      );
    } else {
      const newExperience = {
        id: crypto.randomUUID(),
        ...formData,
      };
      setExperiences((previous) => [...previous, newExperience]);
    }
    handleCloseDialog();
  }

  function handleDeleteExperience(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this experience entry?",
    );
    if (!confirmed) return;

    setExperiences((previous) => previous.filter((item) => item.id !== id));
    handleCloseDialog();
  }

  return (
    <>
      <section className={styles.experiencePage}>
        {experiences.length > 0 ? (
          <>
            <div className={styles.topActions}>
              <button
                type="button"
                className={styles.addButton}
                onClick={handleOpenAdd}
              >
                + Add Experience
              </button>
            </div>

            <div className={styles.timeline}>
              {experiences.map((exp) => (
                <div key={exp.id} className={styles.timelineItem}>
                  <div className={styles.timelineMarker} />
                  <span className={styles.dateLabel}>
                    {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                  </span>
                  <ExperienceCard
                    experience={exp}
                    onEdit={() => handleOpenEdit(exp)}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>Got something to share.</h3>
            <button
              type="button"
              className={styles.addButton}
              onClick={handleOpenAdd}
            >
              Add Your Experience
            </button>
          </div>
        )}
      </section>

      {isDialogOpen && (
        <ResumeEntityDialog
          entityType="work_exp"
          entity={editingExperience}
          onSave={handleSaveExperience}
          onDelete={handleDeleteExperience}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

export default Experience;
