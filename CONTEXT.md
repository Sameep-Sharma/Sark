# SARK — Full Codebase Context

> Read this before touching any code. This document captures the complete architecture, data models, API surface, component behaviour, and design decisions as of July 2026.

---

## 1. Project Overview

**SARK** is the tech club of a college (NRHS / Himalay-NRHS). This web platform serves as the club's public website and its quiz/technical screening tool.

### Purpose
- **Public-facing website** with a visually rich landing page, team roster, and timeline.
- Run **timed, multiple-choice technical quizzes** for candidate screening.
- Let **admins** create, manage, and activate quizzes through a control panel.
- Collect submissions, **grade them server-side**, and show a ranked leaderboard.
- Show candidates a **result/confirmation page** with an optional invite (e.g. WhatsApp QR) after submission.

### Current State
- **Landing page** (`/`) — full hero section with WebGL animated background (PixelBlast), text shuffle animation, and flagship events section.
- **Team page** (`/team`) — developer profile cards organised by year.
- **Timeline page** (`/timeline`) — scroll-animated timeline component.
- Quiz flow fully functional: `signup → quiz → submission → result`.
- Admin panel: create / edit / delete / activate quizzes + view leaderboard.
- Deployed on **Next.js 16** with **Supabase (PostgreSQL)** and **Vercel**.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router, RSC-first) |
| Language | TypeScript 6 (strict mode) |
| Runtime | Node.js (server-only modules used throughout) |
| Database | Supabase (PostgreSQL) via `@supabase/supabase-js` |
| Styling | Tailwind CSS v4 + `tw-animate-css` + shadcn (base-nova style) |
| UI Primitives | `@base-ui/react` (headless components) |
| Icons | `lucide-react` |
| 3D / WebGL | `three` + `@react-three/fiber` + `@react-three/drei` + `postprocessing` |
| Animations (GSAP) | `gsap` + `@gsap/react` (ScrollTrigger, SplitText) |
| Animations (Framer) | `framer-motion` / `motion` |
| Font | **BatmanForever** (regular `batmfa__.ttf`) + **BatmanForeverOutline** (`batmfo__.ttf`) — `public/fonts/`. Also aliased as `SarkTitle`. |
| Component lib | shadcn v4 — `Button` and `Avatar` scaffolded |
| Path alias | `@/*` → project root |

> **Note:** The project uses both GSAP and Framer Motion for animations. GSAP powers the Shuffle text effect and PillNav; Framer Motion is used in profile cards, navbar, and wobble cards.

---

## 3. Environment Variables

**Setup:** Create `.env.local` in the project root (gitignored, never committed).
A committed template lives at `.env.example`.

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
│   ├── globals.css              Global design system + all BEM component styles (~2100 lines)
│   ├── layout.tsx               Root layout: PixelBlast background, logo header, Navigation
│   ├── page.tsx                 "/" — Landing page: hero + flagship events
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
│   ├── team/
│   │   └── page.tsx             Team page — profile cards grouped by year (client component)
│   │
│   ├── timeline/
│   │   └── page.tsx             Timeline page — scroll-animated timeline (SSR)
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
│   ├── PixelBlast.tsx             WebGL pixel grid background (Three.js + postprocessing, ~790 lines)
│   ├── PixelBlast.css             PixelBlast canvas styles
│   ├── Shuffle.css                Shuffle text animation styles (standalone, not in ui/)
│   ├── navigation.tsx             Navigation wrapper — renders NavBar with route items
│   ├── flagship-events.tsx        Flagship Events section (3 WobbleCards with images)
│   ├── timeline-demo.tsx          Timeline demo component (unused, reference implementation)
│   ├── wobble-card-demo.tsx       WobbleCard demo (unused, reference implementation)
│   │
│   ├── admin/
│   │   ├── AdminLogin.tsx         Admin login form (client component)
│   │   ├── ClearLeaderboardButton.tsx  Delete all submissions for a quiz (client)
│   │   └── QuizPanel.tsx          Full quiz CRUD editor panel (client, ~560 lines)
│   │
│   ├── quiz/
│   │   ├── QuizAuth.tsx           Login / signup switcher form (client)
│   │   └── QuizExperience.tsx     Complete quiz-taking UI (client, ~510 lines)
│   │
│   └── ui/
│       ├── Shuffle.tsx            GSAP-powered text shuffle animation (~420 lines)
│       ├── Shuffle.css            Shuffle component styles
│       ├── avatar.tsx             shadcn Avatar (Radix primitives)
│       ├── button.tsx             shadcn Button using @base-ui/react, CVA variants
│       ├── freelancer-profile-card.tsx  Animated team member card (Framer Motion)
│       ├── moving-border.tsx      Moving border animation component
│       ├── pill-nav.tsx           GSAP-powered pill-style navigation bar (~370 lines)
│       ├── timeline.tsx           Scroll-animated timeline (Framer Motion + useScroll)
│       ├── tubelight-navbar.tsx   Active navigation bar with tubelight glow effect (Framer Motion)
│       ├── tubelight-navbar-demo.tsx  NavBar demo component
│       └── wobble-card.tsx        Interactive wobble/tilt card effect
│
├── lib/
│   ├── utils.ts                   cn() helper (clsx + tailwind-merge)
│   ├── auth/
│   │   ├── session.ts             Quiz user session: HMAC-SHA256 cookie tokens, 6h TTL
│   │   ├── admin-session.ts       Admin session: HMAC-SHA256 cookie tokens, 8h TTL
│   │   ├── users.ts               QuizUser collection helpers
│   │   ├── password.ts            PBKDF2-SHA512 hashing + verification
│   │   └── mongodb.ts             Legacy file (unused, 1 line)
│   ├── db/
│   │   └── supabase.ts            Supabase admin client (server-only)
│   └── quiz/
│       ├── types.ts               Shared TypeScript types for quiz domain
│       ├── db.ts                  All quiz DB operations + validation logic (~370 lines)
│       └── data.ts                Thin layer: getQuizPayload, findQuizSubmission, etc.
│
├── data/
│   └── quiz.json                  Default seed quiz. Auto-seeded if DB is empty on first access.
│
├── temp/
│   ├── timeline-data.tsx          Timeline data used by /timeline page
│   └── image.png                  Scratch image file
│
├── supabase/
│   └── schema.sql                 PostgreSQL schema (3 tables + indexes + RLS)
│
└── public/
    ├── fonts/
    │   ├── batmfa__.ttf         BatmanForever regular
    │   └── batmfo__.ttf         BatmanForever outline
    ├── SARK-LOGO.png              Club logo
    ├── Gemini_Generated_Image_amlky9amlky9amlk.png  Generated hero image
    └── image-10.png               Additional image asset
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
  quizId: string
  quizName: string
  userId: string
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
- Inserts into `quiz_submissions` (unique index catches race conditions)
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
| `/api/admin/quizzes` | GET | Admin | Returns all quizzes. |
| `/api/admin/quizzes` | POST | Admin | Creates quiz. Always inserted as `isActive=false`, then `setActiveQuiz()` called if body requests it. Returns `{ ok, quizId }`. |
| `/api/admin/quizzes/[quizId]` | PATCH | Admin | Two modes: (A) `{ isActive: boolean }` — toggle active only; (B) full quiz body — full update. `setActiveQuiz()` deactivates all others when activating. |
| `/api/admin/quizzes/[quizId]` | DELETE | Admin | Deletes quiz document AND all its submissions. `404` if not found. |
| `/api/admin/quizzes/[quizId]/submissions` | DELETE | Admin | Deletes only submissions (quiz kept). Returns `{ ok, deletedCount }`. |

---

## 9. Pages — Routing & Behaviour

### `/` — Landing Page (`app/page.tsx`)
Renders the public-facing homepage with:
- **Hero section:** Full-screen layout with a two-column grid: left column has "Welcome" badge, animated heading with Shuffle text effect ("Innovation" shuffles on scroll/hover), and a "Member's Login" CTA linking to `/login`. Right column shows a floating image.
- **Flagship Events:** Three WobbleCard components showcasing "Annual Hackathon", "Tech Symposium", and "Design Workshop" with Unsplash images.
- **Background:** PixelBlast WebGL canvas (rendered in layout) with SARK text overlay and dimming overlay.

---

### `/team` — Team Page (`app/team/page.tsx`)
Client component. Renders team members grouped by year (4th → 1st) using `FreelancerProfileCard` components. Each card displays:
- Avatar, name, title, banner image
- Experience duration, project count
- Tool icons (from lucide-react)
- Animated entrance with Framer Motion

---

### `/timeline` — Timeline Page (`app/timeline/page.tsx`)
SSR. Renders a `Timeline` component using data from `temp/timeline-data.tsx`. The timeline uses Framer Motion's `useScroll` for scroll-driven animations with year markers.

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

### Root Layout (`app/layout.tsx`)

Renders the global shell:
1. **PixelBlast** — fullscreen fixed WebGL background (`variant="square"`, red color, SARK text overlay)
2. **Dimming overlay** — `rgba(0, 0, 0, 0.6)` over the canvas for legibility
3. **Header** — SARK logo image (160px)
4. **Navigation** — Tubelight navbar (Home, About, Team, Alumni, Achievements, Timeline)
5. **`{children}`** — page content

---

### `components/PixelBlast.tsx` — CLIENT (~790 lines)

Full WebGL pixel grid effect built with raw Three.js (not React Three Fiber). Features:
- **Custom GLSL fragment shader** with configurable pixel patterns (square, circle, triangle, diamond)
- **Touch/mouse interaction** — ripple trail texture that follows cursor
- **Text overlay** — renders text via Canvas2D as a texture, supports `cutout`, `fill`, `outline` mask modes
- **Ripple effects** — configurable speed, thickness, and intensity
- **Edge fade** and **noise** for organic look
- **Auto-pauses** when offscreen via IntersectionObserver
- Uses `postprocessing` EffectComposer for post-processing pipeline

Key props: `variant`, `pixelSize`, `color`, `enableRipples`, `speed`, `textOverlay`, `transparent`, `edgeFade`

---

### `components/ui/Shuffle.tsx` — CLIENT (~420 lines)

GSAP-powered character shuffle/slot-machine text animation. Uses `// @ts-nocheck` for internal GSAP DOM manipulation while exporting a typed `ShuffleProps` interface.

**Features:**
- Splits text into individual characters using GSAP `SplitText`
- Animates characters with configurable direction (`left`, `right`, `up`, `down`)
- Supports `evenodd` and `random` animation modes
- Scroll-triggered with configurable threshold/rootMargin
- Hover re-trigger support
- Color transitions (`colorFrom` → `colorTo`)
- Scramble characters via `scrambleCharset`
- Respects `prefers-reduced-motion`
- Loop mode with configurable delay

Key props: `text`, `shuffleDirection`, `duration`, `animationMode`, `shuffleTimes`, `stagger`, `triggerOnHover`, `triggerOnce`

---

### `components/ui/tubelight-navbar.tsx` — CLIENT

Framer Motion animated navigation bar with:
- Active tab indicator with glowing tubelight effect
- Path-aware active state detection
- Responsive: full labels on desktop, icons-only on mobile
- Fixed position at bottom of viewport

Used by `components/navigation.tsx` which provides the nav items:
```
Home (/), About (/about), Team (/team), Alumni (/alumni), Achievements (/achievements), Timeline (/timeline)
```

---

### `components/ui/freelancer-profile-card.tsx` — CLIENT

Framer Motion animated team member card with:
- Banner image, avatar with fallback initials
- Rating stars, duration, rate stats with dividers
- Tool icons row
- "Get in touch" and bookmark action buttons
- Entrance animation (`opacity: 0, y: 20` → visible)
- Hover scale effect
- Staggered children animation

> Note: Interface extends `Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart">` to avoid conflicts with Framer Motion's event types.

---

### `components/ui/wobble-card.tsx` — CLIENT

Interactive card with mouse-tracking tilt/wobble effect:
- Tracks mouse position relative to card
- Applies `rotateX/rotateY` transforms based on cursor offset
- Spring-based return to neutral on mouse leave
- Noise texture overlay for visual depth

---

### `components/ui/timeline.tsx` — CLIENT

Scroll-animated vertical timeline using Framer Motion:
- `useScroll` tracks scroll progress through a container ref
- Animated height indicator line that grows with scroll
- Content sections with title markers and arbitrary React children

---

### `components/ui/pill-nav.tsx` — CLIENT (~370 lines)

GSAP-powered navigation bar with pill-shaped active indicator:
- Measures link positions and sizes to animate a background pill
- Hover preview pill animation
- Responsive with mobile hamburger menu support
- Optional logo image
- Configurable colors (`baseColor`, `pillColor`, `pillTextColor`)

> Currently not used in production — tubelight-navbar is the active nav implementation.

---

### `components/ui/moving-border.tsx` — CLIENT

Animated border effect component using Framer Motion:
- SVG-based moving gradient that animates around an element's border
- Configurable duration, colors, and border radius
- Can wrap any children content

---

### `components/flagship-events.tsx` — SERVER

Three WobbleCards in a responsive grid:
1. **Annual Hackathon** (2-col span) — innovation theme
2. **Tech Symposium** (1-col) — keynote/workshop theme
3. **Design Workshop** (3-col span) — UI/UX theme

Each card has heading, description, and a blended Unsplash image.

---

### `components/quiz/QuizAuth.tsx` — CLIENT

State: `mode ("login"|"signup")`, `isSubmitting`, `message`

| Mode | Fields | Endpoint |
|---|---|---|
| Login | email, password | `POST /api/quiz/auth/login` |
| Signup | name, usn, email, phone, password | `POST /api/quiz/auth/signup` |

On success: `router.replace("/quiz")` + `router.refresh()`

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

---

### `components/admin/QuizPanel.tsx` — CLIENT (~560 lines)

Props: `{ initialQuizzes: AdminQuiz[] }`

State: `quizzes[]`, `editingId`, `draft`, `message`, `isSaving`, `activeUpdatingId`, `deletingId`

**Operations:**

| Action | API Call | Notes |
|---|---|---|
| New quiz | — | Resets draft to `emptyQuiz`, sets `editingId=null` |
| Edit quiz | — | Clones selected quiz into draft |
| Save quiz | `POST` or `PATCH /api/admin/quizzes/[id]` | Refreshes list from API after save |
| Toggle active | `PATCH /api/admin/quizzes/[id]` with `{ isActive: !current }` | |
| Delete quiz | `DELETE /api/admin/quizzes/[id]` | `window.confirm` first |

---

### `components/admin/ClearLeaderboardButton.tsx` — CLIENT

Props: `{ quizId: string; quizName: string }`
- `window.confirm` → `DELETE /api/admin/quizzes/[quizId]/submissions`

> ⚠️ **UI copy bug:** Button label says "Delete all users" but it only deletes submissions.

---

### `components/ui/button.tsx`

shadcn `Button` using `@base-ui/react` `ButtonPrimitive` + CVA variants.
Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

---

## 11. Lib Layer

### `lib/db/supabase.ts`
Supabase Admin Client.
- Uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Session persistence is disabled (stateless server environment).
- Exports: `getSupabaseAdmin()`

---

### `lib/auth/users.ts`
Table: `"quiz_users"`

| Export | Description |
|---|---|
| `ensureQuizUserIndexes()` | No-op (indexes defined in SQL schema) |
| `findQuizUserByEmail(email)` | Normalised lookup |
| `findQuizUserById(userId)` | ID string lookup |
| `findQuizUsersByIds(userIds)`| Batch user lookup |
| `createQuizUser(input)` | Inserts new user |
| `updateQuizUserScore(...)` | Denormalises score/time on user |
| `normalizeEmail(email)` | `.trim().toLowerCase()` |
| `normalizeUsn(usn)` | `.trim().toUpperCase()` |

---

### `lib/quiz/db.ts` (~370 lines)
Tables: `"quizzes"`, `"quiz_submissions"`

**Auto-seeding:**
- `ensureDefaultQuiz()` called by `listQuizzes()`, `getActiveQuiz()`, `findQuizById()`
- If table is empty (`count === 0`) → reads `data/quiz.json` → inserts as first quiz (`isActive: true`)
- Runs once per process via module-level promise

**Key functions:**

| Function | Description |
|---|---|
| `listQuizzes()` | All quizzes sorted by `updatedAt` desc |
| `listQuizSummaries()` | `{ id, name, isActive }` only (for leaderboard filter) |
| `getActiveQuiz()` | `eq("is_active", true)` |
| `findQuizById(id)` | By UUID string |
| `setActiveQuiz(id, isActive)` | If activating: updates others to `is_active: false` first |
| `hasQuizStarted(quiz)` | Parses `startsAt`; if invalid → treated as started |
| `toQuizPayload(quiz)` | Strips `answer` from questions, sets `resultInvite.image = false` |
| `validateQuizDocumentInput(input)` | Full input validation → `{ ok, quiz }` or `{ ok, message }` |
| `validateQuizAnswers(quiz, answers)` | Server-side grading (strips invalid answers, counts correct) |

---

### `lib/quiz/data.ts`
Thin convenience layer over `db.ts`:

| Export | Description |
|---|---|
| `getQuizPayload()` | Active quiz as client-safe `QuizPayload` |
| `getQuizPayloadById(id)` | Any quiz as `QuizPayload` |
| `validateQuizSubmission()` | Delegates to `validateQuizAnswers` |
| `findQuizSubmission(userId, quizId)` | Checks submissions table |

---

## 12. CSS Design System (`app/globals.css`)

### Fonts

Three custom `@font-face` declarations at the top of `globals.css`:

| Family name | File | Use |
|---|---|---|
| `BatmanForever` | `batmfa__.ttf` | Primary body/heading font |
| `SarkTitle` | `batmfa__.ttf` | Alias used by PixelBlast text overlay |
| `BatmanForeverOutline` | `batmfo__.ttf` | Outline variant for decorative text |

### Design Language
- **Dark mode only.** Near-black backgrounds (`#050505` base).
- **Primary accent:** SARK Red (`#f84242` in Tailwind classes, `#e11d2e` in CSS variables)
- **Body text:** `#f4f1f1` (warm off-white)
- **Muted text:** `#a3a3a3`
- **Glassmorphism:** backdrop blur on nav and overlays
- **Grid background texture:** subtle white lines at 56px intervals on quiz page
- **Glow effects:** red blur orbs behind headings and cards

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

/* Font CSS variables (@theme inline) */
--font-sans: "BatmanForever", "Inter", "Segoe UI", Arial, sans-serif
--font-mono: "IBM Plex Mono", "Cascadia Code", Consolas, monospace
--font-heading: "BatmanForever", "Inter", "Segoe UI", Arial, sans-serif
--font-outline: "BatmanForeverOutline", "Inter", "Segoe UI", Arial, sans-serif
```

### Next.js Config (`next.config.ts`)

Allows remote images from:
- `images.unsplash.com`
- `assets.aceternity.com`

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

---

## 14. Key Patterns & Conventions

### `"server-only"` imports
All `lib/` files that touch the database or session cookies import `"server-only"` at the top. This prevents accidental client-side bundling.

### Server-Only DB Access
Database access is restricted to the server via service role key in `getSupabaseAdmin()`. Client components never talk to Supabase directly — always through API routes.

### `// @ts-nocheck` Pattern
Files with heavy untyped DOM manipulation (e.g. `Shuffle.tsx` with GSAP's `SplitText`) use `// @ts-nocheck` as the **first line** (before `"use client"`) to suppress internal type errors, while still exporting a properly typed interface for call sites.

### Active Quiz Invariant
At most **one** quiz should be `is_active: true` at any time. `setActiveQuiz(id, true)` runs a two-step update (deactivating others, then activating the target). This is **not atomic** — a theoretical TOCTOU race exists but is acceptable for this use case.

### Submission Deduplication
The unique compound index on the submissions table is the authoritative guard. The API also checks before inserting, but the DB constraint catches race conditions.

### Timing Safety
`timingSafeEqual` is used for HMAC signature comparison and password verification. No early-exit string comparison anywhere in auth paths.

### LocalStorage Key Format
`"sark-quiz-attempt:{userId}:{quizId}"` — both IDs included so switching quizzes or users never collides.

### Quiz Payload Sanitisation
`toQuizPayload()` always:
1. Strips the `answer` field from questions
2. Sets `resultInvite.image = false`

### Seeding Pattern
`ensureDefaultQuiz()` uses a **module-level promise** so it only runs once per process lifetime. Checks `count` from `quizzes` — if any quizzes exist, skip.

### Admin CRUD Sync Pattern
After any mutation (save / toggle / delete), the `QuizPanel` always fetches the full quiz list from the server and syncs local state.

### Framer Motion Type Compatibility
When extending `React.HTMLAttributes<HTMLDivElement>` for components that spread `...props` onto `motion.div`, use `Omit<>` to remove conflicting event handlers (`onDrag`, `onDragStart`, `onDragEnd`, `onAnimationStart`). Use `as const` on easing string literals to satisfy Framer Motion's `Easing` type.

---

## 15. Known Issues & TODOs

| Issue | Details |
|---|---|
| **Hardcoded admin credentials** | `sarktech / nrhs123` in `app/api/admin/auth/login/route.ts`. Move to env vars before any public deployment. |
| **AUTH_SECRET fallback includes NEXT_PUBLIC_SUPABASE_URL** | Rotating the Supabase URL also invalidates all active sessions. |
| **UI copy bug** | `ClearLeaderboardButton` label says "Delete all users" but only deletes submissions. |
| **Base64 image storage** | `resultInvite.image` is stored as a base64 data URI in PostgreSQL when uploaded. Bloats documents for large images. |
| **No rate limiting** | Auth endpoints have no rate limiting or brute-force protection. |
| **No middleware.ts** | Route protection is handled per-page/per-route manually. No centralized middleware. |
| **`setActiveQuiz` not atomic** | Deactivating others + activating the target is two separate DB operations. |
| **`temp/` directory** | Contains timeline data — should be moved to `data/` for consistency. |
| **`lib/auth/mongodb.ts`** | Legacy 1-line file (unused). Safe to delete. |
| **eslint peer dependency warnings** | `eslint@10` conflicts with `eslint-plugin-import`/`eslint-plugin-jsx-a11y`/`eslint-plugin-react` which only support up to eslint 9. Builds succeed but npm warns. |
| **Missing pages** | `/about`, `/alumni`, `/achievements` routes are in the navbar but have no corresponding `app/` directories — will 404. |
| **Hero image path has spaces** | `page.tsx` line 44 references `"/  Gemini_Generated_Image_b3t71fb3t71fb3t.png"` with leading spaces — may fail to load. |
| **Demo components unused** | `wobble-card-demo.tsx` and `timeline-demo.tsx` are reference implementations not rendered anywhere. |
