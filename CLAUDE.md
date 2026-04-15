# The Care Ranch — Brochure Project

## What this is
An evolving set of HTML brochure drafts for The Care Ranch, deployed via Cloudflare Pages. The client reviews and compares drafts through a `versions.html` index page that lists every version with a changelog. **v20 is the current active draft** (content + type treatment pass).

The booking form on v20 is wired to a real email pipeline: a Cloudflare Pages Function (`functions/api/book.js`) forwards the booking through FormSubmit (Resend was the previous backend; Web3Forms swap is pending). Details in the "Booking form + email" section below.

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
├── brochure-v20.html                # Client feedback pass: kickers removed, hero tagline below hero, TCR pull-out scale, Arizona header removed (CURRENT)
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
├── functions/
│   └── api/
│       └── book.js                  # Cloudflare Pages Function: POST /api/book → FormSubmit (Web3Forms swap pending)
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
- The old GitHub Pages URLs (`willem4130.github.io/care-ranch-brochure-feedback/*`) are no longer served. GitHub does not redirect Pages URLs after a repo rename, and we intentionally moved off GitHub Pages when the booking form was wired to a Cloudflare Pages Function.

### CLI access
Wrangler is a local devDep (`package.json`). Use `npx wrangler ...` for everything. Logged in as `willem@scex.nl` via `wrangler login` (OAuth). Verify with `npx wrangler whoami`.

Useful commands:
- `npx wrangler pages deployment list --project-name=thecareranch-brochure` — recent deployments
- `npx wrangler pages secret list --project-name=thecareranch-brochure` — list configured secrets (names only, values stay encrypted)
- `npx wrangler pages secret put <KEY> --project-name=thecareranch-brochure` — add or update a secret (interactive; paste value at prompt, do NOT put it on the command line)

GitHub repo operations use `gh` (authenticated as `willem4130`).

## Booking form + email

The "Book now" button opens a modal form. On submit, the form POSTs JSON to `/api/book`, handled by `functions/api/book.js` (a Cloudflare Pages Function). That function validates input and forwards the booking through a third-party email relay. Which relay has been in flux (Resend → FormSubmit → Web3Forms planned). Current on `main` = FormSubmit.

**Flow:** browser form → `fetch` POST `/api/book` → `functions/api/book.js` → FormSubmit AJAX endpoint → email lands at both `willem@scex.nl` and `contact@thecareranch.com`.

**Why the swap off Resend (2026-04-15):** Resend's sandbox restricted sending to the account owner's email (`willem@scex.nl`) until `thecareranch.com` domain was verified. DNS access on that domain wasn't coming soon, so the path forward became "use a relay that doesn't need DNS on the sender domain."

**Why FormSubmit:** zero DNS, no sender address to maintain (relay sends from its own domain), free, and `_cc` natively supports the second recipient. Full POST body to `https://formsubmit.co/ajax/willem@scex.nl` includes `_cc`, `_replyto`, `_subject`, `_template: table`, `_captcha: false`, plus the form fields (Date, Name, Email).

**Gotcha — Origin/Referer headers are load-bearing.** FormSubmit's AJAX endpoint rejects server-to-server requests without browser-like `Origin` and `Referer` headers (returns `"Make sure you open this page through a web server..."`). Cloudflare Workers' `fetch` does not send these by default, so `book.js` explicitly sets them from `new URL(request.url).origin`. Do not remove these lines.

**Open issue — FormSubmit deployed but unconfirmed working.** First submission should trigger a one-time activation email per recipient. API returns `{success: "true", message: "... We've sent you an email ..."}` on test submissions, but neither `willem@scex.nl` nor `contact@thecareranch.com` reported receiving the activation email (spam checked). Status as of 2026-04-15: pipeline accepts submissions without error, but we cannot confirm FormSubmit is actually delivering. This is why the Web3Forms swap is planned.

**Web3Forms swap (pending user action — primary blocker):**
  1. User signs up at https://web3forms.com/ with any email, receives an `access_key` (UUID) by email
  2. Store as Cloudflare Pages secret: `npx wrangler pages secret put WEB3FORMS_ACCESS_KEY --project-name=thecareranch-brochure`
  3. Rewrite the fetch in `functions/api/book.js` to POST JSON to `https://api.web3forms.com/submit` with `{access_key: env.WEB3FORMS_ACCESS_KEY, subject, from_name, name, email, date, cc: "contact@thecareranch.com", reply_to: email}`
  4. Remove the `Origin` / `Referer` header workaround (Web3Forms uses token-based auth, no browser-header sniffing)
  5. Empty commit + push to retrigger the build so the function sees the new secret
  Rationale: Web3Forms uses an access_key token, so it's reliable for serverless calls. 250 submissions/month free. Same zero-DNS, same multi-recipient via `cc`.

**Dormant state on Cloudflare:** `RESEND_API_KEY` secret still exists but is no longer read by the function. Harmless; can be deleted via `npx wrangler pages secret delete RESEND_API_KEY --project-name=thecareranch-brochure` or left as-is.

**Frontend contract (stays the same across any relay swap):** POST `/api/book` with JSON `{name, email, date}` → returns `{ok: true}` on success or `{ok: false, error: "..."}` on failure. This contract keeps the HTML modal in `brochure-v20.html` decoupled from whichever relay is being used.

**Success / error UX:** On successful POST, the modal swaps to a "Thank you, {name}. We've received your booking request..." state. On error (network failure or non-2xx from the function), the modal shows an inline message with a fallback mailto to `contact@thecareranch.com`. State resets on modal close so a reopen is always fresh.

**Drafted email templates (currently unused):** `content/email-booking-notification-2026-04-14.md` contains two brand-voiced HTML + plain-text templates (Concierge slip + Landed letter) generated by `/WB-copywriter`. These were designed for direct-send APIs (like Resend). Under FormSubmit / Web3Forms, the relay composes its own email body from the POST fields, so the templates aren't wired. Kept for if the project ever moves back to a direct-send API once DNS is available.

**Public contact address in the brochure:** `contact@thecareranch.com` is linked inline at the CTA's `.cta-fine` line (centered block, Arial, terracotta underline) and in the `<footer>` (`.footer-contact`). Now that it's a real `_cc` recipient on FormSubmit, pre-booking questions, post-booking replies, and internal notifications all converge on that inbox.

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
- **Landing page fonts (reference project only):** Playfair Display + Lora via Google Fonts

## Pending (as of 2026-04-15)
- **Web3Forms access key + swap** (primary blocker on reliable booking email delivery): user signs up at web3forms.com, receives `access_key`, pastes. Then store as Cloudflare Pages secret + rewrite the POST in `functions/api/book.js`. Full steps in "Booking form + email" section above.
- **Team group photo edits** (`retreat-118.png`): user is editing in Freepik — removing Tara and obfuscating the face of the person lying down. Will drop the edited file back in place; brochure picks it up automatically, no code change.
- **Individual team portraits**: placeholder tiles gone in v20; real portraits still awaited from the client.
- **Fonts — ON HOLD**: the original session goal (type fine-tuning) is paused per the user. Do NOT propose a font pass proactively. Only resume if the client's feedback explicitly raises typography.
