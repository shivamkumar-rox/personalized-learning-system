# Personalized Learning Analytics System

A NoSQL (MongoDB) backend for tracking student learning activity and surfacing
simple analytics — built for a NoSQL Database coursework project.

## Why MongoDB / NoSQL here?

Learning activity data is **irregular by nature**: a `video_watch` event has
different fields than an `assignment` submission or a `login`. Instead of
forcing every event into one rigid SQL table (or a maze of joined tables),
the `Activity` collection uses a `metadata` field that can hold whatever
shape of data each event type needs. This is demonstrated directly in
`models/Activity.js` and in `seed/seed.js`.

The project also showcases MongoDB's **aggregation pipeline** (`$group`,
`$lookup`, `$project`, `$sort`) to compute analytics — the NoSQL equivalent
of SQL `GROUP BY` + `JOIN` queries — in `routes/analytics.js`.

## Data Model

| Collection | Purpose |
|---|---|
| `students`  | Student profile, learning preferences, enrolled courses |
| `courses`   | Course catalog |
| `activities`| Learning events: video watches, reading, assignments, logins (flexible `metadata`) |
| `quizzes`   | Quiz attempts with score, topic — used to find "weak topics" per student |

## Setup

1. **Install MongoDB** locally (or use a free MongoDB Atlas cluster) and have
   it running on `mongodb://127.0.0.1:27017` — or update `MONGO_URI` below.

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # edit .env if your MongoDB URI or port is different
   ```

4. **Seed sample data** (4 students, 3 courses, activity logs, quiz attempts)
   ```bash
   npm run seed
   ```

5. **Run the server**
   ```bash
   npm start
   # or, for auto-reload during development:
   npm run dev
   ```

   Server runs at `http://localhost:5000` by default.

## API Reference

### Students — `/api/students`
| Method | Route | Description |
|---|---|---|
| POST | `/api/students` | Create a student |
| GET | `/api/students` | List all students (with enrolled courses populated) |
| GET | `/api/students/:id` | Get one student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

Example body for POST:
```json
{
  "name": "Priya Nair",
  "email": "priya@example.com",
  "gradeLevel": "Year 2",
  "learningPreferences": ["visual", "self-paced"]
}
```

### Courses — `/api/courses`
Same CRUD pattern as students. Example body for POST:
```json
{
  "title": "Operating Systems",
  "subject": "Computer Science",
  "instructor": "Dr. Rao",
  "difficultyLevel": "intermediate",
  "tags": ["os", "processes"]
}
```

### Activities — `/api/activities`
| Method | Route | Description |
|---|---|---|
| POST | `/api/activities` | Log a learning event |
| GET | `/api/activities?studentId=&courseId=` | List events (filterable) |
| PUT | `/api/activities/:id` | Update an event |
| DELETE | `/api/activities/:id` | Delete an event |
| POST | `/api/activities/quiz` | Log a quiz attempt |
| GET | `/api/activities/quiz?studentId=&courseId=` | List quiz attempts (filterable) |

Example body for POST `/api/activities`:
```json
{
  "studentId": "<student_id>",
  "courseId": "<course_id>",
  "activityType": "video_watch",
  "durationMinutes": 20,
  "metadata": { "videoId": "v42", "percentWatched": 85 }
}
```

Example body for POST `/api/activities/quiz`:
```json
{
  "studentId": "<student_id>",
  "courseId": "<course_id>",
  "quizTitle": "Loops Quiz",
  "topic": "loops",
  "score": 38,
  "maxScore": 50
}
```

### Analytics — `/api/analytics`
| Method | Route | Description |
|---|---|---|
| GET | `/api/analytics/average-scores` | Average quiz score % per student |
| GET | `/api/analytics/time-spent` | Total minutes spent per student per course |
| GET | `/api/analytics/most-active-students?limit=5` | Top N students by engagement time |
| GET | `/api/analytics/course-popularity` | Courses ranked by activity event count |
| GET | `/api/analytics/weak-topics/:studentId` | Topics where a student averages < 60% |

## Testing quickly with curl

```bash
# List all students
curl http://localhost:5000/api/students

# Get average scores
curl http://localhost:5000/api/analytics/average-scores

# Get weak topics for a specific student (use an _id from the students list)
curl http://localhost:5000/api/analytics/weak-topics/<studentId>
```

You can also import these endpoints into Postman/Insomnia for a nicer UI.

## Project Structure
```
learning-analytics-system/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── Student.js
│   ├── Course.js
│   ├── Activity.js        # flexible metadata field — key NoSQL example
│   └── Quiz.js
├── routes/
│   ├── students.js         # CRUD
│   ├── courses.js          # CRUD
│   ├── activities.js       # CRUD + quiz attempts
│   └── analytics.js        # aggregation pipeline queries
├── seed/
│   └── seed.js             # sample data loader
├── server.js
├── package.json
└── .env.example
```

## Ideas for extending (if you want to go beyond "simple")
- Add JWT auth so each student only sees their own data
- Add a `$lookup`-based "recommended next course" query based on tags/preferences
- Build a small React/EJS dashboard that charts the analytics endpoints
- Add indexes (`studentId`, `courseId`) and explain how they'd help in a NoSQL report

## Final Review Additions
- **Indexes**: `activities(studentId,timestamp)`, `activities(courseId)`, `quizzes(studentId,topic)`, `quizzes(courseId)`, `courses(tags)` (multikey)
- **Innovation**: `GET /api/analytics/recommendations/:studentId`, `GET /api/analytics/at-risk`
- **Dashboard**: open `http://localhost:5000/` (Chart.js, served from `public/`)
- **Performance evaluation**: `npm run benchmark` (100k docs, COLLSCAN vs IXSCAN)
- **Database dump**: `npm run export` (JSON in `dump/`) or `mongodump --db learning_analytics --out dump_bson`
