/**
 * LEITOR MÍNIMO DE PACOTE UNREAL (.utx do Lineage 2) — só leitura.
 *
 * Existe porque 51 dos 801 ícones do pacote de skills vieram errados (borrão
 * de 4 tons). Em vez de aceitar a lacuna, vamos buscar a textura na fonte: o
 * `SysTextures/Icon.utx` do client. **Nada aqui escreve no client** — a cópia
 * é decriptada no scratchpad com `l2encdec -s` e só lida. Patchar `.dat`/`.utx`
 * deste client já quebrou o jogo 7 vezes; LER é seguro e é o que fazemos.
 *
 * Formato (Unreal v123, licensee 37):
 *   header 64 bytes → tabela de nomes → imports → exports
 *   nome:   [byte len][len bytes com o \0][uint32 flags]
 *   índice: FCompactIndex (o varint da Epic, com sinal no 1º byte)
 *   export: class, super (índices), package (int32), nome (índice),
 *           flags (uint32), serialSize (índice), serialOffset (índice)
 *   textura: lista de propriedades terminada por "None", depois os mipmaps
 */

/** FCompactIndex: varint da Epic. 1º byte traz sinal (0x80) e 6 bits. */
export function lerIndice(b, p) {
  let b0 = b[p++];
  const negativo = (b0 & 0x80) !== 0;
  let valor = b0 & 0x3f;
  if (b0 & 0x40) {
    let turno = 6;
    for (let i = 0; i < 4; i++) {
      const x = b[p++];
      valor |= (x & 0x7f) << turno;
      turno += 7;
      if (!(x & 0x80)) break;
    }
  }
  return [negativo ? -valor : valor, p];
}

export function abrir(buf) {
  if (buf.readUInt32LE(0) !== 0x9e2a83c1) throw new Error("não é pacote Unreal");
  const versao = buf.readUInt16LE(4);
  const nameCount = buf.readUInt32LE(12);
  const nameOffset = buf.readUInt32LE(16);
  const exportCount = buf.readUInt32LE(20);
  const exportOffset = buf.readUInt32LE(24);
  const importCount = buf.readUInt32LE(28);
  const importOffset = buf.readUInt32LE(32);

  /* nomes */
  const nomes = [];
  let p = nameOffset;
  for (let i = 0; i < nameCount; i++) {
    const len = buf[p++];
    nomes.push(buf.toString("latin1", p, p + len - 1));
    p += len + 4; // string + flags
  }

  /* imports — só para resolver o nome da classe de cada export */
  const imports = [];
  p = importOffset;
  for (let i = 0; i < importCount; i++) {
    let v;
    [v, p] = lerIndice(buf, p); // classPackage (name)
    [v, p] = lerIndice(buf, p); // className (name)
    const className = nomes[v];
    p += 4; // package (int32)
    [v, p] = lerIndice(buf, p); // objectName (name)
    imports.push({ className, nome: nomes[v] });
  }

  /* exports */
  const exports = [];
  p = exportOffset;
  for (let i = 0; i < exportCount; i++) {
    let classe, sup, nomeIdx, serialSize, serialOffset;
    [classe, p] = lerIndice(buf, p);
    [sup, p] = lerIndice(buf, p);
    p += 4; // package
    [nomeIdx, p] = lerIndice(buf, p);
    p += 4; // objectFlags
    [serialSize, p] = lerIndice(buf, p);
    serialOffset = 0;
    if (serialSize > 0) [serialOffset, p] = lerIndice(buf, p);
    /* índice negativo = import; positivo = export (1-based) */
    const nomeClasse =
      classe < 0 ? imports[-classe - 1]?.nome : classe > 0 ? nomes[0] : "Class";
    exports.push({
      nome: nomes[nomeIdx],
      classe: nomeClasse,
      serialSize,
      serialOffset,
    });
  }

  return { versao, nomes, imports, exports };
}

/** Nomes das propriedades que interessam numa textura. */
const FORMATOS = [
  "P8",
  "RGBA7",
  "RGB16",
  "DXT1",
  "RGB8",
  "RGBA8",
  "NODATA",
  "DXT3",
  "DXT5",
  "L8",
  "G16",
  "RRRGGGBBB",
];

/**
 * Lê a lista de propriedades de um objeto e devolve um mapa simples.
 * Para em "None", que é como o Unreal fecha a lista.
 */
export function lerPropriedades(buf, p, nomes) {
  const props = {};
  for (let guarda = 0; guarda < 200; guarda++) {
    let nomeIdx;
    [nomeIdx, p] = lerIndice(buf, p);
    const nome = nomes[nomeIdx];
    if (nome === "None" || nome === undefined) break;

    const info = buf[p++];
    const tipo = info & 0x0f;
    const tamanhoCod = (info >> 4) & 0x07;
    const arrayFlag = (info & 0x80) !== 0;

    /* struct traz o nome do struct antes do tamanho */
    if (tipo === 10) {
      let s;
      [s, p] = lerIndice(buf, p);
    }

    let tamanho;
    if (tamanhoCod === 0) tamanho = 1;
    else if (tamanhoCod === 1) tamanho = 2;
    else if (tamanhoCod === 2) tamanho = 4;
    else if (tamanhoCod === 3) tamanho = 12;
    else if (tamanhoCod === 4) tamanho = 16;
    else if (tamanhoCod === 5) tamanho = buf[p++];
    else if (tamanhoCod === 6) {
      tamanho = buf.readUInt16LE(p);
      p += 2;
    } else {
      tamanho = buf.readUInt32LE(p);
      p += 4;
    }

    /* índice do elemento do array, quando houver */
    if (arrayFlag && tipo !== 3) p++;

    if (tipo === 3) {
      /* boolean mora no próprio info byte */
      props[nome] = arrayFlag;
      continue;
    }
    const inicio = p;
    if (tipo === 1) props[nome] = buf.readInt32LE(p);
    else if (tipo === 2) props[nome] = buf.readFloatLE(p);
    else if (tipo === 4) {
      let v;
      [v] = lerIndice(buf, p);
      props[nome] = nomes[v];
    } else if (tipo === 13) {
      /* byte: numa propriedade de enum, o valor é o índice do enum */
      props[nome] = buf[p];
    }
    p = inicio + tamanho;
  }
  return [props, p];
}

/**
 * Mipmaps de uma textura. O mip 0 é o maior — é ELE que o site quer.
 * O extrator que gerou o pacote pegou o último da pilha em 51 casos: um 4×4
 * esticado para 32×32 vira o borrão de quatro tons que o dono viu na tela.
 */
export function lerMips(buf, p, versao) {
  let n;
  [n, p] = lerIndice(buf, p);
  const mips = [];
  for (let i = 0; i < n; i++) {
    if (versao >= 63) p += 4; // widthOffset
    let tam;
    [tam, p] = lerIndice(buf, p);
    const dados = buf.subarray(p, p + tam);
    p += tam;
    const w = buf.readUInt32LE(p);
    const h = buf.readUInt32LE(p + 4);
    p += 8;
    p += 2; // widthBits, heightBits
    mips.push({ w, h, dados });
  }
  return mips;
}

export { FORMATOS };
