# API Contract

Base URL: `/api`

All protected routes require a valid session token obtained via login or signup. Authentication is supported via:
- HTTP-only cookie: `token` (sent automatically by browsers)
- Header: `Authorization: Bearer <token>`

The authenticated user's `user_id` is extracted server-side from the JWT — **never pass `user_id` as a parameter**.

---

## Auth — `/api/auth`

Authentication endpoints for creating sessions, logging in, logging out, and fetching current session profile.

### `POST /api/auth/signup`
Create a new user account, hash the password, issue an `httpOnly` session cookie, and return the user profile with JWT.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `name` | string | ✅ | Min 2, max 75 characters |
| Body | `email` | string | ✅ | Valid email format, max 100 characters |
| Body | `password` | string | ✅ | Min 8 chars; must contain uppercase, lowercase, number, and special character (`!@#$%^&*`) |
| Body | `phone_no` | string | ❌ | Max 15 characters (optional, nullable) |

```json
// Request body
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secure@123",
  "phone_no": "+919876543210"
}
```

**Response:** `201 Created` — Sets `token` cookie (7 days). Returns user data and JWT token.

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone_no": "+919876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `POST /api/auth/login`
Authenticate user credentials and receive a session token.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `email` | string | ✅ | Valid registered email address |
| Body | `password` | string | ✅ | Account password (min 1 character) |

```json
// Request body
{
  "email": "jane@example.com",
  "password": "Secure@123"
}
```

**Response:** `200 OK` — Sets `token` cookie (7 days). Returns user data and JWT token.

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone_no": "+919876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `POST /api/auth/logout`
🔒 _Protected_

Invalidates the current session token by blacklisting it in Redis for its remaining time-to-live and clears the `token` cookie.

```
// No request body required.
// Authentication handled via token cookie or Authorization Bearer header.
POST /api/auth/logout
```

**Response:** `200 OK` — Clears `token` cookie.

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### `GET /api/auth/me`
🔒 _Protected_

Returns the full profile for the currently authenticated user.

```
// No request body or query parameters required.
// Authentication handled via token cookie or Authorization Bearer header.
GET /api/auth/me
```

**Response:** `200 OK` — Returns user profile data.

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone_no": "+919876543210",
    "gender": "female",
    "profile_photo_link": "https://example.com/photos/janedoe.jpg",
    "skills": null,
    "professional_title": "Full Stack Engineer",
    "about": "Building scalable web apps.",
    "current_location": "San Francisco, CA"
  }
}
```

---

## Users — `/api/user`

User profile and account management. `POST /api/user` is public; all other endpoints are 🔒 _Protected_.

### `POST /api/user`
Create a new user account without issuing a session cookie.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `name` | string | ✅ | Non-empty string; max 75 characters |
| Body | `email` | string | ✅ | Valid email format; must be unique |
| Body | `password` | string | ✅ | Minimum 6 characters |
| Body | `phone_no` | string | ❌ | Valid phone format (`+` followed by 7-15 digits) |

```json
// Request body
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "phone_no": "+919876543210"
}
```

**Response:** `200 OK` — Returns created user profile.

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone_no": "+919876543210",
    "gender": null,
    "profile_photo_link": null,
    "professional_title": null,
    "about": null,
    "current_location": null
  }
}
```

---

### `GET /api/user/me`
🔒 _Protected_

Fetch the profile for the currently authenticated user.

```
// No request body or query parameters required.
GET /api/user/me
```

**Response:** `200 OK` — Returns user profile data.

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone_no": "+919876543210",
    "gender": "female",
    "profile_photo_link": "https://example.com/photos/janedoe.jpg",
    "skills": null,
    "professional_title": "Full Stack Engineer",
    "about": "Building scalable web apps.",
    "current_location": "San Francisco, CA"
  }
}
```

---

### `GET /api/user`
🔒 _Protected_

Fetch a user profile by email address.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `email` | string | ✅ | Registered email address to look up |

```
GET /api/user?email=jane@example.com
```

**Response:** `200 OK` — Returns user profile data.

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone_no": "+919876543210",
    "gender": "female",
    "profile_photo_link": "https://example.com/photos/janedoe.jpg",
    "professional_title": "Full Stack Engineer",
    "about": "Building scalable web apps.",
    "current_location": "San Francisco, CA"
  }
}
```

---

### `PATCH /api/user`
🔒 _Protected_

Update the currently authenticated user's profile. At least one updatable field is required.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `name` | string | ❌ | Non-empty string |
| Body | `phone_no` | string | ❌ | Valid phone format (`+` followed by 7-15 digits) |
| Body | `gender` | string | ❌ | One of: `male`, `female`, `other`, `prefer_not_to_say` |
| Body | `profile_photo_link` | string | ❌ | URL / image path string |
| Body | `professional_title` | string | ❌ | Professional title / headline |
| Body | `about` | string | ❌ | Bio / summary text |
| Body | `current_location` | string | ❌ | City / Location text |
| Body | `skills` | any | ❌ | User profile skills |

```json
// Request body
{
  "name": "Jane Doe",
  "professional_title": "Lead Software Engineer",
  "current_location": "San Francisco, CA",
  "gender": "female"
}
```

**Response:** `200 OK` — Returns updated user profile.

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone_no": "+919876543210",
    "gender": "female",
    "profile_photo_link": "https://example.com/photos/janedoe.jpg",
    "skills": null,
    "professional_title": "Lead Software Engineer",
    "about": "Building scalable web apps.",
    "current_location": "San Francisco, CA"
  }
}
```

---

### `DELETE /api/user`
🔒 _Protected_

Delete the currently authenticated user's account and all associated entities (education, resume entities, links, skills, assets) via database cascade.

```
// No request body or query parameters required.
DELETE /api/user
```

**Response:** `200 OK` — Returns deleted user data.

---

## Education — `/api/education`

All routes are 🔒 _Protected_.

> **Note on Response Field Names:** In requests, date and mark fields are sent as `start_date`, `end_date`, and `marks_type`. In responses, the database columns are returned as `from_date`, `to_date`, and `mark_type` (singular).

### `GET /api/education`
Fetch education records for the authenticated user. Returns an array of records if `edu_id` is omitted, or a single record object if `edu_id` is specified.

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

```json
// List response (edu_id omitted)
{
  "success": true,
  "count": 2,
  "data": [
    {
      "education_id": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "institute_name": "MIT",
      "education_type": "under_graduate",
      "from_date": "2019-08-01T00:00:00.000Z",
      "to_date": "2023-05-31T00:00:00.000Z",
      "marks": "3.85",
      "mark_type": "gpa",
      "total_mark": "4",
      "stream": "Computer Science"
    }
  ]
}

// Single record response (edu_id provided)
{
  "success": true,
  "count": 1,
  "data": {
    "education_id": 3,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "institute_name": "MIT",
    "education_type": "under_graduate",
    "from_date": "2019-08-01T00:00:00.000Z",
    "to_date": "2023-05-31T00:00:00.000Z",
    "marks": "3.85",
    "mark_type": "gpa",
    "total_mark": "4",
    "stream": "Computer Science"
  }
}
```

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

```json
{
  "success": true,
  "data": {
    "education_id": 4,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "institute_name": "MIT",
    "education_type": "under_graduate",
    "from_date": "2019-08-01T00:00:00.000Z",
    "to_date": "2023-05-31T00:00:00.000Z",
    "marks": "3.8",
    "mark_type": "gpa",
    "total_mark": "4",
    "stream": "Computer Science"
  }
}
```

---

### `PATCH /api/education`
Update an existing education record. At least one updatable field is required.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `edu_id` | integer | ✅ | Positive integer ID of the record to update |
| Body | `education_type` | string | ❌ | One of the valid education types |
| Body | `institute_name` | string | ❌ | Non-empty string |
| Body | `start_date` | string (date) | ❌ | Must be provided together with `end_date` and `start_date ≤ end_date` |
| Body | `end_date` | string (date) | ❌ | Must be provided together with `start_date` and `end_date ≥ start_date` |
| Body | `marks` | number | ❌ | Must not exceed `total_mark` if both provided |
| Body | `marks_type` | string | ❌ | One of: `percentage`, `gpa` |
| Body | `total_mark` | number | ❌ | Must be greater than `0` |
| Body | `stream` | string | ❌ | Field of study / specialisation |

```json
// Request body
{
  "edu_id": 3,
  "marks": 3.9,
  "stream": "Machine Learning"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "education_id": 3,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "institute_name": "MIT",
    "education_type": "under_graduate",
    "from_date": "2019-08-01T00:00:00.000Z",
    "to_date": "2023-05-31T00:00:00.000Z",
    "marks": "3.9",
    "mark_type": "gpa",
    "total_mark": "4",
    "stream": "Machine Learning"
  }
}
```

---

### `DELETE /api/education`
Delete an education record belonging to the authenticated user.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `edu_id` | integer | ✅ | Positive integer ID of the education record to delete |

```
DELETE /api/education?edu_id=3
```

**Response:** `200 OK` — Returns the deleted record.

```json
{
  "success": true,
  "data": {
    "education_id": 3,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "institute_name": "MIT",
    "education_type": "under_graduate",
    "from_date": "2019-08-01T00:00:00.000Z",
    "to_date": "2023-05-31T00:00:00.000Z",
    "marks": "3.9",
    "mark_type": "gpa",
    "total_mark": "4",
    "stream": "Machine Learning"
  }
}
```

---

## Links — `/api/links`

All routes are 🔒 _Protected_.

### `GET /api/links`
Fetch all links stored in the system (global list).

```
// No request body or query parameters required.
GET /api/links
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_id": null,
      "link": "https://github.com/janedoe",
      "title": "GitHub Profile",
      "description": "My open source work"
    }
  ]
}
```

---

### `GET /api/links/params`
Fetch links for the authenticated user, optionally scoped to a resume entity.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `re_id` | integer/string | ❌ | Resume entity ID; omit to get all profile-level links |

```
// Fetch all profile-level links:
GET /api/links/params

// Fetch links for a specific resume entity:
GET /api/links/params?re_id=7
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_id": null,
      "link": "https://github.com/janedoe",
      "title": "GitHub Profile",
      "description": "My open source work"
    }
  ]
}
```

---

### `POST /api/links`
Create a new link for the authenticated user. If `re_id` is provided, the link is attached to that resume entity; otherwise it is a profile-level link.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `link` | string | ✅ | URL |
| Body | `title` | string | ✅ | Display title |
| Body | `re_id` | integer/string | ❌ | Resume entity ID to scope the link to |
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

```json
{
  "succss": true,
  "data": {
    "id": 12,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 7,
    "link": "https://github.com/janedoe/project-x",
    "title": "Project X Repo",
    "description": null
  }
}
```

---

### `PATCH /api/links`
Update an existing link belonging to the authenticated user. At least one of `title`, `link`, or `description` is required.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `link_id` | integer/string | ✅ | ID of the link to update |
| Body | `title` | string | ❌ | New display title |
| Body | `link` | string | ❌ | New URL |
| Body | `description` | string | ❌ | New description |

```json
// Request body
{
  "link_id": 12,
  "title": "Updated GitHub Profile",
  "link": "https://github.com/jane-doe-updated"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 12,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 7,
    "link": "https://github.com/jane-doe-updated",
    "title": "Updated GitHub Profile",
    "description": null
  }
}
```

---

### `DELETE /api/links`
Delete a link belonging to the authenticated user.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `link_id` | integer/string | ✅ | ID of the link to delete |

```
DELETE /api/links?link_id=12
```

**Response:** `200 OK` — Returns deleted link record.

```json
{
  "success": true,
  "data": {
    "id": 12,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 7,
    "link": "https://github.com/jane-doe-updated",
    "title": "Updated GitHub Profile",
    "description": null
  }
}
```

---

## Resume Entities — `/api/re`

All routes are 🔒 _Protected_.

Resume Entities (RE) are structured portfolio items such as projects, work experiences, certifications, etc. They can have associated links, assets, and skills.

> **Note on Populated Relations:** Both list responses (`GET /api/re`) and single entity responses (`GET /api/re?re_id=...` and `POST /api/re`) return entities fully populated with their associated `links`, `assets`, and `skills`.

### `GET /api/re`
Fetch resume entities for the authenticated user. Returns all non-deleted records when no `re_id` is applied, or a single record when `re_id` is supplied.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `re_id` | integer | ❌ | Positive integer ID of a specific resume entity |
| Query | `type` | string | ❌ | Filter by entity type: `project`, `work_exp`, `certification`, `achievements`, `extra_curricular`, `others` |

```
// Fetch all resume entities (populated with nested links, assets & skills):
GET /api/re

// Fetch all resume entities of a specific type:
GET /api/re?type=project

// Fetch a specific resume entity:
GET /api/re?re_id=5
```

**Response:** `200 OK`

```json
// List response (no re_id) — includes nested links, assets & skills
{
  "success": true,
  "count": 1,
  "data": [
    {
      "re_id": 5,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_type": "project",
      "title": "Portfolio Builder",
      "subtitle": "Full-stack app",
      "description": "A PERN stack application...",
      "from_date": "2024-01-01T00:00:00.000Z",
      "to_date": "2024-06-30T00:00:00.000Z",
      "status": "active",
      "links": [
        {
          "id": 1,
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "re_id": 5,
          "link": "https://github.com/janedoe/portfolio",
          "title": "Source Code",
          "description": "GitHub repo"
        }
      ],
      "assets": [],
      "skills": [
        {
          "skill_id": 1,
          "skill_name": "React",
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "re_id": 5
        }
      ]
    }
  ]
}

// Single entity response (with re_id)
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
    "from_date": "2024-01-01T00:00:00.000Z",
    "to_date": "2024-06-30T00:00:00.000Z",
    "status": "active",
    "links": [ ... ],
    "assets": [ ... ],
    "skills": [ ... ]
  }
}
```

---

### `POST /api/re`
Create a new resume entity. Optionally attach links, assets, and skills inline during creation. Returns the created entity populated with nested relations.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `re_type` | string | ✅ | One of: `project`, `work_exp`, `certification`, `achievements`, `extra_curricular`, `others` |
| Body | `title` | string | ✅ | Non-empty string |
| Body | `subtitle` | string | ❌ | Optional subtitle / role / position |
| Body | `description` | string | ❌ | Free-text description |
| Body | `from_date` | string (date) | ❌ | ISO date string; must be ≤ `to_date` if both provided |
| Body | `to_date` | string (date) | ❌ | ISO date string; must be ≥ `from_date` if both provided |
| Body | `links` | object[] | ❌ | Array of link objects to create and attach to this entity |
| Body | `links[].url` | string | ✅* | Target URL (*Note: inline links use `url`, whereas `/api/links` uses `link`) |
| Body | `links[].title` | string | ✅* | Display title |
| Body | `links[].description` | string | ❌ | Optional description |
| Body | `assets` | object[] | ❌ | Array of asset objects to create and attach to this entity |
| Body | `assets[].title` | string | ✅* | Asset title |
| Body | `assets[].asset_type` | string | ✅* | One of: `image`, `youtube` |
| Body | `assets[].link` | string | ❌ | URL to the asset |
| Body | `assets[].description` | string | ❌ | Optional description |
| Body | `skills` | (string \| object)[] | ❌ | Array of skill name strings (e.g., `"React"`) or skill objects |
| Body | `skills[].skill_name` | string | ✅* | Skill name (*required if passing skill objects) |

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
    { "url": "https://github.com/janedoe/portfolio", "title": "GitHub Repo" }
  ],
  "assets": [
    { "title": "Demo Screenshot", "asset_type": "image", "link": "https://cdn.example.com/screenshot.png" }
  ],
  "skills": [
    "React",
    "Node.js",
    { "skill_name": "PostgreSQL" }
  ]
}
```

**Response:** `200 OK` — Returns the created resume entity with populated `links`, `assets`, and `skills`.

```json
{
  "success": true,
  "data": {
    "re_id": 5,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_type": "project",
    "title": "Portfolio Builder",
    "subtitle": "Full-stack app",
    "description": "A PERN stack application for generating portfolios.",
    "from_date": "2024-01-01T00:00:00.000Z",
    "to_date": "2024-06-30T00:00:00.000Z",
    "status": "active",
    "links": [
      {
        "id": 1,
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "re_id": 5,
        "link": "https://github.com/janedoe/portfolio",
        "title": "GitHub Repo",
        "description": null
      }
    ],
    "assets": [
      {
        "asset_id": 1,
        "cloudinary_public_id": null,
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "re_id": 5,
        "title": "Demo Screenshot",
        "link": "https://cdn.example.com/screenshot.png",
        "description": null,
        "asset_type": "image"
      }
    ],
    "skills": [
      {
        "skill_id": 1,
        "skill_name": "React",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "re_id": 5
      },
      {
        "skill_id": 2,
        "skill_name": "Node.js",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "re_id": 5
      },
      {
        "skill_id": 3,
        "skill_name": "PostgreSQL",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "re_id": 5
      }
    ]
  }
}
```

---

### `PATCH /api/re`
Update an existing resume entity. At least one updatable field is required. Modifications to associated `links`, `assets`, and `skills` are handled via their dedicated API endpoints.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `re_id` | integer | ✅ | Positive integer ID of the resume entity to update |
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

**Response:** `200 OK` — Returns the updated resume entity record.

```json
{
  "success": true,
  "data": {
    "re_id": 5,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_type": "project",
    "title": "Portfolio Builder v2",
    "subtitle": "Full-stack app",
    "description": "A PERN stack application...",
    "from_date": "2024-01-01T00:00:00.000Z",
    "to_date": "2024-06-30T00:00:00.000Z",
    "status": "draft"
  }
}
```

---

### `DELETE /api/re`
Soft-delete a resume entity (sets `status` to `"deleted"`).

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `re_id` | integer | ✅ | Positive integer ID of the resume entity to delete |

```
DELETE /api/re?re_id=5
```

**Response:** `200 OK` — Returns the updated (deleted) record with `status: "deleted"`.

```json
{
  "success": true,
  "data": {
    "re_id": 5,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_type": "project",
    "title": "Portfolio Builder v2",
    "subtitle": "Full-stack app",
    "description": "A PERN stack application...",
    "from_date": "2024-01-01T00:00:00.000Z",
    "to_date": "2024-06-30T00:00:00.000Z",
    "status": "deleted"
  }
}
```

---

## Skills — `/api/skills`

All routes are 🔒 _Protected_.

### `GET /api/skills`
Fetch all skills across the system (global/admin debug list).

```
// No request body or query parameters required.
GET /api/skills
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "skill_id": 1,
      "skill_name": "TypeScript",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_id": null
    },
    {
      "skill_id": 2,
      "skill_name": "React",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_id": 5
    }
  ]
}
```

---

### `GET /api/skills/params`
Fetch skills for the authenticated user, optionally scoped to a resume entity.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `re_id` | integer/string | ❌ | Resume entity ID; omit to get all profile-level skills |

```
// Fetch all profile-level skills:
GET /api/skills/params

// Fetch skills for a specific resume entity:
GET /api/skills/params?re_id=5
```

**Response:** `200 OK`

```json
// Profile-level skills (no re_id)
{
  "success": true,
  "count": 1,
  "data": [
    {
      "skill_id": 1,
      "skill_name": "TypeScript",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_id": null
    }
  ]
}

// Scoped skills (with re_id=5)
{
  "success": true,
  "count": 1,
  "data": [
    {
      "skill_id": 2,
      "skill_name": "React",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_id": 5
    }
  ]
}
```

---

### `POST /api/skills`
Create a new skill entry. If `re_id` is provided, the skill is attached to that resume entity; otherwise it is created as a profile-level skill.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `skill_name` | string | ✅ | Name of the skill |
| Body | `re_id` | integer/string | ❌ | Resume entity ID to scope the skill to |

```json
// Profile-level skill
{
  "skill_name": "TypeScript"
}

// Resume-entity-scoped skill
{
  "skill_name": "Docker",
  "re_id": 5
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "skill_id": 3,
    "skill_name": "Docker",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 5
  }
}
```

---

### `PATCH /api/skills`
Update an existing skill name belonging to the authenticated user.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `skill_id` | integer/string | ✅ | ID of the skill to update |
| Body | `skill_name` | string | ✅ | New name for the skill |

```json
// Request body
{
  "skill_id": 3,
  "skill_name": "Docker & Containerization"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "skill_id": 3,
    "skill_name": "Docker & Containerization",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 5
  }
}
```

---

### `DELETE /api/skills`
Delete an existing skill belonging to the authenticated user.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `skill_id` | integer/string | ✅ | ID of the skill to delete |

```
DELETE /api/skills?skill_id=3
```

**Response:** `200 OK` — Returns deleted skill record.

```json
{
  "success": true,
  "data": {
    "skill_id": 3,
    "skill_name": "Docker & Containerization",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 5
  }
}
```

---

## Assets — `/api/assets`

All routes are 🔒 _Protected_.

> **Note on Asset Types:** Allowed values for `asset_type` in PostgreSQL are `'image'` and `'youtube'` (`asset_type_enum`).

### `GET /api/assets`
Fetch all assets stored in the system (global list).

```
// No request body or query parameters required.
GET /api/assets
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "asset_id": 1,
      "cloudinary_public_id": "lovely-portfolios/m9xy1zabcde87",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_id": 4,
      "title": "System Architecture",
      "link": "https://res.cloudinary.com/.../m9xy1zabcde87.avif",
      "description": "High-level diagram",
      "asset_type": "image"
    }
  ]
}
```

---

### `GET /api/assets/params`
Fetch assets for the authenticated user scoped to a resume entity.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `re_id` | integer/string | ✅ | Resume entity ID |

```
GET /api/assets/params?re_id=7
```

**Response:** `200 OK`

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "asset_id": 5,
      "cloudinary_public_id": null,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "re_id": 7,
      "title": "Demo Walkthrough",
      "link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "description": "Project demo video",
      "asset_type": "youtube"
    }
  ]
}
```

---

### `POST /api/assets`
Create a new link-based asset (e.g. YouTube video).

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `title` | string | ✅ | Asset title |
| Body | `asset_type` | string | ✅ | One of: `image`, `youtube` |
| Body | `link` | string | ❌ | URL to the asset |
| Body | `re_id` | integer/string | ❌ | Resume entity ID to scope the asset to |
| Body | `description` | string | ❌ | Optional description |

```json
// Request body
{
  "title": "Project Demo Video",
  "asset_type": "youtube",
  "link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "description": "Walkthrough presentation",
  "re_id": 7
}
```

**Response:** `200 OK`

```json
{
  "succss": true,
  "data": {
    "asset_id": 8,
    "cloudinary_public_id": null,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 7,
    "title": "Project Demo Video",
    "link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "description": "Walkthrough presentation",
    "asset_type": "youtube"
  }
}
```

---

### `POST /api/assets/image`
Upload an image asset to Cloudinary. Uses `multipart/form-data`.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `title` | string | ✅ | Asset title |
| Body | `asset_type` | string | ✅ | Must be `image` |
| Body | `re_id` | integer/string | ❌ | Resume entity ID to scope the asset to |
| Body | `description` | string | ❌ | Optional description |
| File | `assets` | image file | ✅ | Binary image file (`image/*`), max 10MB |

**Content-Type:** `multipart/form-data`

```
// multipart/form-data fields:
title        = "Architecture Diagram"
asset_type   = "image"
description  = "Cloud deployment diagram"
re_id        = 7
assets       = <binary image file>
```

**Response:** `200 OK`

```json
{
  "succss": true,
  "data": {
    "asset_id": 9,
    "cloudinary_public_id": "lovely-portfolios/m9xy1zabcde87",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 7,
    "title": "Architecture Diagram",
    "link": "https://res.cloudinary.com/cloudname/image/upload/v1234567890/lovely-portfolios/m9xy1zabcde87.avif",
    "description": "Cloud deployment diagram",
    "asset_type": "image"
  }
}
```

---

### `PATCH /api/assets`
Update an existing asset belonging to the authenticated user. At least one updatable field is required.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `asset_id` | integer/string | ✅ | ID of the asset to update |
| Body | `title` | string | ❌ | New title |
| Body | `link` | string | ❌ | New link / URL |
| Body | `description` | string | ❌ | New description |
| Body | `asset_type` | string | ❌ | One of: `image`, `youtube` |

```json
// Request body
{
  "asset_id": 8,
  "title": "Updated Demo Walkthrough",
  "link": "https://www.youtube.com/watch?v=updated_video"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "asset_id": 8,
    "cloudinary_public_id": null,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 7,
    "title": "Updated Demo Walkthrough",
    "link": "https://www.youtube.com/watch?v=updated_video",
    "description": "Walkthrough presentation",
    "asset_type": "youtube"
  }
}
```

---

### `DELETE /api/assets`
Delete an asset by ID and remove its corresponding image from Cloudinary (if applicable).

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `asset_id` | integer/string | ✅ | ID of the asset to delete |

```
DELETE /api/assets?asset_id=9
```

**Response:** `200 OK` — Returns deleted asset record.

```json
{
  "success": true,
  "data": {
    "asset_id": 9,
    "cloudinary_public_id": "lovely-portfolios/m9xy1zabcde87",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "re_id": 7,
    "title": "Architecture Diagram",
    "link": "https://res.cloudinary.com/.../m9xy1zabcde87.avif",
    "description": "Cloud deployment diagram",
    "asset_type": "image"
  }
}
```

---

## Portfolio — `/api/portfolio`

`GET /api/portfolio/public/:portfolio_id` is public; all other endpoints are 🔒 _Protected_.

> **Note on Portfolio Status:** Allowed values for `status` in PostgreSQL are `'draft'`, `'published'` and `'archived'` (`portfolio_status_enum`). New portfolios, whether created manually or generated by the AI pipeline, start as `draft`. Only `published` portfolios are visible through the public endpoint.

### `GET /api/portfolio/public/:portfolio_id`
Fetch a published portfolio by ID. No authentication required. Returns `404 Not Found` if the portfolio does not exist **or** is not `published` (`draft` / `archived`), so the existence of private portfolios is not revealed.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Path | `portfolio_id` | integer | ✅ | Positive integer ID of the portfolio |

```
GET /api/portfolio/public/12
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "portfolio_id": 12,
    "user_email": "jane@example.com",
    "profile_data": { ... },
    "portfolio_name": "Backend Engineer",
    "create_date": "2024-06-30T00:00:00.000Z",
    "status": "published"
  }
}
```

---

### `GET /api/portfolio`
🔒 _Protected_

Fetch portfolios for the authenticated user, regardless of `status`. Returns an array of records if `portfolio_id` is omitted, or a single record object if `portfolio_id` is specified. Returns `404 Not Found` if `portfolio_id` does not exist **or** belongs to another user.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `portfolio_id` | integer | ❌ | Positive integer ID of a specific portfolio |

```
// Fetch all portfolios:
GET /api/portfolio

// Fetch a specific portfolio:
GET /api/portfolio?portfolio_id=12
```

**Response:** `200 OK`

```json
// List response (portfolio_id omitted)
{
  "success": true,
  "count": 1,
  "data": [
    {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "portfolio_id": 12,
      "user_email": "jane@example.com",
      "profile_data": { ... },
      "portfolio_name": "Backend Engineer",
      "create_date": "2024-06-30T00:00:00.000Z",
      "status": "draft"
    }
  ]
}

// Single record response (portfolio_id provided)
{
  "success": true,
  "count": 1,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "portfolio_id": 12,
    "user_email": "jane@example.com",
    "profile_data": { ... },
    "portfolio_name": "Backend Engineer",
    "create_date": "2024-06-30T00:00:00.000Z",
    "status": "draft"
  }
}
```

---

### `POST /api/portfolio`
🔒 _Protected_

Manually create a new portfolio. `user_email` is taken from the session token. The portfolio is created with `status: "draft"`.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `portfolio_name` | string | ✅ | Non-empty string |
| Body | `profile_data` | object | ❌ | Portfolio document as a JSON object (nullable) |

```json
// Request body
{
  "portfolio_name": "Backend Engineer",
  "profile_data": { ... }
}
```

**Response:** `201 Created` — Returns the created portfolio record.

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "portfolio_id": 12,
    "user_email": "jane@example.com",
    "profile_data": { ... },
    "portfolio_name": "Backend Engineer",
    "create_date": "2024-06-30T00:00:00.000Z",
    "status": "draft"
  }
}
```

---

### `POST /api/portfolio/generate`
🔒 _Protected_

Generate a portfolio tailored to a job description using the AI pipeline. The server forwards the authenticated user's ID and the job description to the AI pipeline, which reads the user's data, generates the portfolio and saves it with `status: "draft"`.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `jd_text` | string | ✅ | Job description text; non-empty string |

```json
// Request body
{
  "jd_text": "We are looking for a Backend Engineer experienced in Node.js and PostgreSQL..."
}
```

**Response:** `201 Created` — Returns the AI pipeline's response: the ID of the saved portfolio and the generated portfolio document.

```json
{
  "success": true,
  "data": {
    "portfolio_id": 13,
    "portfolio_json": { ... }
  }
}
```

**Errors:** AI pipeline errors are forwarded with the pipeline's status code and message in the `error` field.

| Code | Meaning |
|---|---|
| `400` | Invalid `user_id` or empty `jd_text` |
| `404` | User not found |
| `422` | User has no active resume entities, or the profile does not match the job description |
| `500` | Portfolio was generated but could not be saved |
| `502` | AI provider failed to produce a valid result |
| `503` | AI pipeline is unreachable, or its database is unavailable |

---

### `PATCH /api/portfolio`
🔒 _Protected_

Update an existing portfolio belonging to the authenticated user. At least one updatable field is required.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Body | `portfolio_id` | integer | ✅ | Positive integer ID of the portfolio to update |
| Body | `portfolio_name` | string | ❌ | Non-empty string |
| Body | `profile_data` | object | ❌ | Portfolio document as a JSON object (nullable) |
| Body | `user_email` | string | ❌ | Non-empty string |
| Body | `status` | string | ❌ | One of: `draft`, `published`, `archived` |

```json
// Request body
{
  "portfolio_id": 12,
  "portfolio_name": "Senior Backend Engineer",
  "status": "published"
}
```

**Response:** `200 OK` — Returns the updated portfolio record.

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "portfolio_id": 12,
    "user_email": "jane@example.com",
    "profile_data": { ... },
    "portfolio_name": "Senior Backend Engineer",
    "create_date": "2024-06-30T00:00:00.000Z",
    "status": "published"
  }
}
```

---

### `DELETE /api/portfolio`
🔒 _Protected_

Permanently delete a portfolio belonging to the authenticated user.

| Location | Parameter | Type | Required | Description |
|---|---|---|---|---|
| Query | `portfolio_id` | integer | ✅ | Positive integer ID of the portfolio to delete |

```
DELETE /api/portfolio?portfolio_id=12
```

**Response:** `200 OK` — Returns the deleted portfolio record.

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "portfolio_id": 12,
    "user_email": "jane@example.com",
    "profile_data": { ... },
    "portfolio_name": "Senior Backend Engineer",
    "create_date": "2024-06-30T00:00:00.000Z",
    "status": "published"
  }
}
```

---

## Response Format

All endpoints return a consistent JSON envelope:

```json
// Success (List Response)
{
  "success": true,
  "count": 3,
  "data": [ ... ]
}

// Success (Single Object Response)
{
  "success": true,
  "data": { ... }
}

// Error (Operational / Service Errors via AppError)
{
  "success": false,
  "error": "Human-readable error description"
}

// Error (Controller Validation Errors)
{
  "success": false,
  "message": "Human-readable validation message"
}

// Error (Unexpected Internal Errors)
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
| `401` | Unauthorized (missing, invalid, or expired token) |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate email address) |
| `422` | Unprocessable entity (e.g. AI pipeline cannot build a portfolio from the user's data) |
| `500` | Internal server error |
| `502` | Bad gateway (AI provider failed, forwarded from the AI pipeline) |
| `503` | Service unavailable (AI pipeline or its database is unreachable) |
