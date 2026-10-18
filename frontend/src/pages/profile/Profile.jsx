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
import Skills from "../../components/Skills/Skills";
import Experience from "../../components/Experience/Experience";
import Projects from "../../components/Projects/Projects";
import Achievements from "../../components/Achievements/Achievements";
import Certifications from "../../components/Certifications/Certifications";
import ExtraCurricular from "../../components/ExtraCurricular/ExtraCurricular";

function Profile() {
  const [profile, setProfile] = useState(sampleProfile);
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <>
      <Header />
      <main className={styles.profilePage}>
        <nav className={styles.mobileNav}>
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
          <button
            className={activeSection === "experience" ? styles.active : ""}
            onClick={() => setActiveSection("experience")}
          >
            Work Experience
          </button>
          <button
            className={activeSection === "projects" ? styles.active : ""}
            onClick={() => setActiveSection("projects")}
          >
            Projects
          </button>
          <button
            className={activeSection === "skills" ? styles.active : ""}
            onClick={() => setActiveSection("skills")}
          >
            Skills
          </button>
          <button
            className={activeSection === "achievements" ? styles.active : ""}
            onClick={() => setActiveSection("achievements")}
          >
            Achievements
          </button>
          <button
            className={activeSection === "certifications" ? styles.active : ""}
            onClick={() => setActiveSection("certifications")}
          >
            Certifications
          </button>
          <button
            className={activeSection === "extracurricular" ? styles.active : ""}
            onClick={() => setActiveSection("extracurricular")}
          >
            Extra-curricular
          </button>
          {/* <button
            className={activeSection === "others" ? styles.active : ""}
            onClick={() => setActiveSection("others")}
          >
            Others
          </button> */}
        </nav>
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
              <button
                className={activeSection === "experience" ? styles.active : ""}
                onClick={() => setActiveSection("experience")}
              >
                Work Experience
              </button>
              <button
                className={activeSection === "projects" ? styles.active : ""}
                onClick={() => setActiveSection("projects")}
              >
                Projects
              </button>
              <button
                className={activeSection === "skills" ? styles.active : ""}
                onClick={() => setActiveSection("skills")}
              >
                Skills
              </button>
              <button
                className={activeSection === "achievements" ? styles.active : ""}
                onClick={() => setActiveSection("achievements")}
              >
                Achievements
              </button>
              <button
                className={activeSection === "certifications" ? styles.active : ""}
                onClick={() => setActiveSection("certifications")}
              >
                Certifications
              </button>
              <button
                className={activeSection === "extracurricular" ? styles.active : ""}
                onClick={() => setActiveSection("extracurricular")}
              >
                Extra-curricular
              </button>
              {/* <button
                className={activeSection === "others" ? styles.active : ""}
                onClick={() => setActiveSection("others")}
              >
                Others
              </button> */}
            </nav>
            {/* <div className={styles.sidebarBottom}>
              <button>Help</button>
              <button>Logout</button>
            </div> */}
          </aside>
          <section className={styles.content}>
            <h1>
              {activeSection === "profile" && "Profile"}
              {activeSection === "education" && "Education"}
              {activeSection === "experience" && "Work Experience"}
              {activeSection === "projects" && "Projects"}
              {activeSection === "skills" && "Skills & Tools"}
              {activeSection === "achievements" && "Achievements"}
              {activeSection === "certifications" && "Certifications"}
              {activeSection === "extracurricular" && "Extra-curricular Activities"}
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
            {activeSection === "experience" && <Experience />}
            {activeSection === "projects" && <Projects />}
            {activeSection === "skills" && <Skills />}
            {activeSection === "achievements" && <Achievements />}
            {activeSection === "certifications" && <Certifications />}
            {activeSection === "extracurricular" && <ExtraCurricular />}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Profile;
