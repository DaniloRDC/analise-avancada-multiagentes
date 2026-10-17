# Relatório do construtor — rodada 03

## Versão examinada

Sem Git neste workspace. Os hashes SHA-256 abaixo identificam a versão examinada; foram conferidos novamente após as validações.

| Arquivo | SHA-256 |
| --- | --- |
| `preparar_dados.py` | `5FE29C652846A1CCAB3815462E1033FA0131C7343730907D22F15A9C61A1D477` |
| `analise.md` | `60C96502DA9407C919692D53530D613EE6C4D047C219B57533E5A72899343976` |
| `README.md` | `506B16CAF096AE5D65E045DAA0BE9513802992D71CBF742DE698A669C8DF9BF0` |
| `site/index.html` | `CA7B8A3EED007F3E086E6EDAA349794B00F5F471923F6E48E9E8D6A72D2DB1DB` |
| `site/styles.css` | `7D4DD22B37811A392F795921533B857BEC7C34F4B47C9E8CD076D3DC67ECD513` |
| `site/app.js` | `EFCE17C094EB376BF8AFDE30CDCE394C246EDED8590A3E1D993B3E6151706CC3` |
| `site/dados/vendas.json` | `E750E357F2CD2ED741A3BB81E82DFA4D0205ACC41B023BBB3006201BE133CA2A` |

## Conferências e resultados

- Revisei `agents.md`, os relatórios do Construtor e da coordenação das rodadas anteriores, além do README, análise, JSON, CSS e testes existentes.
- Confirmei no CSS a correção responsiva reportada: `.layout > *` e `.filter-controls` usam `min-width: 0`; os filtros passam a uma coluna até 480 px. O teste atual no navegador mediu `innerWidth/page.scrollWidth` de 375/360 px no celular e 1365/1350 px no desktop, sem overflow horizontal da página. A tabela larga está dentro da região com rolagem própria.
- `..\.venv\Scripts\python.exe -m unittest discover -s <cópia temporária>\projeto-dashboard\tests -v` — **5 testes passaram**. Rodei em cópia isolada porque a suíte chama `preparar_dados.py`, que regrava `analise.md` e o JSON. A cópia foi feita a partir dos arquivos identificados pelos hashes acima; as fontes CSV não foram alteradas. O teste confirmou esquema, duplicatas/regras, preservação das fontes, totais e exemplo conhecido.
- `node --check site/app.js` e `node --check tests/test_browser.cjs` — **passaram**.
- `node tests/test_browser.cjs` — **PASSOU na versão atual servida por HTTP e aberta no Chrome headless/CDP**. Verificou KPIs, todos os valores da tabela, agregados dos dois gráficos, filtros isolados e combinados, estado vazio sem `NaN`/infinito, limpar filtros, seleção por teclado, rótulos/foco, viewports desktop e celular e ausência de erros JavaScript.
- Servidor HTTP na versão atual: `/`, `/styles.css`, `/app.js` e `/dados/vendas.json` responderam **200**; JSON válido com 180 vendas.
- Os hashes dos sete arquivos de produto/documentação listados acima permaneceram iguais antes e depois dos testes. Não editei arquivos do produto; a suíte Python que gera saídas foi executada somente na cópia temporária `C:\Users\IADADOS\AppData\Local\Temp\opencode\projeto-dashboard-rodada03`.

## Problema e encaminhamento

- **README incompleto/inconsistente para reproduzir o teste browser.** Em `README.md`, linhas 27–38, a instrução manda manter “o servidor HTTP acima” em execução, mas não documenta ali o comando para iniciá-lo. O Chrome abre `http://127.0.0.1:8765/` e `tests/test_browser.cjs` exige exatamente essa URL. O único comando de servidor HTTP documentado no README (linhas 43–47) usa a porta `8000`, portanto não satisfaz o teste browser como escrito. A validação desta rodada passou porque iniciei explicitamente o servidor em `8765`.
- Encaminhamento: corrigir o README na próxima etapa autorizada de edição, acrescentando o comando para iniciar `python -m http.server 8765 --directory site` em um terminal separado antes de iniciar o Chrome; manter clara a distinção do servidor de visualização local na porta 8000. Depois, repetir as instruções documentadas para confirmar reprodução. Não fiz essa alteração nesta rodada por instrução expressa de não editar o produto.

## Aprovação e status

**REPROVADO — não aprovo exatamente a versão atual como entrega reproduzível**, devido à discrepância documentada acima. A validação funcional do dashboard e os testes executados passaram; a reprovação é restrita à instrução de execução do teste browser no README. Não foram encontrados outros problemas nesta conferência. Esta conclusão é a avaliação do Construtor, não substitui revisão independente nem aprovação conjunta. Após corrigir o README e verificar os comandos documentados, solicitar nova conferência da versão corrigida.
