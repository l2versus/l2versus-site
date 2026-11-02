/**
 * Conferência do dicionário de CONTEÚDO do códice.
 *
 *   node scripts/auditar-traducao-wiki.mjs            # os três idiomas
 *   node scripts/auditar-traducao-wiki.mjs ru --ver   # lista os suspeitos
 *
 * O `--conferir` do merge é uma porta por LOTE: ele barra marcador perdido e
 * termo de jogo sumido, que são os defeitos fatais. Esta auditoria olha o
 * dicionário INTEIRO e procura o defeito sistemático — o que não aparece
 * numa string isolada e salta quando se olha a distribuição:
 *
 *   - padrão que voltou idêntico ao português quando o português tem palavra
 *     que não é termo de jogo (sinal de lote entregue sem traduzir);
 *   - tradução desproporcional (menos de 40% ou mais de 260% do tamanho do
 *     original) — costuma ser frase truncada ou explicação inventada;
 *   - chave no dicionário que não existe mais no conteúdo (tradução órfã:
 *     não quebra nada, mas indica que o conteúdo mudou e ninguém reviu).
 *
 * Nenhum destes é erro por si só. São a LISTA DE LEITURA — e é por isso que
 * o script devolve 0: ele informa, não reprova. Quem reprova é o merge.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { colher } from "./extrair-padroes-wiki.mjs";
import { GLOSSARIO } from "./juntar-padroes-wiki.mjs";

const DIR = path.join(process.cwd(), "content", "wiki", "i18n");
const IDIOMAS = ["en", "ru", "pl"];

const semTermos = (s) => {
  let r = s;
  for (const t of GLOSSARIO) r = r.split(t).join(" ");
  return r;
};
/* "sobrou português?" — palavra de 4+ letras fora do glossário e fora dos
   marcadores. Sem isso, "Max HP" contaria como texto não traduzido. */
const temPalavra = (s) => /[A-Za-zÀ-ÿ]{4,}/.test(semTermos(s).replace(/\{\d+\}/g, " "));

const alvoIdioma = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;
const verbose = process.argv.includes("--ver");

const lista = await colher();
const totalOc = lista.reduce((a, p) => a + p.oc, 0);
const porPadrao = new Map(lista.map((p) => [p.padrao, p]));

for (const locale of alvoIdioma ? [alvoIdioma] : IDIOMAS) {
  let dic = {};
  try {
    dic = JSON.parse(await readFile(path.join(DIR, `${locale}.json`), "utf8")).padroes ?? {};
  } catch {
    console.log(`\n${locale.toUpperCase()}: sem dicionário.`);
    continue;
  }

  const feitos = lista.filter((p) => dic[p.padrao]);
  const cobertura = feitos.reduce((a, p) => a + p.oc, 0);

  const identicos = feitos.filter((p) => dic[p.padrao] === p.padrao && temPalavra(p.padrao));
  const desproporcionais = feitos.filter((p) => {
    const r = dic[p.padrao].length / Math.max(1, p.padrao.length);
    return p.padrao.length >= 25 && (r < 0.4 || r > 2.6);
  });
  const orfas = Object.keys(dic).filter((k) => !porPadrao.has(k));

  console.log(`\n${locale.toUpperCase()}`);
  console.log(`  cobertura   ${feitos.length}/${lista.length} padrões · ${((cobertura / totalOc) * 100).toFixed(1)}% do texto lido`);
  console.log(`  idênticos   ${identicos.length}  (voltaram em português)`);
  console.log(`  tamanho     ${desproporcionais.length}  (fora de 40%–260% do original)`);
  console.log(`  órfãs       ${orfas.length}  (chave sem par no conteúdo atual)`);

  if (verbose) {
    for (const p of identicos.slice(0, 20)) console.log(`   = ${p.padrao}`);
    for (const p of desproporcionais.slice(0, 20)) {
      console.log(`   ~ PT ${p.padrao}`);
      console.log(`     ${locale.toUpperCase()} ${dic[p.padrao]}`);
    }
    for (const k of orfas.slice(0, 20)) console.log(`   ? ${k}`);
  }
}
console.log("");
