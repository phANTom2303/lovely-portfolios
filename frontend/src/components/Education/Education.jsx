import styles from "./Education.module.css";
import EducationCard from "./EducationCard";
import EducationDialog from "./EducationDialog";
import { useEffect, useState } from "react";
import {
  createEducation,
  deleteEducation,
  fetchEducation,
  updateEducation,
} from "../../api/educationApi";

const educationTypeLabels = {
  secondary: "Secondary",
  higher_secondary: "Higher secondary",
  under_graduate: "Undergraduate",
  post_graduate: "Postgraduate",
  diploma: "Diploma",
  phd: "PhD",
};

function toMonthValue(value) {
  return value ? String(value).slice(0, 7) : "";
}

function toEducationItem(item) {
  const marksType = item.mark_type || item.marks_type || "";
  const marks = item.marks === undefined || item.marks === null ? "" : String(item.marks);

  return {
    id: item.education_id,
    level: item.education_type,
    levelLabel: educationTypeLabels[item.education_type] || item.education_type,
    degree: item.degree || "",
    institute: item.institute_name || "",
    branch: item.stream || "",
    gradingSystem: marksType,
    grade: marks,
    totalMark: item.total_mark === undefined || item.total_mark === null ? "" : String(item.total_mark),
    startDate: toMonthValue(item.from_date || item.start_date),
    endDate: toMonthValue(item.to_date || item.end_date),
  };
}

function toNumber(value) {
  const number = Number(String(value).replace("%", "").trim());
  return Number.isFinite(number) ? number : null;
}

function toApiDate(value) {
  return value ? `${value}-01` : value;
}

function toEducationPayload(formData, educationId) {
  const payload = {
    education_type: formData.level,
    institute_name: formData.institute,
    start_date: toApiDate(formData.startDate),
    end_date: toApiDate(formData.endDate),
    marks: toNumber(formData.grade),
    marks_type: formData.gradingSystem.toLowerCase().includes("percent")
      ? "percentage"
      : "gpa",
    total_mark: toNumber(formData.totalMark),
    stream: formData.branch,
  };

  return educationId === undefined ? payload : { edu_id: educationId, ...payload };
}

function formatDateRange(startDate, endDate) {
  function formatMonthYear(val) {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  const start = formatMonthYear(startDate);
  const end = formatMonthYear(endDate);
  if (!start && !end) return "";
  if (!end) return start;
  return `${start} — ${end}`;
}

function Education() {
  const [education, setEducation] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEducation()
      .then((data) => {
        setEducation((Array.isArray(data) ? data : [data]).filter(Boolean).map(toEducationItem));
        setError(null);
      })
      .catch(() => setError("Failed to load education. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  function handleAdd() {
    setEditingEducation(null);
    setIsDialogOpen(true);
  }

  function handleEdit(educationItem) {
    setEditingEducation(educationItem);
    setIsDialogOpen(true);
  }

  function handleClose() {
    setIsDialogOpen(false);
    setEditingEducation(null);
  }

  async function handleDelete() {
    if (!editingEducation) {
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete this education entry?",
    );

    if (!confirmed) {
      return;
    }
    try {
      await deleteEducation(editingEducation.id);
      setEducation((previous) =>
        previous.filter((item) => item.id !== editingEducation.id),
      );
      setError(null);
      handleClose();
    } catch {
      setError("Failed to delete education. Please try again.");
    }
  }

  async function handleSave(formData) {
    try {
      const saved = editingEducation
        ? await updateEducation(toEducationPayload(formData, editingEducation.id))
        : await createEducation(toEducationPayload(formData));
      const savedEducation = toEducationItem({ ...saved, degree: formData.degree });

      setEducation((previous) => {
        if (!editingEducation) return [...previous, savedEducation];
        return previous.map((item) =>
          item.id === editingEducation.id ? savedEducation : item,
        );
      });
      setError(null);
      handleClose();
    } catch {
      setError("Failed to save education. Please check the fields and try again.");
    }
  }

  return (
    <section className={styles.educationPage}>
      <div className={styles.timeline}>
        {isLoading && <p>Loading education...</p>}
        {!isLoading && error && <p>{error}</p>}
        {!isLoading && !error && education.map((item) => (
          <div className={styles.timelineItem} key={item.id}>
            <div className={styles.timelineMarker} />
            <span className={styles.dateLabel}>
              {formatDateRange(item.startDate, item.endDate)}
            </span>
            <EducationCard education={{ ...item, level: item.levelLabel }} onEdit={() => handleEdit(item)} />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className={styles.timelineAdd}
        >
          + Add Education
        </button>
      </div>

      {isDialogOpen && (
        <div className={styles.dialogOverlay}>
          <EducationDialog
            education={editingEducation}
            onSave={handleSave}
            onClose={handleClose}
            onDelete={handleDelete}
          />
        </div>
      )}
    </section>
  );
}

export default Education;
