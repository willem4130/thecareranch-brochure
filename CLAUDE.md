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
- The old GitHub Pages URLs (`willem4130.github.io/care-ranch-brochure-feedback/*`) are no longer served. GitHub does not redirect Pages URLs after a repo rename. We originally moved off GitHub Pages to run a Cloudflare Pages Function for the booking form; the function has since been removed (the form now submits to Web3Forms client-side), but we stayed on Cloudflare Pages.

### CLI access
Wrangler is a local devDep (`package.json`). Use `npx wrangler ...` for everything. Logged in as `willem@scex.nl` via `wrangler login` (OAuth). Verify with `npx wrangler whoami`.

Useful commands:
- `npx wrangler pages deployment list --project-name=thecareranch-brochure` — recent deployments
- `npx wrangler pages secret list --project-name=thecareranch-brochure` — list configured secrets (names only, values stay encrypted)
- `npx wrangler pages secret put <KEY> --project-name=thecareranch-brochure` — add or update a secret (interactive; paste value at prompt, do NOT put it on the command line)

GitHub repo operations use `gh` (authenticated as `willem4130`).

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
  - **TCR pull-out size (canonical, v20+):** `clamp(1.4rem, 2.2vw, 1.85rem)` — ~22–30px. This applies to EVERY TCR italic pull-out across the brochure: section openers below an h2 (`.poetic`), inline quotes (`.inline-quote p`), hero tagline (`.hero-tagline`), interstitial pull-outs (`.shift-block`), CTA quote (`.cta-quote`), and statement list items (`.statement-list li`). Consistency across these is required — a brochure reads as one document, so if you change one, change them all. Do NOT introduce a new size without asking.
    - **Sanctioned exception — testimonials:** `.testimonial-quote` uses a smaller TCR size `clamp(1.15rem, 1.8vw, 1.4rem)`. Rationale: testimonials are multi-sentence paragraphs with attribution, not single poetic lines. Canonical pull-out size would make them visually dominate the page. This is the only sanctioned exception. `.testimonial-name` (TCR uppercase, ~0.95rem, terracotta) and `.testimonial-role` (Arial, ~0.8rem, muted) style the attribution.
  - **Header + button typography (v20, 2026-04-16 state):** h1/h2/h3 + `.info-item strong` + `.cta-button` + `.hero-utility-book` all render as `text-transform: uppercase` with TCR. Headers use `color: rgba(61, 54, 50, 0.85)` (same as `.poetic`). Sizes: h2 `clamp(2.4rem, 5.5vw, 3.8rem)`, h3 `clamp(1.9rem, 3.6vw, 2.5rem)`, `.info-item strong` `clamp(1.5rem, 3vw, 2rem)`, buttons ~0.85–1rem with `letter-spacing: 0.12em` for readability. The leftover `font-style: italic` on these selectors is effectively a no-op (`font-synthesis: none` is set, and the font has no true italic variant) — kept from an earlier lowercase experiment, harmless but don't rely on it. **Why it's locked in this shape:** the TCR Regular font file contains two distinct letterform designs in one file — **block/print uppercase** and **cursive/flowing lowercase**. When rendered mixed-case (e.g. "Why This Matters for Organizations"), the two drawing styles clash and read as child-like. Committing fully to one case resolves it; both pure-uppercase and pure-lowercase look consistent. Uppercase was picked over lowercase cursive on 2026-04-16 for a more structured, classical title feel. Do NOT reintroduce mixed-case on any of these selectors without a replacement plan — it will look broken again.
  - **TCR Caps font (client-provided, not wired):** `Fonts/TCR CAPS FINAL FONT.pdf` is a designer/type-specimen file the client provided for a caps-optimized TCR variant. It's a PDF, not a webfont — can't load via `@font-face` as-is. If we ever want true uppercase headers (instead of the forced-lowercase approach above), first step is getting this as `.ttf` / `.otf` from the designer.
- **Landing page fonts (reference project only):** Playfair Display + Lora via Google Fonts
- **Section body-text alignment (v20):** the global default for paragraphs directly inside `.section-inner` is `text-align: justify` via `.section-inner > p:not(.hero-tagline)` — specificity (0,2,1). To override alignment per section, the new selector needs specificity ≥ (0,2,1), so use the form `.<section-class> .section-inner > p { text-align: ... }`. A naked `.mission-section p` rule will NOT win. Currently overridden to center in Clean Vision, Mission, and the CTA quote (`.cta-section > .section-inner > .cta-quote`). Team names (`.team-card h3`) are left-aligned (was centered pre-2026-04-16).
- **Testimonials section (v20, 2026-04-16):** social proof block between Practical Info and CTA. Three real participant quotes, sourced from the landing page `TestimonialsSection.tsx` and a WhatsApp forward from the client: Sara (Ex-Wall Street MD), Nicoline Beersen (Bergman Clinics; translated from Dutch, em-dash replaced per no-em-dash rule), Maaike Vos (Booking.com; em-dashes replaced with period/comma). Default sand background (no `.bg-*` class) so the section reads as a breathing moment before the dark CTA. Centered text, `max-width: 640px` per `.testimonial` to keep line length short. Stack-level FOUC + stagger reveal (0.18 stagger, `fadeUpStart`). When adding more testimonials, preserve no-em-dash rule and keep the "short → medium → long" order so the section builds toward the biggest story.

## Pending (as of 2026-04-21)
- **Individual team portraits**: placeholder tiles gone in v20; real portraits still awaited from the client.
- **Fonts — monitor, don't chase**: the header-wonkiness pass landed on 2026-04-15 (italic + lowercase + softer color; see Context/Header typography). Beyond that, don't propose typography changes proactively. If the client raises further font feedback, engage.
