import styles from "./Certifications.module.css";
import { useState } from "react";
import CertificationCard from "./CertificationCard";
import ResumeEntityDialog from "../resumeEntity/ResumeEntityDialog";
import sampleCertifications from "../../data/sampleCertifications";

function Certifications() {
  const [certifications, setCertifications] = useState(sampleCertifications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

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

  function handleSave(formData) {
    if (editingCert) {
      setCertifications((previous) =>
        previous.map((item) =>
          item.id === editingCert.id ? { ...item, ...formData } : item,
        ),
      );
    } else {
      const newCert = {
        id: crypto.randomUUID(),
        re_type: "certification",
        ...formData,
      };
      setCertifications((previous) => [...previous, newCert]);
    }
    handleCloseDialog();
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this certification?",
    );
    if (!confirmed) return;

    setCertifications((previous) => previous.filter((item) => item.id !== id));
    handleCloseDialog();
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
                  key={cert.id}
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
          entity={editingCert}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

export default Certifications;
