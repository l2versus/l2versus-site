#!/usr/bin/env node
/**
 * EXTRAI ÍCONE DE SKILL DIRETO DO CLIENT, pegando o MIP 0.
 *
 *   node scripts/extrair-icones-utx.mjs <dec-Icon.utx> [--aplicar]
 *
 * POR QUE ISTO EXISTE
 * 51 dos 801 PNGs do pacote WikiSkills não eram o ícone: um borrão de três ou
 * quatro tons. A causa, medida aqui e não suposta: as texturas do Icon.utx
 * guardam a pirâmide de mipmaps (32, 16, 8, 4…) e o extrator que gerou o
 * pacote pegou o ÚLTIMO da pilha. Em textura de mip único (a maioria) o último
 * É o 32×32 e sai certo; nas que têm pirâmide, o último é 4×4 — esticado para
 * 32×32 vira o borrão que apareceu na War Frenzy, na Tribunal, na Stealth.
 *
 * Aqui pegamos o mip 0, que é o maior. Nada é escrito no client: o `.utx` é
 * copiado, decriptado com `l2encdec -s` fora da pasta do jogo, e só lido.
 * (Patchar arquivo deste client já o quebrou 7 vezes; ler nunca.)
 *
 * O CONTROLE É OBRIGATÓRIO. Antes de regravar qualquer coisa, o script
 * re-extrai ícones que JÁ estão certos e compara com o PNG do pacote. Se o
 * controle não bater, é o método que está errado, não o dado — e aí nada é
 * gravado. Sem esse passo, um decodificador DXT1 com os canais trocados
 * passaria por "consertei 51 ícones".
 */

import { readFile, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import path from "node:path";
import { abrir, lerIndice } from "./utx.mjs";
import { decodificar, pareceVazio } from "./png.mjs";

const arqUtx = process.argv[2];
const aplicar = process.argv.includes("--aplicar");
if (!arqUtx) {
  console.error(`
  uso: node scripts/extrair-icones-utx.mjs <dec-Icon.utx> [--aplicar]

  O .utx tem que estar DECRIPTADO:
    cp "<client>/SysTextures/Icon.utx" <scratch>/ && cd <scratch>
    l2encdec.exe -s Icon.utx        # gera dec-Icon.utx
`);
  process.exit(1);
}

/* ---------- DXT1 → RGB ---------- */

/** RGB565 → [r,g,b] de 8 bits, com a replicação dos bits altos. */
function cor565(v) {
  const r = (v >> 11) & 0x1f;
  const g = (v >> 5) & 0x3f;
  const b = v & 0x1f;
  return [(r << 3) | (r >> 2), (g << 2) | (g >> 4), (b << 3) | (b >> 2)];
}

/**
 * Decodifica DXT1 para RGB puro.
 *
 * O modo de 1 bit de alfa (c0 <= c1) vira PRETO, não transparente: os 750
 * ícones que já estavam certos no pacote são PNG RGB sem canal alfa, e o
 * fundo deles é preto. Inventar transparência aqui faria os 51 novos
 * destoarem dos outros na mesma grade.
 */
function dxt1(dados, w, h) {
  const px = Buffer.alloc(w * h * 3);
  let p = 0;
  for (let by = 0; by < h; by += 4) {
    for (let bx = 0; bx < w; bx += 4) {
      const c0 = dados.readUInt16LE(p);
      const c1 = dados.readUInt16LE(p + 2);
      const bits = dados.readUInt32LE(p + 4);
      p += 8;

      const a = cor565(c0);
      const b = cor565(c1);
      /* TRUNCA, não arredonda. Com `Math.round` saem 496 bytes diferentes em
         3.072 contra o PNG que o extrator original gerou; com `Math.floor`,
         zero. É a convenção que o resto do pacote já usa, e seguir ela é o
         que deixa os 51 novos indistinguíveis dos 750 antigos. */
      const paleta = [a, b, null, null];
      if (c0 > c1) {
        paleta[2] = [0, 1, 2].map((i) => Math.floor((2 * a[i] + b[i]) / 3));
        paleta[3] = [0, 1, 2].map((i) => Math.floor((a[i] + 2 * b[i]) / 3));
      } else {
        paleta[2] = [0, 1, 2].map((i) => Math.floor((a[i] + b[i]) / 2));
        paleta[3] = [0, 0, 0];
      }

      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const px_ = bx + x;
          const py_ = by + y;
          if (px_ >= w || py_ >= h) continue;
          const c = paleta[(bits >> (2 * (4 * y + x))) & 3];
          const o = (py_ * w + px_) * 3;
          px[o] = c[0];
          px[o + 1] = c[1];
          px[o + 2] = c[2];
        }
      }
    }
  }
  return px;
}

/* ---------- PNG 8-bit RGB ---------- */

const TABELA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABELA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function bloco(tipo, dados) {
  const cab = Buffer.alloc(8);
  cab.writeUInt32BE(dados.length, 0);
  cab.write(tipo, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(tipo, "ascii"), dados])), 0);
  return Buffer.concat([cab, dados, crc]);
}

function png(px, w, h) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  /* filtro 0 (None) em toda linha: o ganho de um filtro melhor em 32×32 é
     desprezível e o custo é um bug a mais para caçar */
  const cru = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    cru[y * (1 + w * 3)] = 0;
    px.copy(cru, y * (1 + w * 3) + 1, y * w * 3, (y + 1) * w * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloco("IHDR", ihdr),
    bloco("IDAT", deflateSync(cru, { level: 9 })),
    bloco("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- achar o mip 0 de uma textura ---------- */

/**
 * O mip 0 pelo FIM, não pelo começo.
 *
 * A lista de propriedades que antecede os mipmaps tem tamanho variável e a
 * serialização de textura do licensee 37 não bate com a do Unreal padrão —
 * tentar varrer propriedades devolveu lixo. O trailer de cada mip, porém, é
 * rígido: `[uint32 w][uint32 h][byte wBits][byte hBits]`. Então: acha-se o
 * PRIMEIRO trailer 32×32 (o mip 0 é o maior e vem primeiro), e de lá volta-se
 * o tamanho do bloco até casar com o índice compacto que o declara. Se não
 * casar, a textura é pulada e registrada — nunca chutada.
 */
function mipZero(b, e) {
  const o = e.serialOffset;
  const fim = o + e.serialSize;
  /* `p + 10 <= fim`, e não `p < fim - 10`: o trailer tem 10 bytes (w, h e os
     dois de bits) e em textura de mip único ele é a ÚLTIMA coisa do bloco.
     Com o limite errado, justamente os ícones que já estavam certos ficavam
     "não resolvidos" — e o controle reprovou a extração inteira por isso. */
  for (let p = o; p + 10 <= fim; p++) {
    const w = b.readUInt32LE(p);
    const h = b.readUInt32LE(p + 4);
    if (w !== h || ![16, 32, 64, 128].includes(w)) continue;
    /* DXT1 = 1/2 byte por pixel; os outros formatos ficam de fora de propósito */
    for (const n of [(w * h) / 2, w * h, w * h * 4]) {
      for (let k = 1; k <= 3; k++) {
        const pi = p - n - k;
        if (pi < o) continue;
        const [v, np] = lerIndice(b, pi);
        if (v === n && np === p - n) {
          return { w, h, bytes: n, dados: b.subarray(np, p) };
        }
      }
    }
  }
  return null;
}

/* ---------- execução ---------- */

const buf = await readFile(arqUtx);
const pkg = abrir(buf);
const porNome = new Map(pkg.exports.filter((e) => e.serialSize > 0).map((e) => [e.nome, e]));

const PASTA = path.join(process.cwd(), "public", "skills");

/* quem está quebrado hoje */
const quebrados = [];
const bons = [];
const { readdir } = await import("node:fs/promises");
for (const f of (await readdir(PASTA)).filter((f) => f.endsWith(".png"))) {
  const nome = f.slice(0, -4);
  try {
    const d = pareceVazio(decodificar(await readFile(path.join(PASTA, f))));
    (d.vazio ? quebrados : bons).push(nome);
  } catch {
    quebrados.push(nome);
  }
}

/* ---------- CONTROLE: re-extrair 20 ícones que já estão certos ---------- */
const amostra = bons.filter((n) => porNome.has(n)).slice(0, 20);
let iguais = 0;
const divergentes = [];
for (const nome of amostra) {
  const m = mipZero(buf, porNome.get(nome));
  if (!m || m.bytes !== (m.w * m.h) / 2) {
    divergentes.push(`${nome} (mip não resolvido)`);
    continue;
  }
  const meu = png(dxt1(m.dados, m.w, m.h), m.w, m.h);
  const dele = await readFile(path.join(PASTA, `${nome}.png`));
  /* comparar PIXEL, não bytes do arquivo: o encoder deles pode usar outro
     filtro ou nível de deflate e ainda assim ser a mesma imagem */
  const a = decodificar(meu);
  const c = decodificar(dele);
  if (a.w === c.w && a.h === c.h && a.px.equals(c.px)) iguais++;
  else divergentes.push(nome);
}

console.log(`
  ÍCONES DE SKILL — extração direto do client

  pacote .utx        ${path.basename(arqUtx)}  (${pkg.exports.length} texturas)
  PNGs hoje em public/skills   ${bons.length + quebrados.length}
  bons                         ${bons.length}
  quebrados                    ${quebrados.length}

  CONTROLE (re-extrair ícone que já estava certo e comparar pixel a pixel)
  amostra            ${amostra.length}
  idênticos          ${iguais}
  divergentes        ${divergentes.length}${divergentes.length ? ` → ${divergentes.slice(0, 6).join(", ")}` : "  ✓"}
`);

if (iguais !== amostra.length) {
  console.error(
    "  ✖ o controle não bateu: o decodificador está errado, não o pacote. Nada foi gravado.\n"
  );
  process.exit(1);
}

/* ---------- os quebrados ---------- */
const consertados = [];
const semSaida = [];
for (const nome of quebrados) {
  const e = porNome.get(nome);
  if (!e) {
    semSaida.push(`${nome} (não existe neste .utx)`);
    continue;
  }
  const m = mipZero(buf, e);
  if (!m || m.bytes !== (m.w * m.h) / 2) {
    semSaida.push(`${nome} (mip 0 não resolvido)`);
    continue;
  }
  const novo = png(dxt1(m.dados, m.w, m.h), m.w, m.h);
  const d = pareceVazio(decodificar(novo));
  if (d.vazio) {
    semSaida.push(`${nome} (mip 0 também é chapado: ${d.tons} tons)`);
    continue;
  }
  if (aplicar) await writeFile(path.join(PASTA, `${nome}.png`), novo);
  consertados.push(`${nome} ${m.w}×${m.h}, ${d.tons} tons`);
}

console.log(`  RESULTADO
  consertados        ${consertados.length}${aplicar ? "  (GRAVADOS)" : "  (simulação — rode com --aplicar para gravar)"}
  sem saída          ${semSaida.length}
`);
for (const c of consertados) console.log(`  ✓ ${c}`);
for (const s of semSaida) console.log(`  ! ${s}`);
console.log("");
