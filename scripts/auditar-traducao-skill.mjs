#!/usr/bin/env node
/**
 * QUANTO DO TEXTO DE SKILL JÁ ESTÁ TRADUZIDO, por idioma.
 *
 *   node scripts/auditar-traducao-skill.mjs              # cobertura
 *   node scripts/auditar-traducao-skill.mjs --faltam pt  # o que falta, em ordem
 *
 * Mede DUAS coisas diferentes, e as duas importam:
 *
 *   · cobertura de FRASES — quantas das 1.093 entradas do dicionário existem;
 *   · cobertura de LEITURA — quantas das ocorrências que o jogador realmente
 *     lê caem em frase traduzida.
 *
 * A segunda é sempre maior, porque as frases mais comuns são traduzidas
 * primeiro. É ela que diz se a página "parece" em português; a primeira diz
 * quanto trabalho ainda há. Olhar só uma das duas engana nos dois sentidos.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { chavear, emFrases } from "../lib/wiki/frases-skill.mjs";

const IDIOMAS = ["pt", "ru", "pl"];

const d = JSON.parse(
  await readFile(path.join(process.cwd(), "content", "wiki", "classe-skills-cliente.json"), "utf8")
);

/* frequência de cada frase no texto que o jogador vê */
const freq = new Map();
for (const c of Object.values(d.classes)) {
  for (const s of c.skills) {
    for (const g of s.graus) {
      if (!g.d) continue;
      for (const f of emFrases(g.d)) {
        const { chave } = chavear(f);
        freq.set(chave, (freq.get(chave) ?? 0) + 1);
      }
    }
  }
}
const totalFrases = freq.size;
const totalLeituras = [...freq.values()].reduce((a, b) => a + b, 0);

const alvo = process.argv.includes("--faltam")
  ? process.argv[process.argv.indexOf("--faltam") + 1]
  : null;

console.log(`
  TRADUÇÃO DAS SKILLS — ${totalFrases.toLocaleString("pt-BR")} frases, ${totalLeituras.toLocaleString("pt-BR")} ocorrências
`);

for (const idioma of IDIOMAS) {
  let dic = {};
  try {
    dic =
      JSON.parse(
        await readFile(
          path.join(process.cwd(), "content", "wiki", "skills-i18n", `${idioma}.json`),
          "utf8"
        )
      ).frases ?? {};
  } catch {
    /* idioma sem dicionário: 0% e segue */
  }

  let frasesOk = 0;
  let leiturasOk = 0;
  const faltam = [];
  for (const [chave, n] of freq) {
    if (dic[chave]) {
      frasesOk++;
      leiturasOk += n;
    } else {
      faltam.push([chave, n]);
    }
  }

  const pf = ((frasesOk / totalFrases) * 100).toFixed(1);
  const pl = ((leiturasOk / totalLeituras) * 100).toFixed(1);
  console.log(
    `  ${idioma}   frases ${String(frasesOk).padStart(5)}/${totalFrases}  (${pf.padStart(5)}%)` +
      `    texto lido ${pl.padStart(5)}%`
  );

  if (alvo === idioma) {
    faltam.sort((a, b) => b[1] - a[1]);
    console.log(`\n  --- faltam em ${idioma}, da mais lida para a menos ---\n`);
    for (const [chave, n] of faltam) console.log(`${n}\t${chave}`);
  }
}

/* chaves no dicionário que não existem mais no pacote: tradução órfã, sinal
   de que o texto do servidor mudou e a entrada ficou para trás */
for (const idioma of IDIOMAS) {
  try {
    const dic =
      JSON.parse(
        await readFile(
          path.join(process.cwd(), "content", "wiki", "skills-i18n", `${idioma}.json`),
          "utf8"
        )
      ).frases ?? {};
    const orfas = Object.keys(dic).filter((k) => !freq.has(k));
    if (orfas.length) {
      console.log(`\n  ! ${idioma}: ${orfas.length} traduções órfãs (frase não existe mais no pacote)`);
      for (const o of orfas.slice(0, 5)) console.log(`      ${o.slice(0, 90)}`);
    }
  } catch {
    /* sem dicionário, sem órfãs */
  }
}
console.log("");
