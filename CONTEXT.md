# SARK Quiz Platform — Full Codebase Context

> Read this before touching any code. This document captures the complete architecture, data models, API surface, component behaviour, and design decisions as of July 2026.

---

## 1. Project Overview

**SARK** is the tech club of a college (NRHS / Himalay-NRHS). This web platform is the club's quiz and technical screening tool.

### Purpose
- Run **timed, multiple-choice technical quizzes** for candidate screening.
- Let **admins** create, manage, and activate quizzes through a control panel.
- Collect submissions, **grade them server-side**, and show a ranked leaderboard.
- Show candidates a **result/confirmation page** with an optional invite (e.g. WhatsApp QR) after submission.

### Current State
- Fully functional end-to-end: `signup → quiz → submission → result`.
- Admin panel: create / edit / delete / activate quizzes + view leaderboard.
- No public landing page (`app/page.tsx` returns `null`).
- Deployed on **Next.js 16** with **Supabase (PostgreSQL)**.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router, RSC-first) |
| Language | TypeScript 6 (strict mode) |
| Runtime | Node.js (server-only modules used throughout) |
| Database | Supabase (PostgreSQL) via @supabase/supabase-js |
| Styling | Tailwind CSS v4 + tw-animate-css + shadcn (base-nova style) |
| UI Primitives | `@base-ui/react` (headless components) |
| Icons | `lucide-react` |
| Animations | `framer-motion` (installed, not yet widely used) |
| Font | **BatmanForever** (regular `batmfa__.ttf`) + **BatmanForeverOutline** (`batmfo__.ttf`) — served from `public/fonts/`. IBM Plex Mono kept for mono. |
| Component lib | shadcn v4 — only `Button` is scaffolded so far |
| Path alias | `@/*` → project root |

> **Note:** Most UI uses hand-written BEM-style CSS classes in `globals.css`. The shadcn `Button` component exists but is rarely used — raw HTML buttons with custom CSS are the norm.

---

## 3. Environment Variables

**Setup:** Create `.env.local` in the project root (gitignored, never committed).
A committed template lives at [`.env.example`](file:///d:/Vs%20code/Sark/.env.example).

```
NEXT_PUBLIC_SUPABASE_URL # Required. Supabase project URL.
SUPABASE_SERVICE_ROLE_KEY # Required. Supabase admin API key.

AUTH_SECRET          # Optional. Primary HMAC secret for session tokens.
NEXTAUTH_SECRET      # Optional. Fallback HMAC secret (checked after AUTH_SECRET).
```

### Secret Resolution Order (both user and admin sessions)
1. `AUTH_SECRET`
2. `NEXTAUTH_SECRET`
3. `NEXT_PUBLIC_SUPABASE_URL` ← convenient fallback
4. Hardcoded dev defaults (`"sark-quiz-dev-secret"` / `"sark-admin-dev-secret"`)

### Admin Credentials (hardcoded in API route — NOT in env)
```
Username: sarktech
Password: nrhs123
```
> ⚠️ **These are plaintext in source.** File: `app/api/admin/auth/login/route.ts` lines 5–6. Move to env before any public deployment.

---

## 4. Directory Structure

```
sark/
├── app/
│   ├── globals.css              Global design system + all BEM component styles (~2 000 lines)
│   ├── layout.tsx               Root layout: dark class, bg-sark-black, text-sark-ink
│   ├── page.tsx                 "/" — returns null (no landing page yet)
│   │
│   ├── admin/
│   │   ├── page.tsx             Admin dashboard (SSR, auth-gated). Panels: quiz | leaderboard
│   │   └── login/
│   │       └── page.tsx         Admin login (SSR, redirects if already authenticated)
│   │
│   ├── quiz/
│   │   ├── page.tsx             Quiz main page (SSR, auth-gated, checks submission state)
│   │   ├── login/
│   │   │   └── page.tsx         Quiz login/signup (SSR, redirects if already authenticated)
│   │   └── result/
│   │       └── page.tsx         Post-submission confirmation page with optional invite
│   │
│   └── api/
│       ├── quiz/
│       │   ├── route.ts          GET: fetch active quiz payload | POST: submit answers
│       │   └── auth/
│       │       ├── login/route.ts    POST: quiz user login
│       │       ├── logout/route.ts   POST: quiz user logout
│       │       └── signup/route.ts   POST: quiz user signup
│       └── admin/
│           ├── auth/
│           │   ├── login/route.ts    POST: admin login (hardcoded credentials)
│           │   └── logout/route.ts   POST: admin logout
│           └── quizzes/
│               ├── route.ts              GET: list quizzes | POST: create quiz
│               └── [quizId]/
│                   ├── route.ts           PATCH: update / toggle active | DELETE: delete quiz
│                   └── submissions/
│                       └── route.ts       DELETE: clear leaderboard for a quiz
│
├── components/
│   ├── admin/
│   │   ├── AdminLogin.tsx         Admin login form (client component)
│   │   ├── ClearLeaderboardButton.tsx  Delete all submissions for a quiz (client)
│   │   └── QuizPanel.tsx          Full quiz CRUD editor panel (client, ~560 lines)
│   ├── quiz/
│   │   ├── QuizAuth.tsx           Login / signup switcher form (client)
│   │   └── QuizExperience.tsx     Complete quiz-taking UI (client, ~510 lines)
│   └── ui/
│       └── button.tsx             shadcn Button using @base-ui/react, CVA variants
│
├── lib/
│   ├── utils.ts                   cn() helper (clsx + tailwind-merge)
│   ├── auth/
│   │   ├── session.ts             Quiz user session: HMAC-SHA256 cookie tokens, 6h TTL
│   │   ├── admin-session.ts       Admin session: HMAC-SHA256 cookie tokens, 8h TTL
│   │   ├── users.ts               QuizUser collection helpers
│   │   └── password.ts            PBKDF2-SHA512 hashing + verification
│   └── quiz/
│       ├── types.ts               Shared TypeScript types for quiz domain
│       ├── db.ts                  All quiz DB operations + validation logic (~370 lines)
│       └── data.ts                Thin layer: getQuizPayload, findQuizSubmission, etc.
│
├── data/
│   └── quiz.json                  Default seed quiz. Auto-seeded if DB is empty on first access.
│
└── public/
    ├── fonts/
    │   ├── batmfa__.ttf         BatmanForever regular — served at /fonts/batmfa__.ttf
    │   └── batmfo__.ttf         BatmanForever outline — served at /fonts/batmfo__.ttf
    └── SARK-LOGO.png              Club logo used on every page
```

---

## 5. Data Models (Supabase PostgreSQL Tables)

### Table: `quiz_users`

```ts
QuizUserDocument {
  name: string            // Full name
  usn: string             // University Serial Number (uppercased). Unique index.
  email: string           // Email (lowercased). Unique index.
  phone: string           // Phone number
  passwordHash: string    // Format: "pbkdf2:<iterations>:<salt>:<hash>"
  score: number | null    // Score % of their last submission (denormalised)
  timetaken: number | null // Seconds taken for last submission (denormalised)
  latestQuizId?: string
  latestQuizName?: string
  createdAt: Date
  updatedAt: Date
}
```

**Indexes/Constraints:** `email` unique, `usn` unique

---

### Table: `quizzes`

```ts
QuizDocument {
  name: string            // Admin-facing label (e.g. "SARK Technical Screening")
  config: {
    title: string         // Candidate-facing title on start screen
    description: string   // Subtitle on start screen
    duration: string      // Human-readable (e.g. "18 min")
    durationSeconds: number // Timer in seconds (e.g. 1080)
    startsAt: string      // ISO date string. If unparseable → treated as already started.
    rules: string[]       // Bullet rules shown on start screen
    highlights: Array<{ label: string; value: string }> // Key-value stat pills
  }
  questions: QuizQuestionWithAnswer[] // Includes correct answer — NEVER sent to client
  resultInvite: {
    title: string
    description: string
    image: false | string // false = no image; string = URL or base64 data URI
  }
  isActive: boolean       // At most ONE quiz should be active at a time.
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:** `is_active`

---

### Table: `quiz_submissions`

```ts
QuizSubmissionDocument {
  quizId: ObjectId
  quizName: string
  userId: ObjectId
  answers: Record<string, string>  // { questionId: selectedOptionId }
  score: number                    // Percentage 0–100 (rounded)
  correctCount: number
  totalQuestions: number
  answeredCount: number
  unansweredCount: number
  timetaken: number                // Seconds, capped at quiz durationSeconds
  startedAt: Date
  submittedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

**Constraints:**
- `{ user_id, quiz_id }` **unique** — prevents duplicate submissions at DB level

---

## 6. Type Definitions (`lib/quiz/types.ts`)

```ts
QuizOption            { id: string; label: string }

QuizQuestion          { id, category, difficulty: "Core"|"Applied"|"Challenge",
                        prompt, description?, options: QuizOption[] }

QuizQuestionWithAnswer  QuizQuestion & { answer: string }

QuizConfig            { title, description, duration, durationSeconds,
                        totalQuestions?, startsAt, rules[], highlights[] }

ResultInvite          { title, description, image: false | string }

QuizPayload           // What gets sent to the client (answers stripped!):
                      { id, config (with totalQuestions injected),
                        questions (no answer field),
                        resultInvite (image always false client-side),
                        isActive }

QuizSubmission        // Body shape for POST /api/quiz:
                      { answers: Record<string,string>, startedAt?: number, quizId?: string }
```

---

## 7. Auth System

### Two Completely Separate Session Systems

| | Quiz User | Admin |
|---|---|---|
| Cookie name | `sark_quiz_session` | `sark_admin_session` |
| TTL | 6 hours | 8 hours |
| Payload | `{ userId, email, expiresAt }` | `{ username: "sarktech", expiresAt }` |
| Secret suffix | *(base secret)* | *(base secret)* + `:admin` |
| Cookie flags | `httpOnly, sameSite=lax, secure in prod, path=/` | same |

**Token format:** `base64url(JSON payload) + "." + HMAC-SHA256(base64url)`

**Validation:**
- `timingSafeEqual` for signature comparison (no timing attacks)
- `expiresAt` checked on every read
- Admin: `username` must equal `"sarktech"` exactly

### Password Hashing (`lib/auth/password.ts`)

```
Algorithm  : PBKDF2-SHA512
Iterations : 210,000
Key length : 64 bytes
Salt       : 16 random bytes per password
Format     : "pbkdf2:<iterations>:<salt(hex)>:<hash(hex)>"
Verify     : timingSafeEqual on derived keys
```

---

## 8. API Routes — Full Reference

### Quiz User Auth

| Route | Method | Auth | Behaviour |
|---|---|---|---|
| `/api/quiz/auth/signup` | POST | None | Validates fields; hashes password (PBKDF2); inserts user; creates session. 409 if email/USN duplicate. |
| `/api/quiz/auth/login` | POST | None | Finds user by email; verifies PBKDF2 hash; creates session. 401 on invalid creds. |
| `/api/quiz/auth/logout` | POST | None | Clears session cookie. |

**Signup body:** `{ name, usn, email, phone, password }`
- `email` → lowercased; `usn` → uppercased
- Validates email regex, phone regex, `password >= 8 chars`

**Login body:** `{ email, password }`

---

### Quiz Operations

#### `GET /api/quiz`
Auth: quiz session required
- Returns `QuizPayload` (questions without `answer`, `resultInvite.image = false`)
- `404` if no active quiz
- `403` if `startsAt` is in the future
- `409` if user already submitted (returns `score + quizName`)

#### `POST /api/quiz`
Auth: quiz session required
Body: `{ answers: Record<string,string>, startedAt?: number, quizId?: string }`
- Validates active quiz exists and has started
- If `quizId` given and doesn't match active quiz → `409` (quiz changed, reload)
- Checks for existing submission → `409` if found
- Validates answers server-side (strips invalid question/option IDs)
- Calculates `score` (%), `timetaken` (seconds, capped at duration)
- Inserts into `quiz-submissions` (unique index catches race conditions)
- Denormalises `score / timetaken / latestQuizId / latestQuizName` onto user document
- Returns `{ ok, score, timetaken, quizId, quizName }`

---

### Admin Auth

| Route | Method | Behaviour |
|---|---|---|
| `/api/admin/auth/login` | POST | Checks hardcoded `sarktech / nrhs123`; creates admin session. |
| `/api/admin/auth/logout` | POST | Clears admin session cookie. |

---

### Admin Quiz Management

| Route | Method | Auth | Behaviour |
|---|---|---|---|
| `/api/admin/quizzes` | GET | Admin | Returns all quizzes (`_id` as string). |
| `/api/admin/quizzes` | POST | Admin | Creates quiz. Always inserted as `isActive=false`, then `setActiveQuiz()` called if body requests it. Returns `{ ok, quizId }`. |
| `/api/admin/quizzes/[quizId]` | PATCH | Admin | Two modes: (A) `{ isActive: boolean }` — toggle active only; (B) full quiz body — full update. `setActiveQuiz()` deactivates all others when activating. |
| `/api/admin/quizzes/[quizId]` | DELETE | Admin | Deletes quiz document AND all its submissions. `404` if not found. |
| `/api/admin/quizzes/[quizId]/submissions` | DELETE | Admin | Deletes only submissions (quiz kept). Returns `{ ok, deletedCount }`. |

---

## 9. Pages — Routing & Behaviour

### `/` — `app/page.tsx`
Returns `null`. No content. Placeholder for a future landing page.

---

### `/quiz/login` — `app/quiz/login/page.tsx`
SSR. If session exists → `redirect("/quiz")`.
Renders `<QuizAuth />` (login + signup switcher).

---

### `/quiz` — `app/quiz/page.tsx`
SSR. Protected.
```
No session           → redirect /quiz/login
User not found       → redirect /quiz/login
No active quiz       → <QuizAlreadySubmitted message="No quiz is active right now." />
Already submitted    → <QuizAlreadySubmitted score={…} quizName={…} />
Otherwise            → <QuizExperience attemptStorageKey="sark-quiz-attempt:{userId}:{quizId}" />
```

---

### `/quiz/result` — `app/quiz/result/page.tsx`
SSR. Protected.
- Shows `CheckCircle2` confirmation + optional `ResultInvite` card.
- Fetches the user's most recent submission to pull the quiz's `resultInvite`.
- If the invite has a `title`, `description`, or `image`, the card is shown.

---

### `/admin/login` — `app/admin/login/page.tsx`
SSR. If admin session exists → `redirect("/admin")`.
Renders `<AdminLogin />`.

---

### `/admin` — `app/admin/page.tsx`
SSR. Protected. URL params: `?panel=quiz|leaderboard&quizId=<id>`

**`panel=leaderboard`** (default):
- Fetches quiz summaries for the select filter
- Fetches submissions for selected quiz, joins with user documents
- Sorts: **score DESC, timetaken ASC** (lowest time wins ties)
- Shows 3 metrics: submission count, top score %, fastest time
- Renders ranked table with: rank, name, USN, email, phone, quiz, score, time taken
- `ClearLeaderboardButton` only shown when a `quizId` is explicitly in the URL

**`panel=quiz`**:
- Fetches full quiz documents (questions included)
- Renders `<QuizPanel initialQuizzes={…} />`

---

## 10. Components — Detailed Reference

### `components/quiz/QuizAuth.tsx` — CLIENT

State: `mode ("login"|"signup")`, `isSubmitting`, `message`

| Mode | Fields | Endpoint |
|---|---|---|
| Login | email, password | `POST /api/quiz/auth/login` |
| Signup | name, usn, email, phone, password | `POST /api/quiz/auth/signup` |

On success: `router.replace("/quiz")` + `router.refresh()`

**CSS classes:** `.quiz-auth-page`, `.quiz-auth-header`, `.quiz-auth-shell`, `.quiz-auth-hero`, `.quiz-auth-hero__badge`, `.quiz-auth-card`, `.quiz-auth-switch`, `.quiz-auth-fields`, `.quiz-auth-input`, `.quiz-auth-error`, `.quiz-auth-submit`

---

### `components/quiz/QuizExperience.tsx` — CLIENT (~510 lines)

Props: `{ attemptStorageKey: string }`

**State machine stages:**

```
1. Loading  → fetches GET /api/quiz → shows <QuizLoading />
2. Start    → shows title, description, question count, duration, rules
              User clicks "Start quiz" → records startedAt timestamp
3. Active   → questions one at a time with A/B/C/D option buttons
              <QuizTimer /> — fixed top-right, countdown bar, urgent red at ≤60s
              <VerticalProgress /> — fixed right side, diamond markers per question
4. Submit   → POST /api/quiz with { answers, startedAt, quizId }
5. Redirect → router.push("/quiz/result") on success
```

**LocalStorage persistence:**
- Key: `attemptStorageKey` (`"sark-quiz-attempt:{userId}:{quizId}"`)
- Stores: `{ hasStarted, activeIndex, answers, startedAt }`
- Restored on mount after quiz loads (survives page refresh)
- Cleared on successful submit or duplicate-submission detection

**Timer:**
- `setInterval` at 1 second
- Auto-submits when remaining time hits 0
- CSS custom property `--timer-progress` (0–1) drives the bottom progress bar width

**Unattended warning:**
- Clicking "Finish" with unanswered questions shows a warning modal
- User can go back or "Submit anyway"

**Already submitted (409 response):**
- Removes localStorage entry
- Shows `<QuizAlreadySubmittedOverlay />`
- Auto-redirects to `"/"` after 20 seconds

**Sub-components (all in same file):**

| Name | Description |
|---|---|
| `QuizAlreadySubmitted` | Exported. Used by `app/quiz/page.tsx` for SSR-detected duplicate state. |
| `QuizAlreadySubmittedOverlay` | Internal overlay panel (role=alert, live region). |
| `QuizTimer` | Fixed countdown widget. Urgent red when ≤60s. |
| `VerticalProgress` | Side diamond progress indicators. |
| `QuizLoading` | Loading / error message section with animated line. |

---

### `components/admin/AdminLogin.tsx` — CLIENT

Form: `username + password` → `POST /api/admin/auth/login`
On success: `router.replace("/admin")` + `router.refresh()`

**CSS:** `.admin-login-page`, `.admin-login-panel`, `.admin-login-form`

---

### `components/admin/QuizPanel.tsx` — CLIENT (~560 lines)

Props: `{ initialQuizzes: AdminQuiz[] }`

State: `quizzes[]`, `editingId`, `draft` (current form state), `message`, `isSaving`, `activeUpdatingId`, `deletingId`

**Operations:**

| Action | API Call | Notes |
|---|---|---|
| New quiz | — | Resets draft to `emptyQuiz`, sets `editingId=null` |
| Edit quiz | — | Clones selected quiz into draft |
| Save quiz | `POST` or `PATCH /api/admin/quizzes/[id]` | Refreshes list from API after save |
| Toggle active | `PATCH /api/admin/quizzes/[id]` with `{ isActive: !current }` | |
| Delete quiz | `DELETE /api/admin/quizzes/[id]` | `window.confirm` first |

**Form fields:**
- Quiz name, title, duration (minutes → seconds), start date/time (`datetime-local`)
- Description (textarea), rules (textarea, one per line)
- Result invite: title, description, image (file upload → base64 data URI)
- Questions (dynamic list): id, category, difficulty, correct option, prompt, description, 4 option labels (A/B/C/D)
- "Make active after save" checkbox

**Helper functions (in-file):**
- `cloneQuiz()` — deep clone via `JSON.parse(JSON.stringify(…))`
- `serializeDraft()` — converts `datetime-local` → ISO string before sending
- `toDateTimeInputValue()` — ISO → `datetime-local` input (applies local timezone offset)
- `readFileAsDataUrl()` — `FileReader` Promise wrapper
- `Field()` — reusable labelled input component

---

### `components/admin/ClearLeaderboardButton.tsx` — CLIENT

Props: `{ quizId: string; quizName: string }`
- `window.confirm` → `DELETE /api/admin/quizzes/[quizId]/submissions`
- Only rendered when a `quizId` param is in the URL (explicit selection)

> ⚠️ **UI copy bug:** Button label says "Delete all users" but it only deletes submissions.

---

### `components/ui/button.tsx`

shadcn `Button` using `@base-ui/react` `ButtonPrimitive` + CVA variants.
Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

> Not widely used — most buttons are raw `<button>` elements with custom CSS classes.

---

## 11. Lib Layer

### `lib/auth/mongodb.ts`
MongoDB singleton client.
- **Dev mode:** stored on `globalThis._quizMongoClientPromise` to survive HMR
- **Prod mode:** new client per module load
- Connection: `appName="sark-quiz"`, `maxPoolSize=5`, `serverSelectionTimeout=8s`
- Exports: `getMongoClient()`, `getQuizDb()`

---

### `lib/auth/users.ts`
Collection: `"quiz-users-collection"`

| Export | Description |
|---|---|
| `getQuizUsersCollection()` | Returns typed collection |
| `ensureQuizUserIndexes()` | Idempotent (once per process) index creation |
| `findQuizUserByEmail(email)` | Normalised lookup |
| `findQuizUserById(userId)` | ObjectId lookup (validates format first) |
| `normalizeEmail(email)` | `.trim().toLowerCase()` |
| `normalizeUsn(usn)` | `.trim().toUpperCase()` |

---

### `lib/quiz/db.ts` (~370 lines)
Collections: `"quizzes"`, `"quiz-submissions"`

**Auto-seeding:**
- `ensureDefaultQuiz()` called by `listQuizzes()`, `getActiveQuiz()`, `findQuizById()`
- If collection is empty → reads `data/quiz.json` → inserts as first quiz (`isActive: true`)
- Runs once per process via module-level promise

**Key functions:**

| Function | Description |
|---|---|
| `listQuizzes()` | All quizzes sorted by `updatedAt` desc |
| `listQuizSummaries()` | `{ _id, name, isActive }` only (for leaderboard filter) |
| `getActiveQuiz()` | `findOne({ isActive: true })` |
| `findQuizById(id)` | By ObjectId string |
| `setActiveQuiz(id, isActive)` | If activating: `updateMany` others to `isActive: false` first |
| `hasQuizStarted(quiz)` | Parses `startsAt`; if invalid → treated as started |
| `toQuizPayload(quiz)` | Strips `answer` from questions, sets `resultInvite.image = false` |
| `validateQuizDocumentInput(input)` | Full input validation → `{ ok, quiz }` or `{ ok, message }` |
| `validateQuizAnswers(quiz, answers)` | Server-side grading (strips invalid answers, counts correct) |

**Validation rules (`validateQuizDocumentInput`):**
- `name` required
- `config` object required
- `questions` array with ≥1 item
- Each question: `prompt` required, ≥2 options, `answer` must match an option ID
- `durationSeconds`: positive finite number
- `startsAt`: parseable date string
- Generates question IDs from prompt slug if not provided

---

### `lib/quiz/data.ts`
Thin convenience layer over `db.ts`:

| Export | Description |
|---|---|
| `getQuizPayload()` | Active quiz as client-safe `QuizPayload` |
| `getQuizPayloadById(id)` | Any quiz as `QuizPayload` |
| `validateQuizSubmission()` | Delegates to `validateQuizAnswers` |
| `findQuizSubmission(userId, quizId)` | Checks submissions collection |

---

## 12. CSS Design System (`app/globals.css`)

### Fonts

Two custom `.ttf` font files live in `public/fonts/` and are declared via `@font-face` at the very top of `globals.css` (before all `@import` statements):

| Family name | File | Weight | Use |
|---|---|---|---|
| `BatmanForever` | `batmfa__.ttf` | 400 | Primary body/heading font — replaces Inter globally |
| `BatmanForeverOutline` | `batmfo__.ttf` | 400 | Outline variant — available via `.font-outline` utility class |

```css
@font-face {
  font-family: "BatmanForever";
  src: url("/fonts/batmfa__.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "BatmanForeverOutline";
  src: url("/fonts/batmfo__.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### Design Language
- **Dark mode only.** Near-black backgrounds (`#050505` base).
- **Primary accent:** SARK Red (`#e11d2e`)
- **Body text:** `#f4f1f1` (warm off-white)
- **Muted text:** `#a3a3a3`
- **Fonts:** Inter (body) + IBM Plex Mono (metadata labels, numbers)
- **Grid background texture:** subtle white lines at 56px intervals on the quiz page
- **Body:** subtle red radial gradient at top-left corner

### CSS Variable Tokens

```css
--background: #050505
--foreground: #f4f1f1
--primary: #e11d2e
--primary-foreground: #fff7f7
--secondary: #191919
--muted: #171717
--muted-foreground: #a3a3a3
--border: rgba(255,255,255,0.1)
--input: rgba(255,255,255,0.12)
--ring: rgba(225,29,46,0.55)
--radius: 0.625rem

/* Font CSS variables (@theme inline in globals.css) */
--font-sans: "BatmanForever", "Inter", "Segoe UI", Arial, sans-serif
--font-mono: "IBM Plex Mono", "Cascadia Code", Consolas, monospace
--font-heading: "BatmanForever", "Inter", "Segoe UI", Arial, sans-serif
--font-outline: "BatmanForeverOutline", "Inter", "Segoe UI", Arial, sans-serif
```

### Utility Classes
```css
.bg-sark-black   /* background: #050505 */
.text-sark-ink   /* color: #f4f1f1 */
```

### BEM Component Class Reference

#### Quiz Experience

| Class | Purpose |
|---|---|
| `.quiz-app` | Full page wrapper. Grid background + red radial gradient. |
| `.quiz-chrome` | Sticky header bar (backdrop blur). |
| `.quiz-logo` | Logo image sizing (154px wide). |
| `.quiz-start` | Pre-start screen section. |
| `.quiz-start__intro` | Title + description area. |
| `.quiz-start__details` | Question count + duration meta pills. |
| `.quiz-start__meta` | Individual meta pill. |
| `.quiz-rules` | Rule list paragraphs. |
| `.quiz-room` | Active question section. Uses `--question-index` CSS var. |
| `.quiz-question-stack` | Question + options + controls wrapper. |
| `.quiz-question` | Article card for the question. |
| `.quiz-question__number` | Question number badge. |
| `.quiz-question__body` | Prompt + description. |
| `.quiz-options` | Option buttons grid. |
| `.quiz-option` | Single option button. |
| `.quiz-option.is-selected` | Highlighted selected state (red accent). |
| `.quiz-controls` | Back + Next/Finish button row. |
| `.quiz-submit-error` | Error message below controls. |
| `.quiz-warning` | Unanswered warning modal overlay. |
| `.quiz-warning__panel` | Modal content box. |
| `.quiz-warning__actions` | Modal action buttons. |
| `.quiz-timer` | Fixed countdown timer widget (top-right). |
| `.quiz-timer.is-urgent` | Red tint when ≤60s remaining. Uses `--timer-progress` CSS var. |
| `.quiz-vertical-progress` | Fixed side progress rail (right). |
| `.quiz-vertical-progress__line` | Vertical connecting line. |
| `.quiz-diamond` | Diamond-shaped question marker. |
| `.quiz-diamond.is-reached` | Line has reached this question. |
| `.quiz-diamond.is-active` | Current question (scaled up, glowing). |
| `.quiz-diamond.is-answered` | Answered (red fill). |
| `.quiz-loading` | Loading / error state section. |
| `.quiz-attempt-toast` | Already-submitted overlay (role=alert). |
| `.quiz-attempt-toast__panel` | Content panel within overlay. |

#### Quiz Auth

| Class | Purpose |
|---|---|
| `.quiz-auth-page` | Full page wrapper. |
| `.quiz-auth-header` | Logo header. |
| `.quiz-auth-shell` | Two-column layout: hero + form. |
| `.quiz-auth-hero` | Left marketing copy. |
| `.quiz-auth-hero__badge` | "Technical screening" badge pill. |
| `.quiz-auth-card` | Form card (glassmorphism-ish). |
| `.quiz-auth-switch` | Login / Signup toggle tab bar. |
| `.quiz-auth-card__title` | Icon + mode heading. |
| `.quiz-auth-fields` | Field stack. |
| `.quiz-auth-input` | Icon + input wrapper. |
| `.quiz-auth-error` | Error message. |
| `.quiz-auth-submit` | Submit button. |

#### Quiz Result

| Class | Purpose |
|---|---|
| `.quiz-result-page` | Full page wrapper. |
| `.quiz-result` | Content section. |
| `.quiz-result__mark` | CheckCircle icon container. |
| `.quiz-result__copy` | Heading + description. |
| `.quiz-result__invite` | Optional invite card (WhatsApp QR etc.). |

#### Shared Buttons

| Class | Purpose |
|---|---|
| `.quiz-primary-button` | Red filled button (primary CTA). |
| `.quiz-secondary-button` | Outlined / ghost secondary button. |
| `.quiz-spin` | Spinning loader icon class. |

#### Admin Dashboard

| Class | Purpose |
|---|---|
| `.admin-dashboard` | Sidebar + content grid. |
| `.admin-sidebar` | Left navigation panel. |
| `.admin-content` | Main content area. |
| `.admin-content__header` | Page title header row. |
| `.admin-metrics` | 3 stat cards row (count, top score, fastest). |
| `.admin-table-wrap` | Leaderboard table container. |
| `.admin-table-title` | Table heading + filter row. |
| `.admin-leaderboard-filter` | Quiz select + View button form. |
| `.admin-leaderboard` | Ranked submissions table. |
| `.admin-quiz-panel` | Quiz CRUD section. |
| `.admin-section-heading` | Section label + New Quiz button row. |
| `.admin-quiz-grid` | List + editor two-column layout. |
| `.admin-quiz-list` | Sidebar list of existing quizzes. |
| `.admin-quiz-row-actions` | Active toggle + delete per-row. |
| `.admin-active-toggle` | Active/Inactive status toggle button. |
| `.admin-active-toggle.is-active` | Green active state. |
| `.admin-delete-button` | Small icon delete button. |
| `.admin-quiz-editor` | Main form editor area. |
| `.admin-editor-title` | Quiz name + active checkbox row. |
| `.admin-form-grid` | 2-column field grid. |
| `.admin-field` | Label + input field. |
| `.admin-field--wide` | Full-width field (textarea). |
| `.admin-options-grid` | 4-column options grid. |
| `.admin-question-header` | Questions section heading + Add button. |
| `.admin-question-card` | Fieldset for one question. |
| `.admin-editor-actions` | Save button + message row. |
| `.admin-upload-field` | Image upload area. |
| `.admin-file-upload` | File input label (styled as button). |
| `.admin-image-preview` | Preview + remove button. |
| `.admin-inline-toggle` | Checkbox + label inline. |
| `.admin-icon-button` | Icon-only button (e.g. remove question). |
| `.admin-empty-state` | Empty list message. |
| `.admin-danger-action` | Red destructive action button. |

#### Admin Login

| Class | Purpose |
|---|---|
| `.admin-login-page` | Full page wrapper. |
| `.admin-login-panel` | Centred card. |
| `.admin-login-form` | Form within the panel. |

---

## 13. Default Quiz Seed Data (`data/quiz.json`)

```
Name:     "SARK Technical Screening"
Duration: 18 min (1080 seconds)
startsAt: "Open now" → treated as already started by hasQuizStarted()
```

| # | ID | Category | Difficulty | Topic |
|---|---|---|---|---|
| 1 | `runtime` | Web Systems | Core | JavaScript main thread task |
| 2 | `api-contract` | Product Engineering | Applied | API design for frontend safety |
| 3 | `git-flow` | Team Workflow | Core | Separating content from UI code |
| 4 | `security` | Security Basics | Applied | Server-side validation importance |
| 5 | `design` | Interface Design | Challenge | SARK UI design direction |

All correct answers: option `"a"`

**ResultInvite:**
```json
{
  "title": "Join the SARK quiz circle",
  "description": "Scan the WhatsApp QR to join the group for updates, discussions, and next steps.",
  "image": false
}
```

---

## 14. Key Patterns & Conventions

### `"server-only"` imports
All `lib/` files that touch the database or session cookies import `"server-only"` at the top. This prevents accidental client-side bundling and will throw a build error if violated.

### ObjectId Serialisation
MongoDB `ObjectId`s are **never** passed directly to client components. They are always converted to strings with `.toString()` at the page boundary (server component / API route). This is why `admin/page.tsx` has a `serializedQuizzes` mapping step.

### Active Quiz Invariant
At most **one** quiz should be `isActive: true` at any time. `setActiveQuiz(id, true)` runs `updateMany({ _id: { $ne: id }, isActive: true }, { $set: { isActive: false } })` first. This is **not atomic** — a theoretical TOCTOU race exists but is acceptable for this use case.

### Submission Deduplication
The unique compound index `{ userId, quizId }` on the submissions collection is the authoritative guard. The API also checks before inserting, but the DB constraint catches race conditions.

### Timing Safety
`timingSafeEqual` is used for HMAC signature comparison and password verification. No early-exit string comparison anywhere in auth paths.

### LocalStorage Key Format
`"sark-quiz-attempt:{userId}:{quizId}"` — both IDs included so switching quizzes or users never collides.

### Quiz Payload Sanitisation
`toQuizPayload()` always:
1. Strips the `answer` field from questions
2. Sets `resultInvite.image = false`

The real image URL is only used server-side (the `/quiz/result` page fetches it directly from DB).

### Seeding Pattern
`ensureDefaultQuiz()` uses a **module-level promise** so it only runs once per process lifetime. It checks `estimatedDocumentCount()` — if any quizzes exist, skip. This means the seed quiz is only inserted into a completely empty quizzes collection.

### Admin CRUD Sync Pattern
After any mutation (save / toggle / delete), the `QuizPanel` always fetches the full quiz list from the server (`GET /api/admin/quizzes`) and syncs the local state. The UI always reflects server state after mutations.

---

## 15. Known Issues & TODOs

| Issue | Details |
|---|---|
| **Hardcoded admin credentials** | `sarktech / nrhs123` in `app/api/admin/auth/login/route.ts` lines 5–6. Move to env vars before any public deployment. |
| **AUTH_SECRET fallback includes MONGODB_URI** | Rotating the DB connection string also invalidates all active sessions. |
| **No landing page** | `app/page.tsx` returns `null`. No redirect exists at `"/"`. |
| **UI copy bug** | `ClearLeaderboardButton` label says "Delete all users" but only deletes submissions. |
| **Base64 image storage** | `resultInvite.image` is stored as a base64 data URI in MongoDB when uploaded. Bloats documents for large images. No CDN/upload service integrated. |
| **No rate limiting** | Auth endpoints (`/api/quiz/auth/*`, `/api/admin/auth/*`) have no rate limiting or brute-force protection. |
| **No middleware.ts** | Route protection is handled per-page/per-route by calling `getAdminSession()` / `getQuizSession()` manually. No centralized middleware. |
| **framer-motion unused** | Installed as a dependency but not yet used anywhere in the codebase. |
| **`temp/` directory** | Exists in project root but is empty (scratch space). |
| **`setActiveQuiz` not atomic** | Deactivating others + activating the target is two separate DB operations. |
