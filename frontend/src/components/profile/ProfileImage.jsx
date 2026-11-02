import styles from "./ProfileImage.module.css";
import { useState } from "react";
import ProfileImageDialog from "./ProfileImageDialog";
import { deleteAsset, uploadImageAsset } from "../../api/assetsApi";
import { updateUser } from "../../api/userApi";

function ProfileImage({ profile, setProfile }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleSave({ file }) {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("title", "Profile image");
      formData.append("asset_type", "image");
      formData.append("assets", file);

      const asset = await uploadImageAsset(formData);
      const updatedUser = await updateUser({ profile_photo_link: asset.link });

      if (profile.profileImageAssetId) {
        await deleteAsset(profile.profileImageAssetId);
      }

      setProfile((previous) => ({
        ...previous,
        profileImage: updatedUser.profile_photo_link || asset.link,
        profileImageAssetId: asset.asset_id,
      }));
    } catch (error) {
      console.error("Failed to save profile image:", error);
      alert("Failed to save profile image");
      return;
    }
    setIsDialogOpen(false);
  }

  async function handleRemove() {
    try {
      if (profile.profileImageAssetId) {
        await deleteAsset(profile.profileImageAssetId);
      }
      await updateUser({ profile_photo_link: null });
      setProfile((previous) => ({
        ...previous,
        profileImage: null,
        profileImageAssetId: null,
      }));
    } catch (error) {
      console.error("Failed to remove profile image:", error);
      alert("Failed to remove profile image");
    }
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
