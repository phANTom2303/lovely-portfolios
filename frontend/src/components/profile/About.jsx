import styles from "./About.module.css";
import { useState } from "react";
import AboutDialog from "./AboutDialog";

function About({ profile, setProfile }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleSave(draftAbout) {
    setProfile((previous) => ({
      ...previous,
      about: draftAbout,
    }));
    setIsDialogOpen(false);
  }

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>About</h2>
          <button
            className={styles.editButton}
            type="button"
            onClick={() => setIsDialogOpen(true)}
            aria-label="Edit about"
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
        </div>

        <p className={styles.aboutText}>
          {profile.about || "Tell people about yourself."}
        </p>
      </section>

      {isDialogOpen && (
        <AboutDialog
          about={profile.about}
          onSave={handleSave}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}

export default About;
