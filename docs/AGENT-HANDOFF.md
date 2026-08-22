# ModFirst Website — Agent Handoff

**Date:** 2026-08-16  
**Workspace:** `c:\Users\Noman Traders\Desktop\modfirst`  
**Focus app:** `website/` (Next.js 16, React 19, TanStack Query, Tailwind 4)  
**Also present:** `portal/` (admin), Postman collection at repo root  

Copy this whole doc into a new chat so the next agent can continue without breaking existing work.

---

## Goal so far

Wire the **public website** homepage (+ footer/blogs) to the real ModFirst backend (`command.modfirst.com`) using **home-sections** / **footer-sections** / **blogs** / **newsletters** APIs from the Postman collection.

---

## Critical env rules (do not break)

1. Use **`website/.env.local`** (overrides `.env`):
   - `NEXT_PUBLIC_API_BASE_URL=https://command.modfirst.com/api/v1/`
   - `NEXT_PUBLIC_X_API_KEY=...`
   - `NEXT_PUBLIC_X_API_PASSWORD=...`
2. **Never** point base URL at `https://api.modfirstapparel.com` — that host does not resolve and causes `/api/*` 500 `fetch failed`.
3. After env or `next.config.ts` changes, **restart** `npm run dev`.
4. Browser calls **Next.js API proxies** under `/api/...`, not the upstream host directly (keeps API keys server-side).

Upstream headers (server only): `x-api-key`, `x-api-password` via `website/lib/upstream.ts`.

---

## Architecture pattern (reuse this)

```
Component (client)
  → hook (react-query)
    → service (axios baseURL "/api")
      → Next route handler app/api/...
        → fetch(`${API_BASE}/...`, { headers: API_HEADERS })
```

Shared pieces:
- `website/lib/upstream.ts` — `API_BASE`, `API_HEADERS`
- `website/lib/axios.ts` — browser client `baseURL: "/api"`
- `website/hooks/use-home-section.ts` — `GET /api/home-sections/:key`
- `website/app/api/home-sections/[key]/route.ts` → `GET {API_BASE}/home-sections/frontend/{key}`

Mappers live in `website/lib/map-home-*.ts`.

Request body examples for CMS create/update: `website/docs/home-*-request-body.json`.

---

## Done — wired to API

| UI | Section key / endpoint | Component | Mapper / notes |
|---|---|---|---|
| Hero | `home_hero` | `components/home/hero.tsx` | `lib/map-home-hero.ts` — single collage item OR role-based composition |
| Promo banners | `home_promo_banners` | `promotional-banners.tsx` | `map-home-promo-banners.ts` — `left_card` / `right_card` + `bottom_banner` |
| Order process | `home_order_process` | `our-order-process.tsx` | `map-home-order-process.ts` |
| Video | `home_video` | `video-section.tsx` | `map-home-video.ts` — video in `items[0].extra_data.video_url` |
| Why Modfirst | `home_why_modfirst` | `why-modfirst.tsx` | `map-home-why-modfirst.ts` |
| Fast production | `home_fast_production` | `fast-production.tsx` | reuses why mapper via `map-home-fast-production.ts` |
| Customer feedback | `home_customer_feedback` | `customer-feedback.tsx` | `map-home-customer-feedback.ts` |
| Newsletter | `home_newsletter` | `newsletter-section.tsx` | `map-home-newsletter.ts` + subscribe POST |
| Blog heading + cards | `home_blog` + blogs API | `blog-section.tsx` | heading from home section; cards `useBlogs({ limit: 3 })` |
| Footer | `footer-sections/frontend` | `layout/footer.tsx` | keys: `main_footer`, `shop`, `policies`, `support` |
| Blogs listing/detail | `POST/GET blogs/frontend` | `app/blogs/*`, `components/blogs/*` | already working earlier |

### Local API proxies

| Local route | Upstream |
|---|---|
| `GET /api/home-sections/[key]` | `GET /home-sections/frontend/{key}` |
| `GET /api/footer-sections` | `GET /footer-sections/frontend` |
| `POST /api/blogs` | `POST /blogs/frontend` |
| `GET /api/blogs/[slug]` | `GET /blogs/frontend/{slug}` |
| `POST /api/newsletters/subscribe` | `POST /newsletters/subscribe` body `{ email, source: "footer" }` |

### `next.config.ts` image hosts

Allow:
- `command.modfirst.com`
- `command.modfirst.com`

---

## NOT done / still hardcoded

In `home-wrapper.tsx`:
1. **ProductCarousel “Our Products”** — mock `products` array
2. **ProductCarousel “DTF Supplies Products”** — mock `supply_products` array

Footer:
3. **Social icons** (FB/IG/LinkedIn/X) still hardcoded `#`
4. Copyright year static text (fine)

Other site areas (cart, products pages, header menus, contact forms, etc.) may still be mock — check before assuming wired.

Portal (`portal/`) was only build-verified earlier; not the focus of this session’s API wiring.

---

## Homepage section order

```
Hero → PromoBanners → Our Products (MOCK) → OrderProcess → DTF Supplies (MOCK)
→ Video → WhyModfirst → FastProduction → CustomerFeedback → Blog → Newsletter
```

---

## Conventions that caused bugs before

1. **API validation:** do not send `null` for `button_url` / `button_text` — use `""`.
2. **`.env.local` wins** over `.env` — wrong host there = silent 500s.
3. Prefer **section-level** `title`/`description` when both section and item have copy (live payloads do this).
4. Roles in `extra_data.role` drive layout (`left_card`, `image_wide`, `step`, `video`, `review`, etc.).
5. React 19: don’t use deprecated `FormEvent` type — use `FormEventHandler` (fixed in newsletter).
6. Keep **layout/UI** same; only swap hardcoded strings/images for API fields.

---

## How to continue safely

1. `cd website && npm run dev` (port 3000).
2. Verify proxies:
   - `GET http://localhost:3000/api/home-sections/home_hero`
   - `GET http://localhost:3000/api/footer-sections`
3. For next features (products carousels): find product list endpoints in `ModFirst APIS.postman_collection_07-07-2026.json`, add `app/api/...` proxy, service, hook, then replace mock arrays in `home-wrapper.tsx`.
4. Do **not** rewrite already-wired sections unless fixing a bug.
5. Prefer extending `HomeSectionSettings` / `HomeSectionItemExtraData` in `services/home-section.service.ts` when new JSON fields appear.

---

## Quick file map

```
website/
  .env.local                          # REAL API base + keys
  lib/upstream.ts                     # server upstream config
  lib/axios.ts                        # browser /api client
  lib/map-home-*.ts                   # section mappers
  hooks/use-home-section.ts
  hooks/use-blogs.ts
  hooks/use-footer-sections.ts
  services/home-section.service.ts
  services/blog.service.ts
  services/footer-section.service.ts
  app/api/home-sections/[key]/route.ts
  app/api/footer-sections/route.ts
  app/api/blogs/route.ts
  app/api/newsletters/subscribe/route.ts
  components/home/*                   # homepage sections
  components/layout/footer.tsx
  docs/home-*-request-body.json       # CMS body templates
```

---

## Suggested next tasks (priority)

1. Wire **Our Products** + **DTF Supplies** carousels to product/category APIs.
2. Wire **header** menus if menu API exists.
3. Wire footer **social links** if backend adds them (or website settings).
4. Harden newsletter `source` enum / UX.
5. Portal ↔ same APIs for CMS editing of these section_keys.

---

## One-liner for the next agent

> Continue ModFirst `website/` API integration: homepage home-sections + footer + blogs are already wired via `/api` proxies to `command.modfirst.com/api/v1/`; do not change env to `api.modfirstapparel.com`; next gap is mock ProductCarousels in `home-wrapper.tsx`. Follow existing proxy → service → hook → mapper pattern.
