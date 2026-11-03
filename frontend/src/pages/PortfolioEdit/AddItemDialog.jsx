import { useState, useMemo } from "react";
import sampleProjects from "../../data/sampleProjects";
import sampleExperience from "../../data/sampleExperience";
import sampleEducation from "../../data/sampleEducation";
import sampleAchievements from "../../data/sampleAchievements";
import sampleCertifications from "../../data/sampleCertifications";
import sampleExtraCurricular from "../../data/sampleExtraCurricular";
import styles from "./AddItemDialog.module.css";

const SECTION_CONFIG = {
  projects: {
    name: "Project",
    titleLabel: "Project Name (Title)",
    titlePlaceholder: "e.g. Distributed Analytics Engine",
    subtitleLabel: "Category / Domain (Subtitle)",
    subtitlePlaceholder: "e.g. Real-time Telemetry, AI Tooling",
    dataSource: sampleProjects,
    transform: (p) => ({
      name: p.role || p.title || p.name || "New Project",
      title: p.role || p.title || p.name || "New Project",
      subtitle: p.company || p.subtitle || "",
      tagline: p.tagline || (p.description ? p.description.split("\n")[0].slice(0, 80) : ""),
      description: p.description || "",
      skills: (p.skills || []).map((s) => (typeof s === "object" ? s.skill_name || s.name : s)),
      assets: (p.images || p.assets || []).map((img) => ({
        type: "image",
        url: img.url,
        title: img.title || "",
        caption: img.description || img.caption || "",
      })),
      links: (p.links || []).map((l) => ({
        label: l.title || l.label || "Link",
        url: l.url || l.link || "",
      })),
    }),
  },
  experience: {
    name: "Work Experience",
    titleLabel: "Role / Position (Title)",
    titlePlaceholder: "e.g. Senior Backend Engineer",
    subtitleLabel: "Company / Employer (Subtitle)",
    subtitlePlaceholder: "e.g. Google",
    dataSource: sampleExperience,
    transform: (e) => ({
      role: e.role || e.title || "Software Engineer",
      title: e.role || e.title || "Software Engineer",
      company: e.company || e.subtitle || "",
      subtitle: e.company || e.subtitle || "",
      startDate: e.startDate || "2023",
      endDate: e.endDate || (e.isCurrent ? "Present" : ""),
      highlights: Array.isArray(e.highlights) && e.highlights.length > 0
        ? e.highlights
        : (e.description || "")
            .split("\n")
            .map((s) => s.replace(/^[•\-*]\s*/, "").trim())
            .filter(Boolean),
      skills: (e.skills || []).map((s) => (typeof s === "object" ? s.skill_name || s.name : s)),
      assets: (e.images || e.assets || []).map((img) => ({
        type: "image",
        url: img.url,
        title: img.title || "",
        caption: img.description || img.caption || "",
      })),
      links: (e.links || []).map((l) => ({
        label: l.title || l.label || "Link",
        url: l.url || l.link || "",
      })),
    }),
  },
  education: {
    name: "Education",
    titleLabel: "Degree / Program (Title)",
    titlePlaceholder: "e.g. B.Tech",
    subtitleLabel: "Stream / Field of Study (Subtitle)",
    subtitlePlaceholder: "e.g. Computer Science & Engineering",
    dataSource: sampleEducation,
    transform: (edu) => ({
      degree: edu.degree || edu.level || "Degree",
      stream: edu.branch || edu.stream || "",
      subtitle: edu.branch || edu.stream || "",
      institution: edu.institute || edu.institution || "",
      startDate: edu.startDate || "2023",
      endDate: edu.endDate || "2027",
      grade: edu.grade ? (edu.gradingSystem ? `${edu.gradingSystem} ${edu.grade}` : edu.grade) : "",
    }),
  },
  achievements: {
    name: "Achievement",
    titleLabel: "Honor / Award Title (Title)",
    titlePlaceholder: "e.g. 1st Place — Global Hackathon",
    subtitleLabel: "Awarder / Organization (Subtitle)",
    subtitlePlaceholder: "e.g. AWS & Devpost",
    dataSource: sampleAchievements,
    transform: (a) => ({
      title: a.title || a.role || "Achievement",
      org: a.org || a.company || a.subtitle || "",
      subtitle: a.org || a.company || a.subtitle || "",
      year: a.year || (a.startDate ? a.startDate.slice(0, 4) : "2024"),
      summary: a.description || a.summary || "",
      skills: (a.skills || []).map((s) => (typeof s === "object" ? s.skill_name || s.name : s)),
      assets: (a.images || a.assets || []).map((img) => ({
        type: "image",
        url: img.url,
        title: img.title || "",
        caption: img.description || img.caption || "",
      })),
    }),
  },
  certifications: {
    name: "Certification",
    titleLabel: "Certification Name (Title)",
    titlePlaceholder: "e.g. AWS Solutions Architect Associate",
    subtitleLabel: "Issuing Authority (Subtitle)",
    subtitlePlaceholder: "e.g. Amazon Web Services",
    dataSource: sampleCertifications,
    transform: (c) => ({
      title: c.title || c.role || "Certification",
      org: c.org || c.company || c.subtitle || "",
      subtitle: c.org || c.company || c.subtitle || "",
      year: c.year || (c.startDate ? c.startDate.slice(0, 4) : "2024"),
      validUntil: c.validUntil || c.endDate || "Lifetime",
      link: c.link || c.verifyUrl || (c.links && c.links[0] ? c.links[0].url : ""),
    }),
  },
  extraCurricular: {
    name: "Extra-Curricular Activity",
    titleLabel: "Role / Position (Title)",
    titlePlaceholder: "e.g. Lead Organizer",
    subtitleLabel: "Club / Organization (Subtitle)",
    subtitlePlaceholder: "e.g. Developer Student Club",
    dataSource: sampleExtraCurricular,
    transform: (x) => ({
      role: x.role || x.title || "Community Role",
      title: x.role || x.title || "Community Role",
      org: x.org || x.company || x.subtitle || "",
      subtitle: x.org || x.company || x.subtitle || "",
      startDate: x.startDate || "2023",
      endDate: x.endDate || (x.isCurrent ? "Present" : ""),
      summary: x.description || x.summary || "",
      skills: (x.skills || []).map((s) => (typeof s === "object" ? s.skill_name || s.name : s)),
      assets: (x.images || x.assets || []).map((img) => ({
        type: "image",
        url: img.url,
        title: img.title || "",
        caption: img.description || img.caption || "",
      })),
    }),
  },
};

export default function AddItemDialog({
  isOpen,
  sectionKey,
  existingItems = [],
  onClose,
  onAdd,
  onCreateCustom,
}) {
  const [activeTab, setActiveTab] = useState("library"); // "library" | "custom"

  // Custom form inputs
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [extraField, setExtraField] = useState(""); // institution for edu, tagline for proj
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [textBody, setTextBody] = useState(""); // description or highlights or summary
  const [skillsStr, setSkillsStr] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const config = SECTION_CONFIG[sectionKey] || SECTION_CONFIG.projects;

  // Filter available library items from sample data
  const availableLibraryItems = useMemo(() => {
    if (!config.dataSource || !Array.isArray(config.dataSource)) return [];
    const existingTitles = new Set(
      existingItems.map(
        (item) => (item.title || item.role || item.name || item.degree || "").toLowerCase().trim()
      )
    );

    return config.dataSource
      .filter((raw) => {
        const itemTitle = (raw.role || raw.title || raw.name || raw.degree || "").toLowerCase().trim();
        return !existingTitles.has(itemTitle);
      })
      .map((raw) => ({
        raw,
        transformed: config.transform(raw),
      }));
  }, [config, existingItems]);

  if (!isOpen) return null;

  const handleImport = (transformedItem) => {
    onAdd(transformedItem);
    onClose();
  };

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const skillsArray = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const assetsArray = imageUrl.trim()
      ? [
          {
            type: "image",
            url: imageUrl.trim(),
            title: imageTitle.trim() || title.trim(),
            caption: "",
          },
        ]
      : [];

    const linksArray = linkUrl.trim()
      ? [
          {
            label: linkTitle.trim() || "Link",
            url: linkUrl.trim(),
          },
        ]
      : [];

    let newItem = {};

    if (sectionKey === "projects") {
      newItem = {
        name: title.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        tagline: extraField.trim(),
        description: textBody.trim(),
        skills: skillsArray,
        assets: assetsArray,
        links: linksArray,
      };
    } else if (sectionKey === "experience") {
      newItem = {
        role: title.trim(),
        title: title.trim(),
        company: subtitle.trim(),
        subtitle: subtitle.trim(),
        startDate: startDate.trim(),
        endDate: isCurrent ? null : endDate.trim(),
        highlights: textBody
          .split("\n")
          .map((s) => s.replace(/^[•\-*]\s*/, "").trim())
          .filter(Boolean),
        skills: skillsArray,
        assets: assetsArray,
        links: linksArray,
      };
    } else if (sectionKey === "education") {
      newItem = {
        degree: title.trim(),
        stream: subtitle.trim(),
        subtitle: subtitle.trim(),
        institution: extraField.trim(),
        startDate: startDate.trim(),
        endDate: isCurrent ? "Present" : endDate.trim(),
        grade: textBody.trim(),
      };
    } else if (sectionKey === "achievements") {
      newItem = {
        title: title.trim(),
        org: subtitle.trim(),
        subtitle: subtitle.trim(),
        year: startDate.trim() || new Date().getFullYear().toString(),
        summary: textBody.trim(),
        skills: skillsArray,
        assets: assetsArray,
      };
    } else if (sectionKey === "certifications") {
      newItem = {
        title: title.trim(),
        org: subtitle.trim(),
        subtitle: subtitle.trim(),
        year: startDate.trim() || new Date().getFullYear().toString(),
        validUntil: endDate.trim() || "Lifetime",
        link: linkUrl.trim(),
      };
    } else if (sectionKey === "extraCurricular") {
      newItem = {
        role: title.trim(),
        title: title.trim(),
        org: subtitle.trim(),
        subtitle: subtitle.trim(),
        startDate: startDate.trim(),
        endDate: isCurrent ? null : endDate.trim(),
        summary: textBody.trim(),
        skills: skillsArray,
        assets: assetsArray,
      };
    }

    onAdd(newItem);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <h3 className={styles.modalTitle}>Add {config.name}</h3>
            <p className={styles.modalSubtitle}>
              Select an entry from your profile database or create a custom entry.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.modalTabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "library" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("library")}
          >
            Import from Profile ({availableLibraryItems.length})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "custom" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("custom")}
          >
            Create Custom Entry
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {activeTab === "library" ? (
            <div className={styles.libraryList}>
              {availableLibraryItems.length === 0 ? (
                <div className={styles.emptyLibrary}>
                  All profile entries for this section have already been added to your portfolio.
                  Switch to &quot;Create Custom Entry&quot; to add a new one.
                </div>
              ) : (
                availableLibraryItems.map(({ raw, transformed }, idx) => {
                  const itemTitle = transformed.title || transformed.role || transformed.name || transformed.degree;
                  const itemSubtitle = transformed.subtitle || transformed.company || transformed.stream || transformed.org;
                  const itemDates = transformed.startDate
                    ? `${transformed.startDate} — ${transformed.endDate || "Present"}`
                    : transformed.year || "";
                  const itemAssets = transformed.assets || [];

                  return (
                    <div key={raw.id || idx} className={styles.libraryItem}>
                      <div className={styles.libraryItemInfo}>
                        <div className={styles.libraryItemTitleRow}>
                          <span className={styles.libraryItemTitle}>{itemTitle}</span>
                          {itemSubtitle && (
                            <span className={styles.libraryItemSubtitle}>{itemSubtitle}</span>
                          )}
                          {itemDates && (
                            <span className={styles.libraryItemDates}>({itemDates})</span>
                          )}
                        </div>

                        {transformed.description && (
                          <div className={styles.libraryItemDesc}>{transformed.description}</div>
                        )}
                        {transformed.summary && (
                          <div className={styles.libraryItemDesc}>{transformed.summary}</div>
                        )}

                        {transformed.skills && transformed.skills.length > 0 && (
                          <div className={styles.libraryItemSkills}>
                            {transformed.skills.slice(0, 5).map((s) => (
                              <span key={s} className={styles.skillPill}>{s}</span>
                            ))}
                          </div>
                        )}

                        {itemAssets.length > 0 && (
                          <div className={styles.libraryItemMedia}>
                            {itemAssets.slice(0, 3).map((ast, ai) => (
                              <img
                                key={ai}
                                src={ast.url}
                                alt={ast.title || "thumbnail"}
                                className={styles.libraryThumb}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className={styles.importBtn}
                        onClick={() => handleImport(transformed)}
                      >
                        Add to Portfolio
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          ) : onCreateCustom ? (
            <div className={styles.customPromoCard}>
              <div className={styles.customPromoIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h4 className={styles.customPromoTitle}>Create Custom {config.name}</h4>
              <p className={styles.customPromoDesc}>
                Open the dedicated entry editor to configure title, subtitle, timeline dates, description, links, and media attachments with focused preview.
              </p>
              <button
                type="button"
                className={styles.openEditorBtn}
                onClick={() => {
                  onClose();
                  onCreateCustom(sectionKey);
                }}
              >
                + Open Entry Editor
              </button>
            </div>
          ) : (
            <form id="customItemForm" onSubmit={handleCreateCustom} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{config.titleLabel}</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder={config.titlePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{config.subtitleLabel}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={config.subtitlePlaceholder}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                </div>
              </div>

              {sectionKey === "education" ? (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Institution Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Stanford University"
                    value={extraField}
                    onChange={(e) => setExtraField(e.target.value)}
                  />
                </div>
              ) : sectionKey === "projects" ? (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tagline</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Brief 1-sentence value proposition"
                    value={extraField}
                    onChange={(e) => setExtraField(e.target.value)}
                  />
                </div>
              ) : null}

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Start Date / Year</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. 2023 or Aug 2023"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>End Date / Year</label>
                  <input
                    type="text"
                    className={styles.input}
                    disabled={isCurrent}
                    placeholder="e.g. 2024 or Present"
                    value={isCurrent ? "Present" : endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {(sectionKey === "experience" || sectionKey === "extraCurricular") && (
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#475569", marginTop: "0.25rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isCurrent}
                        onChange={(e) => setIsCurrent(e.target.checked)}
                      />
                      <span>Currently active in this role</span>
                    </label>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {sectionKey === "experience"
                    ? "Highlights (one bullet per line)"
                    : sectionKey === "education"
                    ? "Grade / GPA"
                    : "Description / Summary"}
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  placeholder={
                    sectionKey === "experience"
                      ? "Led data migration improving latency by 35%\nShipped new microservices"
                      : "Brief description of the impact and architecture"
                  }
                />
              </div>

              {sectionKey !== "education" && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Skills / Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. React, TypeScript, PostgreSQL"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                  />
                </div>
              )}

              {/* Image Asset attachment */}
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Image URL (Screenshot / Diagram)</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="https://images.unsplash.com/... or /Images/image.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Image Title / Caption</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Architecture Console"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Link attachment */}
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Link Title</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Live Demo or Source Code"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Link URL</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelModalBtn} onClick={onClose}>
            Close
          </button>
          {activeTab === "custom" && !onCreateCustom && (
            <button type="submit" form="customItemForm" className={styles.submitModalBtn}>
              Add to Portfolio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
