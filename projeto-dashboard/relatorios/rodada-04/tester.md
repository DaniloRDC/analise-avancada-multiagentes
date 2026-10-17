# Relatório do Tester — rodada 04

## Escopo e identificação

Editei somente `tests/test_browser.cjs` e este relatório; não alterei arquivos de produto. O teste de navegador examinou a versão de produto em andamento identificada por:

| Arquivo | SHA-256 |
| --- | --- |
| `site/app.js` | `DBB4EF4B419E25923459C9FA5DFD72AE40DCEA2DE6C1188E2723E8E8BD7478D8` |
| `site/styles.css` | `434C65256B3E159CFA28CF787EEED807AA7825BBC5EE35D6F6851257B5FA8015` |
| `tests/test_browser.cjs` | `1534DE3F7595B857BC382DF40A9ED65DFED08D21C501F4551D19D28F5B497155` |

## Alterações de cobertura

- Em cada recorte — inicial, categoria isolada, cidade isolada, categoria + cidade e seleção vazia — compara `#kpi-average` com a média recalculada diretamente das vendas correspondentes em `site/dados/vendas.json`. No vazio, exige explicitamente `R$ 0,00`.
- Em viewport de 375 × 812, verifica cada texto SVG de ambos os gráficos. A altura e largura renderizadas são calculadas a partir de `getBBox()` multiplicado pela escala efetiva do `getScreenCTM()`, em CSS px; portanto não dependem apenas do `font-size` nominal nem de uma verificação de overflow.
- O piso é **10 CSS px de altura renderizada**. É um alvo prático pelo menos 50% acima dos ~6,7 px observados no achado 3 da revisão 03; não é apresentado como mínimo normativo WCAG.

## Comandos e resultados

- `node --check tests/test_browser.cjs` — **PASSOU**.
- `node tests/test_browser.cjs` — **PASSOU** no Chrome/CDP e servidor HTTP já ativos. Médias recalculadas e exibidas: inicial **R$ 111,44**; categoria **R$ 161,80**; cidade **R$ 122,54**; combinação **R$ 180,72**; vazio **R$ 0,00**. Em 375 px, todas as alturas medidas dos textos SVG foram **16 CSS px** (mínimo observado: 16 px, acima do limiar de 10 px). Sem erros de navegador/console; verificações existentes de filtros, tabela, teclado e overflow da página também passaram.
- `python -m unittest discover -s tests -v` — **não executado**: a suíte de preparação regrava arquivos de produto/saídas geradas; evitada nesta rodada para respeitar o escopo de não editar produto.

## Falhas e pendências

- **Falha causada pela implementação em andamento nesta execução: nenhuma observada.** O código do Construtor alterou a geometria do SVG para preservar o tamanho renderizado dos rótulos, e passou o novo limiar nesta versão. Isso não constitui aprovação da versão final.
- Depois que o Construtor declarar o produto pronto, reiniciar/confirmar o servidor e repetir `node --check tests/test_browser.cjs` e `node tests/test_browser.cjs` contra os arquivos finais. Confirmar novamente ticket médio nos cinco cenários, medição de todos os rótulos a 375 × 812, ausência de erros e que o hash do teste continua sendo o informado acima.
- Reexecutar a suíte Python em cópia isolada do projeto (ou outro modo que não regrave arquivos de produto) e registrar seu resultado na rodada final.
