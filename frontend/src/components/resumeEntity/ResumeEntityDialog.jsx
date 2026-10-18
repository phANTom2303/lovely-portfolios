import styles from "./ResumeEntityDialog.module.css";
import { useState } from "react";
import SkillBadge from "../shared/SkillBadge";
import SkillPickerDialog from "../shared/SkillPickerDialog";
import LinkDialog from "../shared/LinkDialog";
import ImageDialog from "../shared/ImageDialog";

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
  },
  others: {
    entityName: "Entry",
    titleLabel: "Title",
    titlePlaceholder: "e.g. Volunteer, Speaking engagement",
    subtitleLabel: "Organization / Event",
    subtitlePlaceholder: "e.g. Global Tech Conference",
    descPlaceholder: "Details and highlights...",
    skillsLabel: "Relevant Skills",
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
    id: entity?.id || crypto.randomUUID(),
    re_type: entityType,
    role: entity?.role || entity?.title || "",
    company: entity?.company || entity?.subtitle || "",
    startDate: entity?.startDate || entity?.from_date || "",
    endDate: entity?.endDate || entity?.to_date || "",
    isCurrent: entity?.isCurrent ?? false,
    description: entity?.description || "",
    keyPoints: entity?.keyPoints || entity?.key_points || "",
    skills: entity?.skills || [],
    links: entity?.links || [],
    images: entity?.images || [],
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

  function handleSaveSkills(newSkills) {
    setFormData((previous) => ({ ...previous, skills: newSkills }));
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

  function handleSaveLink(linkData) {
    setFormData((previous) => {
      const exists = previous.links.some((l) => l.id === linkData.id);
      return {
        ...previous,
        links: exists
          ? previous.links.map((l) => (l.id === linkData.id ? linkData : l))
          : [...previous.links, linkData],
      };
    });
    setIsLinkDialogOpen(false);
  }

  function handleDeleteLink(linkId) {
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

  function handleSaveImage(imageData) {
    setFormData((previous) => {
      const exists = previous.images.some((img) => img.id === imageData.id);
      return {
        ...previous,
        images: exists
          ? previous.images.map((img) =>
              img.id === imageData.id ? imageData : img,
            )
          : [...previous.images, imageData],
      };
    });
    setIsImageDialogOpen(false);
  }

  function handleDeleteImage(imageId) {
    setFormData((previous) => ({
      ...previous,
      images: previous.images.filter((img) => img.id !== imageId),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.role.trim()) return;
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
                    onClick={() => onDelete(entity.id)}
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
                  rows={3}
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="entityKeyPoints">Key Points / Highlights</label>
                <textarea
                  id="entityKeyPoints"
                  name="keyPoints"
                  className={styles.textarea}
                  placeholder="Bullet points, metrics, and key impact achieved..."
                  value={formData.keyPoints}
                  onChange={handleChange}
                  rows={3}
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
