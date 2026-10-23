import styles from "./ExperienceCard.module.css";
import SkillBadge from "../shared/SkillBadge";

function ExperienceCard({ experience, onEdit }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleArea}>
          <h2 className={styles.role}>{experience.role}</h2>
          <span className={styles.company}>{experience.company}</span>
        </div>
        <button
          type="button"
          className={styles.editButton}
          onClick={onEdit}
          aria-label="Edit experience"
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

      {experience.description && (
        <p className={styles.description}>{experience.description}</p>
      )}

      {experience.links?.length > 0 && (
        <div className={styles.linksSection}>
          {experience.links.map((link) => (
            <a
              key={link.id}
              href={link.url || link.link}
              target="_blank"
              rel="noreferrer"
              className={styles.linkPill}
            >
              <span>{link.title}</span>
              <span aria-hidden="true">&#8599;</span>
            </a>
          ))}
        </div>
      )}

      {experience.images?.length > 0 && (
        <div className={styles.imagesSection}>
          {experience.images.map((img) => (
            <div key={img.id} className={styles.imagePreview} title={img.title}>
              <img src={img.url} alt={img.title} />
            </div>
          ))}
        </div>
      )}

      {experience.skills?.length > 0 && (
        <div className={styles.skillsSection}>
          {experience.skills.map((skill) => {
            const id = skill.skill_id || skill.id;
            const name = skill.skill_name || skill.name;
            return <SkillBadge key={id} name={name} size="small" />;
          })}
        </div>
      )}
    </article>
  );
}

export default ExperienceCard;
