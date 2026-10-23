import styles from "./Achievements.module.css";
import { useState } from "react";
import AchievementCard from "./AchievementCard";
import ResumeEntityDialog from "../resumeEntity/ResumeEntityDialog";
import sampleAchievements from "../../data/sampleAchievements";

function Achievements() {
  const [achievements, setAchievements] = useState(sampleAchievements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);

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

  function handleSave(formData) {
    if (editingAchievement) {
      setAchievements((previous) =>
        previous.map((item) =>
          item.id === editingAchievement.id ? { ...item, ...formData } : item,
        ),
      );
    } else {
      const newAchievement = {
        id: crypto.randomUUID(),
        re_type: "achievements",
        ...formData,
      };
      setAchievements((previous) => [...previous, newAchievement]);
    }
    handleCloseDialog();
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this achievement?",
    );
    if (!confirmed) return;

    setAchievements((previous) => previous.filter((item) => item.id !== id));
    handleCloseDialog();
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
                  key={item.id}
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
          entity={editingAchievement}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

export default Achievements;
