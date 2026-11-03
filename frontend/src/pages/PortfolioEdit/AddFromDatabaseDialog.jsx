import { useMemo } from "react";
import sampleProjects from "../../data/sampleProjects";
import sampleExperience from "../../data/sampleExperience";
import sampleEducation from "../../data/sampleEducation";
import sampleAchievements from "../../data/sampleAchievements";
import sampleCertifications from "../../data/sampleCertifications";
import sampleExtraCurricular from "../../data/sampleExtraCurricular";
import styles from "./AddFromDatabaseDialog.module.css";

const SECTION_CONFIG = {
  projects: {
    title: "Projects",
    singular: "Project",
    dataset: sampleProjects,
  },
  experience: {
    title: "Work Experience",
    singular: "Experience Entry",
    dataset: sampleExperience,
  },
  education: {
    title: "Education",
    singular: "Academic Record",
    dataset: sampleEducation,
  },
  achievements: {
    title: "Achievements",
    singular: "Achievement",
    dataset: sampleAchievements,
  },
  certifications: {
    title: "Certifications",
    singular: "Certification",
    dataset: sampleCertifications,
  },
  extraCurricular: {
    title: "Extra-Curricular",
    singular: "Activity",
    dataset: sampleExtraCurricular,
  },
};

function getItemTitle(it) {
  if (!it) return "";
  return (it.role || it.title || it.name || it.degree || "").toLowerCase().trim();
}

function convertSampleToDocItem(sectionKey, s) {
  const skillsList = (s.skills || []).map((sk) =>
    typeof sk === "object" ? sk.skill_name || sk.name : String(sk)
  );

  const assetsList = (s.images || s.assets || []).map((ast) => ({
    asset_type: ast.asset_type || ast.type || "image",
    link: ast.url || ast.link || "",
    title: ast.title || "",
    description: ast.description || ast.caption || "",
  }));

  const linksList = (s.links || []).map((l) => ({
    title: l.title || l.label || "Link",
    link: l.url || l.link || "",
  }));

  if (sectionKey === "education") {
    return {
      degree: s.degree || "",
      stream: s.branch || s.stream || "",
      institute_name: s.institute || s.institute_name || "",
      from_date: s.startDate ? `${s.startDate}-01` : (s.from_date || null),
      to_date: s.endDate ? `${s.endDate}-01` : (s.to_date || null),
      grade: s.grade || "",
    };
  }

  if (sectionKey === "achievements") {
    return {
      title: s.role || s.title || s.name || "",
      org: s.company || s.org || s.subtitle || "",
      from_date: s.startDate ? `${s.startDate}-01` : (s.from_date || null),
      to_date: null,
      description: s.description || "",
      skills: skillsList,
      assets: assetsList,
      links: linksList,
    };
  }

  if (sectionKey === "certifications") {
    return {
      title: s.role || s.title || s.name || "",
      org: s.company || s.org || s.subtitle || "",
      from_date: s.startDate ? `${s.startDate}-01` : (s.from_date || null),
      to_date: s.endDate ? `${s.endDate}-01` : (s.to_date || null),
      validUntil: s.endDate ? `${s.endDate}-01` : "Lifetime",
      description: s.description || "",
      skills: skillsList,
      assets: assetsList,
      links: linksList,
    };
  }

  if (sectionKey === "projects") {
    return {
      name: s.role || s.title || s.name || "",
      subtitle: s.company || s.subtitle || s.category || "",
      from_date: s.startDate ? `${s.startDate}-01` : (s.from_date || null),
      to_date: s.isCurrent ? null : (s.endDate ? `${s.endDate}-01` : null),
      description: s.description || "",
      skills: skillsList,
      assets: assetsList,
      links: linksList,
    };
  }

  // experience & extraCurricular
  return {
    role: s.role || s.title || s.name || "",
    company: s.company || s.subtitle || s.org || "",
    from_date: s.startDate ? `${s.startDate}-01` : (s.from_date || null),
    to_date: s.isCurrent ? null : (s.endDate ? `${s.endDate}-01` : null),
    description: s.description || "",
    skills: skillsList,
    assets: assetsList,
    links: linksList,
  };
}

export default function AddFromDatabaseDialog({
  isOpen,
  sectionKey,
  currentItems = [],
  onAdd,
  onClose,
}) {
  const config = SECTION_CONFIG[sectionKey] || SECTION_CONFIG.projects;

  const availableCandidates = useMemo(() => {
    if (!isOpen || !config) return [];
    const currentTitles = new Set(currentItems.map(getItemTitle));
    const allCandidates = config.dataset || [];

    return allCandidates.filter((cand) => {
      const title = getItemTitle(cand);
      return title && !currentTitles.has(title);
    });
  }, [isOpen, config, currentItems]);

  if (!isOpen || !config) return null;

  const handleSelect = (sampleItem) => {
    const formattedItem = convertSampleToDocItem(sectionKey, sampleItem);
    onAdd(formattedItem);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.dialogHeader}>
          <div className={styles.titleArea}>
            <h2 className={styles.dialogTitle}>Add from Profile / Database</h2>
            <span className={styles.dialogSubtitle}>
              Include {config.title} records saved in your account profile that were not selected by AI
            </span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.dialogBody}>
          {availableCandidates.length > 0 ? (
            <div className={styles.candidateList}>
              {availableCandidates.map((cand, idx) => {
                const mainTitle = cand.role || cand.title || cand.name || cand.degree || "Untitled";
                const subtitle = cand.company || cand.org || cand.institute || cand.subtitle || cand.branch || "";
                const dateText = cand.startDate || cand.year || "";
                const descSnippet = cand.description
                  ? cand.description.split("\n")[0].slice(0, 110)
                  : "";

                return (
                  <div key={cand.id || idx} className={styles.candidateCard}>
                    <div className={styles.cardMain}>
                      <div className={styles.cardTitleRow}>
                        <h4 className={styles.cardTitle}>{mainTitle}</h4>
                        {dateText && <span className={styles.cardDate}>{dateText}</span>}
                      </div>
                      {subtitle && <span className={styles.cardSubtitle}>{subtitle}</span>}
                      {descSnippet && <p className={styles.cardDesc}>{descSnippet}...</p>}
                      {Array.isArray(cand.skills) && cand.skills.length > 0 && (
                        <div className={styles.cardSkillsRow}>
                          {cand.skills.slice(0, 4).map((sk) => (
                            <span key={typeof sk === "object" ? sk.skill_name : sk} className={styles.skillPill}>
                              {typeof sk === "object" ? sk.skill_name : sk}
                            </span>
                          ))}
                          {cand.skills.length > 4 && (
                            <span className={styles.moreSkillsPill}>+{cand.skills.length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.addBtn}
                      onClick={() => handleSelect(cand)}
                      title={`Add ${mainTitle} to portfolio`}
                    >
                      <span>+ Add to Portfolio</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3 className={styles.emptyTitle}>All Records Added</h3>
              <p className={styles.emptyDesc}>
                All {config.title.toLowerCase()} from your database profile are already included in this portfolio document.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.dialogFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
