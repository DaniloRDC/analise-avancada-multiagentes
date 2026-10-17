# Relatório final — dashboard da papelaria

## Status conjunto: **APROVADO**

O site estático foi construído em `projeto-dashboard/site/` a partir de `papelaria_limpa.csv`. O total vendido é **R$ 20.059,00**, há **180 transações** e o ticket médio é **R$ 111,44**. Valor vendido não é lucro; o CSV não identifica a moeda, então R$ é a convenção de apresentação adotada.

### Entregas

- `preparar_dados.py` e `analise.md`: preparação reproduzível com pandas, definição da linha, regras, cálculos e limitações.
- `site/`: dashboard responsivo com 3 indicadores, gráficos por categoria/cidade, tabela e filtros conjuntos de categoria e cidade.
- `tests/`: testes de dados com `unittest` e integração browser com Chrome/CDP sem dependências Node adicionais.
- `README.md`: instruções para preparar dados, testar e servir `site/` por HTTP; `site/` é a pasta publicável.

### Verificações da versão final

- Versão sem commit, identificada pelos hashes SHA-256 dos arquivos-chave nos relatórios `rodada-05/construtor.md`, `rodada-05/tester.md` e `rodada-05/revisor.md` (os três relatórios conferem a mesma versão).
- Python: `python -m unittest discover -s tests -v` em cópia isolada — **5 testes passaram**, incluindo preservação dos CSVs, regras/duplicatas, tipos, agregações e exemplo conhecido. A cópia evitou regravar saídas na entrega original.
- JavaScript: `node --check site/app.js` e `node --check tests/test_browser.cjs` — **passaram**.
- Navegador: `node tests/test_browser.cjs` em Chrome headless via CDP — **passou** para indicadores, gráficos, tabela, filtros, combinação, seleção vazia, limpar e teclado. Ticket médio conferido nos cinco cenários: R$ 111,44; R$ 161,80; R$ 122,54; R$ 180,72; R$ 0,00.
- Responsividade: em viewport 375×812, os 17 textos SVG dos gráficos mediram 16 CSS px; não houve rolagem horizontal da página. O teste desktop 1365×900 também passou.
- HTTP: `/`, CSS, JS e JSON responderam **200** na porta de teste `8765`.

### Aprovações e pendências

- Construtor: **APROVADO** — `relatorios/rodada-05/construtor.md`.
- Tester: **APROVADO** — `relatorios/rodada-05/tester.md`.
- Revisor independente: **APROVADO** — `relatorios/rodada-05/revisor.md`.
- Limitação não bloqueante: auditoria formal de acessibilidade/contraste e teste em dispositivo físico não foram realizados; os testes de teclado, foco, rótulos e viewport não equivalem a essa auditoria nem afirmam conformidade WCAG.
- As skills foram carregadas pela localização `.opencode/skills`; o caminho `.agents/skills/` citado em `agents.md` não existe nesta cópia do workspace.

### Como abrir

No PowerShell, entre em `projeto-dashboard` e execute:

```powershell
..\.venv\Scripts\python.exe preparar_dados.py
..\.venv\Scripts\python.exe -m unittest discover -s tests -v
..\.venv\Scripts\python.exe -m http.server 8000 --directory site
```

Abra <http://localhost:8000>. Para o teste browser em Chrome/CDP, siga a sequência detalhada no `README.md`, que usa o servidor dedicado na porta 8765. `site/` é a pasta publicável; a publicação não foi realizada.
