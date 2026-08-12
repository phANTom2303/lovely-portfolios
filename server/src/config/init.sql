-- ============================================================
-- Portfolio Database — PostgreSQL Initialization
-- Run once: psql -d <your_db> -f init.sql
-- ============================================================

-- ============================================================
-- RESET EXISTING TABLES
-- ============================================================

DROP TABLE IF EXISTS resume_entity CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS links CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ============================================================
-- RESET EXISTING ENUM TYPES
-- ============================================================

DROP TYPE IF EXISTS status_enum CASCADE;
DROP TYPE IF EXISTS re_type_enum CASCADE;
DROP TYPE IF EXISTS asset_type_enum CASCADE;
DROP TYPE IF EXISTS marks_type_enum CASCADE;
DROP TYPE IF EXISTS education_type_enum CASCADE;
DROP TYPE IF EXISTS gender_enum CASCADE;
-- ============================================================
-- Extensions
-- ============================================================

-- Provides gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- ENUM TYPES
-- ============================================================

-- User gender
CREATE TYPE gender_enum AS ENUM (
    'male',
    'female',
    'prefer_not_to_say',
    'other'
);

-- Education type
CREATE TYPE education_type_enum AS ENUM (
    'secondary',
    'higher_secondary',
    'under_graduate',
    'post_graduate',
    'diploma',
    'phd'
);

-- Education marks type
CREATE TYPE marks_type_enum AS ENUM (
    'percentage',
    'gpa'
);

-- Asset type
CREATE TYPE asset_type_enum AS ENUM (
    'image',
    'youtube'
);

-- Resume entity type
CREATE TYPE re_type_enum AS ENUM (
    'project',
    'work_exp',
    'certification',
    'achievements',
    'extra_curricular',
    'others'
);

-- Resume entity status
CREATE TYPE status_enum AS ENUM (
    'draft',
    'active',
    'deleted'
);


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(75) NOT NULL,
    email               VARCHAR(100) UNIQUE NOT NULL,
    password            VARCHAR(50),
    phone_no            VARCHAR(10) UNIQUE NOT NULL,
    gender              gender_enum,
    profile_photo_link  TEXT,

    -- IDs from the centralized links table
    links               INTEGER[],

    -- IDs from the skills table
    skills              INTEGER[],

    -- IDs from the education table
    educations          INTEGER[],
    professional_title  TEXT,
    about               TEXT,
    current_location    TEXT
);


-- ============================================================
-- LINKS
-- ============================================================

CREATE TABLE IF NOT EXISTS links (
    id          SERIAL PRIMARY KEY,
    link        TEXT,
    title       TEXT,
    description TEXT
);


-- ============================================================
-- ASSETS
-- ============================================================

CREATE TABLE IF NOT EXISTS assets (
    asset_id    SERIAL PRIMARY KEY,
    title       TEXT,
    link        TEXT,
    description TEXT,
    asset_type  asset_type_enum
);


-- ============================================================
-- SKILLS
-- ============================================================

CREATE TABLE IF NOT EXISTS skills (
    skill_id   SERIAL PRIMARY KEY,
    skill_name TEXT
);


-- ============================================================
-- EDUCATION
-- ============================================================

CREATE TABLE IF NOT EXISTS education (
    education_id    SERIAL PRIMARY KEY,
    institute_name  TEXT,
    education_type  education_type_enum,
    from_date       DATE,
    to_date         DATE,
    marks           NUMERIC,
    mark_type       marks_type_enum,
    total_mark      NUMERIC,
    stream          TEXT
);


-- ============================================================
-- RESUME ENTITY
-- ============================================================

CREATE TABLE IF NOT EXISTS resume_entity (
    re_id       SERIAL PRIMARY KEY,

    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,

    re_type     re_type_enum,
    title       TEXT,
    description TEXT,

    -- IDs from the centralized links table
    links_id    INTEGER[],

    -- IDs from the skills table
    skills_id   INTEGER[],

    -- IDs from the assets table
    assets_id   INTEGER[],

    from_date   DATE,
    to_date     DATE,

    status      status_enum
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- ----------------------------------------------------------
-- LINKS  (IDs 1–76)
--
-- 1–4   : User-level links (2 per user)
-- 5–40  : Resume-entity links for User 1 (3 per entity × 12 entities)
-- 41–76 : Resume-entity links for User 2 (3 per entity × 12 entities)
-- ----------------------------------------------------------

INSERT INTO links (link, title, description) VALUES
    -- User 1 profile links (1-2)
    ('https://github.com/anishgoenka',        'GitHub',   'Anish''s GitHub profile'),
    ('https://linkedin.com/in/anishgoenka',   'LinkedIn', 'Anish''s LinkedIn profile'),
    -- User 2 profile links (3-4)
    ('https://github.com/jaspreetkaur',       'GitHub',   'Jaspreet''s GitHub profile'),
    ('https://linkedin.com/in/jaspreetkaur',  'LinkedIn', 'Jaspreet''s LinkedIn profile'),

    -- ===== User 1 resume-entity links (5–40) =====
    -- Project 1 (5-7)
    ('https://github.com/anishgoenka/ecommerce-app',      'Source Code',  'GitHub repo for E-Commerce App'),
    ('https://ecommerce-demo.anish.dev',                   'Live Demo',    'Deployed E-Commerce application'),
    ('https://devpost.com/anish-ecommerce',                'Devpost',      'Devpost submission'),
    -- Project 2 (8-10)
    ('https://github.com/anishgoenka/weather-dashboard',   'Source Code',  'GitHub repo for Weather Dashboard'),
    ('https://weather.anish.dev',                          'Live Demo',    'Deployed Weather Dashboard'),
    ('https://medium.com/@anish/weather-app',              'Blog Post',    'Build guide on Medium'),
    -- Work Exp 1 (11-13)
    ('https://techcorp.com',                               'Company Site', 'TechCorp official website'),
    ('https://linkedin.com/company/techcorp',              'LinkedIn',     'TechCorp LinkedIn page'),
    ('https://medium.com/@anish/my-time-at-techcorp',      'Blog Post',    'Reflection blog post'),
    -- Work Exp 2 (14-16)
    ('https://innovatelabs.io',                            'Company Site', 'InnovateLabs official website'),
    ('https://innovatelabs.io/team',                       'Team Page',    'Team page featuring Anish'),
    ('https://github.com/innovatelabs/oss-contrib',        'Open Source',  'OSS contributions at InnovateLabs'),
    -- Certification 1 (17-19)
    ('https://coursera.org/verify/aws-sa',                 'Certificate',  'AWS Solutions Architect certificate'),
    ('https://aws.amazon.com/certification',               'AWS Certs',    'AWS certification portal'),
    ('https://credly.com/badges/anish-aws-sa',             'Credly Badge', 'Digital badge on Credly'),
    -- Certification 2 (20-22)
    ('https://coursera.org/verify/gcp-de',                 'Certificate',  'GCP Data Engineering certificate'),
    ('https://cloud.google.com/certification',             'GCP Certs',    'GCP certification portal'),
    ('https://credly.com/badges/anish-gcp-de',             'Credly Badge', 'Digital badge on Credly'),
    -- Achievement 1 (23-25)
    ('https://hackathon2025.dev/winners',                  'Winners List',     'National hackathon winners page'),
    ('https://twitter.com/hackathon2025/winner-anish',     'Announcement',     'Winner announcement tweet'),
    ('https://anish.dev/blog/hackathon-win',               'Blog Post',        'Blog post about the hackathon'),
    -- Achievement 2 (26-28)
    ('https://icpc.global/regionals2025/results',          'Results',          'ICPC Regional results page'),
    ('https://anish.dev/blog/icpc-journey',                'Blog Post',        'ICPC journey reflection'),
    ('https://codeforces.com/profile/anishg',              'CF Profile',       'Codeforces profile'),
    -- Extra Curricular 1 (29-31)
    ('https://gdsc.community.dev/anish',                   'GDSC Profile',     'Google DSC lead profile'),
    ('https://youtube.com/@anish-gdsc-talks',              'YouTube Channel',  'GDSC tech talk recordings'),
    ('https://gdsc.community.dev/events/anish-workshop',   'Workshop',         'Workshop event page'),
    -- Extra Curricular 2 (32-34)
    ('https://medium.com/@anish',                          'Blog',             'Technical blog on Medium'),
    ('https://dev.to/anishgoenka',                         'Dev.to Profile',   'Dev.to author profile'),
    ('https://hashnode.com/@anishgoenka',                  'Hashnode',         'Hashnode blog'),
    -- Others 1 (35-37)
    ('https://anish.dev/portfolio',                        'Portfolio',        'Personal portfolio website'),
    ('https://dribbble.com/anishgoenka',                   'Dribbble',         'Design portfolio on Dribbble'),
    ('https://figma.com/@anishgoenka',                     'Figma',            'Figma community profile'),
    -- Others 2 (38-40)
    ('https://kaggle.com/anishgoenka',                     'Kaggle',           'Kaggle data science profile'),
    ('https://anish.dev/research/ml-paper',                'Research Paper',   'Published ML research paper'),
    ('https://scholar.google.com/anishgoenka',             'Google Scholar',   'Google Scholar citations'),

    -- ===== User 2 resume-entity links (41–76) =====
    -- Project 1 (41-43)
    ('https://github.com/jaspreetkaur/task-manager',       'Source Code',  'GitHub repo for Task Manager'),
    ('https://taskmanager.jaspreet.dev',                    'Live Demo',    'Deployed Task Manager'),
    ('https://devpost.com/jaspreet-taskmanager',            'Devpost',      'Devpost submission'),
    -- Project 2 (44-46)
    ('https://github.com/jaspreetkaur/fitness-tracker',    'Source Code',  'GitHub repo for Fitness Tracker'),
    ('https://fitness.jaspreet.dev',                        'Live Demo',    'Deployed Fitness Tracker'),
    ('https://medium.com/@jaspreet/fitness-tracker',        'Blog Post',    'Build guide on Medium'),
    -- Work Exp 1 (47-49)
    ('https://datawave.ai',                                'Company Site', 'DataWave AI official website'),
    ('https://linkedin.com/company/datawaveai',            'LinkedIn',     'DataWave AI LinkedIn page'),
    ('https://medium.com/@jaspreet/datawave-journey',      'Blog Post',    'Blog post about DataWave experience'),
    -- Work Exp 2 (50-52)
    ('https://cloudnine.tech',                             'Company Site', 'CloudNine Tech official website'),
    ('https://cloudnine.tech/engineering',                 'Eng Blog',     'CloudNine engineering blog'),
    ('https://github.com/cloudnine/oss',                   'Open Source',  'CloudNine OSS contributions'),
    -- Certification 1 (53-55)
    ('https://coursera.org/verify/meta-fe',                'Certificate',  'Meta Front-End Developer certificate'),
    ('https://developers.facebook.com/certification',      'Meta Certs',   'Meta certification portal'),
    ('https://credly.com/badges/jaspreet-meta-fe',         'Credly Badge', 'Digital badge on Credly'),
    -- Certification 2 (56-58)
    ('https://coursera.org/verify/azure-ai',               'Certificate',  'Azure AI Engineer certificate'),
    ('https://learn.microsoft.com/certifications',         'MS Certs',     'Microsoft certification portal'),
    ('https://credly.com/badges/jaspreet-azure-ai',        'Credly Badge', 'Digital badge on Credly'),
    -- Achievement 1 (59-61)
    ('https://shecodesawards.org/2025/winners',            'Winners List',     'SheCodes Awards winners page'),
    ('https://twitter.com/shecodes/winner-jaspreet',       'Announcement',     'Winner announcement tweet'),
    ('https://jaspreet.dev/blog/shecodes-win',             'Blog Post',        'Blog post about SheCodes award'),
    -- Achievement 2 (62-64)
    ('https://gsoc.dev/2025/jaspreet',                     'GSoC Profile',     'Google Summer of Code profile'),
    ('https://jaspreet.dev/blog/gsoc-experience',          'Blog Post',        'GSoC experience write-up'),
    ('https://github.com/jaspreetkaur/gsoc-2025',          'GSoC Repo',        'GSoC project repository'),
    -- Extra Curricular 1 (65-67)
    ('https://womentechmakers.com/jaspreet',               'WTM Profile',      'Women Techmakers ambassador profile'),
    ('https://youtube.com/@jaspreet-wtm',                  'YouTube Channel',  'WTM talk recordings'),
    ('https://womentechmakers.com/events/jaspreet-talk',   'Event Page',       'Conference talk event page'),
    -- Extra Curricular 2 (68-70)
    ('https://opensource.jaspreet.dev',                     'OSS Portfolio',    'Open source contributions site'),
    ('https://github.com/jaspreetkaur?tab=contributions',  'GitHub Contribs',  'GitHub contribution graph'),
    ('https://jaspreet.dev/blog/oss-guide',                'Blog Post',        'Guide to open source contributing'),
    -- Others 1 (71-73)
    ('https://jaspreet.dev',                               'Portfolio',        'Personal portfolio website'),
    ('https://behance.net/jaspreetkaur',                   'Behance',          'Design portfolio on Behance'),
    ('https://figma.com/@jaspreetkaur',                    'Figma',            'Figma community profile'),
    -- Others 2 (74-76)
    ('https://jaspreet.dev/photography',                   'Photography',      'Photography portfolio'),
    ('https://instagram.com/jaspreet.clicks',              'Instagram',        'Photography Instagram'),
    ('https://unsplash.com/@jaspreetkaur',                 'Unsplash',         'Free photos on Unsplash');


-- ----------------------------------------------------------
-- SKILLS  (IDs 1–30)
--
-- 1–6   : User-level skills for User 1
-- 7–12  : User-level skills for User 2
-- 13–18 : Shared across User 1 resume entities (3 per entity, reused)
-- 19–24 : Additional for User 1 entities
-- 25–30 : Additional for User 2 entities
-- (Each resume entity will reference 3 skill_ids)
-- ----------------------------------------------------------

INSERT INTO skills (skill_name) VALUES
    -- User 1 top skills (1-6)
    ('JavaScript'),    -- 1
    ('React'),         -- 2
    ('Node.js'),       -- 3
    ('PostgreSQL'),    -- 4
    ('Python'),        -- 5
    ('Docker'),        -- 6
    -- User 2 top skills (7-12)
    ('TypeScript'),    -- 7
    ('Angular'),       -- 8
    ('Java'),          -- 9
    ('MongoDB'),       -- 10
    ('Kubernetes'),    -- 11
    ('Figma'),         -- 12
    -- Shared / extra skills (13-30)
    ('AWS'),           -- 13
    ('GCP'),           -- 14
    ('Redis'),         -- 15
    ('GraphQL'),       -- 16
    ('Terraform'),     -- 17
    ('CI/CD'),         -- 18
    ('Machine Learning'),  -- 19
    ('TensorFlow'),        -- 20
    ('Flutter'),           -- 21
    ('Swift'),             -- 22
    ('Go'),                -- 23
    ('Rust'),              -- 24
    ('Vue.js'),            -- 25
    ('Django'),            -- 26
    ('Kafka'),             -- 27
    ('Elasticsearch'),     -- 28
    ('C++'),               -- 29
    ('System Design');     -- 30


-- ----------------------------------------------------------
-- ASSETS  (IDs 1–72)
--
-- 3 assets per resume entity × 12 entities per user × 2 users = 72
-- 1–36  : User 1 resume-entity assets
-- 37–72 : User 2 resume-entity assets
-- ----------------------------------------------------------

INSERT INTO assets (title, link, description, asset_type) VALUES
    -- ===== User 1 assets (1–36) =====
    -- Project 1 (1-3)
    ('E-Commerce Homepage',          'https://cdn.anish.dev/ecommerce-home.png',         'Homepage screenshot',              'image'),
    ('E-Commerce Demo Walkthrough',  'https://youtube.com/watch?v=ec_demo_anish',        'Video walkthrough of the app',     'youtube'),
    ('E-Commerce Product Page',      'https://cdn.anish.dev/ecommerce-product.png',      'Product detail page screenshot',   'image'),
    -- Project 2 (4-6)
    ('Weather Dashboard UI',         'https://cdn.anish.dev/weather-dashboard.png',       'Dashboard main view',              'image'),
    ('Weather API Integration Demo', 'https://youtube.com/watch?v=weather_demo_anish',   'API integration walkthrough',      'youtube'),
    ('Weather Mobile View',          'https://cdn.anish.dev/weather-mobile.png',          'Mobile responsive view',           'image'),
    -- Work Exp 1 (7-9)
    ('TechCorp Office',              'https://cdn.anish.dev/techcorp-office.png',         'Office photo',                     'image'),
    ('TechCorp Intern Presentation', 'https://youtube.com/watch?v=techcorp_pres',        'Final intern presentation',        'youtube'),
    ('TechCorp Team Photo',          'https://cdn.anish.dev/techcorp-team.png',           'Team photo',                       'image'),
    -- Work Exp 2 (10-12)
    ('InnovateLabs Workspace',       'https://cdn.anish.dev/innovate-workspace.png',      'Workspace photo',                  'image'),
    ('InnovateLabs Product Demo',    'https://youtube.com/watch?v=innovate_demo',        'Product demo video',               'youtube'),
    ('InnovateLabs Architecture',    'https://cdn.anish.dev/innovate-arch.png',           'System architecture diagram',      'image'),
    -- Certification 1 (13-15)
    ('AWS SA Certificate',           'https://cdn.anish.dev/aws-sa-cert.png',             'AWS SA certificate image',         'image'),
    ('AWS SA Prep Journey',          'https://youtube.com/watch?v=aws_sa_prep',          'Preparation journey video',        'youtube'),
    ('AWS SA Badge',                 'https://cdn.anish.dev/aws-sa-badge.png',            'Digital badge image',              'image'),
    -- Certification 2 (16-18)
    ('GCP DE Certificate',           'https://cdn.anish.dev/gcp-de-cert.png',             'GCP DE certificate image',         'image'),
    ('GCP DE Study Plan',            'https://youtube.com/watch?v=gcp_de_study',         'Study plan walkthrough',           'youtube'),
    ('GCP DE Badge',                 'https://cdn.anish.dev/gcp-de-badge.png',            'Digital badge image',              'image'),
    -- Achievement 1 (19-21)
    ('Hackathon Trophy Photo',       'https://cdn.anish.dev/hackathon-trophy.png',        'Trophy photo',                     'image'),
    ('Hackathon Highlights',         'https://youtube.com/watch?v=hackathon_highlights', 'Event highlight reel',             'youtube'),
    ('Hackathon Team Presenting',    'https://cdn.anish.dev/hackathon-presenting.png',   'Team presenting to judges',        'image'),
    -- Achievement 2 (22-24)
    ('ICPC Medal Photo',             'https://cdn.anish.dev/icpc-medal.png',              'Regional medal photo',             'image'),
    ('ICPC Contest Recap',           'https://youtube.com/watch?v=icpc_recap',           'Contest recap video',              'youtube'),
    ('ICPC Scoreboard',              'https://cdn.anish.dev/icpc-scoreboard.png',         'Final scoreboard screenshot',      'image'),
    -- Extra Curricular 1 (25-27)
    ('GDSC Event Photo',             'https://cdn.anish.dev/gdsc-event.png',              'GDSC meetup photo',               'image'),
    ('GDSC Tech Talk Recording',     'https://youtube.com/watch?v=gdsc_techtalk',        'Tech talk recording',             'youtube'),
    ('GDSC Workshop Photo',          'https://cdn.anish.dev/gdsc-workshop.png',           'Workshop session photo',          'image'),
    -- Extra Curricular 2 (28-30)
    ('Blog Analytics Screenshot',    'https://cdn.anish.dev/blog-analytics.png',          'Blog readership analytics',       'image'),
    ('Blogging Journey Video',       'https://youtube.com/watch?v=blogging_journey',     'Blogging journey vlog',           'youtube'),
    ('Featured Article Screenshot',  'https://cdn.anish.dev/blog-featured.png',           'Featured article on Medium',      'image'),
    -- Others 1 (31-33)
    ('Portfolio Homepage',           'https://cdn.anish.dev/portfolio-home.png',           'Portfolio landing page',          'image'),
    ('Portfolio Walkthrough',        'https://youtube.com/watch?v=portfolio_tour',        'Portfolio site tour',             'youtube'),
    ('Portfolio Mobile View',        'https://cdn.anish.dev/portfolio-mobile.png',        'Mobile responsive view',          'image'),
    -- Others 2 (34-36)
    ('Kaggle Notebook Screenshot',   'https://cdn.anish.dev/kaggle-notebook.png',         'Kaggle notebook screenshot',      'image'),
    ('ML Paper Presentation',        'https://youtube.com/watch?v=ml_paper_pres',        'Paper presentation recording',    'youtube'),
    ('Research Poster',              'https://cdn.anish.dev/research-poster.png',         'Conference research poster',      'image'),

    -- ===== User 2 assets (37–72) =====
    -- Project 1 (37-39)
    ('Task Manager Dashboard',       'https://cdn.jaspreet.dev/taskmanager-dash.png',     'Dashboard screenshot',             'image'),
    ('Task Manager Demo',            'https://youtube.com/watch?v=tm_demo_jaspreet',     'Feature demo video',               'youtube'),
    ('Task Manager Kanban View',     'https://cdn.jaspreet.dev/taskmanager-kanban.png',   'Kanban board screenshot',          'image'),
    -- Project 2 (40-42)
    ('Fitness Tracker Home',         'https://cdn.jaspreet.dev/fitness-home.png',         'Home screen screenshot',           'image'),
    ('Fitness Tracker Walkthrough',  'https://youtube.com/watch?v=fitness_demo_jas',     'App walkthrough video',            'youtube'),
    ('Fitness Tracker Charts',       'https://cdn.jaspreet.dev/fitness-charts.png',       'Analytics charts screenshot',      'image'),
    -- Work Exp 1 (43-45)
    ('DataWave Office',              'https://cdn.jaspreet.dev/datawave-office.png',      'Office photo',                     'image'),
    ('DataWave Product Overview',    'https://youtube.com/watch?v=datawave_overview',    'Product overview video',           'youtube'),
    ('DataWave Team Photo',          'https://cdn.jaspreet.dev/datawave-team.png',        'Team photo',                       'image'),
    -- Work Exp 2 (46-48)
    ('CloudNine Workspace',          'https://cdn.jaspreet.dev/cloudnine-workspace.png', 'Workspace photo',                  'image'),
    ('CloudNine Tech Talk',          'https://youtube.com/watch?v=cloudnine_talk',       'Internal tech talk recording',     'youtube'),
    ('CloudNine Dashboard',          'https://cdn.jaspreet.dev/cloudnine-dashboard.png', 'Internal dashboard screenshot',    'image'),
    -- Certification 1 (49-51)
    ('Meta FE Certificate',          'https://cdn.jaspreet.dev/meta-fe-cert.png',         'Meta FE Dev certificate image',   'image'),
    ('Meta FE Prep Tips',            'https://youtube.com/watch?v=meta_fe_tips',         'Preparation tips video',          'youtube'),
    ('Meta FE Badge',                'https://cdn.jaspreet.dev/meta-fe-badge.png',        'Digital badge image',             'image'),
    -- Certification 2 (52-54)
    ('Azure AI Certificate',         'https://cdn.jaspreet.dev/azure-ai-cert.png',        'Azure AI certificate image',      'image'),
    ('Azure AI Study Guide',         'https://youtube.com/watch?v=azure_ai_guide',       'Study guide video',               'youtube'),
    ('Azure AI Badge',               'https://cdn.jaspreet.dev/azure-ai-badge.png',       'Digital badge image',             'image'),
    -- Achievement 1 (55-57)
    ('SheCodes Award Photo',         'https://cdn.jaspreet.dev/shecodes-award.png',       'Award ceremony photo',            'image'),
    ('SheCodes Event Recap',         'https://youtube.com/watch?v=shecodes_recap',       'Event recap video',               'youtube'),
    ('SheCodes Project Demo',        'https://cdn.jaspreet.dev/shecodes-demo.png',        'Winning project demo screenshot', 'image'),
    -- Achievement 2 (58-60)
    ('GSoC Dashboard',               'https://cdn.jaspreet.dev/gsoc-dashboard.png',       'GSoC project dashboard',          'image'),
    ('GSoC Final Presentation',      'https://youtube.com/watch?v=gsoc_final_jas',       'Final presentation recording',    'youtube'),
    ('GSoC Contribution Graph',      'https://cdn.jaspreet.dev/gsoc-contribs.png',        'Contribution graph screenshot',   'image'),
    -- Extra Curricular 1 (61-63)
    ('WTM Event Photo',              'https://cdn.jaspreet.dev/wtm-event.png',            'WTM summit event photo',          'image'),
    ('WTM Talk Recording',           'https://youtube.com/watch?v=wtm_talk_jas',         'Conference talk recording',       'youtube'),
    ('WTM Panel Photo',              'https://cdn.jaspreet.dev/wtm-panel.png',            'Panel discussion photo',          'image'),
    -- Extra Curricular 2 (64-66)
    ('OSS Contributions Page',       'https://cdn.jaspreet.dev/oss-contribs.png',         'OSS contributions overview',      'image'),
    ('OSS Journey Video',            'https://youtube.com/watch?v=oss_journey_jas',      'Open source journey video',       'youtube'),
    ('OSS PR Screenshot',            'https://cdn.jaspreet.dev/oss-pr.png',               'Notable PR screenshot',           'image'),
    -- Others 1 (67-69)
    ('Portfolio Landing Page',       'https://cdn.jaspreet.dev/portfolio-landing.png',    'Portfolio landing page',          'image'),
    ('Portfolio Tour Video',         'https://youtube.com/watch?v=portfolio_jas_tour',   'Portfolio site tour',             'youtube'),
    ('Portfolio Case Study',         'https://cdn.jaspreet.dev/portfolio-casestudy.png', 'Case study page screenshot',      'image'),
    -- Others 2 (70-72)
    ('Photography Portfolio',        'https://cdn.jaspreet.dev/photography-main.png',     'Photography portfolio hero',       'image'),
    ('Behind the Lens Video',        'https://youtube.com/watch?v=behind_lens_jas',      'Behind-the-lens video',           'youtube'),
    ('Best Shots Collage',           'https://cdn.jaspreet.dev/photography-collage.png', 'Best shots collage image',        'image');


-- ----------------------------------------------------------
-- EDUCATION  (IDs 1–4, two per user)
-- ----------------------------------------------------------

INSERT INTO education (institute_name, education_type, from_date, to_date, marks, mark_type, total_mark, stream) VALUES
    -- User 1
    ('Delhi Public School, R.K. Puram',       'higher_secondary', '2017-04-01', '2019-03-31', 92.4,  'percentage', 100,  'Science – PCM'),
    ('Indian Institute of Technology, Delhi',  'under_graduate',   '2019-08-01', '2023-06-30', 8.7,   'gpa',        10,   'Computer Science & Engineering'),
    -- User 2
    ('St. Xavier''s School, Mumbai',           'higher_secondary', '2016-04-01', '2018-03-31', 95.2,  'percentage', 100,  'Science – PCM'),
    ('BITS Pilani',                            'under_graduate',   '2018-08-01', '2022-06-30', 9.1,   'gpa',        10,   'Information Technology');


-- ----------------------------------------------------------
-- USERS  (2 users with links, skills, and educations arrays)
-- ----------------------------------------------------------

INSERT INTO users (name, email, password, phone_no, gender, profile_photo_link, links, skills, educations, professional_title, about, current_location) VALUES
    (
        'Anish Goenka',
        'anikavy.goenka@gmail.com',
        '1234',
        '8820549752',
        'male',
        'https://cdn.anish.dev/profile.png',
        ARRAY[1, 2],
        ARRAY[1, 2, 3, 4, 5, 6],
        ARRAY[1, 2],
        'Full-Stack Developer & Cloud Enthusiast',
        'Passionate full-stack developer with expertise in React, Node.js, and cloud-native architectures. I love building scalable web applications and contributing to open source.',
        'New Delhi, India'
    ),
    (
        'Jaspreet Kaur',
        'u2@gmail.com',
        '1234',
        '9087654321',
        'female',
        'https://cdn.jaspreet.dev/profile.png',
        ARRAY[3, 4],
        ARRAY[7, 8, 9, 10, 11, 12],
        ARRAY[3, 4],
        'Software Engineer & UI/UX Designer',
        'Software engineer with a keen eye for design. I specialize in TypeScript, Angular, and building beautiful, accessible user interfaces backed by robust APIs.',
        'Mumbai, India'
    );


-- ----------------------------------------------------------
-- RESUME ENTITIES
--
-- 12 per user (2 of each re_type_enum):
--   project, work_exp, certification, achievements,
--   extra_curricular, others
--
-- Each entity references 3 links_id, 3 skills_id, 3 assets_id
-- ----------------------------------------------------------

-- ===== USER 1 resume entities =====

-- Get User 1 UUID for FK
-- (We use a sub-select so the UUIDs are auto-resolved)

-- Project 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'project', 'E-Commerce Platform',
     'A full-featured e-commerce platform with product catalog, cart, payment gateway integration (Stripe), and admin dashboard. Built with React, Node.js, and PostgreSQL.',
     ARRAY[5, 6, 7], ARRAY[1, 2, 3], ARRAY[1, 2, 3],
     '2023-01-15', '2023-06-20', 'active');

-- Project 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'project', 'Real-Time Weather Dashboard',
     'A responsive weather dashboard that fetches live data from OpenWeatherMap API, displays 7-day forecasts, and uses Chart.js for data visualization. Deployed on Vercel.',
     ARRAY[8, 9, 10], ARRAY[1, 5, 4], ARRAY[4, 5, 6],
     '2022-09-01', '2022-12-15', 'active');

-- Work Exp 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'work_exp', 'Software Engineering Intern – TechCorp',
     'Developed RESTful APIs serving 50K+ daily requests. Optimized database queries reducing response times by 40%. Collaborated in an Agile team of 8 engineers.',
     ARRAY[11, 12, 13], ARRAY[3, 4, 6], ARRAY[7, 8, 9],
     '2022-05-01', '2022-08-31', 'active');

-- Work Exp 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'work_exp', 'Backend Developer – InnovateLabs',
     'Led microservices migration from monolith architecture. Implemented event-driven patterns with Kafka, reducing inter-service latency by 60%. Mentored 3 junior developers.',
     ARRAY[14, 15, 16], ARRAY[3, 6, 15], ARRAY[10, 11, 12],
     '2023-07-01', '2024-06-30', 'active');

-- Certification 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'certification', 'AWS Solutions Architect – Associate',
     'Earned the AWS Solutions Architect Associate certification demonstrating competency in designing distributed systems on AWS. Scored 892/1000.',
     ARRAY[17, 18, 19], ARRAY[13, 6, 17], ARRAY[13, 14, 15],
     '2023-03-01', '2023-03-15', 'active');

-- Certification 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'certification', 'GCP Professional Data Engineer',
     'Google Cloud Professional Data Engineer certification. Demonstrated expertise in designing data processing systems, ML model deployment, and BigQuery analytics.',
     ARRAY[20, 21, 22], ARRAY[14, 5, 19], ARRAY[16, 17, 18],
     '2023-09-01', '2023-09-20', 'active');

-- Achievement 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'achievements', 'National Hackathon Winner – HackIndia 2025',
     'Won first place among 500+ teams at HackIndia 2025. Built an AI-powered accessibility tool for visually impaired users using GPT-4 and computer vision.',
     ARRAY[23, 24, 25], ARRAY[5, 19, 20], ARRAY[19, 20, 21],
     '2025-02-10', '2025-02-12', 'active');

-- Achievement 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'achievements', 'ICPC Asia Regional – Silver Medal',
     'Secured silver medal at ICPC Asia Regional 2025. Solved 8 out of 12 problems. Team ranked 15th out of 300+ teams across the region.',
     ARRAY[26, 27, 28], ARRAY[29, 5, 30], ARRAY[22, 23, 24],
     '2025-01-18', '2025-01-19', 'active');

-- Extra Curricular 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'extra_curricular', 'Google Developer Student Club – Lead',
     'Led a 120-member developer community. Organized 15+ tech workshops, hackathons, and speaker sessions. Grew club membership by 200% in one academic year.',
     ARRAY[29, 30, 31], ARRAY[1, 2, 30], ARRAY[25, 26, 27],
     '2021-08-01', '2022-07-31', 'active');

-- Extra Curricular 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'extra_curricular', 'Technical Blogging – Medium & Dev.to',
     'Published 40+ technical articles on web development, system design, and cloud computing. Accumulated 100K+ total reads and 2K+ followers across platforms.',
     ARRAY[32, 33, 34], ARRAY[1, 3, 16], ARRAY[28, 29, 30],
     '2020-06-01', NULL, 'active');

-- Others 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'others', 'Personal Portfolio Website',
     'Designed and built a personal portfolio website featuring interactive 3D elements with Three.js, smooth scroll animations, and a dark/light theme toggle.',
     ARRAY[35, 36, 37], ARRAY[1, 2, 12], ARRAY[31, 32, 33],
     '2023-11-01', '2023-12-15', 'active');

-- Others 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'anikavy.goenka@gmail.com'),
     'others', 'Machine Learning Research – NLP Sentiment Analysis',
     'Co-authored a research paper on transformer-based sentiment analysis for low-resource languages. Published at ACL Workshop 2024. Achieved 94.2% F1 score.',
     ARRAY[38, 39, 40], ARRAY[5, 19, 20], ARRAY[34, 35, 36],
     '2024-01-01', '2024-05-30', 'active');


-- ===== USER 2 resume entities =====

-- Project 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'project', 'Collaborative Task Manager',
     'A real-time collaborative task management app with Kanban boards, drag-and-drop, WebSocket-based live updates, and role-based access control. Built with Angular and Java Spring Boot.',
     ARRAY[41, 42, 43], ARRAY[7, 8, 9], ARRAY[37, 38, 39],
     '2022-06-01', '2022-11-30', 'active');

-- Project 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'project', 'AI-Powered Fitness Tracker',
     'A fitness tracking app with AI-driven workout recommendations, calorie tracking via image recognition, and social challenges. Built with Flutter and Python backend.',
     ARRAY[44, 45, 46], ARRAY[21, 5, 10], ARRAY[40, 41, 42],
     '2023-02-01', '2023-07-15', 'active');

-- Work Exp 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'work_exp', 'Data Engineer – DataWave AI',
     'Built real-time data pipelines processing 2M+ events/day using Apache Kafka and Spark. Designed data warehouse schema on BigQuery. Reduced ETL runtime by 55%.',
     ARRAY[47, 48, 49], ARRAY[9, 27, 14], ARRAY[43, 44, 45],
     '2022-01-01', '2022-12-31', 'active');

-- Work Exp 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'work_exp', 'Frontend Engineer – CloudNine Tech',
     'Spearheaded the redesign of the customer-facing dashboard serving 100K+ users. Implemented design system in Angular, achieving 98% Lighthouse accessibility score.',
     ARRAY[50, 51, 52], ARRAY[7, 8, 12], ARRAY[46, 47, 48],
     '2023-01-01', '2024-06-30', 'active');

-- Certification 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'certification', 'Meta Front-End Developer Professional Certificate',
     'Completed the 9-course Meta Front-End Developer specialization on Coursera covering React, JavaScript, UX/UI design, and responsive web development.',
     ARRAY[53, 54, 55], ARRAY[2, 1, 12], ARRAY[49, 50, 51],
     '2022-08-01', '2022-11-30', 'active');

-- Certification 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'certification', 'Microsoft Azure AI Engineer Associate',
     'Azure AI Engineer Associate certification demonstrating proficiency in designing and implementing AI solutions using Azure Cognitive Services, Bot Service, and ML Studio.',
     ARRAY[56, 57, 58], ARRAY[19, 13, 17], ARRAY[52, 53, 54],
     '2023-05-01', '2023-06-15', 'active');

-- Achievement 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'achievements', 'SheCodes Awards 2025 – Best Web Application',
     'Won Best Web Application at SheCodes Awards 2025 for building an inclusive mental health platform with multilingual support and crisis resources.',
     ARRAY[59, 60, 61], ARRAY[7, 8, 25], ARRAY[55, 56, 57],
     '2025-03-08', '2025-03-10', 'active');

-- Achievement 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'achievements', 'Google Summer of Code 2025 – Selected Contributor',
     'Selected as GSoC 2025 contributor for Mozilla Firefox. Implemented WebGPU-based rendering optimizations that improved canvas performance by 35%.',
     ARRAY[62, 63, 64], ARRAY[29, 24, 23], ARRAY[58, 59, 60],
     '2025-05-01', '2025-08-31', 'active');

-- Extra Curricular 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'extra_curricular', 'Women Techmakers Ambassador',
     'Google Women Techmakers Ambassador. Organized 10+ events promoting women in tech. Mentored 25+ women developers through structured mentorship programs.',
     ARRAY[65, 66, 67], ARRAY[30, 12, 8], ARRAY[61, 62, 63],
     '2021-01-01', '2023-12-31', 'active');

-- Extra Curricular 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'extra_curricular', 'Open Source Contributor',
     'Active open source contributor with 50+ merged PRs across Angular, VS Code, and MDN Web Docs. Ranked in top 5% of contributors for Angular repository.',
     ARRAY[68, 69, 70], ARRAY[7, 8, 23], ARRAY[64, 65, 66],
     '2020-03-01', NULL, 'active');

-- Others 1
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'others', 'Personal Portfolio & Design Showcase',
     'A minimalist portfolio site built with Next.js and Framer Motion featuring case studies, interactive prototypes, and a custom CMS for managing projects.',
     ARRAY[71, 72, 73], ARRAY[7, 25, 12], ARRAY[67, 68, 69],
     '2023-10-01', '2023-12-20', 'active');

-- Others 2
INSERT INTO resume_entity (user_id, re_type, title, description, links_id, skills_id, assets_id, from_date, to_date, status) VALUES
    ((SELECT id FROM users WHERE email = 'u2@gmail.com'),
     'others', 'Photography Portfolio',
     'A curated photography portfolio showcasing street, travel, and architectural photography. Features lazy-loaded masonry grid and EXIF metadata display.',
     ARRAY[74, 75, 76], ARRAY[12, 25, 26], ARRAY[70, 71, 72],
     '2021-06-01', NULL, 'draft');


-- ============================================================
-- INDEXES
-- ============================================================

-- Useful when retrieving all resume entities for a user.
-- CREATE INDEX IF NOT EXISTS idx_resume_entity_user_id
-- ON resume_entity(user_id);
--
-- -- Useful when filtering resume entities by type.
-- CREATE INDEX IF NOT EXISTS idx_resume_entity_re_type
-- ON resume_entity(re_type);
--
-- -- Useful when filtering resume entities by status.
-- CREATE INDEX IF NOT EXISTS idx_resume_entity_status
-- ON resume_entity(status);
--
--
-- ============================================================
-- END
