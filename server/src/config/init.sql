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

    -- IDs from the skills table
    skills              INTEGER[],

    professional_title  TEXT,
    about               TEXT,
    current_location    TEXT
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
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
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

    -- IDs from the skills table
    skills_id   INTEGER[],

    from_date   DATE,
    to_date     DATE,

    status      status_enum
);


-- ============================================================
-- LINKS
-- ============================================================

CREATE TABLE IF NOT EXISTS links (
    id          SERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    re_id       INTEGER REFERENCES resume_entity(re_id) ON DELETE CASCADE,
    link        TEXT,
    title       TEXT,
    description TEXT
);


-- ============================================================
-- ASSETS
-- ============================================================

CREATE TABLE IF NOT EXISTS assets (
    asset_id    SERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    re_id       INTEGER REFERENCES resume_entity(re_id) ON DELETE CASCADE,
    title       TEXT,
    link        TEXT,
    description TEXT,
    asset_type  asset_type_enum
);


-- ============================================================
-- INSERT DUMMY DATA
-- ============================================================

-- Insert Skills
INSERT INTO skills (skill_name) VALUES 
('JavaScript'),
('PostgreSQL'),
('React'),
('Node.js'),
('Python');

-- Insert User
INSERT INTO users (id, name, email, password, phone_no, gender, profile_photo_link, skills, professional_title, about, current_location)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Guddu Bhaiya', 
    'bhaiya@guddu.com', 
    'password123', 
    '1234567890', 
    'male', 
    'https://example.com/photo.jpg', 
    '{1,2,3,4,5}', 
    'Full Stack Developer', 
    'Passionate developer with 5 years of experience.', 
    'New York, NY'
);

-- Insert Education
INSERT INTO education (user_id, institute_name, education_type, from_date, to_date, marks, mark_type, total_mark, stream)
VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'University of Tech', 'post_graduate', '2019-08-01', '2021-05-01', 3.8, 'gpa', 4.0, 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440000', 'State College', 'under_graduate', '2015-08-01', '2019-05-01', 3.6, 'gpa', 4.0, 'Software Engineering'),
('550e8400-e29b-41d4-a716-446655440000', 'High School', 'higher_secondary', '2013-08-01', '2015-05-01', 92.5, 'percentage', 100, 'Science');

-- Insert Resume Entities
INSERT INTO resume_entity (re_id, user_id, re_type, title, description, skills_id, from_date, to_date, status)
VALUES 
(1, '550e8400-e29b-41d4-a716-446655440000', 'work_exp', 'Software Engineer at TechCorp', 'Developed web applications using React and Node.js.', '{1,3,4}', '2021-06-01', '2023-08-01', 'active'),
(2, '550e8400-e29b-41d4-a716-446655440000', 'project', 'Portfolio Website', 'Built a personal portfolio website to showcase my projects.', '{1,3}', '2020-01-01', '2020-03-01', 'active'),
(3, '550e8400-e29b-41d4-a716-446655440000', 'certification', 'AWS Certified Developer', 'Achieved AWS Certified Developer - Associate certification.', NULL, '2022-05-01', NULL, 'active'),
(4, '550e8400-e29b-41d4-a716-446655440000', 'achievements', 'Hackathon Winner', 'Won 1st place in the annual city hackathon for developing an AI tool.', '{5}', '2019-10-01', '2019-10-03', 'active');

-- Insert User Profile Links (re_id is NULL)
INSERT INTO links (user_id, re_id, link, title, description)
VALUES 
('550e8400-e29b-41d4-a716-446655440000', NULL, 'https://github.com/johndoe', 'GitHub', 'My GitHub Profile'),
('550e8400-e29b-41d4-a716-446655440000', NULL, 'https://linkedin.com/in/johndoe', 'LinkedIn', 'My LinkedIn Profile'),
('550e8400-e29b-41d4-a716-446655440000', NULL, 'https://twitter.com/johndoe', 'Twitter', 'My Twitter Handle'),
('550e8400-e29b-41d4-a716-446655440000', NULL, 'https://johndoe.dev', 'Personal Website', 'My personal blog and site');

-- Insert Resume Entity Links (at least 2 links for each of the 4 REs)
INSERT INTO links (user_id, re_id, link, title, description)
VALUES 
-- Links for RE 1 (Work Exp)
('550e8400-e29b-41d4-a716-446655440000', 1, 'https://techcorp.com', 'Company Website', 'TechCorp official website'),
('550e8400-e29b-41d4-a716-446655440000', 1, 'https://github.com/techcorp/project', 'Project Repository', 'A public repo I contributed to'),

-- Links for RE 2 (Project)
('550e8400-e29b-41d4-a716-446655440000', 2, 'https://github.com/johndoe/portfolio', 'Source Code', 'GitHub repository for the portfolio'),
('550e8400-e29b-41d4-a716-446655440000', 2, 'https://portfolio.johndoe.dev', 'Live Demo', 'Live version of the portfolio'),

-- Links for RE 3 (Certification)
('550e8400-e29b-41d4-a716-446655440000', 3, 'https://aws.amazon.com/certification/', 'AWS Certification', 'Info about the certification'),
('550e8400-e29b-41d4-a716-446655440000', 3, 'https://credly.com/badges/xyz', 'Digital Badge', 'My Credly digital badge'),

-- Links for RE 4 (Achievement)
('550e8400-e29b-41d4-a716-446655440000', 4, 'https://cityhackathon.com/winners/2019', 'Hackathon Results', 'Official list of winners'),
('550e8400-e29b-41d4-a716-446655440000', 4, 'https://github.com/johndoe/hackathon-ai', 'Hackathon Project', 'Source code for the winning project');
