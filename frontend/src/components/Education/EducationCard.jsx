import styles from "./EducationCard.module.css";

function EducationCard({ education, onEdit }) {
  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }
  return (
    <article className={styles.card}>
      <div className={styles.level}>{education.level}</div>
      <div className={styles.cardHeader}>
        <span className={styles.date}>
          {formatDate(education.startDate)} — {formatDate(education.endDate)}
        </span>

        <button type="button" onClick={onEdit}>
          Edit
        </button>
      </div>

      <div className={styles.cardContent}>
        <h2 className={styles.degree}>{education.degree}</h2>

        <p className={styles.branch}>in {education.branch}</p>

        <p className={styles.institute}>{education.institute}</p>

        <p className={styles.grade}>
          {education.gradingSystem} : {education.grade}
        </p>
      </div>
    </article>
  );
}

export default EducationCard;
