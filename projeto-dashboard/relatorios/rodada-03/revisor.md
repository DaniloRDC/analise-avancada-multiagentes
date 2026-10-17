# Revisão independente — rodada 03

## Status: **REPROVADO**

Os cálculos conferidos estão corretos e os testes existentes passaram nesta execução. Ainda assim, reprovo esta entrega para aprovação final por dois problemas de usabilidade/reprodutibilidade e uma lacuna de cobertura em requisito obrigatório. O status conjunto do projeto também continua **BLOQUEADO**: o Construtor não aprovou a versão posterior à alteração de CSS, como registrado em `relatorios/rodada-02/coordenacao.md`.

## Versão examinada

Sem commit; SHA-256 dos arquivos relevantes (hexadecimal maiúsculo):

| Arquivo | SHA-256 |
| --- | --- |
| `../agents.md` | `E1D8B7C4BC6463F53BF2383C12803BE5C90CB5F50F7106E908A02B8EA9400B7E` |
| `analise.md` | `60C96502DA9407C919692D53530D613EE6C4D047C219B57533E5A72899343976` |
| `README.md` | `506B16CAF096AE5D65E045DAA0BE9513802992D71CBF742DE698A669C8DF9BF0` |
| `preparar_dados.py` | `5FE29C652846A1CCAB3815462E1033FA0131C7343730907D22F15A9C61A1D477` |
| `site/index.html` | `CA7B8A3EED007F3E086E6EDAA349794B00F5F471923F6E48E9E8D6A72D2DB1DB` |
| `site/styles.css` | `7D4DD22B37811A392F795921533B857BEC7C34F4B47C9E8CD076D3DC67ECD513` |
| `site/app.js` | `EFCE17C094EB376BF8AFDE30CDCE394C246EDED8590A3E1D993B3E6151706CC3` |
| `site/dados/vendas.json` | `E750E357F2CD2ED741A3BB81E82DFA4D0205ACC41B023BBB3006201BE133CA2A` |
| `tests/test_preparar_dados.py` | `FDCDDFE61B3B9F0C29088ADBCDA95B5A327ECB22D78432FE51B21063A137F12D` |
| `tests/test_browser.cjs` | `A9F076B29A8A89EE9C16542127A9E07431224CFF6E208791986360126837A47D` |
| `relatorios/rodada-01/tester.md` | `87567EAEFB664164725AB801890D95178BAC80A8CC450E7E84558F1A5A80B4F5` |
| `relatorios/rodada-02/coordenacao.md` | `1864A47313E91D43E73D552BFDF3B1544788A35FB8BA18474D1F39436CC56740` |
| `../papelaria_limpa.csv` | `E25B6C2CDF05A6492F6495A91F9384565629F26E1318039F75734DCD9856995D` |
| `../vendas_papelaria.csv` | `BF95B7609E30EB7E3E6A30CFC16E43D9FB5BDFC48A410E49148CCEB92E2494FF` |

## Conferências e recálculo independente

Revisei as regras em `agents.md`, a metodologia em `analise.md`, o README, preparação, HTML/CSS/JavaScript, JSON, os dois testes, o relatório do Tester da rodada 01 e a coordenação da rodada 02. O fluxo conta cada linha/ID como transação, mantém `quantidade` como unidades, calcula `quantidade × preco_unitario` e não chama valor bruto de lucro; as limitações de moeda e de inferência estão explicitadas.

Recalculei diretamente `papelaria_limpa.csv` com a biblioteca padrão (`csv` e `Decimal`), sem usar a agregação do preparador. Resultado:

| Recorte | Transações | Valor vendido |
| --- | ---: | ---: |
| Total | 180 | R$ 20.059,00 |
| Acessórios | 65 | R$ 10.517,00 |
| Livros | 54 | R$ 7.438,00 |
| Papelaria | 61 | R$ 2.104,00 |
| Campinas | 70 | R$ 8.578,00 |
| Santos | 60 | R$ 6.937,50 |
| Sorocaba | 50 | R$ 4.543,50 |

Também conferi 548 unidades e ticket médio exato de R$ 111,438888… (R$ 111,44 arredondado). O cruzamento `Acessórios` + `Campinas` tem 25 transações, R$ 4.518,00 e média R$ 180,72. Os resultados publicados e os agregados dos gráficos conferem com os dados. A unidade amostral, deduplicação prévia e ausência de deduplicação nesta etapa são coerentes com `resumo.md` e com a fonte limpa.

## Testes executados e qualidade da cobertura

Comandos executados em `projeto-dashboard`:

- `..\.venv\Scripts\python.exe -m unittest discover -s tests -v` — **PASSOU**, 5 testes.
- `node tests/test_browser.cjs` — **PASSOU** em Chrome/CDP e HTTP, nesta revisão: KPIs iniciais, gráficos/tabela, filtros isolados e combinados, estado vazio, limpar, teclado, viewports 1365×900 e 375×812; sem exceções/erros de console. Saída integral foi observada no terminal desta execução.

Os testes de preparação protegem os CSVs byte a byte, verificam duplicatas/regras e recalculei independentemente total e agrupamentos. O teste browser compara tabela e agregados filtrados, e verifica filtro vazio/reset e ausência de overflow horizontal da página. Cobertura é boa para os fluxos principais, mas não suficiente nos pontos abaixo.

## Achados — encaminhar antes de aprovar

1. **Gráficos em celular: rótulos pequenos demais.** `renderChart` cria SVG com `viewBox` fixo de 560 px (`site/app.js:62–70`) e o CSS reduz o SVG a 100% do cartão (`site/styles.css:58–59`). No viewport de 375 px testado, o gráfico ocupa aproximadamente 311 px: texto SVG nominal de 12 px fica em torno de 6,7 px (rótulos de valor, 11 px, ficam em torno de 6,1 px). A captura mobile registrada em `%LOCALAPPDATA%\Temp\opencode\dashboard-mobile.png` confirma a escala. Isso não atende ao requisito de rótulos legíveis em tela pequena; o teste atual só mede overflow e presença/layout compacto, não legibilidade. **Construtor:** tornar os gráficos legíveis/responsivos ou oferecer alternativa equivalente legível. **Tester:** acrescentar verificação de tamanho mínimo legível no viewport móvel, não apenas ausência de overflow.

2. **Instruções do teste de navegador não são executáveis como documentadas.** `README.md:27–39` manda manter “o servidor HTTP acima” ativo, mas não há comando de servidor antes desse trecho; o comando de Chrome aponta para `http://127.0.0.1:8765/`. O único comando de servidor documentado vem depois, na linha 46, e usa porta 8000. Seguindo o README literalmente, o Chrome e o teste CDP não encontram o site na porta 8765. **Construtor/coordenador:** documentar o comando de servidor com a porta correta antes dos passos Chrome/CDP, ou alinhar todas as instruções a uma única porta.

3. **Cobertura do ticket médio após filtros incompleta.** O navegador verifica o ticket inicial, mas, nos casos de filtro por categoria, cidade e combinação, não compara `#kpi-average` com o valor esperado; para estado vazio só verifica `NaN`/`Infinity`. O código atual calcula a média corretamente (`site/app.js:138–142`), mas uma regressão nessa KPI passaria. Isso deixa incompleta a exigência de correspondência entre dados preparados e todos os indicadores filtrados (`agents.md:60–61`). **Tester:** afirmar a média esperada em cada recorte e zero no vazio, preferencialmente recalculada a partir das linhas esperadas.

## Responsabilidades e pendências

- O relatório do Tester da rodada 01 registra aprovação e hashes compatíveis com os arquivos atuais; nesta revisão também executei os testes Python e browser com sucesso. A pendência acima é cobertura adicional, não uma falha de execução da suíte existente.
- O Construtor aprovou apenas a versão da rodada 01; a coordenação registra que o CSS foi alterado depois e que não foi possível obter a aprovação do Construtor sobre a versão final. Essa aprovação ainda é necessária conforme `agents.md:37–40`.
- Construtor/coordenador devem tratar os achados 1–2; o Tester deve complementar e reexecutar os testes afetados (achados 1 e 3); depois, obter a aprovação do Construtor para os arquivos finais e solicitar nova revisão. Não alterei produto nem testes nesta etapa.
- A coordenação também registra que `.agents/skills/`, caminho requerido por `agents.md`, está ausente e que as skills foram carregadas de `.opencode/skills`; essa divergência de localização permanece como ressalva processual.

**Conclusão:** os cálculos e o funcionamento observado estão corretos, mas os achados impedem aprovação da entrega. A aprovação conjunta permanece **BLOQUEADA** até as correções, retestes e aprovação do Construtor da mesma versão.
