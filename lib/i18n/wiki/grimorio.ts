/**
 * Dicionário do códice — área "grimorio". Ver lib/i18n/wiki-dict.ts.
 *
 * Cobre a PÁGINA DE CLASSE (`app/wiki/classes/[slug]/page.tsx`) e o GRIMÓRIO
 * (`app/wiki/_components/GrimorioSkills.tsx`), mais os rótulos de tipo e de
 * magia que moram em `lib/wiki/skills-ui.ts` — lá os campos `rotulo`/`ajuda`
 * guardam a CHAVE, não o texto, porque o arquivo é importado pelo cliente e
 * não pode ganhar dependência nenhuma.
 *
 * VOCABULÁRIO TRAVADO (não mudar, o resto do códice já segue):
 *   · "nível"  = nível do personagem → level  / уровень / poziom
 *   · "grau"   = degrau da skill     → rank   / ступень / stopień
 *
 * Termo que aparece na TELA DO JOGO fica em inglês nos quatro idiomas: SP,
 * M. Atk., P. Atk., Forgotten Scroll, Spellbook, Toggle, Kamael, High Five,
 * F. Scroll, STR/DEX/CON/INT/WIT/MEN e os nomes de classe e de skill, que
 * vêm dos dados e nunca passam por aqui.
 *
 * As frases com UMA palavra realçada no meio ficam numa chave só, com
 * marcação `**forte**`, e são desenhadas com `realce()` — ver
 * lib/i18n/realce.tsx para o motivo (ordem das palavras em RU/PL).
 */
type Dict = Record<string, string>;

export const grimorioPt: Dict = {
  // --- meta da página de classe ---
  "wiki.gs.meta.fallback": "Classe — Wiki | L2 Versus",
  "wiki.gs.meta.titulo": "{classe} — {degrau} {raca} | Wiki L2 Versus",
  "wiki.gs.meta.descricao":
    "{classe}: {degrau} da raça {raca} no L2 Versus (High Five). Linhagem, identificador de classe e o que muda no servidor.",

  // --- ficha ---
  "wiki.gs.ficha.tipo": "Tipo",
  "wiki.gs.ficha.magica": "Mágica",
  "wiki.gs.ficha.fisica": "Física",
  "wiki.gs.ficha.invocador": "Invocador",
  "wiki.gs.sim": "Sim",
  "wiki.gs.nao": "Não",

  // --- atributos base (o nome por trás da sigla) ---
  "wiki.gs.stat.str": "Força",
  "wiki.gs.stat.dex": "Destreza",
  "wiki.gs.stat.con": "Constituição",
  "wiki.gs.stat.int": "Inteligência",
  "wiki.gs.stat.wit": "Sagacidade",
  "wiki.gs.stat.men": "Mental",

  // --- armas ---
  "wiki.gs.armas.nota":
    "O servidor não guarda uma lista de “armas desta classe”. Isto é **derivado**: cruzamos as skills que a classe aprende com a condição de arma declarada em cada uma. Onde a skill não exige arma, ela não aparece aqui — e uma classe pode usar armas que nenhuma skill exige.",
  "wiki.gs.armas.exemplo": "ex.: {skill}",

  // --- o grimório na página ---
  "wiki.gs.titulo": "Skills que aprende",
  "wiki.gs.intro":
    "Nome, ícone e descrição saem do **cliente do Versus** — é o texto que você lê em jogo, já com as nossas alterações. Onde diverge do High Five retail, a divergência é intencional. Cada skill aparece uma vez; a régua de graus sob a descrição percorre todos os níveis dela.",
  "wiki.gs.fonte.arvore": "árvore de skills do datapack",
  "wiki.gs.fonte.cliente":
    "cliente: skillname-e.dat × skillgrp.dat (pacote de {n} skills, {m} graus)",

  // --- as skills que mudaram de dono ---
  "wiki.gs.dono.saiu_1": "Saiu daqui: ",
  "wiki.gs.dono.saiu_n": "Saíram daqui: ",
  "wiki.gs.dono.meio":
    ", que a leitura anterior da árvore trazia nesta classe e hoje é de ",
  "wiki.gs.dono.sufixo":
    ". O servidor mudou de dono nessas — não é lacuna do códice.",
  "wiki.gs.lista.e": " e ",
  "wiki.gs.semdono.prefixo_1":
    "A leitura anterior da árvore listava mais uma skill aqui que nenhuma das 89 classes do pacote aprende hoje — ",
  "wiki.gs.semdono.prefixo_n":
    "A leitura anterior da árvore listava mais {n} skills aqui que nenhuma das 89 classes do pacote aprende hoje — ",
  "wiki.gs.semdono.sufixo":
    ". Ou foi para uma classe Kamael, que está fora do pacote, ou saiu do servidor. Fica registrado em vez de ser mostrado sem ícone e sem descrição.",

  // --- estados degradados ---
  "wiki.gs.sem_arvore":
    "A árvore de skills desta classe não foi encontrada no arquivo gerado. Nada foi inventado para preencher o espaço.",
  "wiki.gs.fora_do_pacote":
    "Esta classe está fora do pacote de ícones e descrições extraído do cliente, então aqui vai só o que a árvore do servidor diz: nome, nível, graus e SP. Sem ícone e sem o texto do efeito — nenhum dos dois foi buscado de outra fonte para preencher.",

  // --- resumo e tabela do caminho cru (classes fora do pacote) ---
  "wiki.gs.resumo.skills": "skills",
  "wiki.gs.resumo.niveis_total": "níveis no total",
  "wiki.gs.resumo.niveis": "níveis",
  "wiki.gs.resumo.sp_tudo": "SP para tudo",
  "wiki.gs.resumo.com_livro": "com livro",
  "wiki.gs.tab.skill": "Skill",
  "wiki.gs.tab.graus": "Graus",
  "wiki.gs.tab.obtencao": "Obtenção",
  "wiki.gs.muda_de_nome": "muda de nome",
  "wiki.gs.obt.automatica": "automática",
  "wiki.gs.obt.livro": "livro",
  "wiki.gs.obt.mestre": "mestre",
  "wiki.gs.sem_sp":
    "{n} dos {m} níveis não declaram custo de SP no arquivo — são as skills automáticas, que chegam sozinhas ao subir de nível. Aparecem como “—” na tabela, não como zero inventado.",

  // --- divergência entre as fontes do servidor ---
  "wiki.gs.div.titulo": "As fontes do servidor discordam nesta classe",
  "wiki.gs.div.texto":
    "O XML de classes diz que a classe-pai é a {xml}; o enum do código diz {enum}. Esta página segue o enum, que é de onde o servidor tira a árvore de skills de verdade.",

  // --- rodapé ---
  "wiki.gs.rodape.aria": "Continuar pela linhagem",
  "wiki.gs.rodape.vem_de": "Vem de",
  "wiki.gs.rodape.comeco": "é o começo da linha",
  "wiki.gs.rodape.indice": "Índice",
  "wiki.gs.rodape.todas": "Todas as {n} classes",
  "wiki.gs.rodape.vira": "Vira",
  "wiki.gs.rodape.fim": "é o fim da linha",
  "wiki.gs.colofao":
    "Nome, hierarquia e raça lidos dos arquivos do servidor. A função (guerreiro, cavaleiro, ladino, mago, suporte) é classificação nossa, para dar cor e leitura à árvore — o servidor não guarda esse dado.",

  // --- tipo de skill (TIPO em lib/wiki/skills-ui.ts) ---
  "wiki.gs.tipo.ativa.rotulo": "Ativa",
  "wiki.gs.tipo.ativa.ajuda": "Você aciona. Tem alvo, tempo de recarga e custo.",
  "wiki.gs.tipo.passiva.rotulo": "Passiva",
  "wiki.gs.tipo.passiva.ajuda": "Sempre ligada. Não ocupa barra nem gasta nada.",
  "wiki.gs.tipo.toggle.rotulo": "Toggle",
  "wiki.gs.tipo.toggle.ajuda": "Liga e desliga. Drena recurso enquanto estiver ligada.",
  "wiki.gs.tipo.todas.rotulo": "Todas",
  "wiki.gs.tipo.todas.ajuda": "Sem filtro de tipo",

  // --- natureza da skill (MAGIA em lib/wiki/skills-ui.ts) ---
  "wiki.gs.magia.sim.rotulo": "Mágica",
  "wiki.gs.magia.sim.ajuda": "Conta como magia: sofre interrupção e usa M. Atk.",
  "wiki.gs.magia.nao.rotulo": "Física",
  "wiki.gs.magia.nao.ajuda": "Conta como ataque físico: usa P. Atk.",
  "wiki.gs.magia.estatica.rotulo": "Estática",
  "wiki.gs.magia.estatica.ajuda": "Craft, extração e afins — não é combate.",
  "wiki.gs.magia.danca.rotulo": "Dança / Canto",
  "wiki.gs.magia.danca.ajuda": "Dança ou canto: área, duração longa, slot próprio.",

  // --- a classe em números ---
  "wiki.gs.cifra.skills": "skills",
  "wiki.gs.cifra.graus": "graus ao todo",
  "wiki.gs.cifra.sp": "SP para tudo",
  "wiki.gs.cifra.faixa": "faixa de nível",
  "wiki.gs.mistura.ativas": "ativas",
  "wiki.gs.mistura.passivas": "passivas",
  "wiki.gs.mistura.toggles": "toggles",

  // --- a régua de níveis ---
  "wiki.gs.regua.tick_1": "Nível {lv} — {n} skill",
  "wiki.gs.regua.tick_n": "Nível {lv} — {n} skills",

  // --- a bancada (busca e filtros) ---
  "wiki.gs.busca.rotulo": "Buscar skill desta classe por nome, efeito ou número",
  "wiki.gs.busca.placeholder": "nome, efeito ou #id…",
  "wiki.gs.aria.tipo": "Filtrar por tipo",
  "wiki.gs.aria.recortes": "Recortes",
  "wiki.gs.aria.densidade": "Densidade",
  "wiki.gs.so.magica.rotulo": "Mágicas",
  "wiki.gs.so.magica.ajuda": "Só o que conta como magia",
  "wiki.gs.so.fs.rotulo": "F. Scroll",
  "wiki.gs.so.fs.ajuda": "Só o que exige Forgotten Scroll",
  "wiki.gs.so.auto.rotulo": "Automáticas",
  "wiki.gs.so.auto.ajuda": "Só o que chega sozinho ao subir de nível",
  "wiki.gs.modo.lista.rotulo": "Lista",
  "wiki.gs.modo.lista.ajuda": "Uma linha por skill, com a descrição aberta",
  "wiki.gs.modo.grade.rotulo": "Grade",
  "wiki.gs.modo.grade.ajuda": "Só os ícones, para bater o olho — clique abre na lista",
  "wiki.gs.conta.de": "de {n}",
  "wiki.gs.limpar": "limpar",
  "wiki.gs.vazio.texto": "Nenhuma skill de **{classe}** casa com esse recorte.",
  "wiki.gs.vazio.botao": "Limpar o filtro",

  // --- a grade de ícones ---
  "wiki.gs.peca.nv": "nv {n}",
  "wiki.gs.peca.graus": "{n} graus",

  // --- o grupo por nível ---
  "wiki.gs.degrau_rot": "nível",
  "wiki.gs.grupo.qtd_1": "{n} skill",
  "wiki.gs.grupo.qtd_n": "{n} skills",
  "wiki.gs.icone_falta": "Ícone ainda não extraído do cliente",

  // --- as etiquetas do verbete ---
  "wiki.gs.tag.fs.rotulo": "F. Scroll",
  "wiki.gs.tag.fs.ajuda": "Só se aprende com um Forgotten Scroll",
  "wiki.gs.tag.livro.rotulo": "Livro",
  "wiki.gs.tag.livro.ajuda": "Exige o Spellbook correspondente",
  "wiki.gs.tag.auto.rotulo": "Automática",
  "wiki.gs.tag.auto.ajuda": "Chega sozinha ao subir de nível — não custa SP",
  "wiki.gs.tag.link": "Link para esta skill",

  // --- a linha corrida do verbete ---
  "wiki.gs.linha.neste_grau": "neste grau",
  "wiki.gs.linha.auto": "automática — não custa SP",
  "wiki.gs.linha.sp_graus": "SP pelos {n} graus",
  "wiki.gs.linha.completa": "completa no nível",
  "wiki.gs.linha.herdado_1": "o 1º grau vem da classe anterior",
  "wiki.gs.linha.herdado_n": "os {n} primeiros graus vêm da classe anterior",
  "wiki.gs.linha.muda_nome": "muda de nome: {nomes}",

  // --- a escada de graus ---
  "wiki.gs.escada.aria": "{n} graus de {skill}",
  "wiki.gs.escada.rot": "grau",
  "wiki.gs.escada.de": "de {n}",
  "wiki.gs.escada.entalhe": "Grau {g}, nível {lv}, {sp}",
  "wiki.gs.escada.com_sp": "{sp} SP",
  "wiki.gs.escada.sem_sp": "sem custo de SP",
};

export const grimorioEn: Dict = {
  "wiki.gs.meta.fallback": "Class — Wiki | L2 Versus",
  "wiki.gs.meta.titulo": "{classe} — {degrau} {raca} | L2 Versus Wiki",
  "wiki.gs.meta.descricao":
    "{classe}: {degrau} of the {raca} race in L2 Versus (High Five). Lineage, class identifier and what the server changes.",

  "wiki.gs.ficha.tipo": "Type",
  "wiki.gs.ficha.magica": "Magic",
  "wiki.gs.ficha.fisica": "Physical",
  "wiki.gs.ficha.invocador": "Summoner",
  "wiki.gs.sim": "Yes",
  "wiki.gs.nao": "No",

  "wiki.gs.stat.str": "Strength",
  "wiki.gs.stat.dex": "Dexterity",
  "wiki.gs.stat.con": "Constitution",
  "wiki.gs.stat.int": "Intelligence",
  "wiki.gs.stat.wit": "Wit",
  "wiki.gs.stat.men": "Mentality",

  "wiki.gs.armas.nota":
    "The server keeps no list of “weapons of this class”. This is **derived**: we cross the skills the class learns with the weapon condition declared in each one. Where the skill requires no weapon, it does not show up here — and a class can use weapons no skill requires.",
  "wiki.gs.armas.exemplo": "e.g. {skill}",

  "wiki.gs.titulo": "Skills it learns",
  "wiki.gs.intro":
    "Name, icon and description come from the **Versus client** — it is the text you read in game, already with our changes. Where it diverges from retail High Five, the divergence is intentional. Each skill shows up once; the rank ruler under the description walks through all of its levels.",
  "wiki.gs.fonte.arvore": "datapack skill tree",
  "wiki.gs.fonte.cliente":
    "client: skillname-e.dat × skillgrp.dat (package of {n} skills, {m} ranks)",

  "wiki.gs.dono.saiu_1": "Moved out of here: ",
  "wiki.gs.dono.saiu_n": "Moved out of here: ",
  "wiki.gs.dono.meio":
    ", which the previous reading of the tree listed in this class and today belongs to ",
  "wiki.gs.dono.sufixo":
    ". The server changed owners on those — it is not a gap in the codex.",
  "wiki.gs.lista.e": " and ",
  "wiki.gs.semdono.prefixo_1":
    "The previous reading of the tree listed one more skill here that none of the 89 classes in the package learns today — ",
  "wiki.gs.semdono.prefixo_n":
    "The previous reading of the tree listed {n} more skills here that none of the 89 classes in the package learns today — ",
  "wiki.gs.semdono.sufixo":
    ". Either it went to a Kamael class, which is outside the package, or it left the server. It stays on record instead of being shown with no icon and no description.",

  "wiki.gs.sem_arvore":
    "The skill tree for this class was not found in the generated file. Nothing was invented to fill the space.",
  "wiki.gs.fora_do_pacote":
    "This class is outside the icon and description package extracted from the client, so what follows is only what the server tree says: name, level, ranks and SP. No icon and no effect text — neither was fetched from another source to fill the gap.",

  "wiki.gs.resumo.skills": "skills",
  "wiki.gs.resumo.niveis_total": "levels in total",
  "wiki.gs.resumo.niveis": "levels",
  "wiki.gs.resumo.sp_tudo": "SP for everything",
  "wiki.gs.resumo.com_livro": "with a book",
  "wiki.gs.tab.skill": "Skill",
  "wiki.gs.tab.graus": "Ranks",
  "wiki.gs.tab.obtencao": "How to get it",
  "wiki.gs.muda_de_nome": "changes name",
  "wiki.gs.obt.automatica": "automatic",
  "wiki.gs.obt.livro": "book",
  "wiki.gs.obt.mestre": "master",
  "wiki.gs.sem_sp":
    "{n} of the {m} levels declare no SP cost in the file — they are the automatic skills, which arrive on their own as you level up. They show as “—” in the table, not as an invented zero.",

  "wiki.gs.div.titulo": "The server sources disagree on this class",
  "wiki.gs.div.texto":
    "The class XML says the parent class is {xml}; the code enum says {enum}. This page follows the enum, which is where the server actually takes the skill tree from.",

  "wiki.gs.rodape.aria": "Continue along the lineage",
  "wiki.gs.rodape.vem_de": "Comes from",
  "wiki.gs.rodape.comeco": "it is the start of the line",
  "wiki.gs.rodape.indice": "Index",
  "wiki.gs.rodape.todas": "All {n} classes",
  "wiki.gs.rodape.vira": "Becomes",
  "wiki.gs.rodape.fim": "it is the end of the line",
  "wiki.gs.colofao":
    "Name, hierarchy and race read from the server files. The role (warrior, knight, rogue, mage, support) is our own classification, to give the tree colour and readability — the server does not store it.",

  "wiki.gs.tipo.ativa.rotulo": "Active",
  "wiki.gs.tipo.ativa.ajuda": "You cast it. It has a target, a cooldown and a cost.",
  "wiki.gs.tipo.passiva.rotulo": "Passive",
  "wiki.gs.tipo.passiva.ajuda": "Always on. Takes no bar slot and costs nothing.",
  "wiki.gs.tipo.toggle.rotulo": "Toggle",
  "wiki.gs.tipo.toggle.ajuda": "Switches on and off. Drains a resource while it is on.",
  "wiki.gs.tipo.todas.rotulo": "All",
  "wiki.gs.tipo.todas.ajuda": "No type filter",

  "wiki.gs.magia.sim.rotulo": "Magic",
  "wiki.gs.magia.sim.ajuda": "Counts as magic: it can be interrupted and uses M. Atk.",
  "wiki.gs.magia.nao.rotulo": "Physical",
  "wiki.gs.magia.nao.ajuda": "Counts as a physical attack: uses P. Atk.",
  "wiki.gs.magia.estatica.rotulo": "Static",
  "wiki.gs.magia.estatica.ajuda": "Crafting, extraction and the like — not combat.",
  "wiki.gs.magia.danca.rotulo": "Dance / Song",
  "wiki.gs.magia.danca.ajuda": "Dance or song: area, long duration, its own slot.",

  "wiki.gs.cifra.skills": "skills",
  "wiki.gs.cifra.graus": "ranks in all",
  "wiki.gs.cifra.sp": "SP for everything",
  "wiki.gs.cifra.faixa": "level range",
  "wiki.gs.mistura.ativas": "active",
  "wiki.gs.mistura.passivas": "passive",
  "wiki.gs.mistura.toggles": "toggle",

  "wiki.gs.regua.tick_1": "Level {lv} — {n} skill",
  "wiki.gs.regua.tick_n": "Level {lv} — {n} skills",

  "wiki.gs.busca.rotulo": "Search this class's skills by name, effect or number",
  "wiki.gs.busca.placeholder": "name, effect or #id…",
  "wiki.gs.aria.tipo": "Filter by type",
  "wiki.gs.aria.recortes": "Cuts",
  "wiki.gs.aria.densidade": "Density",
  "wiki.gs.so.magica.rotulo": "Magic",
  "wiki.gs.so.magica.ajuda": "Only what counts as magic",
  "wiki.gs.so.fs.rotulo": "F. Scroll",
  "wiki.gs.so.fs.ajuda": "Only what requires a Forgotten Scroll",
  "wiki.gs.so.auto.rotulo": "Automatic",
  "wiki.gs.so.auto.ajuda": "Only what arrives on its own as you level up",
  "wiki.gs.modo.lista.rotulo": "List",
  "wiki.gs.modo.lista.ajuda": "One line per skill, with the description open",
  "wiki.gs.modo.grade.rotulo": "Grid",
  "wiki.gs.modo.grade.ajuda": "Icons only, to scan — a click opens it in the list",
  "wiki.gs.conta.de": "of {n}",
  "wiki.gs.limpar": "clear",
  "wiki.gs.vazio.texto": "No skill of **{classe}** matches that cut.",
  "wiki.gs.vazio.botao": "Clear the filter",

  "wiki.gs.peca.nv": "lv {n}",
  "wiki.gs.peca.graus": "{n} ranks",

  "wiki.gs.degrau_rot": "level",
  "wiki.gs.grupo.qtd_1": "{n} skill",
  "wiki.gs.grupo.qtd_n": "{n} skills",
  "wiki.gs.icone_falta": "Icon not yet extracted from the client",

  "wiki.gs.tag.fs.rotulo": "F. Scroll",
  "wiki.gs.tag.fs.ajuda": "Only learned from a Forgotten Scroll",
  "wiki.gs.tag.livro.rotulo": "Book",
  "wiki.gs.tag.livro.ajuda": "Requires the matching Spellbook",
  "wiki.gs.tag.auto.rotulo": "Automatic",
  "wiki.gs.tag.auto.ajuda": "Arrives on its own as you level up — costs no SP",
  "wiki.gs.tag.link": "Link to this skill",

  "wiki.gs.linha.neste_grau": "at this rank",
  "wiki.gs.linha.auto": "automatic — costs no SP",
  "wiki.gs.linha.sp_graus": "SP for all {n} ranks",
  "wiki.gs.linha.completa": "completed at level",
  "wiki.gs.linha.herdado_1": "the 1st rank comes from the previous class",
  "wiki.gs.linha.herdado_n": "the first {n} ranks come from the previous class",
  "wiki.gs.linha.muda_nome": "changes name: {nomes}",

  "wiki.gs.escada.aria": "{n} ranks of {skill}",
  "wiki.gs.escada.rot": "rank",
  "wiki.gs.escada.de": "of {n}",
  "wiki.gs.escada.entalhe": "Rank {g}, level {lv}, {sp}",
  "wiki.gs.escada.com_sp": "{sp} SP",
  "wiki.gs.escada.sem_sp": "no SP cost",
};

export const grimorioRu: Dict = {
  "wiki.gs.meta.fallback": "Класс — Вики | L2 Versus",
  "wiki.gs.meta.titulo": "{classe} — {degrau} {raca} | Вики L2 Versus",
  "wiki.gs.meta.descricao":
    "{classe}: {degrau} расы {raca} в L2 Versus (High Five). Линия развития, идентификатор класса и то, что изменено на сервере.",

  "wiki.gs.ficha.tipo": "Тип",
  "wiki.gs.ficha.magica": "Магический",
  "wiki.gs.ficha.fisica": "Физический",
  "wiki.gs.ficha.invocador": "Суммонер",
  "wiki.gs.sim": "Да",
  "wiki.gs.nao": "Нет",

  "wiki.gs.stat.str": "Сила",
  "wiki.gs.stat.dex": "Ловкость",
  "wiki.gs.stat.con": "Телосложение",
  "wiki.gs.stat.int": "Интеллект",
  "wiki.gs.stat.wit": "Смекалка",
  "wiki.gs.stat.men": "Сила воли",

  "wiki.gs.armas.nota":
    "Сервер не хранит список «оружия этого класса». Этот список **выведен**: мы сопоставляем умения, которые изучает класс, с условием по оружию, объявленным в каждом из них. Если умение не требует оружия, здесь оно не появляется — и класс может носить оружие, которого не требует ни одно умение.",
  "wiki.gs.armas.exemplo": "напр.: {skill}",

  "wiki.gs.titulo": "Изучаемые умения",
  "wiki.gs.intro":
    "Название, иконка и описание берутся из **клиента Versus** — это тот текст, который вы читаете в игре, уже с нашими изменениями. Там, где он расходится с официальным High Five, расхождение сделано намеренно. Каждое умение показано один раз; линейка ступеней под описанием проходит по всем его уровням.",
  "wiki.gs.fonte.arvore": "дерево умений из датапака",
  "wiki.gs.fonte.cliente":
    "клиент: skillname-e.dat × skillgrp.dat (пакет: {n} умений, {m} ступеней)",

  "wiki.gs.dono.saiu_1": "Ушло отсюда: ",
  "wiki.gs.dono.saiu_n": "Ушли отсюда: ",
  "wiki.gs.dono.meio":
    ", которое прежнее чтение дерева относило к этому классу, а сегодня оно принадлежит ",
  "wiki.gs.dono.sufixo":
    ". Сервер сменил владельца у этих умений — это не пробел в кодексе.",
  "wiki.gs.lista.e": " и ",
  "wiki.gs.semdono.prefixo_1":
    "Прежнее чтение дерева показывало здесь ещё одно умение, которому сегодня не учится ни один из 89 классов пакета — ",
  "wiki.gs.semdono.prefixo_n":
    "Прежнее чтение дерева показывало здесь ещё {n} умений, которым сегодня не учится ни один из 89 классов пакета — ",
  "wiki.gs.semdono.sufixo":
    ". Либо оно ушло к классу Kamael, который вне пакета, либо исчезло с сервера. Остаётся записанным, вместо того чтобы показываться без иконки и без описания.",

  "wiki.gs.sem_arvore":
    "Дерево умений этого класса не найдено в сгенерированном файле. Ничего не придумано, чтобы заполнить пустоту.",
  "wiki.gs.fora_do_pacote":
    "Этот класс не входит в пакет иконок и описаний, извлечённый из клиента, поэтому здесь только то, что говорит дерево сервера: название, уровень, ступени и SP. Без иконки и без текста эффекта — ни то, ни другое не взято из другого источника для заполнения.",

  "wiki.gs.resumo.skills": "умений",
  "wiki.gs.resumo.niveis_total": "уровней всего",
  "wiki.gs.resumo.niveis": "уровни",
  "wiki.gs.resumo.sp_tudo": "SP на всё",
  "wiki.gs.resumo.com_livro": "с книгой",
  "wiki.gs.tab.skill": "Умение",
  "wiki.gs.tab.graus": "Ступени",
  "wiki.gs.tab.obtencao": "Получение",
  "wiki.gs.muda_de_nome": "меняет название",
  "wiki.gs.obt.automatica": "автоматическое",
  "wiki.gs.obt.livro": "книга",
  "wiki.gs.obt.mestre": "учитель",
  "wiki.gs.sem_sp":
    "{n} из {m} уровней не указывают стоимость SP в файле — это автоматические умения, которые приходят сами при повышении уровня. В таблице они показаны как «—», а не как выдуманный ноль.",

  "wiki.gs.div.titulo": "Источники сервера расходятся по этому классу",
  "wiki.gs.div.texto":
    "XML классов говорит, что родительский класс — {xml}; enum в коде говорит {enum}. Эта страница следует enum, потому что именно оттуда сервер берёт настоящее дерево умений.",

  "wiki.gs.rodape.aria": "Продолжить по линии развития",
  "wiki.gs.rodape.vem_de": "Происходит от",
  "wiki.gs.rodape.comeco": "это начало линии",
  "wiki.gs.rodape.indice": "Указатель",
  "wiki.gs.rodape.todas": "Все {n} классов",
  "wiki.gs.rodape.vira": "Становится",
  "wiki.gs.rodape.fim": "это конец линии",
  "wiki.gs.colofao":
    "Название, иерархия и раса прочитаны из файлов сервера. Роль (воин, рыцарь, разбойник, маг, поддержка) — наша классификация, чтобы дать дереву цвет и читаемость; сервер эти данные не хранит.",

  "wiki.gs.tipo.ativa.rotulo": "Активная",
  "wiki.gs.tipo.ativa.ajuda": "Вы применяете её сами. Есть цель, перезарядка и стоимость.",
  "wiki.gs.tipo.passiva.rotulo": "Пассивная",
  "wiki.gs.tipo.passiva.ajuda": "Всегда включена. Не занимает панель и ничего не расходует.",
  "wiki.gs.tipo.toggle.rotulo": "Toggle",
  "wiki.gs.tipo.toggle.ajuda": "Включается и выключается. Расходует ресурс, пока включена.",
  "wiki.gs.tipo.todas.rotulo": "Все",
  "wiki.gs.tipo.todas.ajuda": "Без фильтра по типу",

  "wiki.gs.magia.sim.rotulo": "Магическое",
  "wiki.gs.magia.sim.ajuda": "Считается магией: прерывается и использует M. Atk.",
  "wiki.gs.magia.nao.rotulo": "Физическое",
  "wiki.gs.magia.nao.ajuda": "Считается физической атакой: использует P. Atk.",
  "wiki.gs.magia.estatica.rotulo": "Статическое",
  "wiki.gs.magia.estatica.ajuda": "Крафт, извлечение и подобное — это не бой.",
  "wiki.gs.magia.danca.rotulo": "Танец / Песня",
  "wiki.gs.magia.danca.ajuda": "Танец или песня: по площади, долгая длительность, отдельный слот.",

  "wiki.gs.cifra.skills": "умений",
  "wiki.gs.cifra.graus": "ступеней всего",
  "wiki.gs.cifra.sp": "SP на всё",
  "wiki.gs.cifra.faixa": "диапазон уровней",
  "wiki.gs.mistura.ativas": "активных",
  "wiki.gs.mistura.passivas": "пассивных",
  "wiki.gs.mistura.toggles": "toggle",

  "wiki.gs.regua.tick_1": "Уровень {lv} — умений: {n}",
  "wiki.gs.regua.tick_n": "Уровень {lv} — умений: {n}",

  "wiki.gs.busca.rotulo": "Поиск умений этого класса по названию, эффекту или номеру",
  "wiki.gs.busca.placeholder": "название, эффект или #id…",
  "wiki.gs.aria.tipo": "Фильтр по типу",
  "wiki.gs.aria.recortes": "Выборки",
  "wiki.gs.aria.densidade": "Плотность",
  "wiki.gs.so.magica.rotulo": "Магические",
  "wiki.gs.so.magica.ajuda": "Только то, что считается магией",
  "wiki.gs.so.fs.rotulo": "F. Scroll",
  "wiki.gs.so.fs.ajuda": "Только то, что требует Forgotten Scroll",
  "wiki.gs.so.auto.rotulo": "Автоматические",
  "wiki.gs.so.auto.ajuda": "Только то, что приходит само при повышении уровня",
  "wiki.gs.modo.lista.rotulo": "Список",
  "wiki.gs.modo.lista.ajuda": "Одна строка на умение, с открытым описанием",
  "wiki.gs.modo.grade.rotulo": "Сетка",
  "wiki.gs.modo.grade.ajuda": "Только иконки, чтобы окинуть взглядом — клик открывает в списке",
  "wiki.gs.conta.de": "из {n}",
  "wiki.gs.limpar": "сбросить",
  "wiki.gs.vazio.texto": "Ни одно умение **{classe}** не подходит под эту выборку.",
  "wiki.gs.vazio.botao": "Сбросить фильтр",

  "wiki.gs.peca.nv": "ур. {n}",
  "wiki.gs.peca.graus": "ступеней: {n}",

  "wiki.gs.degrau_rot": "уровень",
  "wiki.gs.grupo.qtd_1": "умений: {n}",
  "wiki.gs.grupo.qtd_n": "умений: {n}",
  "wiki.gs.icone_falta": "Иконка пока не извлечена из клиента",

  "wiki.gs.tag.fs.rotulo": "F. Scroll",
  "wiki.gs.tag.fs.ajuda": "Изучается только с Forgotten Scroll",
  "wiki.gs.tag.livro.rotulo": "Книга",
  "wiki.gs.tag.livro.ajuda": "Требует соответствующий Spellbook",
  "wiki.gs.tag.auto.rotulo": "Автоматическое",
  "wiki.gs.tag.auto.ajuda": "Приходит само при повышении уровня — не стоит SP",
  "wiki.gs.tag.link": "Ссылка на это умение",

  "wiki.gs.linha.neste_grau": "на этой ступени",
  "wiki.gs.linha.auto": "автоматическое — не стоит SP",
  "wiki.gs.linha.sp_graus": "SP за все ступени ({n})",
  "wiki.gs.linha.completa": "полностью изучено на уровне",
  "wiki.gs.linha.herdado_1": "1-я ступень приходит от предыдущего класса",
  "wiki.gs.linha.herdado_n": "первые {n} ступеней приходят от предыдущего класса",
  "wiki.gs.linha.muda_nome": "меняет название: {nomes}",

  "wiki.gs.escada.aria": "{n} ступеней умения {skill}",
  "wiki.gs.escada.rot": "ступень",
  "wiki.gs.escada.de": "из {n}",
  "wiki.gs.escada.entalhe": "Ступень {g}, уровень {lv}, {sp}",
  "wiki.gs.escada.com_sp": "{sp} SP",
  "wiki.gs.escada.sem_sp": "без затрат SP",
};

export const grimorioPl: Dict = {
  "wiki.gs.meta.fallback": "Klasa — Wiki | L2 Versus",
  "wiki.gs.meta.titulo": "{classe} — {degrau} {raca} | Wiki L2 Versus",
  "wiki.gs.meta.descricao":
    "{classe}: {degrau} rasy {raca} w L2 Versus (High Five). Linia rozwoju, identyfikator klasy i to, co zmienia serwer.",

  "wiki.gs.ficha.tipo": "Typ",
  "wiki.gs.ficha.magica": "Magiczna",
  "wiki.gs.ficha.fisica": "Fizyczna",
  "wiki.gs.ficha.invocador": "Przywoływacz",
  "wiki.gs.sim": "Tak",
  "wiki.gs.nao": "Nie",

  "wiki.gs.stat.str": "Siła",
  "wiki.gs.stat.dex": "Zręczność",
  "wiki.gs.stat.con": "Kondycja",
  "wiki.gs.stat.int": "Inteligencja",
  "wiki.gs.stat.wit": "Spryt",
  "wiki.gs.stat.men": "Wola",

  "wiki.gs.armas.nota":
    "Serwer nie przechowuje listy „broni tej klasy”. Ta lista jest **wyliczona**: krzyżujemy umiejętności, których uczy się klasa, z warunkiem broni zadeklarowanym w każdej z nich. Gdzie umiejętność nie wymaga broni, tam się tu nie pojawia — a klasa może używać broni, której nie wymaga żadna umiejętność.",
  "wiki.gs.armas.exemplo": "np. {skill}",

  "wiki.gs.titulo": "Umiejętności, których się uczy",
  "wiki.gs.intro":
    "Nazwa, ikona i opis pochodzą z **klienta Versus** — to tekst, który czytasz w grze, już z naszymi zmianami. Tam, gdzie różni się od oryginalnego High Five, różnica jest zamierzona. Każda umiejętność pojawia się raz; linijka stopni pod opisem przechodzi przez wszystkie jej poziomy.",
  "wiki.gs.fonte.arvore": "drzewo umiejętności z datapacka",
  "wiki.gs.fonte.cliente":
    "klient: skillname-e.dat × skillgrp.dat (paczka: {n} umiejętności, {m} stopni)",

  "wiki.gs.dono.saiu_1": "Odeszła stąd: ",
  "wiki.gs.dono.saiu_n": "Odeszły stąd: ",
  "wiki.gs.dono.meio":
    ", którą poprzednie czytanie drzewa przypisywało tej klasie, a dziś należy do ",
  "wiki.gs.dono.sufixo":
    ". Serwer zmienił w nich właściciela — to nie luka w kodeksie.",
  "wiki.gs.lista.e": " i ",
  "wiki.gs.semdono.prefixo_1":
    "Poprzednie czytanie drzewa wymieniało tu jeszcze jedną umiejętność, której dziś nie uczy się żadna z 89 klas w paczce — ",
  "wiki.gs.semdono.prefixo_n":
    "Poprzednie czytanie drzewa wymieniało tu jeszcze {n} umiejętności, których dziś nie uczy się żadna z 89 klas w paczce — ",
  "wiki.gs.semdono.sufixo":
    ". Albo trafiła do klasy Kamael, która jest poza paczką, albo zniknęła z serwera. Zostaje zapisana, zamiast być pokazana bez ikony i bez opisu.",

  "wiki.gs.sem_arvore":
    "Drzewa umiejętności tej klasy nie znaleziono w wygenerowanym pliku. Nic nie zostało wymyślone, by wypełnić miejsce.",
  "wiki.gs.fora_do_pacote":
    "Ta klasa jest poza paczką ikon i opisów wyciągniętą z klienta, więc jest tu tylko to, co mówi drzewo serwera: nazwa, poziom, stopnie i SP. Bez ikony i bez tekstu efektu — żadnego z nich nie szukaliśmy w innym źródle, by wypełnić lukę.",

  "wiki.gs.resumo.skills": "umiejętności",
  "wiki.gs.resumo.niveis_total": "poziomów łącznie",
  "wiki.gs.resumo.niveis": "poziomy",
  "wiki.gs.resumo.sp_tudo": "SP na wszystko",
  "wiki.gs.resumo.com_livro": "z księgą",
  "wiki.gs.tab.skill": "Umiejętność",
  "wiki.gs.tab.graus": "Stopnie",
  "wiki.gs.tab.obtencao": "Zdobycie",
  "wiki.gs.muda_de_nome": "zmienia nazwę",
  "wiki.gs.obt.automatica": "automatyczna",
  "wiki.gs.obt.livro": "księga",
  "wiki.gs.obt.mestre": "mistrz",
  "wiki.gs.sem_sp":
    "{n} z {m} poziomów nie podaje w pliku kosztu SP — to umiejętności automatyczne, które przychodzą same przy awansie. W tabeli widać „—”, a nie wymyślone zero.",

  "wiki.gs.div.titulo": "Źródła serwera są niezgodne w tej klasie",
  "wiki.gs.div.texto":
    "XML klas mówi, że klasą nadrzędną jest {xml}; enum w kodzie mówi {enum}. Ta strona idzie za enumem, bo właśnie stamtąd serwer bierze prawdziwe drzewo umiejętności.",

  "wiki.gs.rodape.aria": "Idź dalej po linii rozwoju",
  "wiki.gs.rodape.vem_de": "Pochodzi od",
  "wiki.gs.rodape.comeco": "to początek linii",
  "wiki.gs.rodape.indice": "Indeks",
  "wiki.gs.rodape.todas": "Wszystkie {n} klas",
  "wiki.gs.rodape.vira": "Zmienia się w",
  "wiki.gs.rodape.fim": "to koniec linii",
  "wiki.gs.colofao":
    "Nazwa, hierarchia i rasa odczytane z plików serwera. Rola (wojownik, rycerz, łotrzyk, mag, wsparcie) to nasza klasyfikacja, żeby dać drzewu kolor i czytelność — serwer tych danych nie przechowuje.",

  "wiki.gs.tipo.ativa.rotulo": "Aktywna",
  "wiki.gs.tipo.ativa.ajuda": "Ty ją aktywujesz. Ma cel, czas odnowienia i koszt.",
  "wiki.gs.tipo.passiva.rotulo": "Pasywna",
  "wiki.gs.tipo.passiva.ajuda": "Zawsze włączona. Nie zajmuje paska i nic nie kosztuje.",
  "wiki.gs.tipo.toggle.rotulo": "Toggle",
  "wiki.gs.tipo.toggle.ajuda": "Włączasz i wyłączasz. Pobiera zasób, dopóki jest włączona.",
  "wiki.gs.tipo.todas.rotulo": "Wszystkie",
  "wiki.gs.tipo.todas.ajuda": "Bez filtra typu",

  "wiki.gs.magia.sim.rotulo": "Magiczna",
  "wiki.gs.magia.sim.ajuda": "Liczy się jako magia: można ją przerwać i korzysta z M. Atk.",
  "wiki.gs.magia.nao.rotulo": "Fizyczna",
  "wiki.gs.magia.nao.ajuda": "Liczy się jako atak fizyczny: korzysta z P. Atk.",
  "wiki.gs.magia.estatica.rotulo": "Statyczna",
  "wiki.gs.magia.estatica.ajuda": "Craft, ekstrakcja i podobne — to nie walka.",
  "wiki.gs.magia.danca.rotulo": "Taniec / Pieśń",
  "wiki.gs.magia.danca.ajuda": "Taniec lub pieśń: obszarowa, długie trwanie, własny slot.",

  "wiki.gs.cifra.skills": "umiejętności",
  "wiki.gs.cifra.graus": "stopni łącznie",
  "wiki.gs.cifra.sp": "SP na wszystko",
  "wiki.gs.cifra.faixa": "zakres poziomów",
  "wiki.gs.mistura.ativas": "aktywnych",
  "wiki.gs.mistura.passivas": "pasywnych",
  "wiki.gs.mistura.toggles": "toggle",

  "wiki.gs.regua.tick_1": "Poziom {lv} — umiejętności: {n}",
  "wiki.gs.regua.tick_n": "Poziom {lv} — umiejętności: {n}",

  "wiki.gs.busca.rotulo": "Szukaj umiejętności tej klasy po nazwie, efekcie lub numerze",
  "wiki.gs.busca.placeholder": "nazwa, efekt lub #id…",
  "wiki.gs.aria.tipo": "Filtruj po typie",
  "wiki.gs.aria.recortes": "Wycinki",
  "wiki.gs.aria.densidade": "Gęstość",
  "wiki.gs.so.magica.rotulo": "Magiczne",
  "wiki.gs.so.magica.ajuda": "Tylko to, co liczy się jako magia",
  "wiki.gs.so.fs.rotulo": "F. Scroll",
  "wiki.gs.so.fs.ajuda": "Tylko to, co wymaga Forgotten Scroll",
  "wiki.gs.so.auto.rotulo": "Automatyczne",
  "wiki.gs.so.auto.ajuda": "Tylko to, co przychodzi samo przy awansie",
  "wiki.gs.modo.lista.rotulo": "Lista",
  "wiki.gs.modo.lista.ajuda": "Jedna linia na umiejętność, z otwartym opisem",
  "wiki.gs.modo.grade.rotulo": "Siatka",
  "wiki.gs.modo.grade.ajuda": "Tylko ikony, do rzutu okiem — klik otwiera na liście",
  "wiki.gs.conta.de": "z {n}",
  "wiki.gs.limpar": "wyczyść",
  "wiki.gs.vazio.texto": "Żadna umiejętność **{classe}** nie pasuje do tego wycinka.",
  "wiki.gs.vazio.botao": "Wyczyść filtr",

  "wiki.gs.peca.nv": "poz. {n}",
  "wiki.gs.peca.graus": "stopni: {n}",

  "wiki.gs.degrau_rot": "poziom",
  "wiki.gs.grupo.qtd_1": "umiejętności: {n}",
  "wiki.gs.grupo.qtd_n": "umiejętności: {n}",
  "wiki.gs.icone_falta": "Ikona jeszcze nie wyciągnięta z klienta",

  "wiki.gs.tag.fs.rotulo": "F. Scroll",
  "wiki.gs.tag.fs.ajuda": "Uczy się tylko z Forgotten Scroll",
  "wiki.gs.tag.livro.rotulo": "Księga",
  "wiki.gs.tag.livro.ajuda": "Wymaga odpowiedniego Spellbooka",
  "wiki.gs.tag.auto.rotulo": "Automatyczna",
  "wiki.gs.tag.auto.ajuda": "Przychodzi sama przy awansie — nie kosztuje SP",
  "wiki.gs.tag.link": "Link do tej umiejętności",

  "wiki.gs.linha.neste_grau": "na tym stopniu",
  "wiki.gs.linha.auto": "automatyczna — nie kosztuje SP",
  "wiki.gs.linha.sp_graus": "SP za wszystkie stopnie ({n})",
  "wiki.gs.linha.completa": "pełna na poziomie",
  "wiki.gs.linha.herdado_1": "1. stopień pochodzi z poprzedniej klasy",
  "wiki.gs.linha.herdado_n": "pierwsze {n} stopni pochodzi z poprzedniej klasy",
  "wiki.gs.linha.muda_nome": "zmienia nazwę: {nomes}",

  "wiki.gs.escada.aria": "{n} stopni umiejętności {skill}",
  "wiki.gs.escada.rot": "stopień",
  "wiki.gs.escada.de": "z {n}",
  "wiki.gs.escada.entalhe": "Stopień {g}, poziom {lv}, {sp}",
  "wiki.gs.escada.com_sp": "{sp} SP",
  "wiki.gs.escada.sem_sp": "bez kosztu SP",
};
