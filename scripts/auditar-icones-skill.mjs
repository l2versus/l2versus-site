#!/usr/bin/env node
/**
 * AUDITORIA DOS ÍCONES DE SKILL — procura placeholder, não arquivo faltando.
 *
 *   node scripts/auditar-icones-skill.mjs
 *
 * `preparar-skills-cliente.mjs` já garante que todo `icone` tem PNG. Isso não
 * garante que o PNG seja o ícone CERTO: quando o extrator não acha a textura
 * dentro do .utx do cliente, ele grava mesmo assim — e o que sai é o magenta
 * de "textura ausente" do motor da Unreal, ou um quadrado liso.
 *
 * Um 404 aparece na hora. Um quadrado magenta passa por ícone e fica no ar.
 * Foi assim que a War Frenzy chegou à grade parecendo um borrão roxo.
 *
 * Decodifica os PNGs na mão (todos são 8-bit RGB, não-interlaçados: 3 bytes
 * por pixel) porque o site não tem — e não precisa ter — biblioteca de imagem.
 */

import { readdir, readFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import path from "node:path";

const PASTA = path.join(process.cwd(), "public", "skills");

/** Lê largura, altura e os pixels RGB de um PNG 8-bit colorType 2. */
function decodificar(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("não é PNG");
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const prof = buf.readUInt8(24);
  const tipo = buf.readUInt8(25);
  const entrelace = buf.readUInt8(28);
  if (prof !== 8 || tipo !== 2 || entrelace !== 0) {
    throw new Error(`formato inesperado (${prof}bit/ct${tipo}/il${entrelace})`);
  }

  /* junta todos os IDAT: um PNG pode fatiar o fluxo em vários chunks */
  const pedacos = [];
  let p = 8;
  while (p < buf.length) {
    const tam = buf.readUInt32BE(p);
    const nome = buf.toString("ascii", p + 4, p + 8);
    if (nome === "IDAT") pedacos.push(buf.subarray(p + 8, p + 8 + tam));
    if (nome === "IEND") break;
    p += 12 + tam;
  }
  const cru = inflateSync(Buffer.concat(pedacos));

  /* desfiltra linha a linha (filtros 0..4 do PNG) */
  const bpp = 3;
  const passo = w * bpp;
  const saida = Buffer.alloc(h * passo);
  for (let y = 0; y < h; y++) {
    const filtro = cru[y * (passo + 1)];
    const linha = cru.subarray(y * (passo + 1) + 1, y * (passo + 1) + 1 + passo);
    for (let x = 0; x < passo; x++) {
      const a = x >= bpp ? saida[y * passo + x - bpp] : 0;
      const b = y > 0 ? saida[(y - 1) * passo + x] : 0;
      const c = x >= bpp && y > 0 ? saida[(y - 1) * passo + x - bpp] : 0;
      let v = linha[x];
      if (filtro === 1) v += a;
      else if (filtro === 2) v += b;
      else if (filtro === 3) v += (a + b) >> 1;
      else if (filtro === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a);
        const pb = Math.abs(pp - b);
        const pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      saida[y * passo + x] = v & 0xff;
    }
  }
  return { w, h, px: saida };
}

/** Magenta de textura ausente da Unreal: vermelho e azul altos, verde baixo. */
const magenta = (r, g, b) => r > 170 && b > 170 && g < 100;

const arquivos = (await readdir(PASTA)).filter((f) => f.endsWith(".png")).sort();

const suspeitos = [];
const quebrados = [];

for (const f of arquivos) {
  let img;
  try {
    img = decodificar(await readFile(path.join(PASTA, f)));
  } catch (e) {
    quebrados.push({ f, erro: e.message });
    continue;
  }

  const total = img.w * img.h;
  let rosa = 0;
  const cores = new Set();
  let soma = 0;
  for (let i = 0; i < img.px.length; i += 3) {
    const r = img.px[i];
    const g = img.px[i + 1];
    const b = img.px[i + 2];
    if (magenta(r, g, b)) rosa++;
    /* quantiza em 32 níveis: ícone de verdade tem dezenas de tons, um
       quadrado chapado tem um punhado */
    cores.add((r >> 3) * 1024 + (g >> 3) * 32 + (b >> 3));
    soma += r + g + b;
  }

  const fracaoRosa = rosa / total;
  const brilho = soma / (total * 3);

  if (fracaoRosa >= 0.35) {
    suspeitos.push({ f, motivo: "magenta de textura ausente", detalhe: `${(fracaoRosa * 100).toFixed(0)}% dos pixels` });
  } else if (cores.size <= 4) {
    suspeitos.push({ f, motivo: "chapado", detalhe: `${cores.size} tons, brilho ${brilho.toFixed(0)}` });
  }
}

console.log(`
  ÍCONES DE SKILL — ${arquivos.length} PNGs em public/skills/

  não decodificaram   ${quebrados.length}
  suspeitos           ${suspeitos.length}
`);

for (const q of quebrados) console.log(`  ✖ ${q.f} — ${q.erro}`);
for (const s of suspeitos) console.log(`  ! ${s.f.padEnd(34)} ${s.motivo} (${s.detalhe})`);

if (!suspeitos.length && !quebrados.length) console.log("  ✓ nenhum placeholder\n");
else console.log("");
