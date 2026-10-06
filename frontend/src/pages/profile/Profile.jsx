import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import sampleProfile from "../../data/sampleProfile";
import styles from "./Profile.module.css";
import { useState } from "react";
import CoreDetails from "../../components/profile/CoreDetails";
import ProfileImage from "../../components/profile/ProfileImage";
import About from "../../components/profile/About";
import Socials from "../../components/profile/Socials";
import Education from "../../components/Education/Education";
function Profile() {
  const [profile, setProfile] = useState(sampleProfile);
  const [activeSection, setActiveSection] = useState("profile");
  return (
    <>
      <Header />
      <main className={styles.profilePage}>
        <div className={styles.profileLayout}>
          <aside className={styles.sidebar}>
            <nav>
              <button
                className={activeSection === "profile" ? styles.active : ""}
                onClick={() => setActiveSection("profile")}
              >
                Profile
              </button>
              <button
                className={activeSection === "education" ? styles.active : ""}
                onClick={() => setActiveSection("education")}
              >
                Education
              </button>
              <button onClick={() => setActiveSection("experience")}>
                Experience
              </button>
              <button onClick={() => setActiveSection("projects")}>
                Projects
              </button>
              <button onClick={() => setActiveSection("skills")}>Skills</button>

              <button onClick={() => setActiveSection("achievements")}>
                Achievements
              </button>

              <button onClick={() => setActiveSection("certifications")}>
                Certifications
              </button>

              <button onClick={() => setActiveSection("extracurricular")}>
                Extra-curricular
              </button>

              <button onClick={() => setActiveSection("others")}>Others</button>
            </nav>
            <div className={styles.sidebarBottom}>
              <button>Help</button>
              <button>Logout</button>
            </div>
          </aside>
          <section className={styles.content}>
            <h1>
              {activeSection === "profile" && "Profile"}
              {activeSection === "education" && "Education"}
            </h1>
            {activeSection === "profile" && (
              <div className={styles.profileRows}>
                <div className={styles.profileTopRow}>
                  <ProfileImage profile={profile} setProfile={setProfile} />
                  <CoreDetails profile={profile} setProfile={setProfile} />
                </div>

                <div className={styles.profileBottomRow}>
                  <About profile={profile} setProfile={setProfile} />
                  <Socials profile={profile} setProfile={setProfile} />
                </div>
              </div>
            )}
            {activeSection === "education" && <Education />}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
export default Profile;
