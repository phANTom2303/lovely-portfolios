import { useState, useEffect } from "react";
import styles from "./CreatePortfolioModal.module.css";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CreatePortfolioModal({
  isOpen,
  onClose,
  onCreate,
  portfolios = [],
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("light");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");

  const activePortfolio = portfolios.find((p) => p.isActive);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setSlug("");
      setIsSlugManual(false);
      setDescription("");
      setTheme("light");
      setTemplateId(activePortfolio?.id || "");
      setError("");
    }
  }, [isOpen, activePortfolio]);

  if (!isOpen) return null;

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e) => {
    setIsSlugManual(true);
    setSlug(slugify(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title for your portfolio.");
      return;
    }

    const finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) {
      setError("Please provide a valid URL slug.");
      return;
    }

    try {
      onCreate({
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        theme,
        templateId: templateId || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create portfolio.");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Create New Portfolio</h2>
            <p className={styles.modalSubtitle}>
              Generate a new personalized portfolio with its own unique link.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="portfolio-title" className={styles.label}>
              Portfolio Title <span className={styles.required}>*</span>
            </label>
            <input
              id="portfolio-title"
              type="text"
              className={styles.input}
              placeholder="e.g. Senior Full-Stack Lead, Open Source Builder..."
              value={title}
              onChange={handleTitleChange}
              autoFocus
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="portfolio-slug" className={styles.label}>
              Custom Link / Slug <span className={styles.required}>*</span>
            </label>
            <div className={styles.slugInputWrapper}>
              <span className={styles.slugPrefix}>/portfolio/</span>
              <input
                id="portfolio-slug"
                type="text"
                className={styles.slugInput}
                placeholder="your-unique-slug"
                value={slug}
                onChange={handleSlugChange}
                required
              />
            </div>
            <span className={styles.hint}>
              Live public link:{" "}
              <code>{`${window.location.origin}/portfolio/${slug || "your-slug"}`}</code>
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="portfolio-desc" className={styles.label}>
              Description (Optional)
            </label>
            <textarea
              id="portfolio-desc"
              rows={2}
              className={styles.textarea}
              placeholder="Brief note about the focus or target audience for this portfolio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.rowFields}>
            <div className={styles.field}>
              <label htmlFor="portfolio-template" className={styles.label}>
                Base Data
              </label>
              <select
                id="portfolio-template"
                className={styles.select}
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                {activePortfolio && (
                  <option value={activePortfolio.id}>
                    Clone from Active ({activePortfolio.title})
                  </option>
                )}
                {portfolios
                  .filter((p) => p.id !== activePortfolio?.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      Clone from {p.title}
                    </option>
                  ))}
                <option value="">Clean Starter Template</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Default Theme</label>
              <div className={styles.themeRadioGroup}>
                <label
                  className={`${styles.themeOption} ${
                    theme === "light" ? styles.themeOptionSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={() => setTheme("light")}
                  />
                  <span>☀️ Light</span>
                </label>
                <label
                  className={`${styles.themeOption} ${
                    theme === "dark" ? styles.themeOptionSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={() => setTheme("dark")}
                  />
                  <span>🌙 Dark</span>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Create Portfolio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
