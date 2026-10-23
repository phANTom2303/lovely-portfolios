import styles from "./EducationCard.module.css";

function EducationCard({ education, onEdit }) {
  return (
    <article className={styles.card}>
      <div className={styles.level}>{education.level}</div>
      <div className={styles.cardHeader}>
        <div className={styles.titleArea}>
          <h2 className={styles.degree}>{education.degree}</h2>
          <p className={styles.branch}>in {education.branch}</p>
        </div>
        <button
          type="button"
          className={styles.editButton}
          onClick={onEdit}
          aria-label="Edit education"
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

      <div className={styles.cardContent}>
        <p className={styles.institute}>{education.institute}</p>
        <p className={styles.grade}>
          {education.gradingSystem} : {education.grade}
        </p>
      </div>
    </article>
  );
}

export default EducationCard;
