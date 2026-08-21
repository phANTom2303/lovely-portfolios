import styles from "./ProfileImage.module.css";

function ProfileImage({ profile }) {
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
          <button type="button">Upload</button>

          <button type="button">Remove</button>
        </div>
      </section>
    </>
  );
}
export default ProfileImage;
