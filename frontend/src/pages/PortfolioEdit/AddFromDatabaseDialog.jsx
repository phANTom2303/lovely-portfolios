import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { SECTION_SOURCES, getItemKey, loadSourceRecords } from "./sourceRecords";
import styles from "./AddFromDatabaseDialog.module.css";

function formatMonthYear(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function AddFromDatabaseDialog({
  isOpen,
  sectionKey,
  currentItems = [],
  onAdd,
  onClose,
}) {
  const config = SECTION_SOURCES[sectionKey];
  const requestKey = isOpen && config ? sectionKey : null;
  const [state, setState] = useState({ requestKey: null, candidates: [], error: "" });
  const [reloadToken, setReloadToken] = useState(0);
  const isLoading = Boolean(requestKey) && state.requestKey !== requestKey;

  // Fetch fresh records every time the dialog opens for a section
  useEffect(() => {
    if (!requestKey) return;
    let isMounted = true;
    loadSourceRecords(requestKey)
      .then((candidates) => {
        if (isMounted) setState({ requestKey, candidates, error: "" });
      })
      .catch((err) => {
        if (isMounted) {
          setState({
            requestKey,
            candidates: [],
            error: getErrorMessage(err, "Failed to load records from your profile."),
          });
        }
      });
    return () => {
      isMounted = false;
      // Forget the result so the next open shows a loading state and refetches
      setState({ requestKey: null, candidates: [], error: "" });
    };
  }, [requestKey, reloadToken]);

  const availableCandidates = useMemo(() => {
    if (isLoading || !sectionKey) return [];
    const currentKeys = new Set(currentItems.map((it) => getItemKey(sectionKey, it)));
    return state.candidates.filter((cand) => {
      const key = getItemKey(sectionKey, cand.item);
      return key && !currentKeys.has(key);
    });
  }, [isLoading, sectionKey, currentItems, state.candidates]);

  if (!isOpen || !config) return null;

  // The dialog stays open so several records can be added in one go;
  // added records drop out of the list because they are now in currentItems.
  const handleSelect = (candidate) => {
    onAdd(JSON.parse(JSON.stringify(candidate.item)));
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className={styles.emptyState} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <p className={styles.emptyDesc}>Loading your {config.title.toLowerCase()}…</p>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className={styles.emptyState} role="alert">
          <h3 className={styles.emptyTitle}>Couldn&apos;t load records</h3>
          <p className={styles.emptyDesc}>{state.error}</p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setReloadToken((t) => t + 1)}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (state.candidates.length === 0) {
      return (
        <div className={styles.emptyState}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
          <h3 className={styles.emptyTitle}>No Records Yet</h3>
          <p className={styles.emptyDesc}>
            You haven&apos;t saved any {config.title.toLowerCase()} to your profile yet.{" "}
            <Link to="/profile" target="_blank" rel="noopener noreferrer">
              Add some on your profile
            </Link>{" "}
            and reopen this dialog.
          </p>
        </div>
      );
    }

    if (availableCandidates.length === 0) {
      return (
        <div className={styles.emptyState}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3 className={styles.emptyTitle}>All Records Added</h3>
          <p className={styles.emptyDesc}>
            All {config.title.toLowerCase()} from your profile are already included in this portfolio.
          </p>
        </div>
      );
    }

    return (
      <div className={styles.candidateList}>
        {availableCandidates.map((cand) => {
          const it = cand.item;
          const mainTitle =
            sectionKey === "education"
              ? it.stream
                ? `${it.degree} — ${it.stream}`
                : it.degree
              : it[config.titleField] || "Untitled";
          const subtitle =
            sectionKey === "education"
              ? [it.institute_name, it.grade].filter(Boolean).join(" • ")
              : it[config.subtitleField];
          const dateText = it.from_date
            ? `${formatMonthYear(it.from_date)} — ${it.to_date ? formatMonthYear(it.to_date) : "Present"}`
            : "";
          const descSnippet = it.description ? it.description.split("\n")[0].slice(0, 110) : "";
          const skills = it.skills || [];

          return (
            <div key={cand.id} className={styles.candidateCard}>
              <div className={styles.cardMain}>
                <div className={styles.cardTitleRow}>
                  <h4 className={styles.cardTitle}>{mainTitle}</h4>
                  {dateText && <span className={styles.cardDate}>{dateText}</span>}
                  {cand.isDraft && <span className={styles.draftPill}>Draft</span>}
                </div>
                {subtitle && <span className={styles.cardSubtitle}>{subtitle}</span>}
                {descSnippet && (
                  <p className={styles.cardDesc}>
                    {descSnippet}
                    {it.description.length > descSnippet.length ? "..." : ""}
                  </p>
                )}
                {skills.length > 0 && (
                  <div className={styles.cardSkillsRow}>
                    {skills.slice(0, 4).map((sk) => (
                      <span key={sk} className={styles.skillPill}>
                        {sk}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span className={styles.moreSkillsPill}>+{skills.length - 4} more</span>
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
    );
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
        <div className={styles.dialogBody}>{renderBody()}</div>

        {/* Footer */}
        <div className={styles.dialogFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
