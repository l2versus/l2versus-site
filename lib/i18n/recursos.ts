/**
 * DICIONÁRIO DA PÁGINA /recursos (namespace `rc.*`).
 *
 * Vive em arquivo próprio e NÃO em site-dict.ts por um motivo de processo: a
 * página foi reescrita inteira (redação nova, com peso) enquanto o site-dict
 * estava sendo editado em paralelo. Namespace separado = zero colisão de
 * chave, e o merge para dentro de `dict.ts` é um spread quando der.
 *
 * A página NÃO depende desse merge: ela lê estas tabelas direto, resolvendo o
 * idioma pelo mesmo cookie do resto do site. Se um dia `recursosPt` entrar em
 * `sitePt`, nada quebra — as chaves continuam únicas.
 *
 * REGRAS QUE VALEM AQUI
 *
 * 1. Termo de jogo não se traduz, nos quatro idiomas: High Five, PvP, Adena,
 *    Auto-Farm, Offline Shop, GM Shop, DressMe, Community Board, VSCOIN,
 *    Olympiad, Hero, Dynasty, Icarus, Vesper, private store, soulshot, grade S,
 *    Grand Olympiad Manager, Mercenary Manager. O jogador procura por esses
 *    nomes dentro do client, que está em inglês — traduzir rótulo de sistema
 *    cria um nome que não existe em lugar nenhum.
 *
 *    Caso particular: `rc.olympiada.nome` sai "Olympiad" nos quatro, inclusive
 *    em RU/PL, mesmo que `site.feat.oly` (home/tiles) ainda diga "Олимпиада" /
 *    "Olimpiada". A regra de termo protegido ganha da consistência com a chave
 *    antiga; se o dono preferir o contrário, muda-se AQUI, numa linha por
 *    idioma, e não no corpo da página.
 *
 * 2. Frase com realce é UMA chave, com `**forte**`, renderizada por
 *    `realce()`. Quebrar em pedaços torce a oração em RU e PL, onde a palavra
 *    realçada cai em outra posição. Ver lib/i18n/realce.tsx.
 *
 * 3. Nenhum número ou sistema inventado. Todo fato aqui (ALT+B, nível 55+ e
 *    terceira classe para o Olympiad, NPC nas praças, preço em Adena, drop em
 *    eventos e raids, denúncia por Discord com vídeo) veio da versão anterior
 *    desta mesma página. O que mudou foi a REDAÇÃO: cada sistema ganhou uma
 *    linha de benefício ("o que isso faz por você"), que é o que faltava para
 *    a página parar de ser uma lista de features.
 */

import type { Locale } from "./dict";

type Tabela = Record<string, string>;

/* ------------------------------------------------------------------
   PORTUGUÊS (referência — é desta coluna que as outras três saem)
   ------------------------------------------------------------------ */
export const recursosPt: Tabela = {
  "rc.meta.titulo": "Recursos — L2 Versus",
  "rc.meta.desc":
    "Os oito sistemas do L2 Versus: Auto-Farm, Offline Shop, GM Shop, itens custom, DressMe, Olympiad, cercos e Anti-Bot. Conforto se dá, poder se conquista.",

  "rc.kicker": "Sistemas do servidor",
  "rc.titulo": "Recursos do Versus",
  "rc.tese":
    "Oito sistemas e uma regra só: **conforto se dá, poder se conquista**. Tudo aqui existe para você jogar mais e esperar menos — nunca para vender vantagem.",
  "rc.sumario": "Nesta página",

  "rc.ato1.rot": "Rotina",
  "rc.ato1.titulo": "Os três que mudam a sua rotina",
  "rc.ato1.sub":
    "Tempo é o recurso mais caro de um High Five. Estes três devolvem o seu.",
  "rc.ato2.rot": "Identidade",
  "rc.ato2.titulo": "A identidade do Versus",
  "rc.ato2.sub": "O que existe aqui e você não encontra no retail.",
  "rc.ato3.rot": "Endgame",
  "rc.ato3.titulo": "Onde o servidor se decide",
  "rc.ato3.sub": "Endgame competitivo — e nenhum atalho à venda.",
  "rc.ato4.rot": "Regra",
  "rc.ato4.titulo": "A regra da casa",
  "rc.ato4.sub":
    "O único sistema desta página que não é conveniência: é o que protege o valor do seu farm.",

  "rc.how": "Como usar",
  "rc.selo.pilar": "Pilar",
  "rc.selo.sempre": "Sempre ativo",

  "rc.auto-farm.nome": "Auto-Farm",
  "rc.auto-farm.lead": "O personagem continua caçando quando você precisa sair.",
  "rc.auto-farm.corpo":
    "Você define o raio de ação, a rotação de skills, o HP mínimo e quando beber poção. O sistema caça os mobs da área dentro dessas regras. Não é programa de terceiro: é parte do servidor, e por isso ninguém toma ban por usar.",
  "rc.auto-farm.passo":
    "Abra o Community Board com ALT+B e ative na aba Auto-Farm.",

  "rc.offline-shops.nome": "Offline Shops",
  "rc.offline-shops.lead": "Sua loja vende com o jogo fechado e o PC desligado.",
  "rc.offline-shops.corpo":
    "Monte a private store, deslogue, e o personagem continua no mercado da cidade. A economia do servidor fica viva as 24 horas sem ninguém precisar deixar a máquina ligada a noite inteira.",
  "rc.offline-shops.passo":
    "Abra sua private store e deslogue: a loja permanece ativa.",

  "rc.gm-shop.nome": "GM Shop",
  "rc.gm-shop.lead": "Tudo até grade S, em Adena, sem caçar vendedor.",
  "rc.gm-shop.corpo":
    "Consumíveis, equipamento, soulshots e material de craft a preço justo em Adena — não em VSCOIN. A sessão inteira vai para a caçada, e não para procurar quem vende a peça que falta.",
  "rc.gm-shop.passo":
    "NPC nas praças de todas as vilas e também pelo Community Board.",

  "rc.itens-custom.nome": "Itens Custom",
  "rc.itens-custom.lead": "Arsenal próprio e balanceado — não item apelão.",
  "rc.itens-custom.corpo":
    "Linhas Dynasty, Icarus e Vesper ajustadas para o High Five: poder de verdade no fim do caminho, sem aquele salto que transforma PvP em quem comprou primeiro.",
  "rc.itens-custom.passo":
    "No GM Shop e em drops de eventos e raids especiais.",

  "rc.dressme.nome": "DressMe",
  "rc.dressme.lead": "O visual que você quer, o status que você construiu.",
  "rc.dressme.corpo":
    "Aplique a aparência de qualquer armadura ou arma sobre o equipamento atual. Muda só o que os outros veem — os números continuam sendo os do seu set.",
  "rc.dressme.passo": "Pelo Community Board (ALT+B), aba DressMe.",

  "rc.olympiada.nome": "Olympiad",
  "rc.olympiada.lead": "O caminho até Hero, decidido na arena.",
  "rc.olympiada.corpo":
    "Duelos ranqueados por classe em ciclo mensal. Quem fecha o ciclo no topo vira Hero: skills de Hero e o brilho que o servidor inteiro reconhece de longe.",
  "rc.olympiada.passo":
    "Registre-se no Grand Olympiad Manager, em Giran — nível 55+ e terceira classe.",

  "rc.cercos.nome": "Cercos",
  "rc.cercos.lead": "Castelo não se compra: toma-se à força.",
  "rc.cercos.corpo":
    "Guerra de clãs pelos castelos de Aden. Quem senta no trono controla imposto, teleporte e a conversa do servidor até o cerco seguinte.",
  "rc.cercos.passo":
    "Registre seu clã com o Mercenary Manager do castelo que você quer.",

  "rc.anti-bot.nome": "Anti-Bot",
  "rc.anti-bot.lead": "Seu farm vale porque o do vizinho não é automático.",
  "rc.anti-bot.corpo":
    "Proteção ativa contra bots e automação ilegal de terceiros, ligada o tempo todo. Quem quebra a regra cai — e o Auto-Farm oficial existe justamente para ninguém precisar arriscar.",
  "rc.anti-bot.passo":
    "Sempre ativo. Denúncia pelo Discord com vídeo acelera o ban.",

  "rc.cta.titulo": "Oito sistemas esperando você em Aden.",
  "rc.cta.sub": "Conta em um minuto, client baixando em seguida.",
  "rc.cta.acc": "Criar conta",
  "rc.cta.dl": "Baixar o client",
  "rc.cta.wiki": "Ver o que mudou, no códice",
};

/* ------------------------------------------------------------------
   ENGLISH
   ------------------------------------------------------------------ */
export const recursosEn: Tabela = {
  "rc.meta.titulo": "Features — L2 Versus",
  "rc.meta.desc":
    "The eight systems of L2 Versus: Auto-Farm, Offline Shop, GM Shop, custom items, DressMe, Olympiad, sieges and Anti-Bot. Comfort is given, power is earned.",

  "rc.kicker": "Server systems",
  "rc.titulo": "Versus Features",
  "rc.tese":
    "Eight systems, one rule: **comfort is given, power is earned**. Everything here exists so you play more and wait less — never to sell an advantage.",
  "rc.sumario": "On this page",

  "rc.ato1.rot": "Routine",
  "rc.ato1.titulo": "The three that change your routine",
  "rc.ato1.sub":
    "Time is the most expensive resource in a High Five. These three give yours back.",
  "rc.ato2.rot": "Identity",
  "rc.ato2.titulo": "What makes Versus itself",
  "rc.ato2.sub": "What exists here and you will not find on retail.",
  "rc.ato3.rot": "Endgame",
  "rc.ato3.titulo": "Where the server is decided",
  "rc.ato3.sub": "Competitive endgame — and no shortcut for sale.",
  "rc.ato4.rot": "Rule",
  "rc.ato4.titulo": "The house rule",
  "rc.ato4.sub":
    "The only system on this page that is not convenience: it is what protects the value of your farm.",

  "rc.how": "How to use",
  "rc.selo.pilar": "Pillar",
  "rc.selo.sempre": "Always on",

  "rc.auto-farm.nome": "Auto-Farm",
  "rc.auto-farm.lead": "Your character keeps hunting when you have to step away.",
  "rc.auto-farm.corpo":
    "You set the radius, the skill rotation, the minimum HP and when to drink a potion. The system hunts the mobs in the area within those rules. It is not third-party software: it is part of the server, which is why nobody gets banned for using it.",
  "rc.auto-farm.passo":
    "Open the Community Board with ALT+B and enable it in the Auto-Farm tab.",

  "rc.offline-shops.nome": "Offline Shops",
  "rc.offline-shops.lead": "Your shop sells with the game closed and the PC off.",
  "rc.offline-shops.corpo":
    "Set up your private store, log out, and your character stays on the town market. The server economy runs 24 hours a day without anyone leaving a machine on all night.",
  "rc.offline-shops.passo":
    "Open your private store and log out: the shop stays active.",

  "rc.gm-shop.nome": "GM Shop",
  "rc.gm-shop.lead": "Everything up to grade S, in Adena, without hunting for a vendor.",
  "rc.gm-shop.corpo":
    "Consumables, gear, soulshots and crafting materials at fair prices in Adena — not in VSCOIN. The whole session goes into hunting instead of looking for whoever sells the one piece you are missing.",
  "rc.gm-shop.passo":
    "NPC in every town square, and through the Community Board as well.",

  "rc.itens-custom.nome": "Custom Items",
  "rc.itens-custom.lead": "An arsenal of our own, balanced — not throwaway overpowered gear.",
  "rc.itens-custom.corpo":
    "Dynasty, Icarus and Vesper lines tuned for High Five: real power at the end of the road, without the jump that turns PvP into whoever bought first.",
  "rc.itens-custom.passo":
    "In the GM Shop and as drops from events and special raids.",

  "rc.dressme.nome": "DressMe",
  "rc.dressme.lead": "The look you want, the stats you earned.",
  "rc.dressme.corpo":
    "Apply the appearance of any armor or weapon over your current gear. Only what other people see changes — the numbers are still your set's.",
  "rc.dressme.passo": "Through the Community Board (ALT+B), DressMe tab.",

  "rc.olympiada.nome": "Olympiad",
  "rc.olympiada.lead": "The road to Hero, settled in the arena.",
  "rc.olympiada.corpo":
    "Class-ranked duels on a monthly cycle. Whoever ends the cycle on top becomes a Hero: Hero skills and the glow the whole server recognises from across the map.",
  "rc.olympiada.passo":
    "Register with the Grand Olympiad Manager in Giran — level 55+ and third class.",

  "rc.cercos.nome": "Sieges",
  "rc.cercos.lead": "A castle is not bought: it is taken.",
  "rc.cercos.corpo":
    "Clan war over the castles of Aden. Whoever sits on the throne controls taxes, teleports and the server's conversation until the next siege.",
  "rc.cercos.passo":
    "Register your clan with the Mercenary Manager of the castle you want.",

  "rc.anti-bot.nome": "Anti-Bot",
  "rc.anti-bot.lead": "Your farm is worth something because your neighbour's is not automatic.",
  "rc.anti-bot.corpo":
    "Active protection against bots and illegal third-party automation, on at all times. Rule-breakers fall — and the official Auto-Farm exists precisely so nobody needs to take the risk.",
  "rc.anti-bot.passo":
    "Always on. A Discord report with video speeds up the ban.",

  "rc.cta.titulo": "Eight systems waiting for you in Aden.",
  "rc.cta.sub": "Account in a minute, client downloading right after.",
  "rc.cta.acc": "Create account",
  "rc.cta.dl": "Download the client",
  "rc.cta.wiki": "See what changed, in the codex",
};

/* ------------------------------------------------------------------
   РУССКИЙ
   ------------------------------------------------------------------ */
export const recursosRu: Tabela = {
  "rc.meta.titulo": "Возможности — L2 Versus",
  "rc.meta.desc":
    "Восемь систем L2 Versus: Auto-Farm, Offline Shop, GM Shop, кастом-предметы, DressMe, Olympiad, осады и Анти-бот. Комфорт даётся, сила заслуживается.",

  "rc.kicker": "Системы сервера",
  "rc.titulo": "Возможности Versus",
  "rc.tese":
    "Восемь систем и одно правило: **комфорт даётся, сила заслуживается**. Всё здесь сделано, чтобы ты больше играл и меньше ждал, — а не чтобы продавать преимущество.",
  "rc.sumario": "На этой странице",

  "rc.ato1.rot": "Распорядок",
  "rc.ato1.titulo": "Три системы, которые меняют распорядок",
  "rc.ato1.sub":
    "Время — самый дорогой ресурс в High Five. Эти три возвращают его тебе.",
  "rc.ato2.rot": "Идентичность",
  "rc.ato2.titulo": "То, что делает Versus собой",
  "rc.ato2.sub": "Есть здесь — и не найдёшь на официальном сервере.",
  "rc.ato3.rot": "Эндгейм",
  "rc.ato3.titulo": "Где решается судьба сервера",
  "rc.ato3.sub": "Соревновательный эндгейм — и ни одного короткого пути за деньги.",
  "rc.ato4.rot": "Правило",
  "rc.ato4.titulo": "Правило дома",
  "rc.ato4.sub":
    "Единственная система на этой странице, которая не про удобство: она защищает ценность твоего фарма.",

  "rc.how": "Как использовать",
  "rc.selo.pilar": "Опора",
  "rc.selo.sempre": "Всегда включено",

  "rc.auto-farm.nome": "Auto-Farm",
  "rc.auto-farm.lead": "Персонаж продолжает охоту, когда тебе нужно отойти.",
  "rc.auto-farm.corpo":
    "Ты задаёшь радиус, набор скиллов, минимальный HP и момент, когда пить банку. Система бьёт мобов в зоне по этим правилам. Это не сторонняя программа, а часть сервера — поэтому за неё никого не банят.",
  "rc.auto-farm.passo":
    "Открой Community Board клавишами ALT+B и включи во вкладке Auto-Farm.",

  "rc.offline-shops.nome": "Offline Shops",
  "rc.offline-shops.lead": "Лавка торгует при закрытой игре и выключенном ПК.",
  "rc.offline-shops.corpo":
    "Поставь private store, выйди из игры — и персонаж останется на городском рынке. Экономика сервера живёт круглосуточно, и никому не нужно всю ночь держать машину включённой.",
  "rc.offline-shops.passo":
    "Открой private store и выйди из игры: лавка останется активной.",

  "rc.gm-shop.nome": "GM Shop",
  "rc.gm-shop.lead": "Всё до grade S, за Adena, без поиска торговца.",
  "rc.gm-shop.corpo":
    "Расходники, экипировка, soulshot и материалы для крафта по честной цене в Adena — не в VSCOIN. Вся сессия уходит на охоту, а не на поиски того, у кого есть нужная деталь.",
  "rc.gm-shop.passo":
    "NPC на площадях всех городов, а также через Community Board.",

  "rc.itens-custom.nome": "Кастом-предметы",
  "rc.itens-custom.lead": "Свой арсенал, сбалансированный, — без имбы одноразового сервера.",
  "rc.itens-custom.corpo":
    "Линейки Dynasty, Icarus и Vesper подогнаны под High Five: настоящая сила в конце пути, без скачка, который превращает PvP в «кто купил первым».",
  "rc.itens-custom.passo":
    "В GM Shop и в дропе с ивентов и особых рейдов.",

  "rc.dressme.nome": "DressMe",
  "rc.dressme.lead": "Внешность, которую хочешь, со статами, которые заработал.",
  "rc.dressme.corpo":
    "Наложи облик любой брони или оружия на текущую экипировку. Меняется только то, что видят другие, — числа остаются от твоего сета.",
  "rc.dressme.passo": "Через Community Board (ALT+B), вкладка DressMe.",

  "rc.olympiada.nome": "Olympiad",
  "rc.olympiada.lead": "Путь к званию Hero решается на арене.",
  "rc.olympiada.corpo":
    "Ранговые дуэли по классам в месячном цикле. Кто заканчивает цикл на вершине — становится Hero: скиллы Hero и свечение, которое весь сервер узнаёт издалека.",
  "rc.olympiada.passo":
    "Регистрация у Grand Olympiad Manager в Гиране — уровень 55+ и третья профессия.",

  "rc.cercos.nome": "Осады",
  "rc.cercos.lead": "Замок не покупают — замок берут.",
  "rc.cercos.corpo":
    "Война кланов за замки Адена. Кто сидит на троне, тот держит налоги, телепорты и все разговоры на сервере до следующей осады.",
  "rc.cercos.passo":
    "Зарегистрируй клан у Mercenary Manager нужного замка.",

  "rc.anti-bot.nome": "Анти-бот",
  "rc.anti-bot.lead": "Твой фарм чего-то стоит, потому что у соседа он не автоматический.",
  "rc.anti-bot.corpo":
    "Активная защита от ботов и нелегальной сторонней автоматизации работает постоянно. Кто нарушает правила — падает. А официальный Auto-Farm существует как раз для того, чтобы никому не приходилось рисковать.",
  "rc.anti-bot.passo":
    "Работает всегда. Жалоба в Discord с видео ускоряет бан.",

  "rc.cta.titulo": "Восемь систем ждут тебя в Адене.",
  "rc.cta.sub": "Аккаунт — за минуту, клиент качается сразу после.",
  "rc.cta.acc": "Создать аккаунт",
  "rc.cta.dl": "Скачать клиент",
  "rc.cta.wiki": "Что изменилось — в кодексе",
};

/* ------------------------------------------------------------------
   POLSKI
   ------------------------------------------------------------------ */
export const recursosPl: Tabela = {
  "rc.meta.titulo": "Systemy — L2 Versus",
  "rc.meta.desc":
    "Osiem systemów L2 Versus: Auto-Farm, Offline Shop, GM Shop, itemy custom, DressMe, Olympiad, oblężenia i Anty-Bot. Komfort się daje, siłę się zdobywa.",

  "rc.kicker": "Systemy serwera",
  "rc.titulo": "Systemy Versus",
  "rc.tese":
    "Osiem systemów i jedna zasada: **komfort się daje, siłę się zdobywa**. Wszystko tutaj istnieje, żebyś więcej grał i mniej czekał — nigdy po to, by sprzedawać przewagę.",
  "rc.sumario": "Na tej stronie",

  "rc.ato1.rot": "Codzienność",
  "rc.ato1.titulo": "Trzy systemy, które zmieniają twój dzień",
  "rc.ato1.sub":
    "Czas to najdroższy zasób w High Five. Te trzy oddają ci twój.",
  "rc.ato2.rot": "Tożsamość",
  "rc.ato2.titulo": "To, co czyni Versus sobą",
  "rc.ato2.sub": "Jest tutaj — i nie znajdziesz tego na retailu.",
  "rc.ato3.rot": "Endgame",
  "rc.ato3.titulo": "Tam rozstrzyga się serwer",
  "rc.ato3.sub": "Rywalizacyjny endgame — i żadnej drogi na skróty do kupienia.",
  "rc.ato4.rot": "Zasada",
  "rc.ato4.titulo": "Zasada domu",
  "rc.ato4.sub":
    "Jedyny system na tej stronie, który nie jest wygodą: on chroni wartość twojego farmu.",

  "rc.how": "Jak używać",
  "rc.selo.pilar": "Filar",
  "rc.selo.sempre": "Zawsze aktywny",

  "rc.auto-farm.nome": "Auto-Farm",
  "rc.auto-farm.lead": "Postać dalej poluje, kiedy musisz odejść od komputera.",
  "rc.auto-farm.corpo":
    "Ustawiasz promień, rotację skilli, minimalne HP i moment wypicia potki. System bije moby w okolicy według tych reguł. To nie program z zewnątrz, a część serwera — i właśnie dlatego nikt nie dostaje za niego bana.",
  "rc.auto-farm.passo":
    "Otwórz Community Board klawiszami ALT+B i włącz go w zakładce Auto-Farm.",

  "rc.offline-shops.nome": "Offline Shops",
  "rc.offline-shops.lead": "Twój sklep sprzedaje przy zamkniętej grze i wyłączonym PC.",
  "rc.offline-shops.corpo":
    "Ustaw private store, wyloguj się — postać zostaje na rynku w mieście. Ekonomia serwera żyje całą dobę i nikt nie musi trzymać włączonego komputera przez całą noc.",
  "rc.offline-shops.passo":
    "Otwórz private store i wyloguj się: sklep zostaje aktywny.",

  "rc.gm-shop.nome": "GM Shop",
  "rc.gm-shop.lead": "Wszystko do grade S, za Adenę, bez szukania sprzedawcy.",
  "rc.gm-shop.corpo":
    "Konsumpcja, ekwipunek, soulshoty i materiały do craftu w uczciwych cenach za Adenę — nie za VSCOIN. Cała sesja idzie na polowanie, a nie na szukanie kogoś, kto ma brakujący element.",
  "rc.gm-shop.passo":
    "NPC na rynkach wszystkich miast, a także przez Community Board.",

  "rc.itens-custom.nome": "Itemy Custom",
  "rc.itens-custom.lead": "Własny arsenał, zbalansowany — bez przegięć z jednorazowego serwera.",
  "rc.itens-custom.corpo":
    "Linie Dynasty, Icarus i Vesper dostrojone pod High Five: prawdziwa siła na końcu drogi, bez skoku, który zamienia PvP w „kto kupił pierwszy”.",
  "rc.itens-custom.passo":
    "W GM Shop oraz w dropie z eventów i specjalnych raidów.",

  "rc.dressme.nome": "DressMe",
  "rc.dressme.lead": "Wygląd, który chcesz, statystyki, które wypracowałeś.",
  "rc.dressme.corpo":
    "Nałóż wygląd dowolnej zbroi albo broni na obecny ekwipunek. Zmienia się tylko to, co widzą inni — liczby nadal są z twojego setu.",
  "rc.dressme.passo": "Przez Community Board (ALT+B), zakładka DressMe.",

  "rc.olympiada.nome": "Olympiad",
  "rc.olympiada.lead": "Droga do statusu Hero rozstrzyga się na arenie.",
  "rc.olympiada.corpo":
    "Rankingowe pojedynki według klas w cyklu miesięcznym. Kto kończy cykl na szczycie, zostaje Hero: skille Hero i blask, który cały serwer rozpoznaje z daleka.",
  "rc.olympiada.passo":
    "Zarejestruj się u Grand Olympiad Managera w Giranie — poziom 55+ i trzecia klasa.",

  "rc.cercos.nome": "Oblężenia",
  "rc.cercos.lead": "Zamku się nie kupuje — zamek się bierze.",
  "rc.cercos.corpo":
    "Wojna klanów o zamki Aden. Kto siedzi na tronie, kontroluje podatki, teleporty i rozmowy na serwerze do następnego oblężenia.",
  "rc.cercos.passo":
    "Zarejestruj klan u Mercenary Managera wybranego zamku.",

  "rc.anti-bot.nome": "Anty-Bot",
  "rc.anti-bot.lead": "Twój farm ma wartość, bo farm sąsiada nie jest automatyczny.",
  "rc.anti-bot.corpo":
    "Aktywna ochrona przed botami i nielegalną automatyzacją z zewnątrz działa bez przerwy. Kto łamie zasady, ten spada — a oficjalny Auto-Farm istnieje właśnie po to, żeby nikt nie musiał ryzykować.",
  "rc.anti-bot.passo":
    "Zawsze aktywna. Zgłoszenie na Discordzie z nagraniem przyspiesza bana.",

  "rc.cta.titulo": "Osiem systemów czeka na ciebie w Aden.",
  "rc.cta.sub": "Konto w minutę, klient pobiera się od razu potem.",
  "rc.cta.acc": "Utwórz konto",
  "rc.cta.dl": "Pobierz klienta",
  "rc.cta.wiki": "Zobacz, co się zmieniło, w kodeksie",
};

export const recursosPorIdioma: Record<Locale, Tabela> = {
  pt: recursosPt,
  en: recursosEn,
  ru: recursosRu,
  pl: recursosPl,
};

/**
 * Tradutor local da página. Mesma assinatura do `getT()` global, mesmo
 * fallback (idioma → pt → a própria chave), para que o dia em que estas
 * tabelas entrarem no `dict.ts` a página possa trocar uma linha e pronto.
 */
export function tRecursos(locale: Locale): (chave: string) => string {
  const tabela = recursosPorIdioma[locale] ?? recursosPt;
  return (chave: string) => tabela[chave] ?? recursosPt[chave] ?? chave;
}
