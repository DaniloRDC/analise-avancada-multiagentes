# Análise reproduzível — vendas da papelaria

## Pergunta e unidade de análise

Este conjunto resume o valor bruto vendido no período e permite comparar vendas por categoria e cidade. Cada linha de `papelaria_limpa.csv` representa **uma venda/transação** (um registro identificado por `id_venda`); `quantidade` conta unidades de produtos, não transações.

## Fonte, preparação e regras

- Fonte local: `../papelaria_limpa.csv`; a análise usa a cópia limpa existente e não altera o original nem o CSV limpo.
- O arquivo limpo contém 180 linhas e 9 colunas. `id_venda` é único nesta fonte.
- A remoção de duas linhas integralmente duplicadas, o tratamento de cidade/categoria e o preenchimento de pagamento vazio foram feitos na etapa anterior e estão descritos em `../resumo.md`. Esta rotina não deduplica novamente nem descarta linhas.
- O script valida esquema, campos vazios, unicidade do ID, quantidades positivas e igualdade exata de `valor_venda` com `quantidade × preco_unitario` usando `Decimal`.
- Arquivos produzidos: `site/dados/vendas.json` (dados para o site) e `analise.md` (este relatório). A saída JSON é derivada e pode ser recriada pelo comando documentado em `README.md`.

## Métricas e resultados

- **Valor total vendido:** R$ 20.059,00 — soma de `valor_venda`; valor bruto, não lucro.
- **Vendas (transações):** 180 — quantidade de linhas/transações, não quantidade de unidades.
- **Ticket médio:** R$ 111,44 — `valor total vendido ÷ número de transações`.
- **Unidades vendidas:** 548 — soma separada de `quantidade`, não usada como denominador do ticket médio.
- **Período:** 2026-01-01 a 2026-03-31.

Valores monetários são calculados com decimal exato no Python. A interface formata os números como reais (R$), seguindo os documentos anteriores; a fonte não declara moeda explicitamente.

### Valor vendido por categoria

| Categoria | Transações | Valor vendido |
|---|---|---|
| Acessórios | 65 | R$ 10.517,00 |
| Livros | 54 | R$ 7.438,00 |
| Papelaria | 61 | R$ 2.104,00 |

### Valor vendido por cidade

| Cidade | Transações | Valor vendido |
|---|---|---|
| Campinas | 70 | R$ 8.578,00 |
| Santos | 60 | R$ 6.937,50 |
| Sorocaba | 50 | R$ 4.543,50 |

## Limitações

- A análise descreve apenas os registros disponíveis; não há comparação com fonte financeira externa.
- `valor_venda` é quantidade multiplicada pelo preço unitário informado; custos, despesas, descontos ou devoluções não constam, portanto não se pode inferir lucro ou margem.
- A moeda não está codificada no CSV; R$ é uma convenção de apresentação documentada, não uma conclusão a partir dos dados.
- Os filtros e gráficos descrevem associações/agrupamentos, não causalidade.
