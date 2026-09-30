/**
 * Dicionário do CÓDICE (o wiki). Namespace `wiki.*`.
 *
 * Separado do `site-dict.ts` porque o vocabulário é outro: o site vende, o
 * códice documenta. Misturar os dois num arquivo só já estava começando a
 * produzir chaves ambíguas ("rates" do site ≠ "rates" da linha de base).
 *
 * ESCOPO: só a MOLDURA — rótulos, títulos de seção, avisos, navegação. O
 * CONTEÚDO das 733 entradas (títulos, rótulos de efeito, valores, prosa)
 * continua vindo dos JSON em `content/wiki/`, em português, e é um trabalho
 * de tradução à parte: 3.278 strings distintas / 33.445 palavras, medidas —
 * não cabe num dicionário escrito à mão e não se resolve por máquina sem
 * arriscar corromper número e termo de jogo (Bleed, Icarus, Atk.Spd não se
 * traduzem; "de 12% a 42%" não pode virar outra coisa).
 *
 * Regra de tradução aqui: termo que aparece NA TELA DO JOGO fica como está
 * nos quatro idiomas. O cliente do jogador diz "Max HP" em qualquer locale;
 * traduzir no wiki faria o leitor procurar no cliente uma coisa que não
 * existe lá.
 */

type Dict = Record<string, string>;

export const wikiPt: Dict = {
  "wiki.diferenca_ideia": "A diferença, em uma ideia",
  "wiki.degrau": "Degrau",
  "wiki.como_se_obtem": "Como se obtém",
  // --- navegação / moldura ---
  "wiki.codice": "O códice",
  "wiki.indice": "Índice do wiki",
  "wiki.migalha.codice": "Códice",
  "wiki.porta.linha_de_base": "A linha de base",
  "wiki.porta.classes": "Classes",
  "wiki.porta.mudancas": "O que mudou",
  "wiki.rail.nota":
    "Todo número desta seção foi lido dos arquivos do servidor, não da descrição que aparece no cliente. Quando os dois divergem, o que vale em jogo é o daqui.",
  "wiki.continua": "O códice continua.",
  "wiki.todas_secoes": "Todas as seções",

  // --- balança ---
  "wiki.antes": "Antes",
  "wiki.agora": "Agora",
  "wiki.estado_atual": "Estado atual",
  "wiki.novo": "Novo",
  "wiki.nao_existe_original": "Não existe no jogo original",
  "wiki.sem_antes_entrada":
    "O arquivo-fonte registrou só o valor que vale hoje, sem o valor anterior. Não inventamos o “antes”.",
  "wiki.sem_antes_secao":
    "Nesta seção o arquivo-fonte registrou só os valores que valem hoje, sem os valores anteriores. Não inventamos o “antes” — quando ele aparecer na fonte, entra em cada entrada.",

  // --- seção ---
  "wiki.entrada": "entrada",
  "wiki.entradas": "entradas",
  "wiki.fonte": "fonte",
  "wiki.como_ler": "Como ler esta seção",
  "wiki.notas": "notas",
  "wiki.nota": "nota",

  // --- paginação ---
  "wiki.pag.rotulo": "Paginação das entradas",
  "wiki.pag.anterior": "Página anterior",
  "wiki.pag.proxima": "Próxima página",
  "wiki.pag.de": "de",
  "wiki.pag.pagina_n_de_m": "página {n} de {m}",

  // --- estados ---
  "wiki.em_preparacao": "em preparação",
  "wiki.falha_carregar": "falha ao carregar",

  // --- seções (título + chamada) ---
  "wiki.sec.joias-boss.titulo": "Jóias de Boss",
  "wiki.sec.joias-boss.chamada":
    "Três degraus por jóia onde o original tem um só — e como obter cada um.",
  "wiki.sec.armas-sa.titulo": "SA das Armas",
  "wiki.sec.armas-sa.chamada":
    "As Soul Abilities que foram trocadas, arma por arma, com o que saiu e o que entrou.",
  "wiki.sec.masterwork.titulo": "Masterwork",
  "wiki.sec.masterwork.chamada": "O bônus de cada família Masterwork de arma e de peito.",
  "wiki.sec.conjuntos.titulo": "Conjuntos de Armadura",
  "wiki.sec.conjuntos.chamada":
    "A escada de encantamento +4 a +10 que o jogo original não tem, e o bônus de cada conjunto.",
  "wiki.sec.augments.titulo": "Augment e Lifestone",
  "wiki.sec.augments.chamada": "O que cada Lifestone pode entregar na arma.",
  "wiki.sec.armas-heroi.titulo": "Armas de Herói",
  "wiki.sec.armas-heroi.chamada": "O arsenal da Olympíada e o que mudou nele.",
  "wiki.sec.skills.titulo": "Skills Alteradas",
  "wiki.sec.skills.chamada":
    "Toda habilidade com valor mexido, sempre com o de antes e o de agora.",
  "wiki.sec.skills-sem-slot.titulo": "Skills sem Vaga de Buff",
  "wiki.sec.skills-sem-slot.chamada":
    "As habilidades que não disputam vaga e não derrubam os seus buffs.",

  // --- classes ---
  "wiki.cls.linhagem": "A linhagem",
  "wiki.cls.atributos": "Atributos base",
  "wiki.cls.class_id": "Class ID",
  "wiki.cls.raca": "Raça",
  "wiki.cls.funcao": "Função",
  "wiki.cls.nivel": "Nível",
  "wiki.cls.armas": "Armas que as skills exigem",
  "wiki.cls.skills": "Skills",
  "wiki.cls.evolui_para": "Evolui para",
  "wiki.cls.irmas": "No mesmo degrau",
  "wiki.cls.profissao_1": "1ª profissão",
  "wiki.cls.profissao_2": "2ª profissão",
  "wiki.cls.profissao_3": "3ª profissão",
  "wiki.cls.classe_base": "Classe base",

  // --- o que mudou ---
  "wiki.mud.titulo": "O que mudou, e quando",
  "wiki.mud.linha_do_tempo": "A linha do tempo",
  "wiki.mud.datadas": "alterações datadas",
  "wiki.mud.dias": "dias de trabalho",
  "wiki.mud.sem_data_conta": "sem data na fonte",
  "wiki.mud.sem_data_titulo": "Sem data na fonte",
  "wiki.mud.ver_as": "Ver as {n}",
  "wiki.mud.alteracao": "alteração",
  "wiki.mud.alteracoes": "alterações",
};

export const wikiEn: Dict = {
  "wiki.diferenca_ideia": "The difference, in one idea",
  "wiki.degrau": "Tier",
  "wiki.como_se_obtem": "How to get it",
  "wiki.codice": "The codex",
  "wiki.indice": "Wiki index",
  "wiki.migalha.codice": "Codex",
  "wiki.porta.linha_de_base": "The baseline",
  "wiki.porta.classes": "Classes",
  "wiki.porta.mudancas": "What changed",
  "wiki.rail.nota":
    "Every number in this section was read from the server files, not from the description shown in the client. When the two disagree, what counts in game is what you read here.",
  "wiki.continua": "The codex goes on.",
  "wiki.todas_secoes": "All sections",

  "wiki.antes": "Before",
  "wiki.agora": "Now",
  "wiki.estado_atual": "Current state",
  "wiki.novo": "New",
  "wiki.nao_existe_original": "Does not exist in the original game",
  "wiki.sem_antes_entrada":
    "The source file recorded only the value in force today, without the previous one. We do not invent the “before”.",
  "wiki.sem_antes_secao":
    "In this section the source file recorded only the values in force today, without the previous ones. We do not invent the “before” — when it shows up in the source, it goes into each entry.",

  "wiki.entrada": "entry",
  "wiki.entradas": "entries",
  "wiki.fonte": "source",
  "wiki.como_ler": "How to read this section",
  "wiki.notas": "notes",
  "wiki.nota": "note",

  "wiki.pag.rotulo": "Entry pagination",
  "wiki.pag.anterior": "Previous page",
  "wiki.pag.proxima": "Next page",
  "wiki.pag.de": "of",
  "wiki.pag.pagina_n_de_m": "page {n} of {m}",

  "wiki.em_preparacao": "in preparation",
  "wiki.falha_carregar": "failed to load",

  "wiki.sec.joias-boss.titulo": "Boss Jewels",
  "wiki.sec.joias-boss.chamada":
    "Three tiers per jewel where the original has only one — and how to get each.",
  "wiki.sec.armas-sa.titulo": "Weapon SA",
  "wiki.sec.armas-sa.chamada":
    "The Soul Abilities that were swapped, weapon by weapon, with what left and what came in.",
  "wiki.sec.masterwork.titulo": "Masterwork",
  "wiki.sec.masterwork.chamada": "The bonus of every Masterwork weapon and chest family.",
  "wiki.sec.conjuntos.titulo": "Armor Sets",
  "wiki.sec.conjuntos.chamada":
    "The +4 to +10 enchant ladder the original game does not have, and each set's bonus.",
  "wiki.sec.augments.titulo": "Augment and Lifestone",
  "wiki.sec.augments.chamada": "What each Lifestone can deliver on the weapon.",
  "wiki.sec.armas-heroi.titulo": "Hero Weapons",
  "wiki.sec.armas-heroi.chamada": "The Olympiad arsenal and what changed in it.",
  "wiki.sec.skills.titulo": "Changed Skills",
  "wiki.sec.skills.chamada":
    "Every skill with a touched value, always with the before and the after.",
  "wiki.sec.skills-sem-slot.titulo": "Skills Without a Buff Slot",
  "wiki.sec.skills-sem-slot.chamada":
    "The skills that take no slot and do not knock your buffs off.",

  "wiki.cls.linhagem": "The lineage",
  "wiki.cls.atributos": "Base stats",
  "wiki.cls.class_id": "Class ID",
  "wiki.cls.raca": "Race",
  "wiki.cls.funcao": "Role",
  "wiki.cls.nivel": "Level",
  "wiki.cls.armas": "Weapons the skills require",
  "wiki.cls.skills": "Skills",
  "wiki.cls.evolui_para": "Evolves into",
  "wiki.cls.irmas": "Same tier",
  "wiki.cls.profissao_1": "1st class",
  "wiki.cls.profissao_2": "2nd class",
  "wiki.cls.profissao_3": "3rd class",
  "wiki.cls.classe_base": "Base class",

  "wiki.mud.titulo": "What changed, and when",
  "wiki.mud.linha_do_tempo": "The timeline",
  "wiki.mud.datadas": "dated changes",
  "wiki.mud.dias": "days of work",
  "wiki.mud.sem_data_conta": "undated in the source",
  "wiki.mud.sem_data_titulo": "Undated in the source",
  "wiki.mud.ver_as": "See the {n}",
  "wiki.mud.alteracao": "change",
  "wiki.mud.alteracoes": "changes",
};

export const wikiRu: Dict = {
  "wiki.diferenca_ideia": "Разница в одной мысли",
  "wiki.degrau": "Ступень",
  "wiki.como_se_obtem": "Как получить",
  "wiki.codice": "Кодекс",
  "wiki.indice": "Указатель вики",
  "wiki.migalha.codice": "Кодекс",
  "wiki.porta.linha_de_base": "Отправная точка",
  "wiki.porta.classes": "Классы",
  "wiki.porta.mudancas": "Что изменилось",
  "wiki.rail.nota":
    "Каждое число в этом разделе взято из файлов сервера, а не из описания в клиенте. Если они расходятся, в игре действует то, что написано здесь.",
  "wiki.continua": "Кодекс продолжается.",
  "wiki.todas_secoes": "Все разделы",

  "wiki.antes": "Было",
  "wiki.agora": "Стало",
  "wiki.estado_atual": "Текущее состояние",
  "wiki.novo": "Новое",
  "wiki.nao_existe_original": "В оригинальной игре отсутствует",
  "wiki.sem_antes_entrada":
    "В исходном файле записано только действующее сегодня значение, без прежнего. Мы не выдумываем «было».",
  "wiki.sem_antes_secao":
    "В этом разделе исходный файл сохранил только действующие сегодня значения, без прежних. Мы не выдумываем «было» — как только оно появится в источнике, оно попадёт в каждую запись.",

  "wiki.entrada": "запись",
  "wiki.entradas": "записей",
  "wiki.fonte": "источник",
  "wiki.como_ler": "Как читать этот раздел",
  "wiki.notas": "заметок",
  "wiki.nota": "заметка",

  "wiki.pag.rotulo": "Постраничная навигация",
  "wiki.pag.anterior": "Предыдущая страница",
  "wiki.pag.proxima": "Следующая страница",
  "wiki.pag.de": "из",
  "wiki.pag.pagina_n_de_m": "страница {n} из {m}",

  "wiki.em_preparacao": "в подготовке",
  "wiki.falha_carregar": "не удалось загрузить",

  "wiki.sec.joias-boss.titulo": "Босс-бижутерия",
  "wiki.sec.joias-boss.chamada":
    "Три ступени на каждое украшение там, где в оригинале одна — и как получить каждую.",
  "wiki.sec.armas-sa.titulo": "SA оружия",
  "wiki.sec.armas-sa.chamada":
    "Заменённые Soul Ability, оружие за оружием: что убрали и что поставили.",
  "wiki.sec.masterwork.titulo": "Masterwork",
  "wiki.sec.masterwork.chamada": "Бонус каждого семейства Masterwork — оружие и нагрудники.",
  "wiki.sec.conjuntos.titulo": "Комплекты брони",
  "wiki.sec.conjuntos.chamada":
    "Лестница заточки с +4 до +10, которой нет в оригинале, и бонус каждого комплекта.",
  "wiki.sec.augments.titulo": "Аугмент и Lifestone",
  "wiki.sec.augments.chamada": "Что каждый Lifestone может дать оружию.",
  "wiki.sec.armas-heroi.titulo": "Оружие героя",
  "wiki.sec.armas-heroi.chamada": "Арсенал Олимпиады и что в нём изменилось.",
  "wiki.sec.skills.titulo": "Изменённые умения",
  "wiki.sec.skills.chamada":
    "Каждое умение с изменённым значением — всегда «было» и «стало».",
  "wiki.sec.skills-sem-slot.titulo": "Умения без слота баффа",
  "wiki.sec.skills-sem-slot.chamada":
    "Умения, которые не занимают слот и не сбивают ваши баффы.",

  "wiki.cls.linhagem": "Линия развития",
  "wiki.cls.atributos": "Базовые характеристики",
  "wiki.cls.class_id": "Class ID",
  "wiki.cls.raca": "Раса",
  "wiki.cls.funcao": "Роль",
  "wiki.cls.nivel": "Уровень",
  "wiki.cls.armas": "Оружие, которое требуют умения",
  "wiki.cls.skills": "Умения",
  "wiki.cls.evolui_para": "Развивается в",
  "wiki.cls.irmas": "На той же ступени",
  "wiki.cls.profissao_1": "1-я профессия",
  "wiki.cls.profissao_2": "2-я профессия",
  "wiki.cls.profissao_3": "3-я профессия",
  "wiki.cls.classe_base": "Базовый класс",

  "wiki.mud.titulo": "Что изменилось и когда",
  "wiki.mud.linha_do_tempo": "Хронология",
  "wiki.mud.datadas": "изменений с датой",
  "wiki.mud.dias": "дней работы",
  "wiki.mud.sem_data_conta": "без даты в источнике",
  "wiki.mud.sem_data_titulo": "Без даты в источнике",
  "wiki.mud.ver_as": "Показать {n}",
  "wiki.mud.alteracao": "изменение",
  "wiki.mud.alteracoes": "изменений",
};

export const wikiPl: Dict = {
  "wiki.diferenca_ideia": "Różnica w jednym zdaniu",
  "wiki.degrau": "Stopień",
  "wiki.como_se_obtem": "Jak zdobyć",
  "wiki.codice": "Kodeks",
  "wiki.indice": "Indeks wiki",
  "wiki.migalha.codice": "Kodeks",
  "wiki.porta.linha_de_base": "Punkt odniesienia",
  "wiki.porta.classes": "Klasy",
  "wiki.porta.mudancas": "Co się zmieniło",
  "wiki.rail.nota":
    "Każda liczba w tym dziale pochodzi z plików serwera, a nie z opisu w kliencie. Gdy się różnią, w grze obowiązuje to, co tutaj.",
  "wiki.continua": "Kodeks trwa dalej.",
  "wiki.todas_secoes": "Wszystkie działy",

  "wiki.antes": "Przedtem",
  "wiki.agora": "Teraz",
  "wiki.estado_atual": "Stan obecny",
  "wiki.novo": "Nowe",
  "wiki.nao_existe_original": "Nie istnieje w oryginalnej grze",
  "wiki.sem_antes_entrada":
    "Plik źródłowy zapisał tylko wartość obowiązującą dziś, bez poprzedniej. Nie wymyślamy „przedtem”.",
  "wiki.sem_antes_secao":
    "W tym dziale plik źródłowy zapisał tylko wartości obowiązujące dziś, bez poprzednich. Nie wymyślamy „przedtem” — gdy pojawi się w źródle, trafi do każdego wpisu.",

  "wiki.entrada": "wpis",
  "wiki.entradas": "wpisów",
  "wiki.fonte": "źródło",
  "wiki.como_ler": "Jak czytać ten dział",
  "wiki.notas": "notatek",
  "wiki.nota": "notatka",

  "wiki.pag.rotulo": "Nawigacja po stronach",
  "wiki.pag.anterior": "Poprzednia strona",
  "wiki.pag.proxima": "Następna strona",
  "wiki.pag.de": "z",
  "wiki.pag.pagina_n_de_m": "strona {n} z {m}",

  "wiki.em_preparacao": "w przygotowaniu",
  "wiki.falha_carregar": "błąd wczytywania",

  "wiki.sec.joias-boss.titulo": "Biżuteria bossów",
  "wiki.sec.joias-boss.chamada":
    "Trzy stopnie na każdy przedmiot tam, gdzie oryginał ma jeden — i jak zdobyć każdy.",
  "wiki.sec.armas-sa.titulo": "SA broni",
  "wiki.sec.armas-sa.chamada":
    "Wymienione Soul Ability, broń po broni: co zniknęło i co weszło.",
  "wiki.sec.masterwork.titulo": "Masterwork",
  "wiki.sec.masterwork.chamada": "Bonus każdej rodziny Masterwork — broni i napierśników.",
  "wiki.sec.conjuntos.titulo": "Komplety pancerzy",
  "wiki.sec.conjuntos.chamada":
    "Drabina ulepszeń od +4 do +10, której nie ma w oryginale, oraz bonus każdego kompletu.",
  "wiki.sec.augments.titulo": "Augment i Lifestone",
  "wiki.sec.augments.chamada": "Co każdy Lifestone może dać broni.",
  "wiki.sec.armas-heroi.titulo": "Bronie bohaterów",
  "wiki.sec.armas-heroi.chamada": "Arsenał Olimpiady i co się w nim zmieniło.",
  "wiki.sec.skills.titulo": "Zmienione umiejętności",
  "wiki.sec.skills.chamada":
    "Każda umiejętność ze zmienioną wartością — zawsze z tym, co było, i z tym, co jest.",
  "wiki.sec.skills-sem-slot.titulo": "Umiejętności bez slotu buffa",
  "wiki.sec.skills-sem-slot.chamada":
    "Umiejętności, które nie zajmują slotu i nie zbijają twoich buffów.",

  "wiki.cls.linhagem": "Linia rozwoju",
  "wiki.cls.atributos": "Statystyki bazowe",
  "wiki.cls.class_id": "Class ID",
  "wiki.cls.raca": "Rasa",
  "wiki.cls.funcao": "Rola",
  "wiki.cls.nivel": "Poziom",
  "wiki.cls.armas": "Broń wymagana przez umiejętności",
  "wiki.cls.skills": "Umiejętności",
  "wiki.cls.evolui_para": "Rozwija się w",
  "wiki.cls.irmas": "Ten sam stopień",
  "wiki.cls.profissao_1": "1. profesja",
  "wiki.cls.profissao_2": "2. profesja",
  "wiki.cls.profissao_3": "3. profesja",
  "wiki.cls.classe_base": "Klasa bazowa",

  "wiki.mud.titulo": "Co się zmieniło i kiedy",
  "wiki.mud.linha_do_tempo": "Oś czasu",
  "wiki.mud.datadas": "zmian z datą",
  "wiki.mud.dias": "dni pracy",
  "wiki.mud.sem_data_conta": "bez daty w źródle",
  "wiki.mud.sem_data_titulo": "Bez daty w źródle",
  "wiki.mud.ver_as": "Pokaż {n}",
  "wiki.mud.alteracao": "zmiana",
  "wiki.mud.alteracoes": "zmian",
};
