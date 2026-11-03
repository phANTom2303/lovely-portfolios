import { useState, useMemo } from "react";
import sampleProjects from "../../data/sampleProjects";
import sampleExperience from "../../data/sampleExperience";
import sampleAchievements from "../../data/sampleAchievements";
import sampleCertifications from "../../data/sampleCertifications";
import sampleEducation from "../../data/sampleEducation";
import sampleExtraCurricular from "../../data/sampleExtraCurricular";
import SkillBadge from "../../components/shared/SkillBadge";
import ItemSkillsPickerDialog from "./ItemSkillsPickerDialog";
import styles from "./PortfolioItemEditDialog.module.css";

const SECTION_LABELS = {
  projects: {
    title: "Project",
    nameLabel: "Project Name",
    subtitleLabel: "Category / Domain",
    namePlaceholder: "e.g. Distributed Analytics Engine",
    subtitlePlaceholder: "e.g. Real-Time Systems, AI Tooling (optional)",
    descPlaceholder: "Project architecture, challenges solved, and key technical impact...",
  },
  experience: {
    title: "Work Experience",
    nameLabel: "Role / Position",
    subtitleLabel: "Company / Organization",
    namePlaceholder: "e.g. Senior Backend Engineer",
    subtitlePlaceholder: "e.g. Google, Microsoft",
    descPlaceholder: "Key achievements, responsibilities, and architectural milestones...",
  },
  education: {
    title: "Education",
    nameLabel: "Degree / Program",
    subtitleLabel: "Branch / Field of Study",
    namePlaceholder: "e.g. B.Tech, Master of Science",
    subtitlePlaceholder: "e.g. Computer Science & Engineering",
    descPlaceholder: "Academic coursework, honors, leadership...",
  },
  achievements: {
    title: "Achievement",
    nameLabel: "Honor / Title",
    subtitleLabel: "Awarding Body / Organization",
    namePlaceholder: "e.g. 1st Place National Hackathon",
    subtitlePlaceholder: "e.g. AWS & Devpost (optional)",
    descPlaceholder: "Scope of recognition, criteria, and outcomes...",
  },
  certifications: {
    title: "Certification",
    nameLabel: "Credential Name",
    subtitleLabel: "Issuing Organization",
    namePlaceholder: "e.g. AWS Certified Solutions Architect",
    subtitlePlaceholder: "e.g. Amazon Web Services",
    descPlaceholder: "Validated competencies and credential details...",
  },
  extraCurricular: {
    title: "Extra-Curricular Activity",
    nameLabel: "Role / Initiative",
    subtitleLabel: "Organization / Community",
    namePlaceholder: "e.g. President & Lead Organizer",
    subtitlePlaceholder: "e.g. Google Developer Student Club",
    descPlaceholder: "Initiative details, community contributions...",
  },
};

function toMonthInput(val) {
  if (!val) return "";
  if (typeof val !== "string") return "";
  if (/^\d{4}-\d{2}/.test(val)) return val.slice(0, 7);
  if (/^\d{4}$/.test(val)) return `${val}-01`;
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }
  return "";
}

function findMatchingSampleItem(sectionKey, item) {
  if (!item) return null;
  const datasets = {
    projects: sampleProjects,
    experience: sampleExperience,
    achievements: sampleAchievements,
    certifications: sampleCertifications,
    education: sampleEducation,
    extraCurricular: sampleExtraCurricular,
  };
  const list = datasets[sectionKey] || [];
  const searchName = (item.role || item.title || item.name || item.degree || "").toLowerCase().trim();
  const searchSub = (item.company || item.subtitle || item.institute_name || item.institution || item.org || "").toLowerCase().trim();

  return list.find((s) => {
    if (item.id && s.id === item.id) return true;
    const sName = (s.role || s.title || s.name || s.degree || "").toLowerCase().trim();
    const sSub = (s.company || s.subtitle || s.institute || s.org || "").toLowerCase().trim();
    if (searchName && sName === searchName) return true;
    if (searchSub && sSub === searchSub) return true;
    return false;
  });
}

function getInitialFormData(item, sectionKey) {
  if (!item) {
    return {
      name: "",
      subtitle: "",
      institute_name: "",
      grade: "",
      gradingSystem: "CGPA",
      level: "Undergraduate",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    };
  }

  const name = item.degree || item.role || item.title || item.name || "";
  const subtitle = item.stream || item.branch || item.company || item.subtitle || item.category || item.org || "";
  const institute_name = item.institute_name || item.institution || item.institute || item.company || "";
  const startDate = toMonthInput(item.from_date || item.startDate || item.year || "");
  const rawEnd = item.to_date !== undefined ? item.to_date : (item.endDate || item.validUntil);

  let isCurrent;
  if (sectionKey === "achievements") {
    isCurrent = false;
  } else if (sectionKey === "certifications") {
    isCurrent = item.validUntil === "Lifetime" || rawEnd === "Lifetime" || !rawEnd;
  } else {
    isCurrent = item.isCurrent ?? (rawEnd === null || rawEnd === "Present" || rawEnd === "");
  }

  const endDate = isCurrent ? "" : toMonthInput(rawEnd || "");

  let description = item.description || item.summary || "";
  // If an older item had a legacy tagline, merge it into the single description field
  if (item.tagline && typeof item.tagline === "string" && !description.includes(item.tagline.trim())) {
    description = description ? `${item.tagline.trim()}\n\n${description.trim()}` : item.tagline.trim();
  }
  if (!description && Array.isArray(item.highlights)) {
    description = item.highlights.join("\n");
  }

  return {
    name,
    subtitle,
    institute_name,
    grade: item.grade || "",
    gradingSystem: item.gradingSystem || "CGPA",
    level: item.level || "Undergraduate",
    startDate,
    endDate,
    isCurrent,
    description,
  };
}

function getInitialSkills(item) {
  if (!item) return [];
  return (item.skills || []).map((s) =>
    typeof s === "object" ? s.skill_name || s.name : String(s)
  );
}

function getInitialAssets(item, sectionKey) {
  if (!item) return [];
  const sampleMatch = findMatchingSampleItem(sectionKey, item);

  // Existing assets in the item: displayed by default, matched by title
  const existingAssets = (item.assets || item.images || []).map((ast, idx) => ({
    title: ast.title || `Attachment #${idx + 1}`,
    link: ast.link || ast.url || "",
    description: ast.description || ast.caption || "",
    asset_type: ast.asset_type || ast.type || "image",
    isDisplayed: true,
  }));

  const existingTitles = new Set(existingAssets.map((a) => a.title.toLowerCase().trim()));

  // Sample assets from the same entity
  const sampleAssets = (sampleMatch?.images || sampleMatch?.assets || []).map((ast, idx) => ({
    title: ast.title || `Attachment #${idx + 1}`,
    link: ast.url || ast.link || "",
    description: ast.description || ast.caption || "",
    asset_type: ast.asset_type || ast.type || "image",
    isDisplayed: false,
  }));

  const combinedAssets = [...existingAssets];
  sampleAssets.forEach((sa) => {
    const cleanTitle = sa.title.toLowerCase().trim();
    if (sa.link && !existingTitles.has(cleanTitle)) {
      combinedAssets.push(sa);
      existingTitles.add(cleanTitle);
    }
  });

  return combinedAssets;
}

function getInitialLinks(item, sectionKey) {
  if (!item) return [];
  const sampleMatch = findMatchingSampleItem(sectionKey, item);

  // Existing links in item: displayed by default, matched by title
  const existingLinks = (item.links || []).map((l, idx) => ({
    title: l.title || l.label || `Link #${idx + 1}`,
    link: l.link || l.url || "",
    isDisplayed: true,
  }));

  const existingTitles = new Set(existingLinks.map((l) => l.title.toLowerCase().trim()));

  // Sample links from the same entity
  const sampleLinks = (sampleMatch?.links || []).map((l, idx) => ({
    title: l.title || l.label || `Link #${idx + 1}`,
    link: l.url || l.link || "",
    isDisplayed: false,
  }));

  const combinedLinks = [...existingLinks];
  sampleLinks.forEach((sl) => {
    const cleanTitle = sl.title.toLowerCase().trim();
    if (sl.link && !existingTitles.has(cleanTitle)) {
      combinedLinks.push(sl);
      existingTitles.add(cleanTitle);
    }
  });

  return combinedLinks;
}

export default function PortfolioItemEditDialog({
  isOpen,
  sectionKey = "projects",
  item,
  onSave,
  onClose,
  onDelete,
}) {
  const config = SECTION_LABELS[sectionKey] || SECTION_LABELS.projects;

  const [formData, setFormData] = useState(() => getInitialFormData(item, sectionKey));
  const [displayedSkills, setDisplayedSkills] = useState(() => getInitialSkills(item));
  const [isSkillPickerOpen, setIsSkillPickerOpen] = useState(false);
  const [assetsPool, setAssetsPool] = useState(() => getInitialAssets(item, sectionKey));
  const [linksPool, setLinksPool] = useState(() => getInitialLinks(item, sectionKey));

  // Candidate skills belonging to this specific item only
  const allCandidateSkills = useMemo(() => {
    const sampleMatch = findMatchingSampleItem(sectionKey, item);
    const set = new Set();

    (item.skills || []).forEach((s) => {
      const name = typeof s === "object" ? s.skill_name || s.name : s;
      if (name) set.add(name);
    });

    (sampleMatch?.skills || []).forEach((s) => {
      const name = typeof s === "object" ? s.skill_name || s.name : s;
      if (name) set.add(name);
    });

    displayedSkills.forEach((s) => {
      if (s) set.add(s);
    });

    return Array.from(set).sort();
  }, [sectionKey, item, displayedSkills]);

  if (!isOpen || !item) return null;

  // ── SKILL HANDLERS ──
  const handleRemoveSkill = (skillToRemove) => {
    setDisplayedSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // ── TITLE-MATCHED ASSET TOGGLING ──
  const handleToggleAsset = (targetTitle) => {
    setAssetsPool((prev) =>
      prev.map((ast) =>
        ast.title === targetTitle ? { ...ast, isDisplayed: !ast.isDisplayed } : ast
      )
    );
  };

  const handleUpdateAssetTitle = (oldTitle, newTitle) => {
    setAssetsPool((prev) =>
      prev.map((ast) =>
        ast.title === oldTitle ? { ...ast, title: newTitle } : ast
      )
    );
  };

  const handleUpdateAssetDescription = (targetTitle, newDesc) => {
    setAssetsPool((prev) =>
      prev.map((ast) =>
        ast.title === targetTitle ? { ...ast, description: newDesc, caption: newDesc } : ast
      )
    );
  };

  // ── TITLE-MATCHED LINK TOGGLING ──
  const handleToggleLink = (targetTitle) => {
    setLinksPool((prev) =>
      prev.map((l) =>
        l.title === targetTitle ? { ...l, isDisplayed: !l.isDisplayed } : l
      )
    );
  };

  const handleUpdateLinkTitle = (oldTitle, newTitle) => {
    setLinksPool((prev) =>
      prev.map((l) =>
        l.title === oldTitle ? { ...l, title: newTitle } : l
      )
    );
  };

  const handleUpdateLinkUrl = (targetTitle, newUrl) => {
    setLinksPool((prev) =>
      prev.map((l) =>
        l.title === targetTitle ? { ...l, link: newUrl } : l
      )
    );
  };

  // ── SAVE HANDLER ──
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const activeAssets = assetsPool
      .filter((ast) => ast.isDisplayed)
      .map((ast) => ({
        asset_type: ast.asset_type || "image",
        type: ast.asset_type || "image",
        link: ast.link,
        url: ast.link,
        title: ast.title || "",
        description: ast.description || "",
        caption: ast.description || "",
      }));

    const activeLinks = linksPool
      .filter((l) => l.isDisplayed)
      .map((l) => ({
        label: l.title || "Link",
        title: l.title || "Link",
        link: l.link,
        url: l.link,
      }));

    const highlightsArray = formData.description
      ? formData.description
          .split("\n")
          .map((s) => s.replace(/^[•\-*]\s*/, "").trim())
          .filter(Boolean)
      : [];

    let updatedItem;

    if (sectionKey === "education") {
      const fromDateVal = formData.startDate ? `${formData.startDate}-01` : null;
      const toDateVal = formData.isCurrent ? "Present" : (formData.endDate ? `${formData.endDate}-01` : null);

      updatedItem = {
        ...item,
        degree: formData.name,
        title: formData.name,
        name: formData.name,
        institute_name: formData.institute_name,
        institution: formData.institute_name,
        stream: formData.subtitle,
        branch: formData.subtitle,
        subtitle: formData.subtitle,
        company: formData.institute_name,
        grade: formData.grade,
        from_date: fromDateVal,
        to_date: toDateVal,
        startDate: fromDateVal,
        endDate: toDateVal,
        isCurrent: formData.isCurrent,
        description: formData.description,
        summary: formData.description,
        skills: displayedSkills,
        assets: activeAssets,
        images: activeAssets,
        links: activeLinks,
      };
    } else if (sectionKey === "achievements") {
      const dateVal = formData.startDate ? `${formData.startDate}-01` : (item.from_date || null);

      updatedItem = {
        ...item,
        title: formData.name,
        name: formData.name,
        role: formData.name,
        org: formData.subtitle,
        company: formData.subtitle,
        subtitle: formData.subtitle,
        from_date: dateVal,
        to_date: null,
        startDate: dateVal,
        endDate: null,
        isCurrent: false,
        description: formData.description,
        summary: formData.description,
        highlights: highlightsArray,
        skills: displayedSkills,
        assets: activeAssets,
        images: activeAssets,
        links: activeLinks,
      };
    } else if (sectionKey === "certifications") {
      const fromDateVal = formData.startDate ? `${formData.startDate}-01` : null;
      const toDateVal = formData.isCurrent ? "Lifetime" : (formData.endDate ? `${formData.endDate}-01` : null);

      updatedItem = {
        ...item,
        title: formData.name,
        name: formData.name,
        role: formData.name,
        org: formData.subtitle,
        company: formData.subtitle,
        subtitle: formData.subtitle,
        from_date: fromDateVal,
        to_date: toDateVal,
        startDate: fromDateVal,
        endDate: toDateVal,
        isCurrent: formData.isCurrent,
        validUntil: formData.isCurrent ? "Lifetime" : toDateVal,
        description: formData.description,
        summary: formData.description,
        skills: displayedSkills,
        assets: activeAssets,
        images: activeAssets,
        links: activeLinks,
      };
    } else {
      // experience, projects, extraCurricular
      const fromDateVal = formData.startDate ? `${formData.startDate}-01` : null;
      const toDateVal = formData.isCurrent ? "Present" : (formData.endDate ? `${formData.endDate}-01` : null);

      updatedItem = {
        ...item,
        role: formData.name,
        title: formData.name,
        name: formData.name,
        degree: formData.name,
        company: formData.subtitle,
        subtitle: formData.subtitle,
        category: formData.subtitle,
        org: formData.subtitle,
        from_date: fromDateVal,
        to_date: toDateVal,
        startDate: fromDateVal,
        endDate: toDateVal,
        isCurrent: formData.isCurrent,
        description: formData.description,
        summary: formData.description,
        highlights: highlightsArray,
        skills: displayedSkills,
        assets: activeAssets,
        images: activeAssets,
        links: activeLinks,
      };
    }

    delete updatedItem.tagline;
    onSave(updatedItem);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleFormSubmit} className={styles.dialogForm}>
          {/* Header */}
          <div className={styles.dialogHeader}>
            <div className={styles.titleArea}>
              <h2 className={styles.headerTitle}>Edit {config.title}</h2>
              <span className={styles.headerSubtitle}>
                Customize details, toggle displayed skills, and select media attachments.
              </span>
            </div>
            <div className={styles.headerActions}>
              {onDelete && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={onDelete}
                  title="Remove from portfolio"
                >
                  Remove
                </button>
              )}
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
                Save Changes
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={styles.dialogBody}>
            {/* 1. Basic Information */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionBlockTitle}>
                <span>Basic Details</span>
                <span className={styles.sectionBlockHint}>Primary showcase labels</span>
              </div>

              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{config.nameLabel} *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder={config.namePlaceholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {sectionKey === "education" ? "Institution Name *" : config.subtitleLabel}
                  </label>
                  <input
                    type="text"
                    required={sectionKey === "education"}
                    className={styles.input}
                    placeholder={
                      sectionKey === "education"
                        ? "e.g. Stanford University"
                        : config.subtitlePlaceholder
                    }
                    value={
                      sectionKey === "education"
                        ? formData.institute_name
                        : formData.subtitle
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ...(sectionKey === "education"
                          ? { institute_name: e.target.value }
                          : { subtitle: e.target.value }),
                      })
                    }
                  />
                </div>
              </div>

              {/* Education-Specific Metadata */}
              {sectionKey === "education" && (
                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Branch / Field of Study</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Computer Science & Engineering"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Grade / Score</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. CGPA 9.0 / 10.0"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Dates */}
              {sectionKey === "achievements" ? (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Date Awarded / Published</label>
                  <input
                    type="month"
                    className={styles.input}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
              ) : sectionKey === "certifications" ? (
                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Issue Date</label>
                    <input
                      type="month"
                      className={styles.input}
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Expiration Date</label>
                    <input
                      type="month"
                      className={styles.input}
                      disabled={formData.isCurrent}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isCurrent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? "" : formData.endDate,
                          })
                        }
                      />
                      <span>Lifetime Validity / No Expiration</span>
                    </label>
                  </div>
                </div>
              ) : sectionKey === "education" ? (
                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Start Year / Month</label>
                    <input
                      type="month"
                      className={styles.input}
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>End Year / Month (or Expected)</label>
                    <input
                      type="month"
                      className={styles.input}
                      disabled={formData.isCurrent}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isCurrent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? "" : formData.endDate,
                          })
                        }
                      />
                      <span>Currently Enrolled / Ongoing</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Start Date</label>
                    <input
                      type="month"
                      className={styles.input}
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>End Date</label>
                    <input
                      type="month"
                      className={styles.input}
                      disabled={formData.isCurrent}
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isCurrent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? "" : formData.endDate,
                          })
                        }
                      />
                      <span>
                        {sectionKey === "projects" ? "Ongoing / Active Project" : "Currently Active / Present"}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Description & Impact Points</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder={config.descPlaceholder}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* 2. Skills Section with Dedicated Skill Picker Dialog */}
            {sectionKey !== "education" && (
              <div className={styles.sectionBlock}>
                <div className={styles.sectionBlockTitle}>
                  <div className={styles.skillsTitleGroup}>
                    <span>Skills & Technologies</span>
                    <span className={styles.skillsCountBadge}>
                      {displayedSkills.length} displayed
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.manageSkillsBtn}
                    onClick={() => setIsSkillPickerOpen(true)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Edit Skills</span>
                  </button>
                </div>

                <div className={styles.itemSkillsArea}>
                  {displayedSkills.length > 0 ? (
                    displayedSkills.map((skill) => (
                      <SkillBadge
                        key={skill}
                        name={skill}
                        onRemove={() => handleRemoveSkill(skill)}
                      />
                    ))
                  ) : (
                    <p className={styles.emptySkillsHint}>
                      No skills currently displayed for this item. Click &quot;Edit Skills&quot; to pick or restore skills.
                    </p>
                  )}
                </div>

                <ItemSkillsPickerDialog
                  isOpen={isSkillPickerOpen}
                  itemTitle={formData.name || config.title}
                  currentSkills={displayedSkills}
                  candidateSkills={allCandidateSkills}
                  onSave={(newSkills) => setDisplayedSkills(newSkills)}
                  onClose={() => setIsSkillPickerOpen(false)}
                />
              </div>
            )}

            {/* 3. Images & Media Display Toggling */}
            {assetsPool.length > 0 && (
              <div className={styles.sectionBlock}>
                <div className={styles.sectionBlockTitle}>
                  <span>Attached Media & Visuals</span>
                </div>

                <div className={styles.imagesGrid}>
                  {assetsPool.map((ast) => (
                    <div
                      key={ast.title}
                      className={`${styles.imageCard} ${
                        ast.isDisplayed ? styles.imageCardActive : styles.imageCardInactive
                      }`}
                    >
                      <div className={styles.imageThumbWrap}>
                        <img
                          src={ast.link}
                          alt={ast.title || "thumbnail"}
                          className={styles.imageThumb}
                        />
                        <span className={styles.badgeType}>{ast.asset_type}</span>
                      </div>
                      <div className={styles.imageInfo}>
                        <input
                          type="text"
                          className={styles.imageTitleInput}
                          placeholder="Asset Title / Name"
                          value={ast.title}
                          onChange={(e) => handleUpdateAssetTitle(ast.title, e.target.value)}
                        />
                        <input
                          type="text"
                          className={styles.imageTitleInput}
                          placeholder="Image Caption / Description"
                          value={ast.description || ""}
                          onChange={(e) => handleUpdateAssetDescription(ast.title, e.target.value)}
                        />
                        <button
                          type="button"
                          className={`${styles.toggleDisplayBtn} ${
                            ast.isDisplayed ? styles.toggleDisplayed : styles.toggleHidden
                          }`}
                          onClick={() => handleToggleAsset(ast.title)}
                        >
                          {ast.isDisplayed ? "✓ Displayed in Portfolio" : "+ Hidden (Click to Show)"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Links Display Toggling */}
            {linksPool.length > 0 && (
              <div className={styles.sectionBlock}>
                <div className={styles.sectionBlockTitle}>
                  <span>Action Links</span>
                </div>

                <div className={styles.linksList}>
                  {linksPool.map((l) => (
                    <div key={l.title} className={styles.linkRow}>
                      <button
                        type="button"
                        className={`${styles.linkToggleBtn} ${
                          l.isDisplayed ? styles.linkToggleBtnActive : ""
                        }`}
                        onClick={() => handleToggleLink(l.title)}
                        title={l.isDisplayed ? "Click to hide link" : "Click to display link"}
                      >
                        {l.isDisplayed ? "✓ Displayed" : "Hidden"}
                      </button>
                      <input
                        type="text"
                        style={{ width: "160px" }}
                        className={styles.input}
                        placeholder="Link Label"
                        value={l.title}
                        onChange={(e) => handleUpdateLinkTitle(l.title, e.target.value)}
                      />
                      <input
                        type="text"
                        style={{ flex: 1 }}
                        className={styles.input}
                        placeholder="https://..."
                        value={l.link}
                        onChange={(e) => handleUpdateLinkUrl(l.title, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.dialogFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
