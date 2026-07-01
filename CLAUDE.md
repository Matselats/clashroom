# Clashroom

Clashroom (clashroom.dev) is a free game-based learning platform for Norwegian middle school teachers (ungdomsskolen, 8.–10. trinn). Built by a teacher, for teachers. Launching fall 2026.

**Mission:** The best teaching tools cost money. The free alternatives are outdated or bad. Clashroom fills the gap — no login, no download, no cost. Just share the link.

---

## What's been built

### Games (8 live)

| Game | Subject | Type | File | Mechanic |
|------|---------|------|------|----------|
| **Stavekrig** | Norsk | Multiplayer | `stavekrig.html` | Translate bokmål → nynorsk. 10 words, 15 sec each. Streak bonuses. |
| **Ordjakten** | Norsk | Multiplayer | `ordjakten.html` | Find correct synonym among alternatives. 20 words, 12 sec each. |
| **Grammar Duel** | English | Multiplayer | `grammarduell.html` | Choose correct grammar (articles, tenses). 20 Qs, 10 sec. Fastest steals points. |
| **Word Heist** | English | Multiplayer | `wordheist.html` | Translate Norwegian → English. 15 rounds, 12 sec. Correct answer steals 30 pts from every other player. |
| **Clashroom Detective** | English | Solo | `detective.html` | 5 progressive mystery cases. Read case files, click highlighted text to collect clues, answer MC questions. Timer + rank system. |
| **Math Blitz** | Matte | Multiplayer | `mathblitz.html` | Mental arithmetic. 20 problems, 10 sec. Grade selector (8./9./10. trinn). |
| **Flaggquiz** | Geografi | Multiplayer | `flaggquiz.html` | Recognize flags from 40 countries. 20 questions, 10 sec each. |
| **Tidslinjen** | Historie | Multiplayer | `tidslinjen.html` | "Which year?" — Norgeshistorie or verdenshistorie. 20 questions. Categories: Blandet, Norgeshistorie, Verdenshistorie. |

### Teacher tools (2 live)

| Tool | File | Purpose |
|------|------|---------|
| **Klassekart** | `klassekart.html` | Paste student names → random seating chart. Layouts: Par, Rader, Grupper. Set constraints for who can't sit together. Print-friendly. |
| **Klassetimer** | `timer.html` | Fullscreen countdown for smartboard. Three modes: Arbeidsøkt, Gruppearbeid, Prøve. Presets (5–30 min) or custom. |

### Landing page

`index.html` — Lists all games and tools. Norwegian by default with NO/EN language toggle. Sections: hero, games grid, teacher tools, "why we build this", CTA.

---

## Tech stack

- **Architecture:** Each page is a single self-contained HTML file. All CSS and JS are inline. No build step, no bundler, no framework, no npm.
- **External dependencies:** Google Fonts only (loaded via `@import`).
- **Fonts:** Syne (headings, weight 700–800), DM Sans (body text, weight 400–600), DM Mono (monospace accents — timers, scores).
- **Backend:** None. Multiplayer is local — all players share the same page instance on one device (teacher's screen), or each player opens the same URL on their own device and the game runs independently.
- **Hosting:** Static files on clashroom.dev.
- **No databases, no APIs, no auth, no cookies.**

---

## File structure

Every game file follows the same pattern:

```
<!DOCTYPE html>
<html lang="no">
<head>
  <style>
    /* All CSS inline — variables, components, animations, responsive */
  </style>
</head>
<body>
  <!-- Multiple .screen divs, toggled via .active class -->
  <div class="screen active" id="screen-role">...</div>
  <div class="screen" id="screen-lobby">...</div>
  <div class="screen" id="screen-countdown">...</div>
  <div class="screen" id="screen-game">...</div>
  <div class="screen" id="screen-between">...</div>
  <div class="screen" id="screen-results">...</div>

  <script>
    /* All JS inline — word banks/data, state object, game logic, rendering */
  </script>
</body>
</html>
```

### Multiplayer input patterns

Two patterns exist for how players join:

1. **Join pattern** (Stavekrig, Ordjakten, Grammar Duel, Word Heist): Teacher/student role toggle → enter name → join lobby → teacher presses Start.
2. **Paste pattern** (Flaggquiz, Tidslinjen): Teacher pastes all player names (one per line) into a textarea → press Start. Simpler, faster setup.

### Common code patterns

- Screen management: `showScreen(id)` toggles `.active` on `.screen` divs.
- State: single `state` object holds everything (role, players, scores, round, timer).
- Colors: player avatars use a hash function to pick a deterministic color from a palette.
- Timer: `setInterval` countdown with circular SVG ring or progress bar.
- Scoring: base points + time bonus (faster answer = more points). Some games add streak bonuses or steal mechanics.
- Results: podium (🥇🥈🥉) + full scoreboard sorted by score.

---

## Design principles

1. **One file = one tool.** No shared dependencies, no imports between files. Every page must work if you open it alone in a browser.
2. **Zero friction.** No login, no signup, no download, no install. Share a link, open it, play.
3. **Teacher-first.** The teacher controls the game flow (start, settings). Students just join and play.
4. **Mobile-ready.** Every game works on phones, tablets, and smartboards. Use `clamp()`, flexbox/grid, and `@media` for responsiveness.
5. **Fast to build.** Inline everything. No build tooling overhead. Ship a new game by writing one HTML file.
6. **Accessibility basics.** Skip-to-content links (`Hopp til innhold`), semantic HTML, keyboard support (Enter to submit answers).
7. **Language toggle.** Newer pages have a NO/EN toggle. Norwegian is always the default.

---

## Visual design

### Color system

Games use a dark theme. The landing page uses a lighter theme.

```
--ink: #0f0f1a or #1a1a2e    (dark background)
--paper: #f0ede6 or #f7f5f0  (light text)
--accent: varies per game     (red #e63946, amber #f5a623, pink #e63a8a, etc.)
--green: #2a9d5c             (correct answers, success)
--red: #e63946               (wrong answers, urgency)
--gold: #f4a832 or #f5a623   (scores, leaders, timers)
--muted: #6b6b80 or #8a8a9a  (secondary text)
--card: #1a1a2e              (card backgrounds)
--border: rgba(255,255,255,0.08) (subtle borders)
```

### Typography

- **Headings:** Syne, weight 800, negative letter-spacing (-0.03em to -0.05em), line-height 1.0–1.1. Use `<em>` with accent color for emphasis (no italic).
- **Body:** DM Sans, weight 400–600, line-height 1.5–1.65.
- **Monospace accents:** DM Mono for timers, scores, counters, labels.

### UI patterns

- **Border radius:** 10–20px for cards, 8–12px for buttons/inputs, 20px for pills/badges.
- **Cards:** dark background, 1px translucent border, rounded corners.
- **Buttons:** full-width, 12–14px radius, bold font, subtle hover (opacity + translateY).
- **Avatars:** colored circle with initial letter, color derived from name hash.
- **Animations:** `fadeUp`, `slideIn`, `popIn`, `pulse` — all CSS keyframes, short durations (0.2–0.5s).
- **Icons:** emoji only. No SVG icon library.
- **Feedback:** colored banners — green for correct, red for wrong, amber/neutral for timeout.

---

## Tone of voice

### Norwegian UI text

- **Casual, encouraging, energetic.** Write like a teacher who's excited about the game, not like a textbook.
- **Use "du/dere"** (informal you), never "De" (formal).
- **Short sentences.** "Gjør deg klar!" not "Vennligst forbered deg på at spillet snart starter."
- **Emoji in context** — as visual markers in buttons and labels, not decoratively in prose.
- Game titles are punchy, one or two words: Stavekrig, Ordjakten, Flaggquiz, Tidslinjen.
- Button labels are action-first: "Bli med →", "Start spillet", "Spill igjen 🔄".

### English UI text

- Same energy as Norwegian — short, direct, playful.
- "Play now", "Join the heist →", "Next Case →".
- Avoid formal/academic tone. This is a game, not an exam.

### Landing page / marketing

- Teacher-to-teacher tone. "Vi bygger gratis klasseromsspill" — we, not the company.
- Honest about status: "Clashroom er ikke ferdig. Men alt du ser her fungerer allerede."
- No hype, no buzzwords. Just say what it does.

---

## When building new games

1. Copy an existing game file as a starting point. Stavekrig or Grammar Duel are good templates for multiplayer games.
2. Keep all CSS and JS inline in the single HTML file.
3. Use the same screen-based flow: role select → lobby → countdown → game → between rounds → results.
4. Include a `← Tilbake til Clashroom` link back to `index.html`.
5. Add a `Hopp til innhold` skip link and a language toggle if applicable.
6. Use Syne + DM Sans + DM Mono fonts. Stay on the dark theme.
7. Add the new game to `index.html` in the games grid.
8. Word banks / question data go in a JS array at the top of the `<script>` block.
9. Test on mobile — many students will play on their phones.
10. Keep the Norwegian UI as default. English UI only for English-subject games.

---

## When building new teacher tools

1. Teacher tools don't need the lobby/multiplayer flow. They're single-user utilities.
2. Same visual language — dark theme, Syne headings, DM Sans body.
3. Include print-friendly output where relevant (`@media print`).
4. Add to the "Lærerverktøy" section on `index.html`.
