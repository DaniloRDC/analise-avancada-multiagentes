# Verificação da análise de vendas da papelaria

## Avaliação

**Cálculos verificados; análise pronta para compartilhar com a ressalva abaixo.** As somas do CSV limpo, do original após deduplicação e dos agrupamentos dos gráficos coincidem. Não encontrei erro que exigisse alterar `resumo.md` ou `graficos.py`.

## Arquivos e método conferidos

- Li `vendas_papelaria.csv`, `papelaria_limpa.csv`, `resumo.md` e `graficos.py`.
- Recalculei os valores com `.venv/Scripts/python.exe`, usando `pandas` e `Decimal` para os cálculos monetários.
- No original, removi duplicatas exatas apenas para a comparação independente. Na cópia, conferi cada `valor_venda` contra `quantidade * preco_unitario`.
- Conferi no código que a fonte é `papelaria_limpa.csv`, que as somas usam `valor_venda` agrupado por `categoria` e `cidade`, e que o eixo das barras começa em zero.

## Contagens e recálculo

| Base / verificação | Resultado |
|---|---:|
| Original | 182 linhas de vendas, 8 colunas |
| Duplicatas exatas no original | 2 linhas (`V0010` e `V0020`) |
| Original após retirar somente essas duplicatas | 180 vendas |
| Cópia limpa | 180 linhas; 180 `id_venda` distintos |
| Quantidade de vendas (registros/transações) | **180** |
| Soma da coluna `quantidade` (unidades de produtos) | **548** |
| Total do original sem deduplicar | R$ 20.066,00 |
| Total do original após deduplicar | **R$ 20.059,00** |
| Total recalculado da cópia limpa | **R$ 20.059,00** |
| Linhas em que `valor_venda` diverge de quantidade × preço | **0** |

O total bruto do original é R$ 7,00 maior porque inclui as duas linhas duplicadas, cada uma no valor de R$ 3,50. Portanto, o total correto para a análise da cópia deduplicada é **R$ 20.059,00**.

## Conferência das agregações

| Categoria | Valor recalculado |
|---|---:|
| Acessórios | R$ 10.517,00 |
| Livros | R$ 7.438,00 |
| Papelaria | R$ 2.104,00 |
| **Soma das categorias** | **R$ 20.059,00** |

A soma das categorias coincide com o total geral. Como checagem adicional, as cidades também fecham: Campinas R$ 8.578,00 + Santos R$ 6.937,50 + Sorocaba R$ 4.543,50 = **R$ 20.059,00**.

## Qualidade e apresentação

- Reconfirmei no original: 4 pagamentos vazios, 6 cidades com espaços nas extremidades, 3 registros de categoria escritos `acessórios` em minúscula e nenhum outro campo vazio.
- As datas vão de 2026-01-01 a 2026-03-31; `quantidade` vai de 1 a 5 e `preco_unitario` de 3,5 a 95.
- `graficos.py` lê a cópia limpa no diretório do próprio script, gera `categorias.png` e `cidades.png`, usa títulos e formatação de reais em português e fixa o limite inferior do eixo em zero. As somas mostradas nos gráficos batem com os recálculos acima.
- As conclusões de `resumo.md` sobre 180 vendas, 2 duplicatas, total de 20.059 e categorias estão corretas para a cópia limpa. As barras sustentam que Acessórios tem o maior valor vendido entre as categorias e Campinas entre as cidades.

## Ressalva

`valor_venda` mede quantidade vendida × preço unitário; é valor bruto de vendas, **não lucro**. O CSV não contém custos nem despesas. Os rótulos em R$ seguem a instrução recebida; o arquivo em si guarda valores numéricos sem metadado de moeda.

Esta verificação foi feita somente com os arquivos locais; não houve comparação com fontes externas ou registros financeiros.
