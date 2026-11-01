import styles from "./ExtraCurricular.module.css";
import { useState } from "react";
import ExtraCurricularCard from "./ExtraCurricularCard";
import ResumeEntityDialog from "../resumeEntity/ResumeEntityDialog";
import sampleExtraCurricular from "../../data/sampleExtraCurricular";

function ExtraCurricular() {
  const [activities, setActivities] = useState(sampleExtraCurricular);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

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

  function handleSave(formData) {
    if (editingActivity) {
      setActivities((previous) =>
        previous.map((item) =>
          item.id === editingActivity.id ? { ...item, ...formData } : item,
        ),
      );
    } else {
      const newActivity = {
        id: crypto.randomUUID(),
        re_type: "extra_curricular",
        ...formData,
      };
      setActivities((previous) => [...previous, newActivity]);
    }
    handleCloseDialog();
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?",
    );
    if (!confirmed) return;

    setActivities((previous) => previous.filter((item) => item.id !== id));
    handleCloseDialog();
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
                  key={item.id}
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
          entity={editingActivity}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

export default ExtraCurricular;
