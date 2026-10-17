# Relatório do tester — rodada 01

## Versão examinada

Sem commit: `projeto-dashboard` não está em um repositório Git. Identificação SHA-256 dos arquivos relevantes:

| Arquivo | SHA-256 |
| --- | --- |
| `preparar_dados.py` | `5FE29C652846A1CCAB3815462E1033FA0131C7343730907D22F15A9C61A1D477` |
| `analise.md` | `60C96502DA9407C919692D53530D613EE6C4D047C219B57533E5A72899343976` |
| `README.md` | `506B16CAF096AE5D65E045DAA0BE9513802992D71CBF742DE698A669C8DF9BF0` |
| `tests/test_preparar_dados.py` | `FDCDDFE61B3B9F0C29088ADBCDA95B5A327ECB22D78432FE51B21063A137F12D` |
| `tests/test_browser.cjs` | `A9F076B29A8A89EE9C16542127A9E07431224CFF6E208791986360126837A47D` |
| `site/index.html` | `CA7B8A3EED007F3E086E6EDAA349794B00F5F471923F6E48E9E8D6A72D2DB1DB` |
| `site/styles.css` | `7D4DD22B37811A392F795921533B857BEC7C34F4B47C9E8CD076D3DC67ECD513` |
| `site/app.js` | `EFCE17C094EB376BF8AFDE30CDCE394C246EDED8590A3E1D993B3E6151706CC3` |
| `site/dados/vendas.json` | `E750E357F2CD2ED741A3BB81E82DFA4D0205ACC41B023BBB3006201BE133CA2A` |
| `../papelaria_limpa.csv` | `E25B6C2CDF05A6492F6495A91F9384565629F26E1318039F75734DCD9856995D` |
| `../vendas_papelaria.csv` | `BF95B7609E30EB7E3E6A30CFC16E43D9FB5BDFC48A410E49148CCEB92E2494FF` |

## Conferências e alterações

- Executei a suíte de dados e a integração real com Chrome/CDP. O script `tests/test_browser.cjs` já existia; conforme informado pelo coordenador, preservo que sua autoria é dele. Não reivindico sua autoria nem uma execução independente anterior: a execução registrada abaixo foi feita pelo tester nesta rodada.
- Completei **somente** `tests/test_browser.cjs`: verifica os valores de todas as células da tabela inicial, IDs das linhas sob filtros isolados/combinados e valores dos dois gráficos comparados com agrupamentos independentes do JSON filtrado. Não alterei arquivos do produto. Reexecutei a suíte depois das alterações.
- Os CSVs foram preservados byte a byte pela asserção do teste; hashes registrados acima.

## Comandos executados e resultados

Executados em `projeto-dashboard` (PowerShell):

- `..\.venv\Scripts\python.exe preparar_dados.py` — **PASSOU**; 180 transações, total `20059.0`, ticket médio `111.44`.
- `..\.venv\Scripts\python.exe -m unittest discover -s tests -v` — **PASSOU**, 5 testes; cobrem preservação das fontes, regras e evidência de duplicatas, esquema/tipos/campos preenchidos/IDs, cálculos e agrupamentos independentes, exemplo conhecido e arquivos esperados.
- `node --check tests\test_browser.cjs` e `node --check site\app.js` — **PASSOU**.
- `node tests\test_browser.cjs` — **PASSOU** em Chrome headless via CDP e HTTP `127.0.0.1:8765`: KPIs e agregados dos gráficos, tabela alinhada ao JSON, filtros de categoria/cidade e combinados, seleção vazia sem `NaN`/infinito, limpar filtros, seleção por teclado, foco/rótulos associados, viewport desktop `1365×900` e mobile `375×812`, sem erros JavaScript de console/exceções.
- HTTP para `/`, `/styles.css`, `/app.js` e `/dados/vendas.json` — todos **200**; JSON servido com 180 registros.
- Inspeção visual por screenshots em ambos os viewports; filtros e rótulos visíveis e utilizáveis, tabela permanece contida em área com rolagem horizontal no celular. Evidências temporárias: `C:\Users\IADADOS\AppData\Local\Temp\opencode\dashboard-desktop.png` e `dashboard-mobile.png`.

## Problemas, pendências e encaminhamento

- Nenhuma falha ou teste obrigatório pendente nesta etapa. A auditoria formal de acessibilidade/contraste não fez parte desta suíte; operação por teclado, associação dos rótulos, foco visível definido no CSS e exibição responsiva foram conferidos, mas isso não equivale a auditoria completa.
- A aprovação conjunta do projeto depende ainda da aprovação do construtor e da revisão independente, conforme `agents.md`; este relatório não as presume.

## Status

**APROVADO — etapa de testes do tester para a versão identificada acima.** Todos os testes obrigatórios executados nesta rodada passaram; nenhuma execução anterior do browser foi atribuída ao tester.
