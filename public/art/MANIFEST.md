# public/art — Asset Manifest (L2 Versus)

Game-art assets for the L2 Versus website. Sources are AI-generated (Gemini) files
downloaded to `C:\Users\admin\Downloads\` and **copied** here (originals untouched).

Generated 2026-07-08.

| File | Depicts | Orientation | Dimensions | Suggested site use |
|------|---------|-------------|-----------|--------------------|
| `hero-lineup.png` | "VERSUS" heroes lineup — many L2 characters (dark elf, elves, orc, dwarf, human hero) around a double VERSUS wordmark | Wide (landscape) | 1376×768 | Homepage hero background / main splash |
| `hero-banner.png` | "VERSUS — Lineage II" dragon-knight banner; armored knight with flaming runic sword + dragon shield, siege in background | Wide (landscape) | 1376×768 | Homepage hero background (alt) / features header |
| `logo-versus.png` | Metallic "VERSUS" logo over a ghostly cavalry / knights-on-horseback background | Ultra-wide (landscape) | 1632×640 | Site nav logo / page-top masthead / section divider banner |
| `logo-interlude.png` | Red-flame "LINEAGE II — Interlude — VERSUS / VERSUS SERVER" logo with a red phoenix knight, white background | Square | 1024×1024 | Nav/brand logo, favicon source, loading screen, social/OG image |
| `scene-siege.png` | Massive castle-siege battle — burning fortress, fire-breathing dragon, armies clashing under a red sky | Wide (landscape) | 1376×768 | Rankings/sieges header, "Castle Siege" feature background |
| `scene-duel.png` | Light-knight (gold armor, flaming sword + shield) vs dark-elf warrior (flaming daggers) duel in a lava cave — **WIDE version** | Wide (landscape) | 1408×768 | Feature/section background, "PvP" banner, homepage secondary hero |
| `scene-duel-square.png` | Same light-knight vs dark warrior lava-cave duel — **SQUARE version** (knight has blue-flame sword/shield) | Square | 1024×1024 | Social/OG image, square card, mobile hero crop |
| `scene-lightning.png` | Blue-vs-pink energy clash between dark warrior and golden knight over a fiery runic circle | Wide (landscape) | 1536×672 | Homepage hero background — **NOTE: UI text baked into image** ("BARTZ X7 PTS", "SMARTGUARD", "STRICT SINGLE CLIENT", "EXPLORE FEATURES", "JOIN THE FIGHT") and a checkerboard/transparency area; this is a mockup render, not a clean plate. Regenerate clean or crop before production use. |
| `char-paladin.png` | Phoenix/fire knight portrait — human, gold armor, phoenix shield, full-body flaming sword, dark background | Portrait (tall) | 848×1264 | Character/class showcase, auth side panel, donate/VIP art |
| `char-darkelf.png` | Dark-elf / drow warrior portrait — grey skin, white hair, glowing orange eyes, runic armor, flaming sword | Portrait (tall) | 848×1264 | Character/class showcase, auth side panel (alt), rankings avatar art |
| `auth-hero.png` | **Copy of `char-paladin.png`** — the phoenix/fire knight portrait, chosen as the vertical side-panel art | Portrait (tall) | 848×1264 | Login / register page vertical side panel |
| `register-reference.png` | Design REFERENCE screenshot: login/register mockup — blonde elf woman on left, castle on right, "CREATE A NEW ACCOUNT" form | Wide (landscape) | 1536×688 | Reference only — layout target for building the real register/login page. Not a shippable asset. |
| `clip-greenscreen.mp4` | Short video clip | Video | ~2.3 MB | **GREEN-SCREEN BACKGROUND — must be chroma-keyed / replaced before use.** Do NOT ship as-is. Intended as an animated hero/section overlay once the green is keyed out. |

## Notes & decisions

- **`auth-hero.png` = `char-paladin.png`** (source `Gemini_Generated_Image_ (5).png`). Chosen because it is a
  clean full-body portrait (848×1264) with a strong central hero and dark negative space around the edges — it
  crops well to a tall side panel and leaves room for form text/overlays. Its bright gold/fire focal point reads
  as heroic and welcoming, matching the look already established in `register-reference.png`. `char-darkelf.png`
  is an equally valid alternate if a darker/edgier tone is preferred.
- **Duplicate skipped:** `Gemini_Generated_Image_ (6).png` is a byte-for-byte duplicate of `(5)`
  (identical MD5 F3CC8919) — the same phoenix-knight portrait. Not copied; `char-paladin.png` covers it.
- **Excluded / NOT copied:** `Gemini_Generated_Image_p47yszp47yszp47y.png` (1792×592) is an unrelated
  Portuguese self-help banner ("21 DIAS PARA RECOMEÇAR … Por Emmanuel Bezerra", lavender field) — it belongs to a
  different project and is not an L2 asset, so it was left in Downloads.
- All originals remain in `C:\Users\admin\Downloads\` — nothing was moved or deleted.
- Widescreen plates (`hero-*`, `scene-*` wide, `logo-versus`) are 16:9-ish and suit full-bleed backgrounds.
  Square images suit OG/social cards; portrait images suit character panels.
