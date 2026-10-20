import styles from "./ProjectInfoModal.module.css";
import SkillBadge from "../shared/SkillBadge";
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

function ProjectInfoModal({ project, onClose }) {
  const [activeImage, setActiveImage] = useState(
    project.images && project.images.length > 0 ? project.images[0] : null,
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="infoModalTitle"
      >
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <h2 id="infoModalTitle" className={styles.title}>
              {project.role || project.title}
            </h2>
            {project.company && (
              <span className={styles.subtitle}>{project.company}</span>
            )}
            <span className={styles.timelineBadge}>
              {formatTimeline(
                project.startDate,
                project.endDate,
                project.isCurrent,
              )}
            </span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          {project.images && project.images.length > 0 && (
            <div className={styles.gallerySection}>
              <div className={styles.activePreviewWrap}>
                <img
                  src={activeImage?.url}
                  alt={activeImage?.title || "Project screenshot"}
                  className={styles.activePreviewImage}
                />
                {activeImage?.title && (
                  <div className={styles.imageCaption}>
                    <span className={styles.imageTitle}>
                      {activeImage.title}
                    </span>
                    {activeImage.description && (
                      <span className={styles.imageDesc}>
                        {activeImage.description}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {project.images.length > 1 && (
                <div className={styles.thumbStrip}>
                  {project.images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      className={`${styles.thumbBtn} ${activeImage?.id === img.id ? styles.thumbActive : ""}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className={styles.thumbImg}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {project.description && (
            <div className={styles.section}>
              <h3 className={styles.sectionHeading}>About the Project</h3>
              <p className={styles.descriptionText}>{project.description}</p>
            </div>
          )}

          {project.keyPoints && (
            <div className={styles.section}>
              <h3 className={styles.sectionHeading}>Key Highlights</h3>
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
            </div>
          )}

          {project.skills && project.skills.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionHeading}>Technologies & Tools</h3>
              <div className={styles.skillsWrap}>
                {project.skills.map((skill) => (
                  <SkillBadge
                    key={skill.skill_id || skill.id}
                    name={skill.skill_name || skill.name}
                    size="small"
                  />
                ))}
              </div>
            </div>
          )}

          {project.links && project.links.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionHeading}>Links & Resources</h3>
              <div className={styles.linksGrid}>
                {project.links.map((link) => (
                  <a
                    key={link.id || link.url}
                    href={link.url || link.link}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.linkItem}
                  >
                    <span>{link.title || link.url}</span>
                    <span className={styles.linkArrow}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectInfoModal;
