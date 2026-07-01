# Clashroom

Clashroom (clashroom.dev) is a free game-based learning platform for Norwegian middle school teachers (ungdomsskolen, 8.–10. trinn). Built by a teacher, for teachers. Launching fall 2026.

**Mission:** The best teaching tools cost money. The free alternatives are outdated or bad. Clashroom fills the gap — no login, no download, no cost. Just share the link.

**Status:** Fresh start. The first generation of games (8 local-multiplayer games + 2 teacher tools) was removed in commit `f1f4381`. The platform is being rebuilt around real-time multiplayer with Firebase. Mattekampen is the first game of the new generation and the template for everything that follows.

---

## What's live

| Page | File | Purpose |
|------|------|---------|
| Landing page | `index.html` | Dark header + hero (fox logo, slogan "Der pensum møter puls"), light body with filter chips and game card grid. NO/EN toggle. |
| **Mattekampen** | `mattekampen.html` | Real-time math duel. Host creates a room, players join with a 4-char code, 10 generated questions, live leaderboard, all-time leaderboard. |

## Files

```
index.html            Landing page
mattekampen.html      First game (Firebase multiplayer)
brand.css             Brand identity: colors, fonts, shared components (buttons, chips, cards, screens)
shared.css            Legacy shared game styles
shared.js             Utilities: showScreen, shuffle, avatars, answer validation, sound FX, confetti, language toggle
firebase-config.js    Firebase init + room helpers (partially superseded — mattekampen.html inlines its own config and uses 4-char codes, not 5)
database.rules.json   Realtime Database security rules (deploy manually in Firebase console)
brand-assets/         Logo SVGs
CNAME                 clashroom.dev (GitHub Pages)
```

---

## Tech stack

- **Architecture:** Static files, no build step, no bundler, no npm. Each game is one HTML file with inline CSS overrides and inline JS, sharing `brand.css` and `shared.js`.
- **Backend:** Firebase Realtime Database (europe-west1) with anonymous auth. Loaded via `firebase-*-compat.js` CDN scripts (v10.12.0).
- **Fonts:** Syne (headings, 700–800), Schibsted Grotesk (body), DM Mono (codes, timers, scores). Loaded via `@import` in brand.css.
- **Hosting:** GitHub Pages on clashroom.dev.
- No cookies, no login for users — anonymous auth only, invisible to the player.

---

## Firebase architecture (Mattekampen pattern)

### Data model

```
rooms/{CODE}/
  hostId                 uid of host (write-once)
  createdAt              server timestamp
  status                 'lobby' | 'countdown' | 'playing' | 'finished'
  currentQuestionIndex   -1 in lobby, 0..n during play
  questionStartedAt      server timestamp, set by host per question
  questions/             array of {id, topic, difficulty, prompt, answer, choices}
  players/{uid}/         {name, score, streak, answers/{qIdx}: {choice, timeUsedMs, correct, points}}
leaderboard/{pushId}     {name, score, date, roomCode} — write-once entries
```

### Security rules (`database.rules.json`)

- Everything requires `auth != null` (anonymous auth).
- `hostId`: writable only if it doesn't exist yet (first writer becomes host).
- `status`, `currentQuestionIndex`, `questionStartedAt`, `questions`: writable only by the host.
- `players/{uid}`: each player writes only their own node.
- The host may delete their own room (room-level write allowed only when the new value is null). The client does this best-effort when the host leaves the results screen; abandoned rooms are never cleaned up (no TTL in RTDB) — needs a scheduled sweep if it ever matters.
- `leaderboard` entries: write-once (no edits, no deletes).

### Game flow

1. Host enters name → `Opprett rom` → 4-char code generated (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, no O/0/I/1), collision-checked.
2. Players enter name + code → join lobby. Host's Start button enables at 2+ players.
3. Host generates the question set client-side and writes it to the room, sets `status: 'countdown'`.
4. All clients run a local 3-2-1 countdown; host then sets `status: 'playing'` and `currentQuestionIndex: 0` with `questionStartedAt: SERVER_TS`.
5. Each client scores locally against server time (`.info/serverTimeOffset` keeps clocks in sync) and writes its own answer + score.
6. Between questions: leaderboard renders live from `players` listener. Host advances with `currentQuestionIndex`/`questionStartedAt`, finishes with `status: 'finished'`.
7. Results: podium + full leaderboard + optional save to all-time leaderboard. `Spill igjen` resets scores and returns everyone to the lobby (same room code).

### Scoring

- 15 s per question. Points: 200–1000 scaled linearly by speed, +50 per streak step (cap 5). Wrong or timeout: 0 points, streak resets.

---

## Visual design

### Brand

- **Logo:** the fox — inline SVG, apricot on aubergine. Blinking eyes on the landing hero (`fox-blink`).
- **Mascot system:** `foxSvg(size)` in shared.js renders the fox with classed parts. Mood classes on a `.fox-stage` wrapper (all in brand.css): `fox-blink` (idle), `fox--happy` (smiling eyes), `fox--cheer` (two jumps), `fox--cheer-loop` (jumping forever), `fox--sad` (droop, ears down), `fox--worry` (trembling, wide eyes). `.fox-peek` fixes it to the bottom-right viewport corner during play. Every game should use the fox as a reacting character: idle in lobby (cheer when a player joins), worried when the timer runs low, happy/cheer on correct, sad on wrong/timeout, cheer-loop on results. Note: never put a `transform` animation on `.screen.active` — it hijacks `position: fixed` children like `.fox-peek` (screen transition is opacity-only for this reason).
- **Slogan:** "Der pensum møter puls" / "Where curriculum meets pulse".

### Colors (all in `brand.css :root`)

```
--aubergine: #2B1338   dark surfaces (header, hero, game backgrounds)
--aubergine-deep: #160A1D
--apricot: #FF9E33     brand accent, CTAs
--cream: #FFF6EC       text on dark
--paper: #FAF7F2       light page background
--ink: #1A1320         text on light
--muted, --line        secondary text, borders
--green / --red / --gold   correct / wrong / scores
--subj-norsk / -english / -matte / -geografi / -historie / -tool   per-subject accents (+ -dim variants)
```

- Landing page: light theme (`body.theme-light`) with dark header/hero band.
- Games: dark theme. Each game sets `--accent: var(--subj-X)` for its subject.

### Typography and UI

- Headings: Syne 800, negative letter-spacing. Body: Schibsted Grotesk. Codes/timers/scores: DM Mono.
- Radii: `--r-sm` 12px, `--r-md` 16px, `--r-lg` 24px. Shadows: `--shadow-sm/md/lg`.
- Avatars: colored circle with initial, color from name hash (`avHtml` in shared.js).
- Icons: inline SVG only. No emoji, no icon libraries.
- Animations: short CSS keyframes (0.2–0.6 s). Respect `prefers-reduced-motion` (confetti and score pops already do).

---

## Language toggle

- Norwegian default, stored in `localStorage` (`clashroom_lang`), handled by `setLang`/`getLang` in shared.js.
- Translatable elements carry `data-no` and `data-en` attributes; the page defines `onLangChange()` that swaps `innerHTML` from the attribute.

---

## Tone of voice

- Casual, direct, energetic. "Gjør deg klar!", not textbook prose. Always "du/dere", never "De".
- Short sentences. Action-first button labels: "Opprett rom", "Bli med", "Start kampen", "Spill igjen".
- No emoji, no hype, no marketing buzzwords. Say what it does.
- Norwegian UI is the default. English only via the toggle or for English-subject games.

---

## When building a new game

1. Copy `mattekampen.html` — it is the reference implementation for the whole multiplayer flow (home → lobby → countdown → game → between → results).
2. Link `brand.css` and `shared.js`. Keep game-specific CSS in an inline `<style>` block as overrides; set `--accent` to the subject color.
3. Never change JS-hooked IDs and classes when restyling — game logic depends on them.
4. Reuse the Firebase room pattern and data model above. If a new game needs new host-written fields, add them to `database.rules.json` under the host-only rule and update the rules in the Firebase console.
5. Question data or generators go at the top of the `<script>` block.
6. Include the `game-header` with `← Clashroom` back link and a `Hopp til innhold` skip link.
7. Keyboard support: Enter submits on inputs, buttons are real `<button>` elements.
8. Test on mobile — students play on phones. `clamp()`, grid, `@media`.
9. Add the game as a card in the `game-grid` on `index.html` with the right `data-subject` and `data-no`/`data-en` texts.
