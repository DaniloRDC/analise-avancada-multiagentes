"use strict";

const DATA_URL = "dados/vendas.json";
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const svgNS = "http://www.w3.org/2000/svg";
let sales = [];

const elements = {
  category: document.querySelector("#category-filter"),
  city: document.querySelector("#city-filter"),
  clear: document.querySelector("#clear-filters"),
  activeFilters: document.querySelector("#active-filters"),
  total: document.querySelector("#kpi-total"),
  count: document.querySelector("#kpi-count"),
  average: document.querySelector("#kpi-average"),
  resultCount: document.querySelector("#result-count"),
  table: document.querySelector("#sales-body"),
  categoryChart: document.querySelector("#category-chart"),
  cityChart: document.querySelector("#city-chart"),
};

function svgElement(name, attributes = {}, text = "") {
  const element = document.createElementNS(svgNS, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  if (text) element.textContent = text;
  return element;
}

function fillFilter(select, values, placeholder) {
  for (const value of [...values].sort((a, b) => a.localeCompare(b, "pt-BR"))) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
  select.options[0].textContent = placeholder;
}

function filteredSales() {
  return sales.filter((sale) =>
    (!elements.category.value || sale.categoria === elements.category.value) &&
    (!elements.city.value || sale.cidade === elements.city.value)
  );
}

function groupedTotal(rows, field) {
  const totals = new Map();
  for (const row of rows) totals.set(row[field], (totals.get(row[field]) || 0) + row.valor_venda);
  return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
}

function applyChartFilter(field, value) {
  const select = field === "categoria" ? elements.category : elements.city;
  select.value = select.value === value ? "" : value;
  updateDashboard();
  const nextBar = [...document.querySelectorAll(".chart .bar")]
    .find((bar) => bar.dataset.field === field && bar.dataset.value === value);
  (nextBar || select).focus();
}

function renderActiveFilters() {
  const filters = [
    { select: elements.category, label: "Categoria" },
    { select: elements.city, label: "Cidade" },
  ].filter(({ select }) => select.value);

  elements.activeFilters.replaceChildren();
  elements.activeFilters.hidden = filters.length === 0;
  for (const { select, label } of filters) {
    const value = select.value;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-chip";
    chip.textContent = `${label}: ${value}`;
    chip.setAttribute("aria-label", `Remover filtro de ${label.toLowerCase()}: ${value}`);
    chip.addEventListener("click", () => {
      select.value = "";
      updateDashboard();
      select.focus();
    });
    elements.activeFilters.append(chip);
  }
}

function renderChart(container, groups, label, field) {
  container.replaceChildren();
  if (!groups.length) {
    container.setAttribute("aria-label", `${label}: sem dados para os filtros selecionados.`);
    const message = document.createElement("p");
    message.className = "chart-empty";
    message.textContent = "Sem dados para os filtros selecionados.";
    container.append(message);
    return;
  }
  const chartSummary = groups.map(([name, amount]) => `${name}: ${currency.format(amount)}`).join("; ");
  container.setAttribute("aria-label", `Valor vendido por ${label.toLocaleLowerCase("pt-BR")}. Selecione uma barra para filtrar. ${chartSummary}.`);

  // Match the SVG coordinate system to its rendered width so its 12px labels
  // stay 12 CSS pixels on mobile instead of being scaled down from a desktop viewBox.
  const width = Math.max(240, Math.floor(container.getBoundingClientRect().width));
  const height = 220;
  const margin = { top: 20, right: 82, bottom: 38, left: 92 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(...groups.map((item) => item[1]), 1);
  const step = plotHeight / groups.length;
  const barHeight = Math.min(34, step * 0.62);
  const svg = svgElement("svg", { viewBox: `0 0 ${width} ${height}`, role: "group", "aria-label": `Barras por ${label.toLocaleLowerCase("pt-BR")}` });
  const tickCount = width < 420 ? 2 : 4;
  for (let tick = 0; tick <= tickCount; tick += 1) {
    const value = (maxValue / tickCount) * tick;
    const x = margin.left + (plotWidth * tick) / tickCount;
    svg.append(svgElement("line", { x1: x, y1: margin.top, x2: x, y2: margin.top + plotHeight, class: tick === 0 ? "axis" : "gridline" }));
    svg.append(svgElement("text", { x, y: height - 12, "text-anchor": "middle" }, compactAxisCurrency(value)));
  }
  groups.forEach(([name, amount], index) => {
    const y = margin.top + step * index + (step - barHeight) / 2;
    const barWidth = (amount / maxValue) * plotWidth;
    const categoryLabel = svgElement("text", { x: margin.left - 9, y: y + barHeight / 2 + 4, "text-anchor": "end" }, name);
    const bar = svgElement("rect", {
      x: margin.left,
      y,
      width: Math.max(barWidth, 1),
      height: barHeight,
      rx: 4,
      class: "bar",
      role: "button",
      "aria-label": `${name}: ${currency.format(amount)}`,
      tabindex: "0",
      "aria-pressed": String((field === "categoria" ? elements.category : elements.city).value === name),
      "data-field": field,
      "data-value": name,
    });
    bar.append(svgElement("title", {}, `Filtrar por ${label.toLocaleLowerCase("pt-BR")}: ${name}, ${currency.format(amount)}`));
    bar.addEventListener("click", () => applyChartFilter(field, name));
    bar.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        applyChartFilter(field, name);
      }
    });
    const valueLabel = svgElement("text", { x: width - margin.right + 6, y: y + barHeight / 2 + 4, class: "value-label" }, compactCurrency(amount));
    svg.append(categoryLabel, bar, valueLabel);
  });
  container.append(svg);
}

function compactCurrency(value) {
  if (value >= 1000) return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return currency.format(value);
}

function compactAxisCurrency(value) {
  if (value >= 1000) return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  return `R$ ${integer.format(value)}`;
}

function makeCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = value;
  if (className) cell.className = className;
  return cell;
}

function renderTable(rows, emptyMessage = "Nenhuma venda corresponde aos filtros. Altere ou limpe os filtros para ver os dados.") {
  elements.table.replaceChildren();
  if (!rows.length) {
    const tr = document.createElement("tr");
    const cell = makeCell(emptyMessage, "empty-row");
    cell.colSpan = 9;
    tr.append(cell);
    elements.table.append(tr);
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const sale of rows) {
    const tr = document.createElement("tr");
    tr.append(
      makeCell(sale.id_venda), makeCell(sale.data), makeCell(sale.cidade), makeCell(sale.categoria),
      makeCell(sale.produto), makeCell(integer.format(sale.quantidade), "numeric"),
      makeCell(currency.format(sale.preco_unitario), "numeric"), makeCell(sale.forma_pagamento),
      makeCell(currency.format(sale.valor_venda), "numeric")
    );
    fragment.append(tr);
  }
  elements.table.append(fragment);
}

function updateDashboard() {
  const rows = filteredSales();
  const total = rows.reduce((sum, sale) => sum + sale.valor_venda, 0);
  elements.total.textContent = currency.format(total);
  elements.count.textContent = integer.format(rows.length);
  elements.average.textContent = rows.length ? currency.format(total / rows.length) : currency.format(0);
  elements.resultCount.textContent = `${integer.format(rows.length)} ${rows.length === 1 ? "transação encontrada" : "transações encontradas"}`;
  renderActiveFilters();
  renderChart(elements.categoryChart, groupedTotal(rows, "categoria"), "Categoria", "categoria");
  renderChart(elements.cityChart, groupedTotal(rows, "cidade"), "Cidade", "cidade");
  renderTable(rows);
}

let chartResizeFrame = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(chartResizeFrame);
  chartResizeFrame = requestAnimationFrame(() => {
    const rows = filteredSales();
    renderChart(elements.categoryChart, groupedTotal(rows, "categoria"), "Categoria", "categoria");
    renderChart(elements.cityChart, groupedTotal(rows, "cidade"), "Cidade", "cidade");
  });
});

async function start() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Não foi possível carregar os dados (HTTP ${response.status}).`);
    const data = await response.json();
    if (!Array.isArray(data.vendas)) throw new Error("O arquivo de dados não contém a lista de vendas esperada.");
    sales = data.vendas;
    fillFilter(elements.category, new Set(sales.map((sale) => sale.categoria)), "Todas as categorias");
    fillFilter(elements.city, new Set(sales.map((sale) => sale.cidade)), "Todas as cidades");
    elements.category.addEventListener("change", updateDashboard);
    elements.city.addEventListener("change", updateDashboard);
    elements.clear.addEventListener("click", () => {
      elements.category.value = "";
      elements.city.value = "";
      updateDashboard();
      elements.category.focus();
    });
    updateDashboard();
  } catch (error) {
    elements.resultCount.textContent = "Não foi possível carregar os dados. Recarregue a página para tentar novamente.";
    elements.total.textContent = "—";
    elements.count.textContent = "—";
    elements.average.textContent = "—";
    renderTable([], "As vendas não foram carregadas. Recarregue a página para tentar novamente.");
    for (const [chart, label] of [[elements.categoryChart, "Categoria"], [elements.cityChart, "Cidade"]]) {
      chart.setAttribute("aria-label", `${label}: os dados não puderam ser carregados.`);
      const message = document.createElement("p");
      message.className = "chart-empty";
      message.textContent = "Os dados não puderam ser carregados.";
      chart.replaceChildren(message);
    }
  }
}

start();
