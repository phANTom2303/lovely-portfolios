import styles from "./CertificationCard.module.css";
import SkillBadge from "../shared/SkillBadge";

function formatDate(dateVal) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function CertificationCard({ certification, onEdit }) {
  const skills = certification.skills || [];
  const links = certification.links || [];
  const images = certification.images || [];

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>
            {certification.role || certification.title}
          </h3>
          {certification.company && (
            <span className={styles.issuer}>{certification.company}</span>
          )}
        </div>

        <button
          type="button"
          className={styles.editBtn}
          onClick={onEdit}
          aria-label="Edit certification"
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
                alt={img.title || "Certification photo"}
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

      {certification.description && (
        <div className={styles.descBox}>
          <p className={styles.descText}>{certification.description}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div className={styles.skillsRow}>
          {skills.map((skill) => {
            const id = skill.skill_id || skill.id;
            const name = skill.skill_name || skill.name;
            return <SkillBadge key={id} name={name} size="small" />;
          })}
        </div>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.datesGroup}>
          <div className={styles.dateCol}>
            <span className={styles.dateLabel}>Issued:</span>
            <span className={styles.dateVal}>
              {formatDate(certification.startDate)}
            </span>
          </div>

          <div className={styles.dateCol}>
            <span className={styles.dateLabel}>Expiry on:</span>
            <span className={styles.dateVal}>
              {certification.endDate
                ? formatDate(certification.endDate)
                : "Lifetime"}
            </span>
          </div>
        </div>

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
    </article>
  );
}

export default CertificationCard;
