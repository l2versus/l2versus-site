#!/usr/bin/env node
/**
 * JUNTA UM LOTE DE TRADUÇÕES AO DICIONÁRIO, sem reescrever o que já existe.
 *
 *   node scripts/juntar-frases.mjs lote.json
 *
 * O lote tem a forma `{ "pt": {chave: traducao}, "ru": {...}, "pl": {...} }`.
 * Traduzir 1.093 frases × 3 idiomas de uma vez não cabe num passo só, então o
 * dicionário cresce por lotes — e por isso a junção precisa ser idempotente e
 * conservadora: chave já traduzida NÃO é sobrescrita em silêncio (ela pode ter
 * sido revisada à mão), e o que mudar sai no relatório.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const lotePath = process.argv[2];
if (!lotePath) {
  console.error("\n  uso: node scripts/juntar-frases.mjs <lote.json>\n");
  process.exit(1);
}

const lote = JSON.parse(await readFile(lotePath, "utf8"));
const forcar = process.argv.includes("--forcar");

for (const [idioma, frases] of Object.entries(lote)) {
  const arq = path.join(process.cwd(), "content", "wiki", "skills-i18n", `${idioma}.json`);
  let doc;
  try {
    doc = JSON.parse(await readFile(arq, "utf8"));
  } catch {
    doc = { idioma, frases: {} };
  }
  doc.frases ??= {};

  let novas = 0;
  let trocadas = 0;
  let iguais = 0;
  for (const [chave, valor] of Object.entries(frases)) {
    if (!valor) continue;
    const antes = doc.frases[chave];
    if (antes === undefined) {
      doc.frases[chave] = valor;
      novas++;
    } else if (antes === valor) {
      iguais++;
    } else if (forcar) {
      doc.frases[chave] = valor;
      trocadas++;
    } else {
      iguais++;
    }
  }

  /* chaves em ordem alfabética: o diff do git fica legível quando o lote
     seguinte entrar no meio do arquivo em vez de no fim */
  const ordenado = Object.fromEntries(
    Object.entries(doc.frases).sort(([a], [b]) => a.localeCompare(b))
  );
  await writeFile(
    arq,
    JSON.stringify({ idioma, frases: ordenado }, null, 1) + "\n",
    "utf8"
  );
  console.log(
    `  ${idioma}  +${novas} novas, ${trocadas} trocadas, ${iguais} mantidas  →  ${Object.keys(ordenado).length} no total`
  );
}
