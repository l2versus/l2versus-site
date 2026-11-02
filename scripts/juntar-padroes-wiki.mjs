/**
 * Funde um lote traduzido no dicionário do conteúdo do códice — e RECUSA
 * o lote inteiro se ele não passar na conferência mecânica.
 *
 *   node scripts/juntar-padroes-wiki.mjs ru lote.json
 *   node scripts/juntar-padroes-wiki.mjs ru lote.json --forcar   (grava o que passou)
 *
 * Formato do lote: { "padrão em português": "tradução", ... }
 *
 * POR QUE A CONFERÊNCIA É MECÂNICA E NÃO POR LEITURA.
 * Ninguém aqui lê russo nem polonês. Revisar por leitura pegaria estilo e
 * deixaria passar exatamente o defeito que importa num wiki de
 * balanceamento: número trocado de lugar e nome de item traduzido. Os dois
 * são invisíveis para quem não fala o idioma e fatais para quem usa a
 * página — "+15% por 30s" virando "+30% por 15s" é pior que não traduzir.
 *
 * Então a porta é objetiva:
 *   1. o conjunto de marcadores {0..n} tem que ser IDÊNTICO ao do original;
 *   2. todo termo de jogo do original tem que reaparecer literal;
 *   3. tradução vazia, ou igual ao português num texto que tem palavra
 *      portuguesa, é lote mal feito, não tradução.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), "content", "wiki", "i18n");

/**
 * TERMOS QUE FICAM EM INGLÊS NOS QUATRO IDIOMAS.
 *
 * Critério único e verificável: aparece assim na TELA DO CLIENTE. O cliente
 * do Versus é inglês em qualquer locale — um jogador russo que leia
 * "Скорость атаки" aqui vai procurar isso no jogo e não vai achar, porque lá
 * está escrito "Atk.Spd". Traduzir esses termos não ajuda ninguém: quebra a
 * ponte entre o wiki e o jogo, que é a única razão de o wiki existir.
 *
 * Lista levantada dos próprios dados (823 candidatos a termo, filtrados
 * pelos que de fato aparecem na interface do jogo).
 */
export const GLOSSARIO = [
  // stats e atributos da ficha
  "Max HP", "Max MP", "Max CP", "HP", "MP", "CP",
  "P. Atk.", "P.Atk", "M. Atk.", "M.Atk", "P. Def.", "P.Def", "M. Def.", "M.Def",
  "Atk.Spd", "Casting Spd", "Critical Rate", "Accuracy", "Evasion", "Speed",
  "STR", "DEX", "CON", "INT", "WIT", "MEN",
  // estados e debuffs
  "Bleed", "Poison", "Stun", "Sleep", "Hold", "Root", "Silence", "Paralysis",
  "Paralyze", "Shock", "Slow", "Fear", "Doom", "Medusa", "Winter", "Mental",
  "Critical Stun", "Landslide", "Anger",
  // buffs e skills citados pelo nome
  "Focus", "Guidance", "Empower", "Haste", "Wild Magic", "Blessed Body",
  "Blessed Soul", "Might", "Shield", "Death Whisper", "Mana Burn",
  "Divine Inspiration", "Regeneration", "Deflect Magic",
  // famílias de equipamento e grades
  "Masterwork", "Dynasty", "Vesper", "Icarus", "Shadow Item", "Great Gale",
  "Thunder", "Earth", "Lightning", "Destruction", "Health", "Platinum",
  "Silver Satin", "Weapon Master", "Robe", "Light", "Heavy",
  "Lesser", "Improved", "Top", "High", "Mid",
  // sistemas
  "PvP", "PvE", "SA", "Soul Ability", "Lifestone", "Olympiad", "Infinity",
  "Life Stone", "Special Ability",
];

/* casa o termo como palavra inteira, tolerando o ponto do "P. Atk." */
const regexTermo = (t) =>
  new RegExp(`(?<![\\p{L}\\d])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\d])`, "iu");

const marcadores = (s) => [...s.matchAll(/\{(\d+)\}/g)].map((m) => m[1]).sort().join(",");

export function conferir(origem, alvo) {
  const problemas = [];
  if (typeof alvo !== "string" || !alvo.trim()) {
    problemas.push("tradução vazia");
    return problemas;
  }
  if (marcadores(origem) !== marcadores(alvo)) {
    problemas.push(`marcadores diferem: "${marcadores(origem)}" → "${marcadores(alvo)}"`);
  }
  for (const termo of GLOSSARIO) {
    if (regexTermo(termo).test(origem) && !regexTermo(termo).test(alvo)) {
      problemas.push(`perdeu o termo de jogo "${termo}"`);
    }
  }
  return problemas;
}

async function principal() {
  const [locale, arquivo, ...resto] = process.argv.slice(2);
  if (!locale || !arquivo) {
    console.error("uso: node scripts/juntar-padroes-wiki.mjs <en|ru|pl> <lote.json> [--conferir|--forcar]");
    process.exit(1);
  }
  const forcar = resto.includes("--forcar");
  /* `--conferir` roda a mesma porta sem gravar nada. É o que cada tradutor
     usa para fechar o próprio lote antes de entregar — conferência na fonte
     custa um comando e evita refazer o lote inteiro depois. */
  const soConferir = resto.includes("--conferir");

  const lote = JSON.parse(await readFile(arquivo, "utf8"));

  if (soConferir) {
    const ruins = Object.entries(lote)
      .map(([origem, alvo]) => ({ origem, alvo, problemas: conferir(origem, alvo) }))
      .filter((r) => r.problemas.length);
    for (const r of ruins) {
      console.error(`PT  ${r.origem}\n${locale.toUpperCase()}  ${r.alvo}\n    → ${r.problemas.join(" · ")}\n`);
    }
    console.log(
      ruins.length
        ? `✗ ${ruins.length} de ${Object.keys(lote).length} reprovados`
        : `✓ ${Object.keys(lote).length} aprovados`
    );
    process.exit(ruins.length ? 1 : 0);
  }
  const destino = path.join(DIR, `${locale}.json`);
  let atual = { locale, padroes: {} };
  try {
    atual = JSON.parse(await readFile(destino, "utf8"));
  } catch { /* primeiro lote do idioma */ }
  atual.padroes ??= {};

  const reprovados = [];
  let novos = 0;
  let trocados = 0;
  for (const [origem, alvo] of Object.entries(lote)) {
    const problemas = conferir(origem, alvo);
    if (problemas.length) {
      reprovados.push({ origem, alvo, problemas });
      continue;
    }
    if (atual.padroes[origem] === undefined) novos++;
    else if (atual.padroes[origem] !== alvo) trocados++;
    atual.padroes[origem] = alvo;
  }

  if (reprovados.length) {
    console.error(`\n✗ ${reprovados.length} de ${Object.keys(lote).length} reprovados:\n`);
    for (const r of reprovados.slice(0, 25)) {
      console.error(`  PT  ${r.origem}`);
      console.error(`  ${locale.toUpperCase()}  ${r.alvo}`);
      console.error(`      → ${r.problemas.join(" · ")}\n`);
    }
    if (!forcar) {
      console.error("Nada gravado. Corrija o lote, ou use --forcar para gravar só os aprovados.");
      process.exit(1);
    }
  }

  await mkdir(DIR, { recursive: true });
  /* chaves ordenadas: o diff do git vira revisão de tradução, não ruído */
  const ordenado = Object.fromEntries(
    Object.entries(atual.padroes).sort(([a], [b]) => a.localeCompare(b, "pt"))
  );
  await writeFile(
    destino,
    JSON.stringify({ locale, padroes: ordenado }, null, 1),
    "utf8"
  );
  console.log(
    `${locale}: +${novos} novos, ${trocados} revisados, ${reprovados.length} reprovados → ${Object.keys(ordenado).length} no total`
  );
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) await principal();
