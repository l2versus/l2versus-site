import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import {
  auditoria,
  carteiras,
  custodia,
  opsPresas,
  receita,
  resumo,
  saques,
} from "@/lib/repos/rmt-admin";
import L2Icon from "@/app/(cabinet)/_components/L2Icon";
import {
  Cela,
  Data,
  Num,
  Quadro,
  Secao,
  Selo,
  Th,
  Usd,
  Vazio,
  usd,
} from "../../_components/razao";

/**
 * RAZÃO DO RMT — a tela que responde às quatro perguntas do dono:
 *
 *   "onde eu vejo o item como adm?"          → § CUSTÓDIA
 *   "como vou saber o valor?"                → coluna PREÇO / LÍQUIDO
 *   "e se está realmente em nossa posse?"    → coluna POSSE (a linha de `items`)
 *   "qual a margem de lucro pra nós?"        → § RECEITA, a folha da casa
 *
 * SOMENTE LEITURA, e isso é desenho, não falta de tempo. Um botão nesta tela
 * seria um botão que muda estado de item ou de dinheiro vindo do SITE — e o
 * site não é dono de nenhum dos dois: o item é do GameServer (a cópia que vale
 * está em memória lá) e o dinheiro depende de um gateway que ainda não existe.
 * Ação de admin só entra depois do gateway, com transação e linha em
 * `rmt_audit`. Até lá a tela diz o que sabe e não finge poder.
 */

// A base é a do servidor rodando: nunca prerender, nunca cache. Sem isto um
// `next build` tentaria renderizar esta página e bateria no banco em tempo de
// build — e, pior, poderia servir a receita de ontem como se fosse a de hoje.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Razão do RMT — sócios | L2 Versus",
  // Não é a proteção (quem protege é o requireAdmin), é higiene: nada aqui
  // deve virar resultado de busca nem preview de link em Discord.
  robots: { index: false, follow: false, nocache: true },
};

export default async function RazaoRmtPage() {
  // O portão DE NOVO, ao lado da consulta. Ver o comentário em
  // app/(admin)/layout.tsx: navegação entre irmãs não re-executa o layout.
  await requireAdmin();

  const [r, cust, rec, cart, saq, ops, aud] = await Promise.all([
    resumo(),
    custodia(),
    receita(),
    carteiras(),
    saques(),
    opsPresas(),
    auditoria(80),
  ]);

  const margemPct =
    rec.bruto_cents > 0
      ? ((rec.casa_cents / rec.bruto_cents) * 100).toFixed(1)
      : "—";

  return (
    <>
      {/* ---------------------------------------------------- cabeçalho */}
      <header className="border-b pb-7" style={{ borderColor: "rgba(201,162,75,0.22)" }}>
        <p
          className="flex items-center gap-4 text-[0.6rem] font-bold uppercase text-[var(--color-gold)]"
          style={{ letterSpacing: "0.4em" }}
        >
          área dos sócios
          <span
            aria-hidden
            className="h-px flex-1"
            style={{ background: "linear-gradient(90deg, rgba(201,162,75,0.5), transparent)" }}
          />
        </p>
        <h1 className="mt-3 font-display text-4xl leading-none tracking-[0.03em] text-[var(--color-parchment)] md:text-5xl">
          RAZÃO DO <span className="text-glow-gold">RMT</span>
        </h1>
        <p className="mt-4 max-w-[76ch] text-sm leading-relaxed text-[var(--color-muted)]">
          Tudo o que esta tela mostra é lido do banco no momento em que você a
          abriu. <b className="text-[var(--color-parchment)]">Nenhuma seção
          escreve nada</b> — não há botão que cancele anúncio, libere carência ou
          pague saque. Enquanto o gateway de pagamento não entra, o dinheiro
          abaixo é o que o modo teste registrou, e a{" "}
          <b className="text-[var(--color-parchment)]">posse do item é o único
          número aqui que já vale de verdade</b>, porque quem a executa é o
          GameServer.
        </p>
      </header>

      {/* -------------------------------------------------------- resumo */}
      {/* `divide-x` no container e não borda em cada cela: assim o fio nasce
          ENTRE as celas e não dobra a moldura do painel (ver a nota em `Cela`,
          _components/razao.tsx). Em grid ele também marca o início de cada
          fileira quando quebra — que aqui lê como coluna de livro, não erro. */}
      <div
        className="panel panel-gold mt-7 grid grid-cols-2 divide-x md:grid-cols-3 xl:grid-cols-6"
        style={{ borderColor: "rgba(201,162,75,0.3)" }}
      >
        <Cela
          rotulo="anúncios ativos"
          valor={String(r.ativos)}
          nota="na vitrine, item em custódia"
        />
        <Cela
          rotulo="reservados"
          valor={String(r.reservados)}
          nota="comprador no checkout — ninguém cancela"
          tom={r.reservados > 0 ? "neutro" : "apagado"}
        />
        <Cela
          rotulo="aguardando entrega"
          valor={String(r.aguardando_entrega)}
          nota="pago; item ainda não recolhido"
        />
        <Cela
          rotulo="itens em custódia"
          valor={String(r.itens_custodia)}
          nota={`${usd(r.valor_custodia_cents)} anunciados`}
          tom="credito"
        />
        <Cela
          rotulo="sem posse"
          valor={String(r.orfaos)}
          nota={
            r.orfaos > 0
              ? "ANÚNCIO SEM ITEM NO COFRE — ver § custódia"
              : "todo anúncio tem seu item"
          }
          tom={r.orfaos > 0 ? "alarme" : "apagado"}
        />
        <Cela
          rotulo="margem da casa"
          valor={usd(r.receita_casa_cents)}
          nota={`${r.vendas} venda(s) liquidada(s)`}
          tom="credito"
        />
      </div>

      {/* segunda fileira: o passivo. Fica separado do resumo de propósito —
          é dinheiro de OUTRAS pessoas e não pode ser lido na mesma varredura
          de olho que a receita da casa. */}
      <div
        className="panel mt-3 grid grid-cols-2 divide-x md:grid-cols-4"
        style={{ borderColor: "rgba(201,162,75,0.16)" }}
      >
        <Cela
          rotulo="devido aos vendedores"
          valor={usd(r.passivo_cents)}
          nota="sacável + carência + saque em curso"
          tom="debito"
        />
        <Cela rotulo="sacável agora" valor={usd(r.sacavel_cents)} />
        <Cela
          rotulo="em carência"
          valor={usd(r.carencia_cents)}
          nota="vendido, ainda estornável"
        />
        <Cela
          rotulo="saques pendentes"
          valor={usd(r.saques_pendentes_cents)}
          nota={`${r.saques_pendentes} pedido(s) · ${r.ops_presas} op(s) de item presa(s)`}
          tom={r.saques_pendentes > 0 || r.ops_presas > 0 ? "neutro" : "apagado"}
        />
      </div>

      {/* ------------------------------------------------------ custódia */}
      <Secao
        rotulo="§ 1 · posse"
        titulo="Custódia — onde está cada item"
        alerta={r.orfaos > 0}
        nota={
          <>
            A prova de posse é a linha em <code>items</code> com{" "}
            <code>owner_id = -1</code>, <code>loc = &apos;WAREHOUSE&apos;</code> e{" "}
            <code>loc_data</code> igual ao id do anúncio — o cofre que o
            GameServer abre para aquele anúncio e só para ele. Quando a coluna{" "}
            <b className="text-[var(--color-parchment)]">POSSE</b> diz{" "}
            <i>ausente</i>, estamos anunciando algo que não temos: o vendedor
            segue com o item na mão e pode usar, encantar ou dropar.{" "}
            <i>Aguardando escrow</i> não é alarme — é o estado normal de um
            anúncio que o jogo ainda não processou.
          </>
        }
      >
        {cust.length === 0 ? (
          <Vazio texto="Nenhum anúncio aberto. Nada em custódia." />
        ) : (
          <Quadro>
            <table className="wiki-table">
              <thead>
                <tr>
                  <Th num>#</Th>
                  <Th>item</Th>
                  <Th num>qtd</Th>
                  <Th>vendedor</Th>
                  <Th num>preço</Th>
                  <Th num>casa</Th>
                  <Th num>vendedor leva</Th>
                  <Th>status</Th>
                  <Th>posse</Th>
                  <Th>criado</Th>
                </tr>
              </thead>
              <tbody>
                {cust.map((l) => {
                  const casa = Math.round((l.price_cents * l.commission_pct) / 100);
                  return (
                    <tr
                      key={l.id}
                      // inline e não classe: `.wiki-table tbody tr:nth-child(even)`
                      // pinta o fundo das linhas pares e ganharia de uma utility.
                      style={
                        l.alarme ? { background: "rgba(200,67,59,0.1)" } : undefined
                      }
                    >
                      <td>
                        <Num v={l.id} tom="apagado" />
                      </td>
                      <td>
                        <span className="flex items-center gap-2">
                          <L2Icon itemId={l.item_id} size={28} />
                          <span className="whitespace-nowrap">
                            <span className="text-[var(--color-parchment)]">
                              #{l.item_id}
                            </span>
                            {l.enchant > 0 ? (
                              <span className="ml-1 text-[var(--color-gold-bright)]">
                                +{l.enchant}
                              </span>
                            ) : null}
                            <span className="ml-2 text-[0.72rem] text-[var(--color-faint)]">
                              obj {l.item_object_id}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td>
                        <Num v={l.count} />
                      </td>
                      <td>
                        <span className="whitespace-nowrap">
                          <span className="text-[var(--color-parchment)]">
                            {l.seller_char_name}
                          </span>
                          <span className="ml-2 text-[0.72rem] text-[var(--color-faint)]">
                            {l.seller_username ?? `uid ${l.seller_uid}`}
                          </span>
                        </span>
                      </td>
                      <td>
                        <Usd cents={l.price_cents} forte />
                      </td>
                      <td>
                        <Usd cents={casa} tom="credito" />
                      </td>
                      <td>
                        <Usd cents={l.price_cents - casa} tom="apagado" />
                      </td>
                      <td>
                        <Selo valor={l.status} />
                        {l.reserved_until ? (
                          <div className="mt-1">
                            <Data v={l.reserved_until} />
                          </div>
                        ) : null}
                      </td>
                      <td>
                        {l.em_custodia ? (
                          l.divergente ? (
                            <>
                              <Selo valor="divergente" variante="aviso" />
                              <div className="mt-1 text-[0.72rem] text-[#e2857c]">
                                cofre: {l.custody_count}× +{l.custody_enchant}
                              </div>
                            </>
                          ) : (
                            <Selo valor="em custódia" variante="ok" />
                          )
                        ) : l.status === "pending_escrow" ? (
                          <Selo valor="aguardando escrow" variante="pendente" />
                        ) : (
                          <Selo valor="ausente" variante="aviso" />
                        )}
                      </td>
                      <td>
                        <Data v={l.created_at} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Quadro>
        )}
      </Secao>

      {/* ------------------------------------------------------- receita */}
      <Secao
        rotulo="§ 2 · resultado"
        titulo="Receita da casa"
        nota={
          <>
            Sai de <code>rmt_house_ledger</code> — uma linha imutável por venda,
            com a comissão que valia naquele dia. Não é derivada de{" "}
            <code>rmt_listings</code> de propósito: taxa derivada reescreve o
            passado no dia em que a comissão mudar.
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          {/* a folha — o mesmo objeto gráfico da página pública /marketplace */}
          <aside className="rmt-folha self-start">
            <div className="rmt-folha-topo">
              <span>receita acumulada</span>
              <span>
                {rec.vendas} venda{rec.vendas === 1 ? "" : "s"}
              </span>
            </div>
            <div className="rmt-linha">
              <span>Bruto transacionado</span>
              <span>{usd(rec.bruto_cents)}</span>
            </div>
            <div className="rmt-linha neg">
              <span>Repassado aos vendedores</span>
              <span>−{usd(rec.vendedores_cents)}</span>
            </div>
            <div className="rmt-linha tot">
              <span>Margem da casa · {margemPct}%</span>
              <span>{usd(rec.casa_cents)}</span>
            </div>
            <p className="mt-4 text-[0.72rem] leading-snug text-[var(--color-faint)]">
              Margem <b className="text-[var(--color-muted)]">bruta</b>. Antes de
              servidor, taxa de gateway e imposto — não é lucro distribuível
              entre os sócios, é o topo da conta.
            </p>
            {rec.estornos > 0 ? (
              <p className="nota nota-cliente mt-3">
                <span>
                  {rec.estornos} venda(s) estornada(s), {usd(rec.estornado_cents)}{" "}
                  — fora de todos os totais acima.
                </span>
              </p>
            ) : null}
          </aside>

          {rec.meses.length === 0 ? (
            <Vazio texto="Nenhuma venda liquidada ainda — o razão da casa só recebe linha quando o pagamento confirma, e o gateway não está integrado." />
          ) : (
            <Quadro>
              <table className="wiki-table">
                <thead>
                  <tr>
                    <Th>mês</Th>
                    <Th num>vendas</Th>
                    <Th num>bruto</Th>
                    <Th num>vendedores</Th>
                    <Th num>casa</Th>
                    <Th num>margem</Th>
                  </tr>
                </thead>
                <tbody>
                  {rec.meses.map((m) => (
                    <tr key={m.mes}>
                      <td className="whitespace-nowrap text-[var(--color-parchment)]">
                        {m.mes}
                      </td>
                      <td>
                        <Num v={m.vendas} />
                      </td>
                      <td>
                        <Usd cents={m.bruto_cents} />
                      </td>
                      <td>
                        <Usd cents={m.vendedores_cents} tom="debito" />
                      </td>
                      <td>
                        <Usd cents={m.casa_cents} tom="credito" forte />
                      </td>
                      <td>
                        <span
                          style={{
                            display: "block",
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                            color: "var(--color-faint)",
                          }}
                        >
                          {m.bruto_cents > 0
                            ? `${((m.casa_cents / m.bruto_cents) * 100).toFixed(1)}%`
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Quadro>
          )}
        </div>
      </Secao>

      {/* ----------------------------------------------------- carteiras */}
      <Secao
        rotulo="§ 3 · passivo"
        titulo="Carteiras dos vendedores"
        nota={
          <>
            As três colunas de dinheiro são coisas diferentes:{" "}
            <b className="text-[var(--color-parchment)]">sacável</b> pode sair
            hoje; <b className="text-[var(--color-parchment)]">carência</b> é
            venda que ainda pode ser estornada;{" "}
            <b className="text-[var(--color-parchment)]">em saque</b> é dinheiro
            que JÁ saiu do saldo e está a caminho do vendedor. Somar as três como
            &quot;saldo&quot; contaria o saque duas vezes.
          </>
        }
      >
        {cart.length === 0 ? (
          <Vazio texto="Nenhuma carteira criada. A primeira nasce na primeira venda liquidada." />
        ) : (
          <Quadro>
            <table className="wiki-table">
              <thead>
                <tr>
                  <Th num>uid</Th>
                  <Th>usuário</Th>
                  <Th num>sacável</Th>
                  <Th num>carência</Th>
                  <Th>libera em</Th>
                  <Th num>em saque</Th>
                  <Th num>acumulado</Th>
                </tr>
              </thead>
              <tbody>
                {cart.map((w) => (
                  <tr
                    key={w.user_id}
                    style={
                      w.held_divergente
                        ? { background: "rgba(200,67,59,0.1)" }
                        : undefined
                    }
                  >
                    <td>
                      <Num v={w.user_id} tom="apagado" />
                    </td>
                    <td>
                      <span className="whitespace-nowrap">
                        <span className="text-[var(--color-parchment)]">
                          {w.username ?? "—"}
                        </span>
                        <span className="ml-2 text-[0.72rem] text-[var(--color-faint)]">
                          {w.email ?? ""}
                        </span>
                      </span>
                    </td>
                    <td>
                      <Usd cents={w.balance_cents} tom="credito" forte />
                    </td>
                    <td>
                      <Usd cents={w.held_cents} />
                      {w.held_divergente ? (
                        // held_cents (agregado) e a soma das travas são
                        // escritos na mesma transação — divergir é bug, e o
                        // painel é o único lugar onde isso ficaria visível.
                        <div className="mt-1 text-[0.72rem] text-[#e2857c]">
                          travas somam {usd(w.carencia_cents)}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <Data v={w.proxima_liberacao} />
                    </td>
                    <td>
                      <Usd cents={w.pending_cents} tom="debito" />
                    </td>
                    <td>
                      <Usd cents={w.lifetime_cents} tom="apagado" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Quadro>
        )}
      </Secao>

      {/* -------------------------------------------------------- saques */}
      <Secao
        rotulo="§ 4 · saída de caixa"
        titulo="Saques pedidos"
        nota="Pendentes primeiro — são os que esperam um sócio pagar por fora e marcar. Esta tela não marca nada."
      >
        {saq.length === 0 ? (
          <Vazio texto="Nenhum saque pedido." />
        ) : (
          <Quadro>
            <table className="wiki-table">
              <thead>
                <tr>
                  <Th num>#</Th>
                  <Th>usuário</Th>
                  <Th num>valor</Th>
                  <Th>método</Th>
                  <Th>destino</Th>
                  <Th>status</Th>
                  <Th>pedido</Th>
                  <Th>processado</Th>
                </tr>
              </thead>
              <tbody>
                {saq.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Num v={p.id} tom="apagado" />
                    </td>
                    <td>
                      <span className="whitespace-nowrap">
                        <span className="text-[var(--color-parchment)]">
                          {p.username ?? `uid ${p.user_id}`}
                        </span>
                        <span className="ml-2 text-[0.72rem] text-[var(--color-faint)]">
                          {p.email ?? ""}
                        </span>
                      </span>
                    </td>
                    <td>
                      <Usd cents={p.amount_cents} tom="debito" forte />
                    </td>
                    <td className="uppercase text-[0.72rem] tracking-[0.14em] text-[var(--color-muted)]">
                      {p.method}
                    </td>
                    <td
                      className="max-w-[18rem] truncate text-[0.8rem] text-[var(--color-muted)]"
                      title={p.destination}
                    >
                      {p.destination}
                    </td>
                    <td>
                      <Selo valor={p.status} />
                    </td>
                    <td>
                      <Data v={p.created_at} />
                    </td>
                    <td>
                      <Data v={p.processed_at} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Quadro>
        )}
      </Secao>

      {/* ---------------------------------------------------- ops presas */}
      <Secao
        rotulo="§ 5 · itens parados"
        titulo="Operações de item presas"
        alerta={ops.length > 0}
        nota={
          <>
            <code>failed</code> é tentativa que não deu (inventário cheio, peso).{" "}
            <code>pending</code> há mais de 24h é op que ninguém consumiu — ou o
            dono não voltou ao jogo, ou o consumidor do lado do GameServer está
            parado. Nos dois casos há um item que não chegou a quem é dele.
          </>
        }
      >
        {ops.length === 0 ? (
          <Vazio texto="Nenhuma op presa. Toda entrega e devolução dos últimos 24h foi consumida pelo jogo." />
        ) : (
          <Quadro>
            <table className="wiki-table">
              <thead>
                <tr>
                  <Th num>#</Th>
                  <Th>op</Th>
                  <Th num>anúncio</Th>
                  <Th>item</Th>
                  <Th num>valor</Th>
                  <Th>destino</Th>
                  <Th>status</Th>
                  <Th num>parada há</Th>
                  <Th>criada</Th>
                </tr>
              </thead>
              <tbody>
                {ops.map((o) => (
                  <tr key={o.id} style={{ background: "rgba(200,67,59,0.08)" }}>
                    <td>
                      <Num v={o.id} tom="apagado" />
                    </td>
                    <td className="uppercase text-[0.72rem] tracking-[0.14em] text-[var(--color-gold-bright)]">
                      {o.op}
                    </td>
                    <td>
                      <Num v={o.listing_id} />
                      {o.listing_status ? (
                        <div className="mt-1 text-right text-[0.7rem] text-[var(--color-faint)]">
                          {o.listing_status}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span className="flex items-center gap-2">
                        {o.item_id != null ? (
                          <L2Icon itemId={o.item_id} size={24} />
                        ) : null}
                        <span className="whitespace-nowrap">
                          <span className="text-[var(--color-parchment)]">
                            #{o.item_id ?? "?"}
                          </span>
                          {o.enchant ? (
                            <span className="ml-1 text-[var(--color-gold-bright)]">
                              +{o.enchant}
                            </span>
                          ) : null}
                          <span className="ml-2 text-[0.72rem] text-[var(--color-faint)]">
                            obj {o.item_object_id}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <Usd cents={o.price_cents} />
                    </td>
                    <td className="whitespace-nowrap text-[0.8rem] text-[var(--color-muted)]">
                      {/* `to_user_id` é a forma nova (a op pertence à CONTA, o
                          personagem é escolhido em jogo); `to_char_obj_id`
                          continua existindo como preferência. Mostrar os dois
                          é o que permite ver uma op da era antiga apontando
                          para um personagem possivelmente deletado. */}
                      {o.to_user_id != null ? (
                        <>conta {o.to_user_id}</>
                      ) : o.to_char_obj_id != null ? (
                        <>char {o.to_char_obj_id}</>
                      ) : o.from_char_obj_id != null ? (
                        <>de char {o.from_char_obj_id}</>
                      ) : (
                        "—"
                      )}
                      {o.seller_char_name ? (
                        <span className="ml-2 text-[0.72rem] text-[var(--color-faint)]">
                          {o.seller_char_name}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <Selo valor={o.status} />
                    </td>
                    <td>
                      <Num v={o.horas} tom="alarme" />
                    </td>
                    <td>
                      <Data v={o.created_at} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Quadro>
        )}
      </Secao>

      {/* ----------------------------------------------------- auditoria */}
      <Secao
        rotulo="§ 6 · trilha"
        titulo="Auditoria"
        nota={
          <>
            <code>rmt_audit</code> é append-only: nada no código dá UPDATE ou
            DELETE nela. O ator diz de onde veio a linha —{" "}
            <code>game:&lt;char&gt;</code>, <code>site:&lt;uid&gt;</code>,{" "}
            <code>admin:&lt;uid&gt;</code> ou <code>system</code>. Valores em
            centavos, com sinal: débito é negativo.
          </>
        }
      >
        {aud.length === 0 ? (
          <Vazio texto="Trilha vazia. Nada registrado ainda — as gravações entram junto com o fluxo de pagamento." />
        ) : (
          <Quadro>
            <table className="wiki-table">
              <thead>
                <tr>
                  <Th num>#</Th>
                  <Th>quando</Th>
                  <Th>ator</Th>
                  <Th>ação</Th>
                  <Th num>anúncio</Th>
                  <Th num>uid</Th>
                  <Th num>valor</Th>
                  <Th>detalhe</Th>
                </tr>
              </thead>
              <tbody>
                {aud.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Num v={a.id} tom="apagado" />
                    </td>
                    <td>
                      <Data v={a.at} />
                    </td>
                    <td className="whitespace-nowrap text-[0.8rem] text-[var(--color-muted)]">
                      {a.actor}
                    </td>
                    <td className="uppercase text-[0.72rem] tracking-[0.14em] text-[var(--color-gold-bright)]">
                      {a.action}
                    </td>
                    <td>
                      <Num v={a.listing_id} tom="apagado" />
                    </td>
                    <td>
                      <Num v={a.user_id} tom="apagado" />
                    </td>
                    <td>
                      {a.cents == null ? (
                        <Num v={null} tom="apagado" />
                      ) : (
                        <Usd
                          cents={a.cents}
                          tom={a.cents < 0 ? "debito" : "credito"}
                        />
                      )}
                    </td>
                    <td
                      className="max-w-[22rem] truncate text-[0.8rem] text-[var(--color-faint)]"
                      title={a.detail ?? ""}
                    >
                      {a.detail ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Quadro>
        )}
      </Secao>

      <footer
        className="mt-16 border-t pt-6 text-[0.72rem] leading-relaxed text-[var(--color-faint)]"
        style={{ borderColor: "rgba(201,162,75,0.2)" }}
      >
        Acesso concedido por <code>web_users.is_admin = 1</code> — não há tela
        que promova ninguém, de propósito (ver{" "}
        <code>db/migrations/007_admin_role.sql</code>). Leitura direta do banco{" "}
        <code>l2jversush5</code>, sem cache.
      </footer>
    </>
  );
}
