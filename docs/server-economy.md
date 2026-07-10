# L2 Versus — Economia & Catálogo (fonte para o CMS)

> Extraído do documento de design do servidor (fornecido pelo dono). Guarda o que o **site/CMS** precisa: moedas, Donate Shop, GM Shop, VIP, Olympíada, Boss Coins e roadmap de updates. Detalhes de balance de skills/SA/boss respawn são **server-side** (ficam nos arquivos da rev / Google Docs do dono).

## Moedas
- **Donate Coin (DC)** = moeda de doação real. **Base: 250 DC = 50 €** (≈ 0,20 €/DC). No site a moeda é **VSCOIN** (tratar VSCOIN ≡ Donate Coin).
- **PvP Coin** — ganho em PvP. Trocas: 100 PvP = 500 Greater CP Pot · 1000 PvP = 10.000 Fama · 500 PvP = 1 Donate Coin.
- **Boss Coins** (tiers): Low (Core/Orfen) · Mid (Zaken/Queen Ant) · High (Baium/Antharas) · Top (Valakas/Frintezza).
- **AA (Ancient Adena)** — consumíveis exclusivos: Mana Pot, CP Pot pequena, Greater HP Pot, Dyes +1/-1 e +4/-4, Elixir HP/CP.
- **Adena** — GM Shop de sets/armas base. **Forgotten Coin** — troca por skills Forgotten. **Neolithic** frags (B/A/S/Dynasty) — upgrades de grade.

## Donate Shop (preços em Donate Coin)
- **VIP** (20% XP/SP/Adena + buffs VIP): 1d=20 · 2d=30 · 7d=100 · 15d=150 · 30d=250.
- **Vote Status** (20% XP/SP/Adena 7d) = 50. (Grátis 24h assistindo vídeo TikTok/YT com verificação.)
- **Enchant Assist Armadura**: D=5 · C=10 · B=15 · A=20 · S=25. **Arma**: D=10 · C=15 · B=20 · A=25 · S=30.
- **Runa XP/SP/Adena 20%**: 1h=10 · 2h=15 · 4h=25. **Runa PVE 10%**: 1h=10 · 2h=15 · 4h=25.
- **Doenças Hot Springs reformuladas** (600 cada, ALL-IN-ONE=2000): Malaria(Casting +16%) · Cholera(Accuracy +10) · Rheumatism(Crit +50) · Flu(Atk Spd +16%).
- **Montaria eterna (speed máx)** = 25. **Penitent's Manacle** (pet Sin Eater, remove PK) = 25.
- **Life Stone Box** (76): High 15d=60 · Top 15d=75 · High 30d=100 · Top 30d=120.
- **Liberação de Subclasse** (Hallate/Golkonda/Kernon) = 50.
- **Soulstones**: B=20 · A=50 · S=75 · Dynasty=100 · Icarus=150 · Vesper=250.
- **Reward Box** = 50 (loot aleatório: runas, enchant assist, blessed S, life stones…).

## GM Shop (Adena) — sets & armas por grade
Sets **Heavy/Light/Robe**: C=5kk · B=10kk (grades A/S/S80 Dynasty/S84 Vesper conforme progressão). Joias: B=5kk, A/S/Dynasty. Armas por tipo (1H/2H Blunt, 1H/2H Sword, Dagger, Bow, Fist, Dual, Pole, 1H/2H Magic) das grades C(5kk)/B(10kk) até S84 Vesper. *(Lista completa de nomes/itemIds no doc do servidor + arquivos da rev.)*
- Fists e Daggers: bônus só de remover Shield Defense (tirar Cancel).
- Upgrades: B/MW/+6 (do pack, não-tradeável) → A +0 sem MW; upgrades de grade tiram 3 enchant e mantêm MW (ex.: Vesper +12 → Vesper Noble +9).

## Olympíada
Semanal (1 semana), duração 2h, horário 23:00–01:00. Hero 14 dias. Participantes: item máx +6 grade A (Masterwork).

## Bosses & respawn
- Subclass bosses (Kernon/Hallate/Golkonda): 11:00 e 23:00 (drop; comprável no Donate Shop).
- Nobless: Barakiel 23:00 diário (nobless só matando).
- Grand: Baium/Antharas/Valakas/Zaken/Frintezza/Queen Ant/Core/Orfen (respawn no Google Docs) → dropam Boss Coins por tier.
- Top-ranking: Anakim/Lilith.

## Roadmap de updates (cada ~1,5 mês)
1. **Dynasty** — set/armas/joias Dynasty + área Forgotten Boss Dynasty; boss dropa 1 Neolithic B (100%); arma hero ≈ Dynasty +12.
2. **Icarus** — Dynasty Platinum/Jewel/Satin + armas Icarus + área; Neolithic A; hero ≈ Icarus +12.
3. **Vesper** — set/armas Vesper + área; Neolithic S; hero ≈ Vesper +12.
4. **Vesper Noble** — upgrade Vesper→Noble; hero ≈ Vesper +15.

## Uso no CMS
- **Donate Shop** page: renderizar as categorias acima com preço em VSCOIN; comprar = `economy.debit` + `deliveries.queueDelivery` (item/serviço).
- **VIP** page/section: pacotes 1/2/7/15/30 dias.
- **GM Shop** page: informativo (preços em Adena) — compra é in-game, mas o site pode listar como catálogo/vitrine.
- Item ids reais: puxar dos arquivos da rev (`C:\Users\admin\Desktop\L2Versus soucer`).
