/**
 * TRADUÇÃO DO CONTEÚDO DO CÓDICE — normalização por padrão.
 *
 * O conteúdo das 733 entradas vive em `content/wiki/*.json`, em português, e
 * é gerado dos arquivos-fonte do servidor. Traduzir isso string por string
 * seria 3.130 textos distintos por idioma. Medido: depois de trocar todo
 * número por um marcador posicional, sobram **1.755 padrões** — porque a
 * massa do conteúdo é a MESMA frase com outro número:
 *
 *   "nv 1 (pedra 46)" … "nv 10 (pedra 76+)"   → "nv {0} (pedra {1})"
 *   "dispara Focus nv 7 (50%)"                 → "dispara {0} nv {1} ({2}%)"
 *
 * Dez linhas da tabela de Lifestone viram uma entrada de dicionário. É a
 * mesma técnica do `frases-skill.mjs`, adaptada: lá a unidade é a FRASE
 * dentro de um parágrafo; aqui é o CAMPO inteiro, porque campo de tabela já
 * é curto e quebrar em frases só criaria fragmento sem contexto para quem
 * traduz ("comum" sozinho não se traduz igual em "pedra comum" e "caixa
 * comum").
 *
 * A substituição de volta é POR ÍNDICE, não sequencial. Em russo e polonês a
 * ordem dos termos muda — "+{0}% por {1}s" pode virar "{1}с с бонусом {0}%" —
 * e um `replace` sequencial trocaria os dois números de lugar em silêncio.
 * Erro de número num wiki de balanceamento é o pior defeito possível aqui:
 * parece certo e está errado.
 */

/* Captura inteiro, decimal com vírgula ou ponto, e separador de milhar.
   A ordem importa: o alternador mais longo primeiro, senão "1.234" casa só
   o "1". */
const NUMERO = /\d+(?:[.,]\d+)*/g;

/** "x5 por 30s" → { padrao: "x{0} por {1}s", numeros: ["5","30"] } */
export function normalizar(texto) {
  const numeros = [];
  const padrao = texto.replace(NUMERO, (n) => {
    numeros.push(n);
    return `{${numeros.length - 1}}`;
  });
  return { padrao, numeros };
}

/** Devolve os números ao padrão traduzido, cada um na SUA posição. */
export function aplicar(padrao, numeros) {
  return padrao.replace(/\{(\d+)\}/g, (inteiro, i) => numeros[Number(i)] ?? inteiro);
}

/**
 * Traduz um campo. Sem entrada no dicionário, devolve o português —
 * nunca uma string vazia, nunca a chave crua. Texto não traduzido é uma
 * lacuna visível e honesta; texto sumido é um bug que ninguém reporta.
 */
export function traduzirCampo(texto, dicionario) {
  if (typeof texto !== "string" || !texto) return texto;
  const { padrao, numeros } = normalizar(texto);
  const alvo = dicionario[padrao];
  if (!alvo) return texto;
  return numeros.length ? aplicar(alvo, numeros) : alvo;
}

/**
 * Campos que NUNCA se traduzem, em idioma nenhum.
 *
 * Regra do projeto: o que o jogador lê na TELA DO JOGO fica como está. O
 * cliente do Versus é inglês e diz "Ring of Queen Ant", "Atk.Spd", "S80" em
 * qualquer locale. Traduzir aqui mandaria o leitor procurar no jogo um nome
 * que não existe lá — o wiki deixaria de servir para o que ele serve.
 */
export const CAMPOS_INTOCADOS = new Set(["titulo", "boss", "grade", "tier"]);

/**
 * Onde o tradutor encosta, por forma do objeto. Lista explícita e não
 * "tudo que for string": `fonte` é caminho de arquivo (e nem sai do
 * servidor — ver procedencia.ts), `id` é chave, e varrer tudo faria o
 * dicionário engolir os dois.
 */
export const CAMPOS_TRADUZIVEIS = {
  contexto: ["resumo", "regraDuplicata"],
  tier: ["comoObter"],
  notaDoc: ["titulo", "texto"],
  entrada: ["subtitulo", "slot", "notaCliente", "notaFonte", "prosa"],
  efeito: ["rotulo", "valor"],
};

/** Percorre uma família inteira aplicando o dicionário. Não muta a original. */
export function traduzirFamilia(familia, dicionario) {
  const t = (s) => traduzirCampo(s, dicionario);
  const efeitos = (lista) =>
    (lista ?? []).map((e) => ({ ...e, rotulo: t(e.rotulo), valor: t(e.valor) }));

  return {
    ...familia,
    contexto: familia.contexto && {
      ...familia.contexto,
      resumo: t(familia.contexto.resumo),
      regraDuplicata: t(familia.contexto.regraDuplicata),
      tiers: familia.contexto.tiers?.map((x) => ({ ...x, comoObter: t(x.comoObter) })),
    },
    comoLer: (familia.comoLer ?? []).map((n) => ({
      ...n,
      titulo: t(n.titulo),
      texto: t(n.texto),
    })),
    entradas: familia.entradas.map((e) => ({
      ...e,
      subtitulo: t(e.subtitulo),
      slot: t(e.slot),
      notaCliente: t(e.notaCliente),
      notaFonte: t(e.notaFonte),
      prosa: t(e.prosa),
      antes: efeitos(e.antes),
      agora: efeitos(e.agora),
    })),
  };
}
