import styles from "./ExtraCurricular.module.css";
import { useState, useEffect } from "react";
import ExtraCurricularCard from "./ExtraCurricularCard";
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

function ExtraCurricular() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchResumeEntities("extra_curricular");
        setActivities(data.filter((item) => item.status !== "deleted"));
      } catch (err) {
        setError("Failed to load activities. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function handleOpenAdd() {
    setEditingActivity(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingActivity(item);
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setEditingActivity(null);
  }

  async function handleSave(formData) {
    try {
      if (editingActivity) {
        const payload = {
          re_id: editingActivity.re_id,
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
        setActivities((prev) =>
          prev.map((item) =>
            item.re_id === updated.re_id ? { ...item, ...updated } : item,
          ),
        );
      } else {
        const payload = {
          re_type: "extra_curricular",
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
        setActivities((prev) => [
          ...prev,
          { ...created, assets: uploadedImages },
        ]);
      }
      handleCloseDialog();
    } catch (err) {
      alert("Error saving activity. Please try again.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?",
    );
    if (!confirmed) return;

    try {
      await deleteResumeEntity(id);
      setActivities((prev) => prev.filter((item) => item.re_id !== id));
      handleCloseDialog();
    } catch (err) {
      alert("Error deleting activity. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <section className={styles.section}>
        <p>Loading activities...</p>
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
        {activities.length > 0 ? (
          <>
            <div className={styles.topActions}>
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleOpenAdd}
              >
                + Add Activity
              </button>
            </div>

            <div className={styles.grid}>
              {activities.map((item) => (
                <ExtraCurricularCard
                  key={item.re_id}
                  activity={item}
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
                <span className={styles.addCardLabel}>Add More Activities</span>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.plusCircle}>
              <span>+</span>
            </div>
            <h3 className={styles.emptyTitle}>Involved in activities?</h3>
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={handleOpenAdd}
            >
              Add Your First Activity
            </button>
          </div>
        )}
      </section>

      {isDialogOpen && (
        <ResumeEntityDialog
          entityType="extra_curricular"
          entity={
            editingActivity
              ? {
                  ...editingActivity,
                  from_date: toMonthInput(editingActivity.from_date),
                  to_date: toMonthInput(editingActivity.to_date),
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

export default ExtraCurricular;
