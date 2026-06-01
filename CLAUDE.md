# The Care Ranch — Brochure Project

## What this is
An evolving set of HTML brochure drafts for The Care Ranch, deployed via Cloudflare Pages. The client reviews and compares drafts through a `versions.html` index page that lists every version with a changelog. **v20 is the current active draft** (content + type treatment pass).

The booking form on v20 submits directly from the browser to Web3Forms Pro (€15/month, billed via Paddle to the Web3Forms account under `willem@scex.nl`). No server-side function is involved. Details in the "Booking form + email" section below.

Also contains the original v7 feedback and legacy .docx tooling from earlier rounds.

## Project structure
```
├── index.html                       # Styled v7 feedback page (GitHub Pages root)
├── versions.html                    # Version index — the client's entry point
├── brochure-v8.html                 # Rewrite + client-selected photos
├── brochure-v9.html                 # Content additions (network, nutrition, empathy line)
├── brochure-v10.html                # Full layout redesign
├── brochure-v11.html                # TCR brand font, scroll animations, PDF export
├── brochure-v12.html                # Inline SVG logo + word-by-word scroll reveal
├── brochure-v20.html                # Client feedback + type pass: kickers removed, hero tagline below hero, TCR pull-out scale, Arizona header removed, participant testimonials added (CURRENT)
├── stats.html                       # Private analytics dashboard (passphrase-gated). See Deployment ▸ Stats dashboard
├── functions/                       # Cloudflare Pages Functions — dashboard only (booking form is client-side)
│   ├── _middleware.js               # Gates /stats, /stats.html, /api/stats behind a passphrase cookie
│   ├── cfp_login.js                 # POST /cfp_login — passphrase check, sets auth cookie
│   ├── constants.js                 # Cookie config + CFP_PROTECTED_PATHS list
│   ├── template.js                  # Login page HTML (brochure palette)
│   ├── utils.js                     # sha256 + cookie key/value helpers
│   └── api/
│       └── stats.js                 # Queries Cloudflare GraphQL Analytics API → JSON for the dashboard
├── images/                          # Photos extracted from client PDFs
│   ├── location-51.jpg              # Pool → Experience section
│   ├── location-92.jpg              # Entrance gate → Hero background
│   ├── retreat-38.jpg               # Scott — inner reflection → Method band MIDDLE
│   ├── retreat-66.png               # Equine therapy → Method band RIGHT (horses)
│   ├── retreat-77.png               # Lotte — ramada session → Method band LEFT (cropped via object-position: 50% 100%)
│   ├── retreat-85.png               # Walking in trees → Journey banner
│   ├── retreat-108.png              # Food → Arizona section
│   ├── retreat-118.png              # Team group photo → Team section
│   ├── rooms-bedroom.png            # Bedroom → Practical Info thumbnail row (above Includes)
│   ├── rooms-chair.png              # Chair detail → Practical Info thumbnail row
│   └── rooms-window.png             # Night window → Practical Info thumbnail row
├── client-input/
│   ├── brochure-v7-original.docx    # Original brochure from the client
│   └── v9/                          # Screenshots + transcription for v9 input
├── feedback/
│   └── brochure-v7-feedback.md      # Feedback on v7 (markdown)
├── output/
│   └── brochure-v8-improved.docx    # Legacy — only used for v8 round
├── scripts/
│   └── generate_brochure_v8.py      # Legacy — only used for v8 round
├── .references/
│   └── voice.md                     # WB-copywriter voice profile derived from v20 + CLAUDE.md rules
├── content/
│   └── email-booking-notification-*.md  # Drafted HTML + text email templates (not yet wired)
├── package.json                     # wrangler devDep
├── package-lock.json
├── .gitignore
└── CLAUDE.md
```

## Version workflow

Each iteration creates a **new file in `main`**, not a new branch:

1. Copy the previous version: `cp brochure-vN.html brochure-v(N+1).html`
2. Edit the new file.
3. Add a new `<a class="version">` block at the top of `versions.html` with a "What changed" bullet list.
4. Commit + push. Cloudflare Pages auto-deploys in ~30–60 sec.

Every version gets its own permanent URL. The client bookmarks `versions.html` once and can click into any version at any time. Old URLs never expire — critical for the "she might want to revisit v8 next week" use case.

Branches are optional; use them for experimental work, but sharing with the client always goes through the main-branch versioned file.

## Content rules

- **When layout changes, preserve text byte-for-byte** (e.g. v9 → v10 was pure layout, zero copy edits). The client's previous copy approvals carry forward.
- **Never filter, recolor, crop, or harmonize client photos.** Client's explicit rule. CSS `object-position` for display cropping is OK as a narrow exception when explicitly requested (used for `retreat-77` to show the ramada/ground). In v20 the selector is URL-based (`img[src*="retreat-77"]`) so the crop travels with the file regardless of DOM order.
- **No em-dashes (`—` / `&mdash;`).** Client explicitly flagged them as "too AI". Use commas, colons, semicolons, or parentheses per context. This rule applies to all new copy and any edits — do not reintroduce them.

## Mobile optimization policy

> **🛑 ABSOLUTE RULE: NEVER CHANGE ANYTHING ON THE DESKTOP VERSION.** When working on mobile, the desktop render MUST be byte-identical to what shipped before the mobile pass. This rule has been emphasized by the client multiple times and is the single most important constraint of every mobile change. Verify before every commit.

The mobile view is a **presentation layer on the same content**, never a simplified variant. Hard rules:

- **Never remove text or image content on mobile.** Every paragraph, bullet, photo, and pull-out visible on desktop must remain present in the HTML and reachable on mobile. Compactness is achieved via CSS (padding, image sizing, grid layout), not by deleting content.
- **Never change desktop when optimizing mobile.** All mobile-only rules live inside `@media (max-width: ...)` queries. The desktop experience must render byte-identically to what shipped before the mobile pass.
- **JS counts as desktop change too.** Any JavaScript that mutates the DOM (wrapping elements, adding/removing classes, injecting buttons, attaching listeners that affect layout) MUST early-return on desktop via `window.matchMedia('(max-width: 767px)').matches` (or equivalent viewport check) BEFORE doing anything. Hiding the injected output via CSS `@media` is not enough — the DOM mutation itself can shift desktop layout, animations, or focus order. Guard the mutation, not just the styles.
- **Resize handling.** If a mobile-only DOM mutation runs at load, decide explicitly what happens when the user resizes from mobile→desktop (e.g. DevTools, rotate, fold). Either: (a) listen for `matchMedia.onchange` and unwrap, or (b) leave the wrap in place but ensure CSS at desktop widths makes it visually identical to no-wrap. Document which one.
- **Never drop a section.** All sections on desktop must be present on mobile, in the same order and using the same structural framework. Compactness is achieved by tightening each section in place, not by hiding or removing any.
- **Mobile-only alternative copy is allowed**, but only via CSS: both the desktop-long and mobile-short variants live in the HTML, each shown or hidden via a media query. The desktop (long) version must always stay in the HTML so it remains accessible at any viewport.
- **Image display cropping on mobile** (via `object-fit: cover` / `object-position`) is sanctioned for compactness, consistent with the desktop `retreat-77` exception. The image file is never modified; only display is cropped, and only on mobile.
- **Mobile accordion (`Read more` / `Read less`)** is the section-level compaction mechanism. The setup runs at the bottom of `brochure-v20.html` and is desktop-no-op (early-returns when `matchMedia('(max-width: 767px)')` doesn't match; CSS for `.collapsible` is also wrapped in the same media query). Photos must always stay visible in the collapsed state, even when their containing section is collapsed. Mechanism: any element that should remain visible inside a collapsible section carries `data-keep-visible="true"`. The accordion JS skips it AND, if a sibling of the anchor only contains a keep-visible descendant (e.g. `.split` containing `.split-media`, `.info-grid` containing `.info-rooms`), recurses into that sibling and marks only its non-keep children as collapsible. When you add a new image-bearing block to any accordion-managed section, tag the photo container with `data-keep-visible="true"` or it will vanish behind Read more on mobile. Currently tagged: `.split-media` (Arizona), `.method-photos`, `.team-banner`, `.experience-media`, `.journey-banner`, `.info-rooms` (Practical).
- **Desktop is the authoritative, complete version.** Mobile is the compact presentation. When in doubt, desktop wins.

**Verification before every mobile commit:** open the page at desktop width (≥1024px) and confirm the rendered DOM and visual output are byte-identical to `main`. A `git diff` of just CSS/JS is not enough — actually compare the rendered desktop view.

## Animations (v20 policy)
- GSAP + ScrollTrigger via CDN (cdnjs, `defer`) drive: section fade-ups, staggered grid reveals, hero parallax, word-by-word reveal on h2s and `[data-split]` poetic lines.
- **FOUC prevention** hides certain selectors at `opacity: 0` until GSAP animates them in. The gotcha: on slow connections, `window.load` waits for the GSAP CDN, so gated elements stay invisible for 2–3 seconds. That looked broken on the client's connection.
- **Above-the-fold / first-visible sections must NOT be FOUC-gated.** In v20 this means `.arizona-narrative`, `.split-text`, and `.split-media` are explicitly excluded from both the FOUC opacity rule AND the GSAP single-element reveal list. They render immediately with the HTML. Animated reveals kick in from Clean Vision downward.
- When adding a new early section to the page, do not add it to the FOUC list and do not add a ScrollTrigger for it. Keep the rest of the animations as-is.
- **Photos** are extracted via `pdfimages -all` from the PDFs in `client-input/Pictures/` (gitignored — the PDFs are ~155 MB combined).

## Deployment
- **Repo:** https://github.com/willem4130/thecareranch-brochure
- **Current draft:** https://thecareranch-brochure.pages.dev/brochure-v20.html
- **Versions index:** https://thecareranch-brochure.pages.dev/versions.html
- Commit to `main` → Cloudflare Pages auto-deploys in ~30–60 sec.
- **Clean-URL redirect (deploy-verification gotcha):** Pages 308-redirects `/<name>.html` → `/<name>` (strips `.html`). Both forms work in a browser, and the `.html` links listed above just redirect, so they're fine to share. But when verifying a deploy with `curl`, use `curl -L` to follow the redirect, otherwise you read an empty 308 body and wrongly conclude the new content isn't live. Live-CSS check: `curl -sL <url> | grep '<marker>'`.
- The old GitHub Pages URLs (`willem4130.github.io/care-ranch-brochure-feedback/*`) are no longer served. GitHub does not redirect Pages URLs after a repo rename. We originally moved off GitHub Pages to run a Cloudflare Pages Function for the booking form; the function has since been removed (the form now submits to Web3Forms client-side), but we stayed on Cloudflare Pages.

### CLI access
Wrangler is a local devDep (`package.json`). Use `npx wrangler ...` for everything. Logged in as `willem@scex.nl` via `wrangler login` (OAuth). Verify with `npx wrangler whoami`.

Useful commands:
- `npx wrangler pages deployment list --project-name=thecareranch-brochure` — recent deployments
- `npx wrangler pages secret list --project-name=thecareranch-brochure` — list configured secrets (names only, values stay encrypted)
- `npx wrangler pages secret put <KEY> --project-name=thecareranch-brochure` — add or update a secret (interactive; paste value at prompt, do NOT put it on the command line)

GitHub repo operations use `gh` (authenticated as `willem4130`).

### Analytics
Cloudflare Web Analytics beacon is in `<head>` of `brochure-v20.html` and `versions.html` (after the GSAP CDN scripts, before `</head>`). Token: `3f685f1f9c414ddf9bc305d40837a924`. View stats at Cloudflare dashboard → Analytics & Logs → Web Analytics → the entry created via "Add a site" (the one without the blue "Manage this site using Cloudflare Pages" banner). Registered hostname: `thecareranch-brochure.pages.dev` only — if you ever wire a custom domain (e.g. `thecareranch.com`), add it to the Web Analytics site's hostname list in the same dashboard, otherwise visits to the new domain won't be counted.

Why a manual snippet, not the Pages "Metrics → Enable" auto-injection: the auto-enable button on Pages projects is a known Cloudflare bug (throws `Error creating Web Analytics entry` and leaves orphaned Pages-linked sites with no installable snippet). Each click of Enable created a ghost entry. We added the site manually via the standalone Web Analytics → Add a site flow, choosing the "does not belong to Cloudflare websites" option to get a real installable token. New version files inherit the script tag automatically via the copy-from-previous-version workflow — do not remove it. There are 4 orphaned Pages-managed ghost entries in Web Analytics that can be deleted once the active site shows traffic.

### Stats dashboard (`/stats`)
Self-hosted analytics dashboard at https://thecareranch-brochure.pages.dev/stats so the client can view traffic without a Cloudflare login. Shows visit counters (1h / 24h / 30d), a 30-day daily-visits line chart, and top pages / countries / referrers / devices. Built 2026-05-28.

- **Data path:** `functions/api/stats.js` (Cloudflare Pages Function) queries the Cloudflare GraphQL Analytics API (`rumPageloadEventsAdaptiveGroups`) server-side using the Web Analytics site tag, then `stats.html` renders it with Chart.js (CDN). The site tag is the same Web Analytics token as the beacon.
- **Auth:** passphrase + hashed cookie (Charca pattern). `functions/_middleware.js` gates ONLY `/stats`, `/stats.html`, `/api/stats` (see `functions/constants.js` `CFP_PROTECTED_PATHS`); the brochure stays fully public. Cookie = `sha256(passphrase)`, 30-day Max-Age, HttpOnly/Secure/SameSite=Lax. Login page is `functions/template.js`, POST handler `functions/cfp_login.js`.
- **The passphrase is NOT in this repo** — the GitHub repo is public, so committing it would defeat the lock. It lives in Claude's private local memory (`~/.claude/.../memory/reference_stats_dashboard.md`). Ask Claude, or reset it via the secret below.
- **Secrets (Cloudflare Pages, set via `npx wrangler pages secret put <KEY> --project-name=thecareranch-brochure`):** `CF_API_TOKEN` (scope Account → Account Analytics → Read), `CF_ACCOUNT_TAG` (`0745922372e40f12bc9826b1079af208`), `CFP_PASSWORD` (the dashboard passphrase). To change the passphrase: set a new `CFP_PASSWORD` and update the memory file.
- These Pages Functions are unrelated to the booking form, which is client-side only (the old `functions/api/book.js` was removed 2026-04-21; this is the first server-side function since).

## Booking form + email

The "Book now" button opens a modal form in `brochure-v20.html`. On submit, the form POSTs JSON **directly to Web3Forms** from the browser. There is no server-side function in the booking path — `functions/api/book.js` was removed on 2026-04-21.

**Flow:** browser modal → `fetch` POST `https://api.web3forms.com/submit` → delivers to `willem@scex.nl` (primary, tied to the Web3Forms account) with `margreet@thecareranch.com` and `contact@thecareranch.com` on CC. `reply_to` is set to the guest's email so hitting "Reply" in the inbox replies to the guest.

**Why client-side, not server-side.** Web3Forms rejects requests from server IPs on BOTH free and Pro tiers. The error is: `"This method is not allowed. Use our API in client side or contact support with server IP address (Pro plan is required)"` and the workaround they suggest is to email support with a fixed server IP for whitelisting. Cloudflare Worker egress IPs are a rotating pool across Cloudflare's entire AS, so IP whitelisting is not viable. Web3Forms' protection model is Origin/Referer domain-locking — browser-only by design. The architecture was moved to match that on 2026-04-21.

**Web3Forms Pro subscription.** €15/month, active since 2026-04-21, billed via Paddle to the Web3Forms account registered under `willem@scex.nl`. Pro is required because free tier does not accept `cc` (multiple recipients). Manage or cancel at https://web3forms.com/ → Billing & Plans.

**Access key in page source.** The `access_key` lives inline in the HTML at the `fetch` call in `brochure-v20.html`'s modal submit handler. This is the designed pattern for Web3Forms — the form is registered to domain `thecareranch-brochure.pages.dev`, so Web3Forms rejects the same key from any other Origin. To rotate: regenerate in the Web3Forms dashboard and update the single string in the HTML.

**POST body shape:**
```json
{
  "access_key": "<UUID>",
  "subject": "Retreat booking request, <date>",
  "from_name": "The Care Ranch Brochure",
  "cc": "margreet@thecareranch.com, contact@thecareranch.com",
  "reply_to": "<guest email>",
  "Date": "<date>",
  "Name": "<guest name>",
  "Email": "<guest email>"
}
```
Web3Forms returns `{"success": true, ...}` on success. The modal checks `data.success` (boolean) and swaps to the "Thank you, {name}" state. On failure (network, non-2xx, or `success: false`), the modal shows an inline error with a fallback `mailto:contact@thecareranch.com`. State resets on modal close so a reopen is always fresh.

**No server-side validation.** The date `<select>` limits to three fixed options; `type="email"` enforces format at HTML5 level; Web3Forms provides its own spam/rate-limiting on Pro. Acceptable because the form only triggers internal email — worst case abuse is a bogus notification in our inbox.

**Public contact address in the brochure.** `contact@thecareranch.com` is linked inline at the CTA's `.cta-fine` line (centered block, Arial, terracotta underline) and is a real CC recipient on every Web3Forms submission, so pre-booking questions, post-booking replies, and internal notifications all converge on that inbox. The bottom `<footer>` element was removed on 2026-04-15 so the dark CTA section is the last thing visible on the page.

**Pipeline history (all superseded — kept so future sessions understand why we're here):**
- **v1 Resend** via Cloudflare Pages Function: failed 2026-04-15. Resend sandbox restricts sending to the account-owner email only until a sending domain is verified via DNS; `thecareranch.com` DNS access was not available.
- **v2 FormSubmit** via the same Pages Function: deployed 2026-04-15. Submissions returned `success: true` but the per-recipient one-time activation email never arrived at either inbox; delivery was never confirmed.
- **v3 Web3Forms server-side** via the same Pages Function: attempted 2026-04-21. Rejected with `"Pro plan is required"` on both free AND Pro tiers — Web3Forms blocks server IPs regardless of plan.
- **v4 Web3Forms client-side** direct from the browser (current, 2026-04-21). Works.

**Dormant state (safe to ignore, delete if tidying):**
- `RESEND_API_KEY` Cloudflare Pages secret still exists on the project. No code reads it. Delete via `npx wrangler pages secret delete RESEND_API_KEY --project-name=thecareranch-brochure` if desired.
- `content/email-booking-notification-2026-04-14.md` contains `/WB-copywriter`-generated HTML + text email templates designed for a direct-send API like Resend. Under Web3Forms the relay composes its own email body from POST fields, so these are unwired. Kept for if DNS access opens up and we move back to a direct-send API.

## .docx generation (legacy — v8 only)
The `scripts/generate_brochure_v8.py` script was used in the v8 round to produce a Word doc alongside the HTML. Not used for v9+. Kept for reference.

```bash
python3 scripts/generate_brochure_v8.py
```
Requires `python-docx`. Loads `client-input/brochure-v7-original.docx` as a template to inherit theme fonts (Calibri headings, Cambria body). Always `Document(TEMPLATE)`, never `Document()` (the latter creates Word's default blue-serif theme).

The original (Google Docs export) stores formatting as paragraph- and run-level overrides:
- **H1:** run-level 23pt bold, paragraph space_before=24pt
- **H2:** run-level 17pt bold, paragraph space_after=4pt
- **H3:** run-level 13pt bold, paragraph space_before=14pt
- **Body:** paragraph space_after=12pt
- **No bullet styles** — list items are plain 'normal' paragraphs

## Context
- Brochure was written in Dutch first, then translated/composed into English
- v8 incorporated all feedback from `feedback/brochure-v7-feedback.md`
- v8 → v9: content additions — international network/Wageningen, whole food nutrition as Method pillar, empathetic opener, outcome bullets, explicit expert language, target-groups note
- v9 → v10: pure layout redesign — full-bleed hero, 2-column splits, 2×3 method grid, 3-column team cards, 3-step journey timeline, 2-column benefit + info grids
- Reference project for brand/design: `/Users/willemvandenberg/Dev/The Care Ranch/thecareranch-landingpage`
- **Brand colors:** sand `#F7F4F0`, cream `#F2EDE4`, terracotta `#C47D5C`, saddle `#79584A`, charcoal `#3D3632`
- **Brochure fonts:** custom `@font-face` "The Care Ranch" (display + pull-outs) + Arial (body). Loaded from `Fonts/TheCareRanch0525-RegularNEW.ttf|otf`.
  - **Shorthand: `TCR`** — always refer to "The Care Ranch" font as TCR throughout code, commits, and conversation.
  - **TCR pull-out size (canonical, v20+):** `clamp(1.4rem, 2.2vw, 1.85rem)` — ~22–30px on desktop. This applies to EVERY TCR italic pull-out across the brochure: section openers below an h2 (`.poetic`), inline quotes (`.inline-quote p`), hero tagline (`.hero-tagline`), interstitial pull-outs (`.shift-block`), CTA quote (`.cta-quote`), and statement list items (`.statement-list li`). Consistency across these is required — a brochure reads as one document, so if you change one, change them all. Do NOT introduce a new size without asking.
    - **Uppercase block letterform (since 2026-04-28):** all TCR pull-outs render with `text-transform: uppercase` + `letter-spacing: 0.08em`, mirroring the header style. Reason: TCR Regular's lowercase is a flowing cursive that's hard to read in body-length passages; the uppercase letterforms (same file) are clearer. Applied uniformly to `.poetic`, `.hero-tagline`, `.inline-quote p`, `.shift-block`, `.statement-list li`, `.cta-quote`, `.cta-fine` per the consistency rule. The email link inside `.cta-fine` is reset back to its natural case via `.cta-fine a { text-transform: none }`. The `.testimonial-quote` sanctioned exception keeps the cursive lowercase deliberately on desktop/tablet — testimonials are participants' voices, distinct from brand voice (on mobile ≤767px it renders plain Arial; see the testimonials bullet below).
    - **Mobile bump (≤767px, since 2026-04-28):** the canonical size locks at 22.4px on small screens (since `2.2vw` falls below the 1.4rem min). Mobile-only override: `clamp(1.5rem, 4.5vw, 1.85rem)` (~24–30px) with `line-height: 1.4`, applied to the same seven selectors above (including `.cta-fine`). The desktop value is unchanged; the override lives inside `@media (max-width: 767px)`. Tuned slightly smaller than cursive would need because uppercase block letters are visually denser. Same consistency rule applies — change all seven together if you adjust the mobile size.
    - **Sanctioned exception — mobile `.poetic` in Arial (≤767px, since 2026-05-30):** on phones only, the section-intro pull-outs (`.poetic`, e.g. Clean Vision's "There comes a point...") render in **Arial italic, sentence-case** (`text-transform: none`, `letter-spacing: normal`) instead of the TCR uppercase block letterform, because TCR's block caps are dense and hard to read across these multi-line intro passages on a narrow screen. This is a sanctioned break of the all-seven-together rule, scoped to **font-family, case, and size**: `.poetic` also shrinks to `clamp(1.25rem, 3.5vw, 1.45rem)` (~20–23px), down from the shared `clamp(1.5rem, 4.5vw, 1.85rem)` bump, so it sits clearly below the TCR section headers (Arial italic is visually denser than TCR's thin hand-drawn caps, so matching the larger size read as too big next to the headers on the client's phone). The override sits inside the existing `@media (max-width: 767px)` block, directly below the size bump. The other six pull-outs (hero tagline, inline quotes, shift blocks, statement list, CTA quote/fine) keep the larger bump and stay TCR on mobile, and **desktop + tablet (≥768px) are entirely untouched** — `.poetic` is still TCR block-caps there. Side effect to be aware of: in the **Who This Is For** section the "...who sense:" lead-in (`.poetic`) is now Arial while its `.statement-list` bullets below stay TCR; left intentionally as a lead-in/statements split. If the client later wants the other pull-outs in Arial on mobile too, extend the same `@media (max-width: 767px) .poetic { ... }` rule to the full seven-selector group.
    - **Sanctioned exception — testimonials:** `.testimonial-quote` uses a smaller TCR size `clamp(1.15rem, 1.8vw, 1.4rem)` (desktop/tablet). Rationale: testimonials are multi-sentence paragraphs with attribution, not single poetic lines. Canonical pull-out size would make them visually dominate the page. This is the only sanctioned *size* exception. `.testimonial-name` (TCR uppercase, ~0.95rem, terracotta) and `.testimonial-role` (Arial, ~0.8rem, muted) style the attribution.
      - **Mobile (≤767px, since 2026-06-01):** `.testimonial-quote` drops the TCR cursive italic for **plain Arial (non-italic)** so the quote bodies read like the other section body text (client request), mirroring the `.poetic` mobile-Arial carve-out. Quote body ONLY — `.testimonial-name` keeps its terracotta TCR-caps attribution accent and `.testimonial-role` is already Arial. font-size is pinned to the global body clamp `clamp(1rem, 0.95rem + 0.3vw, 1.1rem)` so the quote matches body paragraphs exactly (~16–17.6px on phones) rather than the larger ~18px the base `.testimonial-quote` size floors at on mobile (client flagged it read bigger); color and line-height still inherit from the base rule (line-height stays 1.55, a touch tighter than body's 1.7). Desktop + tablet keep the sanctioned TCR cursive. Override lives in the `@media (max-width: 767px)` block beside the `.poetic` rule. If the client later wants the attribution name in Arial too, add `.testimonial-name` to that same rule.
  - **Header + button typography (v20, 2026-04-16 state):** h1/h2/h3 + `.info-item strong` + `.cta-button` + `.hero-utility-book` all render as `text-transform: uppercase` with TCR. Headers use `color: rgba(61, 54, 50, 0.85)` (same as `.poetic`). Sizes: h2 `clamp(2.4rem, 5.5vw, 3.8rem)`, h3 `clamp(1.9rem, 3.6vw, 2.5rem)`, `.info-item strong` `clamp(1.5rem, 3vw, 2rem)`, buttons ~0.85–1rem with `letter-spacing: 0.12em` for readability. The leftover `font-style: italic` on these selectors is effectively a no-op (`font-synthesis: none` is set, and the font has no true italic variant) — kept from an earlier lowercase experiment, harmless but don't rely on it. **Why it's locked in this shape:** the TCR Regular font file contains two distinct letterform designs in one file — **block/print uppercase** and **cursive/flowing lowercase**. When rendered mixed-case (e.g. "Why This Matters for Organizations"), the two drawing styles clash and read as child-like. Committing fully to one case resolves it; both pure-uppercase and pure-lowercase look consistent. Uppercase was picked over lowercase cursive on 2026-04-16 for a more structured, classical title feel. Do NOT reintroduce mixed-case on any of these selectors without a replacement plan — it will look broken again.
  - **TCR Caps font (client-provided, not wired):** `Fonts/TCR CAPS FINAL FONT.pdf` is a designer/type-specimen file the client provided for a caps-optimized TCR variant. It's a PDF, not a webfont — can't load via `@font-face` as-is. If we ever want true uppercase headers (instead of the forced-lowercase approach above), first step is getting this as `.ttf` / `.otf` from the designer.
- **Landing page fonts (reference project only):** Playfair Display + Lora via Google Fonts
- **Section body-text alignment (v20):** the global default for paragraphs directly inside `.section-inner` is `text-align: justify` via `.section-inner > p:not(.hero-tagline)` — specificity (0,2,1). To override alignment per section, the new selector needs specificity ≥ (0,2,1), so use the form `.<section-class> .section-inner > p { text-align: ... }`. A naked `.mission-section p` rule will NOT win. Currently overridden to center in Clean Vision, Mission, and the CTA quote (`.cta-section > .section-inner > .cta-quote`). Team names (`.team-card h3`) are left-aligned (was centered pre-2026-04-16).
- **Testimonials section (v20, 2026-04-16):** social proof block between Practical Info and CTA. Three real participant quotes, sourced from the landing page `TestimonialsSection.tsx` and a WhatsApp forward from the client: Sara (Ex-Wall Street MD), Nicoline Beersen (Bergman Clinics; translated from Dutch, em-dash replaced per no-em-dash rule), Maaike Vos (Booking.com; em-dashes replaced with period/comma). Default sand background (no `.bg-*` class) so the section reads as a breathing moment before the dark CTA. Centered text, `max-width: 640px` per `.testimonial` to keep line length short. Stack-level FOUC + stagger reveal (0.18 stagger, `fadeUpStart`). When adding more testimonials, preserve no-em-dash rule and keep the "short → medium → long" order so the section builds toward the biggest story.

## Pending (as of 2026-04-21)
- **Individual team portraits**: placeholder tiles gone in v20; real portraits still awaited from the client.
- **Fonts — monitor, don't chase**: the header-wonkiness pass landed on 2026-04-15 (italic + lowercase + softer color; see Context/Header typography). Beyond that, don't propose typography changes proactively. If the client raises further font feedback, engage.
