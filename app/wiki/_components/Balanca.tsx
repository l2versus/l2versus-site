import type { Efeito } from "@/lib/wiki/types";
import { getT } from "@/lib/i18n/server";

/**
 * A BALANÇA — componente-assinatura do wiki.
 *
 * Mostra ANTES e AGORA lado a lado, pesados de propósito de forma desigual:
 * o ANTES fica apagado e menor (é memória, não vale mais em jogo), o AGORA
 * fica em ouro, maior e tabular (é o que o jogador sente). Entre os dois, a
 * régua-diamante vertical — a marca da casa.
 *
 * Deliberadamente NÃO é um diff vermelho/verde de código: aquilo é estética de
 * ferramenta de dev, erra o contexto de um manual de jogo e briga com o
 * obsidiana. A hierarquia aqui é feita por peso e cor, não por semáforo.
 *
 * Três estados, porque "sem ANTES" quer dizer duas coisas diferentes e mentir
 * sobre isso seria pior que omitir:
 *   1. tem os dois lados   → balança de duas colunas
 *   2. novo === true       → coluna única com o selo "não existe no jogo original"
 *   3. resto (antes vazio) → coluna única "ESTADO ATUAL" + aviso de que a fonte
 *                            não registrou o valor antigo
 *
 * O caso 2 exige a marca EXPLÍCITA `novo`. Nunca se infere novidade de `antes`
 * estar vazio: quase sempre isso só significa que a fonte não documentou o
 * valor antigo de um item que existe no retail. O estado 3 é o default seguro.
 */

/**
 * Rótulo e valor na mesma linha só funciona quando o PAR é curto. Boa parte
 * da fonte descreve o estado em prosa ("as SA que o dono escolheu foram
 * trocadas só na versão NORMAL…"), e aí a linha única espreme o texto contra
 * a borda. Acima deste limiar o par empilha: rótulo em cima, valor embaixo,
 * ocupando a largura toda da coluna.
 *
 * Mede os DOIS lados, não só o valor. A primeira versão olhava apenas
 * `valor.length`, e por isso deixava passar o caso inverso — rótulo longo
 * com valor curto ("o NÍVEL da pedra (40, 45 ... 80)" → "manda só no valor
 * da 1a METADE"). Numa coluna de 290px o rótulo tomava a linha inteira e o
 * valor ficava com largura zero, quebrando letra por letra. O CSS agora
 * garante o piso de largura; este limiar é o que escolhe a apresentação
 * BOA (empilhada) em vez da apenas tolerável (linha que quebra).
 */
const ehFrase = (rotulo: string, valor: string) =>
  valor.length > 42 || rotulo.length + valor.length > 52;

function ListaEfeitos({
  efeitos,
  lado,
}: {
  efeitos: Efeito[];
  lado: "antes" | "agora";
}) {
  return (
    <dl>
      {efeitos.map((e, i) => (
        <div
          key={`${e.rotulo}-${i}`}
          className={`efeito-${lado} ${ehFrase(e.rotulo, e.valor) ? "efeito-frase" : ""}`}
        >
          <dt>{e.rotulo}</dt>
          <dd className="v">{e.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

const ListaAgora = ({ efeitos }: { efeitos: Efeito[] }) => (
  <ListaEfeitos efeitos={efeitos} lado="agora" />
);
const ListaAntes = ({ efeitos }: { efeitos: Efeito[] }) => (
  <ListaEfeitos efeitos={efeitos} lado="antes" />
);

export default async function Balanca({
  antes,
  agora,
  antesAusente,
  novo,
  ocultarNotaEstadoAtual,
}: {
  antes: Efeito[];
  agora: Efeito[];
  antesAusente?: boolean;
  novo?: boolean;
  /**
   * Quando a SEÇÃO inteira é "estado atual", a página exibe o aviso uma vez
   * no topo e as fichas o suprimem — aviso idêntico repetido em 23 fichas é
   * ruído, não informação. Repetido, ele treina o olho a ignorar avisos.
   */
  ocultarNotaEstadoAtual?: boolean;
}) {
  const t = await getT();
  const temDiff = antes.length > 0 && agora.length > 0;

  /* ---- Estado 1: a balança de verdade, com os dois lados ---- */
  if (temDiff) {
    return (
      <div className="balanca">
        <div>
          <p className="balanca-rotulo balanca-rotulo-antes">{t("wiki.antes")}</p>
          <ListaAntes efeitos={antes} />
        </div>
        <div className="balanca-regua" aria-hidden>
          <span className="dia" />
        </div>
        <div className="balanca-lado-agora">
          <p className="balanca-rotulo balanca-rotulo-agora">{t("wiki.agora")}</p>
          <ListaAgora efeitos={agora} />
        </div>
      </div>
    );
  }

  /* ---- Estados 2 e 3: coluna única ---- */
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <p className="balanca-rotulo balanca-rotulo-agora mb-0">
          {novo ? t("wiki.novo") : t("wiki.estado_atual")}
        </p>
        {novo && (
          <span className="selo selo-tier-improved">{t("wiki.nao_existe_original")}</span>
        )}
      </div>
      <ListaAgora efeitos={agora} />
      {!novo && !ocultarNotaEstadoAtual && (
        <p className="nota nota-fonte mt-3">
          <span aria-hidden className="text-[var(--color-gold)]">◆</span>
          <span>{t("wiki.sem_antes_entrada")}</span>
        </p>
      )}
    </div>
  );
}
