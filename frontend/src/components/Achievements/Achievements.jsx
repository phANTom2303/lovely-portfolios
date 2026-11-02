import styles from "./Achievements.module.css";
import { useState, useEffect } from "react";
import AchievementCard from "./AchievementCard";
import ResumeEntityDialog from "../resumeEntity/ResumeEntityDialog";
import {
  fetchResumeEntities,
  createResumeEntity,
  uploadResumeEntityImages,
  updateResumeEntity,
  deleteResumeEntity,
} from "../../api/resumeEntityApi";

function toMonthInput(isoStr) {
  if (!isoStr) return "";
  return isoStr.slice(0, 7);
}

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchResumeEntities("achievements");
        setAchievements(data.filter((item) => item.status !== "deleted"));
      } catch (err) {
        setError("Failed to load achievements. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function handleOpenAdd() {
    setEditingAchievement(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingAchievement(item);
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setEditingAchievement(null);
  }

  async function handleSave(formData) {
    try {
      if (editingAchievement) {
        const payload = {
          re_id: editingAchievement.re_id,
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
        setAchievements((prev) =>
          prev.map((item) =>
            item.re_id === updated.re_id ? { ...item, ...updated } : item,
          ),
        );
      } else {
        const payload = {
          re_type: "achievements",
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
        setAchievements((prev) => [
          ...prev,
          { ...created, assets: uploadedImages },
        ]);
      }
      handleCloseDialog();
    } catch (err) {
      alert("Error saving achievement. Please try again.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this achievement?",
    );
    if (!confirmed) return;

    try {
      await deleteResumeEntity(id);
      setAchievements((prev) => prev.filter((item) => item.re_id !== id));
      handleCloseDialog();
    } catch (err) {
      alert("Error deleting achievement. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <section className={styles.section}>
        <p>Loading achievements...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <>
      <section className={styles.section}>
        {achievements.length > 0 ? (
          <>
            <div className={styles.topActions}>
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleOpenAdd}
              >
                + Add Achievement
              </button>
            </div>

            <div className={styles.grid}>
              {achievements.map((item) => (
                <AchievementCard
                  key={item.re_id}
                  achievement={item}
                  onEdit={() => handleOpenEdit(item)}
                />
              ))}

              <div
                className={styles.addCard}
                onClick={handleOpenAdd}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleOpenAdd()}
              >
                <div className={styles.plusCircle}>
                  <span>+</span>
                </div>
                <span className={styles.addCardLabel}>Add Achievement</span>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.plusCircle}>
              <span>+</span>
            </div>
            <h3 className={styles.emptyTitle}>Proud of an achievement?</h3>
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={handleOpenAdd}
            >
              Add Your Achievement
            </button>
          </div>
        )}
      </section>

      {isDialogOpen && (
        <ResumeEntityDialog
          entityType="achievements"
          entity={
            editingAchievement
              ? {
                  ...editingAchievement,
                  from_date: toMonthInput(editingAchievement.from_date),
                  to_date: toMonthInput(editingAchievement.to_date),
                }
              : null
          }
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

export default Achievements;
