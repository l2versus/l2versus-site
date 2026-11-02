"use client";

import { useState } from "react";

/**
 * CALCULADORA DA TAXA — a parte interativa da página.
 *
 * Por que existe: "a casa retém 12%" é uma frase que o jogador lê e não sente.
 * Arrastar o preço e ver o próprio bolso mudando em tempo real responde a
 * pergunta que ele realmente tem — "quanto cai pra mim?" — sem obrigá-lo a
 * fazer conta de cabeça nem a criar conta para descobrir.
 *
 * Os 12% vêm de `commission_pct`, gravado por anúncio em `rmt_listings` e
 * aplicado em settleSale (lib/repos/rmt.ts):
 *     houseCents = round(price_cents * commission_pct / 100)
 *     sellerNet  = price_cents - houseCents
 * O arredondamento aqui repete o de lá de propósito: mostrar um centavo
 * diferente do que a venda realmente paga seria pior do que não mostrar nada.
 */
const COMISSAO = 12;

export default function Calculadora({
  rotulos,
}: {
  rotulos: { titulo: string; preco: string; voceRecebe: string; casa: string; nota: string };
}) {
  const [preco, setPreco] = useState(25);

  const centavos = Math.round(preco * 100);
  const casaCent = Math.round((centavos * COMISSAO) / 100);
  const seuCent = centavos - casaCent;
  const dinheiro = (c: number) =>
    (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="calc">
      <p className="calc-titulo">{rotulos.titulo}</p>

      <label className="calc-campo">
        <span className="calc-rot">{rotulos.preco}</span>
        <span className="calc-valor">{dinheiro(centavos)}</span>
        <input
          type="range"
          min={1}
          max={500}
          step={1}
          value={preco}
          onChange={(e) => setPreco(+e.target.value)}
          aria-label={rotulos.preco}
          /* a cor preenchida acompanha o polegar: sem isso a trilha fica igual
             dos dois lados e o controle não parece arrastável */
          style={{ ["--pct" as string]: `${((preco - 1) / 499) * 100}%` }}
        />
      </label>

      <div className="calc-saida">
        <div className="calc-seu">
          <span className="calc-rot">{rotulos.voceRecebe}</span>
          <strong>{dinheiro(seuCent)}</strong>
        </div>
        <div className="calc-casa">
          <span className="calc-rot">
            {rotulos.casa} · {COMISSAO}%
          </span>
          <strong>{dinheiro(casaCent)}</strong>
        </div>
      </div>

      {/* a barra é a mesma informação sem número: 88 contra 12 salta à vista */}
      <div className="calc-barra" aria-hidden>
        <span className="calc-barra-seu" style={{ width: `${100 - COMISSAO}%` }} />
        <span className="calc-barra-casa" style={{ width: `${COMISSAO}%` }} />
      </div>

      <p className="calc-nota">{rotulos.nota}</p>
    </div>
  );
}
