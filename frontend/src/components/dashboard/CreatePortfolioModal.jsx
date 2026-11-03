import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { generatePortfolio } from "../../api/portfolioApi";
import { getErrorMessage } from "../../utils/getErrorMessage";
import styles from "./CreatePortfolioModal.module.css";

const LOADING_MESSAGES = [
  "Analysing the job description…",
  "Extracting the skills that matter…",
  "Scoring your experience against the role…",
  "Picking your strongest projects…",
  "Fine-tuning your work…",
  "Rewriting highlights in the right voice…",
  "Polishing your portfolio…",
];

const MESSAGE_INTERVAL_MS = 2600;

export default function CreatePortfolioModal({ isOpen, onClose, onCreated }) {
  const [jdText, setJdText] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setJdText("");
      setError("");
      setMessageIndex(0);
    }
  }

  useEffect(() => {
    if (!isGenerating) return;
    const timer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isGenerating]);

  if (!isOpen) return null;

  // Generation keeps running server-side, so the dialog cannot be dismissed mid-request
  const handleClose = () => {
    if (!isGenerating) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = jdText.trim();
    if (!trimmed) {
      setError("Please paste a job description to tailor your portfolio to.");
      return;
    }

    setError("");
    setMessageIndex(0);
    setIsGenerating(true);
    try {
      const result = await generatePortfolio(trimmed);
      setIsGenerating(false);
      onCreated(result);
      onClose();
    } catch (err) {
      setIsGenerating(false);
      setError(getErrorMessage(err, "Failed to generate portfolio. Please try again."));
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Create New Portfolio</h2>
            <p className={styles.modalSubtitle}>
              Paste a job description and we&apos;ll tailor a portfolio from your profile to match it.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            disabled={isGenerating}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {isGenerating ? (
          <div className={styles.generatingState} role="status" aria-live="polite">
            <div className={styles.orbit} aria-hidden="true">
              <span className={styles.orbitDot} />
              <span className={styles.orbitDot} />
              <span className={styles.orbitDot} />
            </div>

            <div className={styles.messageSlot}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  className={styles.generatingMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {LOADING_MESSAGES[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className={styles.progressTrack} aria-hidden="true">
              <span className={styles.progressBar} />
            </div>

            <p className={styles.generatingHint}>
              This usually takes under a minute. Please keep this window open.
            </p>
          </div>
        ) : (
          <>
            {error && <div className={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="portfolio-jd" className={styles.label}>
                  Job Description <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="portfolio-jd"
                  className={`${styles.textarea} ${styles.jdTextarea}`}
                  placeholder="e.g. We are looking for a Backend Engineer experienced in Node.js and PostgreSQL..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={10}
                  autoFocus
                  required
                />
                <span className={styles.hint}>
                  {jdText.trim().length} characters · The generated portfolio is saved as a draft for you to review.
                </span>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  ✦ Generate Portfolio
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
