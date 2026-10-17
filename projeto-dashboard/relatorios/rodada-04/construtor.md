# Relatório do construtor — rodada 04

## Versão examinada

Sem Git neste workspace. Foram alterados `site/app.js`, `site/styles.css` e `README.md`; não editei nenhum arquivo em `tests/`. Hashes SHA-256 dos três arquivos de produto/documentação após as verificações (hexadecimal maiúsculo):

| Arquivo | SHA-256 |
| --- | --- |
| `README.md` | `253D6EBF62DAC836CE6C8DC4AAFD8203666EE004F9D44C8B8074432F0ECD124A` |
| `site/app.js` | `DBB4EF4B419E25923459C9FA5DFD72AE40DCEA2DE6C1188E2723E8E8BD7478D8` |
| `site/styles.css` | `434C65256B3E159CFA28CF787EEED807AA7825BBC5EE35D6F6851257B5FA8015` |

**Chave da versão:** `6382E0929011F783235AF06D402AF5F6B965AED80382153484BF16F9356BEF1C`. É o SHA-256 UTF-8 da lista ordenada `caminho:hash` dos três arquivos acima, separada por LF e terminada por LF. O relatório não entra na chave.

## Correções

- Os SVG usam `viewBox` na largura efetivamente renderizada e altura fixa de 220 CSS px, em vez de reduzir um desenho de 560 px. Os textos dos dois gráficos são 12 px; as margens reservam espaço para rótulos de categoria e valores e, em gráficos estreitos, os ticks do eixo são reduzidos para dois. O redesenho em `resize` recalcula as dimensões. O SVG limita eventual desenho à própria área, sem ampliar a página.
- O README agora dá primeiro o comando para servir `site/` em `127.0.0.1:8765`, depois os comandos de Chrome e teste. A prévia manual na porta 8000 está em seção separada e identificada como independente.

## Verificações executadas

Comandos executados em `projeto-dashboard`:

- `node --check site\app.js` — **PASSOU**.
- `node --check tests\test_browser.cjs` — **PASSOU** (verificação apenas; não alterei o teste).
- `node tests\test_browser.cjs` — **PASSOU** em Chrome headless/CDP (`127.0.0.1:9222`) carregando o site HTTP em `127.0.0.1:8765`. Incluiu as verificações de indicadores, filtros, dados, viewports e ausência de overflow; os textos SVG medidos no viewport móvel satisfizeram o mínimo do teste.
- HTTP: `Invoke-WebRequest` para `/`, `/styles.css`, `/app.js` e `/dados/vendas.json` em `http://127.0.0.1:8765` — **200** em todos; `Invoke-RestMethod` confirmou 180 vendas no JSON.
- Inspeção adicional por CDP a 375×812: `innerWidth=375`, `documentElement.scrollWidth=360`; cada gráfico mediu 296×220 px. Todos os rótulos e valores mediram `font-size: 12px` e seus limites horizontais ficaram dentro do SVG. Não houve overflow horizontal da página.
- `Get-FileHash README.md, site\app.js, site\styles.css -Algorithm SHA256` — hashes acima; recalculei a chave a partir deles.

O servidor HTTP e o Chrome já estavam ativos nas portas requeridas quando iniciei a validação; não encerrei processos existentes. Confirmei suas linhas de comando, carregamento HTTP e execução browser na URL documentada. Não fiz uma inicialização limpa desses processos a partir das instruções do README nesta execução.

## Limites e status

Não executei a suíte Python: esta rodada só alterou renderização/documentação e não preparação ou dados. Também não fiz auditoria formal de acessibilidade nem medi legibilidade em dispositivos físicos; a verificação de interface foi em Chrome headless com viewport emulado. Nenhum arquivo de `tests/` foi editado por mim.

**APROVADO para as correções solicitadas nesta rodada** — os dois gráficos estão legíveis no viewport móvel testado sem overflow da página e o fluxo de teste browser está documentado na ordem e porta corretas. Esta aprovação do Construtor não substitui a execução/revisão final das demais responsabilidades nem declara aprovação conjunta do projeto.
