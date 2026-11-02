import { getT } from "@/lib/i18n/server";
import { MOSTRAR_PROCEDENCIA } from "@/lib/wiki/procedencia";

/**
 * A PROCEDÊNCIA, RECOLHIDA — e invisível em produção.
 *
 * Este wiki carrega o caminho do arquivo-fonte em toda afirmação — é a regra
 * do projeto, e é o que permite auditar a página contra o servidor em vez de
 * acreditar nela. O schema até exige o campo (`fonte: "ARQUIVO.txt:LINHA"`).
 *
 * Exibir isso ao jogador, porém, nunca ajudou ninguém: para quem chegou
 * procurando a classe Soul Hound, `java/org/l2jmobius/gameserver/model/actor/
 * enums/player/PlayerClass.java:155` é entulho entre ele e o que veio ler — e
 * ainda desenha a estrutura interna do servidor para o público. A dobra
 * fechada reduzia o ruído, não o vazamento.
 *
 * Em produção o bloco simplesmente não existe; em desenvolvimento continua
 * aparecendo, que é onde se confere a página contra o arquivo. Ver
 * `lib/wiki/procedencia.ts`.
 */
export default async function Fonte({
  children,
  className = "",
}: {
  /** Um ou mais caminhos. Já vêm formatados de quem chama. */
  children: React.ReactNode;
  className?: string;
}) {
  if (!MOSTRAR_PROCEDENCIA) return null;
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
