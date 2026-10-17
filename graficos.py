from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import pandas as pd


PASTA = Path(__file__).resolve().parent
ARQUIVO_CSV = PASTA / "papelaria_limpa.csv"


def formatar_reais(valor: float) -> str:
    """Formata um valor como moeda brasileira, por exemplo R$ 1.234,56."""
    numero = f"{valor:,.2f}"
    numero = numero.replace(",", "TEMP").replace(".", ",").replace("TEMP", ".")
    return f"R$ {numero}"


def criar_grafico(
    totais: pd.Series,
    titulo: str,
    eixo_x: str,
    arquivo_saida: str,
    cores: list[str],
) -> None:
    totais = totais.sort_values(ascending=False)
    fig, ax = plt.subplots(figsize=(8, 5), dpi=160)
    posicoes = range(len(totais))
    barras = ax.bar(posicoes, totais.values, color=cores[: len(totais)], width=0.68)

    ax.set_title(titulo, fontsize=15, fontweight="bold", pad=14)
    ax.set_xlabel(eixo_x)
    ax.set_ylabel("Valor total vendido (R$)")
    ax.set_xticks(list(posicoes), [str(item) for item in totais.index])
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda valor, _: formatar_reais(valor)))
    ax.set_ylim(bottom=0, top=max(totais.values) * 1.18)
    ax.set_axisbelow(True)
    ax.grid(axis="y", linestyle="--", alpha=0.3)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    for barra, valor in zip(barras, totais.values):
        ax.annotate(
            formatar_reais(valor),
            (barra.get_x() + barra.get_width() / 2, barra.get_height()),
            xytext=(0, 5),
            textcoords="offset points",
            ha="center",
            va="bottom",
            fontsize=9,
        )

    fig.text(
        0.5,
        0.015,
        "Soma de valor_venda; valor vendido não representa lucro.",
        ha="center",
        fontsize=9,
        color="#555555",
    )
    fig.tight_layout(rect=(0, 0.05, 1, 1))
    fig.savefig(PASTA / arquivo_saida, bbox_inches="tight")
    plt.close(fig)


def main() -> None:
    vendas = pd.read_csv(ARQUIVO_CSV, encoding="utf-8")
    colunas_necessarias = {"categoria", "cidade", "valor_venda"}
    faltantes = colunas_necessarias - set(vendas.columns)
    if faltantes:
        raise ValueError(f"Colunas ausentes no CSV: {sorted(faltantes)}")

    vendas["valor_venda"] = pd.to_numeric(vendas["valor_venda"], errors="raise")
    por_categoria = vendas.groupby("categoria")["valor_venda"].sum()
    por_cidade = vendas.groupby("cidade")["valor_venda"].sum()

    criar_grafico(
        por_categoria,
        "Valor total vendido por categoria",
        "Categoria",
        "categorias.png",
        ["#4C72B0", "#DD8452", "#55A868"],
    )
    criar_grafico(
        por_cidade,
        "Valor total vendido por cidade",
        "Cidade",
        "cidades.png",
        ["#4C72B0"] * len(por_cidade),
    )

    print("Gráficos gerados: categorias.png e cidades.png")
    print("Total por categoria (R$):")
    for nome, valor in por_categoria.sort_values(ascending=False).items():
        print(f"  {nome}: {formatar_reais(valor)}")
    print("Total por cidade (R$):")
    for nome, valor in por_cidade.sort_values(ascending=False).items():
        print(f"  {nome}: {formatar_reais(valor)}")


if __name__ == "__main__":
    main()
