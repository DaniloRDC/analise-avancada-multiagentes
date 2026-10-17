// Smoke/integration tests using Chrome's built-in DevTools Protocol (no packages).
// Start a static server and Chrome with --remote-debugging-port=9222 first.
const assert = require("node:assert/strict");
const SITE_URL = process.env.TEST_SITE_URL || "http://127.0.0.1:8765/";
const CDP_ENDPOINT = process.env.CDP_ENDPOINT || "http://127.0.0.1:9222";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const tabs = await fetch(`${CDP_ENDPOINT}/json/list`).then((response) => response.json());
  const page = tabs.find((tab) => tab.type === "page" && tab.url === SITE_URL);
  assert.ok(page, "Chrome deve estar aberto no site servido por HTTP");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  let sequence = 0;
  const pending = new Map();
  const browserErrors = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") browserErrors.push(message.params.exceptionDetails.text);
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      browserErrors.push(message.params.args.map((arg) => arg.value || arg.description).join(" "));
    }
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });

  function send(method, params = {}) {
    const id = ++sequence;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text;
      throw new Error(detail);
    }
    return result.result.value;
  }

  try {
    await send("Runtime.enable");
    await send("Page.enable");
    await send("Page.reload", { ignoreCache: true });
    await delay(700);
    const initial = await evaluate(`({
      title: document.title,
      total: document.querySelector('#kpi-total').textContent,
      count: document.querySelector('#kpi-count').textContent,
      average: document.querySelector('#kpi-average').textContent,
      rows: document.querySelectorAll('#sales-body tr').length,
      categoryOptions: [...document.querySelector('#category-filter').options].map(o => o.value),
      cityOptions: [...document.querySelector('#city-filter').options].map(o => o.value),
      categoryDescription: document.querySelector('#category-chart').getAttribute('aria-label'),
      cityDescription: document.querySelector('#city-chart').getAttribute('aria-label'),
      activeFiltersHidden: document.querySelector('#active-filters').hidden,
      categoryBarRoles: [...document.querySelectorAll('#category-chart .bar')].map(el => [el.getAttribute('role'), el.getAttribute('tabindex'), el.getAttribute('aria-pressed')]),
      categoryFills: [...document.querySelectorAll('#category-chart .bar')].map(el => getComputedStyle(el).fill),
      cityFills: [...document.querySelectorAll('#city-chart .bar')].map(el => getComputedStyle(el).fill),
      categoryBars: [...document.querySelectorAll('#category-chart .bar')].map(el => el.getAttribute('aria-label')),
      cityBars: [...document.querySelectorAll('#city-chart .bar')].map(el => el.getAttribute('aria-label'))
    })`);
    assert.equal(initial.title, "Vendas da papelaria | Painel");
    assert.deepEqual([initial.total, initial.count, initial.average, initial.rows], ["R$ 20.059,00", "180", "R$ 111,44", 180]);
    assert.deepEqual(initial.categoryBars, ["Acessórios: R$ 10.517,00", "Livros: R$ 7.438,00", "Papelaria: R$ 2.104,00"]);
    assert.deepEqual(initial.cityBars, ["Campinas: R$ 8.578,00", "Santos: R$ 6.937,50", "Sorocaba: R$ 4.543,50"]);
    assert.match(initial.categoryDescription, /Valor vendido por categoria.*Acessórios.*Livros.*Papelaria/);
    assert.match(initial.cityDescription, /Valor vendido por cidade.*Campinas.*Santos.*Sorocaba/);
    assert.equal(initial.activeFiltersHidden, true);
    assert.ok(initial.categoryBarRoles.every(([role, tabindex, pressed]) => role === "button" && tabindex === "0" && pressed === "false"));
    assert.equal(new Set(initial.categoryFills).size, 1, "barras de categoria devem usar a mesma cor semântica");
    assert.equal(new Set(initial.cityFills).size, 1, "barras de cidade devem usar a mesma cor semântica");

    const themeStart = await evaluate(`(() => {
      const root = document.documentElement;
      const original = root.dataset.theme;
      const originalCanvas = getComputedStyle(root).getPropertyValue('--canvas').trim();
      const originalBackground = getComputedStyle(document.body).backgroundColor;
      const originalTextColor = getComputedStyle(document.body).color;
      const originalSurface = getComputedStyle(document.querySelector('.panel')).backgroundColor;
      const originalHeader = getComputedStyle(document.querySelector('th')).backgroundColor;
      const originalSelect = getComputedStyle(document.querySelector('select')).backgroundColor;
      document.querySelector('#theme-toggle').click();
      return { original, originalCanvas, originalBackground, originalTextColor, originalSurface, originalHeader, originalSelect, switched: root.dataset.theme,
        saved: localStorage.getItem('papelaria-theme'), actionLabel: document.querySelector('#theme-toggle').getAttribute('aria-label') };
    })()`);
    await delay(100);
    const switchedVisuals = await evaluate(`({ background: getComputedStyle(document.body).backgroundColor,
      textColor: getComputedStyle(document.body).color,
      canvas: getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim(),
      bodyCanvas: getComputedStyle(document.body).getPropertyValue('--canvas').trim(),
      darkBodySelector: document.body.matches(':root[data-theme="dark"] body'),
      darkPanelSelector: document.querySelector('.panel').matches(':root[data-theme="dark"] .panel'),
      tableHeader: getComputedStyle(document.querySelector('th')).backgroundColor,
      selectBackground: getComputedStyle(document.querySelector('select')).backgroundColor,
      primaryKpiColor: getComputedStyle(document.querySelector('.kpi-card-primary .kpi-value')).color,
      surface: getComputedStyle(document.querySelector('.panel')).backgroundColor })`);
    assert.notEqual(themeStart.switched, themeStart.original, "o controle deve alternar o tema");
    assert.equal(themeStart.saved, themeStart.switched, "a escolha deve ser salva");
    assert.equal(themeStart.actionLabel, themeStart.switched === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
    assert.notEqual(switchedVisuals.canvas, themeStart.originalCanvas, `o tema alternativo deve trocar a paleta: ${JSON.stringify(switchedVisuals)}`);
    assert.notEqual(switchedVisuals.background, themeStart.originalBackground, `o fundo deve acompanhar a paleta: ${JSON.stringify(switchedVisuals)}`);
    assert.notEqual(switchedVisuals.textColor, themeStart.originalTextColor, `a cor do texto deve acompanhar o tema: ${JSON.stringify(switchedVisuals)}`);
    assert.notEqual(switchedVisuals.surface, themeStart.originalSurface, `a superfície dos painéis deve acompanhar o tema: ${JSON.stringify(switchedVisuals)}`);
    assert.notEqual(switchedVisuals.tableHeader, themeStart.originalHeader, `o cabeçalho da tabela deve acompanhar o tema: ${JSON.stringify(switchedVisuals)}`);
    assert.notEqual(switchedVisuals.selectBackground, themeStart.originalSelect, `os filtros devem acompanhar o tema: ${JSON.stringify(switchedVisuals)}`);
    if (themeStart.switched === "dark") assert.equal(switchedVisuals.primaryKpiColor, "rgb(255, 255, 255)", "o valor destacado precisa manter contraste no tema escuro");
    const themeRestore = await evaluate(`(() => { document.querySelector('#theme-toggle').click(); return {
      theme: document.documentElement.dataset.theme, saved: localStorage.getItem('papelaria-theme') } })()`);
    const themeBehavior = { ...themeStart, ...switchedVisuals, restored: themeRestore.theme, restoredSaved: themeRestore.saved };
    assert.deepEqual([themeBehavior.restored, themeBehavior.restoredSaved], [themeBehavior.original, themeBehavior.original]);
    await send("Page.reload", { ignoreCache: true });
    await delay(700);
    assert.equal(await evaluate(`document.documentElement.dataset.theme`), themeBehavior.original, "a preferência salva deve continuar após recarregar");

    const initialTable = await evaluate(`fetch('dados/vendas.json').then(response => response.json()).then(data => {
      const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
      const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
      const expected = data.vendas.map(sale => [sale.id_venda, sale.data, sale.cidade, sale.categoria, sale.produto,
        integer.format(sale.quantidade), currency.format(sale.preco_unitario), sale.forma_pagamento, currency.format(sale.valor_venda)]);
      const actual = [...document.querySelectorAll('#sales-body tr')].map(row => [...row.cells].map(cell => cell.textContent));
      const expectedAverage = currency.format(data.vendas.reduce((sum, sale) => sum + sale.valor_venda, 0) / data.vendas.length);
      return { matchesPreparedData: JSON.stringify(actual) === JSON.stringify(expected), rows: actual.length, expectedAverage };
    })`);
    assert.deepEqual([initialTable.matchesPreparedData, initialTable.rows], [true, 180]);
    assert.equal(initial.average, initialTable.expectedAverage, "ticket médio inicial deve ser recalculado do JSON");

    const chartFilter = await evaluate(`(() => {
      document.querySelector('#city-chart .bar').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { city: document.querySelector('#city-filter').value, count: document.querySelector('#kpi-count').textContent,
        total: document.querySelector('#kpi-total').textContent, chip: document.querySelector('#active-filters').textContent,
        pressed: document.querySelector('#city-chart .bar').getAttribute('aria-pressed'), focusedRole: document.activeElement.getAttribute('role') };
    })()`);
    assert.deepEqual(chartFilter, { city: "Campinas", count: "70", total: "R$ 8.578,00", chip: "Cidade: Campinas", pressed: "true", focusedRole: "button" });

    const chipReset = await evaluate(`(() => {
      document.querySelector('#active-filters button').click();
      return { city: document.querySelector('#city-filter').value, count: document.querySelector('#kpi-count').textContent,
        hidden: document.querySelector('#active-filters').hidden, focused: document.activeElement.id };
    })()`);
    assert.deepEqual(chipReset, { city: "", count: "180", hidden: true, focused: "city-filter" });

    const keyboardChartFilter = await evaluate(`(() => {
      const bar = document.querySelector('#category-chart .bar');
      bar.focus(); bar.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return { category: document.querySelector('#category-filter').value, count: document.querySelector('#kpi-count').textContent,
        pressed: document.querySelector('#category-chart .bar').getAttribute('aria-pressed'), focusedRole: document.activeElement.getAttribute('role') };
    })()`);
    assert.deepEqual(keyboardChartFilter, { category: "Acessórios", count: "65", pressed: "true", focusedRole: "button" });
    await evaluate(`document.querySelector('#clear-filters').click()`);

    const byCategory = await evaluate(`(() => {
      const select = document.querySelector('#category-filter');
      select.value = 'Acessórios'; select.dispatchEvent(new Event('change'));
      return fetch('dados/vendas.json').then(response => response.json()).then(data => {
        const expected = data.vendas.filter(sale => sale.categoria === select.value);
        const expectedAverage = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
          .format(expected.reduce((sum, sale) => sum + sale.valor_venda, 0) / expected.length);
        const bars = field => {
          const totals = new Map();
          for (const sale of expected) totals.set(sale[field], (totals.get(sale[field]) || 0) + sale.valor_venda);
          return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
            .map(([name, amount]) => name + ': ' + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount));
        };
        return { total: document.querySelector('#kpi-total').textContent, count: document.querySelector('#kpi-count').textContent,
          average: document.querySelector('#kpi-average').textContent, expectedAverage,
          rows: document.querySelectorAll('#sales-body tr').length,
          idsMatch: [...document.querySelectorAll('#sales-body tr')].map(row => row.cells[0].textContent).join(',') === expected.map(sale => sale.id_venda).join(','),
          categoryBars: [...document.querySelectorAll('#category-chart .bar')].map(el => el.getAttribute('aria-label')),
          expectedCategoryBars: bars('categoria'),
          cityBars: [...document.querySelectorAll('#city-chart .bar')].map(el => el.getAttribute('aria-label')),
          expectedCityBars: bars('cidade') };
      });
    })()`);
    assert.deepEqual([byCategory.total, byCategory.count, byCategory.rows, byCategory.idsMatch], ["R$ 10.517,00", "65", 65, true]);
    assert.equal(byCategory.average, byCategory.expectedAverage, "ticket médio no filtro isolado por categoria deve ser recalculado do JSON");
    assert.deepEqual(byCategory.categoryBars, byCategory.expectedCategoryBars);
    assert.deepEqual(byCategory.cityBars, byCategory.expectedCityBars);

    const byCity = await evaluate(`(() => {
      document.querySelector('#category-filter').value = '';
      document.querySelector('#city-filter').value = 'Campinas';
      document.querySelector('#city-filter').dispatchEvent(new Event('change'));
      return fetch('dados/vendas.json').then(response => response.json()).then(data => {
        const expected = data.vendas.filter(sale => sale.cidade === document.querySelector('#city-filter').value);
        const expectedAverage = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
          .format(expected.reduce((sum, sale) => sum + sale.valor_venda, 0) / expected.length);
        const bars = field => {
          const totals = new Map();
          for (const sale of expected) totals.set(sale[field], (totals.get(sale[field]) || 0) + sale.valor_venda);
          return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
            .map(([name, amount]) => name + ': ' + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount));
        };
        return { total: document.querySelector('#kpi-total').textContent, count: document.querySelector('#kpi-count').textContent,
          average: document.querySelector('#kpi-average').textContent, expectedAverage,
          rows: document.querySelectorAll('#sales-body tr').length,
          idsMatch: [...document.querySelectorAll('#sales-body tr')].map(row => row.cells[0].textContent).join(',') === expected.map(sale => sale.id_venda).join(','),
          categoryBars: [...document.querySelectorAll('#category-chart .bar')].map(el => el.getAttribute('aria-label')),
          expectedCategoryBars: bars('categoria'),
          cityBars: [...document.querySelectorAll('#city-chart .bar')].map(el => el.getAttribute('aria-label')),
          expectedCityBars: bars('cidade') };
      });
    })()`);
    assert.deepEqual([byCity.total, byCity.count, byCity.rows, byCity.idsMatch], ["R$ 8.578,00", "70", 70, true]);
    assert.equal(byCity.average, byCity.expectedAverage, "ticket médio no filtro isolado por cidade deve ser recalculado do JSON");
    assert.deepEqual(byCity.categoryBars, byCity.expectedCategoryBars);
    assert.deepEqual(byCity.cityBars, byCity.expectedCityBars);

    const combined = await evaluate(`(() => {
      const category = document.querySelector('#category-filter');
      category.value = 'Acessórios'; category.dispatchEvent(new Event('change'));
      const rows = [...document.querySelectorAll('#sales-body tr')];
      const json = fetch('dados/vendas.json').then(r => r.json());
      return json.then(data => {
        const expected = data.vendas.filter(v => v.categoria === 'Acessórios' && v.cidade === 'Campinas');
        const expectedAverage = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
          .format(expected.reduce((sum, sale) => sum + sale.valor_venda, 0) / expected.length);
        const bars = field => {
          const totals = new Map();
          for (const sale of expected) totals.set(sale[field], (totals.get(sale[field]) || 0) + sale.valor_venda);
          return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
            .map(([name, amount]) => name + ': ' + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount));
        };
        return { count: document.querySelector('#kpi-count').textContent, average: document.querySelector('#kpi-average').textContent,
          expectedAverage, tableRows: rows.length,
          tableIds: rows.map(row => row.cells[0].textContent), expectedIds: expected.map(row => row.id_venda),
          expectedCount: expected.length, total: document.querySelector('#kpi-total').textContent,
          expectedTotal: expected.reduce((sum, row) => sum + row.valor_venda, 0),
          categoryBars: [...document.querySelectorAll('#category-chart .bar')].map(el => el.getAttribute('aria-label')),
          expectedCategoryBars: bars('categoria'),
          cityBars: [...document.querySelectorAll('#city-chart .bar')].map(el => el.getAttribute('aria-label')),
          expectedCityBars: bars('cidade') };
      });
    })()`);
    assert.equal(Number(combined.count), combined.expectedCount);
    assert.equal(combined.average, combined.expectedAverage, "ticket médio nos filtros combinados deve ser recalculado do JSON");
    assert.equal(combined.tableRows, combined.expectedCount);
    assert.deepEqual(combined.tableIds, combined.expectedIds);
    assert.deepEqual(combined.categoryBars, combined.expectedCategoryBars);
    assert.deepEqual(combined.cityBars, combined.expectedCityBars);
    assert.equal(Number(combined.total.replace(/[^\d,]/g, "").replace(",", ".")), combined.expectedTotal);

    const empty = await evaluate(`(() => {
      const city = document.querySelector('#city-filter');
      const option = new Option('Cenário sem resultados', '__sem_resultados__'); city.add(option); city.value = option.value;
      city.dispatchEvent(new Event('change'));
      const expectedAverage = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
      return { count: document.querySelector('#kpi-count').textContent, rows: document.querySelectorAll('#sales-body tr').length,
        message: document.querySelector('#sales-body').textContent, chartMessage: document.querySelector('#category-chart').textContent,
        chartDescription: document.querySelector('#category-chart').getAttribute('aria-label'),
        average: document.querySelector('#kpi-average').textContent, expectedAverage,
        values: [...document.querySelectorAll('.kpi-value')].map(el => el.textContent).join(' ') };
    })()`);
    assert.equal(empty.count, "0");
    assert.equal(empty.rows, 1);
    assert.match(empty.message, /Nenhuma venda corresponde/);
    assert.match(empty.chartMessage, /Sem dados/);
    assert.match(empty.chartDescription, /Categoria: sem dados para os filtros selecionados/);
    assert.equal(empty.average, empty.expectedAverage, "ticket médio sem vendas deve ser exatamente R$ 0,00");
    assert.equal(empty.average, "R$ 0,00");
    assert.doesNotMatch(empty.values, /NaN|Infinity/);

    const reset = await evaluate(`(() => {
      document.querySelector('#clear-filters').click();
      return { category: document.querySelector('#category-filter').value, city: document.querySelector('#city-filter').value,
        count: document.querySelector('#kpi-count').textContent, rows: document.querySelectorAll('#sales-body tr').length,
        focused: document.activeElement.id };
    })()`);
    assert.deepEqual(reset, { category: "", city: "", count: "180", rows: 180, focused: "category-filter" });

    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40 });
    const keyboardSelection = await evaluate(`({ category: document.querySelector('#category-filter').value, count: document.querySelector('#kpi-count').textContent })`);
    assert.deepEqual(keyboardSelection, { category: "Acessórios", count: "65" });
    await evaluate(`document.querySelector('#clear-filters').click()`);

    // Resize through CDP separately; document width is checked at both viewport sizes.
    await send("Emulation.setDeviceMetricsOverride", { width: 1365, height: 900, deviceScaleFactor: 1, mobile: false });
    const desktop = await evaluate(`({ inner: innerWidth, page: document.documentElement.scrollWidth })`);
    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: false });
    await delay(100);
    const mobile = await evaluate(`({ inner: innerWidth, page: document.documentElement.scrollWidth, filterWidth: document.querySelector('.filter-controls').getBoundingClientRect().width, compactLayout: matchMedia('(max-width: 480px)').matches,
      svgText: [...document.querySelectorAll('.chart svg text')].map(el => ({
        chart: el.closest('.chart').id, text: el.textContent,
        renderedHeight: (() => { const box = el.getBBox(), matrix = el.getScreenCTM(); return box.height * Math.hypot(matrix.b, matrix.d); })(),
        renderedWidth: (() => { const box = el.getBBox(), matrix = el.getScreenCTM(); return box.width * Math.hypot(matrix.a, matrix.c); })()
      })),
      overflow: [...document.querySelectorAll('body *')].map(el => ({tag: el.tagName, className: el.className?.baseVal || el.className, right: Math.round(el.getBoundingClientRect().right), width: Math.round(el.getBoundingClientRect().width)})).filter(el => el.right > innerWidth + 1).slice(0, 12) })`);
    assert.ok(desktop.page <= desktop.inner, `overflow horizontal no desktop: ${JSON.stringify(desktop)}`);
    assert.ok(mobile.page <= mobile.inner, `overflow horizontal no mobile: ${JSON.stringify(mobile)}`);
    assert.ok(mobile.filterWidth > 0);
    assert.equal(mobile.compactLayout, true);
    // 10 rendered CSS px is a practical floor: ~50% above the ~6.7px mobile text called out in review 03 (not a WCAG claim).
    const minimumRenderedSvgTextHeight = 10;
    assert.ok(mobile.svgText.length > 0, "ambos gráficos devem expor textos SVG mensuráveis em 375px");
    assert.ok(mobile.svgText.every(label => label.renderedHeight > 0 && label.renderedWidth > 0),
      `textos SVG devem estar efetivamente renderizados em 375px: ${JSON.stringify(mobile.svgText)}`);
    assert.ok(mobile.svgText.every(label => label.renderedHeight >= minimumRenderedSvgTextHeight),
      `cada texto SVG deve ter altura efetivamente renderizada >= ${minimumRenderedSvgTextHeight} CSS px em 375px; medido: ${JSON.stringify(mobile.svgText)}`);

    const keyboard = await evaluate(`({
      labels: [...document.querySelectorAll('label[for]')].map(label => document.getElementById(label.htmlFor)?.tagName),
      controlsFocusable: ['category-filter', 'city-filter', 'clear-filters'].every(id => {
        const el = document.getElementById(id); el.focus(); return document.activeElement === el;
      })
    })`);
    assert.deepEqual(keyboard.labels, ["SELECT", "SELECT"]);
    assert.equal(keyboard.controlsFocusable, true);
    assert.deepEqual(browserErrors, []);

    const errorScript = await send("Page.addScriptToEvaluateOnNewDocument", {
      source: "window.fetch = () => Promise.resolve(new Response(null, { status: 503, statusText: 'Unavailable' }));",
    });
    await send("Page.reload", { ignoreCache: true });
    await delay(700);
    const loadFailure = await evaluate(`({
      status: document.querySelector('#result-count').textContent,
      table: document.querySelector('#sales-body').textContent,
      categoryDescription: document.querySelector('#category-chart').getAttribute('aria-label'),
      values: [...document.querySelectorAll('.kpi-value')].map(el => el.textContent).join(' ')
    })`);
    assert.match(loadFailure.status, /Não foi possível carregar os dados/);
    assert.match(loadFailure.table, /As vendas não foram carregadas/);
    assert.match(loadFailure.categoryDescription, /os dados não puderam ser carregados/);
    assert.doesNotMatch(`${loadFailure.status} ${loadFailure.table}`, /503|Unavailable/);
    assert.doesNotMatch(loadFailure.values, /NaN|Infinity/);
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: errorScript.identifier });
    await send("Page.reload", { ignoreCache: true });
    await delay(700);
    const recovered = await evaluate(`({ count: document.querySelector('#kpi-count').textContent, rows: document.querySelectorAll('#sales-body tr').length })`);
    assert.deepEqual(recovered, { count: "180", rows: 180 });

    console.log(JSON.stringify({ status: "PASS", initial, themeBehavior, byCategory, byCity, combined, empty, reset, keyboardSelection, desktop, mobile, keyboard, loadFailure, recovered, browserErrors }, null, 2));
  } finally {
    ws.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
