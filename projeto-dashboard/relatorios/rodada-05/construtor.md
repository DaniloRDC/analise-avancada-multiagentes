# Relatório do Construtor — rodada 05

## Versão examinada

Sem Git neste workspace. Conferi novamente os SHA-256 atuais (hexadecimal maiúsculo):

| Categoria | Arquivo | SHA-256 |
| --- | --- | --- |
| Produto | `preparar_dados.py` | `5FE29C652846A1CCAB3815462E1033FA0131C7343730907D22F15A9C61A1D477` |
| Documentação | `analise.md` | `60C96502DA9407C919692D53530D613EE6C4D047C219B57533E5A72899343976` |
| Documentação | `README.md` | `253D6EBF62DAC836CE6C8DC4AAFD8203666EE004F9D44C8B8074432F0ECD124A` |
| Produto | `site/index.html` | `CA7B8A3EED007F3E086E6EDAA349794B00F5F471923F6E48E9E8D6A72D2DB1DB` |
| Produto | `site/styles.css` | `434C65256B3E159CFA28CF787EEED807AA7825BBC5EE35D6F6851257B5FA8015` |
| Produto | `site/app.js` | `DBB4EF4B419E25923459C9FA5DFD72AE40DCEA2DE6C1188E2723E8E8BD7478D8` |
| Dados do produto | `site/dados/vendas.json` | `E750E357F2CD2ED741A3BB81E82DFA4D0205ACC41B023BBB3006201BE133CA2A` |
| Teste | `tests/test_preparar_dados.py` | `FDCDDFE61B3B9F0C29088ADBCDA95B5A327ECB22D78432FE51B21063A137F12D` |
| Teste | `tests/test_browser.cjs` | `1534DE3F7595B857BC382DF40A9ED65DFED08D21C501F4551D19D28F5B497155` |
| Fonte de dados | `../vendas_papelaria.csv` | `BF95B7609E30EB7E3E6A30CFC16E43D9FB5BDFC48A410E49148CCEB92E2494FF` |
| Fonte de dados | `../papelaria_limpa.csv` | `E25B6C2CDF05A6492F6495A91F9384565629F26E1318039F75734DCD9856995D` |

Os hashes do produto/documentação coincidem com a versão examinada na rodada 04; o hash do teste de navegador coincide com a versão atualizada pelo Tester na rodada 04. Não editei produto nem testes nesta conferência.

## Conferência das correções e validações

- **Legibilidade dos gráficos em viewport móvel (achado da revisão 03): corrigido.** `site/app.js` dimensiona o `viewBox` de acordo com a largura renderizada, preservando os 12 CSS px dos rótulos, e redesenha no redimensionamento. O relatório do Tester da rodada 04 registra medição de todos os textos SVG em 375 × 812: mínimo de 16 CSS px, acima do piso de teste de 10 CSS px. Esse piso é prático, não uma alegação de conformidade WCAG.
- **Comando/porta do teste no README (achado da rodada 03): corrigido.** Conferi em `README.md` o servidor de teste na porta 8765 antes dos passos de Chrome e Node; a prévia manual na porta 8000 está em seção separada.
- **Ticket médio filtrado (lacuna de cobertura da revisão 03): coberto.** O `tests/test_browser.cjs` atual recalcula a média a partir do JSON nos casos inicial, categoria, cidade, combinação e vazio, exigindo `R$ 0,00` no vazio. O relatório do Tester da rodada 04 registra os cinco resultados esperados e aprovados.
- **Suíte final:** conforme execução desta sessão, `..\.venv\Scripts\python.exe -m unittest discover -s tests -v` — **PASSOU, 5 testes**. A execução final do navegador `node tests/test_browser.cjs` também **PASSOU**; o relatório da rodada 04 registra Chrome/CDP e servidor HTTP, verificações de filtros, tabela, indicadores, teclado, viewports, erros de navegador e medição dos rótulos. Os hashes do produto e do teste após essas validações foram reconferidos acima.
- Conferi os comandos do README e os trechos do código/teste relacionados aos três achados. Não repeti os testes que já foram executados nesta sessão.

## Pendências e limites

- **Auditoria formal de acessibilidade/contraste: PENDENTE.** Os testes de teclado, rótulos, foco e tamanho medido dos textos não constituem auditoria formal nem comprovam conformidade WCAG. Não houve teste em dispositivos físicos.
- **Revisão independente final da mesma versão: PENDENTE neste registro.** Esta aprovação é do Construtor e não substitui a aprovação do Revisor nem declara aprovação conjunta do projeto.

## Status

**APROVADO — Construtor, exatamente para os hashes SHA-256 listados neste relatório.** Não foram encontrados achados pendentes dentro do escopo das correções do Construtor. As pendências acima permanecem explícitas; este status não é aprovação conjunta.
