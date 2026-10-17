"""Prepare os dados locais do dashboard e gere uma análise reproduzível.

Fonte: ../papelaria_limpa.csv (um registro por venda/transação).
Não altera a fonte e não remove registros: a deduplicação documentada foi feita
na etapa anterior, antes da criação de papelaria_limpa.csv.
"""

from __future__ import annotations

import json
from collections import defaultdict
from decimal import Decimal
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "papelaria_limpa.csv"
OUTPUT = ROOT / "site" / "dados" / "vendas.json"
ANALYSIS = ROOT / "analise.md"
REQUIRED_COLUMNS = [
    "id_venda",
    "data",
    "cidade",
    "categoria",
    "produto",
    "quantidade",
    "preco_unitario",
    "forma_pagamento",
    "valor_venda",
]


def json_number(value: Decimal) -> int | float:
    """Representa valores monetários como números JSON sem casas inúteis."""
    if value == value.to_integral_value():
        return int(value)
    return float(value)


def markdown_table(headers: list[str], rows: list[list[str]]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "|" + "|".join(["---"] * len(headers)) + "|"]
    lines.extend("| " + " | ".join(row) + " |" for row in rows)
    return "\n".join(lines)


def format_currency(value: Decimal) -> str:
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def prepare() -> dict:
    if not SOURCE.is_file():
        raise FileNotFoundError(f"CSV de origem não encontrado: {SOURCE}")

    # Lê valores como texto para validar conversões e fazer cálculos monetários
    # com Decimal, evitando arredondamentos binários intermediários.
    frame = pd.read_csv(SOURCE, dtype=str, keep_default_na=False)
    missing_columns = [column for column in REQUIRED_COLUMNS if column not in frame.columns]
    if missing_columns:
        raise ValueError(f"Colunas ausentes na fonte: {', '.join(missing_columns)}")
    if list(frame.columns) != REQUIRED_COLUMNS:
        raise ValueError("A ordem ou o conjunto das colunas da fonte não corresponde ao esquema esperado.")
    if frame.empty:
        raise ValueError("A fonte não contém vendas.")
    if frame[REQUIRED_COLUMNS].eq("").any().any():
        empty_columns = frame.columns[frame.eq("").any()].tolist()
        raise ValueError(f"Há campos vazios na fonte: {', '.join(empty_columns)}")
    if frame["id_venda"].duplicated().any():
        duplicated = frame.loc[frame["id_venda"].duplicated(keep=False), "id_venda"].tolist()
        raise ValueError(f"IDs de venda repetidos na fonte limpa: {', '.join(duplicated)}")

    try:
        quantities = [int(value) for value in frame["quantidade"]]
        unit_prices = [Decimal(value) for value in frame["preco_unitario"]]
        reported_values = [Decimal(value) for value in frame["valor_venda"]]
    except (ValueError, ArithmeticError) as error:
        raise ValueError("Quantidade ou valor monetário não pode ser convertido.") from error

    calculated_values = [Decimal(quantity) * price for quantity, price in zip(quantities, unit_prices)]
    mismatches = [
        str(frame.iloc[index]["id_venda"])
        for index, (reported, calculated) in enumerate(zip(reported_values, calculated_values))
        if reported != calculated
    ]
    if mismatches:
        raise ValueError("valor_venda diverge de quantidade × preco_unitario em: " + ", ".join(mismatches))
    if any(quantity <= 0 for quantity in quantities):
        raise ValueError("A fonte contém quantidade menor ou igual a zero.")

    total = sum(reported_values, Decimal("0"))
    transaction_count = len(frame)
    ticket = total / transaction_count
    categories: dict[str, Decimal] = defaultdict(Decimal)
    cities: dict[str, Decimal] = defaultdict(Decimal)
    for category, city, amount in zip(frame["categoria"], frame["cidade"], reported_values):
        categories[category] += amount
        cities[city] += amount

    if sum(categories.values(), Decimal("0")) != total or sum(cities.values(), Decimal("0")) != total:
        raise AssertionError("As agregações por categoria/cidade não fecham com o total.")

    rows = []
    for index, row in frame.iterrows():
        rows.append(
            {
                "id_venda": row["id_venda"],
                "data": row["data"],
                "cidade": row["cidade"],
                "categoria": row["categoria"],
                "produto": row["produto"],
                "quantidade": quantities[index],
                "preco_unitario": json_number(unit_prices[index]),
                "forma_pagamento": row["forma_pagamento"],
                "valor_venda": json_number(reported_values[index]),
            }
        )

    payload = {
        "fonte": "papelaria_limpa.csv",
        "moeda_exibida": "BRL (R$), conforme a convenção adotada no projeto; não há metadado de moeda no CSV.",
        "vendas": rows,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    category_rows = [
        [name, str(int((frame["categoria"] == name).sum())), format_currency(amount)]
        for name, amount in sorted(categories.items(), key=lambda pair: pair[1], reverse=True)
    ]
    city_rows = [
        [name, str(int((frame["cidade"] == name).sum())), format_currency(amount)]
        for name, amount in sorted(cities.items(), key=lambda pair: pair[1], reverse=True)
    ]
    analysis = f"""# Análise reproduzível — vendas da papelaria

## Pergunta e unidade de análise

Este conjunto resume o valor bruto vendido no período e permite comparar vendas por categoria e cidade. Cada linha de `papelaria_limpa.csv` representa **uma venda/transação** (um registro identificado por `id_venda`); `quantidade` conta unidades de produtos, não transações.

## Fonte, preparação e regras

- Fonte local: `../papelaria_limpa.csv`; a análise usa a cópia limpa existente e não altera o original nem o CSV limpo.
- O arquivo limpo contém {len(frame)} linhas e {len(frame.columns)} colunas. `id_venda` é único nesta fonte.
- A remoção de duas linhas integralmente duplicadas, o tratamento de cidade/categoria e o preenchimento de pagamento vazio foram feitos na etapa anterior e estão descritos em `../resumo.md`. Esta rotina não deduplica novamente nem descarta linhas.
- O script valida esquema, campos vazios, unicidade do ID, quantidades positivas e igualdade exata de `valor_venda` com `quantidade × preco_unitario` usando `Decimal`.
- Arquivos produzidos: `site/dados/vendas.json` (dados para o site) e `analise.md` (este relatório). A saída JSON é derivada e pode ser recriada pelo comando documentado em `README.md`.

## Métricas e resultados

- **Valor total vendido:** {format_currency(total)} — soma de `valor_venda`; valor bruto, não lucro.
- **Vendas (transações):** {transaction_count} — quantidade de linhas/transações, não quantidade de unidades.
- **Ticket médio:** {format_currency(ticket)} — `valor total vendido ÷ número de transações`.
- **Unidades vendidas:** {sum(quantities)} — soma separada de `quantidade`, não usada como denominador do ticket médio.
- **Período:** {frame['data'].min()} a {frame['data'].max()}.

Valores monetários são calculados com decimal exato no Python. A interface formata os números como reais (R$), seguindo os documentos anteriores; a fonte não declara moeda explicitamente.

### Valor vendido por categoria

{markdown_table(["Categoria", "Transações", "Valor vendido"], category_rows)}

### Valor vendido por cidade

{markdown_table(["Cidade", "Transações", "Valor vendido"], city_rows)}

## Limitações

- A análise descreve apenas os registros disponíveis; não há comparação com fonte financeira externa.
- `valor_venda` é quantidade multiplicada pelo preço unitário informado; custos, despesas, descontos ou devoluções não constam, portanto não se pode inferir lucro ou margem.
- A moeda não está codificada no CSV; R$ é uma convenção de apresentação documentada, não uma conclusão a partir dos dados.
- Os filtros e gráficos descrevem associações/agrupamentos, não causalidade.
"""
    ANALYSIS.write_text(analysis, encoding="utf-8")
    return {
        "linhas": transaction_count,
        "total": total,
        "ticket_medio": ticket,
        "categorias": dict(categories),
        "cidades": dict(cities),
    }


if __name__ == "__main__":
    result = prepare()
    print(f"Preparação concluída: {result['linhas']} transações; total {result['total']}; ticket médio {result['ticket_medio']:.2f}.")
    print(f"Dados: {OUTPUT}")
    print(f"Análise: {ANALYSIS}")
