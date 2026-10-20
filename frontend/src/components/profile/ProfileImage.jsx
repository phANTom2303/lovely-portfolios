import styles from "./ProfileImage.module.css";
import { useState } from "react";
import ProfileImageDialog from "./ProfileImageDialog";

function ProfileImage({ profile, setProfile }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleSave({ file, previewUrl }) {
    setProfile((previous) => ({
      ...previous,
      profileImage: previewUrl,
      profileImageFile: file,
    }));
    setIsDialogOpen(false);
  }

  function handleRemove() {
    setProfile((previous) => ({
      ...previous,
      profileImage: null,
      profileImageFile: null,
    }));
  }

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Profile Image</h2>
        </div>
        <div className={styles.content}>
          <div className={styles.imageWrapper}>
            <img
              className={styles.image}
              src={profile.profileImage || "/Images/image.png"}
              alt="Profile"
            />
          </div>
        </div>
        <div className={styles.cardFooter}>
          <button type="button" onClick={() => setIsDialogOpen(true)}>
            {profile.profileImage ? "Change" : "Upload"}
          </button>

          <button
            type="button"
            onClick={handleRemove}
            disabled={!profile.profileImage}
          >
            Remove
          </button>
        </div>
      </section>

      {isDialogOpen && (
        <ProfileImageDialog
          currentImage={profile.profileImage}
          onSave={handleSave}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}

export default ProfileImage;
