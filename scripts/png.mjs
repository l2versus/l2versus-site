/**
 * DECODIFICADOR DE PNG MÍNIMO — só o que os ícones de skill precisam.
 *
 * Os 801 PNGs do pacote do cliente são todos 8-bit RGB não-interlaçados
 * (`8bit/ct2/il0`, conferido nos 801). Isso é pouco o bastante para decodificar
 * à mão com o `zlib` que já vem no Node, e poupa o site de uma dependência de
 * imagem que ele não usa para mais nada.
 *
 * Existe para responder uma pergunta que o `existsSync` não responde: o PNG
 * está lá, mas é o ÍCONE? Ver `pareceVazio`.
 */

import { inflateSync } from "node:zlib";

export function decodificar(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("não é PNG");
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const prof = buf.readUInt8(24);
  const tipo = buf.readUInt8(25);
  const entrelace = buf.readUInt8(28);
  if (prof !== 8 || tipo !== 2 || entrelace !== 0) {
    throw new Error(`formato inesperado (${prof}bit/ct${tipo}/il${entrelace})`);
  }

  /* um PNG pode fatiar o fluxo em vários IDAT — juntar antes de inflar */
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
  const px = Buffer.alloc(h * passo);
  for (let y = 0; y < h; y++) {
    const filtro = cru[y * (passo + 1)];
    const linha = cru.subarray(y * (passo + 1) + 1, y * (passo + 1) + 1 + passo);
    for (let x = 0; x < passo; x++) {
      const a = x >= bpp ? px[y * passo + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * passo + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * passo + x - bpp] : 0;
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
      px[y * passo + x] = v & 0xff;
    }
  }
  return { w, h, px };
}

/**
 * O PNG existe mas NÃO é o ícone?
 *
 * Dois modos de falha do extrator, os dois silenciosos:
 *
 *  · MAGENTA — o rosa de "textura ausente" do motor da Unreal. Quando o
 *    extrator não acha a textura dentro do .utx, grava o magenta e segue.
 *
 *  · CHAPADO — o extrator pegou o MIPMAP errado. Uma textura de ícone carrega
 *    a pirâmide inteira (32, 16, 8, 4, 2, 1); lendo o nível de 4×4 e esticando
 *    para 32×32 sai um borrão de três ou quatro tons. Foi o que aconteceu com
 *    os 51 do lote de 06/10/2026 — War Frenzy, Tribunal, Stealth, Betray… —
 *    e por isso o critério é a CONTAGEM DE TONS e não o brilho: o borrão tem a
 *    cor média certa, o que engana qualquer teste de "está escuro demais".
 *
 * Quantiza em 32 níveis por canal. Um ícone de verdade passa de 40 tons
 * distintos; o menor ícone legítimo medido neste pacote tem 11.
 */
export function pareceVazio({ w, h, px }) {
  const total = w * h;
  let rosa = 0;
  const tons = new Set();
  for (let i = 0; i < px.length; i += 3) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    if (r > 170 && b > 170 && g < 100) rosa++;
    tons.add((r >> 3) * 1024 + (g >> 3) * 32 + (b >> 3));
  }
  if (rosa / total >= 0.35) {
    return { vazio: true, motivo: "magenta de textura ausente", tons: tons.size };
  }
  if (tons.size <= 4) {
    return { vazio: true, motivo: "mipmap errado (borrão chapado)", tons: tons.size };
  }
  return { vazio: false, tons: tons.size };
}
