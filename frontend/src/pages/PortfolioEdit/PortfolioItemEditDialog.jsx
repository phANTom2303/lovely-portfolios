import { useState, useMemo } from "react";
import sampleProjects from "../../data/sampleProjects";
import sampleExperience from "../../data/sampleExperience";
import sampleAchievements from "../../data/sampleAchievements";
import sampleCertifications from "../../data/sampleCertifications";
import sampleEducation from "../../data/sampleEducation";
import sampleExtraCurricular from "../../data/sampleExtraCurricular";
import { allSkills, sampleUserSkills } from "../../data/sampleSkills";
import styles from "./PortfolioItemEditDialog.module.css";

const SECTION_LABELS = {
  projects: {
    title: "Project",
    nameLabel: "Project Name",
    subtitleLabel: "Category / Domain",
    namePlaceholder: "e.g. Distributed Analytics Engine",
    subtitlePlaceholder: "e.g. Real-Time Systems, AI Tooling",
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
    namePlaceholder: "e.g. B.Tech Computer Science",
    subtitlePlaceholder: "e.g. Systems & Software Engineering",
    descPlaceholder: "Academic coursework, honors, leadership...",
  },
  achievements: {
    title: "Achievement",
    nameLabel: "Honor / Title",
    subtitleLabel: "Awarding Body / Organization",
    namePlaceholder: "e.g. 1st Place National Hackathon",
    subtitlePlaceholder: "e.g. Tech Foundation",
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
    namePlaceholder: "e.g. Open Source Maintainer",
    subtitlePlaceholder: "e.g. Community Tech Network",
    descPlaceholder: "Initiative details, community contributions...",
  },
};

function toMonthInput(val) {
  if (!val) return "";
  if (typeof val !== "string") return "";
  if (/^\d{4}-\d{2}$/.test(val)) return val;
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
  const searchSub = (item.company || item.subtitle || item.institute_name || item.institution || "").toLowerCase().trim();

  return list.find((s) => {
    if (item.id && s.id === item.id) return true;
    const sName = (s.role || s.title || s.name || s.degree || "").toLowerCase().trim();
    const sSub = (s.company || s.subtitle || s.institute || "").toLowerCase().trim();
    if (searchName && sName === searchName) return true;
    if (searchSub && sSub === searchSub) return true;
    return false;
  });
}

function getInitialFormData(item) {
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

  const name = item.role || item.title || item.name || item.degree || "";
  const subtitle = item.company || item.subtitle || item.category || item.org || item.stream || item.branch || "";
  const institute_name = item.institute_name || item.institution || item.institute || "";
  const startDate = toMonthInput(item.from_date || item.startDate || item.year || "");
  const rawEnd = item.to_date !== undefined ? item.to_date : (item.endDate || item.validUntil);
  const isCurrent = item.isCurrent ?? (rawEnd === null || rawEnd === "Present" || rawEnd === "");
  const endDate = isCurrent ? "" : toMonthInput(rawEnd || "");

  let description = item.description || item.summary || "";
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

  const existingAssets = (item.assets || item.images || []).map((ast, idx) => ({
    id: ast.id || `ast-${idx}`,
    link: ast.link || ast.url || "",
    title: ast.title || "",
    description: ast.description || ast.caption || "",
    asset_type: ast.asset_type || ast.type || "image",
    isDisplayed: true,
  }));

  const sampleAssets = (sampleMatch?.images || sampleMatch?.assets || []).map((ast, idx) => ({
    id: ast.id || `sample-ast-${idx}`,
    link: ast.url || ast.link || "",
    title: ast.title || "",
    description: ast.description || ast.caption || "",
    asset_type: ast.asset_type || ast.type || "image",
    isDisplayed: false,
  }));

  const combinedAssets = [...existingAssets];
  sampleAssets.forEach((sa) => {
    if (sa.link && !combinedAssets.some((ca) => ca.link === sa.link)) {
      combinedAssets.push(sa);
    }
  });

  return combinedAssets;
}

function getInitialLinks(item, sectionKey) {
  if (!item) return [];
  const sampleMatch = findMatchingSampleItem(sectionKey, item);

  const existingLinks = (item.links || []).map((l, idx) => ({
    id: l.id || `link-${idx}`,
    title: l.title || l.label || "Link",
    link: l.link || l.url || "",
    isDisplayed: true,
  }));

  const sampleLinks = (sampleMatch?.links || []).map((l, idx) => ({
    id: l.id || `sample-link-${idx}`,
    title: l.title || l.label || "Link",
    link: l.url || l.link || "",
    isDisplayed: false,
  }));

  const combinedLinks = [...existingLinks];
  sampleLinks.forEach((sl) => {
    if (sl.link && !combinedLinks.some((cl) => cl.link === sl.link)) {
      combinedLinks.push(sl);
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

  const [formData, setFormData] = useState(() => getInitialFormData(item));
  const [displayedSkills, setDisplayedSkills] = useState(() => getInitialSkills(item));
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [assetsPool, setAssetsPool] = useState(() => getInitialAssets(item, sectionKey));
  const [linksPool, setLinksPool] = useState(() => getInitialLinks(item, sectionKey));

  // ── SKILLS POOL COMPUTATION ──
  // Candidate pool contains:
  // 1. All skills from sampleSkills.js (allSkills & sampleUserSkills)
  // 2. All skills from matching sample entity
  const allAvailableCandidateSkills = useMemo(() => {
    const sampleMatch = findMatchingSampleItem(sectionKey, item);
    const set = new Set();

    // From sample match
    (sampleMatch?.skills || []).forEach((s) => {
      const name = typeof s === "object" ? s.skill_name || s.name : s;
      if (name) set.add(name);
    });

    // From sampleSkills.js
    allSkills.forEach((s) => {
      if (s.skill_name) set.add(s.skill_name);
    });
    sampleUserSkills.forEach((s) => {
      if (s.skill_name) set.add(s.skill_name);
    });

    return Array.from(set).sort();
  }, [sectionKey, item]);

  // Available skills that are NOT currently displayed
  const availableSkills = useMemo(() => {
    const displayedSet = new Set(displayedSkills.map((s) => s.toLowerCase()));
    return allAvailableCandidateSkills.filter((s) => {
      if (displayedSet.has(s.toLowerCase())) return false;
      if (skillSearchQuery.trim()) {
        return s.toLowerCase().includes(skillSearchQuery.trim().toLowerCase());
      }
      return true;
    });
  }, [allAvailableCandidateSkills, displayedSkills, skillSearchQuery]);

  if (!isOpen || !item) return null;

  // ── TOGGLE HANDLERS ──
  const handleRemoveSkill = (skillToRemove) => {
    setDisplayedSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleAddSkill = (skillToAdd) => {
    if (!displayedSkills.includes(skillToAdd)) {
      setDisplayedSkills((prev) => [...prev, skillToAdd]);
    }
  };

  const handleToggleAsset = (assetId) => {
    setAssetsPool((prev) =>
      prev.map((ast) =>
        ast.id === assetId ? { ...ast, isDisplayed: !ast.isDisplayed } : ast
      )
    );
  };

  const handleUpdateAssetTitle = (assetId, newTitle) => {
    setAssetsPool((prev) =>
      prev.map((ast) =>
        ast.id === assetId ? { ...ast, title: newTitle } : ast
      )
    );
  };

  const handleToggleLink = (linkId) => {
    setLinksPool((prev) =>
      prev.map((l) =>
        l.id === linkId ? { ...l, isDisplayed: !l.isDisplayed } : l
      )
    );
  };

  const handleUpdateLinkTitle = (linkId, newTitle) => {
    setLinksPool((prev) =>
      prev.map((l) =>
        l.id === linkId ? { ...l, title: newTitle } : l
      )
    );
  };

  const handleUpdateLinkUrl = (linkId, newUrl) => {
    setLinksPool((prev) =>
      prev.map((l) =>
        l.id === linkId ? { ...l, link: newUrl } : l
      )
    );
  };

  // ── SAVE HANDLER ──
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Only include displayed assets
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

    // Only include displayed links
    const activeLinks = linksPool
      .filter((l) => l.isDisplayed)
      .map((l) => ({
        id: l.id,
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

    const updatedItem = {
      ...item,
      // Title variants
      role: formData.name,
      title: formData.name,
      name: formData.name,
      degree: formData.name,
      // Subtitle variants
      company: formData.subtitle,
      subtitle: formData.subtitle,
      category: formData.subtitle,
      org: formData.subtitle,
      stream: formData.subtitle,
      branch: formData.subtitle,
      institute_name: formData.institute_name || formData.subtitle,
      institution: formData.institute_name || formData.subtitle,
      // Education specific
      grade: formData.grade,
      gradingSystem: formData.gradingSystem,
      level: formData.level,
      // Dates
      from_date: formData.startDate || null,
      to_date: formData.isCurrent ? "Present" : (formData.endDate || null),
      startDate: formData.startDate,
      endDate: formData.isCurrent ? "Present" : formData.endDate,
      isCurrent: formData.isCurrent,
      year: formData.startDate ? formData.startDate.slice(0, 4) : undefined,
      validUntil: formData.isCurrent ? "Lifetime" : formData.endDate,
      // Description
      description: formData.description,
      summary: formData.description,
      highlights: highlightsArray,
      tagline: formData.description ? formData.description.split("\n")[0].slice(0, 80) : "",
      // Toggled Skills, Assets & Links
      skills: displayedSkills,
      assets: activeAssets,
      images: activeAssets,
      links: activeLinks,
    };

    onSave(updatedItem);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleFormSubmit}>
          {/* Header */}
          <div className={styles.dialogHeader}>
            <div className={styles.titleArea}>
              <h2 className={styles.headerTitle}>Edit {config.title}</h2>
              <span className={styles.headerSubtitle}>
                Customize displayed details, toggle skills, and select media attachments.
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
                    {sectionKey === "education" ? "Institution Name *" : `${config.subtitleLabel} *`}
                  </label>
                  <input
                    type="text"
                    required
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
                      placeholder="e.g. Computer Science"
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
                      {sectionKey === "certifications" ? "Lifetime Validity" : "Currently Active / Present"}
                    </span>
                  </label>
                </div>
              </div>

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

            {/* 2. Skills Display Toggling (Not applicable to education) */}
            {sectionKey !== "education" && (
              <div className={styles.sectionBlock}>
                <div className={styles.sectionBlockTitle}>
                  <span>Skills & Technologies</span>
                  <span className={styles.sectionBlockHint}>
                    Toggle which existing skills are displayed
                  </span>
                </div>

                <div className={styles.skillsContainer}>
                  {/* Displayed Skills */}
                  <div className={styles.activeSkillsGroup}>
                    <span className={styles.subLabel}>
                      Displayed on Portfolio ({displayedSkills.length})
                    </span>
                    <div className={styles.chipsWrap}>
                      {displayedSkills.length > 0 ? (
                        displayedSkills.map((skill, idx) => (
                          <span key={idx} className={styles.displayedChip}>
                            <span>{skill}</span>
                            <button
                              type="button"
                              className={styles.removeChipBtn}
                              onClick={() => handleRemoveSkill(skill)}
                              title={`Hide "${skill}" from portfolio`}
                              aria-label={`Hide ${skill}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className={styles.emptyChips}>
                          No skills currently displayed. Click below to add from existing profile information.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Available Skills from Profile */}
                  <div className={styles.activeSkillsGroup}>
                    <span className={styles.subLabel}>
                      Add from Existing Information ({availableSkills.length} available)
                    </span>
                    <div className={styles.searchAvailableBox}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Search existing skills to display..."
                        value={skillSearchQuery}
                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className={styles.availableChipsList}>
                      {availableSkills.map((skill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={styles.availableChip}
                          onClick={() => handleAddSkill(skill)}
                        >
                          <span className={styles.addIcon}>+</span>
                          <span>{skill}</span>
                        </button>
                      ))}
                      {availableSkills.length === 0 && (
                        <span className={styles.emptyChips}>
                          {skillSearchQuery ? "No matching skills." : "All existing skills are currently displayed."}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Images & Media Display Toggling */}
            {assetsPool.length > 0 && (
              <div className={styles.sectionBlock}>
                <div className={styles.sectionBlockTitle}>
                  <span>Attached Media & Visuals</span>
                  <span className={styles.sectionBlockHint}>
                    Choose which images appear in the portfolio gallery
                  </span>
                </div>

                <div className={styles.imagesGrid}>
                  {assetsPool.map((ast) => (
                    <div
                      key={ast.id}
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
                          placeholder="Caption / Title"
                          value={ast.title}
                          onChange={(e) => handleUpdateAssetTitle(ast.id, e.target.value)}
                        />
                        <button
                          type="button"
                          className={`${styles.toggleDisplayBtn} ${
                            ast.isDisplayed ? styles.toggleDisplayed : styles.toggleHidden
                          }`}
                          onClick={() => handleToggleAsset(ast.id)}
                        >
                          {ast.isDisplayed ? "✓ Displayed in Portfolio" : "+ Not Displayed (Click to Show)"}
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
                  <span className={styles.sectionBlockHint}>
                    Live demo, code repo, and credential links
                  </span>
                </div>

                <div className={styles.linksList}>
                  {linksPool.map((l) => (
                    <div key={l.id} className={styles.linkRow}>
                      <button
                        type="button"
                        className={`${styles.linkToggleBtn} ${
                          l.isDisplayed ? styles.linkToggleBtnActive : ""
                        }`}
                        onClick={() => handleToggleLink(l.id)}
                      >
                        {l.isDisplayed ? "✓ Displayed" : "Hidden"}
                      </button>
                      <input
                        type="text"
                        style={{ width: "160px" }}
                        className={styles.input}
                        placeholder="Link Label"
                        value={l.title}
                        onChange={(e) => handleUpdateLinkTitle(l.id, e.target.value)}
                      />
                      <input
                        type="text"
                        style={{ flex: 1 }}
                        className={styles.input}
                        placeholder="https://..."
                        value={l.link}
                        onChange={(e) => handleUpdateLinkUrl(l.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
