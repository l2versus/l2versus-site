/**
 * TRATAMENTO DOS QUADROS DE SEQUÊNCIA (scroll scrub).
 *
 * Por que existe: os quadros de /public/seq vieram de clipes gerados por IA a
 * 1280×720 e entraram no site crus. Três defeitos, nessa ordem de gravidade:
 *
 *   1. MARCA D'ÁGUA do gerador ("Veo") gravada no canto inferior direito de
 *      TODO quadro. É a marca de outra empresa no herói do site — nenhum ajuste
 *      de canvas conserta isso, só apagar.
 *   2. Upscale: o clipe do guerreiro tem 848×478 e o palco tem 1920 — 2,26× de
 *      ampliação. Lanczos não inventa informação: medindo a variância do
 *      laplaciano no mesmo recorte, o nativo dá 827 de detalhe por pixel e o
 *      mesmo recorte ampliado dá 114. A ampliação DILUI o detalhe em 7×.
 *   3. Compressão do próprio clipe: h264 a 0,15 bit/pixel. Blocagem e ruído de
 *      mosquito, que o upscale depois amplifica com entusiasmo.
 *
 * O que resolve 2 e 3, medido neste repo (recorte do peitoral, quadro 94):
 *
 *            detalhe/pixel   ruído        como
 *   hoje          134         2,22        Lanczos3 + unsharp
 *   +nlmeans      114         2,15        idem, com denoise antes
 *   ESRGAN        528         1,41        realesr-animevideov3-x2
 *
 * 4× mais detalhe E 36% menos ruído — ganho nos dois eixos, não troca. O modelo
 * `animevideov3` é treinado em vídeo estilizado/CG, que é exatamente este
 * material; o `x4plus` (fotográfico) deixa a armadura plástica.
 *
 * O denoise temporal vem ANTES do upscaler e é de graça: medido, o ESRGAN
 * entrega o mesmo detalhe com ou sem ele (528 vs 527) e 15% menos ruído com
 * (1,41 vs 1,65). O nlmeans usa os quadros vizinhos — informação que nenhum
 * filtro de imagem isolada tem.
 *
 * O upscaler é o realesrgan-ncnn-vulkan portátil (Vulkan, roda na iGPU, sem
 * conta e sem nuvem). Não é versionado: ver `--esrgan=` abaixo.
 *
 * A marca é detectada pelo mínimo pixel-a-pixel entre quadros distantes: o
 * cenário muda, a marca não, então o que sobra claro no mínimo É a marca. A
 * remoção copia um retalho da vizinhança de cima (área escura e sem detalhe)
 * com borda suavizada — em cima de fagulhas em movimento fica invisível.
 *
 * Uso:
 *   node scripts/tratar-sequencia.mjs <pasta> [--largura=1920] [--q=80]
 *   node scripts/tratar-sequencia.mjs versus
 *
 * Entrada:  public/seq/<pasta>/q_*.webp   (preservada, nunca sobrescrita)
 * Saída:    public/seq/<pasta>-hd/q_*.webp
 */
import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const pasta = args.find((a) => !a.startsWith("--"));
if (!pasta) {
  console.error(
    "Uso: node scripts/tratar-sequencia.mjs <pasta> [--video=<arquivo>] [--quadros=96] [--largura=1920] [--q=80]"
  );
  process.exit(1);
}
const larguraAlvo = Number(args.find((a) => a.startsWith("--largura="))?.split("=")[1] ?? 1920);
const qualidade = Number(args.find((a) => a.startsWith("--q="))?.split("=")[1] ?? 80);
const video = args.find((a) => a.startsWith("--video="))?.slice(8);
const nQuadros = Number(args.find((a) => a.startsWith("--quadros="))?.split("=")[1] ?? 96);
/* --corte=L:A:X:Y (sintaxe do filtro `crop` do ffmpeg). Existe porque o clipe
   do castelo é retrato 720×1280 e a cena usada no site é só a faixa de baixo:
   correlacionando o quadro publicado com o nativo, o recorte bate em
   720:560:0:720 com erro médio de 2,11 — ou seja, os 560px finais.
   O corte entra na EXTRAÇÃO, não depois: assim a detecção de marca d'água e o
   upscaler já trabalham no enquadramento final, sem gastar reconstrução em
   pixel que vai para o lixo. */
const corte = args.find((a) => a.startsWith("--corte="))?.slice(8);

/* Upscaler: 51 MB de binário + modelos, fora do git (ver .gitignore). Quem for
   regerar as sequências baixa o realesrgan-ncnn-vulkan (releases do
   xinntao/Real-ESRGAN) e descompacta em scripts/.upscaler/. Sem ele o script
   ainda roda, só cai no Lanczos — e avisa, porque a diferença é visível. */
const esrganExe = resolve(
  raiz,
  args.find((a) => a.startsWith("--esrgan="))?.slice(9) ??
    "scripts/.upscaler/realesrgan-ncnn-vulkan.exe"
);
const temEsrgan = !args.includes("--sem-esrgan") && existsSync(esrganExe);

/* SEMPRE que o vídeo original existir, extrair dele — nunca retratar os WebP
   que já estão no site.
   Motivo medido: os quadros de /seq/versus estavam em 1272×718, mas o vídeo
   que os gerou é 848×478. Alguém ampliou 1,5× na extração. Tratar aquele WebP
   e ampliar de novo para 1920 empilha DUAS gerações de reamostragem sobre um
   detalhe que nunca passou de 848px — borrão sobre borrão. Partindo do vídeo,
   é uma geração só, e ainda dá para extrair mais quadros (o clipe tem 192 a
   24fps; a sequência usava 49, o que deixa o scrub picotado). */
let dirEntrada = resolve(raiz, "public/seq", pasta);
if (video) {
  const origemVideo = resolve(video);
  dirEntrada = resolve(raiz, "public/seq", `.${pasta}-cru`);
  mkdirSync(dirEntrada, { recursive: true });
  for (const f of readdirSync(dirEntrada)) {
    if (f.endsWith(".png")) rmSync(resolve(dirEntrada, f));
  }
  /* Quantos quadros o clipe REALMENTE tem — não dá para supor 192. O passo do
     `select` é inteiro, então só divisores do total distribuem pelo clipe
     inteiro; qualquer outro valor combinado com `-frames:v` pegaria os
     primeiros N quadros e cortaria o fim da cena sem avisar. Em vez de aceitar
     esse corte silencioso, arredonda para o divisor mais próximo e diz. */
  const total = Number(
    execFileSync("ffprobe", [
      "-v", "error", "-select_streams", "v:0",
      "-count_frames", "-show_entries", "stream=nb_read_frames",
      "-of", "csv=p=0", origemVideo,
    ]).toString().trim()
  );
  const passo = Math.max(1, Math.round(total / nQuadros));
  const efetivos = Math.floor(total / passo);
  if (efetivos !== nQuadros) {
    console.log(
      `  aviso: ${nQuadros} não divide os ${total} quadros do clipe — usando ${efetivos} (1 a cada ${passo})`
    );
  }

  console.log(`extraindo ${efetivos} quadros de ${video} (sem redimensionar)…`);
  /* PNG, não JPG/WebP: o intermediário não pode acrescentar compressão à que
     o vídeo já tem. `select` por índice distribui os quadros uniformemente.

     nlmeans ANTES do select: o denoise é temporal e precisa da vizinhança de
     quadros para funcionar — depois do select ele veria uma amostragem, não a
     sequência. Descartado o `deband`: medido, ele SOBE o ruído (0,83 -> 1,03)
     porque introduz dither ao desfazer as faixas. */
  execFileSync(
    "ffmpeg",
    [
      "-y", "-v", "error",
      "-i", origemVideo,
      "-vf",
      [
        corte ? `crop=${corte}` : null,
        "nlmeans=s=1.2:p=5:r=15",
        `select='not(mod(n,${passo}))'`,
      ].filter(Boolean).join(","),
      "-vsync", "0",
      "-frames:v", String(efetivos),
      resolve(dirEntrada, "q_%03d.png"),
    ],
    { stdio: "inherit" }
  );
}
const dirSaida = resolve(raiz, "public/seq", `${pasta}-hd`);
if (!existsSync(dirEntrada)) {
  console.error(`Não existe: ${dirEntrada}`);
  process.exit(1);
}
mkdirSync(dirSaida, { recursive: true });

/* png entra na lista porque é o formato do intermediário vindo do vídeo */
const quadros = readdirSync(dirEntrada)
  .filter((f) => /^q_\d+\.(webp|png)$/.test(f))
  .sort();
if (!quadros.length) {
  console.error("Nenhum quadro q_NNN.(webp|png) encontrado.");
  process.exit(1);
}

const { width: W, height: H } = await sharp(resolve(dirEntrada, quadros[0])).metadata();
console.log(
  `${pasta}: ${quadros.length} quadros ${W}×${H} -> ${larguraAlvo}px, q${qualidade}` +
    (temEsrgan ? "  [Real-ESRGAN animevideov3-x2]" : "  [Lanczos — upscaler ausente]")
);

/* diretório de troca com o upscaler, que só fala em arquivo */
const dirTmp = resolve(raiz, "public/seq", `.${pasta}-tmp`);
mkdirSync(dirTmp, { recursive: true });

/* ---------- 1. achar a marca d'água ---------- */
/* Amostra espalhada pela sequência; o mínimo entre elas remove tudo que se
   move. Procura só no quarto inferior direito, que é onde todo gerador
   assina. Se nada persistente aparecer, segue sem apagar nada. */
const amostras = [0, 0.25, 0.5, 0.75, 0.98].map((p) =>
  quadros[Math.min(quadros.length - 1, Math.round(p * (quadros.length - 1)))]
);
/* Janela apertada de propósito. A primeira versão varria 28%×20% do quadro com
   limiar 90 e "achou" 346×63px — fagulhas que por acaso estavam claras nas
   cinco amostras. Patch desse tamanho deixa um retângulo visível (foi o que
   aconteceu). Assinatura de gerador mora colada no canto e é pequena: 12%×16%
   de janela e limiar 115 isolam só ela. */
const zona = {
  left: Math.round(W * 0.88),
  top: Math.round(H * 0.84),
  width: W - Math.round(W * 0.88),
  height: H - Math.round(H * 0.84),
};
const brutos = await Promise.all(
  amostras.map((q) =>
    sharp(resolve(dirEntrada, q)).extract(zona).greyscale().raw().toBuffer()
  )
);
const minimo = Buffer.alloc(brutos[0].length, 255);
for (const b of brutos) for (let i = 0; i < b.length; i++) if (b[i] < minimo[i]) minimo[i] = b[i];

let x0 = zona.width, x1 = -1, y0 = zona.height, y1 = -1;
for (let y = 0; y < zona.height; y++) {
  for (let x = 0; x < zona.width; x++) {
    if (minimo[y * zona.width + x] > 115) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
}

let marca = null;
/* Trava de sanidade: marca d'água é pequena. Se a caixa achada passar de 12%
   da largura, não é marca — é cenário que por acaso ficou claro em todas as
   amostras. Melhor não apagar nada do que carimbar um retângulo no quadro. */
const largaDemais = x1 - x0 + 1 > W * 0.12 || y1 - y0 + 1 > H * 0.12;
if (x1 >= x0 && y1 >= y0 && largaDemais) {
  console.log(
    `  caixa suspeita (${x1 - x0 + 1}×${y1 - y0 + 1}) grande demais p/ marca — ignorada`
  );
} else if (x1 >= x0 && y1 >= y0) {
  const folga = 6;
  marca = {
    left: Math.max(0, zona.left + x0 - folga),
    top: Math.max(0, zona.top + y0 - folga),
    width: Math.min(W, zona.left + x1 + folga) - Math.max(0, zona.left + x0 - folga) + 1,
    height: Math.min(H, zona.top + y1 + folga) - Math.max(0, zona.top + y0 - folga) + 1,
  };
  console.log(`  marca d'água: ${marca.width}×${marca.height} em (${marca.left},${marca.top})`);
} else {
  console.log("  nenhuma marca d'água persistente encontrada");
}

/* ---------- 1b. CORTAR em vez de carimbar ----------
   O retalho borrado nunca ficou invisível — e com o Real-ESRGAN ficou PIOR:
   o modelo reconstrói borda em toda a cena e o retalho continua chapado, então
   ele passa a destoar de tudo em volta em vez de se perder no borrão geral.
   Conferido no quadro 150 de versus-hd: retângulo liso bem visível no canto.

   A marca mora sempre colada na borda inferior direita (é onde a detecção
   procura), então cortar a faixa de baixo a elimina de verdade, sem inventar
   pixel nenhum. O preço é ~7% de altura — e nem isso aparece: o palco é mais
   largo que o quadro, o canvas desenha em `cover` e já descartava faixa de
   cima e de baixo. Cortar embaixo aproxima o quadro da proporção do palco.

   `--marca=retalho` volta ao comportamento antigo para o caso de uma marca que
   não esteja na borda. */
const estrategiaMarca = args.find((a) => a.startsWith("--marca="))?.slice(8) ?? "corte";
let recorte = null;
if (marca && estrategiaMarca === "corte") {
  const alturaUtil = Math.max(1, marca.top - 2);
  const perda = (((H - alturaUtil) / H) * 100).toFixed(1);
  recorte = { left: 0, top: 0, width: W, height: alturaUtil };
  console.log(`  -> cortando a faixa de baixo: ${W}×${alturaUtil} (−${perda}% de altura)`);
  marca = null; // não carimbar: o corte já resolveu
}

/* Máscara de borda suave para o retalho: sem ela a emenda vira um retângulo
   visível quando a vizinhança tem gradiente. */
const mascara = marca
  ? await sharp({
      create: {
        width: marca.width,
        height: marca.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${marca.width}" height="${marca.height}">
               <rect width="100%" height="100%" fill="black"/>
               <rect x="5" y="5" width="${marca.width - 10}" height="${marca.height - 10}"
                     rx="7" fill="white"/>
             </svg>`
          ),
          blend: "dest-in",
        },
      ])
      .blur(4)
      .png()
      .toBuffer()
  : null;

/* ---------- 2. processar ---------- */
let bytes = 0;
for (const nome of quadros) {
  const origem = resolve(dirEntrada, nome);
  let base = sharp(origem);

  /* o corte vem primeiro: tudo depois dele (upscale, graduação, WebP) trabalha
     já no enquadramento final, sem gastar reconstrução em pixel descartado */
  if (recorte) base = sharp(await base.extract(recorte).png().toBuffer());

  if (marca) {
    /* Borrão NO PRÓPRIO lugar, não retalho doado de outra região. Copiar de
       cima parece mais esperto, mas carrega o gradiente da área de origem e
       cria emenda — foi o que deixou um retângulo visível na primeira versão.
       Um sigma alto sobre 74×38px de fundo escuro dissolve a letra sem trazer
       conteúdo estranho; a máscara suave resolve a borda. */
    /* Casar o brilho com a vizinhança. Borrar sozinho não basta: o branco da
       letra se espalha pelo retalho e deixa um retângulo CLARO no lugar da
       marca — trocar uma sujeira por outra. A correção mede o anel em volta
       da caixa (a mesma textura, sem a marca dentro) e aplica um ganho linear
       para o retalho ter a mesma média. Aí ele some de verdade. */
    const anel = {
      left: Math.max(0, marca.left - 26),
      top: Math.max(0, marca.top - 26),
      width: Math.min(W - Math.max(0, marca.left - 26), marca.width + 52),
      height: Math.min(H - Math.max(0, marca.top - 26), marca.height + 52),
    };
    /* O anel é a MOLDURA: a caixa grande MENOS a caixa da marca. Medir a caixa
       grande inteira (como fazia a v1 desta correção) inclui a própria marca
       na média, o ganho sai ≈1 e nada muda — por isso o retângulo claro
       continuava lá. Média da moldura = (grande·área − interna·área)/resto. */
    /* ATENÇÃO: sharp.stats() mede a imagem de ENTRADA e ignora extract/resize
       do pipeline. Medir `sharp(x).extract(r).stats()` devolve a média do
       quadro inteiro — foi assim que a correção saiu com ganho 1,77 e
       CLAREOU o retalho em vez de escurecer. O recorte precisa virar buffer
       antes de ser medido. */
    const media = async (regiao) =>
      (await sharp(await sharp(origem).extract(regiao).png().toBuffer()).greyscale().stats())
        .channels[0].mean;
    const [mediaGrande, mediaMarca, borrado] = await Promise.all([
      media(anel),
      media(marca),
      sharp(origem).extract(marca).blur(9).png().toBuffer(),
    ]);
    const areaGrande = anel.width * anel.height;
    const areaMarca = marca.width * marca.height;
    const mediaAnel =
      (mediaGrande * areaGrande - mediaMarca * areaMarca) / (areaGrande - areaMarca);
    const mediaBorrado = (await sharp(borrado).greyscale().stats()).channels[0].mean;
    const ganho = mediaBorrado > 1 ? Math.max(0.2, Math.min(1.4, mediaAnel / mediaBorrado)) : 1;
    const retalho = await sharp(borrado)
      .linear(ganho, 0)
      .ensureAlpha()
      .composite([{ input: mascara, blend: "dest-in" }])
      .png()
      .toBuffer();
    base = sharp(
      await base
        .composite([{ input: retalho, left: marca.left, top: marca.top }])
        .png()
        .toBuffer()
    );
  }

  /* AMPLIAÇÃO — o upscaler trabalha em arquivo, não em stream, então o quadro
     já limpo passa por um PNG temporário. Vem DEPOIS da limpeza da marca
     (ampliar primeiro faria o modelo reconstruir a marca em alta definição) e
     ANTES da graduação (o modelo foi treinado com cores de origem). */
  if (temEsrgan) {
    const tmpEnt = resolve(dirTmp, "ent.png");
    const tmpSai = resolve(dirTmp, "sai.png");
    await base.png().toFile(tmpEnt);
    execFileSync(
      esrganExe,
      ["-i", tmpEnt, "-o", tmpSai, "-n", "realesr-animevideov3-x2", "-s", "2", "-f", "png"],
      { stdio: ["ignore", "ignore", "ignore"] }
    );
    base = sharp(tmpSai);
  }

  /* graduação: a compressão lava o contraste e a saturação; devolver um
     pouco dos dois é o que separa "clipe comprimido" de "cena com corpo". */
  let saida = base.modulate({ saturation: 1.08, brightness: 1.02 }).linear(1.06, -6);

  /* Reduzir é bom (supersampling: o detalhe reconstruído vira densidade);
     ampliar de novo depois do ESRGAN desfaria o trabalho dele. Então o resize
     só acontece para BAIXO — e no caminho Lanczos, sempre. */
  const larguraAtual = (await base.metadata()).width;
  if (!temEsrgan || larguraAtual > larguraAlvo) {
    saida = saida.resize({ width: larguraAlvo, kernel: "lanczos3" });
  }

  /* unsharp forte só no caminho Lanczos: em cima do ESRGAN ele vira halo,
     porque a borda já está reconstruída. */
  const info = await saida
    .sharpen(temEsrgan ? { sigma: 0.4, m1: 0, m2: 0.6 } : { sigma: 0.7, m1: 0.6, m2: 2.2 })
    .webp({ quality: qualidade, effort: 6, smartSubsample: true })
    .toFile(resolve(dirSaida, nome.replace(/.png$/, ".webp")));
  bytes += info.size;
  process.stdout.write(`\r  ${nome} ...`);
}

rmSync(dirTmp, { recursive: true, force: true });

console.log(
  `\n  pronto: ${quadros.length} quadros em public/seq/${pasta}-hd ` +
    `(${(bytes / 1024 / 1024).toFixed(1)} MB, média ${Math.round(bytes / quadros.length / 1024)} KB)`
);
