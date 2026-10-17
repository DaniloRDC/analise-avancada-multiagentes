# Relatório do construtor — rodada 01

## Versão examinada

Sem Git neste diretório. SHA-256 dos arquivos relevantes:

- `preparar_dados.py`: `5FE29C652846A1CCAB3815462E1033FA0131C7343730907D22F15A9C61A1D477`
- `analise.md`: `60C96502DA9407C919692D53530D613EE6C4D047C219B57533E5A72899343976`
- `README.md`: `54E4359EE8E76490C613E50768712B256877A004FC50701CA161A470E18D96BC`
- `site/index.html`: `CA7B8A3EED007F3E086E6EDAA349794B00F5F471923F6E48E9E8D6A72D2DB1DB`
- `site/styles.css`: `8003C56D423283A471C023B94846EFC137E17A25662C636DE2FF5BE2E65BCA54`
- `site/app.js`: `EFCE17C094EB376BF8AFDE30CDCE394C246EDED8590A3E1D993B3E6151706CC3`
- `site/dados/vendas.json`: `E750E357F2CD2ED741A3BB81E82DFA4D0205ACC41B023BBB3006201BE133CA2A`

## Entrega conferida

O script pandas lê `../papelaria_limpa.csv`, valida esquema, campos, IDs e valores com `Decimal`, e gera JSON e análise sem alterar a fonte. Cada linha é uma venda/transação; `quantidade` mede unidades. O painel estático tem três KPIs (total vendido, transações e ticket médio), gráficos por categoria e cidade, tabela, filtros funcionais de categoria/cidade que redesenham todos os elementos, botão de limpar e mensagens para resultados vazios. CSS inclui layouts responsivos. A documentação define R$ como convenção e explicita que valor vendido não é lucro.

## Comandos e resultados

Executados na pasta `projeto-dashboard`:

- `..\.venv\Scripts\python.exe preparar_dados.py` — sucesso; 180 transações, total 20059.0, ticket médio 111.44.
- `..\.venv\Scripts\python.exe -m unittest discover -s tests -v` — 4 testes passaram; verificaram fonte preservada, linhas, esquema, IDs, cálculo independente e agregados conhecidos.
- `node --check site/app.js` — código de saída 0.
- Verificação HTTP local com `python -m http.server` e `urllib` — `index.html`, CSS, JS e JSON responderam 200; JSON válido com 180 transações.
- Recálculo independente do JSON com `Decimal` — total 20059.0 e média exata 111.438888…; arredondada a duas casas, R$ 111,44.

Evidências: `analise.md`, `site/dados/vendas.json` e saída dos comandos acima. O original e os arquivos fora de `projeto-dashboard` não foram alterados.

## Pendências

- **PENDENTE:** interação real em navegador (filtros isolados/combinados, seleção vazia, limpar, teclado e telas pequenas/grandes). Playwright, Selenium e jsdom não estão instalados. A tentativa de captura headless do Firefox não produziu arquivo; portanto, não a considero evidência de teste visual.
- Não foram produzidos relatórios de tester/revisor nem relatório `FINAL.md`, conforme o escopo desta execução.

## Status

**BLOQUEADO** para aprovação completa: construção, pipeline, testes Python, sintaxe JS e entrega HTTP verificadas; falta executar teste de interface real. Próximo passo: testar interação e responsividade num navegador automatizado e registrar os resultados.
