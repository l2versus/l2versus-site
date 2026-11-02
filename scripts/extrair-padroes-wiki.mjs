/**
 * Extrai os PADRÕES traduzíveis do conteúdo do códice.
 *
 *   node scripts/extrair-padroes-wiki.mjs                 # relatório
 *   node scripts/extrair-padroes-wiki.mjs --lote pt 1 120 # fatia para traduzir
 *
 * A saída sai ordenada por FREQUÊNCIA, e isso é a decisão central: com 1.755
 * padrões, traduzir na ordem do arquivo cobriria o alfabeto; traduzir na
 * ordem da frequência cobre o que o jogador lê. Os 400 primeiros valem 85%
 * do texto exibido — o resto é cauda de uma ocorrência cada.
 *
 * Padrão sem nenhuma letra ("+5%", "177", "0.3975/0.1988") não entra: não há
 * o que traduzir e pedir isso a um tradutor é convidar erro de número.
 */
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { normalizar, CAMPOS_INTOCADOS } from "../lib/wiki/frases-conteudo.mjs";

const RAIZ = process.cwd();
const DIR = path.join(RAIZ, "content", "wiki");
const DIR_I18N = path.join(DIR, "i18n");

/* `classe-*.json` fica de fora: a árvore de classes e o grimório de skills
   têm pipeline próprio (classes-ui / skills-i18n). Misturar os dois
   dicionários faria uma mesma frase ser traduzida em dois lugares e divergir. */
const ehFamilia = (f) => f.endsWith(".json") && !f.startsWith("classe-");

export async function colher() {
  const padroes = new Map(); // padrao -> { oc, exemplo, campos:Set }
  const anota = (campo, valor) => {
    if (CAMPOS_INTOCADOS.has(campo)) return;
    if (typeof valor !== "string" || !valor.trim()) return;
    const { padrao } = normalizar(valor);
    if (!/[A-Za-zÀ-ÿ]{2}/.test(padrao)) return; // só número/símbolo
    const r = padroes.get(padrao) ?? { oc: 0, exemplo: valor, campos: new Set() };
    r.oc++;
    r.campos.add(campo);
    padroes.set(padrao, r);
  };

  for (const f of (await readdir(DIR)).filter(ehFamilia)) {
    const j = JSON.parse(await readFile(path.join(DIR, f), "utf8"));
    anota("resumo", j.contexto?.resumo);
    anota("regraDuplicata", j.contexto?.regraDuplicata);
    for (const t of j.contexto?.tiers ?? []) anota("comoObter", t.comoObter);
    for (const n of j.comoLer ?? []) {
      anota("notaTitulo", n.titulo);
      anota("notaTexto", n.texto);
    }
    for (const e of j.entradas ?? []) {
      for (const k of ["subtitulo", "slot", "notaCliente", "notaFonte", "prosa"]) anota(k, e[k]);
      for (const lado of ["antes", "agora"])
        for (const ef of e[lado] ?? []) {
          anota("rotulo", ef.rotulo);
          anota("valor", ef.valor);
        }
    }
  }

  return [...padroes]
    .map(([padrao, r]) => ({ padrao, oc: r.oc, campos: [...r.campos] }))
    /* desempate alfabético: sem ele a ordem de dois padrões de mesma
       frequência muda entre execuções e o "lote 3" de ontem não é o de hoje */
    .sort((a, b) => b.oc - a.oc || a.padrao.localeCompare(b.padrao, "pt"));
}

async function lerDic(locale) {
  try {
    const t = await readFile(path.join(DIR_I18N, `${locale}.json`), "utf8");
    return JSON.parse(t).padroes ?? {};
  } catch {
    return {};
  }
}

/* CLI só quando este arquivo É o programa. Sem a guarda, `fatiar` importa
   `colher` e leva junto o relatório inteiro impresso no meio da saída dele. */
const ehPrograma =
  process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`;

if (ehPrograma) {
const args = process.argv.slice(2);
const lista = await colher();
const total = lista.reduce((a, p) => a + p.oc, 0);

if (args[0] === "--lote") {
  const [, locale, deStr, ateStr] = args;
  const dic = await lerDic(locale);
  const faltam = lista.filter((p) => !dic[p.padrao]);
  const de = Number(deStr ?? 1);
  const ate = Number(ateStr ?? faltam.length);
  const fatia = faltam.slice(de - 1, ate);
  console.log(JSON.stringify(fatia.map((p) => p.padrao), null, 1));
  console.error(`# ${locale}: ${faltam.length} padrões sem tradução; devolvendo ${fatia.length} (${de}..${ate})`);
} else if (args[0] === "--json") {
  await mkdir(DIR_I18N, { recursive: true });
  const destino = path.join(DIR_I18N, "_padroes.json");
  await writeFile(destino, JSON.stringify({ total, padroes: lista }, null, 1), "utf8");
  console.log(`${lista.length} padrões → ${path.relative(RAIZ, destino)}`);
} else {
  console.log(`padrões distintos: ${lista.length} | ocorrências: ${total}`);
  let acc = 0;
  for (let i = 0; i < lista.length; i++) {
    acc += lista[i].oc;
    if ([50, 100, 200, 300, 400, 600, 900, 1200].includes(i + 1))
      console.log(`  ${String(i + 1).padStart(5)} padrões → ${((acc / total) * 100).toFixed(1)}% do texto lido`);
  }
  for (const l of ["en", "ru", "pl"]) {
    const dic = await lerDic(l);
    const feitos = lista.filter((p) => dic[p.padrao]);
    const cob = feitos.reduce((a, p) => a + p.oc, 0);
    console.log(
      `  ${l}: ${feitos.length}/${lista.length} padrões · ${((cob / total) * 100).toFixed(1)}% do texto lido`
    );
  }
}
}
