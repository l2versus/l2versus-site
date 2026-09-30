import { getT } from "@/lib/i18n/server";

/**
 * A PROCEDÊNCIA, RECOLHIDA.
 *
 * Este wiki carrega o caminho do arquivo-fonte em toda afirmação — é a regra
 * do projeto, e é o que permite auditar a página contra o servidor em vez de
 * acreditar nela. O schema até exige o campo (`fonte: "ARQUIVO.txt:LINHA"`).
 *
 * O problema era exibir isso ABERTO. Para quem chegou procurando a classe
 * Soul Hound, `java/org/l2jmobius/gameserver/model/actor/enums/player/
 * PlayerClass.java:155` não informa nada: é entulho entre o jogador e o que
 * ele veio ler, e ainda compete visualmente com as notas que importam de
 * verdade (como a que explica por que a tabela mostra "—" em vez de zero).
 *
 * Não é segredo — o L2J Mobius é open source e esses caminhos são públicos.
 * Por isso recolher, e não remover: quem quiser conferir abre; quem só quer
 * jogar não tropeça. Fechado por padrão, uma linha de altura.
 */
export default async function Fonte({
  children,
  className = "",
}: {
  /** Um ou mais caminhos. Já vêm formatados de quem chama. */
  children: React.ReactNode;
  className?: string;
}) {
  const t = await getT();
  return (
    <details className={`fonte-dobra ${className}`}>
      <summary>
        <span className="fonte-dia" aria-hidden />
        {t("wiki.fonte")}
      </summary>
      <div className="fonte-corpo">{children}</div>
    </details>
  );
}
