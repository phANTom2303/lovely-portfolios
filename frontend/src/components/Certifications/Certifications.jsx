import styles from "./Certifications.module.css";
import { useState, useEffect } from "react";
import CertificationCard from "./CertificationCard";
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

function Certifications() {
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchResumeEntities("certification");
        setCertifications(data.filter((item) => item.status !== "deleted"));
      } catch (err) {
        setError("Failed to load certifications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function handleOpenAdd() {
    setEditingCert(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(cert) {
    setEditingCert(cert);
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setEditingCert(null);
  }

  async function handleSave(formData) {
    try {
      if (editingCert) {
        const payload = {
          re_id: editingCert.re_id,
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
        setCertifications((prev) =>
          prev.map((item) =>
            item.re_id === updated.re_id ? { ...item, ...updated } : item,
          ),
        );
      } else {
        const payload = {
          re_type: "certification",
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
        setCertifications((prev) => [...prev, created]);
      }
      handleCloseDialog();
    } catch (err) {
      alert("Error saving certification. Please try again.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this certification?",
    );
    if (!confirmed) return;

    try {
      await deleteResumeEntity(id);
      setCertifications((prev) => prev.filter((item) => item.re_id !== id));
      handleCloseDialog();
    } catch (err) {
      alert("Error deleting certification. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <section className={styles.section}>
        <p>Loading certifications...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <>
      <section className={styles.section}>
        {certifications.length > 0 ? (
          <>
            <div className={styles.topActions}>
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleOpenAdd}
              >
                + Add Certification
              </button>
            </div>

            <div className={styles.grid}>
              {certifications.map((cert) => (
                <CertificationCard
                  key={cert.re_id}
                  certification={cert}
                  onEdit={() => handleOpenEdit(cert)}
                />
              ))}

              <div className={styles.addCard}>
                <h3 className={styles.addCardTitle}>
                  Add More Certifications
                </h3>
                <button
                  type="button"
                  className={styles.addCardBtn}
                  onClick={handleOpenAdd}
                >
                  Add
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyCard}>
            <h3 className={styles.emptyTitle}>Earned a certification?</h3>
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={handleOpenAdd}
            >
              Add Your Certification
            </button>
          </div>
        )}
      </section>

      {isDialogOpen && (
        <ResumeEntityDialog
          entityType="certification"
          entity={
            editingCert
              ? {
                  ...editingCert,
                  from_date: toMonthInput(editingCert.from_date),
                  to_date: toMonthInput(editingCert.to_date),
                }
              : null
          }
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

export default Certifications;
