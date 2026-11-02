import styles from "./Skills.module.css";
import { useState, useEffect } from "react";
import SkillBadge from "../shared/SkillBadge";
import SkillPickerDialog from "../shared/SkillPickerDialog";
import {
  fetchProfileSkills,
  createSkill,
  deleteSkill,
} from "../../api/skillsApi";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchProfileSkills()
      .then((data) => {
        setSkills(data);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load skills. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function handleSaveSkills(newSkills) {
    const originalSkills = skills;

    // Skills with integer IDs already exist in the DB; UUID strings are newly typed
    const toAdd = newSkills.filter((ns) => typeof ns.skill_id !== "number");
    const toRemove = originalSkills.filter(
      (orig) =>
        typeof orig.skill_id === "number" &&
        !newSkills.some((ns) => ns.skill_id === orig.skill_id),
    );

    try {
      // Delete removed skills
      for (const skill of toRemove) {
        await deleteSkill(skill.skill_id);
      }

      // Create newly typed skills (no re_id → profile-level)
      const createdSkills = [];
      for (const skill of toAdd) {
        const created = await createSkill({
          skill_name: skill.skill_name || skill.name,
        });
        createdSkills.push(created);
      }

      // Kept skills = existing DB skills not removed
      const keptSkills = originalSkills.filter(
        (orig) =>
          typeof orig.skill_id === "number" &&
          !toRemove.some((r) => r.skill_id === orig.skill_id),
      );

      setSkills([...keptSkills, ...createdSkills]);
      setError(null);
    } catch {
      setError("Failed to save skills. Please try again.");
    }

    setIsDialogOpen(false);
  }

  return (
    <>
      <section className={styles.skillsSection}>
        <div className={styles.card}>
          <div className={styles.skillsGrid}>
            {isLoading ? (
              <p className={styles.emptyState}>Loading skills…</p>
            ) : error ? (
              <p className={styles.emptyState}>{error}</p>
            ) : skills.length > 0 ? (
              skills.map((skill) => {
                const id = skill.skill_id || skill.id;
                const name = skill.skill_name || skill.name;
                return <SkillBadge key={id} name={name} />;
              })
            ) : (
              <p className={styles.emptyState}>
                No skills added yet. Click &quot;Edit skills&quot; to add your skills.
              </p>
            )}
          </div>

          <div className={styles.cardFooter}>
            <button
              type="button"
              className={styles.editButton}
              onClick={() => setIsDialogOpen(true)}
              aria-label="Edit skills"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              <span>Edit skills</span>
            </button>
          </div>
        </div>
      </section>

      {isDialogOpen && (
        <SkillPickerDialog
          currentSkills={skills}
          onSave={handleSaveSkills}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}

export default Skills;
