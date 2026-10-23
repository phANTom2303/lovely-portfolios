import styles from "./Skills.module.css";
import { useState } from "react";
import SkillBadge from "../shared/SkillBadge";
import SkillPickerDialog from "../shared/SkillPickerDialog";
import sampleUserSkills from "../../data/sampleSkills";

function Skills() {
  const [skills, setSkills] = useState(sampleUserSkills);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleSaveSkills(updatedSkills) {
    setSkills(updatedSkills);
    setIsDialogOpen(false);
  }

  return (
    <>
      <section className={styles.skillsSection}>
        <div className={styles.card}>
          <div className={styles.skillsGrid}>
            {skills.length > 0 ? (
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
