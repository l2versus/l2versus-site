#!/usr/bin/env node
/**
 * AMPLIA OS ÍCONES DE SKILL 4× (32 → 128) E GRAVA EM WEBP.
 *
 *   node scripts/ampliar-icones-skill.mjs
 *
 * POR QUE
 * O ícone do jogo tem 32×32. Na página ele aparece a 64px, e a 64px só havia
 * dois caminhos ruins: `image-rendering: pixelated` deixa QUADRICULADO (cada
 * pixel da arte vira um bloco de 2×2), e a suavização do navegador deixa
 * BORRADO. Os dois são limite da fonte, não do CSS — não dá para consertar
 * mexendo em tamanho.
 *
 * A saída é ampliar de verdade, antes: `realesr-x4plus-anime` é treinado em
 * arte estilizada, que é exatamente o caso de ícone de L2. Com um PNG de
 * 128×128 servido num quadro de 64px o navegador faz REDUÇÃO, não ampliação —
 * e redução é a operação em que ele é bom.
 *
 * WEBP e não PNG: os 801 em PNG 128×128 dão 23,3 MB (30 KB cada), o que numa
 * classe de 50 skills seria 1,5 MB só de ícone. Em WebP q90 são 4,3 MB
 * (5,5 KB cada) sem diferença visível a 64px.
 *
 * O 32×32 ORIGINAL CONTINUA EM `public/skills/` e é a fonte da verdade: é
 * contra ele que `auditar-icones-skill.mjs` procura borrão e é dele que esta
 * ampliação sai. Nunca o contrário — a saída do upscaler tem centenas de tons
 * por construção e passaria em qualquer auditoria, inclusive quando a entrada
 * for lixo.
 *
 * REQUER (nenhum dos dois é versionado):
 *   scripts/.upscaler/realesrgan-ncnn-vulkan.exe + models/
 *   python com Pillow  (só para o WEBP; o upscaler só escreve PNG)
 */

import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();
const ORIGEM = path.join(RAIZ, "public", "skills");
const DESTINO = path.join(ORIGEM, "x4");
const UPSCALER = path.join(RAIZ, "scripts", ".upscaler", "realesrgan-ncnn-vulkan.exe");

if (!existsSync(UPSCALER)) {
  console.error(`
  ✖ upscaler não encontrado em scripts/.upscaler/

  Baixar o realesrgan-ncnn-vulkan portátil e descompactar lá (51 MB, fora do
  git). Ver scripts/.upscaler/README_windows.md.
`);
  process.exit(1);
}

await rm(DESTINO, { recursive: true, force: true });
await mkdir(DESTINO, { recursive: true });

const entrada = (await readdir(ORIGEM)).filter((f) => f.endsWith(".png"));
console.log(`\n  ampliando ${entrada.length} ícones 32×32 → 128×128 …\n`);

execFileSync(
  UPSCALER,
  ["-i", ORIGEM, "-o", DESTINO, "-n", "realesrgan-x4plus-anime", "-s", "4", "-f", "png"],
  { stdio: ["ignore", "ignore", "ignore"] }
);

/* PNG → WebP. O upscaler não sabe gravar WebP, e Node não tem encoder de
   imagem; o Pillow já está na máquina e resolve em um passo. */
const py = `
from PIL import Image
import glob, os, sys
d = r"${DESTINO.replace(/\\/g, "\\\\")}"
tot = 0; n = 0
for p in glob.glob(d + "/*.png"):
    Image.open(p).convert("RGB").save(p[:-4] + ".webp", "WEBP", quality=90, method=6)
    tot += os.path.getsize(p[:-4] + ".webp"); n += 1
    os.remove(p)
print(f"{n} {tot}")
`;
const saida = execFileSync("python", ["-c", py], { encoding: "utf8" }).trim().split(" ");
const n = Number(saida[0]);
const bytes = Number(saida[1]);

console.log(`  ${n} WebP 128×128 em public/skills/x4/`);
console.log(`  ${(bytes / 1024 / 1024).toFixed(2)} MB no total, ${(bytes / n / 1024).toFixed(1)} KB cada\n`);

if (n !== entrada.length) {
  console.error(`  ✖ saíram ${n} de ${entrada.length} — algum ícone não foi ampliado\n`);
  process.exit(1);
}
