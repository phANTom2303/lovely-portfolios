# API Integration Plan v2 — Lovely Portfolios
> Full implementation plan strictly based on `server/API_CONTRACT.md`.
> Supersedes `api-integration-plan.md`.

---

## ⚠️ Discrepancies & Pre-Flight Issues

Resolve these **before** starting any integration work.

### 1. No Profile/User API Exists
The old plan references `GET /api/profile/:userId`, `PUT /api/profile/:userId/core`, `PUT /api/profile/:userId/about`, `PUT /api/profile/:userId/socials`, and `POST/DELETE /api/profile/image`. **None of these endpoints exist in the API contract.**

The only user-data endpoint is `GET /api/auth/me` (returns the authenticated user). There is no endpoint to update name, gender, phone, professional title, location, about text, or profile image. **Decide with the backend team: are these endpoints planned but undocumented, or does the profile section need to be built around a new `/api/user` or `/api/profile` route before frontend integration begins?**

> **Blocked:** `ProfileImage`, `CoreDetails`, `About` components cannot be API-integrated until this is resolved.

---

### 2. Socials → Use `/api/links` (Profile-Level Links)
The old plan references a non-existent `/api/profile/:userId/socials` endpoint. The real API handles social/profile links via:
- `GET /api/links/params` (no `re_id`) — fetch all profile-level links
- `POST /api/links` (no `re_id`) — create a profile-level link
- `PATCH /api/links` — update a link by `link_id`
- `DELETE /api/links?link_id=:id` — delete a link

The `Socials` component must be re-mapped to these endpoints. The local shape `{ id, title, url }` maps to the API shape `{ link_id, title, link }`.

---

### 3. Skills — No "User Skills" Endpoint
The old plan references `GET /api/skills/user/:userId` and `PUT /api/skills/user/:userId`. **These do not exist.** The only skills endpoints are:
- `GET /api/skills` — fetch **all** available skills (global catalogue)
- `POST /api/skills` — create a new skill (adds to the global catalogue)

There is **no endpoint to save or retrieve which skills belong to a specific user.** Skills are associated to a user's portfolio only through `skills_id` arrays on Resume Entities (the `POST /api/re` and `PATCH /api/re` payloads).

> **Impact:** The standalone `Skills` section on the profile page cannot be API-backed as designed. The component currently shows a flat list of user skills. Either:
>   - (a) Remove the standalone Skills section and manage skills only inside `ResumeEntityDialog`, or
>   - (b) Discuss with backend to add a user-skills join table and API endpoint.

---

### 4. Education Form Fields Mismatch
The `EducationDialog` component collects: `level`, `degree`, `institute`, `branch`, `gradingSystem`, `grade`, `startDate`, `endDate`.

The API (`POST /api/education`) expects: `education_type`, `institute_name`, `start_date`, `end_date`, `marks`, `marks_type`, `total_mark`, `stream`.

Key mismatches:
| Frontend field | API field | Action needed |
|---|---|---|
| `level` (free text) | `education_type` (enum: `secondary`, `higher_secondary`, `under_graduate`, `post_graduate`, `diploma`, `phd`) | Change `level` input to a `<select>` with the valid enum values |
| `degree` | No direct API equivalent | Drop or combine into `stream` / notes |
| `institute` | `institute_name` | Rename field on submit |
| `branch` | `stream` | Rename field on submit |
| `gradingSystem` (free text) | `marks_type` (enum: `percentage`, `gpa`) | Change to a `<select>` with `percentage` / `gpa` |
| `grade` (string) | `marks` (number) | Parse to float on submit |
| Missing | `total_mark` (number, required) | Add a new field to the form |
| `startDate` (YYYY-MM format) | `start_date` (ISO date) | Append `-01` on submit (already done for RE) |
| `endDate` (YYYY-MM format) | `end_date` (ISO date) | Append `-01` on submit |

> **`EducationDialog.jsx` needs a significant form rewrite** before wiring up the API.

---

### 5. `ResumeEntityDialog` — Links Payload Field Name
In `ResumeEntityDialog.handleSubmit`, links are mapped as `{ title, link, description }`. However the API contract for `POST /api/re` inline links specifies `{ url, title, description }` (field is `url`, not `link`).

**Fix:** Change the mapping in `handleSubmit` from `link: l.url || l.link` → `url: l.url || l.link`.

---

### 6. `SignIn` — No `onSubmit` Handler, Wrong Route in Old Plan
The `SignIn` component has no state, no `onSubmit`, and the old plan references `POST /api/auth/signin` (wrong path). The correct endpoint is `POST /api/auth/login`.

---

### 7. `SignUp` — `navigate("/home")` Points to Nonexistent Route
After signup, the component navigates to `/home` which is not defined in `App.jsx`. Should navigate to `/profile`.

---

### 8. No Auth Context / Protected Route Guard
`App.jsx` has no auth state management and no `<ProtectedRoute>`. `/profile` is currently accessible to anyone. An `AuthContext` or Zustand/Context store needs to be created, and `/profile` must be guarded.

---

### 9. `GET /api/links` vs `GET /api/links/params`
There are two GET endpoints for links:
- `GET /api/links` — returns **all** links in the system (no user scoping). This is likely an admin/internal route.
- `GET /api/links/params` — returns **the authenticated user's** links, optionally filtered by `re_id`.

**Always use `GET /api/links/params`** in the frontend. Never use `GET /api/links` directly.

---

## Implementation Order

```
Phase 1: Foundation
  Step 1 → Auth infrastructure (AuthContext + ProtectedRoute)
  Step 2 → SignUp
  Step 3 → SignIn

Phase 2: Profile Section (blocked on missing API — see Discrepancy #1)
  Step 4 → CoreDetails (blocked)
  Step 5 → About (blocked)
  Step 6 → ProfileImage (blocked)
  Step 7 → Socials ✅ (can proceed — maps to /api/links)

Phase 3: Education
  Step 8 → Rewrite EducationDialog form fields (see Discrepancy #4)
  Step 9 → Wire Education CRUD

Phase 4: Resume Entities (shared flow)
  Step 10 → Wire ResumeEntityDialog (fix link field name, then POST/PATCH /api/re)
  Step 11 → Experience
  Step 12 → Projects
  Step 13 → Achievements
  Step 14 → Certifications
  Step 15 → ExtraCurricular

Phase 5: Skills
  Step 16 → SkillPickerDialog (replace local array with GET /api/skills)
  Step 17 → "Create new skill" (POST /api/skills)
  Step 18 → Standalone Skills section (blocked — see Discrepancy #3)

Phase 6: Cross-cutting
  Step 19 → Header auth-aware state (show Logout when signed in)
  Step 20 → Global error handling / loading states
```

---

## New Files to Create

| File | Purpose |
|---|---|
| `frontend/src/context/AuthContext.jsx` | Global auth state + `useAuth` hook |
| `frontend/src/components/ProtectedRoute.jsx` | Route guard; redirects to `/signin` if not authenticated |
| `frontend/src/api/index.js` | Centralised `fetch` wrapper (base URL, credentials, error parsing) |
| `frontend/src/api/auth.js` | Auth API calls (signup, login, logout, me) |
| `frontend/src/api/education.js` | Education CRUD calls |
| `frontend/src/api/links.js` | Links CRUD calls |
| `frontend/src/api/re.js` | Resume Entity CRUD calls |
| `frontend/src/api/skills.js` | Skills fetch + create calls |
| `frontend/src/api/assets.js` | Assets CRUD + image upload calls |

---

## Step-by-Step Integration Guide

---

### Step 1 — Auth Infrastructure

**Create `frontend/src/api/index.js`**

```js
const BASE = "/api";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",          // always send the token cookie
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json;
}
```

> Note: For `multipart/form-data` (image uploads), omit `Content-Type` so the browser sets the boundary automatically.

**Create `frontend/src/api/auth.js`**

```js
import { apiFetch } from "./index";

export const signup = (body) =>
  apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(body) });

export const login = (body) =>
  apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) });

export const logout = () =>
  apiFetch("/auth/logout", { method: "POST" });

export const getMe = () =>
  apiFetch("/auth/me");
```

**Create `frontend/src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getMe, logout as apiLogout } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // null = unknown, false = logged out
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => setUser(false))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await apiLogout();
    setUser(false);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Create `frontend/src/components/ProtectedRoute.jsx`**

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading…</p>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export default ProtectedRoute;
```

**Modify `frontend/src/main.jsx`**
- Wrap `<App />` with `<AuthProvider>`.

**Modify `frontend/src/App.jsx`**
- Import `ProtectedRoute`.
- Wrap the `/profile` route:
  ```jsx
  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
  ```

---

### Step 2 — SignUp

**File:** [`frontend/src/pages/Auth/SignUp.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/pages/Auth/SignUp.jsx)

**Changes:**
1. Import `useAuth` from `AuthContext` and `signup` from `../../../api/auth`.
2. Add `const { setUser } = useAuth();` and `const [apiError, setApiError] = useState("")`.
3. In `handleSubmit`, after client-side validation passes, replace `navigate("/home")` with:

```js
try {
  const res = await signup({
    name: formData.name,
    email: formData.email,
    password: formData.password,
    // phone_no is optional; omit if not collected in the form
  });
  setUser(res.data);
  navigate("/profile");
} catch (err) {
  setApiError(err.message);
}
```

4. Render `{apiError && <span className={styles.error}>{apiError}</span>}` above the submit button.
5. Mark `handleSubmit` as `async`.

**Note:** `phone_no` is an optional field in the API. The current signup form doesn't collect it. Either leave it out or add an optional "Phone Number" field.

---

### Step 3 — SignIn

**File:** [`frontend/src/pages/Auth/SignIn.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/pages/Auth/SignIn.jsx)

**Changes:**
1. Convert to a stateful component. Add `useState` for `{ email, password }` and `apiError`.
2. Add `useNavigate`, `useAuth` (for `setUser`), and import `login` from `../../../api/auth`.
3. Wire `onChange` handlers to the email and password inputs.
4. Add `onSubmit` handler to the `<form>`:

```js
async function handleSubmit(event) {
  event.preventDefault();
  setApiError("");
  try {
    const res = await login({ email, password });
    setUser(res.data);
    navigate("/profile");
  } catch (err) {
    setApiError(err.message || "Invalid email or password.");
  }
}
```

5. Render `{apiError && <span className={styles.error}>{apiError}</span>}` above the submit button.
6. Remove the `Link` to `/forgot-password` (that page does not exist).

---

### Step 4 — CoreDetails *(BLOCKED — no API)*

**File:** [`frontend/src/components/profile/CoreDetails.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/profile/CoreDetails.jsx)

**Blocked** until a `PATCH /api/user` or similar endpoint is added to the API contract. Fields needed: `name`, `gender`, `phone_no`, `professional_title`, `location`.

**Interim:** Keep existing local-state-only behaviour. On page mount in `Profile.jsx`, seed `CoreDetails` with data from `GET /api/auth/me` (name, phone_no are available).

---

### Step 5 — About *(BLOCKED — no API)*

**File:** [`frontend/src/components/profile/About.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/profile/About.jsx)

**Blocked** for the same reason as CoreDetails.

---

### Step 6 — ProfileImage *(BLOCKED — no API)*

**File:** [`frontend/src/components/profile/ProfileImage.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/profile/ProfileImage.jsx)

**Blocked.** The API has `POST /api/assets/image` for uploading image assets scoped to a resume entity, but there is no profile photo upload endpoint.

---

### Step 7 — Profile Page (initial load) + Socials

**Files:**
- [`frontend/src/pages/profile/Profile.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/pages/profile/Profile.jsx)
- [`frontend/src/components/profile/Socials.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/profile/Socials.jsx)
- [`frontend/src/components/profile/SocialsDialog.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/profile/SocialsDialog.jsx)

**Create `frontend/src/api/links.js`**

```js
import { apiFetch } from "./index";

// Always use /params for user-scoped links
export const getLinks = (re_id) =>
  apiFetch(`/links/params${re_id ? `?re_id=${re_id}` : ""}`);

export const createLink = (body) =>
  apiFetch("/links", { method: "POST", body: JSON.stringify(body) });

export const updateLink = (body) =>
  apiFetch("/links", { method: "PATCH", body: JSON.stringify(body) });

export const deleteLink = (link_id) =>
  apiFetch(`/links?link_id=${link_id}`, { method: "DELETE" });
```

**Modify `Profile.jsx`:**
1. Import `useAuth` and `getMe` (or read from context).
2. Add `useEffect` on mount → call `getMe()` → seed `profile` state with `res.data` (replaces `sampleProfile`).
3. Import `getLinks` from `../api/links`. On mount, also call `getLinks()` (no `re_id`) → seed `profile.socials` with the response (map `{ link_id, title, link }` → `{ id: link_id, title, url: link }`).

```jsx
// Profile.jsx — useEffect
useEffect(() => {
  async function loadProfile() {
    const [meRes, linksRes] = await Promise.all([getMe(), getLinks()]);
    setProfile({
      name: meRes.data.name,
      phone: meRes.data.phone_no,
      // gender, professionalTitle, location — not in API yet; leave empty
      about: "",
      profileImage: null,
      socials: (linksRes.data || []).map((l) => ({
        id: l.link_id,
        title: l.title,
        url: l.link,
      })),
    });
  }
  loadProfile();
}, []);
```

**Modify `Socials.jsx`:**
Replace `handleSaveSocials` with an async function that diffs the old and new socials arrays and calls create/update/delete as needed:

```js
async function handleSaveSocials(updatedSocials) {
  const existing = profile.socials || [];

  // Delete removed links
  const removed = existing.filter(
    (old) => !updatedSocials.some((s) => s.id === old.id)
  );
  for (const s of removed) await deleteLink(s.id);

  // Create new links (no id yet)
  const toCreate = updatedSocials.filter((s) => !s.id);
  for (const s of toCreate) await createLink({ link: s.url, title: s.title });

  // Update changed links
  const toUpdate = updatedSocials.filter((s) =>
    s.id && existing.some((old) => old.id === s.id)
  );
  for (const s of toUpdate)
    await updateLink({ link_id: s.id, title: s.title, link: s.url });

  // Refresh from server
  const fresh = await getLinks();
  setProfile((prev) => ({
    ...prev,
    socials: (fresh.data || []).map((l) => ({ id: l.link_id, title: l.title, url: l.link })),
  }));
  setIsDialogOpen(false);
}
```

---

### Step 8 — Rewrite `EducationDialog` Form

**File:** [`frontend/src/components/Education/EducationDialog.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/Education/EducationDialog.jsx)

**Changes (form fields to update):**

| Old field | New field | Control type |
|---|---|---|
| `level` (text) | `education_type` | `<select>` with options: `secondary`, `higher_secondary`, `under_graduate`, `post_graduate`, `diploma`, `phd` |
| `degree` | Remove or fold into `stream` | — |
| `institute` | `institute_name` | Text input (keep as-is, rename) |
| `branch` | `stream` | Text input (keep as-is, rename) |
| `gradingSystem` (text) | `marks_type` | `<select>` with options: `percentage`, `gpa` |
| `grade` (string) | `marks` (number) | `<input type="number">` |
| *(missing)* | `total_mark` (number, required) | Add `<input type="number" name="total_mark">` |
| `startDate` | `start_date` | Keep `type="month"` (convert to ISO on submit) |
| `endDate` | `end_date` | Keep `type="month"` (convert to ISO on submit) |

**Updated `formData` initial state:**
```js
const [formData, setFormData] = useState({
  education_type: education?.education_type || "",
  institute_name: education?.institute_name || "",
  stream: education?.stream || "",
  marks_type: education?.marks_type || "",
  marks: education?.marks || "",
  total_mark: education?.total_mark || "",
  start_date: education?.start_date?.slice(0, 7) || "",   // YYYY-MM
  end_date: education?.end_date?.slice(0, 7) || "",
});
```

**`handleSubmit` payload construction:**
```js
const payload = {
  education_type: formData.education_type,
  institute_name: formData.institute_name,
  stream: formData.stream || undefined,
  marks_type: formData.marks_type,
  marks: parseFloat(formData.marks),
  total_mark: parseFloat(formData.total_mark),
  start_date: formData.start_date ? `${formData.start_date}-01` : undefined,
  end_date: formData.end_date ? `${formData.end_date}-01` : undefined,
};
```

---

### Step 9 — Wire Education CRUD

**Files:**
- [`frontend/src/components/Education/Education.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/Education/Education.jsx)

**Create `frontend/src/api/education.js`**

```js
import { apiFetch } from "./index";

export const getEducation = () => apiFetch("/education");
export const getEducationById = (edu_id) => apiFetch(`/education?edu_id=${edu_id}`);
export const createEducation = (body) =>
  apiFetch("/education", { method: "POST", body: JSON.stringify(body) });
export const updateEducation = (body) =>
  apiFetch("/education", { method: "PATCH", body: JSON.stringify(body) });
export const deleteEducation = (edu_id) =>
  apiFetch(`/education?edu_id=${edu_id}`, { method: "DELETE" });
```

**Modify `Education.jsx`:**

1. Remove `import sampleEducation` and `useState(sampleEducation)` → replace with `useState([])`.
2. Add `useEffect` on mount → call `getEducation()` → `setEducation(res.data)`.
3. Replace `handleSave`:
   - If editing: `await updateEducation({ edu_id: editingEducation.edu_id, ...payload })` then re-fetch.
   - If adding: `await createEducation(payload)` then re-fetch.
4. Replace `handleDelete`: `await deleteEducation(editingEducation.edu_id)` then re-fetch (or filter local state).

**Mapping — API response → display:**

The API returns `edu_id`, `education_type`, `institute_name`, `start_date`, `end_date`, `marks`, `marks_type`, `total_mark`, `stream`.

Update `Education.jsx`'s render to use `item.start_date` / `item.end_date` instead of `item.startDate` / `item.endDate`.

Update `EducationCard.jsx` props usage accordingly.

---

### Step 10 — Wire `ResumeEntityDialog` (fix + connect API)

**File:** [`frontend/src/components/resumeEntity/ResumeEntityDialog.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/resumeEntity/ResumeEntityDialog.jsx)

**Create `frontend/src/api/re.js`**

```js
import { apiFetch } from "./index";

export const getReEntities = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined)
  ).toString();
  return apiFetch(`/re${qs ? `?${qs}` : ""}`);
};

export const getReEntity = (re_id) => apiFetch(`/re?re_id=${re_id}`);

export const createReEntity = (body) =>
  apiFetch("/re", { method: "POST", body: JSON.stringify(body) });

export const updateReEntity = (body) =>
  apiFetch("/re", { method: "PATCH", body: JSON.stringify(body) });

export const deleteReEntity = (re_id) =>
  apiFetch(`/re?re_id=${re_id}`, { method: "DELETE" });
```

**Modify `ResumeEntityDialog.jsx` — `handleSubmit`:**

1. **Fix link field name** (Discrepancy #5): change `link: l.url || l.link` → `url: l.url || l.link`.
2. Remove `user_id: "USER_UUID_HERE"` from the payload (server reads it from the session cookie).
3. Remove `raw_form_data: formData` from the payload.
4. The dialog should no longer call `onSave(formData)` with local formData for the parent to manage state — instead, the parent will receive the `re_id` from the API response. See per-component sections below.

**Corrected payload inside `handleSubmit`:**
```js
const payload = {
  re_type: formData.re_type,
  title: formData.role,
  subtitle: formData.company || undefined,
  description: formData.description || undefined,
  skills_id: formData.skills.map((s) => s.skill_id || s.id).filter(Number.isInteger),
  from_date: formData.startDate
    ? `${formData.startDate}-01`   // YYYY-MM → YYYY-MM-01
    : undefined,
  to_date: formData.isCurrent
    ? undefined
    : formData.endDate
      ? `${formData.endDate}-01`
      : undefined,
  links: formData.links.map((l) => ({
    url: l.url || l.link,          // ← fixed field name
    title: l.title,
    description: l.description || undefined,
  })),
  assets: formData.images.map((img) => ({
    title: img.title || "",
    asset_type: "image",
    link: img.url || undefined,
    description: img.description || undefined,
  })),
};

if (entity) {
  payload.re_id = entity.re_id;  // required for PATCH
}
```

5. Pass `payload` up to the parent via `onSave(payload)`. The parent will make the actual API call (so the parent can update its list state with the returned record).

> **Why pass up?** The parent knows whether it's a create or update, and needs the returned record from the API (which includes the server-assigned `re_id`).

---

### Step 11 — Experience

**File:** [`frontend/src/components/Experience/Experience.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/Experience/Experience.jsx)

**Changes:**

1. Remove `import sampleExperience`. Replace `useState(sampleExperience)` with `useState([])`.
2. Add `useEffect` on mount:
   ```js
   useEffect(() => {
     getReEntities({ type: "work_exp" })
       .then((res) => setExperiences(res.data))
       .catch(console.error);
   }, []);
   ```
3. Replace `handleSaveExperience(formData)` (which currently sets local state) with:
   ```js
   async function handleSaveExperience(payload) {
     try {
       if (editingExperience) {
         await updateReEntity({ re_id: editingExperience.re_id, ...payload });
       } else {
         await createReEntity(payload);
       }
       // Re-fetch to keep list fresh
       const res = await getReEntities({ type: "work_exp" });
       setExperiences(res.data);
       handleCloseDialog();
     } catch (err) {
       console.error(err);
     }
   }
   ```
4. Replace `handleDeleteExperience(id)`:
   ```js
   async function handleDeleteExperience(re_id) {
     const confirmed = window.confirm("Are you sure?");
     if (!confirmed) return;
     await deleteReEntity(re_id);
     setExperiences((prev) => prev.filter((item) => item.re_id !== re_id));
     handleCloseDialog();
   }
   ```
5. Update display fields: API returns `re_id`, `from_date`, `to_date`, `title` (not `role`), `subtitle` (not `company`). Update `ExperienceCard` props and `formatDateRange` call accordingly:
   - `exp.from_date` → `exp.startDate` alias (or update card component to use `from_date` directly)
   - Pass `onDelete={() => handleDeleteExperience(exp.re_id)}` to `ResumeEntityDialog`.

---

### Step 12 — Projects

**File:** [`frontend/src/components/Projects/Projects.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/Projects/Projects.jsx)

Same pattern as Experience. Use `getReEntities({ type: "project" })`.

**Additional:** `Projects` renders a `ProjectInfoModal` and `ProjectLinksModal`. When a project card is expanded to show its details (links, assets), call `getReEntity(re_id)` which returns nested `links` and `assets`.

---

### Step 13 — Achievements

**File:** [`frontend/src/components/Achievements/Achievements.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/Achievements/Achievements.jsx)

Same pattern as Experience. Use `getReEntities({ type: "achievements" })`.

---

### Step 14 — Certifications

**File:** [`frontend/src/components/Certifications/Certifications.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/Certifications/Certifications.jsx)

Same pattern as Experience. Use `getReEntities({ type: "certification" })`.

---

### Step 15 — ExtraCurricular

**File:** [`frontend/src/components/ExtraCurricular/ExtraCurricular.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/ExtraCurricular/ExtraCurricular.jsx)

Same pattern as Experience. Use `getReEntities({ type: "extra_curricular" })`.

---

### Step 16 — SkillPickerDialog: Replace Local Data with API

**File:** [`frontend/src/components/shared/SkillPickerDialog.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/shared/SkillPickerDialog.jsx)

**Create `frontend/src/api/skills.js`**

```js
import { apiFetch } from "./index";

export const getAllSkills = () => apiFetch("/skills");
export const createSkill = (skill_name) =>
  apiFetch("/skills", { method: "POST", body: JSON.stringify({ skill_name }) });
```

**Changes in `SkillPickerDialog.jsx`:**

1. Remove `import { allSkills } from "../../data/sampleSkills"`.
2. Add state `const [allSkills, setAllSkills] = useState([])`.
3. Add `useEffect` on mount → call `getAllSkills()` → `setAllSkills(res.data)`.
4. In `handleCreateNewSkill`:
   ```js
   async function handleCreateNewSkill() {
     if (!searchValue.trim()) return;
     const res = await createSkill(searchValue.trim());
     const newSkill = res.data;  // { skill_id, skill_name }
     setAllSkills((prev) => [...prev, newSkill]);
     setActiveSkills((prev) => [...prev, newSkill]);
     setSearchValue("");
     setIsDropdownOpen(false);
   }
   ```

> **Important:** `skills_id` in the RE payload must be integer IDs. When `handleCreateNewSkill` was using `crypto.randomUUID()` for the ID, those would not match real DB IDs. After this change, the new skill returned from the API will have a real integer `skill_id` — use that.

---

### Step 17 — Standalone Skills Section *(BLOCKED)*

**File:** [`frontend/src/components/Skills/Skills.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/Skills/Skills.jsx)

**Blocked** — there is no "user skills" API endpoint. Cannot persist which skills belong to the user in isolation.

**Interim options:**
- Derive displayed skills from all the `skills_id` arrays across all resume entities (aggregate client-side).
- Or hide this section from the UI until the backend adds a user-skills endpoint.

---

### Step 18 — Header: Auth-Aware State

**File:** [`frontend/src/components/Header/Header.jsx`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/src/components/Header/Header.jsx)

**Changes:**

1. Import `useAuth` from `../../context/AuthContext`.
2. `const { user, logout } = useAuth();`
3. Replace static Sign In / Create Profile links:
   ```jsx
   <nav className="header-actions">
     {user ? (
       <>
         <Link to="/profile">My Profile</Link>
         <button onClick={logout} className="header-logout">Log Out</button>
       </>
     ) : (
       <>
         <Link to="/signin">Sign In</Link>
         <Link to="/signup" className="header-create">Create Profile</Link>
       </>
     )}
   </nav>
   ```
4. Apply same conditional logic to the mobile menu.

---

### Step 19 — Assets (for RE detail views)

**Create `frontend/src/api/assets.js`**

```js
import { apiFetch } from "./index";

export const getAssets = (re_id) =>
  apiFetch(`/assets/params${re_id ? `?re_id=${re_id}` : ""}`);

export const createAsset = (body) =>
  apiFetch("/assets", { method: "POST", body: JSON.stringify(body) });

export const uploadImageAsset = (formData) =>
  apiFetch("/assets/image", {
    method: "POST",
    headers: {},          // omit Content-Type; browser sets multipart boundary
    body: formData,       // FormData instance
  });

export const updateAsset = (body) =>
  apiFetch("/assets", { method: "PATCH", body: JSON.stringify(body) });

export const deleteAsset = (asset_id) =>
  apiFetch(`/assets?asset_id=${asset_id}`, { method: "DELETE" });
```

**Usage:** In `ProjectInfoModal` / `ProjectLinksModal` (or wherever asset details are shown), call `getAssets(re_id)` to fetch the assets for a specific resume entity.

---

## Field Mapping Reference

### Auth
| API field | Frontend usage |
|---|---|
| `name` | `profile.name`, `formData.name` |
| `email` | `formData.email` |
| `password` | `formData.password` |
| `phone_no` | `profile.phone` |

### Education
| API field | Frontend field (old → new) |
|---|---|
| `edu_id` | `item.id` → `item.edu_id` |
| `education_type` | `level` → `education_type` |
| `institute_name` | `institute` → `institute_name` |
| `stream` | `branch` → `stream` |
| `marks_type` | `gradingSystem` → `marks_type` |
| `marks` | `grade` → `marks` (float) |
| `total_mark` | *(new field)* |
| `start_date` | `startDate` → `start_date` |
| `end_date` | `endDate` → `end_date` |

### Resume Entity
| API field | Frontend field (old → new) |
|---|---|
| `re_id` | `entity.id` → `entity.re_id` |
| `re_type` | `formData.re_type` ✅ |
| `title` | `formData.role` → maps to `title` in payload |
| `subtitle` | `formData.company` → maps to `subtitle` in payload |
| `from_date` | `formData.startDate` + `-01` |
| `to_date` | `formData.endDate` + `-01` (or `null` if current) |
| `skills_id` | `formData.skills.map(s => s.skill_id)` — must be integers |
| `links[].url` | `l.url || l.link` (fix field name in payload) |
| `links[].title` | `l.title` ✅ |
| `assets[].asset_type` | `"image"` ✅ |

### Links (Socials)
| API field | Frontend field |
|---|---|
| `link_id` | `social.id` |
| `title` | `social.title` |
| `link` | `social.url` |

---

## Data Files to Remove After Integration

Once each section is wired to the API, delete the corresponding sample data imports:

| File | Remove after |
|---|---|
| `src/data/sampleProfile.js` | Step 7 |
| `src/data/sampleEducation.js` | Step 9 |
| `src/data/sampleExperience.js` | Step 11 |
| `src/data/sampleProjects.js` | Step 12 |
| `src/data/sampleAchievements.js` | Step 13 |
| `src/data/sampleCertifications.js` | Step 14 |
| `src/data/sampleExtraCurricular.js` | Step 15 |
| `src/data/sampleSkills.js` (the `allSkills` export) | Step 16 |

---

## Vite Proxy (Required)

For `credentials: "include"` to work correctly in development, configure Vite to proxy `/api` to the Express server. Add to [`frontend/vite.config.js`](file:///home/anish-goenka/projects/lovely-portfolios/frontend/vite.config.js):

```js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:<YOUR_SERVER_PORT>",
      changeOrigin: true,
    },
  },
},
```

---

## Summary Table

| Step | Component / File | API Endpoint(s) | Status |
|---|---|---|---|
| 1 | `AuthContext`, `ProtectedRoute`, `api/index.js`, `api/auth.js` | — | ✅ Ready |
| 2 | `SignUp.jsx` | `POST /api/auth/signup` | ✅ Ready |
| 3 | `SignIn.jsx` | `POST /api/auth/login` | ✅ Ready |
| 4 | `CoreDetails.jsx` | — | ❌ Blocked (no API) |
| 5 | `About.jsx` | — | ❌ Blocked (no API) |
| 6 | `ProfileImage.jsx` | — | ❌ Blocked (no API) |
| 7 | `Profile.jsx`, `Socials.jsx` | `GET /api/auth/me`, `GET /api/links/params`, `POST/PATCH/DELETE /api/links` | ✅ Ready |
| 8 | `EducationDialog.jsx` | — (form rewrite) | ✅ Ready (UI only) |
| 9 | `Education.jsx` | `GET/POST/PATCH/DELETE /api/education` | ✅ Ready |
| 10 | `ResumeEntityDialog.jsx` | `POST/PATCH /api/re` | ✅ Ready (after fix) |
| 11 | `Experience.jsx` | `GET /api/re?type=work_exp` | ✅ Ready |
| 12 | `Projects.jsx` | `GET /api/re?type=project`, `GET /api/re?re_id=` | ✅ Ready |
| 13 | `Achievements.jsx` | `GET /api/re?type=achievements` | ✅ Ready |
| 14 | `Certifications.jsx` | `GET /api/re?type=certification` | ✅ Ready |
| 15 | `ExtraCurricular.jsx` | `GET /api/re?type=extra_curricular` | ✅ Ready |
| 16 | `SkillPickerDialog.jsx` | `GET /api/skills`, `POST /api/skills` | ✅ Ready |
| 17 | `Skills.jsx` (standalone) | — | ❌ Blocked (no user-skills API) |
| 18 | `Header.jsx` | `POST /api/auth/logout` | ✅ Ready |
| 19 | Assets (ProjectInfoModal etc.) | `GET /api/assets/params?re_id=` | ✅ Ready |
