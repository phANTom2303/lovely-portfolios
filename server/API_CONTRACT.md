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

// Error
{
  "success": false,
  "message": "Human-readable error description"
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
