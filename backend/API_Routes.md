# API Routes (current)

Base URL: `{{APP_URL}}/api` (e.g. `http://127.0.0.1:8000/api`)

Authentication: the API uses JWT. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Public routes (no authentication)

- `POST /register` — Register a new user (throttle: 5/min)
    - Body (example):
        ```json
        {
            "name": "Jane",
            "email": "jane@example.com",
            "password": "secret",
            "password_confirmation": "secret",
            "teacher": false,
            "student": true
        }
        ```

- `POST /login` — Login (throttle: 10/min)
    - Body: `{ "email": "...", "password": "..." }`

- `GET /landing_page` — Landing page data
- `GET /subjects` — List subjects
- `GET /subjects/{subject}/units` — Units for a subject
- `GET /units/{unit}/lessons` — Lessons for a unit
- `GET /lessons/{lesson}/subtopics` — Subtopics for a lesson
- `GET /subjects/{subject}/teachers` — Teachers for a subject
- `GET /teachers/{teacher}/lessons` — Lessons for a teacher
- `GET /test/{teacher}` — Developer/test endpoint
- `GET /search` — Search endpoint (query params)

## Protected routes (require `auth:api`)

Authentication endpoints:

- `POST /logout` — Invalidate current token
- `GET /me` — Current user profile
- `PUT /user` — Update current profile (body: `name`, `email`, `password`, `subject_id`)

Teacher-only (require role:teacher):

- `GET /teachers/dashboard` — Teacher dashboard
- `GET /teachers/{teacher}/lessons/{lesson}/content` — Lesson content (scope bindings)
- `GET /quizzes-details/{quiz}` — Quiz details for teacher
- `API Resource /videos` — `GET|POST|GET /{id}|PUT /{id}|DELETE /{id}` (video CRUD; upload uses form-data)
- `API Resource /quizzes` — `GET|POST|GET /{id}|PUT /{id}|DELETE /{id}` (quizzes CRUD)

Student-only (require role:student):

- `POST /quiz/{quiz}/answer` — Submit answers for a quiz
    - Body (example):
        ```json
        {
            "answers": [
                { "question_id": 1, "answer_text": "Option A" },
                { "question_id": 2, "answer_text": "Option B" }
            ]
        }
        ```
- `GET /student/dashboard` — Student dashboard

Misc:

- `GET /subjects/{subject}/subtopics` — (protected) list subtopics for a subject

## Examples

Register:

```bash
curl -X POST "{{APP_URL}}/api/register" -H "Content-Type: application/json" -d '{"name":"Jane","email":"jane@example.com","password":"secret","password_confirmation":"secret"}'
```

Login (receive `access_token`):

```bash
curl -X POST "{{APP_URL}}/api/login" -H "Content-Type: application/json" -d '{"email":"jane@example.com","password":"secret"}'
```

Call protected endpoint (replace `<token>`):

```bash
curl -H "Authorization: Bearer <token>" "{{APP_URL}}/api/subjects"
```

## Notes

- Replace `{id}` placeholders with resource IDs.
- Role middleware is applied where noted (`role:teacher` or `role:student`).
- Throttle limits are enforced on `register`, `login`, and `chat/send`.
