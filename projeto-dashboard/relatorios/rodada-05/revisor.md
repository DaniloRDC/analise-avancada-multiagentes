# Revisão independente final — rodada 05

## Status: **APROVADO**

As correções da rodada 04 e as verificações independentes desta revisão sustentam a aprovação funcional e dos resultados desta versão. A auditoria formal de acessibilidade/contraste continua **PENDENTE** e não foi realizada; os testes de teclado, foco e dimensão dos textos não equivalem a essa auditoria. Esta é a aprovação do Revisor, não uma declaração de auditoria normativa.

## Versão examinada

Sem commit: a pasta de trabalho não é um repositório Git. SHA-256 atual (hexadecimal maiúsculo):

| Arquivo | SHA-256 |
| --- | --- |
| `agents.md` | `E1D8B7C4BC6463F53BF2383C12803BE5C90CB5F50F7106E908A02B8EA9400B7E` |
| `projeto-dashboard/analise.md` | `60C96502DA9407C919692D53530D613EE6C4D047C219B57533E5A72899343976` |
| `projeto-dashboard/README.md` | `253D6EBF62DAC836CE6C8DC4AAFD8203666EE004F9D44C8B8074432F0ECD124A` |
| `projeto-dashboard/preparar_dados.py` | `5FE29C652846A1CCAB3815462E1033FA0131C7343730907D22F15A9C61A1D477` |
| `projeto-dashboard/site/index.html` | `CA7B8A3EED007F3E086E6EDAA349794B00F5F471923F6E48E9E8D6A72D2DB1DB` |
| `projeto-dashboard/site/styles.css` | `434C65256B3E159CFA28CF787EEED807AA7825BBC5EE35D6F6851257B5FA8015` |
| `projeto-dashboard/site/app.js` | `DBB4EF4B419E25923459C9FA5DFD72AE40DCEA2DE6C1188E2723E8E8BD7478D8` |
| `projeto-dashboard/site/dados/vendas.json` | `E750E357F2CD2ED741A3BB81E82DFA4D0205ACC41B023BBB3006201BE133CA2A` |
| `projeto-dashboard/tests/test_preparar_dados.py` | `FDCDDFE61B3B9F0C29088ADBCDA95B5A327ECB22D78432FE51B21063A137F12D` |
| `projeto-dashboard/tests/test_browser.cjs` | `1534DE3F7595B857BC382DF40A9ED65DFED08D21C501F4551D19D28F5B497155` |
| `papelaria_limpa.csv` | `E25B6C2CDF05A6492F6495A91F9384565629F26E1318039F75734DCD9856995D` |
| `vendas_papelaria.csv` | `BF95B7609E30EB7E3E6A30CFC16E43D9FB5BDFC48A410E49148CCEB92E2494FF` |

Os hashes do produto/documentação e o hash de `test_browser.cjs` conferem com as versões declaradas nos relatórios de construtor e tester da rodada 04. Não editei produto, dados ou testes.

## Escopo e recálculo independente

Li `agents.md`, análise, README, preparador, HTML/CSS/JavaScript, JSON preparado, testes Python/browser e relatórios de construtor/tester da rodada 03 e da rodada 04. Recalculei a partir de `papelaria_limpa.csv` usando a biblioteca padrão `csv` e valores `Decimal`, sem usar a lógica de agregação do preparador:

| Recorte | Transações | Valor vendido |
| --- | ---: | ---: |
| Total | 180 | R$ 20.059,00 |
| Acessórios | 65 | R$ 10.517,00 |
| Livros | 54 | R$ 7.438,00 |
| Papelaria | 61 | R$ 2.104,00 |
| Campinas | 70 | R$ 8.578,00 |
| Santos | 60 | R$ 6.937,50 |
| Sorocaba | 50 | R$ 4.543,50 |

O ticket médio é R$ 111,438888… por transação (R$ 111,44 formatado); a quantidade total separada é 548 unidades. O cruzamento Acessórios + Campinas tem 25 transações, R$ 4.518,00 e média de R$ 180,72. Totais, definições de transação/unidade e agrupamentos coincidem com a análise e os dados do painel.

## Verificações e evidências

- Suíte Python executada em cópia isolada temporária do projeto, para evitar que `preparar_dados.py` regrave os arquivos da entrega: `& .venv\Scripts\python.exe -m unittest discover -s C:\Users\IADADOS\AppData\Local\Temp\opencode\dashboard-final-python-b923e62fbabe4dcaa5ef4d5bb900225f\projeto-dashboard\tests -v` — **5 testes passaram**. Cópia e saída: `%LOCALAPPDATA%\Temp\opencode\dashboard-final-python-b923e62fbabe4dcaa5ef4d5bb900225f\projeto-dashboard`. A suíte verifica preservação das fontes, duplicatas/regras, esquema, IDs, valores, agregação conhecida e arquivos gerados.
- `node --check site\app.js` e `node --check tests\test_browser.cjs` — **PASSARAM**.
- `node tests\test_browser.cjs` — **PASSOU** em Chrome headless/CDP (`127.0.0.1:9222`) carregando o servidor HTTP de teste (`127.0.0.1:8765`). A saída integral foi observada no terminal desta revisão. Conferiu indicadores, gráficos e tabela; filtros isolados, combinados, vazios e reset; seleção/foco por teclado; nenhum erro de console/exceção.
- O ticket médio foi comparado com recálculo sobre as linhas correspondentes em todos os cinco estados: inicial **R$ 111,44**; categoria Acessórios **R$ 161,80**; cidade Campinas **R$ 122,54**; Acessórios + Campinas **R$ 180,72**; seleção vazia **R$ 0,00**. No vazio, não há `NaN`/infinito.
- A 375×812, o teste browser mediu todos os textos SVG dos dois gráficos: cada altura renderizada foi **16 CSS px**, acima do limiar de teste de 10 px, e cada texto teve largura renderizada positiva. A página mediu largura de viewport/rolagem **375/360 px**; no desktop 1365/1350 px. Assim, o teste agora mede tamanho renderizado (não apenas ausência de overflow). O limiar é prático, não uma alegação WCAG.
- README: o servidor de teste está documentado antes dos passos de Chrome/Node, na porta **8765** e vinculado a `127.0.0.1`; Chrome/CDP usa **9222** e a mesma URL. A prévia manual usa a porta **8000**, em seção independente. Nesta revisão, os processos 8765 e 9222 já estavam ativos; confirmei os listeners e executei o teste contra eles, sem iniciar processos duplicados. `Invoke-WebRequest` retornou **200** para `/`, `/styles.css`, `/app.js` e `/dados/vendas.json`; o JSON servido contém 180 vendas. Os comandos PowerShell documentados são compatíveis com os caminhos locais conferidos (`.venv`, Python, Node e Chrome). Uma inicialização limpa de ambos os processos seguindo cada comando do README não foi repetida nesta execução.

## Pendências e conclusão

- **PENDENTE conhecida:** auditoria formal de acessibilidade e contraste. Esta revisão não a executou nem conclui conformidade normativa.
- Não identifiquei defeitos remanescentes nos cálculos, nos fluxos cobertos, na legibilidade dos rótulos gráficos conforme a métrica implementada pelo teste, nem erro de porta/ordem nas instruções do README. A validação do navegador ocorreu com os serviços já ativos, conforme registrado; os recursos e a URL exigida responderam corretamente.
- A primeira tentativa de um comando inline de recálculo independente teve erro de sintaxe/citação do próprio comando; corrigi a execução e obtive os resultados tabulados acima. A falha não envolveu produto ou teste.

**Conclusão do Revisor: APROVADO** para a versão identificada pelos hashes desta seção. A pendência formal de acessibilidade permanece explicitamente registrada; não foi considerada realizada nem é coberta por esta aprovação funcional.
