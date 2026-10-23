import styles from "./Socials.module.css";
import { useState } from "react";
import SocialsDialog from "./SocialsDialog";

function Socials({ profile, setProfile }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleSaveSocials(updatedSocials) {
    setProfile((previous) => ({
      ...previous,
      socials: updatedSocials,
    }));
    setIsDialogOpen(false);
  }

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Socials</h2>
          <button
            className={styles.editButton}
            type="button"
            onClick={() => setIsDialogOpen(true)}
            aria-label="Add or edit socials"
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
            <span>Add / Edit</span>
          </button>
        </div>

        <div className={styles.socialList}>
          {profile.socials?.length ? (
            profile.socials.map((social) => (
              <div className={styles.socialItem} key={social.id}>
                <span className={styles.socialTitle}>{social.title}</span>
                {social.url && (
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.visitLink}
                    aria-label={`Visit ${social.title}`}
                  >
                    <span>Visit</span>
                    <span className={styles.arrowIcon}>↗</span>
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className={styles.emptyState}>
              Add links to your professional profiles. Click &quot;Add / Edit&quot; to begin.
            </p>
          )}
        </div>
      </section>

      {isDialogOpen && (
        <SocialsDialog
          socials={profile.socials || []}
          onSave={handleSaveSocials}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}

export default Socials;
