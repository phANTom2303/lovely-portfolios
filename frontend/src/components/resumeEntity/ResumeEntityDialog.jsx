import styles from "./ResumeEntityDialog.module.css";
import { useState } from "react";
import SkillBadge from "../shared/SkillBadge";
import SkillPickerDialog from "../shared/SkillPickerDialog";
import LinkDialog from "../shared/LinkDialog";
import ImageDialog from "../shared/ImageDialog";
import { createSkill, deleteSkill } from "../../api/skillsApi";
import { uploadImageAsset, updateAsset, deleteAsset } from "../../api/assetsApi";
import { createLink, updateLink, deleteLink } from "../../api/linksApi";

const ENTITY_CONFIGS = {
  work_exp: {
    entityName: "Experience",
    titleLabel: "Role / Position",
    titlePlaceholder: "e.g. Senior Backend Developer",
    subtitleLabel: "Company / Organization",
    subtitlePlaceholder: "e.g. Google",
    descPlaceholder: "Key responsibilities, milestones, and impact...",
    skillsLabel: "Key Technologies / Skills",
    startDateLabel: "Start Date",
    endDateLabel: "End Date",
    showPresent: true,
    isSubtitleRequired: true,
    isDescRequired: true,
  },
  project: {
    entityName: "Project",
    titleLabel: "Project Name",
    titlePlaceholder: "e.g. Lovely Portfolios",
    subtitleLabel: "Role / Category",
    subtitlePlaceholder: "e.g. Full-Stack Web App, Open Source",
    descPlaceholder: "Project overview, problems solved, and architecture...",
    skillsLabel: "Technologies & Libraries",
    startDateLabel: "Start Date",
    endDateLabel: "End Date",
    showPresent: false,
    isSubtitleRequired: false,
    isDescRequired: true,
  },
  certification: {
    entityName: "Certification",
    titleLabel: "Certification Name",
    titlePlaceholder: "e.g. AWS Solutions Architect",
    subtitleLabel: "Issuing Organization / Provider",
    subtitlePlaceholder: "e.g. Amazon Web Services",
    descPlaceholder: "Credential details and skills validated...",
    skillsLabel: "Validated Skills",
    startDateLabel: "Issue Date",
    endDateLabel: "Expiry Date",
    showPresent: false,
    isSubtitleRequired: true,
    isDescRequired: false,
  },
  achievements: {
    entityName: "Achievement",
    titleLabel: "Title / Honor",
    titlePlaceholder: "e.g. 1st Place City Hackathon",
    subtitleLabel: "Awarder / Organization",
    subtitlePlaceholder: "e.g. Tech Community Foundation",
    descPlaceholder: "Brief description of the achievement...",
    skillsLabel: "Related Skills",
    startDateLabel: "Date Awarded",
    endDateLabel: "End Date (Optional)",
    showPresent: false,
    isSubtitleRequired: true,
    isDescRequired: false,
  },
  extra_curricular: {
    entityName: "Activity",
    titleLabel: "Role / Activity Name",
    titlePlaceholder: "e.g. Vice President, Coding Club",
    subtitleLabel: "Club / Community",
    subtitlePlaceholder: "e.g. Developer Student Club",
    descPlaceholder: "Initiatives led and contributions made...",
    skillsLabel: "Skills Demonstrated",
    startDateLabel: "Start Date",
    endDateLabel: "End Date",
    showPresent: true,
    isSubtitleRequired: true,
    isDescRequired: false,
  },
  others: {
    entityName: "Entry",
    titleLabel: "Title",
    titlePlaceholder: "e.g. Volunteer, Speaking engagement",
    subtitleLabel: "Organization / Event",
    subtitlePlaceholder: "e.g. Global Tech Conference",
    descPlaceholder: "Details and highlights...",
    skillsLabel: "Relevant Skills",
    isSubtitleRequired: false,
    isDescRequired: false,
  },
};

function ResumeEntityDialog({
  entityType = "work_exp",
  entity,
  onSave,
  onClose,
  onDelete,
}) {
  const config = ENTITY_CONFIGS[entityType] || ENTITY_CONFIGS.work_exp;

  const [formData, setFormData] = useState({
    id: entity?.re_id || entity?.id || crypto.randomUUID(),
    re_type: entityType,
    role: entity?.role || entity?.title || "",
    company: entity?.company || entity?.subtitle || "",
    startDate: entity?.startDate || entity?.from_date || "",
    endDate: entity?.endDate || entity?.to_date || "",
    isCurrent: entity?.isCurrent ?? false,
    description: entity?.description || "",
    skills: entity?.skills || [],
    links: entity?.links || [],
    images: (entity?.assets || entity?.images || []).map(asset => ({
      id: asset.asset_id || asset.id,
      title: asset.title || '',
      url: asset.link || asset.url || '',
      description: asset.description || '',
      asset_type: asset.asset_type || 'image',
    })),
  });

  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSaveSkills(newSkills) {
    const isEditingExistingEntity =
      entity && typeof entity.re_id === "number";

    try {
      if (isEditingExistingEntity) {
        const originalSkills = formData.skills;

        // Skills with integer IDs were already in the DB; UUID strings are newly typed
        const toAdd = newSkills.filter((newSkill) => {
          const newId = newSkill.skill_id;
          if (typeof newId === "number") {
            return !originalSkills.some((orig) => orig.skill_id === newId);
          }
          return true; // newly typed skill — always create
        });

        const toRemove = originalSkills.filter((orig) => {
          if (typeof orig.skill_id !== "number") return false;
          return !newSkills.some((ns) => ns.skill_id === orig.skill_id);
        });

        // Delete removed skills
        for (const skill of toRemove) {
          await deleteSkill(skill.skill_id);
        }

        // Create added skills scoped to this RE
        const createdSkills = [];
        for (const skill of toAdd) {
          const created = await createSkill({
            skill_name: skill.skill_name || skill.name,
            re_id: entity.re_id,
          });
          createdSkills.push(created);
        }

        // Kept skills = existing DB skills that were not removed
        const keptSkills = originalSkills.filter(
          (orig) =>
            typeof orig.skill_id === "number" &&
            !toRemove.some((r) => r.skill_id === orig.skill_id),
        );

        setFormData((prev) => ({
          ...prev,
          skills: [...keptSkills, ...createdSkills],
        }));
      } else {
        // Creating a new entity — store locally; backend handles inline on submit
        setFormData((prev) => ({ ...prev, skills: newSkills }));
      }
    } catch {
      console.error("[handleSaveSkills] Failed to sync skills with API.");
    }

    setIsSkillsDialogOpen(false);
  }

  function handleOpenAddLink() {
    setEditingLink(null);
    setIsLinkDialogOpen(true);
  }

  function handleOpenEditLink(link) {
    setEditingLink(link);
    setIsLinkDialogOpen(true);
  }

  async function handleSaveLink(linkData) {
    const isEditingExistingEntity = entity && typeof entity.re_id === 'number';

    if (isEditingExistingEntity) {
      const isExistingLink = typeof linkData.id === 'number';

      try {
        if (isExistingLink) {
          const updated = await updateLink({
            link_id: linkData.id,
            title: linkData.title,
            link: linkData.url || linkData.link,
            description: linkData.description,
          });
          setFormData((prev) => ({
            ...prev,
            links: prev.links.map((l) => (l.id === updated.id ? updated : l)),
          }));
        } else {
          const created = await createLink({
            link: linkData.url || linkData.link,
            title: linkData.title,
            description: linkData.description,
            re_id: entity.re_id,
          });
          setFormData((prev) => ({ ...prev, links: [...prev.links, created] }));
        }
      } catch (err) {
        console.error('Failed to save link:', err);
        alert('Failed to save link');
        return;
      }
    } else {
      setFormData((previous) => {
        const exists = previous.links.some((l) => l.id === linkData.id);
        return {
          ...previous,
          links: exists
            ? previous.links.map((l) => (l.id === linkData.id ? linkData : l))
            : [...previous.links, linkData],
        };
      });
    }

    setIsLinkDialogOpen(false);
  }

  async function handleDeleteLink(linkId) {
    const isEditingExistingEntity = entity && typeof entity.re_id === 'number';
    const isDbLink = typeof linkId === 'number';

    if (isEditingExistingEntity && isDbLink) {
      try {
        await deleteLink(linkId);
      } catch (err) {
        console.error('Failed to delete link:', err);
        alert('Failed to delete link');
        return;
      }
    }

    setFormData((previous) => ({
      ...previous,
      links: previous.links.filter((l) => l.id !== linkId),
    }));
  }

  function handleOpenAddImage() {
    setEditingImage(null);
    setIsImageDialogOpen(true);
  }

  function handleOpenEditImage(image) {
    setEditingImage(image);
    setIsImageDialogOpen(true);
  }

  async function handleSaveImage(imageData) {
    const isEditingExistingEntity = entity && typeof entity.re_id === 'number';

    try {
      if (isEditingExistingEntity) {
        const isExistingAsset = typeof imageData.id === 'number'; // DB IDs are integers

        if (isExistingAsset) {
          // PATCH existing asset
          const updated = await updateAsset({
            asset_id: imageData.id,
            title: imageData.title,
            description: imageData.description,
          });
          setFormData(prev => ({
            ...prev,
            images: prev.images.map(img =>
              img.id === updated.asset_id
                ? { ...updated, id: updated.asset_id, url: updated.link }
                : img,
            ),
          }));
        } else {
          // Upload new image asset
          if (imageData.file) {
            const formData = new FormData();
            formData.append('title', imageData.title || 'Image');
            formData.append('asset_type', 'image');
            formData.append('re_id', String(entity.re_id));
            if (imageData.description) formData.append('description', imageData.description);
            formData.append('assets', imageData.file);

            const created = await uploadImageAsset(formData);
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, { ...created, id: created.asset_id, url: created.link }],
            }));
          }
        }
      } else {
        // Local state (creating new entity — inline handling by POST /api/re)
        setFormData(prev => {
          const exists = prev.images.some(img => img.id === imageData.id);
          return {
            ...prev,
            images: exists
              ? prev.images.map(img => img.id === imageData.id ? imageData : img)
              : [...prev.images, imageData],
          };
        });
      }
    } catch (error) {
      console.error('[handleSaveImage] Failed to save image asset:', error);
      alert('Failed to save image');
      return;
    }

    setIsImageDialogOpen(false);
  }

  async function handleDeleteImage(imageId) {
    const isEditingExistingEntity = entity && typeof entity.re_id === 'number';
    const isDbAsset = typeof imageId === 'number';

    try {
      if (isEditingExistingEntity && isDbAsset) {
        await deleteAsset(imageId);
      }
    } catch (error) {
      console.error('[handleDeleteImage] Failed to delete image asset:', error);
      alert('Failed to save image');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.role.trim()) return;
    if (config.isSubtitleRequired && !formData.company.trim()) return;
    if (config.isDescRequired && !formData.description.trim()) return;

    console.log(`[API Ready Payload: ${formData.re_type}]`, {
      user_id: "USER_UUID_HERE",
      re_type: formData.re_type,
      title: formData.role,
      subtitle: formData.company || null,
      description: formData.description,
      skills_id: formData.skills.map(
        (s) => s.skill_id || s.id || crypto.randomUUID(),
      ),
      from_date: formData.startDate
        ? (formData.startDate.length === 7
            ? `${formData.startDate}-01`
            : formData.startDate)
        : null,
      to_date: formData.isCurrent
        ? null
        : formData.endDate
          ? (formData.endDate.length === 7
              ? `${formData.endDate}-01`
              : formData.endDate)
          : null,
      status: "active",
      links: formData.links.map((l) => ({
        title: l.title,
        link: l.url || l.link,
        description: l.description || "",
      })),
      assets: formData.images.map((img) => ({
        title: img.title || "",
        link: img.url,
        description: img.description || "",
        asset_type: "image",
      })),
      raw_form_data: formData,
    });

    onSave(formData);
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.dialog}
          onClick={(event) => event.stopPropagation()}
        >
          <form onSubmit={handleSubmit} style={{ display: "contents" }}>
            <div className={styles.dialogHeader}>
              <h2>
                {entity
                  ? `Edit ${config.entityName}`
                  : `Add your ${config.entityName}`}
              </h2>
              <div className={styles.headerActions}>
                {entity && onDelete && (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => onDelete(entity?.re_id || entity?.id)}
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  Save Changes
                </button>
              </div>
            </div>

            <div className={styles.formBody}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label htmlFor="entityRole">{config.titleLabel}</label>
                  <input
                    id="entityRole"
                    name="role"
                    type="text"
                    placeholder={config.titlePlaceholder}
                    value={formData.role}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="entityCompany">{config.subtitleLabel}</label>
                  <input
                    id="entityCompany"
                    name="company"
                    type="text"
                    placeholder={config.subtitlePlaceholder}
                    value={formData.company}
                    onChange={handleChange}
                    required={config.isSubtitleRequired}
                  />
                </div>
              </div>

              <div
                className={`${styles.dateRow} ${!config.showPresent ? styles.noPresentRow : ""}`}
              >
                <div className={styles.formField}>
                  <label htmlFor="entityStartDate">
                    {config.startDateLabel || "Start Date"}
                  </label>
                  <input
                    id="entityStartDate"
                    name="startDate"
                    type="month"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="entityEndDate">
                    {config.endDateLabel || "End Date"}
                  </label>
                  <input
                    id="entityEndDate"
                    name="endDate"
                    type="month"
                    value={formData.endDate}
                    onChange={handleChange}
                    disabled={config.showPresent && formData.isCurrent}
                  />
                </div>

                {config.showPresent && (
                  <label className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      name="isCurrent"
                      checked={formData.isCurrent}
                      onChange={handleChange}
                    />
                    <span>Present</span>
                  </label>
                )}
              </div>

              <div className={styles.mediaSection}>
                <span className={styles.sectionLabel}>Add links</span>
                <div className={styles.stripContainer}>
                  <button
                    type="button"
                    className={styles.addTile}
                    onClick={handleOpenAddLink}
                  >
                    <span className={styles.addIcon}>+</span>
                    <span>Add More</span>
                  </button>

                  {formData.links.map((link) => (
                    <div key={link.id} className={styles.linkTile}>
                      <div>
                        <div className={styles.tileTitle}>{link.title}</div>
                        <div className={styles.tileDesc}>
                          {link.description || link.url || link.link}
                        </div>
                      </div>
                      <div className={styles.tileActions}>
                        <button
                          type="button"
                          className={styles.tileActionBtn}
                          onClick={() => handleOpenEditLink(link)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.tileActionBtn}
                          onClick={() => handleDeleteLink(link.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formField}>
                <label htmlFor="entityDescription">Description</label>
                <textarea
                  id="entityDescription"
                  name="description"
                  className={styles.textarea}
                  placeholder={config.descPlaceholder}
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required={config.isDescRequired}
                />
              </div>

              <div className={styles.mediaSection}>
                <span className={styles.sectionLabel}>Add Images</span>
                <div className={styles.stripContainer}>
                  <button
                    type="button"
                    className={styles.addTile}
                    onClick={handleOpenAddImage}
                  >
                    <span className={styles.addIcon}>+</span>
                    <span>Add More</span>
                  </button>

                  {formData.images.map((image) => (
                    <div key={image.id} className={styles.imageTile}>
                      <div className={styles.imageThumbWrapper}>
                        <img
                          src={image.url}
                          alt={image.title}
                          className={styles.imageThumb}
                        />
                      </div>
                      <div className={styles.tileTitle}>{image.title}</div>
                      <div className={styles.tileActions}>
                        <button
                          type="button"
                          className={styles.tileActionBtn}
                          onClick={() => handleOpenEditImage(image)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.tileActionBtn}
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formField}>
                <div className={styles.skillsHeader}>
                  <span className={styles.sectionLabel}>
                    {config.skillsLabel}
                  </span>
                  <button
                    type="button"
                    className={styles.manageSkillsBtn}
                    onClick={() => setIsSkillsDialogOpen(true)}
                  >
                    Add/Edit skill
                  </button>
                </div>

                <div className={styles.skillsWrap}>
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill) => {
                      const id = skill.skill_id || skill.id;
                      const name = skill.skill_name || skill.name;
                      return <SkillBadge key={id} name={name} size="small" />;
                    })
                  ) : (
                    <p className={styles.emptySkillsHint}>
                      No skills added yet. Click &quot;Add/Edit skill&quot; to attach technologies.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {isSkillsDialogOpen && (
        <SkillPickerDialog
          currentSkills={formData.skills}
          onSave={handleSaveSkills}
          onClose={() => setIsSkillsDialogOpen(false)}
        />
      )}

      {isLinkDialogOpen && (
        <LinkDialog
          link={editingLink}
          titlePlaceholder="e.g. Repository, Live Demo, Docs"
          onSave={handleSaveLink}
          onClose={() => setIsLinkDialogOpen(false)}
        />
      )}

      {isImageDialogOpen && (
        <ImageDialog
          image={editingImage}
          onSave={handleSaveImage}
          onClose={() => setIsImageDialogOpen(false)}
        />
      )}
    </>
  );
}

export default ResumeEntityDialog;
