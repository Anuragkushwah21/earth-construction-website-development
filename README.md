# Earth Construction Company — Website & Admin CMS

A full-stack marketing website with a database-backed admin dashboard, built with
Next.js (App Router), TypeScript, Tailwind CSS, shadcn-style UI and MongoDB.

The owner signs in at `/admin` and publishes work like blog posts: each project
gets its own page, gallery, location, client and completion year, and appears on
the public site the moment it is published.

---

## 1. Requirements

- Node.js 20+
- pnpm
- MongoDB (local install or a free MongoDB Atlas cluster)

## 2. Setup

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Required | What it does |
| --- | --- | --- |
| `MONGODB_URI` | yes | Connection string, e.g. `mongodb://127.0.0.1:27017/earth-construction` |
| `SESSION_SECRET` | yes | Signs the admin session cookie. 32+ random characters |
| `ADMIN_EMAIL` | yes | Email for the first admin account |
| `ADMIN_PASSWORD` | yes | Password for the first admin account |
| `ADMIN_NAME` | no | Display name in the dashboard |
| `NEXT_PUBLIC_SITE_URL` | no | Public URL, used for canonical links, sitemap and Open Graph |
| `CLOUDINARY_*` | no | Set all three to store uploads on Cloudinary instead of local disk |

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Then:

```bash
pnpm dev     # http://localhost:3000
```

## 3. First sign-in

1. Open `http://localhost:3000/admin` — you are redirected to the login page.
2. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
   The admin record is created on that first sign-in, storing only a bcrypt
   hash. No plain-text password exists in the code or the database.
3. On the dashboard, click **Load starter content** to import the projects,
   services and leadership profiles documented in the company profile.

To change the password later: update `ADMIN_PASSWORD` in `.env.local`, delete
the document from the `admins` collection, and sign in again.

## 4. What the admin can manage

| Section | Capability |
| --- | --- |
| Work / Projects | Create, edit, delete, publish/unpublish, feature, cover + gallery images |
| Services | Edit the eight service pages: copy, benefits, image, icon, order |
| Machines | Add equipment with your own specifications; publish when ready |
| Staff | Add team members, reorder, activate/deactivate, control contact privacy |
| Inquiries | Inbox with read/unread, status workflow, reply-by-email and call links |
| About / Company | Name, address, phones, email, vision, mission, leadership, logo, map |
| Media | Upload an image and copy its link |
| Settings | Account info, environment status, starter content |

Nothing is visible to visitors until it is explicitly published.

## 5. Content rules built into the app

- Years of experience is calculated from 2014 at render time — never hardcoded.
- No project counts, certifications, awards or client claims are invented.
- Machine pages show only the specifications the admin entered. Seeded sample
  machines are created **unpublished** and labelled `DEMO`, because the company
  profile does not document which equipment is owned — edit them with real
  details or delete them.
- Team photos are only ever images the admin uploads. Without one, a neutral
  monogram is shown rather than a stock portrait.
- Fields left blank are omitted from the public page rather than filled in.

## 6. Security

- Admin routes are gated by `middleware.ts` and re-checked in every API handler.
- Passwords hashed with bcrypt (12 rounds); sessions are signed JWTs in an
  `HttpOnly`, `SameSite=Lax`, `Secure`-in-production cookie.
- Every payload is validated server-side with Zod, then sanitised.
- Same-origin check on all mutating requests, on top of the `SameSite` cookie.
- Rate limiting: 8 login attempts per IP / 10 min, 5 inquiries per IP / hour.
- Contact form has a honeypot field; bot submissions are silently discarded.
- Uploads are restricted by MIME type, size (5 MB) and magic-number inspection;
  SVGs containing scripts are rejected.
- `MONGODB_URI` and all secrets stay server-side; `/admin` and `/api` are
  disallowed in `robots.txt`.

## 7. Image storage

`lib/upload.ts` exposes a single `uploadImage()` function.

- **No Cloudinary variables set** → images are written to `public/uploads`.
  Fine for local development and a traditional server; **not** suitable for
  serverless hosting such as Vercel, where the filesystem is not persistent.
- **Cloudinary variables set** → images go to Cloudinary and are served from
  their CDN.

To use a different provider, change `uploadImage()` — nothing else needs to.

## 8. Project layout

```
app/
  (public)/        Public site: home, about, services, work, machines, team, contact, legal
  admin/
    login/         Sign-in page (outside the dashboard layout)
    (dashboard)/   Authenticated dashboard and all management screens
  api/
    auth/          login, logout, session
    admin/         Authenticated CRUD for works, machines, staff, services, inquiries, company, upload, stats, seed
    inquiries/     Public inquiry submission
    works/, machines/   Public read-only listings
components/
  site/            Public site components
  admin/           Dashboard components
  ui/              Shared primitives
lib/
  models/          Mongoose schemas
  auth.ts          Password hashing, sessions
  data.ts          Read helpers for public pages
  upload.ts        Image storage abstraction
  validation.ts    Zod schemas
  security.ts      Slugs, sanitising, rate limiting, CSRF
middleware.ts      Gate for /admin/*
```

## 9. Deploying

1. Provision MongoDB (Atlas is fine) and set `MONGODB_URI`.
2. Set `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and
   `NEXT_PUBLIC_SITE_URL` in the host's environment.
3. Set the Cloudinary variables if deploying to serverless hosting.
4. `pnpm build && pnpm start`.
