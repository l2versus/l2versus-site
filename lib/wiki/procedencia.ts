/**
 * O CAMINHO DO ARQUIVO-FONTE NÃO VAI PARA O JOGADOR.
 *
 * Toda afirmação deste códice carrega de onde foi lida — é a regra do projeto
 * e o schema exige o campo (`fonte: "ARQUIVO.txt:LINHA"`). Isso continua
 * valendo: o dado segue extraído, versionado e auditável.
 *
 * O que muda é a EXIBIÇÃO. Em produção, `dist/game/data/stats/players/
 * classList.xml:5` e `java/org/l2jmobius/.../PlayerClass.java:45` não dizem
 * nada a quem veio ver a árvore do Gladiator, e desenham para o público a
 * estrutura interna do servidor. Decisão do dono (08/10/2026): não aparece.
 *
 * A primeira versão disto escondia só em produção e deixava aparecer em dev.
 * Não serve: o dono confere o site no localhost, e ali continuava à mostra —
 * ou seja, para quem olha, não estava resolvido. Fora que "some só no deploy"
 * é o tipo de regra que ninguém lembra e que volta a vazar na primeira página
 * nova. Desligado nos dois lados.
 *
 * A auditoria NÃO se perde: `fonte` continua obrigatório no schema e gravado
 * em todo `content/wiki/*.json`. Confere-se no repositório, com grep, que é
 * onde se confere de verdade — nunca foi lendo a página.
 *
 * Fica como constante, e não como código apagado, por dois motivos: é um
 * interruptor só para as sete telas que mostravam caminho, e deixa escrito
 * POR QUE está desligado — sem isso, a próxima pessoa reintroduz o vazamento
 * achando que foi esquecimento.
 */
export const MOSTRAR_PROCEDENCIA = false;

/**
 * NÃO MANDAR é a outra metade de não mostrar.
 *
 * `MOSTRAR_PROCEDENCIA = false` impede que o caminho seja DESENHADO, e isso
 * basta em componente de servidor. Não basta na fronteira do cliente: tudo
 * que vai nas props de um componente `"use client"` é serializado no payload
 * RSC e aparece no HTML publicado, mesmo sem um pixel na tela.
 *
 * Foi assim que `fonte`, `fonteEnum` e `fonteArquivo` continuaram no ar
 * depois de "resolvido" — pegos com grep no deploy em 08/10/2026, não na
 * revisão do código. Daí a regra: todo objeto que cruza para componente
 * cliente passa por aqui primeiro.
 */
const CAMPOS_DE_CAMINHO = ["fonte", "fonteEnum", "fonteArquivo", "fonteXml", "geradoDe"];

export function semCaminhos<T>(valor: T): T {
  if (Array.isArray(valor)) return valor.map((v) => semCaminhos(v)) as T;
  if (valor && typeof valor === "object") {
    const saida: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      if (CAMPOS_DE_CAMINHO.includes(k)) continue;
      saida[k] = semCaminhos(v);
    }
    return saida as T;
  }
  return valor;
}
