import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPortfolioByIdOrSlug,
  updatePortfolio,
} from "../../services/portfolioStorage";
import AddItemDialog from "./AddItemDialog";
import ResumeEntityDialog from "../../components/resumeEntity/ResumeEntityDialog";
import EducationDialog from "../../components/Education/EducationDialog";
import SkillBadge from "../../components/shared/SkillBadge";
import styles from "./PortfolioEdit.module.css";

const ALL_SECTION_META = {
  about: { title: "About & Profile", defaultDesc: "Personal info, bio, location, and social links." },
  skills: { title: "Skills", defaultDesc: "Technical capabilities, languages, libraries, and tools." },
  experience: { title: "Work Experience", defaultDesc: "Professional positions, career timeline, and key impacts." },
  projects: { title: "Projects", defaultDesc: "Featured builds and software projects. The first project is showcased as the flagship feature." },
  education: { title: "Education", defaultDesc: "Academic background, degrees, and institutions." },
  achievements: { title: "Achievements", defaultDesc: "Honors, awards, hackathons, and published work." },
  certifications: { title: "Certifications", defaultDesc: "Professional licenses and verified credentials." },
  extraCurricular: { title: "Extra-Curricular", defaultDesc: "Community initiatives, leadership, and volunteer work." },
  contact: { title: "Contact", defaultDesc: "Primary email address and reachout information." },
};

const ALL_SECTION_KEYS = Object.keys(ALL_SECTION_META);

const SECTION_TO_ENTITY_TYPE = {
  experience: "work_exp",
  projects: "project",
  achievements: "achievements",
  certifications: "certification",
  extraCurricular: "extra_curricular",
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

function formatDisplayDate(val) {
  if (!val) return "";
  if (typeof val !== "string") return String(val);
  if (val.toLowerCase() === "present") return "Present";
  if (/^\d{4}$/.test(val)) return val;
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  return val;
}

function prepareEntityForDialog(sectionKey, item) {
  if (!item) return null;
  const entityType = SECTION_TO_ENTITY_TYPE[sectionKey] || "others";
  const role = item.role || item.title || item.name || "";
  const company = item.company || item.subtitle || item.category || item.org || "";
  const startDate = toMonthInput(item.startDate || item.year || item.from_date || "");
  const endDate = toMonthInput(item.endDate || item.validUntil || item.to_date || "");
  const isCurrent = item.isCurrent ?? (item.endDate === null || item.endDate === "Present");

  let description = item.description || "";
  if (!description && Array.isArray(item.highlights)) {
    description = item.highlights.join("\n");
  }
  if (!description && item.summary) {
    description = item.summary;
  }

  const skills = (item.skills || []).map((s, idx) => {
    if (typeof s === "object" && s !== null) {
      return {
        id: s.skill_id || s.id || `skill-${idx}`,
        name: s.skill_name || s.name || "",
        skill_name: s.skill_name || s.name || "",
      };
    }
    return {
      id: `skill-${idx}`,
      name: String(s),
      skill_name: String(s),
    };
  });

  const links = (item.links || []).map((l, idx) => ({
    id: l.id || `link-${idx}`,
    title: l.title || l.label || "Link",
    url: l.url || l.link || "",
    description: l.description || "",
  }));

  const images = (item.images || item.assets || []).map((img, idx) => ({
    id: img.id || `img-${idx}`,
    url: img.url || "",
    title: img.title || "",
    description: img.description || img.caption || "",
  }));

  return {
    id: item.id || crypto.randomUUID(),
    re_type: entityType,
    role,
    company,
    startDate,
    endDate,
    isCurrent,
    description,
    skills,
    links,
    images,
  };
}

function mapFormDataToPortfolioItem(sectionKey, formData) {
  const skillsStrings = (formData.skills || []).map((s) =>
    typeof s === "object" ? s.skill_name || s.name : s
  );

  const assetsArray = (formData.images || []).map((img) => ({
    type: "image",
    url: img.url,
    title: img.title || "",
    caption: img.description || "",
  }));

  const linksArray = (formData.links || []).map((l) => ({
    id: l.id,
    label: l.title || "Link",
    title: l.title || "Link",
    url: l.url || l.link || "",
    description: l.description || "",
  }));

  const highlightsArray = formData.description
    ? formData.description
        .split("\n")
        .map((s) => s.replace(/^[•\-*]\s*/, "").trim())
        .filter(Boolean)
    : [];

  return {
    id: formData.id || crypto.randomUUID(),
    re_type: formData.re_type,
    // Titles & Subtitles with full dual-attribute fallbacks
    title: formData.role,
    role: formData.role,
    name: formData.role,
    subtitle: formData.company,
    company: formData.company,
    org: formData.company,
    category: formData.company,
    // Description variants
    description: formData.description,
    summary: formData.description,
    highlights: highlightsArray,
    tagline: formData.description ? formData.description.split("\n")[0].slice(0, 80) : "",
    // Dates
    startDate: formData.startDate,
    endDate: formData.isCurrent ? "Present" : formData.endDate,
    isCurrent: formData.isCurrent,
    year: formData.startDate ? formData.startDate.slice(0, 4) : new Date().getFullYear().toString(),
    validUntil: formData.endDate || "Lifetime",
    link: linksArray.length > 0 ? linksArray[0].url : "",
    // Skills, Links, Images & Assets
    skills: skillsStrings,
    links: linksArray,
    assets: assetsArray,
    images: formData.images || [],
  };
}

function prepareEducationForDialog(item) {
  if (!item) return null;
  return {
    id: item.id || crypto.randomUUID(),
    degree: item.degree || item.title || "",
    level: item.level || "Undergraduate",
    institute: item.institute || item.institution || "",
    branch: item.branch || item.stream || item.subtitle || "",
    grade: item.grade || "",
    gradingSystem: item.gradingSystem || "CGPA",
    startDate: toMonthInput(item.startDate || ""),
    endDate: toMonthInput(item.endDate || ""),
  };
}

function mapEducationFormDataToItem(formData, originalId) {
  return {
    id: originalId || crypto.randomUUID(),
    degree: formData.degree,
    title: formData.degree,
    level: formData.level,
    institute: formData.institute,
    institution: formData.institute,
    branch: formData.branch,
    stream: formData.branch,
    subtitle: formData.branch,
    grade: formData.grade,
    gradingSystem: formData.gradingSystem,
    startDate: formData.startDate,
    endDate: formData.endDate,
  };
}

export default function PortfolioEdit() {
  const { identifier } = useParams();
  const originalPortfolio = useMemo(
    () => getPortfolioByIdOrSlug(identifier),
    [identifier]
  );

  if (!originalPortfolio) {
    return (
      <div className={styles.pageLayout}>
        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Portfolio Not Found
          </h2>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
            The requested portfolio could not be found.
          </p>
          <Link to="/" className={styles.backBtn}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PortfolioEditorInner
      key={originalPortfolio.id}
      originalPortfolio={originalPortfolio}
    />
  );
}

function PortfolioEditorInner({ originalPortfolio }) {
  // Local draft states initialized from portfolio prop
  const [draftTitle, setDraftTitle] = useState(() => originalPortfolio.title || "");
  const [draftSlug, setDraftSlug] = useState(() => originalPortfolio.slug || "");
  const [draftTheme, setDraftTheme] = useState(() => originalPortfolio.theme || "light");
  const [draftDoc, setDraftDoc] = useState(() =>
    originalPortfolio.document
      ? JSON.parse(JSON.stringify(originalPortfolio.document))
      : {}
  );
  const [isDirty, setIsDirty] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Modal dialog state for adding items
  const [addModalConfig, setAddModalConfig] = useState({
    isOpen: false,
    sectionKey: null,
  });

  // Active edit/create dialog state
  // { type: "resume_entity" | "education", entityType, sectionKey, itemIndex, entity, isNew }
  const [activeModal, setActiveModal] = useState(null);

  // Accordion state
  const [expandedCards, setExpandedCards] = useState(() => ({
    about: true,
    skills: true,
    experience: true,
    projects: true,
    education: true,
    achievements: true,
    certifications: true,
    extraCurricular: true,
    contact: true,
  }));

  const toggleCard = (cardKey) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  // Helper to deep clone doc, mutate, and mark dirty
  const updateDoc = (updater) => {
    setDraftDoc((prevDoc) => {
      const nextDoc = JSON.parse(JSON.stringify(prevDoc || {}));
      updater(nextDoc);
      return nextDoc;
    });
    setIsDirty(true);
  };

  // ── SECTION ORDER (Handled directly in natural document sequence) ──
  const currentSectionOrder = useMemo(() => {
    if (Array.isArray(draftDoc?.sectionOrder) && draftDoc.sectionOrder.length > 0) {
      return draftDoc.sectionOrder;
    }
    return ALL_SECTION_KEYS;
  }, [draftDoc]);

  const moveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentSectionOrder.length) return;
    const nextOrder = [...currentSectionOrder];
    const temp = nextOrder[index];
    nextOrder[index] = nextOrder[targetIndex];
    nextOrder[targetIndex] = temp;
    updateDoc((doc) => {
      doc.sectionOrder = nextOrder;
    });
  };

  const removeSection = (sectionId) => {
    const nextOrder = currentSectionOrder.filter((id) => id !== sectionId);
    updateDoc((doc) => {
      doc.sectionOrder = nextOrder;
    });
  };

  const addSectionBack = (sectionId) => {
    if (!currentSectionOrder.includes(sectionId)) {
      const nextOrder = [...currentSectionOrder, sectionId];
      updateDoc((doc) => {
        doc.sectionOrder = nextOrder;
      });
      setExpandedCards((prev) => ({ ...prev, [sectionId]: true }));
    }
  };

  // Sections that are currently not in sectionOrder
  const hiddenSections = useMemo(() => {
    return ALL_SECTION_KEYS.filter((key) => !currentSectionOrder.includes(key));
  }, [currentSectionOrder]);

  // ── GENERIC ITEM REORDER & DELETE HANDLERS WITHIN SECTIONS ──
  const moveItem = (sectionKey, index, direction) => {
    updateDoc((doc) => {
      const items = doc[sectionKey]?.items;
      if (!Array.isArray(items)) return;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= items.length) return;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
    });
  };

  const deleteItem = (sectionKey, index) => {
    updateDoc((doc) => {
      const items = doc[sectionKey]?.items;
      if (!Array.isArray(items)) return;
      items.splice(index, 1);
    });
  };

  // Add Item through focused dialog
  const handleOpenAddModal = (sectionKey) => {
    setAddModalConfig({ isOpen: true, sectionKey });
  };

  const handleAddItemFromModal = (newItem) => {
    const secKey = addModalConfig.sectionKey;
    if (!secKey) return;
    updateDoc((doc) => {
      if (!doc[secKey]) doc[secKey] = {};
      if (!Array.isArray(doc[secKey].items)) doc[secKey].items = [];
      doc[secKey].items.push(newItem);
    });
  };

  // Open modal in edit mode for existing item
  const handleOpenEditItem = (sectionKey, itemIndex) => {
    const item = draftDoc[sectionKey]?.items?.[itemIndex];
    if (!item) return;

    if (sectionKey === "education") {
      setActiveModal({
        type: "education",
        sectionKey: "education",
        itemIndex,
        entity: prepareEducationForDialog(item),
        isNew: false,
      });
    } else {
      const entityType = SECTION_TO_ENTITY_TYPE[sectionKey] || "work_exp";
      setActiveModal({
        type: "resume_entity",
        entityType,
        sectionKey,
        itemIndex,
        entity: prepareEntityForDialog(sectionKey, item),
        isNew: false,
      });
    }
  };

  // Open modal in create mode for custom entry
  const handleOpenCreateCustom = (sectionKey) => {
    if (sectionKey === "education") {
      setActiveModal({
        type: "education",
        sectionKey: "education",
        itemIndex: null,
        entity: null,
        isNew: true,
      });
    } else {
      const entityType = SECTION_TO_ENTITY_TYPE[sectionKey] || "work_exp";
      setActiveModal({
        type: "resume_entity",
        entityType,
        sectionKey,
        itemIndex: null,
        entity: null,
        isNew: true,
      });
    }
  };

  const handleSaveModal = (formData) => {
    if (!activeModal) return;
    const { type, sectionKey, itemIndex, isNew } = activeModal;

    let updatedItem;
    if (type === "education") {
      const existingId = !isNew && itemIndex !== null ? draftDoc.education?.items?.[itemIndex]?.id : null;
      updatedItem = mapEducationFormDataToItem(formData, existingId);
    } else {
      updatedItem = mapFormDataToPortfolioItem(sectionKey, formData);
    }

    updateDoc((doc) => {
      if (!doc[sectionKey]) doc[sectionKey] = {};
      if (!Array.isArray(doc[sectionKey].items)) doc[sectionKey].items = [];

      if (isNew || itemIndex === null) {
        doc[sectionKey].items.push(updatedItem);
      } else {
        doc[sectionKey].items[itemIndex] = updatedItem;
      }
    });

    setActiveModal(null);
  };

  const handleDeleteFromModal = () => {
    if (!activeModal) return;
    const { sectionKey, itemIndex, isNew } = activeModal;
    if (!isNew && itemIndex !== null) {
      deleteItem(sectionKey, itemIndex);
    }
    setActiveModal(null);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  // ── SAVE ACTION ──
  const handleSave = () => {
    if (!originalPortfolio) return;
    const updated = updatePortfolio(originalPortfolio.id, {
      title: draftTitle,
      slug: draftSlug,
      theme: draftTheme,
      document: draftDoc,
    });
    if (updated) {
      setIsDirty(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!draftDoc) {
    return null;
  }

  // Render non-typeable structured card preview
  const renderNonTypeableItemCard = (sectionKey, item, idx, totalItems) => {
    const mainTitle = item.role || item.title || item.name || item.degree || "Untitled Entry";
    const subtitle = item.company || item.subtitle || item.category || item.org || item.stream || item.branch || item.institution;
    const dateStart = item.startDate || item.year;
    const dateEnd = item.endDate;
    const assetsList = item.images || item.assets || [];
    const skillsList = item.skills || [];
    const linksList = item.links || [];

    return (
      <div key={item.id || idx} className={styles.itemPreviewCard}>
        {/* Header */}
        <div className={styles.itemPreviewHeader}>
          <div className={styles.itemTitleGroup}>
            <span className={styles.itemIndexBadge}>#{idx + 1}</span>
            <div className={styles.itemTitleBlock}>
              <h4 className={styles.itemMainTitle}>{mainTitle}</h4>
              {subtitle && <span className={styles.itemSubtitle}>{subtitle}</span>}
              {sectionKey === "projects" && idx === 0 && (
                <span className={styles.flagshipBadge}>Flagship Project</span>
              )}
            </div>
            {dateStart && (
              <span className={styles.itemDateBadge}>
                {formatDisplayDate(dateStart)}
                {dateEnd !== undefined && (
                  dateEnd ? ` — ${formatDisplayDate(dateEnd)}` : " — Present"
                )}
                {item.validUntil && ` • ${item.validUntil}`}
              </span>
            )}
          </div>

          <div className={styles.itemHeaderControls}>
            <div className={styles.moveGroup}>
              <button
                type="button"
                className={styles.moveArrowBtn}
                disabled={idx === 0}
                onClick={() => moveItem(sectionKey, idx, -1)}
                title="Move item up"
                aria-label="Move item up"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.moveArrowBtn}
                disabled={idx === totalItems - 1}
                onClick={() => moveItem(sectionKey, idx, 1)}
                title="Move item down"
                aria-label="Move item down"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              className={styles.editItemBtn}
              onClick={() => handleOpenEditItem(sectionKey, idx)}
              aria-label={`Edit ${mainTitle}`}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              <span>Edit</span>
            </button>

            <button
              type="button"
              className={`${styles.iconBtn} ${styles.deleteBtn}`}
              onClick={() => deleteItem(sectionKey, idx)}
              title="Delete entry"
              aria-label="Delete entry"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Non-Typeable Body Content */}
        <div className={styles.itemContentBody}>
          {sectionKey === "education" && (
            <div className={styles.itemMetaRow}>
              {item.institution && <span><strong>Institution:</strong> {item.institution}</span>}
              {item.grade && <span><strong>Grade:</strong> {item.grade}</span>}
              {item.level && <span><strong>Level:</strong> {item.level}</span>}
            </div>
          )}

          {item.tagline && <p className={styles.itemDesc} style={{ fontStyle: "italic", color: "#475569" }}>{item.tagline}</p>}

          {Array.isArray(item.highlights) && item.highlights.length > 0 ? (
            <ul className={styles.highlightsList}>
              {item.highlights.map((h, hIdx) => (
                <li key={hIdx}>{h}</li>
              ))}
            </ul>
          ) : item.description ? (
            <p className={styles.itemDesc}>{item.description}</p>
          ) : item.summary ? (
            <p className={styles.itemDesc}>{item.summary}</p>
          ) : null}

          {/* Links Pills */}
          {Array.isArray(linksList) && linksList.length > 0 && (
            <div className={styles.linksPillRow}>
              {linksList.map((link, lIdx) => (
                <a
                  key={link.id || lIdx}
                  href={link.url || link.link}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.linkPill}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{link.title || link.label || "Link"}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}

          {/* Attached Images */}
          {Array.isArray(assetsList) && assetsList.length > 0 && (
            <div className={styles.assetsThumbRow}>
              {assetsList.map((ast, aIdx) => (
                <div key={ast.id || aIdx} className={styles.assetThumbItem} title={ast.title || ast.caption || "Image"}>
                  <img src={ast.url} alt={ast.title || "thumbnail"} className={styles.assetImg} />
                  {(ast.title || ast.caption) && (
                    <span className={styles.assetCaptionText}>{ast.title || ast.caption}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills Badges */}
          {Array.isArray(skillsList) && skillsList.length > 0 && (
            <div className={styles.skillsPillRow}>
              {skillsList.map((skill, sIdx) => {
                const name = typeof skill === "object" ? skill.skill_name || skill.name : skill;
                return <SkillBadge key={sIdx} name={name} size="small" />;
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render individual section forms based on key
  const renderSectionBody = (sectionId) => {
    switch (sectionId) {
      case "about":
        return (
          <div className={styles.cardBody}>
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={draftDoc.about?.name || ""}
                  onChange={(e) =>
                    updateDoc((doc) => {
                      if (!doc.about) doc.about = {};
                      doc.about.name = e.target.value;
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Professional Title</label>
                <input
                  type="text"
                  className={styles.input}
                  value={draftDoc.about?.title || ""}
                  onChange={(e) =>
                    updateDoc((doc) => {
                      if (!doc.about) doc.about = {};
                      doc.about.title = e.target.value;
                    })
                  }
                />
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Experience Summary</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. 5+ Years Experience"
                  value={draftDoc.about?.experience || ""}
                  onChange={(e) =>
                    updateDoc((doc) => {
                      if (!doc.about) doc.about = {};
                      doc.about.experience = e.target.value;
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Location</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Bengaluru, India"
                  value={draftDoc.about?.location || ""}
                  onChange={(e) =>
                    updateDoc((doc) => {
                      if (!doc.about) doc.about = {};
                      doc.about.location = e.target.value;
                    })
                  }
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Profile Photo URL</label>
              <input
                type="text"
                className={styles.input}
                value={draftDoc.about?.["profile-photo"] || ""}
                onChange={(e) =>
                  updateDoc((doc) => {
                    if (!doc.about) doc.about = {};
                    doc.about["profile-photo"] = e.target.value;
                  })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bio / Summary</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={draftDoc.about?.about || ""}
                onChange={(e) =>
                  updateDoc((doc) => {
                    if (!doc.about) doc.about = {};
                    doc.about.about = e.target.value;
                  })
                }
              />
            </div>

            {/* Social Links */}
            <div className={styles.subSectionTitle}>Social Links</div>
            <div className={styles.dynamicList}>
              {(draftDoc.about?.socials || []).map((soc, idx) => (
                <div key={idx} className={styles.dynamicRow}>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ width: "160px" }}
                    placeholder="Platform"
                    value={soc.title || ""}
                    onChange={(e) =>
                      updateDoc((doc) => {
                        doc.about.socials[idx].title = e.target.value;
                      })
                    }
                  />
                  <input
                    type="text"
                    className={styles.input}
                    style={{ flex: 1 }}
                    placeholder="https://..."
                    value={soc.url || ""}
                    onChange={(e) =>
                      updateDoc((doc) => {
                        doc.about.socials[idx].url = e.target.value;
                      })
                    }
                  />
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                    onClick={() =>
                      updateDoc((doc) => {
                        doc.about.socials.splice(idx, 1);
                      })
                    }
                    title="Remove social link"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() =>
                  updateDoc((doc) => {
                    if (!doc.about) doc.about = {};
                    if (!Array.isArray(doc.about.socials)) doc.about.socials = [];
                    doc.about.socials.push({
                      title: "GitHub",
                      url: "https://github.com",
                    });
                  })
                }
              >
                + Add Social Link
              </button>
            </div>
          </div>
        );

      case "skills":
        return (
          <div className={styles.cardBody}>
            {/* Description is intentionally removed per requirement */}
            <div className={styles.nestedList}>
              {(draftDoc.skills?.categories || []).map((cat, idx) => (
                <div key={idx} className={styles.nestedItem}>
                  <div className={styles.nestedItemHeader}>
                    <div className={styles.nestedItemTitleGroup}>
                      <span className={styles.nestedItemIndex}>Category #{idx + 1}</span>
                      <span className={styles.nestedItemTitle}>{cat.name || "Untitled Category"}</span>
                    </div>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.deleteBtn}`}
                      onClick={() =>
                        updateDoc((doc) => {
                          doc.skills.categories.splice(idx, 1);
                        })
                      }
                      title="Delete category"
                    >
                      ✕
                    </button>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Category Name</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={cat.name || ""}
                      onChange={(e) =>
                        updateDoc((doc) => {
                          doc.skills.categories[idx].name = e.target.value;
                        })
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Skills (comma-separated)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={(cat.skills || []).join(", ")}
                      onChange={(e) => {
                        const list = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        updateDoc((doc) => {
                          doc.skills.categories[idx].skills = list;
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() =>
                  updateDoc((doc) => {
                    if (!doc.skills) doc.skills = {};
                    if (!Array.isArray(doc.skills.categories)) doc.skills.categories = [];
                    doc.skills.categories.push({
                      name: "Tools & Technologies",
                      skills: ["Git", "Docker"],
                    });
                  })
                }
              >
                + Add Skill Category
              </button>
            </div>
          </div>
        );

      case "experience": {
        const items = draftDoc.experience?.items || [];
        return (
          <div className={styles.cardBody}>
            <p className={styles.cardDescription}>
              Roles appear in this exact sequence without forced date sorting. Use arrows to reorder, or click Edit to update an entry in the dialog.
            </p>
            <div className={styles.nestedList}>
              {items.map((item, idx) =>
                renderNonTypeableItemCard("experience", item, idx, items.length)
              )}
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() => handleOpenAddModal("experience")}
              >
                + Add Work Experience
              </button>
            </div>
          </div>
        );
      }

      case "projects": {
        const items = draftDoc.projects?.items || [];
        return (
          <div className={styles.cardBody}>
            <p className={styles.cardDescription}>
              The first project is automatically showcased as the primary flagship build. Move your best project to position #1 using the up arrow, or click Edit to update details.
            </p>
            <div className={styles.nestedList}>
              {items.map((proj, idx) =>
                renderNonTypeableItemCard("projects", proj, idx, items.length)
              )}
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() => handleOpenAddModal("projects")}
              >
                + Add Project
              </button>
            </div>
          </div>
        );
      }

      case "education": {
        const items = draftDoc.education?.items || [];
        return (
          <div className={styles.cardBody}>
            <div className={styles.nestedList}>
              {items.map((edu, idx) =>
                renderNonTypeableItemCard("education", edu, idx, items.length)
              )}
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() => handleOpenAddModal("education")}
              >
                + Add Education
              </button>
            </div>
          </div>
        );
      }

      case "achievements": {
        const items = draftDoc.achievements?.items || [];
        return (
          <div className={styles.cardBody}>
            <div className={styles.nestedList}>
              {items.map((ach, idx) =>
                renderNonTypeableItemCard("achievements", ach, idx, items.length)
              )}
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() => handleOpenAddModal("achievements")}
              >
                + Add Achievement
              </button>
            </div>
          </div>
        );
      }

      case "certifications": {
        const items = draftDoc.certifications?.items || [];
        return (
          <div className={styles.cardBody}>
            <div className={styles.nestedList}>
              {items.map((cert, idx) =>
                renderNonTypeableItemCard("certifications", cert, idx, items.length)
              )}
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() => handleOpenAddModal("certifications")}
              >
                + Add Certification
              </button>
            </div>
          </div>
        );
      }

      case "extraCurricular": {
        const items = draftDoc.extraCurricular?.items || [];
        return (
          <div className={styles.cardBody}>
            <div className={styles.nestedList}>
              {items.map((ext, idx) =>
                renderNonTypeableItemCard("extraCurricular", ext, idx, items.length)
              )}
              <button
                type="button"
                className={styles.addItemBtn}
                onClick={() => handleOpenAddModal("extraCurricular")}
              >
                + Add Activity
              </button>
            </div>
          </div>
        );
      }

      case "contact":
        return (
          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="alex@sterling.dev"
                value={draftDoc.contact?.email || ""}
                onChange={(e) =>
                  updateDoc((doc) => {
                    if (!doc.contact) doc.contact = {};
                    doc.contact.email = e.target.value;
                  })
                }
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.pageLayout}>
      {/* ── TOP CONTROL BAR ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <Link to="/" className={styles.backBtn} title="Return to Portfolios">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Portfolios</span>
            </Link>
            <div className={styles.titleArea}>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value);
                  setIsDirty(true);
                }}
                className={styles.portfolioTitleInput}
                title="Click to rename portfolio"
              />
              <div className={styles.slugMeta}>
                <span className={styles.slugPrefix}>/portfolio/</span>
                <input
                  type="text"
                  value={draftSlug}
                  onChange={(e) => {
                    setDraftSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-")
                    );
                    setIsDirty(true);
                  }}
                  className={styles.slugInput}
                  title="Edit unique URL slug"
                />
              </div>
            </div>
          </div>

          <div className={styles.topBarRight}>
            <select
              value={draftTheme}
              onChange={(e) => {
                setDraftTheme(e.target.value);
                setIsDirty(true);
              }}
              className={styles.themeSelect}
              title="Portfolio theme"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>

            {/* Google Forms Style Preview Link Button */}
            <a
              href={`/portfolio/${draftSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.previewBtn}
              title="Open portfolio in a new tab"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Preview</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>

            <button
              type="button"
              className={`${styles.saveButton} ${
                isDirty ? styles.saveButtonDirty : styles.saveButtonClean
              }`}
              onClick={handleSave}
              title={isDirty ? "Save changes to storage" : "All changes saved"}
            >
              {isDirty ? (
                <>
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Saved</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Save Success Toast */}
      {showToast && (
        <div className={styles.saveToast}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Portfolio saved successfully. Refresh your preview tab to view updates.</span>
        </div>
      )}

      {/* ── GOOGLE FORMS MAIN CANVAS ── */}
      <main className={styles.mainCanvas}>
        {/* Title Box Card */}
        <div className={styles.formHeaderCard}>
          <h1 className={styles.formHeaderTitle}>{draftTitle || "Untitled Portfolio"}</h1>
          <p className={styles.formHeaderDesc}>
            Manage and sequence all sections of your portfolio. Reorder sections using the arrows in each card header.
          </p>
          <div className={styles.previewTip}>
            <span>Click <strong>Preview</strong> in the top bar to inspect your live page in another tab.</span>
            <a
              href={`/portfolio/${draftSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.previewTipLink}
            >
              Open Live Page
            </a>
          </div>
        </div>

        {/* ── NATURAL SECTION CARDS (Ordered by currentSectionOrder) ── */}
        {currentSectionOrder.map((sectionId, index) => {
          const meta = ALL_SECTION_META[sectionId];
          if (!meta) return null;
          const isExpanded = expandedCards[sectionId] ?? true;

          // Compute count badge if applicable
          let countBadgeText = null;
          if (sectionId === "projects") {
            const count = draftDoc.projects?.items?.length || 0;
            countBadgeText = `${count} project${count === 1 ? "" : "s"}`;
          } else if (sectionId === "experience") {
            const count = draftDoc.experience?.items?.length || 0;
            countBadgeText = `${count} position${count === 1 ? "" : "s"}`;
          } else if (sectionId === "skills") {
            const count = draftDoc.skills?.categories?.length || 0;
            countBadgeText = `${count} categor${count === 1 ? "y" : "ies"}`;
          } else if (sectionId === "education") {
            const count = draftDoc.education?.items?.length || 0;
            countBadgeText = `${count} entr${count === 1 ? "y" : "ies"}`;
          } else if (sectionId === "achievements") {
            const count = draftDoc.achievements?.items?.length || 0;
            countBadgeText = `${count} award${count === 1 ? "" : "s"}`;
          } else if (sectionId === "certifications") {
            const count = draftDoc.certifications?.items?.length || 0;
            countBadgeText = `${count} cert${count === 1 ? "" : "s"}`;
          } else if (sectionId === "extraCurricular") {
            const count = draftDoc.extraCurricular?.items?.length || 0;
            countBadgeText = `${count} activit${count === 1 ? "y" : "ies"}`;
          }

          return (
            <section
              key={sectionId}
              id={`section-${sectionId}`}
              className={`${styles.sectionCard} ${isExpanded ? styles.sectionCardActive : ""}`}
            >
              <div
                className={`${styles.cardHeader} ${isExpanded ? styles.cardHeaderExpanded : ""}`}
                onClick={() => toggleCard(sectionId)}
              >
                <div className={styles.cardHeaderLeft}>
                  <span className={styles.sectionNumberBadge}>
                    Section {index + 1} of {currentSectionOrder.length}
                  </span>
                  <h2 className={styles.cardTitle}>{meta.title}</h2>
                  {countBadgeText && (
                    <span className={styles.cardCountBadge}>{countBadgeText}</span>
                  )}
                </div>

                <div
                  className={styles.cardHeaderControls}
                  onClick={(e) => e.stopPropagation()} // Prevent card toggle on button click
                >
                  {/* Distinct Stemmed Arrows for Reordering */}
                  <div className={styles.moveGroup}>
                    <button
                      type="button"
                      className={styles.moveArrowBtn}
                      disabled={index === 0}
                      onClick={() => moveSection(index, -1)}
                      title="Move section up"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={styles.moveArrowBtn}
                      disabled={index === currentSectionOrder.length - 1}
                      onClick={() => moveSection(index, 1)}
                      title="Move section down"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <polyline points="19 12 12 19 5 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Remove / Hide Section */}
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                    onClick={() => removeSection(sectionId)}
                    title="Hide / remove section"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>

                  {/* Distinct Disclosure Button for Expand / Collapse */}
                  <button
                    type="button"
                    className={styles.disclosureBtn}
                    onClick={() => toggleCard(sectionId)}
                    title={isExpanded ? "Collapse section" : "Expand section"}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      style={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && renderSectionBody(sectionId)}
            </section>
          );
        })}

        {/* ── RESTORE / ADD HIDDEN SECTIONS ── */}
        {hiddenSections.length > 0 && (
          <div className={styles.restoreSectionsCard}>
            <div className={styles.restoreTitle}>Add Inactive Sections</div>
            <div className={styles.restorePillsGroup}>
              {hiddenSections.map((secKey) => (
                <button
                  key={secKey}
                  type="button"
                  className={styles.restorePill}
                  onClick={() => addSectionBack(secKey)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>{ALL_SECTION_META[secKey].title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── FOCUSED ADD ITEM MODAL DIALOG ── */}
      <AddItemDialog
        isOpen={addModalConfig.isOpen}
        sectionKey={addModalConfig.sectionKey}
        existingItems={addModalConfig.sectionKey ? draftDoc[addModalConfig.sectionKey]?.items || [] : []}
        onClose={() => setAddModalConfig({ isOpen: false, sectionKey: null })}
        onAdd={handleAddItemFromModal}
        onCreateCustom={handleOpenCreateCustom}
      />

      {/* ── RESUME ENTITY EDIT/CREATE DIALOG ── */}
      {activeModal && activeModal.type === "resume_entity" && (
        <ResumeEntityDialog
          entityType={activeModal.entityType}
          entity={activeModal.entity}
          onSave={handleSaveModal}
          onDelete={handleDeleteFromModal}
          onClose={handleCloseModal}
        />
      )}

      {/* ── EDUCATION EDIT/CREATE DIALOG ── */}
      {activeModal && activeModal.type === "education" && (
        <div className={styles.dialogOverlay}>
          <EducationDialog
            education={activeModal.entity}
            onSave={handleSaveModal}
            onDelete={handleDeleteFromModal}
            onClose={handleCloseModal}
          />
        </div>
      )}
    </div>
  );
}
