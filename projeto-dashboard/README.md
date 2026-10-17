# Dashboard de vendas da papelaria

Projeto estático em português, preparado a partir de `../papelaria_limpa.csv`. Cada linha representa uma venda/transação; `quantidade` representa unidades de produtos. O ticket médio é o valor total vendido dividido pelo número de linhas/transações.

## Preparar ou atualizar os dados

No PowerShell, abra o terminal na pasta `projeto-dashboard`:

```powershell
..\.venv\Scripts\python.exe preparar_dados.py
```

O script usa pandas e grava `site/dados/vendas.json` e `analise.md`. Se não houver ambiente virtual, com Python e pandas instalados:

```powershell
python preparar_dados.py
```

As regras da preparação e as limitações estão em `analise.md`; a limpeza anterior da fonte está em `../resumo.md`. A fonte não é alterada pelo script.

## Executar os testes de dados

```powershell
..\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

## Testar no Chrome

O teste de integração usa Chrome e Node.js, sem instalar pacotes. Abra um terminal PowerShell na pasta `projeto-dashboard` e inicie o servidor exclusivo do teste. Deixe-o em execução:

```powershell
..\.venv\Scripts\python.exe -m http.server 8765 --bind 127.0.0.1 --directory site
```

Em um segundo terminal PowerShell, também na pasta `projeto-dashboard`, inicie o Chrome headless com depuração remota:

```powershell
$chrome = Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'
$perfil = Join-Path $env:TEMP 'papelaria-chrome-test'
Start-Process $chrome -ArgumentList @('--headless=new', '--disable-gpu', '--remote-debugging-port=9222', "--user-data-dir=$perfil", 'http://127.0.0.1:8765/')
```

Em um terceiro terminal PowerShell, na mesma pasta, execute o teste:

```powershell
node tests/test_browser.cjs
```

O Chrome do teste carrega `http://127.0.0.1:8765/`; esse servidor e essa porta são necessários para o teste acima.

## Abrir uma prévia local

Para apenas visualizar o site manualmente, abra outro terminal PowerShell na pasta `projeto-dashboard` e inicie o servidor de prévia na porta 8000:

```powershell
..\.venv\Scripts\python.exe -m http.server 8000 --directory site
```

Abra <http://localhost:8000> no navegador. A prévia 8000 é independente do servidor de teste 8765 e não substitui esse servidor ao executar o teste Chrome. `site/` é a pasta publicável em hospedagem estática; a publicação não está incluída nesta etapa. Não abra `index.html` diretamente como arquivo, pois o navegador pode bloquear a leitura do JSON.

O painel contém indicadores, dois gráficos de barras, tabela e filtros de categoria e cidade. Os dois filtros atualizam todos esses elementos e podem ser usados por teclado; o botão **Limpar filtros** restaura a visão completa.
