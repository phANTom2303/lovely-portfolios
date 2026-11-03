// Loads the user's saved profile records (resume entities / education) and converts
// them into portfolio-document items, so the editor can re-use data from the database.
import { fetchResumeEntities } from "../../api/resumeEntityApi";
import { fetchEducation } from "../../api/educationApi";

// re_type + the document fields that resume_entity.title / .subtitle map to.
// Mirrors ENTITY_SECTIONS in ai_pipeline/pipeline/portfolio_formatter.py so items
// added from here have the same shape as the ones the AI generated.
export const SECTION_SOURCES = {
  projects: { title: "Projects", reType: "project", titleField: "name", subtitleField: "subtitle" },
  experience: { title: "Work Experience", reType: "work_exp", titleField: "role", subtitleField: "company" },
  education: { title: "Education" },
  achievements: { title: "Achievements", reType: "achievements", titleField: "title", subtitleField: "org" },
  certifications: { title: "Certifications", reType: "certification", titleField: "title", subtitleField: "org" },
  extraCurricular: { title: "Extra-Curricular", reType: "extra_curricular", titleField: "role", subtitleField: "org" },
};

// The education table has no degree column; same labels as the AI pipeline.
const DEGREE_LABELS = {
  secondary: "Secondary (Class X)",
  higher_secondary: "Higher Secondary (Class XII)",
  under_graduate: "Undergraduate",
  post_graduate: "Postgraduate",
  diploma: "Diploma",
  phd: "PhD",
};

// API dates are ISO timestamps; the document stores plain YYYY-MM-DD like the pipeline does.
function toDocDate(value) {
  return value ? String(value).slice(0, 10) : null;
}

// Same output as format_grade in the AI pipeline: "CGPA 9.0 / 10.0" or "92.4%"
function formatGrade(marks, markType, totalMark) {
  if (marks === null || marks === undefined || marks === "") return "";
  const value = Number(marks);
  if (markType === "percentage") return `${value}%`;
  const asFloat = (n) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
  const grade = `CGPA ${asFloat(value)}`;
  return totalMark !== null && totalMark !== undefined && totalMark !== ""
    ? `${grade} / ${asFloat(Number(totalMark))}`
    : grade;
}

function educationToDocItem(row) {
  return {
    degree: DEGREE_LABELS[row.education_type] || "Education",
    stream: row.stream || "",
    institute_name: row.institute_name || "",
    from_date: toDocDate(row.from_date),
    to_date: toDocDate(row.to_date),
    grade: formatGrade(row.marks, row.mark_type, row.total_mark),
  };
}

function entityToDocItem(source, entity) {
  return {
    [source.titleField]: entity.title || "",
    [source.subtitleField]: entity.subtitle || "",
    from_date: toDocDate(entity.from_date),
    to_date: toDocDate(entity.to_date),
    description: entity.description || "",
    skills: (entity.skills || []).map((s) => s.skill_name).filter(Boolean),
    assets: (entity.assets || []).map((a) => ({
      asset_type: a.asset_type,
      link: a.link || "",
      title: a.title || "",
      description: a.description || "",
    })),
    links: (entity.links || []).map((l) => ({
      title: l.title || "",
      link: l.link || "",
    })),
  };
}

function normalize(text) {
  return (text || "").toLowerCase().trim();
}

// Identity used to match a document item to the record it came from
export function getItemKey(sectionKey, item) {
  if (!item) return "";
  if (sectionKey === "education") {
    return `${normalize(item.degree)}|${normalize(item.institute_name || item.institution)}`;
  }
  return normalize(item.role || item.title || item.name);
}

/**
 * Fetch the user's records for a portfolio section.
 * Resolves to [{ id, isDraft, item }] where `item` is a portfolio-document item.
 */
export async function loadSourceRecords(sectionKey) {
  const source = SECTION_SOURCES[sectionKey];
  if (!source) return [];

  if (sectionKey === "education") {
    const rows = await fetchEducation();
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      id: `edu-${row.education_id}`,
      isDraft: false,
      item: educationToDocItem(row),
    }));
  }

  const rows = await fetchResumeEntities(source.reType);
  return (Array.isArray(rows) ? rows : [])
    .filter((entity) => entity.status !== "deleted")
    .map((entity) => ({
      id: `re-${entity.re_id}`,
      isDraft: entity.status === "draft",
      item: entityToDocItem(source, entity),
    }));
}

// The saved record a document item was generated from, or null
export function findSourceRecord(sectionKey, item, records) {
  const key = getItemKey(sectionKey, item);
  if (!key) return null;
  return records.find((r) => getItemKey(sectionKey, r.item) === key) || null;
}
