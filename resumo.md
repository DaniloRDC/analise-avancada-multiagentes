# Tratamento e análise — vendas_papelaria.csv

## Estrutura e qualidade do original
- **Registros:** 182 linhas de vendas e **8 colunas** (o cabeçalho não entra na contagem de vendas).
- **Granularidade/chave:** uma linha por venda; `id_venda` identifica a venda. Foram encontradas 2 linhas duplicadas exatamente; IDs repetidos: V0010, V0020. As repetições de ID correspondem a essas duplicatas exatas.
- **Campos vazios:** `forma_pagamento` tinha 4; demais campos: nenhum.
- **Inconsistências textuais:** `cidade` tinha 6 valores com espaços no início/fim; `categoria` tinha variantes: `acessórios` (3).
- **Tipos observados:** identificador e dimensões textuais (`id_venda`, `cidade`, `categoria`, `produto`, `forma_pagamento`); data ISO (`data`); métrica inteira (`quantidade`) e decimal (`preco_unitario`). Período: 2026-01-01 a 2026-03-31.
- **Verificações numéricas:** quantidades de 1 a 5; preços unitários de 3.5 a 95. Sem valores vazios ou não numéricos nesses dois campos.

## Tratamento aplicado na cópia
1. Removidas apenas as 2 linhas integralmente idênticas, mantendo a primeira ocorrência; não removi registros apenas por compartilharem `id_venda`.
2. Removidos espaços no início/fim de `cidade`.
3. Padronizada `categoria` para `Livros`, `Papelaria` e `Acessórios`.
4. Pagamento vazio preenchido com `Não informado`.
5. Criada `valor_venda` como `quantidade * preco_unitario`, com cálculo decimal exato.

## Resultado
- **Arquivo gerado:** `papelaria_limpa.csv` - 180 vendas, 9 colunas.
- IDs de venda únicos após a remoção das duplicatas exatas: **sim**.
- Categorias finais: Acessórios (65), Livros (54), Papelaria (61).
- Vendas sem forma de pagamento informada: 4.
- Soma de `valor_venda`: **20059** (nas unidades monetárias do arquivo).
- O original foi preservado (SHA-256 antes/depois idêntico).

O processamento usou somente o CSV local, com `.venv/Scripts/python.exe`; não houve acesso a banco de dados.
