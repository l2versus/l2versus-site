#!/usr/bin/env node
/**
 * LEVANTA AS FRASES A TRADUZIR, por frequência.
 *
 *   node scripts/extrair-frases-skill.mjs            # relatório de cobertura
 *   node scripts/extrair-frases-skill.mjs --esqueleto > frases.json
 *
 * A ordem importa: traduzir a frase que aparece 2.600 vezes antes da que
 * aparece uma vez é o que faz a página virar português cedo. O relatório diz
 * exatamente quantas frases são precisas para cobrir 80%, 90%, 95% e 99% das
 * ocorrências — sem isso, "traduzir as skills" é um poço sem fundo.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { chavear, emFrases } from "../lib/wiki/frases-skill.mjs";

const arq = path.join(process.cwd(), "content", "wiki", "classe-skills-cliente.json");
const d = JSON.parse(await readFile(arq, "utf8"));

/* Conta OCORRÊNCIAS no texto que o jogador vê: uma frase que aparece em 37
   graus da mesma skill foi lida 37 vezes. É esse o peso que interessa. */
const freq = new Map();
const exemplo = new Map();
let totalFrases = 0;
const descricoes = new Set();

for (const c of Object.values(d.classes)) {
  for (const s of c.skills) {
    for (const g of s.graus) {
      if (!g.d) continue;
      descricoes.add(g.d);
      for (const f of emFrases(g.d)) {
        const { chave } = chavear(f);
        freq.set(chave, (freq.get(chave) ?? 0) + 1);
        if (!exemplo.has(chave)) exemplo.set(chave, f);
        totalFrases++;
      }
    }
  }
}

const ordenado = [...freq.entries()].sort((a, b) => b[1] - a[1]);

if (process.argv.includes("--esqueleto")) {
  /* esqueleto do dicionário: chave em inglês → "" para preencher */
  const saida = {};
  for (const [chave] of ordenado) saida[chave] = "";
  console.log(JSON.stringify(saida, null, 2));
  process.exit(0);
}

const corte = (p) => {
  let soma = 0;
  for (let i = 0; i < ordenado.length; i++) {
    soma += ordenado[i][1];
    if (soma / totalFrases >= p) return i + 1;
  }
  return ordenado.length;
};

console.log(`
  FRASES DE SKILL — o que traduzir primeiro

  descrições distintas      ${descricoes.size.toLocaleString("pt-BR")}
  ocorrências de frase      ${totalFrases.toLocaleString("pt-BR")}
  frases distintas          ${ordenado.length.toLocaleString("pt-BR")}

  para cobrir 50% do texto lido   ${corte(0.5)} frases
  para cobrir 80%                 ${corte(0.8)} frases
  para cobrir 90%                 ${corte(0.9)} frases
  para cobrir 95%                 ${corte(0.95)} frases
  para cobrir 99%                 ${corte(0.99)} frases
  para cobrir 100%                ${ordenado.length} frases

  AS 20 MAIS LIDAS
`);
for (const [chave, n] of ordenado.slice(0, 20)) {
  console.log(`  ${String(n).padStart(5)}  ${chave.slice(0, 100)}`);
}
console.log(`
  AS 5 MENOS LIDAS (a cauda longa)
`);
for (const [chave, n] of ordenado.slice(-5)) {
  console.log(`  ${String(n).padStart(5)}  ${chave.slice(0, 100)}`);
}
console.log("");
