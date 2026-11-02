/** Dicionário do códice — área "comuns". Ver lib/i18n/wiki-dict.ts. */

/**
 * ESCOPO: a moldura que repete em TODA seção do códice — a ficha de entrada
 * (`EntradaCard`), o estado de seção indisponível e os rótulos soltos da
 * página de seção. Prefixo `wiki.ui.*`.
 *
 * Quatro chaves aqui saem IGUAIS nos quatro idiomas de propósito — `grade`,
 * `selo_skill`, `selo_item` e (fora do russo) `boss`. São rótulos que o
 * jogador lê no cliente, que é inglês em qualquer locale: traduzir "Grade"
 * para "Grau" faria o leitor procurar no cliente uma palavra que não existe
 * lá. Ficam no dicionário mesmo assim, e não cravados no JSX, porque o lugar
 * de decidir isso é aqui — cravado, a próxima pessoa traduz sem saber do
 * motivo.
 *
 * O que NÃO está aqui: nada que revele caminho ou nome de arquivo interno.
 * O `detalhe` do erro de carregamento ("content/wiki/X.json não existe…")
 * deixou de ser desenhado — ver `lib/wiki/procedencia.ts`. A mensagem que
 * sobra diz ao jogador o que aconteceu, sem a tripa do servidor.
 */
type Dict = Record<string, string>;

export const comunsPt: Dict = {
  // --- ficha de entrada (EntradaCard) ---
  "wiki.ui.boss": "Boss",
  "wiki.ui.grade": "Grade",
  "wiki.ui.selo_skill": "skill",
  "wiki.ui.selo_item": "item",
  "wiki.ui.nota_cliente.titulo": "A descrição no cliente está desatualizada.",
  "wiki.ui.nota_cliente.fecho": "O que vale em jogo é o valor desta página.",
  "wiki.ui.regra_duplicata": "Com duas iguais equipadas, só o efeito de uma é aplicado.",
  "wiki.ui.alterado_em": "alterado em {d}",

  // --- seção indisponível ---
  "wiki.ui.indisp.preparacao":
    "Esta seção ainda está sendo transcrita dos arquivos-fonte do servidor. O conteúdo existe e está preservado — só não passou pela conversão para cá ainda.",
  "wiki.ui.indisp.falha":
    "Esta seção existe mas não pôde ser carregada. Isso é um erro de dado, não uma seção vazia — e está aparecendo aqui de propósito, para não passar em silêncio.",

  // --- página de seção ---
  "wiki.ui.meta.pagina_n": "(página {n})",
  "wiki.ui.nao_definido": "não definido",
};

export const comunsEn: Dict = {
  "wiki.ui.boss": "Boss",
  "wiki.ui.grade": "Grade",
  "wiki.ui.selo_skill": "skill",
  "wiki.ui.selo_item": "item",
  "wiki.ui.nota_cliente.titulo": "The description in the client is out of date.",
  "wiki.ui.nota_cliente.fecho": "What counts in game is the value on this page.",
  "wiki.ui.regra_duplicata": "With two identical ones equipped, only one effect is applied.",
  "wiki.ui.alterado_em": "changed on {d}",

  "wiki.ui.indisp.preparacao":
    "This section is still being transcribed from the server source files. The content exists and is preserved — it just hasn't gone through the conversion over to here yet.",
  "wiki.ui.indisp.falha":
    "This section exists but could not be loaded. That is a data error, not an empty section — and it is showing up here on purpose, so it does not pass in silence.",

  "wiki.ui.meta.pagina_n": "(page {n})",
  "wiki.ui.nao_definido": "not defined",
};

export const comunsRu: Dict = {
  "wiki.ui.boss": "Босс",
  "wiki.ui.grade": "Grade",
  "wiki.ui.selo_skill": "skill",
  "wiki.ui.selo_item": "item",
  "wiki.ui.nota_cliente.titulo": "Описание в клиенте устарело.",
  "wiki.ui.nota_cliente.fecho": "В игре действует значение с этой страницы.",
  "wiki.ui.regra_duplicata":
    "Если надеты две одинаковые, применяется эффект только одной из них.",
  "wiki.ui.alterado_em": "изменено {d}",

  "wiki.ui.indisp.preparacao":
    "Этот раздел ещё переносится из исходных файлов сервера. Материал существует и сохранён — он просто пока не прошёл преобразование для этой страницы.",
  "wiki.ui.indisp.falha":
    "Раздел существует, но загрузить его не удалось. Это ошибка данных, а не пустой раздел — и она показана здесь намеренно, чтобы не пройти незамеченной.",

  "wiki.ui.meta.pagina_n": "(страница {n})",
  "wiki.ui.nao_definido": "не определено",
};

export const comunsPl: Dict = {
  "wiki.ui.boss": "Boss",
  "wiki.ui.grade": "Grade",
  "wiki.ui.selo_skill": "skill",
  "wiki.ui.selo_item": "item",
  "wiki.ui.nota_cliente.titulo": "Opis w kliencie jest nieaktualny.",
  "wiki.ui.nota_cliente.fecho": "W grze obowiązuje wartość z tej strony.",
  "wiki.ui.regra_duplicata":
    "Przy dwóch jednakowych założonych działa efekt tylko jednej z nich.",
  "wiki.ui.alterado_em": "zmieniono {d}",

  "wiki.ui.indisp.preparacao":
    "Ten dział jest jeszcze przepisywany z plików źródłowych serwera. Treść istnieje i jest zachowana — po prostu nie przeszła jeszcze konwersji na tę stronę.",
  "wiki.ui.indisp.falha":
    "Ten dział istnieje, ale nie udało się go wczytać. To błąd danych, a nie pusty dział — i pokazuje się tutaj celowo, żeby nie przeszedł niezauważony.",

  "wiki.ui.meta.pagina_n": "(strona {n})",
  "wiki.ui.nao_definido": "nieokreślone",
};
