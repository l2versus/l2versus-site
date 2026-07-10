# L2 Versus — Design System ("Obsidiana & Ouro")

> Cinematic dark-fantasy CMS for a Lineage II Interlude+ private server.
> Reference tier: top Russian/CIS L2 agencies (Asterios, RPG-Club, L2Reborn, Averia, E-Global).
> Mood: obsidian black + antique gold, forged-metal, candle-lit, premium. NOT flat, NOT neon, NOT AI-slop.
> Primary language: Portuguese (BR). Secondary: EN. Currency: **VSCOIN**.

---

## 1. Brand & Mood

- **Personality:** ancient, heraldic, expensive. A war banner in a dark cathedral.
- **Feel:** deep black voids, a single warm gold light source, engraved rules, subtle film grain, slow reveals.
- **Anti-patterns to avoid:** purple gradients, pure-white surfaces, Inter/Roboto/Arial, evenly-lit flat cards, generic SaaS layouts.
- **North star:** every screen should look like a collector's edition game manual, not a dashboard.

---

## 2. Color Tokens

| Token | Hex | Role |
|---|---|---|
| `--obsidian` | `#08070A` | Page background (near-black, warm) |
| `--obsidian-2` | `#0C0A10` | Second background layer / body |
| `--panel` | `#121016` | Cards, panels, surfaces |
| `--panel-2` | `#17141C` | Raised surface / hover |
| `--line` | `#2A2530` | Hairline borders, dividers |
| `--gold` | `#C9A24B` | Primary accent (borders, labels, icons) |
| `--gold-bright` | `#F0D488` | Highlights, active text, glow core |
| `--gold-deep` | `#8A6D2E` | Pressed / shadow gold |
| `--parchment` | `#E9E2D0` | Primary text on dark |
| `--muted` | `#A79E93` | Secondary text |
| `--faint` | `#6C6559` | Tertiary text, captions |
| `--crimson` | `#C8433B` | Danger, PK, logout, alerts |
| `--emerald` | `#5EC26A` | Online status, success |

**Signature gradients & glows**
- Gold text/edge sheen: `linear-gradient(180deg, #F0D488, #C9A24B 55%, #8A6D2E)`.
- Hero radial glow: `radial-gradient(60% 50% at 50% 30%, rgba(201,162,75,0.18), transparent 70%)`.
- Panel top-light: `linear-gradient(180deg, rgba(201,162,75,0.06), transparent 40%)`.
- Vignette: page corners darkened with `radial-gradient(120% 120% at 50% 0%, transparent, rgba(0,0,0,0.6))`.
- Global film grain overlay at ~4% opacity (SVG noise or tiled PNG), `mix-blend-mode: overlay`.

---

## 3. Typography

- **Display / headings:** `Cinzel` (classical roman serif, engraved). Weights 500/600/700. UPPERCASE for section kickers, Title Case for H1/H2.
- **Body / UI:** `Barlow` (humanist grotesque). Weights 400/500/600.
- **Numerals (stats/counters):** `Barlow Semi Condensed` 600 for big tabular numbers (online count, rates, timers).

**Scale (rem, desktop)**
| Style | Size | Weight | Tracking | Font |
|---|---|---|---|---|
| Display H1 | 3.5 | 700 | 0.02em | Cinzel |
| H2 | 2.25 | 600 | 0.03em | Cinzel |
| H3 | 1.5 | 600 | 0.04em | Cinzel |
| Kicker/label | 0.72 | 600 | 0.28em UPPER | Barlow |
| Body | 1.0 | 400 | 0 | Barlow |
| Small | 0.82 | 400 | 0.01em | Barlow |
| Stat number | 2.0–3.0 | 600 | -0.01em | Barlow Semi Cond |

- Links/labels: uppercase, wide tracking (`0.2em`), gold on hover.
- Headlines may use the gold sheen gradient as `background-clip: text`.

---

## 4. Spacing, Radius, Elevation

- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px.
- **Container:** max-width `1400px`, side gutters `24–32px`.
- **Section rhythm:** vertical padding `96px` desktop / `56px` mobile; sections separated by a **diamond rule** (a thin gold hairline with a rotated 45° square centered).
- **Radius:** `2px` (sharp, forged). Never pill-round except status dots. Cards `sm` = 2px, buttons 2px.
- **Borders:** 1px `--line`; accented elements get 1px `rgba(201,162,75,0.5)`.
- **Shadows:** avoid soft drop shadows; use inner top-light + gold ring `0 0 0 1px rgba(201,162,75,0.25)` and outer glow `0 0 24px rgba(201,162,75,0.10)` for focus.

---

## 5. Components

### Primary Button (Gold)
Filled gold sheen gradient, obsidian text (`#1A1305`), 2px radius, uppercase 0.18em tracking, crossed-swords or diamond glyph optional. Hover: brighten + gold glow ring. Active: `--gold-deep`.

### Ghost Button
Transparent, 1px gold border, gold-bright text. Hover: `rgba(201,162,75,0.08)` fill.

### Panel / Card
`--panel` bg, 1px `--line` border, top-light gradient, 2px radius, 24px padding. Gold variant adds a 1px gold ring + faint corner filigree.

### Top Nav
Slim, translucent obsidian with backdrop blur, gold wordmark left (diamond glyph + "L2 VERSUS" in Cinzel wide-tracked), nav links uppercase center/right, language switcher + "Painel" (cabinet) CTA on the right. Active link = gold underline hairline.

### Live Status Strip
Full-width band under hero. Cells separated by vertical hairlines: **Servidor** (emerald dot + "Online"), **Jogadores** (live count, big Barlow SemiCond number, subtle count-up animation), **Crônica** ("Interlude+"), **Próx. Evento** (event name + live countdown mm:ss). Multi-server variant: one row per server (x1 / x50) each with its own online count + status.

### Rates Block
Grid of 5–6 tiles (EXP, SP, Adena, Drop, Spoil, Quest). Each tile: big gold number ("x1000"), label kicker, tiny icon. Dark tiles with top-light.

### Events Schedule (signature section)
Title kicker "EVENTOS AUTOMÁTICOS". Cards for **DeathMatch, Team vs Team, Capture the Flag, Hunting Grounds** — each with an icon, short description, reward line, and a horizontal **time-rail** showing the 3 daily runs (e.g. `11:00 · 17:00 · 23:00`) with the next run highlighted in gold + a small countdown. A "próximo agora" ribbon on whichever event is nearest.

### Rankings / Ladder Table
Rich table: rank medal (1/2/3 gold/silver/bronze), character name, **class icon** (real L2 icon), level, clan crest, PvP/PK counts. Zebra rows on `--panel`/`--panel-2`, gold header row, hover row-glow. Tabs: PvP · PK · Clãs · Heróis (Olympiad) · Castelos.

### Badges / Pills
Small uppercase pills: Online (emerald), Offline (faint), VIP (gold), Novo (gold-bright). 2px radius.

### Forms & Modals
Inputs: obsidian field, 1px `--line`, gold focus ring, parchment text, uppercase labels. Modals: obsidian overlay `rgba(4,4,6,0.8)` + blur, centered `--panel` card with gold ring and diamond rule header. Account create / change password / claim are modals (never full-page reloads).

### Countdown Timer
Monospace-ish tabular Barlow SemiCond, gold-bright digits with faint segment separators, label under. Used for next event + grand-opening.

### Cabinet Sidebar Nav (existing app)
Left rail: wordmark, user card (avatar initial, member-since, online dot), icon+label nav (Perfil, Serviços, Pacotes, Loja Donate, Saldo, Indicações, Rankings, Mercado, RMT Market, Depósito, Histórico), logout in crimson at the bottom. Active item: gold left-border + faint gold fill.

---

## 6. Layout Principles

- Cinematic **full-bleed hero** with key-art, dark vignette, radial gold glow, centered wordmark + tagline + dual CTA ("Começar a jogar" gold / "Baixar o client" ghost). Optional grand-opening countdown overlay.
- Generous negative space; content in a 1400px column; occasional **asymmetry** (offset kickers, diagonal diamond rules) to break the grid.
- Consistent **section kicker → H2 → content** rhythm, each section opened by a diamond rule.
- 12-col grid desktop; cards collapse to 1–2 col on mobile. Body never scrolls horizontally.

---

## 7. Imagery & Texture

- Dark L2 dark-fantasy key-art (knights, castles, siege) as hero and section backdrops, always behind a dark gradient scrim so text stays legible.
- Gold filigree corner ornaments on hero/gold panels (subtle, ~15% opacity).
- Diamond (rotated square) motif as the brand glyph and rule centerpiece.
- Film grain + vignette globally for the "printed manual" feel.
- Real L2 item/class icons (already extracted, 9608 mapped) used in shop, rankings, RMT.

---

## 8. Motion / "Wow"

- Hero: slow parallax on key-art + one-time staggered reveal of wordmark → tagline → CTAs → status strip (animation-delay ladder).
- Live online count: count-up on load; gentle pulse on the emerald dot.
- Next-event countdown: live ticking; gold flash when a new event opens.
- Grand-opening countdown (new server): large, front-and-center, days:hh:mm:ss.
- Hover: gold glow ring on buttons/cards; ranking rows light up.
- Section reveals on scroll (fade + 12px rise), respecting `prefers-reduced-motion`.

---

## 9. Homepage Section Order (build target)

1. **Top nav** (translucent, wordmark, links, language, "Painel").
2. **Hero** — key-art, wordmark, tagline "Renasça em Aden", dual CTA, (optional grand-opening countdown).
3. **Live status strip** — servidor / jogadores / crônica / próx. evento (countdown).
4. **Rates** — EXP/SP/Adena/Drop/Spoil/Quest tiles.
5. **Eventos automáticos** — DM / TvT / CTF / HG cards with daily time-rails + next countdown.
6. **Recursos** (features grid) — Auto-Farm, Offline Shops, DressMe, GM Shop, Buffer, Community Board, sem pay-to-win abusivo, anti-bot.
7. **Rankings** preview — top PvP / Heróis / Clãs with class icons.
8. **Economia** — Loja Donate (VSCOIN) + **RMT Market** teaser (venda itens por USD, casa 12%).
9. **Notícias / updates**.
10. **Comunidade** — Discord widget (membros online), redes.
11. **Download** — client + patch, requisitos, passo a passo.
12. **Footer** — colunas (Jogo, Comunidade, Conta, Legal), language, social, © L2 Versus.
