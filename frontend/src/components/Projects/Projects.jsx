import styles from "./Projects.module.css";
import { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import ResumeEntityDialog from "../resumeEntity/ResumeEntityDialog";
import {
  fetchResumeEntities,
  createResumeEntity,
  updateResumeEntity,
  deleteResumeEntity,
} from "../../api/resumeEntityApi";

function toMonthInput(isoStr) {
  if (!isoStr) return "";
  return isoStr.slice(0, 7);
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchResumeEntities("project");
        setProjects(data.filter((item) => item.status !== "deleted"));
      } catch (err) {
        setError("Failed to load projects. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

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

  async function handleSaveProject(formData) {
    try {
      if (editingProject) {
        const payload = {
          re_id: editingProject.re_id,
          title: formData.role,
          subtitle: formData.company || null,
          description: formData.description,
          from_date: formData.startDate
            ? formData.startDate.length === 7
              ? `${formData.startDate}-01`
              : formData.startDate
            : null,
          to_date:
            !formData.isCurrent && formData.endDate
              ? formData.endDate.length === 7
                ? `${formData.endDate}-01`
                : formData.endDate
              : null,
        };
        const updated = await updateResumeEntity(payload);
        setProjects((prev) =>
          prev.map((item) =>
            item.re_id === updated.re_id ? { ...item, ...updated } : item,
          ),
        );
      } else {
        const payload = {
          re_type: "project",
          title: formData.role,
          subtitle: formData.company || null,
          description: formData.description,
          from_date: formData.startDate
            ? formData.startDate.length === 7
              ? `${formData.startDate}-01`
              : formData.startDate
            : null,
          to_date:
            !formData.isCurrent && formData.endDate
              ? formData.endDate.length === 7
                ? `${formData.endDate}-01`
                : formData.endDate
              : null,
          links: formData.links.map((l) => ({
            url: l.url || l.link,
            title: l.title,
            description: l.description || "",
          })),
          assets: formData.images.map((img) => ({
            title: img.title || "",
            asset_type: "image",
            link: img.url || img.link,
            description: img.description || "",
          })),
          skills: formData.skills.map((s) => s.skill_name || s.name || s),
        };
        const created = await createResumeEntity(payload);
        setProjects((prev) => [...prev, created]);
      }
      handleCloseDialog();
    } catch (err) {
      alert("Error saving project. Please try again.");
    }
  }

  async function handleDeleteProject(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project entry?",
    );
    if (!confirmed) return;

    try {
      await deleteResumeEntity(id);
      setProjects((prev) => prev.filter((item) => item.re_id !== id));
      handleCloseDialog();
    } catch (err) {
      alert("Error deleting project. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <section className={styles.projectsSection}>
        <p>Loading projects...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.projectsSection}>
        <p>{error}</p>
      </section>
    );
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
                  key={project.re_id}
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
          entity={
            editingProject
              ? {
                  ...editingProject,
                  from_date: toMonthInput(editingProject.from_date),
                  to_date: toMonthInput(editingProject.to_date),
                }
              : null
          }
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

export default Projects;
