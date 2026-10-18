import styles from "./Projects.module.css";
import { useState } from "react";
import ProjectCard from "./ProjectCard";
import ResumeEntityDialog from "../resumeEntity/ResumeEntityDialog";
import sampleProjects from "../../data/sampleProjects";

function Projects() {
  const [projects, setProjects] = useState(sampleProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  function handleOpenAdd() {
    setEditingProject(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(project) {
    setEditingProject(project);
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setEditingProject(null);
  }

  function handleSaveProject(formData) {
    if (editingProject) {
      setProjects((previous) =>
        previous.map((item) =>
          item.id === editingProject.id ? { ...item, ...formData } : item,
        ),
      );
    } else {
      const newProject = {
        id: crypto.randomUUID(),
        re_type: "project",
        ...formData,
      };
      setProjects((previous) => [...previous, newProject]);
    }
    handleCloseDialog();
  }

  function handleDeleteProject(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project entry?",
    );
    if (!confirmed) return;

    setProjects((previous) => previous.filter((item) => item.id !== id));
    handleCloseDialog();
  }

  return (
    <>
      <section className={styles.projectsSection}>
        {projects.length > 0 ? (
          <>
            <div className={styles.topActions}>
              <button
                type="button"
                className={styles.addProjectBtn}
                onClick={handleOpenAdd}
              >
                + Add Project
              </button>
            </div>

            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => handleOpenEdit(project)}
                />
              ))}

              <div className={styles.ctaCard}>
                <h3 className={styles.ctaTitle}>Build something? Tell us.</h3>
                <button
                  type="button"
                  className={styles.ctaButton}
                  onClick={handleOpenAdd}
                >
                  Add Project
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={`${styles.ctaCard} ${styles.emptyStateCard}`}>
            <h3 className={styles.ctaTitle}>Build something? Tell us.</h3>
            <button
              type="button"
              className={styles.ctaButton}
              onClick={handleOpenAdd}
            >
              Add Project
            </button>
          </div>
        )}
      </section>

      {isDialogOpen && (
        <ResumeEntityDialog
          entityType="project"
          entity={editingProject}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

export default Projects;
