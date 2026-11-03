import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPortfolioByIdOrSlug,
  updatePortfolio,
} from "../../services/portfolioStorage";
// import { useAuth } from "../../context/authContext";
import PortfolioItemEditDialog from "./PortfolioItemEditDialog";
import AddSocialLinkDialog from "./AddSocialLinkDialog";
import AddSkillCategoryDialog from "./AddSkillCategoryDialog";
import AddFromDatabaseDialog from "./AddFromDatabaseDialog";
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
  // const { user } = useAuth();
  const [isAddSocialOpen, setIsAddSocialOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(() => originalPortfolio.title || "");
  const draftSlug = originalPortfolio.slug || "";
  const [draftTheme, setDraftTheme] = useState(() => originalPortfolio.theme || "light");
  const [draftDoc, setDraftDoc] = useState(() =>
    originalPortfolio.document
      ? JSON.parse(JSON.stringify(originalPortfolio.document))
      : {}
  );
  const [isDirty, setIsDirty] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Active edit dialog state: { sectionKey, itemIndex, item }
  const [activeEditModal, setActiveEditModal] = useState(null);

  // Add from database modal state: { isOpen, sectionKey }
  const [addFromDbModal, setAddFromDbModal] = useState({ isOpen: false, sectionKey: null });

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



  // Open modal in edit mode for existing item
  const handleOpenEditItem = (sectionKey, itemIndex) => {
    const item = draftDoc[sectionKey]?.items?.[itemIndex];
    if (!item) return;
    setActiveEditModal({
      sectionKey,
      itemIndex,
      item,
    });
  };

  const handleSaveItemModal = (updatedItem) => {
    if (!activeEditModal) return;
    const { sectionKey, itemIndex } = activeEditModal;
    updateDoc((doc) => {
      if (!doc[sectionKey]) doc[sectionKey] = {};
      if (!Array.isArray(doc[sectionKey].items)) doc[sectionKey].items = [];
      doc[sectionKey].items[itemIndex] = updatedItem;
    });
    setActiveEditModal(null);
  };

  const handleDeleteItemModal = () => {
    if (!activeEditModal) return;
    const { sectionKey, itemIndex } = activeEditModal;
    deleteItem(sectionKey, itemIndex);
    setActiveEditModal(null);
  };

  const handleCloseModal = () => {
    setActiveEditModal(null);
  };

  // ── SAVE ACTION ──
  const handleSave = () => {
    if (!originalPortfolio) return;
    const updated = updatePortfolio(originalPortfolio.id, {
      title: draftTitle.trim() || originalPortfolio.title,
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
    let mainTitle = item.role || item.title || item.name || item.degree || "Untitled Entry";
    let subtitle = item.company || item.subtitle || item.category || item.org;
    let dateBadgeText = "";

    if (sectionKey === "education") {
      mainTitle = item.degree ? (item.stream ? `${item.degree} — ${item.stream}` : item.degree) : (item.title || "Education");
      subtitle = item.institute_name || item.institution || item.company;
      const sYear = item.from_date || item.startDate;
      const eYear = item.to_date || item.endDate;
      const sFormatted = sYear ? formatDisplayDate(sYear) : "";
      const eFormatted = eYear ? formatDisplayDate(eYear) : "Present";
      dateBadgeText = sFormatted ? `${sFormatted} — ${eFormatted}` : "";
      if (item.grade) {
        subtitle = subtitle ? `${subtitle} • ${item.grade}` : item.grade;
      }
    } else if (sectionKey === "achievements") {
      mainTitle = item.title || item.name || "Achievement";
      subtitle = item.org || item.subtitle || "";
      if (item.from_date || item.startDate) {
        dateBadgeText = formatDisplayDate(item.from_date || item.startDate);
      }
    } else if (sectionKey === "certifications") {
      mainTitle = item.title || item.name || "Certification";
      subtitle = item.org || item.subtitle || item.issuer || "";
      const sFormatted = (item.from_date || item.startDate) ? formatDisplayDate(item.from_date || item.startDate) : "";
      const eFormatted = item.validUntil === "Lifetime" ? "Lifetime" : ((item.to_date || item.endDate) ? formatDisplayDate(item.to_date || item.endDate) : "Lifetime");
      dateBadgeText = sFormatted ? `${sFormatted} — ${eFormatted}` : "";
    } else {
      // experience, projects, extraCurricular
      const dateStart = item.from_date || item.startDate || item.year;
      const dateEnd = item.to_date !== undefined ? item.to_date : item.endDate;
      if (dateStart) {
        const sFormatted = formatDisplayDate(dateStart);
        const eFormatted = dateEnd ? formatDisplayDate(dateEnd) : "Present";
        dateBadgeText = `${sFormatted} — ${eFormatted}`;
      }
    }

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
            {dateBadgeText && (
              <span className={styles.itemDateBadge}>
                {dateBadgeText}
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
              {(item.institute_name || item.institution) && (
                <span><strong>Institution:</strong> {item.institute_name || item.institution}</span>
              )}
              {item.grade && <span><strong>Grade:</strong> {item.grade}</span>}
              {item.level && <span><strong>Level:</strong> {item.level}</span>}
            </div>
          )}

          {Array.isArray(item.highlights) && item.highlights.length > 0 ? (
            <ul className={styles.highlightsList}>
              {item.highlights.map((h, hIdx) => (
                <li key={hIdx}>{h}</li>
              ))}
            </ul>
          ) : (item.description || item.summary || item.tagline) ? (
            <p className={styles.itemDesc}>{item.description || item.summary || item.tagline}</p>
          ) : null}

          {/* Links Pills */}
          {Array.isArray(linksList) && linksList.length > 0 && (
            <div className={styles.linksPillRow}>
              {linksList.map((link, lIdx) => (
                <a
                  key={link.id || lIdx}
                  href={link.link || link.url}
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
                <div key={ast.id || aIdx} className={styles.assetThumbItem} title={ast.title || ast.description || ast.caption || "Image"}>
                  <img src={ast.link || ast.url} alt={ast.title || ast.description || "thumbnail"} className={styles.assetImg} />
                  {(ast.title || ast.description || ast.caption) && (
                    <span className={styles.assetCaptionText}>{ast.title || ast.description || ast.caption}</span>
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
      case "about": {
        const currentPhoto =
          draftDoc.about?.profile_photo_link ||
          draftDoc.about?.["profile-photo"] ||
          "/Images/image.png";
        /* Commented out for now per user request: don't allow changing profile photo
        const userProfilePhoto = user?.profile_photo_link;
        const hasNewProfileImage =
          Boolean(userProfilePhoto) &&
          userProfilePhoto !== draftDoc.about?.profile_photo_link &&
          userProfilePhoto !== draftDoc.about?.["profile-photo"];
        */

        return (
          <div className={styles.cardBody}>
            {/* Top Photo Header: Proper Square Image at Top of Section, Centered */}
            <div className={styles.aboutTopHeaderCentered}>
              <div className={styles.squarePhotoWrapCentered}>
                <img
                  src={currentPhoto}
                  alt="Portfolio profile"
                  className={styles.squarePhotoImg}
                  onError={(e) => {
                    e.currentTarget.src = "/Images/image.png";
                  }}
                />
              </div>
              <span className={styles.aboutPhotoLabel}>Portfolio Photo</span>
              {/* Commented out for now per user request:
              {hasNewProfileImage && (
                <div className={styles.profileSyncBanner}>
                  <span>New profile photo detected in your account profile.</span>
                  <button
                    type="button"
                    className={styles.useProfileImgBtn}
                    onClick={() =>
                      updateDoc((doc) => {
                        if (!doc.about) doc.about = {};
                        doc.about.profile_photo_link = userProfilePhoto;
                        doc.about["profile-photo"] = userProfilePhoto;
                      })
                    }
                  >
                    Update to Profile Photo
                  </button>
                </div>
              )}
              */}
            </div>

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
                onClick={() => setIsAddSocialOpen(true)}
              >
                + Add Social Link
              </button>
            </div>
          </div>
        );
      }

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
                onClick={() => setIsAddCategoryOpen(true)}
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
            </div>
            <button
              type="button"
              className={styles.addFromDbBtn}
              onClick={() => setAddFromDbModal({ isOpen: true, sectionKey: "experience" })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Add from Database</span>
            </button>
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
            </div>
            <button
              type="button"
              className={styles.addFromDbBtn}
              onClick={() => setAddFromDbModal({ isOpen: true, sectionKey: "projects" })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Add from Database</span>
            </button>
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
            </div>
            <button
              type="button"
              className={styles.addFromDbBtn}
              onClick={() => setAddFromDbModal({ isOpen: true, sectionKey: "education" })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Add from Database</span>
            </button>
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
            </div>
            <button
              type="button"
              className={styles.addFromDbBtn}
              onClick={() => setAddFromDbModal({ isOpen: true, sectionKey: "achievements" })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Add from Database</span>
            </button>
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
            </div>
            <button
              type="button"
              className={styles.addFromDbBtn}
              onClick={() => setAddFromDbModal({ isOpen: true, sectionKey: "certifications" })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Add from Database</span>
            </button>
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
            </div>
            <button
              type="button"
              className={styles.addFromDbBtn}
              onClick={() => setAddFromDbModal({ isOpen: true, sectionKey: "extraCurricular" })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Add from Database</span>
            </button>
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
      {/* ── TOP CONTROL BAR (CLEAN HEADER) ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <Link to="/home" className={styles.backBtn} title="Return to Dashboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Home</span>
            </Link>
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

            {/* Preview Button */}
            <a
              href={`/portfolio/${draftSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.previewBtn}
              title="Preview portfolio in a new tab"
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

            {/* Open live page option: ONLY if portfolio is currently active */}
            {originalPortfolio.isActive && (
              <a
                href={`/portfolio/${draftSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.livePageBtn}
                title="Open live active portfolio"
              >
                <span>Live Page</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            )}

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
        {/* Google Forms Style Title Card at Form Start */}
        <div className={styles.formHeaderCard}>
          <div className={styles.formHeaderInner}>
            <input
              type="text"
              className={styles.formHeaderTitleInput}
              value={draftTitle}
              placeholder="Portfolio Title"
              onChange={(e) => {
                setDraftTitle(e.target.value);
                setIsDirty(true);
              }}
              title="Click to edit portfolio title"
            />
            <p className={styles.formHeaderDesc}>
              Manage and sequence all sections of your portfolio. Reorder sections using the arrows in each card header.
            </p>
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

      {/* ── PORTFOLIO ITEM EDIT DIALOG (NON-API / CLIENT-SIDE) ── */}
      {activeEditModal && (
        <PortfolioItemEditDialog
          key={`${activeEditModal.sectionKey}-${activeEditModal.itemIndex}`}
          isOpen={Boolean(activeEditModal)}
          sectionKey={activeEditModal.sectionKey}
          item={activeEditModal.item}
          onSave={handleSaveItemModal}
          onDelete={handleDeleteItemModal}
          onClose={handleCloseModal}
        />
      )}

      {/* ── ADD SOCIAL LINK DIALOG ── */}
      <AddSocialLinkDialog
        isOpen={isAddSocialOpen}
        onClose={() => setIsAddSocialOpen(false)}
        onAdd={(newSocial) => {
          updateDoc((doc) => {
            if (!doc.about) doc.about = {};
            if (!Array.isArray(doc.about.socials)) doc.about.socials = [];
            doc.about.socials.push(newSocial);
          });
        }}
      />

      {/* ── ADD SKILL CATEGORY DIALOG ── */}
      <AddSkillCategoryDialog
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAdd={(newCategory) => {
          updateDoc((doc) => {
            if (!doc.skills) doc.skills = {};
            if (!Array.isArray(doc.skills.categories)) doc.skills.categories = [];
            doc.skills.categories.push(newCategory);
          });
        }}
      />

      {/* ── ADD FROM DATABASE DIALOG ── */}
      <AddFromDatabaseDialog
        isOpen={addFromDbModal.isOpen}
        sectionKey={addFromDbModal.sectionKey}
        currentItems={
          addFromDbModal.sectionKey
            ? draftDoc[addFromDbModal.sectionKey]?.items || []
            : []
        }
        onAdd={(newItem) => {
          updateDoc((doc) => {
            if (!doc[addFromDbModal.sectionKey]) {
              doc[addFromDbModal.sectionKey] = {};
            }
            if (!Array.isArray(doc[addFromDbModal.sectionKey].items)) {
              doc[addFromDbModal.sectionKey].items = [];
            }
            doc[addFromDbModal.sectionKey].items.push(newItem);
          });
        }}
        onClose={() => setAddFromDbModal({ isOpen: false, sectionKey: null })}
      />
    </div>
  );
}
