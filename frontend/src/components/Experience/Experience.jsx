import styles from "./Experience.module.css";
import { useState, useEffect } from "react";
import ExperienceCard from "./ExperienceCard";
import ResumeEntityDialog from "../resumeEntity/ResumeEntityDialog";
import {
  fetchResumeEntities,
  createResumeEntity,
  uploadResumeEntityImages,
  updateResumeEntity,
  deleteResumeEntity,
} from "../../api/resumeEntityApi";

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

function toMonthInput(isoStr) {
  if (!isoStr) return "";
  return isoStr.slice(0, 7);
}

function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchResumeEntities("work_exp");
        setExperiences(data.filter((item) => item.status !== "deleted"));
      } catch (err) {
        setError("Failed to load experiences. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

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

  async function handleSaveExperience(formData) {
    try {
      if (editingExperience) {
        const payload = {
          re_id: editingExperience.re_id,
          title: formData.role,
          subtitle: formData.company || null,
          description: formData.description,
          from_date: formData.startDate
            ? formData.startDate.length === 7
              ? `${formData.startDate}-01`
              : formData.startDate
            : null,
          to_date:
            !formData.isCurrent && formData.endDate
              ? formData.endDate.length === 7
                ? `${formData.endDate}-01`
                : formData.endDate
              : null,
        };
        const updated = await updateResumeEntity(payload);
        setExperiences((prev) =>
          prev.map((item) =>
            item.re_id === updated.re_id ? { ...item, ...updated } : item,
          ),
        );
      } else {
        const payload = {
          re_type: "work_exp",
          title: formData.role,
          subtitle: formData.company || null,
          description: formData.description,
          from_date: formData.startDate
            ? formData.startDate.length === 7
              ? `${formData.startDate}-01`
              : formData.startDate
            : null,
          to_date:
            !formData.isCurrent && formData.endDate
              ? formData.endDate.length === 7
                ? `${formData.endDate}-01`
                : formData.endDate
              : null,
          links: formData.links.map((l) => ({
            url: l.url || l.link,
            title: l.title,
            description: l.description || "",
          })),
          skills: formData.skills.map((s) => s.skill_name || s.name || s),
        };
        const created = await createResumeEntity(payload);
        const uploadedImages = await uploadResumeEntityImages(
          formData.images,
          created.re_id,
        );
        setExperiences((prev) => [
          ...prev,
          { ...created, assets: uploadedImages },
        ]);
      }
      handleCloseDialog();
    } catch (err) {
      alert("Error saving experience. Please try again.");
    }
  }

  async function handleDeleteExperience(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this experience entry?",
    );
    if (!confirmed) return;

    try {
      await deleteResumeEntity(id);
      setExperiences((prev) => prev.filter((item) => item.re_id !== id));
      handleCloseDialog();
    } catch (err) {
      alert("Error deleting experience. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <section className={styles.experiencePage}>
        <p>Loading experiences...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.experiencePage}>
        <p>{error}</p>
      </section>
    );
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
                <div key={exp.re_id} className={styles.timelineItem}>
                  <div className={styles.timelineMarker} />
                  <span className={styles.dateLabel}>
                    {formatDateRange(exp.from_date, exp.to_date, exp.isCurrent)}
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
          entity={
            editingExperience
              ? {
                  ...editingExperience,
                  from_date: toMonthInput(editingExperience.from_date),
                  to_date: toMonthInput(editingExperience.to_date),
                }
              : null
          }
          onSave={handleSaveExperience}
          onDelete={handleDeleteExperience}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

export default Experience;
