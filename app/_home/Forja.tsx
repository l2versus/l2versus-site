"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A FORJA — simulador de enchant jogável.
 *
 * Por que existe: a home inteira era reprodução comandada pela barra de
 * rolagem. Parallax, Ken Burns, split-text e brasas em TODAS as seções — e
 * quando tudo anima igual, nada é momento. Faltava uma coisa que respondesse
 * ao jogador, não ao scroll.
 *
 * Por que enchant e não outro brinquedo: é o momento emocional do Lineage 2.
 * Todo jogador já perdeu uma arma às 3 da manhã. Deixar a pessoa sentir a
 * curva de risco do NOSSO servidor, de graça e antes de criar conta, vende o
 * servidor melhor do que uma tabela de porcentagens — e ainda ensina as regras.
 *
 * TODAS as taxas abaixo são as do servidor, lidas do datapack, não inventadas
 * para efeito dramático:
 *
 *   dist/game/data/EnchantItemGroups.xml
 *     FIGHTER_WEAPON_GROUP / MAGE_WEAPON_GROUP -> 100% até +4, 70% até +12,
 *                                                 40% de +13 a +15,
 *                                                 20% de +16 a +20, teto +20
 *     ARMOR_GROUP / FULL_ARMOR_GROUP           -> 100% até +3, 70% até +5,
 *                                                 40% no +6,
 *                                                 20% de +7 a +10, teto +10
 *
 *   java/.../clientpackets/RequestEnchantItem.java
 *     linha 327  if (scrollTemplate.isBlessed()) -> setEnchantLevel(0): o
 *                abençoado ZERA e o item sobrevive
 *     linha 365  destroyItem(DESTROY, item)     -> o normal DESTRÓI o item
 *                (e compensa em cristais, linhas 400-420)
 *
 * Se qualquer um desses mudar no servidor, esta seção passa a mentir para o
 * jogador — é o tipo de arquivo que precisa ser revisto junto com o datapack.
 */

type Tipo = "arma" | "armadura";
type Estado = "ocioso" | "forjando" | "sucesso" | "quebrou" | "zerou" | "teto";

export type TextosForja = {
  kicker: string;
  titulo: string;
  sub: string;
  arma: string;
  armadura: string;
  normal: string;
  abencoado: string;
  encantar: string;
  chance: string;
  recorde: string;
  tentativas: string;
  quebrou: string;
  zerou: string;
  teto: string;
  recomecar: string;
  nota: string;
  seguro: string;
  escada: string;
  escadaNota: string;
};

/* Faixas [de, até, chance] — espelho de EnchantItemGroups.xml.
   `auraDe` / `auraAzul`: onde a peça começa a brilhar e onde o azul está
   cheio. No L2 a aura nasce logo depois da zona segura e vai esquentando
   até o teto; como arma e armadura têm tetos diferentes (+20 e +10), a
   rampa é normalizada por peça — senão a armadura morreria em azul e nunca
   veria o vermelho que o jogador espera no máximo. */
const TABELA: Record<
  Tipo,
  { max: number; seguro: number; auraDe: number; auraAzul: number; faixas: [number, number, number][] }
> = {
  arma: {
    max: 20,
    seguro: 4,
    auraDe: 4,
    auraAzul: 6,
    faixas: [
      [0, 4, 100],
      [5, 12, 70],
      [13, 15, 40],
      [16, 20, 20],
    ],
  },
  armadura: {
    max: 10,
    seguro: 3,
    auraDe: 3,
    auraAzul: 5,
    faixas: [
      [0, 3, 100],
      [4, 5, 70],
      [6, 6, 40],
      [7, 10, 20],
    ],
  },
};

const chanceEm = (tipo: Tipo, nivel: number) => {
  const t = TABELA[tipo];
  if (nivel >= t.max) return 0;
  return t.faixas.find(([de, ate]) => nivel >= de && nivel <= ate)?.[2] ?? 0;
};

export default function Forja({ textos: x }: { textos: TextosForja }) {
  const [tipo, setTipo] = useState<Tipo>("arma");
  const [abencoado, setAbencoado] = useState(false);
  const [nivel, setNivel] = useState(0);
  const [estado, setEstado] = useState<Estado>("ocioso");
  const [historico, setHistorico] = useState<boolean[]>([]);
  const [tentativas, setTentativas] = useState(0);
  const [recorde, setRecorde] = useState<Record<Tipo, number>>({ arma: 0, armadura: 0 });
  const timer = useRef<number | undefined>(undefined);

  const conf = TABELA[tipo];
  const chance = chanceEm(tipo, nivel);
  /* 0..1 — alimenta o CSS: calor da brasa, intensidade do brilho, tremor */
  const intensidade = Math.min(1, nivel / conf.max);

  /* A AURA DO ENCHANT, como no jogo: a peça acende depois da zona segura,
     está AZUL cheia em `auraAzul` e o matiz escorrega do azul (210°) ao
     VERMELHO (0°) até o teto. Vale para arma E armadura — no L2 as duas
     brilham —, com a rampa normalizada pelo teto de cada uma, senão a
     armadura (+10) morreria em azul e nunca chegaria ao vermelho que o
     jogador espera ver no máximo. */
  const eArma = tipo === "arma";
  const aura =
    nivel <= conf.auraDe
      ? 0
      : Math.max(0, Math.min(1, (nivel - conf.auraDe) / (conf.max - conf.auraDe)));
  const matiz =
    nivel <= conf.auraAzul
      ? 210
      : Math.max(
          0,
          Math.round(210 * (1 - (nivel - conf.auraAzul) / (conf.max - conf.auraAzul)))
        );

  /* recorde por tipo, só no navegador de quem brincou */
  useEffect(() => {
    try {
      const cru = localStorage.getItem("l2v-forja");
      if (cru) setRecorde({ arma: 0, armadura: 0, ...JSON.parse(cru) });
    } catch {
      /* localStorage bloqueado (modo privado) — o simulador funciona igual,
         só não lembra entre visitas */
    }
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const trocarTipo = (novo: Tipo) => {
    if (novo === tipo) return;
    window.clearTimeout(timer.current);
    setTipo(novo);
    setNivel(0);
    setEstado("ocioso");
    setHistorico([]);
  };

  const recomecar = () => {
    window.clearTimeout(timer.current);
    setNivel(0);
    setEstado("ocioso");
    setHistorico([]);
  };

  const encantar = useCallback(() => {
    if (estado === "forjando" || nivel >= conf.max) return;

    setEstado("forjando");
    /* a pausa não é enfeite: sem ela o resultado aparece no mesmo quadro do
       clique e a pessoa não sente risco nenhum */
    timer.current = window.setTimeout(() => {
      const passou = Math.random() * 100 < chance;
      setTentativas((n) => n + 1);
      setHistorico((h) => [...h.slice(-23), passou]);

      if (passou) {
        const novo = nivel + 1;
        setNivel(novo);
        setEstado(novo >= conf.max ? "teto" : "sucesso");
        setRecorde((r) => {
          if (novo <= r[tipo]) return r;
          const atualizado = { ...r, [tipo]: novo };
          try {
            localStorage.setItem("l2v-forja", JSON.stringify(atualizado));
          } catch {
            /* idem: sem persistência, segue o jogo */
          }
          return atualizado;
        });
      } else {
        setNivel(0);
        setEstado(abencoado ? "zerou" : "quebrou");
      }
    }, 620);
  }, [estado, nivel, conf.max, chance, abencoado, tipo]);

  const falhou = estado === "quebrou" || estado === "zerou";

  return (
    <div
      className="forja"
      data-estado={estado}
      data-tipo={tipo}
      style={{
        ["--n" as string]: intensidade.toFixed(3),
        ["--ench-i" as string]: aura.toFixed(3),
        ["--ench-h" as string]: String(matiz),
      }}
    >
      {/* ---------- bigorna / peça ---------- */}
      <div className="forja-palco">
        <div className="forja-brasa" aria-hidden />
        <div className="forja-peca" aria-hidden>
          {/* a aura por trás da peça: a cor vem de --ench-h, a presença de
              --ench-i — em armadura fica em zero e some do compositor */}
          <span className="forja-aura" aria-hidden />
          {/* Render de verdade, não SVG: o recorte tem alpha real (fundo
              extraído por flood-fill), então o drop-shadow segue a SILHUETA
              da lâmina — é o que faz o glow parecer o do jogo, abraçando o
              metal em vez de formar um retângulo luminoso. */}
          {eArma ? (
            <img
              src="/art/espada-forja.png"
              alt=""
              width={367}
              height={1325}
              className="forja-img"
              draggable={false}
            />
          ) : (
            <img
              src="/art/peitoral-forja.png"
              alt=""
              width={786}
              height={997}
              className="forja-img"
              draggable={false}
            />
          )}
        </div>
        <div className="forja-onda" aria-hidden />

        <div className="forja-nivel" aria-live="polite">
          <span className="forja-mais">+</span>
          <span className="forja-num">{nivel}</span>
        </div>

        {falhou && (
          <p className={`forja-veredito ${estado === "quebrou" ? "e-quebrou" : "e-zerou"}`} role="status">
            {estado === "quebrou" ? x.quebrou : x.zerou}
          </p>
        )}
        {estado === "teto" && (
          <p className="forja-veredito e-teto" role="status">
            {x.teto}
          </p>
        )}
      </div>

      {/* ---------- controles ---------- */}
      <div className="forja-painel">
        <p className="forja-kicker">{x.kicker}</p>
        <h3 className="forja-titulo">{x.titulo}</h3>
        <p className="forja-sub">{x.sub}</p>

        <div className="forja-grupo" role="group" aria-label={x.titulo}>
          {(["arma", "armadura"] as Tipo[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`forja-opt ${tipo === t ? "on" : ""}`}
              aria-pressed={tipo === t}
              onClick={() => trocarTipo(t)}
            >
              {t === "arma" ? x.arma : x.armadura}
            </button>
          ))}
        </div>

        <div className="forja-grupo" role="group">
          <button
            type="button"
            className={`forja-opt ${!abencoado ? "on" : ""}`}
            aria-pressed={!abencoado}
            onClick={() => setAbencoado(false)}
          >
            {x.normal}
          </button>
          <button
            type="button"
            className={`forja-opt forja-opt-bencao ${abencoado ? "on" : ""}`}
            aria-pressed={abencoado}
            onClick={() => setAbencoado(true)}
          >
            {x.abencoado}
          </button>
        </div>

        <dl className="forja-leitura">
          <div>
            <dt>{x.chance}</dt>
            <dd className="forja-chance" data-risco={chance <= 20 ? "alto" : chance <= 40 ? "medio" : "baixo"}>
              {chance}%
            </dd>
          </div>
          <div>
            <dt>{x.recorde}</dt>
            <dd>+{recorde[tipo]}</dd>
          </div>
          <div>
            <dt>{x.tentativas}</dt>
            <dd>{tentativas}</dd>
          </div>
        </dl>

        {/* A ESCADA INTEIRA, não só o degrau atual. O pedido veio do dono:
            "mostrar a % real do servidor". O degrau em que a peça está acende;
            os já vencidos apagam. As faixas são rotuladas pelo DESTINO da
            batida (+6→+13 em 70%), porque é assim que o jogador pensa —
            internamente a tabela indexa pelo nível atual, igual ao servidor. */}
        <div className="forja-escada">
          <p className="forja-escada-rot">
            {x.escada}
            <span>{x.escadaNota}</span>
          </p>
          {conf.faixas.map(([de, ate, ch]) => {
            const alvoDe = Math.min(de + 1, conf.max);
            const alvoAte = Math.min(ate + 1, conf.max);
            const atual = nivel >= de && nivel <= ate;
            return (
              <div
                key={de}
                className={`forja-degrau ${atual ? "atual" : nivel > ate ? "vencido" : ""}`}
              >
                <span className="fd-faixa">
                  {alvoDe === alvoAte ? `+${alvoAte}` : `+${alvoDe} – +${alvoAte}`}
                </span>
                <span className="fd-trilho" aria-hidden>
                  <span style={{ width: `${ch}%` }} />
                </span>
                <span className="fd-ch">{ch}%</span>
              </div>
            );
          })}
        </div>

        <div className="forja-acoes">
          <button
            type="button"
            className="btn-gold forja-bater"
            onClick={encantar}
            disabled={estado === "forjando" || nivel >= conf.max}
          >
            {nivel >= conf.max ? x.teto : x.encantar}
          </button>
          {(nivel > 0 || tentativas > 0) && (
            <button type="button" className="forja-reset" onClick={recomecar}>
              {x.recomecar}
            </button>
          )}
        </div>

        {/* fita de tentativas: o olho lê a maré de sorte sem ler número */}
        {historico.length > 0 && (
          <div className="forja-fita" aria-hidden>
            {historico.map((ok, i) => (
              <span key={i} className={ok ? "ok" : "no"} />
            ))}
          </div>
        )}

        <p className="forja-nota">
          <strong>
            +{conf.seguro} {x.seguro}
          </strong>{" "}
          · {x.nota}
        </p>
      </div>
    </div>
  );
}

/* ---------- peças, desenhadas em SVG ----------
   Desenho vetorial e não ícone do jogo: os ícones do client têm 32px e viram
   papa em tamanho de herói. Em SVG a peça escala sem perder nada e, melhor,
   aceita o calor do enchant como gradiente animado. */

function Lamina() {
  return (
    <svg viewBox="0 0 120 320" className="forja-svg" role="presentation">
      <defs>
        <linearGradient id="fg-lamina" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#6b6f7a" />
          <stop offset="45%" stopColor="#c6cbd4" />
          <stop offset="100%" stopColor="#f2f5fa" />
        </linearGradient>
      </defs>
      {/* Lâmina larga de propósito: na primeira versão ela tinha 44 de 120 de
          viewBox e lia como adaga. Uma arma de herói precisa de massa. */}
      <path className="forja-aco" d="M60 6 L88 64 L88 202 L60 226 L32 202 L32 64 Z" fill="url(#fg-lamina)" />
      <path className="forja-fio" d="M60 14 L60 220" />
      {/* vales da lâmina, que dão volume sem textura */}
      <path className="forja-vale" d="M44 72 L44 196" />
      <path className="forja-vale" d="M76 72 L76 196" />
      {/* guarda */}
      <path className="forja-ouro" d="M14 212 L106 212 L98 234 L22 234 Z" />
      {/* Punho com anéis de ouro: só o couro, escuro sobre fundo escuro,
          sumia — e a espada parecia flutuar com o pomo solto embaixo. */}
      <rect className="forja-couro" x="50" y="234" width="20" height="56" rx="3" />
      <path className="forja-ouro-fino" d="M50 248 L70 248" />
      <path className="forja-ouro-fino" d="M50 262 L70 262" />
      <path className="forja-ouro-fino" d="M50 276 L70 276" />
      {/* pomo */}
      <path className="forja-ouro" d="M60 288 L78 302 L60 316 L42 302 Z" />
    </svg>
  );
}

function Peitoral() {
  return (
    <svg viewBox="0 0 220 300" className="forja-svg" role="presentation">
      <defs>
        <linearGradient id="fg-placa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c6cbd4" />
          <stop offset="60%" stopColor="#848a96" />
          <stop offset="100%" stopColor="#5b606b" />
        </linearGradient>
      </defs>
      <path
        className="forja-aco"
        d="M44 36 Q110 8 176 36 L186 120 Q186 232 110 286 Q34 232 34 120 Z"
        fill="url(#fg-placa)"
      />
      <path className="forja-ouro-fino" d="M110 36 L110 282" />
      <path className="forja-ouro-fino" d="M52 108 Q110 134 168 108" />
      <path className="forja-ouro-fino" d="M58 170 Q110 198 162 170" />
      {/* brasão */}
      <path className="forja-ouro" d="M110 128 L132 156 L110 196 L88 156 Z" />
    </svg>
  );
}
