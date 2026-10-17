# Relatório do tester — rodada 03

## Versão examinada

Sem commit: o workspace não está em um repositório Git. SHA-256 dos arquivos relevantes após os testes (não houve alteração nos arquivos do produto, testes ou fontes):

| Arquivo | SHA-256 |
| --- | --- |
| `projeto-dashboard/preparar_dados.py` | `5FE29C652846A1CCAB3815462E1033FA0131C7343730907D22F15A9C61A1D477` |
| `projeto-dashboard/analise.md` | `60C96502DA9407C919692D53530D613EE6C4D047C219B57533E5A72899343976` |
| `projeto-dashboard/README.md` | `506B16CAF096AE5D65E045DAA0BE9513802992D71CBF742DE698A669C8DF9BF0` |
| `projeto-dashboard/tests/test_preparar_dados.py` | `FDCDDFE61B3B9F0C29088ADBCDA95B5A327ECB22D78432FE51B21063A137F12D` |
| `projeto-dashboard/tests/test_browser.cjs` | `A9F076B29A8A89EE9C16542127A9E07431224CFF6E208791986360126837A47D` |
| `projeto-dashboard/site/index.html` | `CA7B8A3EED007F3E086E6EDAA349794B00F5F471923F6E48E9E8D6A72D2DB1DB` |
| `projeto-dashboard/site/styles.css` | `7D4DD22B37811A392F795921533B857BEC7C34F4B47C9E8CD076D3DC67ECD513` |
| `projeto-dashboard/site/app.js` | `EFCE17C094EB376BF8AFDE30CDCE394C246EDED8590A3E1D993B3E6151706CC3` |
| `projeto-dashboard/site/dados/vendas.json` | `E750E357F2CD2ED741A3BB81E82DFA4D0205ACC41B023BBB3006201BE133CA2A` |
| `vendas_papelaria.csv` | `BF95B7609E30EB7E3E6A30CFC16E43D9FB5BDFC48A410E49148CCEB92E2494FF` |
| `papelaria_limpa.csv` | `E25B6C2CDF05A6492F6495A91F9384565629F26E1318039F75734DCD9856995D` |

Esses hashes coincidem com os da rodada 01. O workspace contém Python 3.14.7, Node.js v24.21.0 e Chrome; servidor HTTP em `127.0.0.1:8765` e Chrome CDP em `127.0.0.1:9222` já estavam ativos.

## Conferências e comandos

Executados no PowerShell, em `projeto-dashboard` salvo onde indicado:

- `..\.venv\Scripts\python.exe -m unittest discover -s tests -v` — **PASSOU**, 5 testes; incluem preservação da fonte, regras/duplicatas, esquema e IDs, cálculos/agrupamentos independentes, exemplo conhecido e arquivos esperados. A saída informou 180 transações, total `20059.0` e ticket médio `111.44`. Os hashes antes/depois permaneceram iguais.
- `node --check tests\test_browser.cjs` — **PASSOU**.
- `node --check site\app.js` — **PASSOU**.
- `node tests\test_browser.cjs` — **PASSOU** em Chrome via CDP e site HTTP. Conferiu KPIs, agregações e tabela contra o JSON; filtros de categoria/cidade isolados e combinados; resultado vazio sem `NaN`/infinito; limpar filtros; seleção por teclado, foco e rótulos; viewports 1365×900 e 375×812 sem rolagem horizontal da página; nenhum erro JavaScript de console/exceção.
- `Invoke-WebRequest` para `/`, `/styles.css`, `/app.js` e `/dados/vendas.json` em `http://127.0.0.1:8765` — **200** em todos; JSON servido contém 180 registros.
- Capturei e inspecionei screenshots dos viewports desktop e mobile: `C:\Users\IADADOS\AppData\Local\Temp\opencode\dashboard-rodada03-desktop.png` e `C:\Users\IADADOS\AppData\Local\Temp\opencode\dashboard-rodada03-mobile.png`. Os títulos, filtros e conteúdo visível no recorte estão legíveis; os controles estão visíveis em ambos.

A primeira tentativa de agrupar a checagem HTTP em PowerShell falhou por erro de sintaxe do próprio comando; corrigi o comando e repeti as verificações com sucesso. Não foi uma falha do site.

## Pendências, bloqueios e encaminhamento

- Nenhuma falha nos testes executados nesta rodada. Não alterei produto nem testes.
- A auditoria formal de acessibilidade/contraste não foi executada; os testes de teclado, foco, rótulos e viewports não equivalem a essa auditoria. Não fiz inspeção visual da página inteira além dos recortes capturados.
- Conforme `projeto-dashboard/relatorios/rodada-02/coordenacao.md`, continua sem aprovação do Construtor para a versão corrigida e sem revisão independente final. Essas pendências bloqueiam a aprovação conjunta, não os resultados desta execução do Tester.

## Status

**APROVADO — execução de testes do Tester para a versão identificada pelos hashes acima.** Aprovação conjunta do projeto: **BLOQUEADA** até aprovação do Construtor e revisão independente. Auditoria formal de acessibilidade/contraste: **PENDENTE**.
