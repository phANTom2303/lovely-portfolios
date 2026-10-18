import styles from "./SkillPickerDialog.module.css";
import { useState, useRef, useEffect } from "react";
import SkillBadge from "./SkillBadge";
import { allSkills } from "../../data/sampleSkills";

function SkillPickerDialog({ currentSkills = [], onSave, onClose }) {
  const [activeSkills, setActiveSkills] = useState(currentSkills);
  const [removedSkills, setRemovedSkills] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchWrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const trimmedQuery = searchValue.trim().toLowerCase();

  const searchResults = trimmedQuery
    ? allSkills.filter((item) => {
        const matchesQuery = item.skill_name
          .toLowerCase()
          .includes(trimmedQuery);
        const alreadyActive = activeSkills.some(
          (active) =>
            (active.skill_id || active.id) === (item.skill_id || item.id),
        );
        return matchesQuery && !alreadyActive;
      })
    : [];

  const hasExactMatch =
    trimmedQuery &&
    allSkills.some(
      (item) => item.skill_name.toLowerCase() === trimmedQuery,
    );

  function handleSelectSkill(skill) {
    setActiveSkills((previous) => [...previous, skill]);
    setRemovedSkills((previous) =>
      previous.filter(
        (item) => (item.skill_id || item.id) !== (skill.skill_id || skill.id),
      ),
    );
    setSearchValue("");
    setIsDropdownOpen(false);
  }

  function handleCreateNewSkill() {
    if (!searchValue.trim()) return;
    const newSkill = {
      skill_id: crypto.randomUUID(),
      skill_name: searchValue.trim(),
    };
    setActiveSkills((previous) => [...previous, newSkill]);
    setSearchValue("");
    setIsDropdownOpen(false);
  }

  function handleRemoveSkill(skillToRemove) {
    const id = skillToRemove.skill_id || skillToRemove.id;
    setActiveSkills((previous) =>
      previous.filter((item) => (item.skill_id || item.id) !== id),
    );
    setRemovedSkills((previous) => {
      const alreadyInRemoved = previous.some(
        (item) => (item.skill_id || item.id) === id,
      );
      return alreadyInRemoved ? previous : [...previous, skillToRemove];
    });
  }

  function handleRestoreSkill(skillToRestore) {
    const id = skillToRestore.skill_id || skillToRestore.id;
    setRemovedSkills((previous) =>
      previous.filter((item) => (item.skill_id || item.id) !== id),
    );
    setActiveSkills((previous) => [...previous, skillToRestore]);
  }

  function handleSave() {
    onSave(activeSkills);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.dialogHeader}>
          <h2>Edit skills</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className={styles.dialogBody}>
          <div className={styles.searchSection}>
            <h3>Add Skill</h3>
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
                placeholder="Search skills"
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchValue.trim()) {
                    setIsDropdownOpen(true);
                  }
                }}
              />

              {isDropdownOpen && trimmedQuery && (
                <div className={styles.dropdown}>
                  {searchResults.map((item) => (
                    <button
                      key={item.skill_id}
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => handleSelectSkill(item)}
                    >
                      <span>{item.skill_name}</span>
                      <span aria-hidden="true">+</span>
                    </button>
                  ))}

                  {!hasExactMatch && (
                    <button
                      type="button"
                      className={`${styles.dropdownItem} ${styles.dropdownCreateItem}`}
                      onClick={handleCreateNewSkill}
                    >
                      <span>Add &quot;{searchValue.trim()}&quot; (new skill)</span>
                      <span aria-hidden="true">+</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.skillsContainer}>
            <div className={styles.activeSkillsArea}>
              {activeSkills.length > 0 ? (
                activeSkills.map((skill) => {
                  const id = skill.skill_id || skill.id;
                  const name = skill.skill_name || skill.name;
                  return (
                    <SkillBadge
                      key={id}
                      name={name}
                      onRemove={() => handleRemoveSkill(skill)}
                    />
                  );
                })
              ) : (
                <p className={styles.emptyActive}>
                  No active skills. Search above to add skills.
                </p>
              )}
            </div>

            <hr className={styles.containerDivider} />

            <div className={styles.removedSection}>
              <h4 className={styles.shelfLabel}>Removed (click to restore)</h4>
              <div className={styles.removedSkillsArea}>
                {removedSkills.length > 0 ? (
                  removedSkills.map((skill) => {
                    const id = skill.skill_id || skill.id;
                    const name = skill.skill_name || skill.name;
                    return (
                      <SkillBadge
                        key={id}
                        name={name}
                        onRestore={() => handleRestoreSkill(skill)}
                      />
                    );
                  })
                ) : (
                  <p className={styles.emptyShelf}>
                    Removed skills will appear here so you can easily restore miss-clicks.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.dialogFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default SkillPickerDialog;
