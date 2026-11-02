/**
 * Dicionário do códice — área "classes" (a ÁRVORE). Ver lib/i18n/wiki-dict.ts.
 *
 * Prefixo `wiki.arv.*`. Os rótulos de ficha da página de uma classe já moram
 * no `wiki.cls.*` do dicionário base e são REUSADOS daqui — em especial
 * `wiki.cls.funcao` (o rótulo do filtro) e `wiki.cls.profissao_1/2/3` (os
 * cabeçalhos das colunas 1ª/2ª/3ª da árvore). Só o degrau zero ganhou chave
 * nova (`wiki.arv.tier.0`), porque "Classe inicial" não é "Classe base".
 *
 * TRÊS DECISÕES DE TRADUÇÃO QUE VALEM EXPLICAR:
 *
 * 1. Os cinco ARQUÉTIPOS (guerreiro, cavaleiro, ladino, mago, suporte) são
 *    classificação NOSSA — o servidor não guarda esse dado —, então são
 *    traduzidos. Ficam em minúscula de propósito: toda a interface os exibe
 *    com `text-transform: uppercase`, e a frase de procedência os cita no meio
 *    do texto corrido. Guardar em minúscula serve aos dois usos; guardar
 *    capitalizado estragaria a frase.
 *
 * 2. Nome de RAÇA segue o precedente do próprio códice: o português já dizia
 *    "Humano"/"Elfo Negro"/"Anão", não "Human"/"Dark Elf"/"Dwarf". Mantido, e
 *    traduzido nos outros três. Nome de CLASSE, ao contrário, nunca se traduz
 *    — e ele não passa por aqui: vem dos arquivos do servidor.
 *
 * 3. A nota de divergência tem DUAS chaves de frase inteira (`texto_um` e
 *    `texto_n`) em vez de uma frase com o substantivo solto no meio. Russo e
 *    polonês declinam "caso" junto com o número; quebrar a frase para
 *    concatenar "1 caso" / "{n} casos" produziria frase torta justamente nos
 *    dois idiomas em que ninguém aqui perceberia.
 */
type Dict = Record<string, string>;

export const classesPt: Dict = {
  // --- moldura da página ---
  "wiki.arv.meta.titulo": "Classes — a árvore de profissões | Wiki L2 Versus",
  "wiki.arv.meta.descricao":
    "As 103 classes do L2 Versus (High Five), da classe inicial à 3ª profissão, por raça e por função — lidas dos arquivos do servidor.",
  "wiki.arv.kicker": "A árvore",
  "wiki.arv.titulo": "Classes e profissões",
  "wiki.arv.intro":
    "Da classe inicial à terceira profissão, por raça. Passe o mouse em qualquer classe para acender a linhagem inteira — de onde ela vem e onde ela pode chegar.",

  // --- a diferença, em uma ideia ---
  "wiki.arv.ideia":
    "A estrutura de classes do Versus é a do High Five original: **{n} classes**, seis raças, três profissões. Nada foi somado nem removido — o que muda no servidor são os *números* das skills que cada uma aprende, e isso está nas seções de skills do códice.",
  "wiki.arv.conta.t0": "iniciais",
  "wiki.arv.conta.t1": "de 1ª",
  "wiki.arv.conta.t2": "de 2ª",
  "wiki.arv.conta.t3": "de 3ª",

  // --- onde as fontes do servidor discordam ---
  "wiki.arv.div.titulo": "Onde as fontes do servidor discordam",
  "wiki.arv.div.texto_um":
    "O servidor guarda a lista de classes em dois lugares, e em um caso eles não batem. Adotamos o **enum do código**, porque é dele que o servidor tira a árvore de skills de verdade; o *parentClassId* do XML não é lido por nenhuma lógica — o erro nunca apareceu em jogo.",
  "wiki.arv.div.texto_n":
    "O servidor guarda a lista de classes em dois lugares, e em {n} casos eles não batem. Adotamos o **enum do código**, porque é dele que o servidor tira a árvore de skills de verdade; o *parentClassId* do XML não é lido por nenhuma lógica — o erro nunca apareceu em jogo.",
  "wiki.arv.div.item":
    "O XML diz que a classe-pai é a {xml}; o enum diz {enum}. Vale o enum.",

  // --- procedência e legenda ---
  "wiki.arv.procedencia":
    "Nomes, hierarquia, raça e contagem saem dos arquivos do servidor. A **função** ({funcoes}) é classificação nossa, para dar cor e leitura à árvore — o servidor não guarda esse dado.",
  "wiki.arv.arq.guerreiro": "guerreiro",
  "wiki.arv.arq.cavaleiro": "cavaleiro",
  "wiki.arv.arq.ladino": "ladino",
  "wiki.arv.arq.mago": "mago",
  "wiki.arv.arq.suporte": "suporte",

  // --- a árvore (componente cliente) ---
  "wiki.arv.raca.HUMAN": "Humano",
  "wiki.arv.raca.ELF": "Elfo",
  "wiki.arv.raca.DARK_ELF": "Elfo Negro",
  "wiki.arv.raca.ORC": "Orc",
  "wiki.arv.raca.DWARF": "Anão",
  "wiki.arv.raca.KAMAEL": "Kamael",
  "wiki.arv.limpar": "limpar",
  "wiki.arv.n_classes": "{n} classes",
  "wiki.arv.tier.0": "Classe inicial",
  "wiki.arv.invocador": "invocador",
  "wiki.arv.skills": "skills",
  "wiki.arv.nivel": "nível",
  "wiki.arv.fontes_divergem": "fontes divergem",
  "wiki.arv.fontes_divergem_title":
    "As duas fontes do servidor discordam do pai desta classe — ver nota abaixo",
};

export const classesEn: Dict = {
  "wiki.arv.meta.titulo": "Classes — the profession tree | L2 Versus Wiki",
  "wiki.arv.meta.descricao":
    "The 103 classes of L2 Versus (High Five), from starter class to 3rd profession, by race and by role — read from the server files.",
  "wiki.arv.kicker": "The tree",
  "wiki.arv.titulo": "Classes and professions",
  "wiki.arv.intro":
    "From starter class to third profession, by race. Hover any class to light up its whole lineage — where it comes from and where it can get to.",

  "wiki.arv.ideia":
    "The Versus class structure is the one from the original High Five: **{n} classes**, six races, three professions. Nothing was added and nothing was removed — what the server changes are the *numbers* of the skills each one learns, and those live in the skill sections of the codex.",
  "wiki.arv.conta.t0": "starter",
  "wiki.arv.conta.t1": "1st prof.",
  "wiki.arv.conta.t2": "2nd prof.",
  "wiki.arv.conta.t3": "3rd prof.",

  "wiki.arv.div.titulo": "Where the server sources disagree",
  "wiki.arv.div.texto_um":
    "The server keeps the class list in two places, and in one case they do not match. We go with the **enum in the code**, because that is where the server actually reads the skill tree from; the XML's *parentClassId* is read by no logic at all — the error never showed up in game.",
  "wiki.arv.div.texto_n":
    "The server keeps the class list in two places, and in {n} cases they do not match. We go with the **enum in the code**, because that is where the server actually reads the skill tree from; the XML's *parentClassId* is read by no logic at all — the error never showed up in game.",
  "wiki.arv.div.item":
    "The XML says the parent class is {xml}; the enum says {enum}. The enum is what counts.",

  "wiki.arv.procedencia":
    "Names, hierarchy, race and counts come from the server files. The **role** ({funcoes}) is our own classification, there to give the tree colour and readability — the server does not store it.",
  "wiki.arv.arq.guerreiro": "warrior",
  "wiki.arv.arq.cavaleiro": "knight",
  "wiki.arv.arq.ladino": "rogue",
  "wiki.arv.arq.mago": "mage",
  "wiki.arv.arq.suporte": "support",

  "wiki.arv.raca.HUMAN": "Human",
  "wiki.arv.raca.ELF": "Elf",
  "wiki.arv.raca.DARK_ELF": "Dark Elf",
  "wiki.arv.raca.ORC": "Orc",
  "wiki.arv.raca.DWARF": "Dwarf",
  "wiki.arv.raca.KAMAEL": "Kamael",
  "wiki.arv.limpar": "clear",
  "wiki.arv.n_classes": "{n} classes",
  "wiki.arv.tier.0": "Starter class",
  "wiki.arv.invocador": "summoner",
  "wiki.arv.skills": "skills",
  "wiki.arv.nivel": "level",
  "wiki.arv.fontes_divergem": "sources disagree",
  "wiki.arv.fontes_divergem_title":
    "The two server sources disagree on this class's parent — see the note below",
};

export const classesRu: Dict = {
  "wiki.arv.meta.titulo": "Классы — древо профессий | Вики L2 Versus",
  "wiki.arv.meta.descricao":
    "103 класса L2 Versus (High Five), от стартового класса до 3-й профессии, по расам и по ролям — прочитаны из файлов сервера.",
  "wiki.arv.kicker": "Древо",
  "wiki.arv.titulo": "Классы и профессии",
  "wiki.arv.intro":
    "От стартового класса до третьей профессии, по расам. Наведите курсор на любой класс, чтобы подсветить всю его линию развития — откуда он идёт и куда может прийти.",

  "wiki.arv.ideia":
    "Структура классов в Versus — та же, что в оригинальном High Five: **{n} классов**, шесть рас, три профессии. Ничего не добавлено и ничего не убрано — сервер меняет *числа* в умениях, которые изучает каждый класс, и они лежат в разделах умений этого кодекса.",
  "wiki.arv.conta.t0": "стартовых",
  "wiki.arv.conta.t1": "1-й проф.",
  "wiki.arv.conta.t2": "2-й проф.",
  "wiki.arv.conta.t3": "3-й проф.",

  "wiki.arv.div.titulo": "Где источники сервера расходятся",
  "wiki.arv.div.texto_um":
    "Сервер хранит список классов в двух местах, и в одном случае они не совпадают. Мы принимаем **enum из кода**, потому что именно из него сервер на самом деле берёт древо умений; *parentClassId* из XML не читает никакая логика — в игре эта ошибка никогда не проявлялась.",
  "wiki.arv.div.texto_n":
    "Сервер хранит список классов в двух местах, и в {n} случаях они не совпадают. Мы принимаем **enum из кода**, потому что именно из него сервер на самом деле берёт древо умений; *parentClassId* из XML не читает никакая логика — в игре эта ошибка никогда не проявлялась.",
  "wiki.arv.div.item":
    "XML говорит, что родительский класс — {xml}; enum говорит {enum}. Действует enum.",

  "wiki.arv.procedencia":
    "Названия, иерархия, раса и подсчёт взяты из файлов сервера. **Роль** ({funcoes}) — наша собственная классификация, нужна для цвета и читаемости древа; сервер таких данных не хранит.",
  "wiki.arv.arq.guerreiro": "воин",
  "wiki.arv.arq.cavaleiro": "рыцарь",
  "wiki.arv.arq.ladino": "разбойник",
  "wiki.arv.arq.mago": "маг",
  "wiki.arv.arq.suporte": "поддержка",

  "wiki.arv.raca.HUMAN": "Человек",
  "wiki.arv.raca.ELF": "Эльф",
  "wiki.arv.raca.DARK_ELF": "Тёмный эльф",
  "wiki.arv.raca.ORC": "Орк",
  "wiki.arv.raca.DWARF": "Гном",
  "wiki.arv.raca.KAMAEL": "Камаэль",
  "wiki.arv.limpar": "сбросить",
  "wiki.arv.n_classes": "{n} классов",
  "wiki.arv.tier.0": "Стартовый класс",
  "wiki.arv.invocador": "призыватель",
  "wiki.arv.skills": "умений",
  "wiki.arv.nivel": "уровень",
  "wiki.arv.fontes_divergem": "источники расходятся",
  "wiki.arv.fontes_divergem_title":
    "Два источника сервера расходятся в родителе этого класса — см. примечание ниже",
};

export const classesPl: Dict = {
  "wiki.arv.meta.titulo": "Klasy — drzewo profesji | Wiki L2 Versus",
  "wiki.arv.meta.descricao":
    "103 klasy L2 Versus (High Five), od klasy startowej do 3. profesji, według rasy i według roli — odczytane z plików serwera.",
  "wiki.arv.kicker": "Drzewo",
  "wiki.arv.titulo": "Klasy i profesje",
  "wiki.arv.intro":
    "Od klasy startowej do trzeciej profesji, według rasy. Najedź kursorem na dowolną klasę, aby rozświetlić całą jej linię rozwoju — skąd się wywodzi i dokąd może dojść.",

  "wiki.arv.ideia":
    "Struktura klas w Versus jest ta sama co w oryginalnym High Five: **{n} klas**, sześć ras, trzy profesje. Nic nie zostało dodane ani usunięte — serwer zmienia *liczby* w umiejętnościach, których uczy się każda klasa, a te mieszkają w działach umiejętności tego kodeksu.",
  "wiki.arv.conta.t0": "startowych",
  "wiki.arv.conta.t1": "1. prof.",
  "wiki.arv.conta.t2": "2. prof.",
  "wiki.arv.conta.t3": "3. prof.",

  "wiki.arv.div.titulo": "Gdzie źródła serwera się rozchodzą",
  "wiki.arv.div.texto_um":
    "Serwer przechowuje listę klas w dwóch miejscach i w jednym przypadku one się nie zgadzają. Przyjmujemy **enum z kodu**, bo właśnie z niego serwer naprawdę bierze drzewo umiejętności; *parentClassId* z XML-a nie jest czytany przez żadną logikę — ten błąd nigdy nie pojawił się w grze.",
  "wiki.arv.div.texto_n":
    "Serwer przechowuje listę klas w dwóch miejscach i w {n} przypadkach one się nie zgadzają. Przyjmujemy **enum z kodu**, bo właśnie z niego serwer naprawdę bierze drzewo umiejętności; *parentClassId* z XML-a nie jest czytany przez żadną logikę — ten błąd nigdy nie pojawił się w grze.",
  "wiki.arv.div.item":
    "XML mówi, że klasą nadrzędną jest {xml}; enum mówi {enum}. Obowiązuje enum.",

  "wiki.arv.procedencia":
    "Nazwy, hierarchia, rasa i liczby pochodzą z plików serwera. **Rola** ({funcoes}) to nasza własna klasyfikacja, która daje drzewu kolor i czytelność — serwer nie przechowuje tej informacji.",
  "wiki.arv.arq.guerreiro": "wojownik",
  "wiki.arv.arq.cavaleiro": "rycerz",
  "wiki.arv.arq.ladino": "łotrzyk",
  "wiki.arv.arq.mago": "mag",
  "wiki.arv.arq.suporte": "wsparcie",

  "wiki.arv.raca.HUMAN": "Człowiek",
  "wiki.arv.raca.ELF": "Elf",
  "wiki.arv.raca.DARK_ELF": "Mroczny elf",
  "wiki.arv.raca.ORC": "Ork",
  "wiki.arv.raca.DWARF": "Krasnolud",
  "wiki.arv.raca.KAMAEL": "Kamael",
  "wiki.arv.limpar": "wyczyść",
  "wiki.arv.n_classes": "{n} klas",
  "wiki.arv.tier.0": "Klasa startowa",
  "wiki.arv.invocador": "przywoływacz",
  "wiki.arv.skills": "umiejętności",
  "wiki.arv.nivel": "poziom",
  "wiki.arv.fontes_divergem": "źródła się rozchodzą",
  "wiki.arv.fontes_divergem_title":
    "Dwa źródła serwera różnią się co do klasy nadrzędnej — patrz uwaga poniżej",
};
