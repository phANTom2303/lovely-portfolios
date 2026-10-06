import styles from "./Education.module.css";
import EducationCard from "./EducationCard";
import EducationDialog from "./EducationDialog";
import { useState } from "react";

const sampleEducation = [
  {
    id: "edu-1",
    level: "Degree",
    degree: "B.Tech",
    institute: "KIIT",
    branch: "Computer Science",
    gradingSystem: "CGPA",
    grade: "9.0",
    startDate: "2023-08",
    endDate: "2027-06",
  },
  {
    id: "edu-2",
    level: "School",
    degree: "Class XII",
    institute: "XYZ School",
    branch: "Science",
    gradingSystem: "Percentage",
    grade: "91%",
    startDate: "2021-04",
    endDate: "2023-03",
  },
];

function Education() {
  const [education, setEducation] = useState(sampleEducation);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingEducation, setEditingEducation] = useState(null);

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
  function handleDelete() {
    if (!editingEducation) {
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete this education entry?",
    );

    if (!confirmed) {
      return;
    }
    setEducation((previous) =>
      previous.filter((item) => item.id !== editingEducation.id),
    );

    handleClose();
  }

  function handleSave(formData) {
    if (editingEducation) {
      setEducation((previous) =>
        previous.map((item) =>
          item.id === editingEducation.id ? { ...item, ...formData } : item,
        ),
      );
    } else {
      const newEducation = {
        id: crypto.randomUUID(),
        ...formData,
      };

      setEducation((previous) => [...previous, newEducation]);
    }

    handleClose();
  }

  return (
    <section className={styles.educationPage}>
      <div className={styles.timeline}>
        {education.map((item) => (
          <div className={styles.timelineItem} key={item.id}>
            <div className={styles.timelineMarker} />

            <EducationCard education={item} onEdit={() => handleEdit(item)} />
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
