import styles from "./ProjectCard.module.css";
import SkillBadge from "../shared/SkillBadge";
import ProjectLinksModal from "./ProjectLinksModal";
import ProjectInfoModal from "./ProjectInfoModal";
import { useState } from "react";

function formatTimeline(startDate, endDate, isCurrent) {
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

function ProjectCard({ project, onEdit }) {
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const skills = project.skills || [];
  const links = project.links || [];

  return (
    <>
      <article className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.titleGroup}>
            <h3 className={styles.projectTitle}>
              {project.role || project.title}
            </h3>
            {project.company && (
              <span className={styles.projectSubtitle}>{project.company}</span>
            )}
            <span className={styles.timelineLabel}>
              {formatTimeline(
                project.startDate,
                project.endDate,
                project.isCurrent,
              )}
            </span>
          </div>

          <div className={styles.topActions}>
            <button
              type="button"
              className={styles.infoButton}
              onClick={() => setIsInfoOpen(true)}
            >
              More info
            </button>
            <button
              type="button"
              className={styles.linksButton}
              onClick={() => setIsLinksOpen(true)}
            >
              View links{links.length > 0 ? ` (${links.length})` : ""}
            </button>
          </div>
        </div>

        <div className={styles.cardBody}>
          {project.description && (
            <div className={styles.descriptionBox}>
              <p className={styles.descriptionText}>{project.description}</p>
            </div>
          )}

          {project.keyPoints && (
            <div className={styles.keyPointsBox}>
              {project.keyPoints.split("\n").map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                return (
                  <div key={idx} className={styles.keyPointLine}>
                    {trimmed.startsWith("•") ? trimmed : `• ${trimmed}`}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.skillsList}>
            {skills.map((skill) => {
              const id = skill.skill_id || skill.id;
              const name = skill.skill_name || skill.name;
              return <SkillBadge key={id} name={name} size="small" />;
            })}
          </div>

          <button
            type="button"
            className={styles.editButton}
            onClick={onEdit}
            aria-label="Edit project"
          >
            <svg
              width="13"
              height="13"
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
            <span>Edit Project</span>
          </button>
        </div>
      </article>

      {isLinksOpen && (
        <ProjectLinksModal
          projectName={project.role || project.title}
          links={links}
          onClose={() => setIsLinksOpen(false)}
        />
      )}

      {isInfoOpen && (
        <ProjectInfoModal
          project={project}
          onClose={() => setIsInfoOpen(false)}
        />
      )}
    </>
  );
}

export default ProjectCard;
