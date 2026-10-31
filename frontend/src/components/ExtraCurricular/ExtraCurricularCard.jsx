import styles from "./ExtraCurricularCard.module.css";
import SkillBadge from "../shared/SkillBadge";

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
  if (start === end) return start;
  return `${start} — ${end}`;
}

function ExtraCurricularCard({ activity, onEdit }) {
  const skills = activity.skills || [];
  const links = activity.links || [];
  const images = activity.images || [];

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleArea}>
          <h3 className={styles.title}>{activity.role || activity.title}</h3>
          {activity.company && (
            <span className={styles.club}>{activity.company}</span>
          )}
          <span className={styles.dateLabel}>
            {formatDateRange(
              activity.startDate,
              activity.endDate,
              activity.isCurrent,
            )}
          </span>
        </div>

        <button
          type="button"
          className={styles.editBtn}
          onClick={onEdit}
          aria-label="Edit activity"
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
          <span>Edit</span>
        </button>
      </div>

      {activity.description && (
        <div className={styles.descBox}>
          <p className={styles.descText}>{activity.description}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.imagesGrid}>
          {images.map((img) => (
            <div
              key={img.id || img.url}
              className={styles.imageWrapper}
              title={img.description ? `${img.title} — ${img.description}` : img.title}
            >
              <img
                src={img.url}
                alt={img.title || "Activity photo"}
                className={styles.imageThumb}
              />
              {(img.title || img.description) && (
                <div className={styles.imageCaption}>
                  {img.title && (
                    <span className={styles.imageTitle}>{img.title}</span>
                  )}
                  {img.description && (
                    <span className={styles.imageDesc}>{img.description}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(skills.length > 0 || links.length > 0) && (
        <div className={styles.cardFooter}>
          {skills.length > 0 && (
            <div className={styles.skillsList}>
              {skills.map((skill) => {
                const id = skill.skill_id || skill.id;
                const name = skill.skill_name || skill.name;
                return <SkillBadge key={id} name={name} size="small" />;
              })}
            </div>
          )}

          {links.length > 0 && (
            <div className={styles.linksRow}>
              {links.map((link) => (
                <a
                  key={link.id || link.url}
                  href={link.url || link.link}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.linkItem}
                >
                  <span>{link.title || link.url}</span>
                  <span>↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default ExtraCurricularCard;
