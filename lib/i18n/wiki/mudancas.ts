/** Dicionário do códice — área "mudancas". Ver lib/i18n/wiki-dict.ts. */
type Dict = Record<string, string>;

/*
 * O QUE MORA AQUI E O QUE NÃO MORA.
 *
 * A moldura do feed do diff (/wiki/mudancas). Os rótulos curtos que a página
 * usa — "alterações datadas", "dias de trabalho", "Ver as {n}", "Sem data na
 * fonte" — JÁ estavam em `wiki-dict.ts` como `wiki.mud.*` porque o rail do
 * códice também os consome. Este módulo só acrescenta o que era texto cravado
 * no JSX: metadados, a chamada de abertura e os dois parágrafos de ressalva.
 * Redefinir aqui uma chave da base sobrescreveria a base em silêncio.
 *
 * DATA POR EXTENSO NÃO VEM DAQUI. "18 de agosto de 2026" não é string de
 * interface: a página formata com `Intl.DateTimeFormat` no locale corrente.
 * Doze nomes de mês × quatro idiomas num dicionário é trabalho que o runtime
 * já faz certo, inclusive a ordem (em inglês o dia vem antes do mês, em russo
 * o ano leva "г.").
 *
 * PLURAL. `wiki.mud.ver_as` ("Ver as {n}") já fixou a convenção da área: a
 * frase assume plural, porque na prática a contagem é de dezenas. Em PT e EN
 * as ressalvas seguem a mesma convenção. Em RU e PL não seguem, e de
 * propósito: lá o substantivo declina com o número (2–4 contra 5+) e "эти 3
 * изменений" é erro gramatical visível para quem lê o idioma. Nos dois a
 * frase foi reescrita para o número ficar fora da concordância
 * ("Таких изменений {n}." / "Takich zmian jest {n}.").
 */

export const mudancasPt: Dict = {
  "wiki.mud.meta.titulo": "O que mudou — linha do tempo | Wiki L2 Versus",
  "wiki.mud.meta.descricao":
    "Todas as alterações do L2 Versus em relação ao High Five original, em ordem cronológica: jóias, SA de armas, masterwork, conjuntos, augments e armas de herói.",
  "wiki.mud.intro":
    "As seções do códice respondem *como funciona*. Esta página responde *o que mudou* — em ordem, da alteração mais recente para a mais antiga. Se você já joga aqui, é por ela que dá para saber o que vale reler.",
  "wiki.mud.fora_contagem_1":
    "Fora desta contagem: **{lista}** — essa seção ainda não foi extraída da fonte. A linha do tempo cresce quando ela entrar.",
  "wiki.mud.fora_contagem_n":
    "Fora desta contagem: **{lista}** — essas seções ainda não foram extraídas da fonte. A linha do tempo cresce quando elas entrarem.",
  "wiki.mud.sem_data_texto":
    "Estas {n} alterações estão documentadas e valem em jogo, mas o arquivo-fonte não registrou *quando* foram feitas. Ficam aqui em vez de receberem uma data inventada — e sobem para a linha do tempo no dia em que a fonte disser a data.",
};

export const mudancasEn: Dict = {
  "wiki.mud.meta.titulo": "What changed — the timeline | L2 Versus Wiki",
  "wiki.mud.meta.descricao":
    "Every change L2 Versus makes to retail High Five, in chronological order: jewels, weapon SAs, Masterwork, armour sets, augments and hero weapons.",
  "wiki.mud.intro":
    "The codex sections answer *how it works*. This page answers *what changed* — in order, from the most recent change to the oldest. If you already play here, this is the page that tells you what is worth re-reading.",
  "wiki.mud.fora_contagem_1":
    "Outside this count: **{lista}** — that section has not been extracted from the source yet. The timeline grows when it arrives.",
  "wiki.mud.fora_contagem_n":
    "Outside this count: **{lista}** — those sections have not been extracted from the source yet. The timeline grows when they arrive.",
  "wiki.mud.sem_data_texto":
    "These {n} changes are documented and do apply in game, but the source file did not record *when* they were made. They stay here instead of getting an invented date — and they move up into the timeline the day the source states it.",
};

export const mudancasRu: Dict = {
  "wiki.mud.meta.titulo": "Что изменилось — хронология | Вики L2 Versus",
  "wiki.mud.meta.descricao":
    "Все изменения L2 Versus по сравнению с оригинальным High Five, в хронологическом порядке: бижутерия, SA оружия, Masterwork, комплекты брони, augment и оружие героя.",
  "wiki.mud.intro":
    "Разделы кодекса отвечают на вопрос *как это работает*. Эта страница отвечает на другой — *что изменилось*: по порядку, от самого свежего изменения к самому давнему. Если вы здесь уже играете, именно по ней видно, что стоит перечитать.",
  "wiki.mud.fora_contagem_1":
    "Вне этого подсчёта: **{lista}** — этот раздел ещё не извлечён из источника. Хронология пополнится, когда он появится.",
  "wiki.mud.fora_contagem_n":
    "Вне этого подсчёта: **{lista}** — эти разделы ещё не извлечены из источника. Хронология пополнится, когда они появятся.",
  "wiki.mud.sem_data_texto":
    "Таких изменений {n}. Все они задокументированы и действуют в игре, но исходный файл не зафиксировал, *когда* их внесли. Они остаются здесь вместо выдуманной даты — и поднимутся в хронологию в тот день, когда источник укажет её.",
};

export const mudancasPl: Dict = {
  "wiki.mud.meta.titulo": "Co się zmieniło — oś czasu | Wiki L2 Versus",
  "wiki.mud.meta.descricao":
    "Wszystkie zmiany L2 Versus względem oryginalnego High Five, w kolejności chronologicznej: biżuteria, SA broni, Masterwork, komplety pancerzy, augmenty i bronie bohatera.",
  "wiki.mud.intro":
    "Działy kodeksu odpowiadają na pytanie *jak to działa*. Ta strona odpowiada na pytanie *co się zmieniło* — po kolei, od najnowszej zmiany do najstarszej. Jeśli już tutaj grasz, to właśnie z niej dowiesz się, co warto przeczytać ponownie.",
  "wiki.mud.fora_contagem_1":
    "Poza tym zestawieniem: **{lista}** — ten dział nie został jeszcze wyciągnięty ze źródła. Oś czasu urośnie, gdy się pojawi.",
  "wiki.mud.fora_contagem_n":
    "Poza tym zestawieniem: **{lista}** — te działy nie zostały jeszcze wyciągnięte ze źródła. Oś czasu urośnie, gdy się pojawią.",
  "wiki.mud.sem_data_texto":
    "Takich zmian jest {n}. Wszystkie są udokumentowane i obowiązują w grze, ale plik źródłowy nie zapisał, *kiedy* je wprowadzono. Zostają tutaj, zamiast dostać wymyśloną datę — i trafią na oś czasu w dniu, w którym źródło poda datę.",
};
