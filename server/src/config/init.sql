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
    phone_no            VARCHAR(10), UNIQUE NOT NULL
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
-
