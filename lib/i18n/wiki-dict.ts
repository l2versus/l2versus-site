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

/* As áreas grandes do códice moram em módulos próprios sob `wiki/`.
   Não é organização por organização: este arquivo passou de 390 para mais de
   900 linhas quando o frontispício e a linha de base entraram, e um arquivo
   único com quatro idiomas intercalados é onde uma chave traduzida em três
   línguas e esquecida na quarta passa despercebida. Um módulo por área deixa
   os quatro blocos do MESMO assunto lado a lado, que é como se confere. */
import { classesPt, classesEn, classesRu, classesPl } from "./wiki/classes";
import { mudancasPt, mudancasEn, mudancasRu, mudancasPl } from "./wiki/mudancas";
import { grimorioPt, grimorioEn, grimorioRu, grimorioPl } from "./wiki/grimorio";
import { comunsPt, comunsEn, comunsRu, comunsPl } from "./wiki/comuns";

const basePt: Dict = {
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

  // --- frontispício do códice (/wiki) ---
  "wiki.home.meta.titulo": "Wiki — O Códice do Versus | L2 Versus",
  "wiki.home.meta.descricao":
    "O que o L2 Versus tem de diferente do Lineage 2 High Five original: jóias de boss em três degraus, SA de armas trocadas, escada de encantamento de conjunto, skills rebalanceadas. Sempre com o valor de antes e o de agora.",
  "wiki.home.titulo": "O Códice do Versus",
  "wiki.home.tese":
    "Todo servidor tem um banco de dados de itens. O que quase nenhum tem é a **diferença**. Este códice existe para responder uma pergunta só: se você já conhece Lineage 2, *o que muda aqui* — e em quanto.",
  "wiki.home.procedencia":
    "Cada número foi lido dos arquivos do servidor, um por um, não da descrição que aparece dentro do cliente. Onde os dois divergem, está avisado na página — e o que vale em jogo é o daqui.",
  "wiki.home.porta_base.titulo": "Comece pela linha de base",
  "wiki.home.porta_base.texto":
    "Como é um High Five low rate de verdade — e, sistema por sistema, o que o Versus muda em cima dele. Se você só ler uma página, leia esta.",
  "wiki.home.porta_base.selo": "o mapa do códice",
  "wiki.home.porta_classes.titulo": "A árvore de classes",
  "wiki.home.porta_classes.texto":
    "As 103 profissões por raça e por função, da inicial à terceira — com a linhagem inteira acendendo quando você passa o mouse.",
  "wiki.home.porta_classes.selo": "103 classes",
  "wiki.home.secoes": "As seções",
  "wiki.home.prontas": "{n} de {m} prontas",
  "wiki.home.cap1": "Lido dos arquivos do servidor.",
  "wiki.home.cap2": "Não da descrição do cliente.",
  "wiki.home.cap2_sub":
    "Quando o jogo mostrar um número velho, o que vale em combate é o que está gravado neste códice.",
  "wiki.home.cap3": "O que muda, você vê **antes de logar**.",
  "wiki.home.feito.titulo": "Como este códice é feito",
  "wiki.home.feito.1.t": "Lido do servidor, não do cliente",
  "wiki.home.feito.1.d":
    "Os valores saem dos arquivos do servidor. A descrição dentro do jogo às vezes ficou com o número velho — quando isso acontece, a entrada avisa, e o valor desta página é o que vale.",
  "wiki.home.feito.2.t": "Nada aqui foi digitado de memória",
  "wiki.home.feito.2.d":
    "Cada número tem arquivo e linha de origem registrados, e a extração é conferida contra a fonte antes de publicar. A auditoria fica do nosso lado — na sua tela aparece o número, não a tripa do servidor.",
  "wiki.home.feito.3.t": "O que não sabemos fica em branco",
  "wiki.home.feito.3.d":
    "Quando a fonte registrou só o valor de hoje, a entrada mostra “estado atual” e diz que o valor antigo não está documentado. Não preenchemos lacuna com chute.",

  // --- a linha de base (/wiki/linha-de-base) ---
  "wiki.base.meta.titulo": "A linha de base — o High Five original | Wiki L2 Versus",
  "wiki.base.meta.descricao":
    "O que é um servidor Lineage 2 High Five low rate de verdade — e, sistema por sistema, o que o L2 Versus muda em cima dele.",
  "wiki.base.kicker": "Antes de tudo",
  "wiki.base.titulo": "O High Five original — a linha de base",
  "wiki.base.intro":
    "O L2 Versus é um **low rate High Five**: rates entre x1 e x5, economia que funciona porque nada é dado de graça, cerco, Olympíada, epic bosses e craft como a NCSoft desenhou. Essa é a fundação — e ela não muda. O que muda está catalogado abaixo, sistema por sistema, sempre com a seção do códice onde os números vivem.",
  "wiki.base.no_original": "No High Five original",
  "wiki.base.no_versus": "No L2 Versus",
  "wiki.base.prancha.titulo": "A descida",
  "wiki.base.prancha.nota":
    "Oito sistemas. A cidadela acende conforme você desce.",
  "wiki.base.rodape":
    "Fatos do retail conferidos em fontes públicas da comunidade (l2db.info e l2central.info — ex.: Divine Inspiration, skill 1405). O lado L2 Versus sai da documentação interna do servidor, a mesma que alimenta cada seção deste códice — lida dos arquivos, não digitada.",

  "wiki.base.sis.rates.nome": "Rates",
  "wiki.base.sis.rates.original":
    "O oficial roda em x1. Um low rate clássico fica entre x1 e x5 — a economia continua funcionando porque adena e drop não desvalorizam, e cada level pesa.",
  "wiki.base.sis.rates.versus":
    "x5 — dentro da janela clássica de low rate. Sem drop dobrado por evento: o rate é o rate.",
  "wiki.base.sis.buff.nome": "Vagas de buff",
  "wiki.base.sis.buff.original":
    "20 vagas base + 4 com os livros de Divine Inspiration = 24 no máximo. Todo buff, dança e canção disputa essas vagas.",
  "wiki.base.sis.buff.versus":
    "20 buffs + 12 danças/canções + 12 gatilhos — e 10 habilidades marcadas (mais todas as 153 de gatilho) não ocupam vaga nenhuma e não derrubam os seus buffs.",
  "wiki.base.sis.joias.nome": "Jóias de boss",
  "wiki.base.sis.joias.original":
    "Cada jóia épica existe numa versão só, que dropa do próprio boss. Ring of Core é Ring of Core, e acabou.",
  "wiki.base.sis.joias.versus":
    "Até três degraus por jóia — Lesser, normal e Improved — com efeitos crescentes e formas de obter diferentes (moeda do boss, drop, e um sistema pós-Dynasty ainda em definição).",
  "wiki.base.sis.conjunto.nome": "Bônus de conjunto",
  "wiki.base.sis.conjunto.original":
    "O bônus extra de encantamento de conjunto liga num único limiar: +6. Abaixo disso, só o bônus base.",
  "wiki.base.sis.conjunto.versus":
    "Uma escada de +4 a +10, para qualquer conjunto completo de qualquer grade — e ela SOMA com o bônus nativo de +6 que já existia.",
  "wiki.base.sis.sa.nome": "SA das armas",
  "wiki.base.sis.sa.original":
    "Cada arma aceita suas Soul Abilities de fábrica, com valores fixos da crônica.",
  "wiki.base.sis.sa.versus":
    "223 alterações, em 30 SAs e 83 skills — SAs trocadas arma por arma, sempre documentando o que saiu e o que entrou.",
  "wiki.base.sis.masterwork.nome": "Masterwork",
  "wiki.base.sis.masterwork.original":
    "Armas e peitos Masterwork (Foundation) dão bônus de fábrica, muitos deles fracos ou redundantes.",
  "wiki.base.sis.masterwork.versus":
    "112 bônus já alterados. Percentuais escalam por grade sozinhos; os valores fixos valem igual em toda grade, de propósito.",
  "wiki.base.sis.heroi.nome": "Armas de Herói",
  "wiki.base.sis.heroi.original":
    "O arsenal Infinity do Herói da Olympíada, com o cancel da Infinity Spear disparando sem regra clara.",
  "wiki.base.sis.heroi.versus":
    "As 14 Infinity rebalanceadas — o cancel agora segue a mesma regra das armas {PvP}: só no crítico, 33%, 1 buff por vez, 3s de intervalo.",
  "wiki.base.sis.augment.nome": "Augment",
  "wiki.base.sis.augment.original":
    "Lifestones sorteiam opções numa tabela retail conhecida; atributos de elemento e resistências saem só em acessório.",
  "wiki.base.sis.augment.versus":
    "A tabela inteira do servidor documentada: 200 entradas, com cada skill, chance e valor lidos dos arquivos — não da descrição do cliente.",
};

const baseEn: Dict = {
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

  // --- frontispício do códice (/wiki) ---
  "wiki.home.meta.titulo": "Wiki — The Versus Codex | L2 Versus",
  "wiki.home.meta.descricao":
    "What L2 Versus does differently from retail Lineage 2 High Five: boss jewels in three tiers, reworked weapon SAs, an armour set enchant ladder, rebalanced skills. Always with the before and the after.",
  "wiki.home.titulo": "The Versus Codex",
  "wiki.home.tese":
    "Every server has an item database. What almost none of them has is the **difference**. This codex exists to answer one question: if you already know Lineage 2, *what changes here* — and by how much.",
  "wiki.home.procedencia":
    "Every number was read from the server files, one by one, not from the description shown inside the client. Where the two disagree, the page says so — and what counts in game is what you read here.",
  "wiki.home.porta_base.titulo": "Start with the baseline",
  "wiki.home.porta_base.texto":
    "What a real low rate High Five looks like — and, system by system, what Versus changes on top of it. If you only read one page, read this one.",
  "wiki.home.porta_base.selo": "the map of the codex",
  "wiki.home.porta_classes.titulo": "The class tree",
  "wiki.home.porta_classes.texto":
    "All 103 classes by race and by role, from starter to third profession — with the whole lineage lighting up as you hover.",
  "wiki.home.porta_classes.selo": "103 classes",
  "wiki.home.secoes": "The sections",
  "wiki.home.prontas": "{n} of {m} ready",
  "wiki.home.cap1": "Read from the server files.",
  "wiki.home.cap2": "Not from the client description.",
  "wiki.home.cap2_sub":
    "When the game shows you an outdated number, what counts in combat is what this codex records.",
  "wiki.home.cap3": "See what changes **before you log in**.",
  "wiki.home.feito.titulo": "How this codex is built",
  "wiki.home.feito.1.t": "Read from the server, not the client",
  "wiki.home.feito.1.d":
    "The values come from the server files. The in-game description sometimes kept the old number — when that happens, the entry says so, and the value on this page is the one that counts.",
  "wiki.home.feito.2.t": "Nothing here was typed from memory",
  "wiki.home.feito.2.d":
    "Every number has a source file and line on record, and the extraction is checked against that source before it ships. The audit trail stays on our side — your screen gets the number, not the server's plumbing.",
  "wiki.home.feito.3.t": "What we don't know stays blank",
  "wiki.home.feito.3.d":
    "When the source recorded only today's value, the entry shows “current state” and says the old value isn't documented. We don't fill gaps with guesses.",

  // --- a linha de base (/wiki/linha-de-base) ---
  "wiki.base.meta.titulo": "The baseline — retail High Five | L2 Versus Wiki",
  "wiki.base.meta.descricao":
    "What a real low rate Lineage 2 High Five server is — and, system by system, what L2 Versus changes on top of it.",
  "wiki.base.kicker": "Before anything else",
  "wiki.base.titulo": "Retail High Five — the baseline",
  "wiki.base.intro":
    "L2 Versus is a **low rate High Five**: rates between x1 and x5, an economy that works because nothing is handed to you, sieges, Olympiad, epic bosses and crafting the way NCSoft designed them. That is the foundation — and it does not move. What does move is catalogued below, system by system, always with the codex section where the numbers live.",
  "wiki.base.no_original": "In retail High Five",
  "wiki.base.no_versus": "In L2 Versus",
  "wiki.base.prancha.titulo": "The descent",
  "wiki.base.prancha.nota": "Eight systems. The citadel lights up as you go down.",
  "wiki.base.rodape":
    "Retail facts checked against public community sources (l2db.info and l2central.info — e.g. Divine Inspiration, skill 1405). The L2 Versus side comes from the server's internal documentation, the same one that feeds every section of this codex — read from the files, not typed.",

  "wiki.base.sis.rates.nome": "Rates",
  "wiki.base.sis.rates.original":
    "Official runs at x1. A classic low rate sits between x1 and x5 — the economy keeps working because adena and drops don't inflate away, and every level counts.",
  "wiki.base.sis.rates.versus":
    "x5 — inside the classic low rate window. No doubled drops for events: the rate is the rate.",
  "wiki.base.sis.buff.nome": "Buff slots",
  "wiki.base.sis.buff.original":
    "20 base slots + 4 from the Divine Inspiration books = 24 at most. Every buff, dance and song competes for them.",
  "wiki.base.sis.buff.versus":
    "20 buffs + 12 dances/songs + 12 triggers — and 10 flagged skills (plus all 153 trigger skills) take no slot at all and never knock your buffs off.",
  "wiki.base.sis.joias.nome": "Boss jewels",
  "wiki.base.sis.joias.original":
    "Each epic jewel exists in a single version, dropped by its own boss. Ring of Core is Ring of Core, and that's that.",
  "wiki.base.sis.joias.versus":
    "Up to three tiers per jewel — Lesser, normal and Improved — with rising effects and different ways to get each one (boss currency, drop, and a post-Dynasty system still being defined).",
  "wiki.base.sis.conjunto.nome": "Set bonus",
  "wiki.base.sis.conjunto.original":
    "The extra set-enchant bonus switches on at a single threshold: +6. Below that, only the base bonus.",
  "wiki.base.sis.conjunto.versus":
    "A ladder from +4 to +10, for any complete set of any grade — and it STACKS with the native +6 bonus that already existed.",
  "wiki.base.sis.sa.nome": "Weapon SAs",
  "wiki.base.sis.sa.original":
    "Each weapon takes its stock Soul Abilities, with the fixed values of the chronicle.",
  "wiki.base.sis.sa.versus":
    "223 changes across 30 SAs and 83 skills — SAs swapped weapon by weapon, always documenting what came out and what went in.",
  "wiki.base.sis.masterwork.nome": "Masterwork",
  "wiki.base.sis.masterwork.original":
    "Masterwork (Foundation) weapons and breastplates give stock bonuses, many of them weak or redundant.",
  "wiki.base.sis.masterwork.versus":
    "112 bonuses already changed. Percentages scale with grade on their own; flat values are worth the same at every grade, on purpose.",
  "wiki.base.sis.heroi.nome": "Hero weapons",
  "wiki.base.sis.heroi.original":
    "The Olympiad Hero's Infinity arsenal, with the Infinity Spear cancel firing under no clear rule.",
  "wiki.base.sis.heroi.versus":
    "All 14 Infinity weapons rebalanced — the cancel now follows the same rule as {PvP} weapons: on critical only, 33%, 1 buff at a time, 3s between procs.",
  "wiki.base.sis.augment.nome": "Augment",
  "wiki.base.sis.augment.original":
    "Lifestones roll options from a known retail table; elemental attributes and resistances only come up on accessories.",
  "wiki.base.sis.augment.versus":
    "The server's whole table documented: 200 entries, with every skill, chance and value read from the files — not from the client description.",
};

const baseRu: Dict = {
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

  // --- frontispício do códice (/wiki) ---
  "wiki.home.meta.titulo": "Вики — Кодекс Versus | L2 Versus",
  "wiki.home.meta.descricao":
    "Чем L2 Versus отличается от оригинального Lineage 2 High Five: эпик-бижутерия в трёх ступенях, заменённые SA оружия, лестница заточки сетов, переработанные умения. Всегда со значением «было» и «стало».",
  "wiki.home.titulo": "Кодекс Versus",
  "wiki.home.tese":
    "База предметов есть у любого сервера. Чего почти ни у кого нет — это **разницы**. Этот кодекс отвечает на один вопрос: если вы уже знаете Lineage 2, *что здесь меняется* — и насколько.",
  "wiki.home.procedencia":
    "Каждое число прочитано из файлов сервера, одно за другим, а не из описания в клиенте. Там, где они расходятся, на странице стоит предупреждение — и в бою работает то, что написано здесь.",
  "wiki.home.porta_base.titulo": "Начните с базовой линии",
  "wiki.home.porta_base.texto":
    "Как выглядит настоящий low rate High Five — и, система за системой, что Versus меняет поверх него. Если прочитаете только одну страницу, прочитайте эту.",
  "wiki.home.porta_base.selo": "карта кодекса",
  "wiki.home.porta_classes.titulo": "Древо классов",
  "wiki.home.porta_classes.texto":
    "Все 103 класса по расам и ролям, от стартового до третьей профессии — вся линия подсвечивается при наведении.",
  "wiki.home.porta_classes.selo": "103 класса",
  "wiki.home.secoes": "Разделы",
  "wiki.home.prontas": "{n} из {m} готовы",
  "wiki.home.cap1": "Прочитано из файлов сервера.",
  "wiki.home.cap2": "Не из описания в клиенте.",
  "wiki.home.cap2_sub":
    "Когда игра показывает устаревшее число, в бою работает то, что записано в этом кодексе.",
  "wiki.home.cap3": "Что изменилось — видно **до входа в игру**.",
  "wiki.home.feito.titulo": "Как сделан этот кодекс",
  "wiki.home.feito.1.t": "Читаем сервер, а не клиент",
  "wiki.home.feito.1.d":
    "Значения берутся из файлов сервера. Описание внутри игры иногда осталось со старым числом — в таком случае запись об этом предупреждает, и верным считается значение с этой страницы.",
  "wiki.home.feito.2.t": "Здесь ничего не набрано по памяти",
  "wiki.home.feito.2.d":
    "У каждого числа записаны файл и строка происхождения, и извлечение сверяется с источником перед публикацией. Аудит остаётся на нашей стороне — на вашем экране число, а не внутренности сервера.",
  "wiki.home.feito.3.t": "Чего мы не знаем — остаётся пустым",
  "wiki.home.feito.3.d":
    "Если источник зафиксировал только сегодняшнее значение, запись показывает «текущее состояние» и сообщает, что прежнее значение не задокументировано. Пробелы догадками не заполняем.",

  // --- a linha de base (/wiki/linha-de-base) ---
  "wiki.base.meta.titulo": "Базовая линия — оригинальный High Five | Вики L2 Versus",
  "wiki.base.meta.descricao":
    "Что такое настоящий low rate сервер Lineage 2 High Five — и, система за системой, что L2 Versus меняет поверх него.",
  "wiki.base.kicker": "Прежде всего",
  "wiki.base.titulo": "Оригинальный High Five — базовая линия",
  "wiki.base.intro":
    "L2 Versus — это **low rate High Five**: рейты от x1 до x5, работающая экономика, потому что ничего не даётся даром, осады, Olympiad, эпик-боссы и крафт в том виде, в каком их задумала NCSoft. Это фундамент — и он не меняется. Что меняется, перечислено ниже, система за системой, всегда с указанием раздела кодекса, где лежат числа.",
  "wiki.base.no_original": "В оригинальном High Five",
  "wiki.base.no_versus": "В L2 Versus",
  "wiki.base.prancha.titulo": "Спуск",
  "wiki.base.prancha.nota": "Восемь систем. Цитадель разгорается по мере спуска.",
  "wiki.base.rodape":
    "Факты об официальном сервере сверены по публичным источникам сообщества (l2db.info и l2central.info — например, Divine Inspiration, умение 1405). Сторона L2 Versus взята из внутренней документации сервера, той же, что питает каждый раздел этого кодекса — прочитана из файлов, а не набрана вручную.",

  "wiki.base.sis.rates.nome": "Рейты",
  "wiki.base.sis.rates.original":
    "Официальный сервер идёт на x1. Классический low rate держится между x1 и x5 — экономика продолжает работать, потому что адена и дроп не обесцениваются, и каждый уровень что-то значит.",
  "wiki.base.sis.rates.versus":
    "x5 — внутри классического окна low rate. Без удвоенного дропа по случаю события: рейт есть рейт.",
  "wiki.base.sis.buff.nome": "Слоты бафов",
  "wiki.base.sis.buff.original":
    "20 базовых слотов + 4 от книг Divine Inspiration = максимум 24. Каждый баф, танец и песня борются за эти слоты.",
  "wiki.base.sis.buff.versus":
    "20 бафов + 12 танцев/песен + 12 триггеров — и 10 помеченных умений (плюс все 153 триггерных) не занимают слот вообще и не сбивают ваши бафы.",
  "wiki.base.sis.joias.nome": "Эпик-бижутерия",
  "wiki.base.sis.joias.original":
    "Каждая эпическая вещь существует в одной версии, которая падает с самого босса. Ring of Core — это Ring of Core, и всё.",
  "wiki.base.sis.joias.versus":
    "До трёх ступеней на вещь — Lesser, обычная и Improved — с нарастающими эффектами и разными способами получения (валюта босса, дроп и пост-Dynasty система, которая ещё определяется).",
  "wiki.base.sis.conjunto.nome": "Бонус сета",
  "wiki.base.sis.conjunto.original":
    "Дополнительный бонус за заточку сета включается на единственном пороге: +6. Ниже — только базовый бонус.",
  "wiki.base.sis.conjunto.versus":
    "Лестница с +4 до +10, для любого полного сета любого грейда — и она СУММИРУЕТСЯ с родным бонусом +6, который был и раньше.",
  "wiki.base.sis.sa.nome": "SA оружия",
  "wiki.base.sis.sa.original":
    "Каждое оружие принимает свои стандартные Soul Ability с фиксированными значениями хроники.",
  "wiki.base.sis.sa.versus":
    "223 изменения в 30 SA и 83 умениях — SA заменены оружие за оружием, всегда с указанием того, что убрали и что поставили.",
  "wiki.base.sis.masterwork.nome": "Masterwork",
  "wiki.base.sis.masterwork.original":
    "Masterwork-оружие и нагрудники (Foundation) дают стандартные бонусы, многие из которых слабые или избыточные.",
  "wiki.base.sis.masterwork.versus":
    "112 бонусов уже изменены. Проценты масштабируются по грейду сами; фиксированные значения одинаковы на всех грейдах — это сделано намеренно.",
  "wiki.base.sis.heroi.nome": "Оружие Героя",
  "wiki.base.sis.heroi.original":
    "Арсенал Infinity Героя Olympiad, где cancel у Infinity Spear срабатывал без внятного правила.",
  "wiki.base.sis.heroi.versus":
    "Все 14 Infinity пересбалансированы — cancel теперь подчиняется тому же правилу, что и оружие {PvP}: только на крите, 33%, 1 баф за раз, 3с между срабатываниями.",
  "wiki.base.sis.augment.nome": "Augment",
  "wiki.base.sis.augment.original":
    "Lifestone разыгрывает опции по известной официальной таблице; атрибуты стихий и сопротивления выпадают только на аксессуарах.",
  "wiki.base.sis.augment.versus":
    "Вся таблица сервера задокументирована: 200 записей, где каждое умение, шанс и значение прочитаны из файлов — а не из описания в клиенте.",
};

const basePl: Dict = {
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

  // --- frontispício do códice (/wiki) ---
  "wiki.home.meta.titulo": "Wiki — Kodeks Versus | L2 Versus",
  "wiki.home.meta.descricao":
    "Czym L2 Versus różni się od oryginalnego Lineage 2 High Five: biżuteria bossów w trzech stopniach, wymienione SA broni, drabina ulepszeń setów, przebalansowane umiejętności. Zawsze z wartością przed i po.",
  "wiki.home.titulo": "Kodeks Versus",
  "wiki.home.tese":
    "Bazę przedmiotów ma każdy serwer. Czego prawie nikt nie ma, to **różnicy**. Ten kodeks istnieje, by odpowiedzieć na jedno pytanie: jeśli znasz już Lineage 2, *co zmienia się tutaj* — i o ile.",
  "wiki.home.procedencia":
    "Każda liczba została odczytana z plików serwera, jedna po drugiej, a nie z opisu w kliencie. Tam, gdzie się rozchodzą, strona o tym uprzedza — a w grze liczy się to, co czytasz tutaj.",
  "wiki.home.porta_base.titulo": "Zacznij od linii bazowej",
  "wiki.home.porta_base.texto":
    "Jak wygląda prawdziwy low rate High Five — i, system po systemie, co Versus zmienia na jego bazie. Jeśli masz przeczytać jedną stronę, przeczytaj tę.",
  "wiki.home.porta_base.selo": "mapa kodeksu",
  "wiki.home.porta_classes.titulo": "Drzewo klas",
  "wiki.home.porta_classes.texto":
    "Wszystkie 103 klasy według rasy i roli, od startowej do trzeciej profesji — z całą linią rozświetlającą się pod kursorem.",
  "wiki.home.porta_classes.selo": "103 klasy",
  "wiki.home.secoes": "Działy",
  "wiki.home.prontas": "{n} z {m} gotowych",
  "wiki.home.cap1": "Odczytane z plików serwera.",
  "wiki.home.cap2": "Nie z opisu w kliencie.",
  "wiki.home.cap2_sub":
    "Kiedy gra pokazuje starą liczbę, w walce liczy się to, co zapisano w tym kodeksie.",
  "wiki.home.cap3": "Co się zmienia, zobaczysz **przed zalogowaniem**.",
  "wiki.home.feito.titulo": "Jak powstaje ten kodeks",
  "wiki.home.feito.1.t": "Czytamy serwer, nie klienta",
  "wiki.home.feito.1.d":
    "Wartości pochodzą z plików serwera. Opis w grze czasem został ze starą liczbą — gdy tak się dzieje, wpis o tym uprzedza, a obowiązuje wartość z tej strony.",
  "wiki.home.feito.2.t": "Nic tu nie zostało wpisane z pamięci",
  "wiki.home.feito.2.d":
    "Każda liczba ma zapisany plik i wiersz źródłowy, a ekstrakcja jest sprawdzana ze źródłem przed publikacją. Audyt zostaje po naszej stronie — na twoim ekranie jest liczba, a nie wnętrzności serwera.",
  "wiki.home.feito.3.t": "Czego nie wiemy, zostaje puste",
  "wiki.home.feito.3.d":
    "Gdy źródło zapisało tylko dzisiejszą wartość, wpis pokazuje „stan obecny” i mówi, że poprzednia wartość nie jest udokumentowana. Nie wypełniamy luk zgadywaniem.",

  // --- a linha de base (/wiki/linha-de-base) ---
  "wiki.base.meta.titulo": "Linia bazowa — oryginalny High Five | Wiki L2 Versus",
  "wiki.base.meta.descricao":
    "Czym jest prawdziwy low rate serwer Lineage 2 High Five — i, system po systemie, co L2 Versus zmienia na jego bazie.",
  "wiki.base.kicker": "Przede wszystkim",
  "wiki.base.titulo": "Oryginalny High Five — linia bazowa",
  "wiki.base.intro":
    "L2 Versus to **low rate High Five**: rate'y od x1 do x5, gospodarka, która działa, bo nic nie jest dane za darmo, oblężenia, Olympiad, epic bossy i craft tak, jak zaprojektowała je NCSoft. To jest fundament — i on się nie zmienia. To, co się zmienia, jest skatalogowane poniżej, system po systemie, zawsze z działem kodeksu, w którym mieszkają liczby.",
  "wiki.base.no_original": "W oryginalnym High Five",
  "wiki.base.no_versus": "W L2 Versus",
  "wiki.base.prancha.titulo": "Zejście",
  "wiki.base.prancha.nota": "Osiem systemów. Cytadela rozświetla się, gdy schodzisz.",
  "wiki.base.rodape":
    "Fakty o oficjalnym serwerze sprawdzone w publicznych źródłach społeczności (l2db.info i l2central.info — np. Divine Inspiration, umiejętność 1405). Strona L2 Versus pochodzi z wewnętrznej dokumentacji serwera, tej samej, która zasila każdy dział tego kodeksu — odczytanej z plików, a nie przepisanej.",

  "wiki.base.sis.rates.nome": "Rate'y",
  "wiki.base.sis.rates.original":
    "Oficjalny chodzi na x1. Klasyczny low rate mieści się między x1 a x5 — gospodarka nadal działa, bo adena i dropy nie tracą wartości, a każdy poziom coś znaczy.",
  "wiki.base.sis.rates.versus":
    "x5 — w klasycznym oknie low rate. Bez podwojonego dropu na eventy: rate to rate.",
  "wiki.base.sis.buff.nome": "Sloty na buffy",
  "wiki.base.sis.buff.original":
    "20 slotów bazowych + 4 z ksiąg Divine Inspiration = maksymalnie 24. Każdy buff, taniec i pieśń walczą o te sloty.",
  "wiki.base.sis.buff.versus":
    "20 buffów + 12 tańców/pieśni + 12 wyzwalaczy — a 10 oznaczonych umiejętności (plus wszystkie 153 wyzwalane) nie zajmuje żadnego slotu i nie zrzuca twoich buffów.",
  "wiki.base.sis.joias.nome": "Biżuteria bossów",
  "wiki.base.sis.joias.original":
    "Każda epicka biżuteria istnieje w jednej wersji, która pada z własnego bossa. Ring of Core to Ring of Core i tyle.",
  "wiki.base.sis.joias.versus":
    "Do trzech stopni na sztukę — Lesser, zwykła i Improved — z rosnącymi efektami i różnymi sposobami zdobycia (waluta bossa, drop oraz system po Dynasty, wciąż ustalany).",
  "wiki.base.sis.conjunto.nome": "Bonus setu",
  "wiki.base.sis.conjunto.original":
    "Dodatkowy bonus za ulepszenie setu włącza się na jednym progu: +6. Poniżej — tylko bonus bazowy.",
  "wiki.base.sis.conjunto.versus":
    "Drabina od +4 do +10, dla każdego pełnego setu każdego grade'u — i SUMUJE się z natywnym bonusem +6, który już istniał.",
  "wiki.base.sis.sa.nome": "SA broni",
  "wiki.base.sis.sa.original":
    "Każda broń przyjmuje swoje fabryczne Soul Ability, ze stałymi wartościami kroniki.",
  "wiki.base.sis.sa.versus":
    "223 zmiany w 30 SA i 83 umiejętnościach — SA wymieniane broń po broni, zawsze z zapisem tego, co wyszło i co weszło.",
  "wiki.base.sis.masterwork.nome": "Masterwork",
  "wiki.base.sis.masterwork.original":
    "Bronie i napierśniki Masterwork (Foundation) dają fabryczne bonusy, wiele z nich słabych lub zbędnych.",
  "wiki.base.sis.masterwork.versus":
    "112 bonusów już zmienionych. Procenty same skalują się z grade'em; wartości stałe są takie same na każdym grade — celowo.",
  "wiki.base.sis.heroi.nome": "Bronie Bohatera",
  "wiki.base.sis.heroi.original":
    "Arsenał Infinity Bohatera Olympiad, w którym cancel z Infinity Spear odpalał bez jasnej reguły.",
  "wiki.base.sis.heroi.versus":
    "Wszystkie 14 Infinity przebalansowane — cancel działa teraz według tej samej reguły co bronie {PvP}: tylko na krytyku, 33%, 1 buff naraz, 3s przerwy.",
  "wiki.base.sis.augment.nome": "Augment",
  "wiki.base.sis.augment.original":
    "Lifestone losują opcje ze znanej oficjalnej tabeli; atrybuty żywiołów i odporności wypadają tylko na akcesoriach.",
  "wiki.base.sis.augment.versus":
    "Cała tabela serwera udokumentowana: 200 wpisów, w których każda umiejętność, szansa i wartość zostały odczytane z plików — nie z opisu w kliencie.",
};

/* O merge: base + áreas. Chave repetida entre áreas é erro de nomenclatura,
   não precedência a decidir — cada área tem prefixo próprio (wiki.cls.*,
   wiki.mud.*, wiki.gs.*). */
export const wikiPt: Dict = { ...basePt, ...classesPt, ...mudancasPt, ...grimorioPt, ...comunsPt };
export const wikiEn: Dict = { ...baseEn, ...classesEn, ...mudancasEn, ...grimorioEn, ...comunsEn };
export const wikiRu: Dict = { ...baseRu, ...classesRu, ...mudancasRu, ...grimorioRu, ...comunsRu };
export const wikiPl: Dict = { ...basePl, ...classesPl, ...mudancasPl, ...grimorioPl, ...comunsPl };
