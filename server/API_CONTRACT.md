# API Contract

Base URL: `/api`

All protected routes require a valid session cookie (`token`) obtained via login. The authenticated user's `user_id` is extracted server-side from the JWT — **never pass `user_id` as a parameter**.

---

## Auth — `/api/auth`

### `POST /api/auth/signup`
Create a new user account.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `name` | string | ✅ | Min 2, max 75 characters |
| Body | `email` | string | ✅ | Valid email, max 100 characters |
| Body | `password` | string | ✅ | Min 8 chars; must contain uppercase, lowercase, number, and special character (`!@#$%^&*`) |
| Body | `phone_no` | string | ❌ | Max 15 characters |

```json
// Request body
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secure@123",
  "phone_no": "+919876543210"
}
```

**Response:** `201 Created` — Sets `token` cookie. Returns user data.

---

### `POST /api/auth/login`
Authenticate and receive a session token.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `email` | string | ✅ | Registered email address |
| Body | `password` | string | ✅ | Account password |

```json
// Request body
{
  "email": "jane@example.com",
  "password": "Secure@123"
}
```

**Response:** `200 OK` — Sets `token` cookie. Returns user data.

---

### `POST /api/auth/logout`
🔒 _Protected_

Invalidates the current session token.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Cookie | `token` | string | ✅ | JWT session token (sent automatically) |

```
// No request body required.
// The token cookie is sent automatically by the browser.
```

**Response:** `200 OK` — Clears `token` cookie.

---

### `GET /api/auth/me`
🔒 _Protected_

Returns the currently authenticated user's profile.

```
// No request body or query parameters required.
// Authentication is handled via the token cookie.
```

**Response:** `200 OK` — Returns user profile data.

---

## Education — `/api/education`

All routes are 🔒 _Protected_.

### `GET /api/education`
Fetch education records for the authenticated user. Returns all records if `edu_id` is omitted.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `edu_id` | integer | ❌ | Fetch a specific education record by ID |

```
// Fetch all education records:
GET /api/education

// Fetch a specific record:
GET /api/education?edu_id=3
```

**Response:** `200 OK`

---

### `POST /api/education`
Create a new education record.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `education_type` | string | ✅ | One of: `secondary`, `higher_secondary`, `under_graduate`, `post_graduate`, `diploma`, `phd` |
| Body | `institute_name` | string | ✅ | Non-empty string |
| Body | `start_date` | string (date) | ✅ | ISO date string; must be before `end_date` |
| Body | `end_date` | string (date) | ✅ | ISO date string |
| Body | `marks` | number | ✅ | Must be between `0` and `total_mark` |
| Body | `marks_type` | string | ✅ | One of: `percentage`, `gpa` |
| Body | `total_mark` | number | ✅ | Must be greater than `0` |
| Body | `stream` | string | ❌ | Optional field of study / specialisation |

```json
// Request body
{
  "education_type": "under_graduate",
  "institute_name": "MIT",
  "start_date": "2019-08-01",
  "end_date": "2023-05-31",
  "marks": 3.8,
  "marks_type": "gpa",
  "total_mark": 4.0,
  "stream": "Computer Science"
}
```

**Response:** `200 OK`

---

### `PATCH /api/education`
Update an existing education record. At least one updatable field is required.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `edu_id` | integer | ✅ | ID of the record to update |
| Body | `education_type` | string | ❌ | One of the valid education types |
| Body | `institute_name` | string | ❌ | Non-empty string |
| Body | `start_date` | string (date) | ❌ | Must be provided together with `end_date` |
| Body | `end_date` | string (date) | ❌ | Must be provided together with `start_date` |
| Body | `marks` | number | ❌ | Must not exceed `total_mark` if both provided |
| Body | `marks_type` | string | ❌ | One of: `percentage`, `gpa` |
| Body | `total_mark` | number | ❌ | Must be greater than `0` |
| Body | `stream` | string | ❌ | |

```json
// Request body
{
  "edu_id": 3,
  "marks": 3.9,
  "stream": "Machine Learning"
}
```

**Response:** `200 OK`

---

### `DELETE /api/education`
Delete an education record belonging to the authenticated user.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `edu_id` | integer | ✅ | ID of the education record to delete |

```
DELETE /api/education?edu_id=3
```

**Response:** `200 OK`

---

## Links — `/api/links`

All routes are 🔒 _Protected_.

### `GET /api/links`
Fetch all links (no filtering).

```
// No request body or query parameters required.
GET /api/links
```

**Response:** `200 OK`

---

### `GET /api/links/params`
Fetch links for the authenticated user, optionally scoped to a resume entity.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `re_id` | string/integer | ❌ | Resume entity ID; omit to get all profile-level links |

```
// Fetch all profile-level links:
GET /api/links/params

// Fetch links for a specific resume entity:
GET /api/links/params?re_id=7
```

**Response:** `200 OK`

---

### `POST /api/links`
Create a new link. If `re_id` is provided, the link is attached to that resume entity; otherwise it's a profile-level link.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `link` | string | ✅ | URL |
| Body | `title` | string | ✅ | Display title |
| Body | `re_id` | string/integer | ❌ | Resume entity ID to scope the link to |
| Body | `description` | string | ❌ | Optional description |

```json
// Profile-level link
{
  "link": "https://github.com/janedoe",
  "title": "GitHub Profile",
  "description": "My open source work"
}

// Resume-entity-scoped link
{
  "link": "https://github.com/janedoe/project-x",
  "title": "Project X Repo",
  "re_id": 7
}
```

**Response:** `200 OK`

---

### `PATCH /api/links`
Update an existing link. At least one of `title`, `link`, or `description` is required.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `link_id` | string/integer | ✅ | ID of the link to update |
| Body | `title` | string | ❌ | |
| Body | `link` | string | ❌ | New URL |
| Body | `description` | string | ❌ | |

```json
// Request body
{
  "link_id": 12,
  "title": "Updated GitHub Profile",
  "link": "https://github.com/jane-doe-updated"
}
```

**Response:** `200 OK`

---

### `DELETE /api/links`
Delete a link belonging to the authenticated user.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `link_id` | string/integer | ✅ | ID of the link to delete |

```
DELETE /api/links?link_id=12
```

**Response:** `200 OK`

---
## Resume Entities — `/api/re`

All routes are 🔒 _Protected_.

Resume Entities (RE) are structured portfolio items such as projects, work experiences, certifications, etc. They can have associated links, assets, and skills.

### `GET /api/re`
Fetch resume entities for the authenticated user. Returns all non-deleted records when no filters are applied.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `re_id` | integer | ❌ | Fetch a specific resume entity by ID. When provided, the response also includes its nested `links`, `assets`, and `skills`. |
| Query | `type` | string | ❌ | Filter by entity type. One of: `project`, `work_exp`, `certification`, `achievements`, `extra_curricular`, `others` |

```
// Fetch all resume entities:
GET /api/re

// Fetch all resume entities of a specific type:
GET /api/re?type=project

// Fetch a specific resume entity (includes nested links, assets & skills):
GET /api/re?re_id=5
```

**Response:** `200 OK`

```json
// List response (no re_id)
{
  "success": true,
  "count": 2,
  "data": [
    {
      "re_id": 5,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_type": "project",
      "title": "Portfolio Builder",
      "subtitle": "Full-stack app",
      "description": "A PERN stack application...",
      "from_date": "2024-01-01",
      "to_date": "2024-06-30",
      "status": "active"
    }
  ]
}

// Single entity response (with re_id) — includes nested links, assets & skills
{
  "success": true,
  "count": 1,
  "data": {
    "re_id": 5,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_type": "project",
    "title": "Portfolio Builder",
    "subtitle": "Full-stack app",
    "description": "A PERN stack application...",
    "from_date": "2024-01-01",
    "to_date": "2024-06-30",
    "status": "active",
    "links": [ ... ],
    "assets": [ ... ],
    "skills": [
      {
        "skill_id": 1,
        "skill_name": "React",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "re_id": 5
      }
    ]
  }
}
```

---

### `POST /api/re`
Create a new resume entity. Optionally attach links, assets, and skills inline.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `re_type` | string | ✅ | One of: `project`, `work_exp`, `certification`, `achievements`, `extra_curricular`, `others` |
| Body | `title` | string | ✅ | Non-empty string |
| Body | `subtitle` | string | ❌ | Optional subtitle / role / position |
| Body | `description` | string | ❌ | Free-text description |
| Body | `from_date` | string (date) | ❌ | ISO date string; must be ≤ `to_date` if both provided |
| Body | `to_date` | string (date) | ❌ | ISO date string; must be ≥ `from_date` if both provided |
| Body | `links` | object[] | ❌ | Array of link objects to create and attach to this entity |
| Body | `links[].url` | string | ✅* | URL of the link (*required per link object) |
| Body | `links[].title` | string | ✅* | Display title (*required per link object) |
| Body | `links[].description` | string | ❌ | Optional description |
| Body | `assets` | object[] | ❌ | Array of asset objects to create and attach to this entity |
| Body | `assets[].title` | string | ✅* | Asset title (*required per asset object) |
| Body | `assets[].asset_type` | string | ✅* | Asset type (*required per asset object) |
| Body | `assets[].link` | string | ❌ | URL to the asset |
| Body | `assets[].description` | string | ❌ | Optional description |
| Body | `skills` | (string \| object)[] | ❌ | Array of skill name strings (e.g., `"React"`) or skill objects to create and attach to this entity |
| Body | `skills[].skill_name` | string | ✅* | Skill name (*required if passing skill objects instead of strings) |

> **Note:** The entity is created with `status: "active"` by default. Inline `links`, `assets`, and `skills` are created via the `/api/links`, `/api/assets`, and `/api/skills` services respectively and scoped to this entity's `re_id`.

```json
// Request body
{
  "re_type": "project",
  "title": "Portfolio Builder",
  "subtitle": "Full-stack app",
  "description": "A PERN stack application for generating portfolios.",
  "from_date": "2024-01-01",
  "to_date": "2024-06-30",
  "links": [
    { "url": "[https://github.com/janedoe/portfolio](https://github.com/janedoe/portfolio)", "title": "GitHub Repo" }
  ],
  "assets": [
    { "title": "Demo Screenshot", "asset_type": "image", "link": "[https://cdn.example.com/screenshot.png](https://cdn.example.com/screenshot.png)" }
  ],
  "skills": [
    "React",
    "Node.js",
    { "skill_name": "PostgreSQL" }
  ]
}
```

**Response:** `200 OK` — Returns the created resume entity record (does **not** include the nested links/assets/skills in the response; fetch with `GET /api/re?re_id=<id>` to retrieve them).

---

### `PATCH /api/re`
Update an existing resume entity. At least one updatable field is required. Modifications to associated `links`, `assets`, and `skills` are handled via their dedicated API endpoints.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `re_id` | integer | ✅ | ID of the resume entity to update |
| Body | `title` | string | ❌ | Non-empty string |
| Body | `subtitle` | string | ❌ | Optional subtitle / role / position |
| Body | `description` | string | ❌ | Free-text description |
| Body | `from_date` | string (date) | ❌ | Must be ≤ `to_date` if both provided |
| Body | `to_date` | string (date) | ❌ | Must be ≥ `from_date` if both provided |
| Body | `status` | string | ❌ | One of: `draft`, `active`, `deleted` |

```json
// Request body
{
  "re_id": 5,
  "title": "Portfolio Builder v2",
  "status": "draft"
}
```

**Response:** `200 OK`

---

### `DELETE /api/re`
Soft-delete a resume entity (sets `status` to `"deleted"`).

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `re_id` | integer | ✅ | ID of the resume entity to delete |

```
DELETE /api/re?re_id=5
```

**Response:** `200 OK` — Returns the updated (deleted) record.

---

## Skills — `/api/skills`

All routes are 🔒 _Protected_.

### `GET /api/skills`
Fetch all available skills.

```
// No request body or query parameters required.
GET /api/skills
```

**Response:** `200 OK`

---

### `POST /api/skills`
Create a new skill entry.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `skill_name` | string | ✅ | Name of the skill |

```json
// Request body
{
  "skill_name": "TypeScript"
}
```

**Response:** `200 OK`

---

## Assets — `/api/assets`

All routes are 🔒 _Protected_.

### `GET /api/assets`
Fetch all assets (no filtering).

```
// No request body or query parameters required.
GET /api/assets
```

**Response:** `200 OK`

---

### `GET /api/assets/params`
Fetch assets for the authenticated user, optionally scoped to a resume entity.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `re_id` | string/integer | ❌ | Resume entity ID; omit to get all profile-level assets |

```
// Fetch all profile-level assets:
GET /api/assets/params

// Fetch assets for a specific resume entity:
GET /api/assets/params?re_id=7
```

**Response:** `200 OK`

---

### `POST /api/assets`
Create a new non-image asset (link-based).

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `title` | string | ✅ | Asset title |
| Body | `asset_type` | string | ✅ | Type of the asset |
| Body | `link` | string | ❌ | URL to the asset |
| Body | `re_id` | string/integer | ❌ | Resume entity ID to scope the asset to |
| Body | `description` | string | ❌ | |

```json
// Request body
{
  "title": "My Portfolio Website",
  "asset_type": "website",
  "link": "https://janedoe.dev",
  "description": "Personal portfolio site",
  "re_id": 7
}
```

**Response:** `200 OK`

---

### `POST /api/assets/image`
Upload one or more image assets. Uses `multipart/form-data`.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `title` | string | ✅ | Asset title |
| Body | `asset_type` | string | ✅ | Type of the asset |
| Body | `re_id` | string/integer | ❌ | Resume entity ID to scope the asset to |
| Body | `description` | string | ❌ | |
| File | `assets` | image file(s) | ✅ | Image files only; max 10MB per file, up to 10 files |

**Content-Type:** `multipart/form-data`

```
// multipart/form-data fields:
title        = "Project Screenshot"
asset_type   = "image"
description  = "Homepage screenshot"
re_id        = 7
assets       = <binary image file>
```

**Response:** `200 OK`

---

### `PATCH /api/assets`
Update an existing asset. At least one updatable field is required.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `asset_id` | string/integer | ✅ | ID of the asset to update |
| Body | `title` | string | ❌ | |
| Body | `link` | string | ❌ | |
| Body | `description` | string | ❌ | |
| Body | `asset_type` | string | ❌ | |

```json
// Request body
{
  "asset_id": 5,
  "title": "Updated Portfolio Website",
  "link": "https://janedoe.dev/v2"
}
```

**Response:** `200 OK`

---

### `DELETE /api/assets`
Delete an asset by ID.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `asset_id` | string/integer | ✅ | ID of the asset to delete |

```
DELETE /api/assets?asset_id=5
```

**Response:** `200 OK`

---

## Response Format

All endpoints return a consistent JSON envelope:

```json
// Success
{
  "success": true,
  "count": 3,      // present on list responses
  "data": { ... }
}

// Error (operational / validation errors)
{
  "success": false,
  "error": "Human-readable error description"
}

// Error (unexpected internal errors)
{
  "success": false,
  "error": "An unexpected internal server error occurred."
}
```

## HTTP Status Codes Used

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / validation error |
| `401` | Unauthorized (missing or invalid token) |
| `404` | Resource not found |
| `500` | Internal server error |
