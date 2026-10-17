# Relatório do Tester — rodada 05

## Versão examinada

Sem commit: o workspace não está em um repositório Git. Os hashes SHA-256 abaixo foram conferidos após as execuções e identificam a mesma versão funcional/documental examinada na rodada 04; os CSVs correspondem aos hashes registrados nas rodadas anteriores.

| Arquivo | SHA-256 |
| --- | --- |
| `tests/test_browser.cjs` | `1534DE3F7595B857BC382DF40A9ED65DFED08D21C501F4551D19D28F5B497155` |
| `tests/test_preparar_dados.py` | `FDCDDFE61B3B9F0C29088ADBCDA95B5A327ECB22D78432FE51B21063A137F12D` |
| `site/app.js` | `DBB4EF4B419E25923459C9FA5DFD72AE40DCEA2DE6C1188E2723E8E8BD7478D8` |
| `site/styles.css` | `434C65256B3E159CFA28CF787EEED807AA7825BBC5EE35D6F6851257B5FA8015` |
| `site/index.html` | `CA7B8A3EED007F3E086E6EDAA349794B00F5F471923F6E48E9E8D6A72D2DB1DB` |
| `site/dados/vendas.json` | `E750E357F2CD2ED741A3BB81E82DFA4D0205ACC41B023BBB3006201BE133CA2A` |
| `preparar_dados.py` | `5FE29C652846A1CCAB3815462E1033FA0131C7343730907D22F15A9C61A1D477` |
| `README.md` | `253D6EBF62DAC836CE6C8DC4AAFD8203666EE004F9D44C8B8074432F0ECD124A` |
| `papelaria_limpa.csv` | `E25B6C2CDF05A6492F6495A91F9384565629F26E1318039F75734DCD9856995D` |
| `vendas_papelaria.csv` | `BF95B7609E30EB7E3E6A30CFC16E43D9FB5BDFC48A410E49148CCEB92E2494FF` |

Os hashes de `test_browser.cjs`, `app.js` e `styles.css` coincidem com a rodada 04. Os endpoints HTTP serviram `index.html`, CSS, JS e JSON com os mesmos hashes dos arquivos locais. Não alterei produto nem testes; gravei apenas este relatório.

## Comandos executados e resultados

- `node --check projeto-dashboard\site\app.js` e `node --check projeto-dashboard\tests\test_browser.cjs` — **PASSOU**. Esses são os arquivos JavaScript do projeto encontrados (incluindo o teste `.cjs`).
- Em `http://127.0.0.1:8765`, `Invoke-WebRequest` para `/`, `/styles.css`, `/app.js` e `/dados/vendas.json` — **200** em todos; os hashes dos conteúdos servidos coincidem com `index.html`, `styles.css`, `app.js` e `vendas.json` listados acima.
- Iniciei Chrome headless isolado com `--remote-debugging-port=9222`, perfil temporário `C:\Users\IADADOS\AppData\Local\Temp\opencode\chrome-rodada05-2fc7160c911041f7ae06d46d7da09a14`, apontado para `http://127.0.0.1:8765/`. O servidor HTTP já estava ativo; não o encerrei.
- `node projeto-dashboard\tests\test_browser.cjs` — **PASSOU** em Chrome/CDP sobre HTTP. O teste confirmou as médias recalculadas a partir do JSON nos cinco cenários: inicial **R$ 111,44**; categoria **R$ 161,80**; cidade **R$ 122,54**; categoria + cidade **R$ 180,72**; seleção vazia **R$ 0,00**. Também passaram as verificações existentes de indicadores, gráficos, tabela, filtros, estado vazio, limpar, teclado/foco, ausência de erros de console/exceções e viewports.
- A 375 × 812 CSS px, o teste mediu **17 textos SVG** (9 no gráfico de categoria e 8 no de cidade): todos com altura efetivamente renderizada de **16 CSS px**, acima do limiar prático de 10 px definido no teste (o limiar não é uma alegação de conformidade WCAG). `innerWidth=375` e `documentElement.scrollWidth=360`. No desktop, `innerWidth=1365` e `scrollWidth=1350`.
- A lista diagnóstica de elementos que ultrapassam o limite horizontal inclui células da tabela larga; a página não ganha rolagem horizontal, e a tabela permanece em sua região de rolagem própria.
- Suíte Python executada em cópia nova e isolada para que `preparar_dados.py` não regrave a entrega original. Cópia: `C:\Users\IADADOS\AppData\Local\Temp\opencode\projeto-dashboard-rodada05-460e4e1ed6f74a02ab5fd2ed1059e164\` (contém `projeto-dashboard/` e ambos os CSVs). Comando, a partir da cópia: `C:\Users\IADADOS\Documents\AGENTES-HABILIDADES\.venv\Scripts\python.exe -m unittest discover -s tests -v` — **PASSOU**, 5 testes. A preparação na cópia informou 180 transações, total 20059.0 e ticket médio 111.44; o teste também verificou preservação dos CSVs e o exemplo conhecido.

A primeira tentativa de iniciar a suíte Python usou por engano um caminho `.venv` dentro da cópia, que não existe; não executou testes nem tocou na entrega. Repeti usando o Python do workspace e a cópia isolada, com os cinco testes passando.

## Limitações e status

- A suíte não foi executada sobre a pasta original: foi deliberadamente executada apenas na cópia isolada, pois o teste chama o preparador que regrava saídas geradas.
- A medição foi em Chrome headless com viewport emulado; não fiz teste em dispositivo físico nem auditoria formal de acessibilidade/contraste. O limiar de 10 px é somente o critério prático automatizado do teste.
- Não fiz inspeção visual integral/screenshot nesta rodada.

**APROVADO — reteste do Tester para a versão identificada pelos hashes acima.** Este status cobre os testes executados nesta responsabilidade e não representa, por si só, aprovação conjunta ou auditoria formal de acessibilidade.
