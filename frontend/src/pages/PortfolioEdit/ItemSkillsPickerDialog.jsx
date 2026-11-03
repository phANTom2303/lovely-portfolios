import { useState, useRef, useEffect } from "react";
import SkillBadge from "../../components/shared/SkillBadge";
import styles from "./ItemSkillsPickerDialog.module.css";

export default function ItemSkillsPickerDialog({ isOpen, ...props }) {
  if (!isOpen) return null;
  return <ItemSkillsPickerDialogContent {...props} />;
}

function ItemSkillsPickerDialogContent({
  itemTitle = "Item",
  currentSkills = [],
  candidateSkills = [],
  onSave,
  onClose,
}) {
  const [activeSkills, setActiveSkills] = useState(() => {
    return [...currentSkills].map((s) =>
      typeof s === "object" ? s.skill_name || s.name : String(s)
    );
  });

  const [removedSkills, setRemovedSkills] = useState(() => {
    const active = [...currentSkills].map((s) =>
      typeof s === "object" ? s.skill_name || s.name : String(s)
    );
    const activeLowerSet = new Set(active.map((s) => s.toLowerCase()));

    const candidatePool = [...candidateSkills].map((s) =>
      typeof s === "object" ? s.skill_name || s.name : String(s)
    );

    const initialRemoved = [];
    candidatePool.forEach((s) => {
      if (
        s &&
        !activeLowerSet.has(s.toLowerCase()) &&
        !initialRemoved.some((r) => r.toLowerCase() === s.toLowerCase())
      ) {
        initialRemoved.push(s);
      }
    });

    return initialRemoved;
  });

  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchWrapperRef = useRef(null);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const trimmedQuery = searchValue.trim().toLowerCase();

  // Combine removed skills and any other candidate skills for search suggestions
  const allCandidatePool = Array.from(
    new Set([
      ...removedSkills,
      ...candidateSkills.map((s) => (typeof s === "object" ? s.skill_name || s.name : String(s))),
    ])
  );

  const searchResults = trimmedQuery
    ? allCandidatePool.filter((item) => {
        const matchesQuery = item.toLowerCase().includes(trimmedQuery);
        const alreadyActive = activeSkills.some((active) => active.toLowerCase() === item.toLowerCase());
        return matchesQuery && !alreadyActive;
      })
    : [];

  const handleSelectSkill = (skill) => {
    if (!activeSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setActiveSkills((prev) => [...prev, skill]);
      setRemovedSkills((prev) => prev.filter((s) => s.toLowerCase() !== skill.toLowerCase()));
    }
    setSearchValue("");
    setIsDropdownOpen(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setActiveSkills((prev) => prev.filter((s) => s !== skillToRemove));
    setRemovedSkills((prev) => {
      const exists = prev.some((s) => s.toLowerCase() === skillToRemove.toLowerCase());
      return exists ? prev : [...prev, skillToRemove];
    });
  };

  const handleRestoreSkill = (skillToRestore) => {
    setRemovedSkills((prev) => prev.filter((s) => s !== skillToRestore));
    setActiveSkills((prev) => {
      const exists = prev.some((s) => s.toLowerCase() === skillToRestore.toLowerCase());
      return exists ? prev : [...prev, skillToRestore];
    });
  };

  const handleSave = () => {
    onSave(activeSkills);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.dialogHeader}>
          <div className={styles.titleArea}>
            <h2 className={styles.dialogTitle}>Manage Skills</h2>
            <span className={styles.dialogSubtitle}>
              Select which skills are displayed for {itemTitle}
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
        <div className={styles.dialogBody}>
          {/* Search section */}
          <div className={styles.searchSection}>
            <span className={styles.sectionHeading}>Search Existing Skills</span>
            <div className={styles.searchWrapper} ref={searchWrapperRef}>
              <svg
                className={styles.searchIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search existing skills for this item..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchValue.trim()) setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (searchResults.length > 0) {
                      handleSelectSkill(searchResults[0]);
                    }
                  }
                }}
              />

              {isDropdownOpen && trimmedQuery && (
                <div className={styles.dropdown}>
                  {searchResults.length > 0 ? (
                    searchResults.map((skillName) => (
                      <button
                        key={skillName}
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => handleSelectSkill(skillName)}
                      >
                        <span>{skillName}</span>
                        <span aria-hidden="true">+</span>
                      </button>
                    ))
                  ) : (
                    <div className={styles.noResultsItem}>
                      No matching existing skill found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Shelves Container */}
          <div className={styles.skillsShelvesContainer}>
            {/* Active Displayed Skills Shelf */}
            <div className={styles.activeSection}>
              <div className={styles.areaHeader}>
                <span className={styles.shelfLabel}>
                  Displayed Skills ({activeSkills.length})
                </span>
                <span className={styles.areaHint}>Visible in portfolio</span>
              </div>
              <div className={styles.activeSkillsArea}>
                {activeSkills.length > 0 ? (
                  activeSkills.map((skill) => (
                    <SkillBadge
                      key={skill}
                      name={skill}
                      onRemove={() => handleRemoveSkill(skill)}
                    />
                  ))
                ) : (
                  <p className={styles.emptyShelf}>
                    No skills selected. Pick from hidden skills below or search to add.
                  </p>
                )}
              </div>
            </div>

            <hr className={styles.containerDivider} />

            {/* Removed / Hidden Shelf */}
            <div className={styles.removedSection}>
              <div className={styles.areaHeader}>
                <span className={styles.shelfLabel}>
                  Hidden / Available Skills ({removedSkills.length})
                </span>
                <span className={styles.areaHint}>Click any skill to restore</span>
              </div>
              <div className={styles.removedSkillsArea}>
                {removedSkills.length > 0 ? (
                  removedSkills.map((skill) => (
                    <SkillBadge
                      key={skill}
                      name={skill}
                      onRestore={() => handleRestoreSkill(skill)}
                    />
                  ))
                ) : (
                  <p className={styles.emptyShelf}>
                    Hidden or removed skills will appear here so you can easily restore them.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.dialogFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.saveButton} onClick={handleSave}>
            Save Skills
          </button>
        </div>
      </div>
    </div>
  );
}
