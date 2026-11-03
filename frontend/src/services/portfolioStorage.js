import portfolioDocument from "../pages/Portfolio/portfolioDocument.js";

const STORAGE_KEY = "lovely_portfolios_v8";


const SEED_PORTFOLIOS = [
  {
    id: "port-alex-fullstack",
    title: "Alex Sterling — Full-Stack & Systems",
    slug: "alex-fullstack",
    description:
      "Primary engineering portfolio focusing on scalable web platforms, APIs, and cloud architecture.",
    theme: "light",
    isActive: true,
    createdAt: "2026-10-15T10:00:00.000Z",
    updatedAt: "2026-11-02T06:30:00.000Z",
    stats: {
      projectsCount: 3,
      skillsCount: 12,
      experienceCount: 3,
    },
    document: portfolioDocument,
  },
  {
    id: "port-alex-creative",
    title: "Alex Sterling — Open Source & Creative Tech",
    slug: "alex-creative",
    description:
      "Alternative portfolio focused on frontend animations, developer tooling, and open-source packages.",
    theme: "dark",
    isActive: false,
    createdAt: "2026-10-28T14:30:00.000Z",
    updatedAt: "2026-11-01T18:15:00.000Z",
    stats: {
      projectsCount: 2,
      skillsCount: 9,
      experienceCount: 2,
    },
    document: {
      ...portfolioDocument,
      about: {
        ...(portfolioDocument.about || portfolioDocument.hero),
        title: "Creative Technologist & Open Source Builder",
        about:
          "Crafting fluid digital interactions, creative code experiments, and open-source libraries for the modern web.",
      },
    },
  },
];

function sanitizeSlug(slug) {
  if (!slug) return "portfolio";
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function saveToStorage(portfolios) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
  } catch (err) {
    console.error("Failed to save portfolios to localStorage:", err);
  }
}

export function getPortfolios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveToStorage(SEED_PORTFOLIOS);
      return SEED_PORTFOLIOS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveToStorage(SEED_PORTFOLIOS);
      return SEED_PORTFOLIOS;
    }

    // Ensure only 1 description exists by migrating and removing legacy tagline
    let didMigrate = false;
    parsed.forEach((p) => {
      if (p.document?.projects?.items) {
        p.document.projects.items.forEach((item) => {
          if (item.tagline) {
            if (!item.description) {
              item.description = item.tagline;
            } else if (!item.description.includes(item.tagline.trim())) {
              item.description = `${item.tagline.trim()} ${item.description.trim()}`;
            }
            delete item.tagline;
            didMigrate = true;
          }
        });
      }
    });
    if (didMigrate) {
      saveToStorage(parsed);
    }

    return parsed;
  } catch (err) {
    console.error("Failed to read portfolios from localStorage:", err);
    return SEED_PORTFOLIOS;
  }
}

export function getPortfolioByIdOrSlug(identifier) {
  if (!identifier) return null;
  const list = getPortfolios();
  const cleanId = identifier.trim().toLowerCase();
  return (
    list.find(
      (p) =>
        p.id.toLowerCase() === cleanId ||
        (p.slug && p.slug.toLowerCase() === cleanId)
    ) || null
  );
}

export function getActivePortfolio() {
  const list = getPortfolios();
  const active = list.find((p) => p.isActive);
  return active || list[0] || null;
}

export function setActivePortfolio(id, forceState) {
  const list = getPortfolios();
  let found = false;
  const updated = list.map((p) => {
    if (p.id === id) {
      found = true;
      const nextActive =
        typeof forceState === "boolean" ? forceState : !p.isActive;
      return {
        ...p,
        isActive: nextActive,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  if (found) {
    saveToStorage(updated);
  }
  return updated;
}

export function toggleActivePortfolio(id) {
  return setActivePortfolio(id);
}

export function createPortfolio({
  title,
  slug,
  description = "",
  theme = "light",
  templateId = null,
}) {
  const list = getPortfolios();
  const id = `port-${Date.now()}`;
  let cleanSlug = sanitizeSlug(slug || title);

  // Ensure slug uniqueness
  let candidateSlug = cleanSlug;
  let counter = 2;
  while (list.some((p) => p.slug.toLowerCase() === candidateSlug.toLowerCase())) {
    candidateSlug = `${cleanSlug}-${counter}`;
    counter++;
  }

  // Base document
  let baseDoc = portfolioDocument;
  if (templateId) {
    const template = list.find((p) => p.id === templateId);
    if (template && template.document) {
      baseDoc = JSON.parse(JSON.stringify(template.document));
    }
  } else {
    baseDoc = JSON.parse(JSON.stringify(portfolioDocument));
  }

  // Personalize title in the baseDoc hero if appropriate
  if (baseDoc.hero) {
    baseDoc.hero.title = title || baseDoc.hero.title;
  }

  const now = new Date().toISOString();
  const newPortfolio = {
    id,
    title: title.trim(),
    slug: candidateSlug,
    description: description.trim(),
    theme,
    isActive: list.length === 0, // active if first one
    createdAt: now,
    updatedAt: now,
    stats: {
      projectsCount: baseDoc.projects?.items?.length || 0,
      skillsCount:
        baseDoc.skills?.categories?.reduce(
          (acc, c) => acc + (c.skills?.length || 0),
          0
        ) || 0,
      experienceCount: baseDoc.experience?.items?.length || 0,
    },
    document: baseDoc,
  };

  const updated = [newPortfolio, ...list];
  saveToStorage(updated);
  return newPortfolio;
}

export function duplicatePortfolio(id) {
  const list = getPortfolios();
  const original = list.find((p) => p.id === id);
  if (!original) return null;

  return createPortfolio({
    title: `Copy of ${original.title}`,
    slug: `${original.slug}-copy`,
    description: original.description,
    theme: original.theme,
    templateId: original.id,
  });
}

export function updatePortfolio(id, updates) {
  const list = getPortfolios();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = list[index];
  const updatedItem = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.slug) {
    updatedItem.slug = sanitizeSlug(updates.slug);
  }

  list[index] = updatedItem;
  saveToStorage(list);
  return updatedItem;
}

export function deletePortfolio(id) {
  const list = getPortfolios();
  if (list.length <= 1) {
    throw new Error("You must have at least one portfolio.");
  }

  const target = list.find((p) => p.id === id);
  const remaining = list.filter((p) => p.id !== id);

  // If deleted portfolio was active, promote the first remaining portfolio
  if (target?.isActive && remaining.length > 0) {
    remaining[0].isActive = true;
  }

  saveToStorage(remaining);
  return remaining;
}

export function resetToDefaults() {
  saveToStorage(SEED_PORTFOLIOS);
  return SEED_PORTFOLIOS;
}
