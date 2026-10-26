/* ==========================================================================
   Resoluta Finance — Aplicação (roteador + módulos)
   ========================================================================== */
(function () {
  'use strict';
  var F = window.Finance, S = window.Store, A = window.ResolutaAuth, C = window.Charts;

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return A.sanitize(s == null ? '' : s); }
  function uid(p) { return S.uid(p); }
  function brl(v) { return F.brl(v); }
  function pct(v) { return F.pct(v); }
  function ratio(v) { return F.pctFromRatio(v); }
  function todayStr() { return S.today(); }
  function fmtDate(d) { if (!d) return '—'; var dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString('pt-BR'); }

  function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'alert alert-' + (type || 'success');
    t.style.cssText = 'position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:2000;box-shadow:var(--shadow-lg);max-width:420px;';
    t.innerHTML = '<i class="fa-solid ' + (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check') + '" aria-hidden="true"></i><div>' + msg + '</div>';
    document.body.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 320); }, 2600);
  }

  /* ---------- Modal genérico ---------- */
  var modalEl, modalTitle, modalSub, modalBody;
  function openModal(title, sub, html, onMount) {
    modalEl = modalEl || $('#appModal');
    modalTitle = modalTitle || $('#appModalTitle');
    modalSub = modalSub || $('#appModalSub');
    modalBody = modalBody || $('#appModalBody');
    modalTitle.textContent = title;
    modalSub.textContent = sub || '';
    modalBody.innerHTML = html;
    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (onMount) onMount(modalBody);
  }
  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---------- Export PDF (via janela de impressão) ---------- */
  function exportPDF(title, innerHtml) {
    var w = window.open('', '_blank');
    if (!w) { toast('Permita pop-ups para exportar em PDF.', 'error'); return; }
    w.document.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<style>body{font-family:Arial,Helvetica,sans-serif;color:#2c2224;padding:28px;}' +
      'h1{color:#581124;font-size:20px;margin:0 0 4px;}h2{color:#581124;font-size:15px;margin:22px 0 8px;}' +
      '.muted{color:#6b5b5e;font-size:12px;margin-bottom:18px;}' +
      'table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px;}' +
      'th,td{border:1px solid #ddd;padding:7px 9px;text-align:left;}th{background:#f3efe9;}' +
      '.kpi{display:inline-block;border:1px solid #ddd;border-radius:8px;padding:10px 14px;margin:0 8px 8px 0;min-width:150px;}' +
      '.kpi b{display:block;font-size:16px;color:#581124;}.kpi span{font-size:11px;color:#6b5b5e;}' +
      '.head{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #d4af37;padding-bottom:10px;margin-bottom:16px;}' +
      '.gold{color:#c29f31;font-weight:bold;}' +
      '@media print{@page{margin:14mm;}}</style></head><body>' +
      '<div class="head"><div><h1>Resoluta AGI · Resoluta Finance</h1><div class="muted">' + esc(title) + ' — gerado em ' + new Date().toLocaleString('pt-BR') + '</div></div>' +
      '<div class="gold">Entenda seus números.</div></div>' + innerHtml +
      '<p class="muted" style="margin-top:26px;">Documento gerado pela plataforma Resoluta Finance. Os valores são estimativas e não substituem a orientação contábil profissional.</p>' +
      '</body></html>');
    w.document.close();
    setTimeout(function () { w.focus(); w.print(); }, 400);
  }

  /* ---------- Estado / dados ---------- */
  function data() { return S.get(); }
  function commit() { S.save(data()); }

  /* ---------- Router ---------- */
  var VIEWS = {
    dashboard: { title: 'Dashboard', sub: 'Resumo financeiro do seu negócio', render: renderDashboard },
    precificacao: { title: 'Calculadora de Markup', sub: 'Precificação por markup divisor e multiplicador', render: renderPrecificacao },
    fluxo: { title: 'Fluxo de Caixa', sub: 'Entradas, saídas e saldo', render: renderFluxo },
    contas: { title: 'Contas a Pagar e Receber', sub: 'Compromissos por vencimento', render: renderContas },
    capital: { title: 'Capital de Giro', sub: 'Ativo circulante − passivo circulante', render: renderCapital },
    ticket: { title: 'Ticket Médio', sub: 'Faturamento ÷ vendas', render: renderTicket },
    contribuicao: { title: 'Margem de Contribuição', sub: 'Receita − custos e despesas variáveis', render: renderContribuicao },
    margem: { title: 'Margem de Lucro', sub: 'Bruto, operacional e líquido', render: renderMargem },
    equilibrio: { title: 'Ponto de Equilíbrio', sub: 'Quanto vender para não ter prejuízo', render: renderEquilibrio },
    diagnostico: { title: 'Diagnóstico Financeiro', sub: 'Maturidade de gestão e plano de ação', render: renderDiagnostico },
    metas: { title: 'Planejamento e Metas', sub: 'Objetivos e progresso', render: renderMetas },
    simulador: { title: 'Simulador de Cenários', sub: 'Conservador, Base e Otimista', render: renderSimulador },
    relatorios: { title: 'Relatórios Financeiros', sub: 'Mensal e anual · CSV e PDF', render: renderRelatorios },
    ia: { title: 'Assistente de IA', sub: 'Dúvidas sobre gestão financeira', render: renderIA },
    config: { title: 'Conta e Configurações', sub: 'Dados, plano e privacidade', render: renderConfig }
  };

  var current = 'dashboard';

  function go(view, skipHash) {
    if (!VIEWS[view]) view = 'dashboard';
    current = view;
    $$('.view').forEach(function (v) { v.classList.remove('active'); });
    var target = $('#view-' + view);
    if (target) target.classList.add('active');
    $('#viewTitle').textContent = VIEWS[view].title;
    $('#viewSub').textContent = VIEWS[view].sub;
    $$('.side-link').forEach(function (l) { l.classList.toggle('active', l.getAttribute('data-view') === view); });
    if (!skipHash) { try { history.replaceState(null, '', '#' + view); } catch (e) { location.hash = view; } }
    closeSidebar();
    VIEWS[view].render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeSidebar() { $('#sidebar').classList.remove('open'); $('#sidebarBackdrop').classList.remove('open'); }

  /* ======================================================================
     DASHBOARD
     ====================================================================== */
  function renderDashboard() {
    var d = data();
    var sum = F.dashboardSummary(d);
    var series = F.monthlySeries(d.transactions, 6);
    var bills = F.billsSummary(d.bills);
    var expenseByCat = {};
    d.transactions.filter(function (t) { return t.type === 'out'; }).forEach(function (t) {
      expenseByCat[t.category || 'Outros'] = (expenseByCat[t.category || 'Outros'] || 0) + F.num(t.amount);
    });
    var catItems = Object.keys(expenseByCat).map(function (k) { return { label: k, value: expenseByCat[k] }; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 6);

    var html = '';
    html += '<div class="grid grid-4" style="margin-bottom:18px;">' +
      kpi('Faturamento', brl(sum.revenue), sum.salesCount + ' venda(s) registrada(s)', 'fa-arrow-trend-up', 'pos') +
      kpi('Despesas', brl(sum.expenses), 'saídas registradas', 'fa-arrow-trend-down', 'neg') +
      kpi('Lucro (caixa)', brl(sum.profit), 'faturamento − despesas', 'fa-sack-dollar', sum.profit >= 0 ? 'pos' : 'neg') +
      kpi('Margem', ratio(sum.margin), 'lucro ÷ faturamento', 'fa-percent', '') +
      '</div>';

    html += '<div class="grid grid-4" style="margin-bottom:18px;">' +
      kpi('Saldo realizado', brl(sum.balance), 'entradas − saídas até hoje', 'fa-wallet', sum.balance >= 0 ? 'pos' : 'neg') +
      kpi('Saldo projetado', brl(sum.projected), 'inclui lançamentos futuros', 'fa-chart-line', '') +
      kpi('Ticket médio', brl(sum.ticket), sum.salesCount + ' venda(s)', 'fa-receipt', '') +
      kpi('Contas vencidas', String(bills.overdueCount), 'a pagar ' + brl(bills.overduePayable) + ' · a receber ' + brl(bills.overdueReceivable), 'fa-triangle-exclamation', bills.overdueCount ? 'neg' : 'pos') +
      '</div>';

    html += '<div class="grid grid-2" style="margin-bottom:18px;">' +
      '<div class="card"><div class="card-title"><i class="fa-solid fa-chart-column"></i> Entradas x Saídas (6 meses)</div>' +
      '<div class="chart-box"><canvas id="chartDash" height="280" role="img" aria-label="Gráfico de entradas e saídas dos últimos seis meses"></canvas></div>' +
      '<div class="legend"><span><i style="background:#1f7a4d"></i> Entradas</span><span><i style="background:#b3261e"></i> Saídas</span></div></div>' +
      '<div class="card"><div class="card-title"><i class="fa-solid fa-chart-pie"></i> Despesas por categoria</div>' +
      '<div class="chart-box"><canvas id="chartCat" height="280" role="img" aria-label="Gráfico de despesas por categoria"></canvas></div>' +
      '<div class="legend">' + catItems.map(function (c, i) { return '<span><i style="background:' + C.colors[i % C.colors.length] + '"></i> ' + esc(c.label) + '</span>'; }).join('') + '</div></div>' +
      '</div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-bolt"></i> Ações rápidas</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:12px;">' +
      quickBtn('precificacao', 'fa-tags', 'Calcular preço') +
      quickBtn('fluxo', 'fa-plus', 'Novo lançamento') +
      quickBtn('contas', 'fa-file-invoice-dollar', 'Nova conta') +
      quickBtn('diagnostico', 'fa-stethoscope', 'Fazer diagnóstico') +
      quickBtn('relatorios', 'fa-file-lines', 'Ver relatórios') +
      '</div></div>';

    $('#dashboardContent').innerHTML = html;

    if (series.every(function (s) { return s.income === 0 && s.expense === 0; })) {
      showEmptyHint('#dashboardContent', 'Você ainda não tem lançamentos. Use "Novo lançamento" ou carregue dados de exemplo (ícone do frasco no topo).');
    }

    C.bar($('#chartDash'), series.map(function (s) { return s.label; }), [
      { name: 'Entradas', color: '#1f7a4d', data: series.map(function (s) { return s.income; }) },
      { name: 'Saídas', color: '#b3261e', data: series.map(function (s) { return s.expense; }) }
    ], { height: 280 });
    C.donut($('#chartCat'), catItems, { height: 280, centerLabel: brl(catItems.reduce(function (a, c) { return a + c.value; }, 0)), centerSub: 'em despesas' });

    $$('[data-quick]').forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-quick')); }); });
  }
  function kpi(label, value, note, icon, cls) {
    return '<div class="kpi ' + (cls || '') + '"><div class="k-label"><i class="fa-solid ' + icon + '"></i> ' + label + '</div>' +
      '<div class="k-value">' + value + '</div><div class="k-note">' + note + '</div></div>';
  }
  function quickBtn(view, icon, label) {
    return '<button class="btn btn-ghost" type="button" data-quick="' + view + '"><i class="fa-solid ' + icon + '" aria-hidden="true"></i> ' + label + '</button>';
  }
  function showEmptyHint(sel, msg) {
    var host = $(sel);
    if (!host) return;
    var div = document.createElement('div');
    div.className = 'alert alert-info';
    div.innerHTML = '<i class="fa-solid fa-circle-info" aria-hidden="true"></i><div>' + msg + '</div>';
    host.appendChild(div);
  }

  /* ======================================================================
     PRECIFICAÇÃO
     ====================================================================== */
  function renderPrecificacao() {
    var d = data();
    var html = '<div class="grid grid-2">' +
      '<div class="card"><div class="card-title"><i class="fa-solid fa-calculator"></i> Dados do produto/serviço</div>' +
      '<form id="pfForm">' +
      '<div class="form-row">' +
      field('pfName', 'Nome do produto/serviço', 'text', 'Ex.: Doce artesanal') +
      field('pfCost', 'Custo direto unitário (R$)', 'number', '0,00', '0.01') +
      field('pfVar', 'Despesas variáveis (%)', 'number', 'Ex.: 8', '0.1') +
      field('pfFix', 'Despesas fixas rateadas (%)', 'number', 'Ex.: 12', '0.1') +
      field('pfMargin', 'Margem de lucro desejada (%)', 'number', 'Ex.: 20', '0.1') +
      field('pfQty', 'Quantidade vendida/estimada', 'number', '1', '1', '1') +
      field('pfPracticed', 'Preço praticado atual (R$) — opcional', 'number', '0,00', '0.01') +
      '</div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;">' +
      '<button class="btn btn-primary" type="submit"><i class="fa-solid fa-equals"></i> Calcular</button>' +
      '<button class="btn btn-ghost" type="button" id="pfExample"><i class="fa-solid fa-lightbulb"></i> Exemplo</button>' +
      '<button class="btn btn-secondary" type="button" id="pfSave"><i class="fa-solid fa-floppy-disk"></i> Salvar</button>' +
      '</div></form></div>' +
      '<div class="card"><div class="card-title"><i class="fa-solid fa-square-poll-vertical"></i> Resultado</div>' +
      '<div id="pfResult"><div class="empty-state"><i class="fa-solid fa-arrow-left"></i><h3>Informe os dados</h3><p>Preencha o custo e os percentuais para ver o preço sugerido.</p></div></div></div>' +
      '</div>';

    html += '<div class="card" style="margin-top:18px;"><div class="card-title"><i class="fa-solid fa-box-archive"></i> Precificações salvas</div>' +
      '<div id="pfList"></div></div>';

    $('#precificacaoContent').innerHTML = html;

    function calc() {
      var input = {
        cost: F.num($('#pfCost').value), varPct: F.num($('#pfVar').value), fixPct: F.num($('#pfFix').value),
        marginPct: F.num($('#pfMargin').value), qty: F.num($('#pfQty').value, 1), practiced: F.num($('#pfPracticed').value)
      };
      var r = F.markup(input);
      if (!r.ok) { $('#pfResult').innerHTML = '<div class="alert alert-error"><i class="fa-solid fa-triangle-exclamation"></i><div><strong>Não foi possível calcular.</strong> ' + r.error + '</div></div>'; return; }
      $('#pfResult').innerHTML =
        '<div class="result-grid">' +
        '<div class="result-box highlight"><span>Preço de venda sugerido</span><b>' + brl(r.price) + '</b>' + (r.practiced ? '<small>Praticado: ' + brl(r.practiced.price) + ' (' + (r.practiced.diff >= 0 ? '+' : '') + brl(r.practiced.diff) + ')</small>' : '') + '</div>' +
        '<div class="result-box"><span>Markup divisor</span><b>' + r.divisor.toFixed(4) + '</b><small>1 − (var+fix+margem)</small></div>' +
        '<div class="result-box"><span>Markup multiplicador</span><b>' + r.multiplier.toFixed(4) + '</b><small>1 ÷ divisor</small></div>' +
        '<div class="result-box"><span>Lucro líquido/unidade</span><b>' + brl(r.unitProfit) + '</b><small>margem ' + ratio(r.marginResult) + '</small></div>' +
        '<div class="result-box"><span>Faturamento total</span><b>' + brl(r.revenue) + '</b><small>' + r.qty + ' unidade(s)</small></div>' +
        '<div class="result-box"><span>Custo total</span><b>' + brl(r.totalCost) + '</b><small>custo × qtd</small></div>' +
        '<div class="result-box"><span>Despesas operacionais</span><b>' + brl(r.opExp) + '</b><small>variáveis + fixas</small></div>' +
        '<div class="result-box"><span>Lucro líquido estimado</span><b>' + brl(r.netProfit) + '</b><small>no período</small></div>' +
        '</div>' +
        '<div class="alert alert-info" style="margin-top:16px;"><i class="fa-solid fa-circle-info"></i><div><strong>Dica</strong> O markup divisor mostra quanto do preço sobra para cobrir o custo. Se a soma dos percentuais chegar a 100%, o preço fica impossível — reveja suas despesas.</div></div>';
    }

    $('#pfForm').addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    $('#pfExample').addEventListener('click', function () {
      $('#pfName').value = 'Doce artesanal (unidade)';
      $('#pfCost').value = 4.5; $('#pfVar').value = 8; $('#pfFix').value = 12; $('#pfMargin').value = 25; $('#pfQty').value = 100; $('#pfPracticed').value = 12;
      calc();
    });
    $('#pfSave').addEventListener('click', function () {
      var input = { cost: F.num($('#pfCost').value), varPct: F.num($('#pfVar').value), fixPct: F.num($('#pfFix').value), marginPct: F.num($('#pfMargin').value), qty: F.num($('#pfQty').value, 1), practiced: F.num($('#pfPracticed').value) };
      var r = F.markup(input);
      if (!r.ok) { toast(r.error, 'error'); return; }
      S.add('products', { 
         name: $('#pfName').value || 'Produto sem nome',
         cost: input.cost,
         varPct: input.varPct,
         fixPct:input.fixPct,
         marginPct: input.marginPct,
         qty: input.qty,
         practiced: input.practiced
      });
       
     S.add('transactions', {
    id: 'tx-' + Date.now(),
    type: 'in',
    description: $('#pfName').value || 'Precificação',
    category: 'Vendas',
    amount: r.revenue,
    date: new Date().toISOString()
     });
       
     toast('Precificação salva!');
     renderPrecificacao();
     });
    
  function renderPfList() {
    var d = data();
    var host = $('#pfList');
    if (!host) return;
    if (!d.products.length) { host.innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><h3>Nenhuma precificação salva</h3><p>Calcule um preço e clique em "Salvar".</p></div>'; return; }
    var rows = d.products.map(function (p) {
      var r = F.markup(p);
      return '<tr><td>' + esc(p.name) + '</td><td class="num">' + brl(p.cost) + '</td><td class="num">' + pct(p.varPct) + '</td><td class="num">' + pct(p.fixPct) + '</td><td class="num">' + pct(p.marginPct) + '</td><td class="num"><strong>' + (r.ok ? brl(r.price) : '—') + '</strong></td><td class="num">' + (r.ok ? brl(r.unitProfit) : '—') + '</td>' +
        '<td><div class="row-actions"><button class="del" data-del-product="' + p.id + '" aria-label="Excluir"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
    }).join('');
    host.innerHTML = '<div class="table-wrap"><table class="data"><thead><tr><th>Produto</th><th>Custo</th><th>Var%</th><th>Fix%</th><th>Margem%</th><th>Preço</th><th>Lucro/un</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    $$('[data-del-product]', host).forEach(function (b) { b.addEventListener('click', function () { S.remove('products', b.getAttribute('data-del-product')); toast('Removido.'); renderPfList(); }); });
  }

  /* ======================================================================
     FLUXO DE CAIXA
     ====================================================================== */
  var fluxoPeriod = 'month';
  function renderFluxo() {
    var d = data();
    var tx = d.transactions;
    var periodTx = F.filterByPeriod(tx, fluxoPeriod);
    var cf = F.cashFlow(periodTx);
    var series = F.monthlySeries(tx, 6);

    var html = '<div class="grid grid-4" style="margin-bottom:18px;">' +
      kpi('Entradas', brl(cf.income), 'no período', 'fa-arrow-down', 'pos') +
      kpi('Saídas', brl(cf.expense), 'no período', 'fa-arrow-up', 'neg') +
      kpi('Saldo realizado', brl(cf.realized), 'até hoje', 'fa-wallet', cf.realized >= 0 ? 'pos' : 'neg') +
      kpi('Saldo projetado', brl(cf.projected), 'com lançamentos futuros', 'fa-chart-line', '') +
      '</div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-plus"></i> Novo lançamento</div>' +
      '<form id="fxForm" class="inline-form">' +
      '<div class="field"><label for="fxType">Tipo</label><select id="fxType"><option value="in">Entrada (receita)</option><option value="out">Saída (despesa)</option></select></div>' +
      '<div class="field"><label for="fxDesc">Descrição</label><input type="text" id="fxDesc" placeholder="Ex.: Venda de produto"></div>' +
      '<div class="field"><label for="fxCat">Categoria</label><input type="text" id="fxCat" placeholder="Ex.: Vendas" list="catList"><datalist id="catList"><option>Vendas</option><option>Serviços</option><option>Insumos</option><option>Aluguel</option><option>Marketing</option><option>Transporte</option><option>Impostos</option><option>Pessoal</option></datalist></div>' +
      '<div class="field"><label for="fxAmount">Valor (R$)</label><input type="number" id="fxAmount" min="0" step="0.01" placeholder="0,00"></div>' +
      '<div class="field"><label for="fxDate">Data</label><input type="date" id="fxDate" value="' + todayStr() + '"></div>' +
      '<button class="btn btn-primary" type="submit"><i class="fa-solid fa-plus"></i> Adicionar</button>' +
      '</form></div>';

    html += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;">' +
      '<div class="card-title" style="margin:0;"><i class="fa-solid fa-list"></i> Lançamentos</div>' +
      '<div class="tabs" style="margin:0;">' +
      ['day', 'week', 'month', 'year', 'all'].map(function (p) {
        var lbl = { day: 'Hoje', week: 'Semana', month: 'Mês', year: 'Ano', all: 'Tudo' }[p];
        return '<button type="button" data-period="' + p + '" class="' + (fluxoPeriod === p ? 'active' : '') + '">' + lbl + '</button>';
      }).join('') + '</div></div>' +
      '<div id="fxTable"></div></div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-chart-line"></i> Evolução mensal</div><div class="chart-box"><canvas id="chartFluxo" height="280"></canvas></div>' +
      '<div class="legend"><span><i style="background:#1f7a4d"></i> Entradas</span><span><i style="background:#b3261e"></i> Saídas</span><span><i style="background:#d4af37"></i> Saldo</span></div></div>';

    $('#fluxoContent').innerHTML = html;

    $('#fxForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = F.num($('#fxAmount').value);
      if (amount <= 0) { toast('Informe um valor maior que zero.', 'error'); return; }
      S.add('transactions', { type: $('#fxType').value, description: $('#fxDesc').value || 'Lançamento', category: $('#fxCat').value || 'Sem categoria', amount: amount, date: $('#fxDate').value || todayStr() });
      toast('Lançamento adicionado!');
      renderFluxo();
    });
    $$('[data-period]').forEach(function (b) { b.addEventListener('click', function () { fluxoPeriod = b.getAttribute('data-period'); renderFluxo(); }); });

    renderFxTable(periodTx);
    C.bar($('#chartFluxo'), series.map(function (s) { return s.label; }), [
      { name: 'Entradas', color: '#1f7a4d', data: series.map(function (s) { return s.income; }) },
      { name: 'Saídas', color: '#b3261e', data: series.map(function (s) { return s.expense; }) }
    ], { height: 280 });
  }
  function renderFxTable(list) {
    var host = $('#fxTable');
    if (!list.length) { host.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><h3>Nenhum lançamento no período</h3><p>Adicione entradas e saídas acima.</p></div>'; return; }
    var sorted = list.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    var rows = sorted.map(function (t) {
      var isIn = t.type === 'in';
      return '<tr><td>' + fmtDate(t.date) + '</td><td>' + esc(t.description) + '</td><td><span class="badge badge-neutral">' + esc(t.category) + '</span></td>' +
        '<td><span class="badge badge-' + (isIn ? 'in' : 'out') + '">' + (isIn ? 'Entrada' : 'Saída') + '</span></td>' +
        '<td class="num" style="color:' + (isIn ? 'var(--success)' : 'var(--danger)') + '">' + (isIn ? '+' : '−') + ' ' + brl(t.amount) + '</td>' +
        '<td><div class="row-actions"><button class="del" data-del-tx="' + t.id + '" aria-label="Excluir"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
    }).join('');
    host.innerHTML = '<div class="table-wrap"><table class="data"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    $$('[data-del-tx]', host).forEach(function (b) { b.addEventListener('click', function () { S.remove('transactions', b.getAttribute('data-del-tx')); toast('Lançamento removido.'); renderFluxo(); }); });
  }

  /* ======================================================================
     CONTAS A PAGAR / RECEBER
     ====================================================================== */
  function renderContas() {
    var d = data();
    var sum = F.billsSummary(d.bills);
    var html = '<div class="grid grid-4" style="margin-bottom:18px;">' +
      kpi('A pagar (pendente)', brl(sum.payablePending), 'ainda não pago', 'fa-file-invoice', '') +
      kpi('A receber (pendente)', brl(sum.receivablePending), 'ainda não recebido', 'fa-hand-holding-dollar', 'pos') +
      kpi('Vencidas a pagar', brl(sum.overduePayable), sum.overdueCount + ' conta(s) em atraso', 'fa-triangle-exclamation', sum.overduePayable ? 'neg' : '') +
      kpi('Vencidas a receber', brl(sum.overdueReceivable), 'cobrar do cliente', 'fa-clock', '') +
      '</div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-plus"></i> Nova conta</div>' +
      '<form id="blForm" class="inline-form">' +
      '<div class="field"><label for="blType">Tipo</label><select id="blType"><option value="payable">A pagar</option><option value="receivable">A receber</option></select></div>' +
      '<div class="field"><label for="blDesc">Descrição</label><input type="text" id="blDesc" placeholder="Ex.: Fornecedor"></div>' +
      '<div class="field"><label for="blCat">Categoria</label><input type="text" id="blCat" placeholder="Ex.: Insumos"></div>' +
      '<div class="field"><label for="blAmount">Valor (R$)</label><input type="number" id="blAmount" min="0" step="0.01" placeholder="0,00"></div>' +
      '<div class="field"><label for="blDue">Vencimento</label><input type="date" id="blDue" value="' + todayStr() + '"></div>' +
      '<button class="btn btn-primary" type="submit"><i class="fa-solid fa-plus"></i> Adicionar</button></form></div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-list-check"></i> Compromissos</div><div id="blTable"></div></div>';
    $('#contasContent').innerHTML = html;

    $('#blForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = F.num($('#blAmount').value);
      if (amount <= 0) { toast('Informe um valor maior que zero.', 'error'); return; }
      S.add('bills', { type: $('#blType').value, description: $('#blDesc').value || 'Conta', category: $('#blCat').value || 'Geral', amount: amount, dueDate: $('#blDue').value || todayStr(), status: 'pending' });
      toast('Conta adicionada!');
      renderContas();
    });
    renderBlTable();
  }
  function renderBlTable() {
    var d = data();
    var host = $('#blTable');
    if (!d.bills.length) { host.innerHTML = '<div class="empty-state"><i class="fa-solid fa-file-circle-check"></i><h3>Nenhuma conta cadastrada</h3><p>Cadastre contas a pagar e a receber para receber alertas.</p></div>'; return; }
    var sorted = d.bills.slice().sort(function (a, b) { return new Date(a.dueDate) - new Date(b.dueDate); });
    var rows = sorted.map(function (b) {
      var st = F.billStatus(b);
      var stLabel = { pending: 'Pendente', overdue: 'Vencida', paid: 'Pago', received: 'Recebido' }[st];
      var isPayable = b.type === 'payable';
      var action = (st === 'pending' || st === 'overdue') ? '<button data-settle="' + b.id + '" aria-label="Marcar como ' + (isPayable ? 'pago' : 'recebido') + '"><i class="fa-solid fa-check"></i></button>' : '';
      return '<tr><td>' + fmtDate(b.dueDate) + '</td><td>' + esc(b.description) + '</td><td><span class="badge badge-neutral">' + esc(b.category) + '</span></td>' +
        '<td>' + (isPayable ? 'A pagar' : 'A receber') + '</td>' +
        '<td class="num">' + brl(b.amount) + '</td>' +
        '<td><span class="badge badge-' + st + '">' + stLabel + '</span></td>' +
        '<td><div class="row-actions">' + action + '<button class="del" data-del-bill="' + b.id + '" aria-label="Excluir"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
    }).join('');
    host.innerHTML = '<div class="table-wrap"><table class="data"><thead><tr><th>Vencimento</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    $$('[data-settle]', host).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-settle');
        var bill = S.find('bills', id);
        S.update('bills', id, { status: bill.type === 'payable' ? 'paid' : 'received' });
        toast('Conta marcada como ' + (bill.type === 'payable' ? 'paga' : 'recebida') + '.');
        renderContas();
      });
    });
    $$('[data-del-bill]', host).forEach(function (b) { b.addEventListener('click', function () { S.remove('bills', b.getAttribute('data-del-bill')); toast('Conta removida.'); renderContas(); }); });
  }

  /* ======================================================================
     CAPITAL DE GIRO
     ====================================================================== */
  function renderCapital() {
    var d = data();
    var wc = d.workingCapital;
    var assets = (wc.breakdown || []).filter(function (x) { return x.type === 'asset'; });
    var liabs = (wc.breakdown || []).filter(function (x) { return x.type === 'liability'; });
    var assetsTotal = assets.reduce(function (a, x) { return a + F.num(x.amount); }, 0);
    var liabsTotal = liabs.reduce(function (a, x) { return a + F.num(x.amount); }, 0);
    var res = F.workingCapital(assetsTotal, liabsTotal);
    var healthLabel = { saudavel: 'Saudável', atencao: 'Atenção', equilibrio: 'Equilíbrio', risco: 'Risco' }[res.health];
    var healthClass = { saudavel: 'ok', atencao: 'warn', equilibrio: 'warn', risco: 'bad' }[res.health];

    var html = '<div class="grid grid-3" style="margin-bottom:18px;">' +
      kpi('Ativo circulante', brl(assetsTotal), 'recursos de curto prazo', 'fa-arrow-down', 'pos') +
      kpi('Passivo circulante', brl(liabsTotal), 'obrigações de curto prazo', 'fa-arrow-up', 'neg') +
      kpi('Capital de giro líquido', brl(res.cgl), 'ativo − passivo', 'fa-scale-balanced', res.cgl >= 0 ? 'pos' : 'neg') +
      '</div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-heart-pulse"></i> Saúde financeira: ' + healthLabel + '</div>' +
      '<div class="progress ' + healthClass + '" style="margin-bottom:14px;"><span style="width:' + Math.max(5, Math.min(100, (res.cgl / Math.max(1, assetsTotal)) * 100 + 50)) + '%"></span></div>' +
      '<div class="alert alert-' + (res.health === 'risco' ? 'error' : res.health === 'saudavel' ? 'success' : 'warning') + '"><i class="fa-solid fa-circle-info"></i><div>' + res.advice + '</div></div>' +
      '<p style="font-size:.84rem;color:var(--text-soft);margin-top:12px;">Índice de liquidez corrente: <strong>' + (res.ratio === Infinity ? '∞' : res.ratio.toFixed(2)) + '</strong> (ativo ÷ passivo). Acima de 1,5 indica boa folga.</p></div>';

    html += '<div class="grid grid-2" style="margin-top:18px;">' +
      '<div class="card"><div class="card-title"><i class="fa-solid fa-chart-pie"></i> Composição</div><div class="chart-box"><canvas id="chartWC" height="260"></canvas></div>' +
      '<div class="legend"><span><i style="background:#1f7a4d"></i> Ativos</span><span><i style="background:#b3261e"></i> Passivos</span></div></div>' +
      '<div class="card"><div class="card-title"><i class="fa-solid fa-pen-to-square"></i> Editar itens</div>' +
      '<form id="wcForm" class="inline-form" style="margin-bottom:12px;">' +
      '<div class="field"><label for="wcLabel">Item</label><input type="text" id="wcLabel" placeholder="Ex.: Caixa"></div>' +
      '<div class="field"><label for="wcType">Tipo</label><select id="wcType"><option value="asset">Ativo</option><option value="liability">Passivo</option></select></div>' +
      '<div class="field"><label for="wcAmount">Valor (R$)</label><input type="number" id="wcAmount" step="0.01" placeholder="0,00"></div>' +
      '<button class="btn btn-primary" type="submit"><i class="fa-solid fa-plus"></i> Adicionar</button></form>' +
      '<div id="wcList"></div></div></div>';

    $('#capitalContent').innerHTML = html;

    $('#wcForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = F.num($('#wcAmount').value);
      if (amount <= 0) { toast('Informe um valor maior que zero.', 'error'); return; }
      var wc2 = data().workingCapital;
      wc2.breakdown = wc2.breakdown || [];
      wc2.breakdown.push({ id: uid('wc'), label: $('#wcLabel').value || 'Item', type: $('#wcType').value, amount: amount });
      commit(); toast('Item adicionado.'); renderCapital();
    });
    renderWcList();
    C.donut($('#chartWC'), [
      { label: 'Ativo', value: assetsTotal, color: '#1f7a4d' },
      { label: 'Passivo', value: liabsTotal, color: '#b3261e' }
    ], { height: 260, centerLabel: brl(res.cgl), centerSub: 'capital de giro' });
  }
  function renderWcList() {
    var host = $('#wcList'); if (!host) return;
    var items = data().workingCapital.breakdown || [];
    if (!items.length) { host.innerHTML = '<p style="color:var(--text-soft);font-size:.86rem;">Nenhum item. Adicione ativos e passivos.</p>'; return; }
    host.innerHTML = '<div class="table-wrap"><table class="data"><thead><tr><th>Item</th><th>Tipo</th><th>Valor</th><th></th></tr></thead><tbody>' +
      items.map(function (x) {
        return '<tr><td>' + esc(x.label) + '</td><td><span class="badge badge-' + (x.type === 'asset' ? 'in' : 'out') + '">' + (x.type === 'asset' ? 'Ativo' : 'Passivo') + '</span></td><td class="num">' + brl(x.amount) + '</td>' +
          '<td><div class="row-actions"><button class="del" data-del-wc="' + x.id + '" aria-label="Excluir"><i class="fa-solid fa-trash"></i></button></div></td></tr>';
      }).join('') + '</tbody></table></div>';
    $$('[data-del-wc]', host).forEach(function (b) {
      b.addEventListener('click', function () {
        var wc = data().workingCapital;
        wc.breakdown = wc.breakdown.filter(function (x) { return x.id !== b.getAttribute('data-del-wc'); });
        commit(); renderCapital();
      });
    });
  }

  /* ======================================================================
     TICKET MÉDIO
     ====================================================================== */
  function renderTicket() {
    var d = data();
    var sales = d.transactions.filter(function (t) { return t.type === 'in'; });
    var revenue = sales.reduce(function (a, t) { return a + F.num(t.amount); }, 0);
    var count = sales.length;
    var tm = F.ticketMedio(revenue, count || 1);
    var series = F.monthlySeries(d.transactions, 6);
    var evo = F.ticketEvolution(series.map(function (s) { return { label: s.label, revenue: s.income, sales: Math.max(1, Math.round(s.income / Math.max(1, revenue / Math.max(1, count)))) }; }));

    var html = '<div class="grid grid-3" style="margin-bottom:18px;">' +
      kpi('Ticket médio', brl(tm.ok ? tm.ticket : 0), 'faturamento ÷ vendas', 'fa-receipt', '') +
      kpi('Faturamento', brl(revenue), 'entradas registradas', 'fa-arrow-trend-up', 'pos') +
      kpi('Vendas', String(count), 'lançamentos de entrada', 'fa-cart-shopping', '') +
      '</div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-calculator"></i> Simular ticket médio</div>' +
      '<form id="tmForm" class="inline-form">' +
      '<div class="field"><label for="tmRev">Faturamento (R$)</label><input type="number" id="tmRev" step="0.01" value="' + revenue + '"></div>' +
      '<div class="field"><label for="tmSales">Quantidade de vendas</label><input type="number" id="tmSales" min="1" step="1" value="' + (count || 1) + '"></div>' +
      '<button class="btn btn-primary" type="submit"><i class="fa-solid fa-equals"></i> Calcular</button></form>' +
      '<div id="tmResult" style="margin-top:16px;"></div></div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-chart-line"></i> Evolução do ticket médio (6 meses)</div>' +
      '<div class="chart-box"><canvas id="chartTicket" height="260"></canvas></div>' +
      '<p style="font-size:.84rem;color:var(--text-soft);margin-top:10px;">Variação no período: <strong style="color:' + (evo.variation >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + (evo.variation >= 0 ? '+' : '') + ratio(evo.variation) + '</strong>. Aumentar o ticket médio pode elevar o faturamento sem precisar de mais clientes.</p></div>';

    $('#ticketContent').innerHTML = html;

    function calc() {
      var r = F.ticketMedio(F.num($('#tmRev').value), F.num($('#tmSales').value));
      if (!r.ok) { $('#tmResult').innerHTML = '<div class="alert alert-error"><i class="fa-solid fa-triangle-exclamation"></i><div>' + r.error + '</div></div>'; return; }
      $('#tmResult').innerHTML = '<div class="result-grid"><div class="result-box highlight"><span>Ticket médio</span><b>' + brl(r.ticket) + '</b><small>por venda</small></div>' +
        '<div class="result-box"><span>Faturamento</span><b>' + brl(r.revenue) + '</b></div><div class="result-box"><span>Vendas</span><b>' + r.salesCount + '</b></div></div>';
    }
    $('#tmForm').addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    calc();
    C.line($('#chartTicket'), evo.series.map(function (s) { return s.label; }), [{ name: 'Ticket', color: '#d4af37', data: evo.series.map(function (s) { return s.ticket; }) }], { height: 260 });
  }

  /* ======================================================================
     MARGEM DE CONTRIBUIÇÃO
     ====================================================================== */
  function renderContribuicao() {
    var d = data();
    var sales = d.transactions.filter(function (t) { return t.type === 'in'; });
    var revenue = sales.reduce(function (a, t) { return a + F.num(t.amount); }, 0);
    var varCosts = d.transactions.filter(function (t) { return t.type === 'out' && /insumo|variáv|comiss|taxa|matéria|mercadoria/i.test(t.category + ' ' + t.description); }).reduce(function (a, t) { return a + F.num(t.amount); }, 0);
    if (varCosts === 0) varCosts = Math.round(revenue * 0.35);

    var html = '<div class="card"><div class="card-title"><i class="fa-solid fa-chart-pie"></i> Calcular margem de contribuição</div>' +
      '<p style="font-size:.86rem;color:var(--text-soft);">MC = Receita − (custos variáveis + despesas variáveis). Mostra quanto sobra de cada venda para cobrir custos fixos e gerar lucro.</p>' +
      '<form id="mcForm" class="inline-form">' +
      '<div class="field"><label for="mcRev">Receita total (R$)</label><input type="number" id="mcRev" step="0.01" value="' + revenue + '"></div>' +
      '<div class="field"><label for="mcVar">Custos + despesas variáveis (R$)</label><input type="number" id="mcVar" step="0.01" value="' + varCosts + '"></div>' +
      '<button class="btn btn-primary" type="submit"><i class="fa-solid fa-equals"></i> Calcular</button></form>' +
      '<div id="mcResult" style="margin-top:16px;"></div></div>';

    html += '<div class="grid grid-2" style="margin-top:18px;">' +
      '<div class="card"><div class="card-title"><i class="fa-solid fa-chart-simple"></i> Receita x Custos variáveis</div><div class="chart-box"><canvas id="chartMC" height="250"></canvas></div></div>' +
      '<div class="card"><div class="card-title"><i class="fa-solid fa-lightbulb"></i> Como usar</div>' +
      '<ul class="value-list" style="margin:0;"><li><i class="fa-solid fa-check"></i><span>Quanto maior a MC, mais rápido o negócio cobre os custos fixos.</span></li>' +
      '<li><i class="fa-solid fa-check"></i><span>MC negativa significa que cada venda aumenta o prejuízo.</span></li>' +
      '<li><i class="fa-solid fa-check"></i><span>Use a MC para decidir quais produtos priorizar e onde cortar custos variáveis.</span></li></ul></div></div>';

    $('#contribuicaoContent').innerHTML = html;

    function calc() {
      var r = F.contributionMargin(F.num($('#mcRev').value), F.num($('#mcVar').value));
      if (!r.ok) { $('#mcResult').innerHTML = '<div class="alert alert-error"><i class="fa-solid fa-triangle-exclamation"></i><div>Informe uma receita maior que zero.</div></div>'; return; }
      $('#mcResult').innerHTML = '<div class="result-grid">' +
        '<div class="result-box highlight"><span>Margem de contribuição</span><b>' + brl(r.margin) + '</b><small>' + ratio(r.ratio) + ' da receita</small></div>' +
        '<div class="result-box"><span>Receita</span><b>' + brl(r.revenue) + '</b></div>' +
        '<div class="result-box"><span>Custos variáveis</span><b>' + brl(r.variableCosts) + '</b></div>' +
        '<div class="result-box"><span>Percentual</span><b>' + ratio(r.ratio) + '</b><small>índice de MC</small></div></div>' +
        '<div class="alert alert-' + (r.ratio >= 0.2 ? 'success' : 'warning') + '" style="margin-top:14px;"><i class="fa-solid fa-circle-info"></i><div>' + r.advice + '</div></div>';
      C.bar($('#chartMC'), ['Receita', 'Custos var.', 'Margem'], [{ name: 'Valores', color: '#d4af37', data: [r.revenue, r.variableCosts, r.margin] }], { height: 250 });
    }
    $('#mcForm').addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    calc();
  }

  /* ======================================================================
     MARGEM DE LUCRO
     ====================================================================== */
  function renderMargem() {
    var d = data();
    var revenue = d.transactions.filter(function (t) { return t.type === 'in'; }).reduce(function (a, t) { return a + F.num(t.amount); }, 0);
    var expenses = d.transactions.filter(function (t) { return t.type === 'out'; }).reduce(function (a, t) { return a + F.num(t.amount); }, 0);

    var html = '<div class="card"><div class="card-title"><i class="fa-solid fa-percent"></i> Detalhamento da margem de lucro</div>' +
      '<form id="mlForm" class="form-row">' +
      field('mlRev', 'Receita total (R$)', 'number', '0,00', '0.01', revenue) +
      field('mlCogs', 'Custo das mercadorias/serviços (R$)', 'number', '0,00', '0.01', Math.round(revenue * 0.4)) +
      field('mlOp', 'Despesas operacionais (R$)', 'number', '0,00', '0.01', Math.round(expenses * 0.6)) +
      field('mlTax', 'Impostos e taxas (R$)', 'number', '0,00', '0.01', Math.round(revenue * 0.06)) +
      '</form>' +
      '<div style="margin-top:16px;"><button class="btn btn-primary" id="mlCalc" type="button"><i class="fa-solid fa-equals"></i> Calcular</button></div>' +
      '<div id="mlResult" style="margin-top:16px;"></div></div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-chart-column"></i> Da receita ao lucro líquido</div><div class="chart-box"><canvas id="chartML" height="270"></canvas></div></div>';

    $('#margemContent').innerHTML = html;

    function calc() {
      var r = F.profitMargin({ revenue: F.num($('#mlRev').value), cogs: F.num($('#mlCogs').value), opExpenses: F.num($('#mlOp').value), taxes: F.num($('#mlTax').value) });
      if (!r.ok) { $('#mlResult').innerHTML = '<div class="alert alert-error"><i class="fa-solid fa-triangle-exclamation"></i><div>Informe uma receita maior que zero.</div></div>'; return; }
      $('#mlResult').innerHTML = '<div class="result-grid">' +
        '<div class="result-box"><span>Lucro bruto</span><b>' + brl(r.gross) + '</b><small>margem ' + ratio(r.grossMargin) + '</small></div>' +
        '<div class="result-box"><span>Resultado operacional</span><b>' + brl(r.operating) + '</b><small>margem ' + ratio(r.operatingMargin) + '</small></div>' +
        '<div class="result-box highlight"><span>Lucro líquido</span><b>' + brl(r.net) + '</b><small>margem ' + ratio(r.netMargin) + '</small></div></div>' +
        '<div class="alert alert-info" style="margin-top:14px;"><i class="fa-solid fa-circle-info"></i><div><strong>Leitura:</strong> o lucro bruto desconta apenas o custo dos produtos/serviços; o operacional desconta também as despesas do negócio; o líquido desconta ainda os impostos.</div></div>';
      C.bar($('#chartML'), ['Receita', 'Lucro bruto', 'Result. oper.', 'Lucro líquido'],
        [{ name: 'R$', color: '#581124', data: [r.revenue, r.gross, r.operating, r.net] }], { height: 270 });
    }
    $('#mlCalc').addEventListener('click', calc);
    calc();
  }

  /* ======================================================================
     PONTO DE EQUILÍBRIO
     ====================================================================== */
  function renderEquilibrio() {
    var html = '<div class="card"><div class="card-title"><i class="fa-solid fa-arrows-to-dot"></i> Calcular ponto de equilíbrio</div>' +
      '<form id="peForm" class="form-row">' +
      field('peFixed', 'Custos e despesas fixas (R$)', 'number', 'Ex.: 3000', '0.01', 3000) +
      field('pePrice', 'Preço de venda unitário (R$)', 'number', 'Ex.: 20', '0.01', 20) +
      field('peVar', 'Custo variável unitário (R$)', 'number', 'Ex.: 8', '0.01', 8) +
      '</form><div style="margin-top:16px;"><button class="btn btn-primary" id="peCalc" type="button"><i class="fa-solid fa-equals"></i> Calcular</button></div>' +
      '<div id="peResult" style="margin-top:16px;"></div></div>';

    html += '<div class="card"><div class="card-title"><i class="fa-solid fa-chart-line"></i> Faturamento x ponto de equilíbrio</div><div class="chart-box"><canvas id="chartPE" height="270"></canvas></div></div>';
    $('#equilibrioContent').innerHTML = html;

    function calc() {
      var r = F.breakEven({ fixedCosts: F.num($('#peFixed').value), price: F.num($('#pePrice').value), varCostUnit: F.num($('#peVar').value) });
      if (!r.ok) { $('#peResult').innerHTML = '<div class="alert alert-error"><i class="fa-solid fa-triangle-exclamation"></i><div>' + r.error + '</div></div>'; return; }
      $('#peResult').innerHTML = '<div class="result-grid">' +
        '<div class="result-box highlight"><span>Ponto de equilíbrio (R$)</span><b>' + brl(r.breakEvenRevenue) + '</b><small>faturamento mínimo</small></div>' +
        '<div class="result-box highlight"><span>Ponto de equilíbrio (un.)</span><b>' + r.breakEvenUnits + '</b><small>unidades mínimas</small></div>' +
        '<div class="result-box"><span>Margem de contribuição unit.</span><b>' + brl(r.mcUnit) + '</b><small>preço − custo variável</small></div>' +
        '<div class="result-box"><span>Índice de MC</span><b>' + ratio(r.mcRatio) + '</b><small>MC ÷ preço</small></div></div>' +
        '<div class="alert alert-info" style="margin-top:14px;"><i class="fa-solid fa-circle-info"></i><div>Você precisa vender pelo menos <strong>' + r.breakEvenUnits + ' unidades</strong> (ou faturar <strong>' + brl(r.breakEvenRevenue) + '</strong>) para cobrir todos os custos. A partir daí, cada venda gera lucro.</div></div>';
      C.bar($('#chartPE'), ['Custos fixos', 'Ponto de equilíbrio', 'MC unitária'], [{ name: 'R$', color: '#d4af37', data: [r.fixedCosts, r.breakEvenRevenue, r.mcUnit] }], { height: 270 });
    }
    $('#peCalc').addEventListener('click', calc);
    calc();
  }

  /* ======================================================================
     DIAGNÓSTICO
     ====================================================================== */
  function renderDiagnostico() {
    var d = data();
    var saved = d.diagnosis;
    var html = '<div class="card"><div class="card-title"><i class="fa-solid fa-stethoscope"></i> Questionário de maturidade</div>' +
      '<p style="font-size:.86rem;color:var(--text-soft);">Responda com sinceridade. Ao final, você receberá um parecer e um plano de ação.</p>' +
      '<form id="dgForm">' + F.DIAGNOSIS_QUESTIONS.map(function (q) {
        return '<div class="quiz-q"><p>' + q.text + '</p><div class="opt-group">' +
          ['yes', 'partial', 'no'].map(function (v) {
            var lbl = { yes: 'Sim', partial: 'Em parte', no: 'Não' }[v];
            return '<label><input type="radio" name="' + q.id + '" value="' + v + '"> ' + lbl + '</label>';
          }).join('') + '</div></div>';
      }).join('') +
      '<div style="margin-top:18px;"><button class="btn btn-primary" type="submit"><i class="fa-solid fa-clipboard-check"></i> Gerar diagnóstico</button></div></form>' +
      '<div id="dgResult" style="margin-top:18px;"></div></div>';
    $('#diagnosticoContent').innerHTML = html;

    if (saved) showDiagnosis(saved);

    $('#dgForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var answers = {};
      var missing = false;
      F.DIAGNOSIS_QUESTIONS.forEach(function (q) {
        var sel = document.querySelector('input[name="' + q.id + '"]:checked');
        if (!sel) missing = true; else answers[q.id] = sel.value;
      });
      if (missing) { toast('Responda todas as perguntas para gerar o diagnóstico.', 'error'); return; }
      var res = F.diagnosis(answers);
      res.date = Date.now();
      var d2 = data(); d2.diagnosis = res; commit();
      showDiagnosis(res);
    });
  }
  function showDiagnosis(res) {
    var host = $('#dgResult');
    if (!host) return;
    var cls = res.score >= 60 ? 'success' : res.score >= 40 ? 'warning' : 'error';
    host.innerHTML = '<div class="alert alert-' + cls + '"><i class="fa-solid fa-award"></i><div><strong>Nível: ' + res.level + ' — ' + res.score + '/100</strong>' + res.summary + '</div></div>' +
      '<div class="progress ' + (res.score >= 60 ? 'ok' : res.score >= 40 ? 'warn' : 'bad') + '" style="margin:14px 0;"><span style="width:' + res.score + '%"></span></div>' +
      (res.plan.length ? '<h3 style="font-size:1rem;color:var(--burgundy);">Plano de ação</h3><ul class="value-list">' +
        res.plan.map(function (p) { return '<li><i class="fa-solid ' + (p.priority === 'Alta' ? 'fa-circle-exclamation' : 'fa-circle-half-stroke') + '"></i><span><strong>[' + p.priority + ']</strong> ' + p.action + '</span></li>'; }).join('') + '</ul>' :
        '<p style="color:var(--success);font-weight:600;">Parabéns! Você já cumpre todas as boas práticas avaliadas.</p>') +
      '<button class="btn btn-ghost btn-sm" style="margin-top:12px;" type="button" id="dgPdf"><i class="fa-solid fa-file-pdf"></i> Exportar diagnóstico em PDF</button>';
    var pdfBtn = $('#dgPdf');
    if (pdfBtn) pdfBtn.addEventListener('click', function () {
      exportPDF('Diagnóstico Financeiro', '<h2>Resultado</h2><p><strong>Nível:</strong> ' + res.level + ' (' + res.score + '/100)</p><p>' + res.summary + '</p>' +
        '<h2>Plano de ação</h2><ul>' + res.plan.map(function (p) { return '<li><strong>[' + p.priority + ']</strong> ' + p.action + '</li>'; }).join('') + '</ul>');
    });
  }

  /* ======================================================================
     METAS
     ====================================================================== */
  function renderMetas() {
    var d = data();
    var html = '<div class="card"><div class="card-title"><i class="fa-solid fa-plus"></i> Nova meta</div>' +
      '<form id="glForm" class="inline-form">' +
      '<div class="field"><label for="glTitle">Meta</label><input type="text" id="glTitle" placeholder="Ex.: Faturamento de R$ 15.000"></div>' +
      '<div class="field"><label for="glTarget">Valor alvo (R$)</label><input type="number" id="glTarget" step="0.01" placeholder="0,00"></div>' +
      '<div class="field"><label for="glCurrent">Valor atual (R$)</label><input type="number" id="glCurrent" step="0.01" placeholder="0,00"></div>' +
      '<div class="field"><label for="glDeadline">Prazo</label><input type="date" id="glDeadline"></div>' +
      '<button class="btn btn-primary" type="submit"><i class="fa-solid fa-plus"></i> Adicionar</button></form></div>' +
      '<div id="glList" style="margin-top:18px;"></div>';
    $('#metasContent').innerHTML = html;

    $('#glForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var target = F.num($('#glTarget').value);
      if (target <= 0) { toast('Informe um valor alvo maior que zero.', 'error'); return; }
      S.add('goals', { title: $('#glTitle').value || 'Meta', target: target, current: F.num($('#glCurrent').value), deadline: $('#glDeadline').value || '' });
      toast('Meta criada!'); renderMetas();
    });
    renderGoals();
  }
  function renderGoals() {
    var host = $('#glList'); if (!host) return;
    var goals = data().goals;
    if (!goals.length) { host.innerHTML = '<div class="empty-state"><i class="fa-solid fa-bullseye"></i><h3>Nenhuma meta definida</h3><p>Defina objetivos para acompanhar seu progresso.</p></div>'; return; }
    host.innerHTML = '<div class="grid grid-2">' + goals.map(function (g) {
      var p = F.goalProgress(g);
      var cls = p.pct >= 100 ? 'ok' : (p.onTrack === false ? 'bad' : 'warn');
      return '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">' +
        '<div><strong style="color:var(--text);">' + esc(g.title) + '</strong>' +
        '<div style="font-size:.8rem;color:var(--text-soft);margin-top:4px;">' + brl(g.current) + ' de ' + brl(g.target) + (g.deadline ? ' · prazo ' + fmtDate(g.deadline) : '') + '</div></div>' +
        '<div class="row-actions"><button data-edit-goal="' + g.id + '" aria-label="Atualizar"><i class="fa-solid fa-pen"></i></button><button class="del" data-del-goal="' + g.id + '" aria-label="Excluir"><i class="fa-solid fa-trash"></i></button></div></div>' +
        '<div class="progress ' + cls + '" style="margin:14px 0 8px;"><span style="width:' + p.pct.toFixed(0) + '%"></span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--text-soft);"><span>' + p.pct.toFixed(0) + '% concluído</span><span>Faltam ' + brl(p.remaining) + '</span></div>' +
        (p.daysLeft != null ? '<div style="font-size:.78rem;margin-top:6px;color:' + (p.onTrack === false ? 'var(--danger)' : 'var(--success)') + ';">' + (p.daysLeft >= 0 ? p.daysLeft + ' dia(s) restantes' : 'Prazo encerrado') + (p.onTrack === false ? ' · ritmo abaixo do esperado' : ' · no ritmo certo') + '</div>' : '') +
        '</div>';
    }).join('') + '</div>';
    $$('[data-del-goal]', host).forEach(function (b) { b.addEventListener('click', function () { S.remove('goals', b.getAttribute('data-del-goal')); toast('Meta removida.'); renderMetas(); }); });
    $$('[data-edit-goal]', host).forEach(function (b) {
      b.addEventListener('click', function () {
        var g = S.find('goals', b.getAttribute('data-edit-goal'));
        openModal('Atualizar progresso', esc(g.title),
          '<form id="goalEdit" class="form-stack"><div class="field"><label for="geCur">Valor atual (R$)</label><input type="number" id="geCur" step="0.01" value="' + g.current + '"></div>' +
          '<div class="field"><label for="geTarget">Valor alvo (R$)</label><input type="number" id="geTarget" step="0.01" value="' + g.target + '"></div>' +
          '<button class="btn btn-primary" type="submit">Salvar</button></form>',
          function (body) {
            $('#goalEdit', body).addEventListener('submit', function (e) {
              e.preventDefault();
              S.update('goals', g.id, { current: F.num($('#geCur').value), target: F.num($('#geTarget').value) });
              closeModal(); toast('Meta atualizada.'); renderMetas();
            });
          });
      });
    });
  }

  /* ======================================================================
     SIMULADOR DE CENÁRIOS
     ====================================================================== */
  function renderSimulador() {
    var d = data();
    var s = d.scenarios || { price: 20, varCost: 8, fixedCost: 3000, volume: 500 };
    var html = '<div class="card"><div class="card-title"><i class="fa-solid fa-sliders"></i> Cenário base</div>' +
      '<form id="scForm" class="form-row">' +
      field('scPrice', 'Preço de venda (R$)', 'number', '20', '0.01', s.price) +
      field('scVar', 'Custo variável unitário (R$)', 'number', '8', '0.01', s.varCost) +
      field('scFixed', 'Custos fixos totais (R$)', 'number', '3000', '0.01', s.fixedCost) +
      field('scVolume', 'Volume de vendas (un.)', 'number', '500', '1', s.volume) +
      '</form><div style="margin-top:16px;"><button class="btn btn-primary" id="scCalc" type="button"><i class="fa-solid fa-rotate"></i> Simular cenários</button></div></div>' +
      '<div id="scResult" style="margin-top:18px;"></div>';
    $('#simuladorContent').innerHTML = html;

    function calc() {
      var base = { price: F.num($('#scPrice').value), varCost: F.num($('#scVar').value), fixedCost: F.num($('#scFixed').value), volume: F.num($('#scVolume').value) };
      var d2 = data(); d2.scenarios = base; commit();
      var sim = F.simulate(base);
      var names = { conservador: 'Conservador', base: 'Base', otimista: 'Otimista' };
      var colors = { conservador: 'var(--danger)', base: 'var(--burgundy)', otimista: 'var(--success)' };
      var desc = {
        conservador: 'Preço −5%, custo variável +8%, custos fixos +5%, volume −15%.',
        base: 'Mantém os valores informados.',
        otimista: 'Preço +5%, custo variável −3%, volume +20%.'
      };
      $('#scResult').innerHTML = '<div class="grid grid-3">' + ['conservador', 'base', 'otimista'].map(function (k) {
        var c = sim[k];
        return '<div class="card"><div class="card-title" style="color:' + colors[k] + ';"><i class="fa-solid fa-circle"></i> ' + names[k] + '</div>' +
          '<p style="font-size:.78rem;color:var(--text-soft);min-height:44px;">' + desc[k] + '</p>' +
          '<div class="mini-row" style="border-color:var(--border);"><span style="color:var(--text-soft);">Faturamento</span><b style="color:var(--text);">' + brl(c.revenue) + '</b></div>' +
          '<div class="mini-row" style="border-color:var(--border);"><span style="color:var(--text-soft);">Custos variáveis</span><b style="color:var(--text);">' + brl(c.variable) + '</b></div>' +
          '<div class="mini-row" style="border-color:var(--border);"><span style="color:var(--text-soft);">Custos fixos</span><b style="color:var(--text);">' + brl(c.fixedCost) + '</b></div>' +
          '<div class="mini-total" style="background:var(--gold-soft);"><span style="color:var(--text);">Lucro</span><b style="color:' + (c.profit >= 0 ? 'var(--success)' : 'var(--danger)') + ';">' + brl(c.profit) + '</b></div>' +
          '<div style="font-size:.8rem;color:var(--text-soft);margin-top:8px;">Margem: ' + ratio(c.margin) + '</div></div>';
      }).join('') + '</div>' +
        '<div class="card" style="margin-top:18px;"><div class="card-title"><i class="fa-solid fa-chart-column"></i> Comparativo de lucro</div><div class="chart-box"><canvas id="chartSc" height="260"></canvas></div></div>';
      C.bar($('#chartSc'), ['Conservador', 'Base', 'Otimista'], [{ name: 'Lucro', color: '#d4af37', data: [sim.conservador.profit, sim.base.profit, sim.otimista.profit] }], { height: 260 });
    }
    $('#scCalc').addEventListener('click', calc);
    calc();
  }

  /* ======================================================================
     RELATÓRIOS
     ====================================================================== */
  var repPeriod = 'month';
  function renderRelatorios() {
    var d = data();
    var html = '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">' +
      '<div class="card-title" style="margin:0;"><i class="fa-solid fa-file-lines"></i> Relatório</div>' +
      '<div class="tabs" style="margin:0;">' +
      ['month', 'year', 'all'].map(function (p) {
        var lbl = { month: 'Mensal', year: 'Anual', all: 'Completo' }[p];
        return '<button type="button" data-rep="' + p + '" class="' + (repPeriod === p ? 'active' : '') + '">' + lbl + '</button>';
      }).join('') + '</div></div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;margin:16px 0;">' +
      '<button class="btn btn-primary" id="repCsv"><i class="fa-solid fa-file-csv"></i> Exportar CSV</button>' +
      '<button class="btn btn-secondary" id="repPdf"><i class="fa-solid fa-file-pdf"></i> Exportar PDF</button>' +
      '<button class="btn btn-ghost" id="repPrint"><i class="fa-solid fa-print"></i> Imprimir</button></div>' +
      '<div id="repBody"></div></div>';
    $('#relatoriosContent').innerHTML = html;

    $$('[data-rep]').forEach(function (b) { b.addEventListener('click', function () { repPeriod = b.getAttribute('data-rep'); renderRelatorios(); }); });

    var tx = F.filterByPeriod(d.transactions, repPeriod);
    var cf = F.cashFlow(tx);
    var periodLabel = { month: 'Este mês', year: 'Este ano', all: 'Todo o período' }[repPeriod];

    $('#repBody').innerHTML = '<h3 style="font-size:1rem;color:var(--burgundy);">Resumo — ' + periodLabel + '</h3>' +
      '<div class="grid grid-4" style="margin:12px 0 18px;">' +
      kpi('Entradas', brl(cf.income), '', 'fa-arrow-down', 'pos') +
      kpi('Saídas', brl(cf.expense), '', 'fa-arrow-up', 'neg') +
      kpi('Resultado', brl(cf.net), '', 'fa-sack-dollar', cf.net >= 0 ? 'pos' : 'neg') +
      kpi('Lançamentos', String(tx.length), '', 'fa-list', '') + '</div>' +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th></tr></thead><tbody>' +
      (tx.length ? tx.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).map(function (t) {
        return '<tr><td>' + fmtDate(t.date) + '</td><td>' + esc(t.description) + '</td><td>' + esc(t.category) + '</td><td>' + (t.type === 'in' ? 'Entrada' : 'Saída') + '</td><td class="num">' + brl(t.amount) + '</td></tr>';
      }).join('') : '<tr><td colspan="5" class="empty">Nenhum lançamento no período.</td></tr>') + '</tbody></table></div>';

    $('#repCsv').addEventListener('click', function () {
      var rows = tx.map(function (t) { return { Data: t.date, Descricao: t.description, Categoria: t.category, Tipo: t.type === 'in' ? 'Entrada' : 'Saida', Valor: F.num(t.amount).toFixed(2).replace('.', ',') }; });
      if (!rows.length) { toast('Não há dados para exportar.', 'error'); return; }
      S.download('resoluta-relatorio-' + repPeriod + '.csv', S.toCSV(rows));
      toast('CSV exportado!');
    });
    $('#repPdf').addEventListener('click', function () { exportPDF('Relatório Financeiro — ' + periodLabel, buildRepHtml(tx, cf, periodLabel)); });
    $('#repPrint').addEventListener('click', function () { window.print(); });
  }
  function buildRepHtml(tx, cf, label) {
    return '<h2>Resumo — ' + label + '</h2>' +
      '<div class="kpi"><span>Entradas</span><b>' + brl(cf.income) + '</b></div>' +
      '<div class="kpi"><span>Saídas</span><b>' + brl(cf.expense) + '</b></div>' +
      '<div class="kpi"><span>Resultado</span><b>' + brl(cf.net) + '</b></div>' +
      '<h2>Lançamentos</h2><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th></tr></thead><tbody>' +
      tx.map(function (t) { return '<tr><td>' + fmtDate(t.date) + '</td><td>' + esc(t.description) + '</td><td>' + esc(t.category) + '</td><td>' + (t.type === 'in' ? 'Entrada' : 'Saída') + '</td><td>' + brl(t.amount) + '</td></tr>'; }).join('') +
      '</tbody></table>';
  }

  /* ======================================================================
     ASSISTENTE DE IA
     ====================================================================== */
  var KB = [
    { k: ['markup', 'preço', 'precificar', 'precificação', 'quanto cobrar', 'margem de venda'], a: 'O <strong>markup</strong> é o índice que você aplica sobre o custo para chegar ao preço de venda. A fórmula é: <strong>Markup Divisor = 1 − (despesas variáveis % + despesas fixas % + margem desejada %)</strong> e <strong>Preço = Custo ÷ Markup Divisor</strong>. Exemplo: custo R$ 12, com 8% variáveis, 12% fixas e 20% de margem → divisor 0,60 → preço R$ 20,00. Use a ferramenta "Calculadora de Markup" para calcular automaticamente.' },
    { k: ['fluxo de caixa', 'caixa', 'saldo', 'entrada', 'saída'], a: 'O <strong>fluxo de caixa</strong> mostra todo o dinheiro que entra e sai. Registre cada lançamento com data, categoria e valor. Acompanhe o <strong>saldo realizado</strong> (o que já aconteceu) e o <strong>saldo projetado</strong> (incluindo lançamentos futuros). Na Resoluta Finance, use o módulo "Fluxo de Caixa".' },
    { k: ['ticket médio', 'ticket'], a: 'O <strong>ticket médio</strong> é o valor médio gasto por cliente: <strong>Faturamento ÷ Quantidade de vendas</strong>. Aumentá-lo (por meio de combos, upsell ou serviços adicionais) eleva o faturamento sem precisar de mais clientes.' },
    { k: ['margem de contribuição', 'contribuição'], a: 'A <strong>margem de contribuição</strong> é o que sobra da venda após descontar os custos e despesas variáveis: <strong>Receita − (custos variáveis + despesas variáveis)</strong>. Ela é o que "contribui" para pagar os custos fixos e gerar lucro. Se for negativa, cada venda aumenta o prejuízo.' },
    { k: ['ponto de equilíbrio', 'break', 'equilíbrio', 'quanto vender'], a: 'O <strong>ponto de equilíbrio</strong> é quanto você precisa vender para cobrir todos os custos: <strong>PE (R$) = Custos fixos ÷ Índice de margem de contribuição</strong>. Exemplo: custos fixos de R$ 3.000 e índice de MC de 60% → você precisa faturar R$ 5.000 para não ter prejuízo.' },
    { k: ['capital de giro', 'cgl', 'giro'], a: 'O <strong>capital de giro líquido</strong> é <strong>Ativo Circulante − Passivo Circulante</strong>. Positivo significa que você tem recursos de curto prazo para honrar obrigações. Negativo é sinal de alerta: priorize renegociar prazos, reduzir despesas e acelerar recebimentos.' },
    { k: ['margem de lucro', 'lucro', 'lucro líquido', 'lucro bruto'], a: 'A <strong>margem de lucro</strong> pode ser vista em três níveis: <strong>lucro bruto</strong> (receita − custo dos produtos), <strong>resultado operacional</strong> (bruto − despesas do negócio) e <strong>lucro líquido</strong> (operacional − impostos). A margem é o lucro dividido pela receita.' },
    { k: ['diagnóstico', 'saúde', 'maturidade'], a: 'O <strong>Diagnóstico Financeiro</strong> avalia 10 práticas de gestão e gera um plano de ação com prioridades. É um ótimo ponto de partida para saber por onde começar.' },
    { k: ['meta', 'planejamento', 'objetivo'], a: 'Defina <strong>metas</strong> mensuráveis (ex.: faturar R$ 15.000) e acompanhe o progresso percentual. O módulo "Planejamento e Metas" mostra quanto falta e se você está no ritmo certo.' },
    { k: ['conta', 'pagar', 'receber', 'vencimento', 'boleto'], a: 'No módulo <strong>Contas a Pagar e Receber</strong> você cadastra compromissos com data de vencimento. O sistema sinaliza pendências e atrasos para você não perder prazos.' },
    { k: ['plano', 'preço do plano', 'assinatura', 'quanto custa'], a: 'Temos o <strong>Free</strong> (gratuito), o <strong>Pro PF</strong> (R$ 19,90/mês), o <strong>Pro PJ</strong> (R$ 29,90/mês) e o <strong>Premium</strong> (R$ 49,90/mês, em breve com IA). Veja os detalhes na seção "Planos" da página inicial.' },
    { k: ['segurança', 'senha', 'lgpd', 'privacidade', 'dados'], a: 'Sua senha é protegida com <strong>hashing (PBKDF2/bcrypt)</strong> e seus dados ficam isolados por usuário. Após 3 tentativas incorretas, a conta é bloqueada temporariamente. Consulte nossa Política de Privacidade (LGPD) no rodapé.' },
    { k: ['acessibilidade', 'libras', 'voz', 'contraste', 'fonte'], a: 'A plataforma é acessível: widget <strong>VLibras</strong>, leitura em voz alta, temas claro/escuro/alto contraste, aumento de fonte, navegação por teclado e suporte a leitores de tela. Use o botão de acessibilidade (canto inferior direito).' },
    { k: ['simulador', 'cenário', 'cenarios', 'projeção'], a: 'O <strong>Simulador de Cenários</strong> compara três situações — Conservador, Base e Otimista — variando preço, custo variável, custos fixos e volume. Assim você entende os riscos antes de decidir.' }
  ];

  function renderIA() {
    var html = '<div class="grid grid-2" style="align-items:start;">' +
      '<div class="chat"><div class="chat-log" id="chatLog" aria-live="polite">' +
      '<div class="msg bot">Olá! Sou o <strong>Assistente Resoluta</strong>. Posso explicar markup, fluxo de caixa, margem, ponto de equilíbrio e muito mais. Como posso ajudar? 🤝</div>' +
      '</div>' +
      '<div class="chat-suggest" id="chatSuggest">' +
      ['Como calcular o markup?', 'O que é ponto de equilíbrio?', 'Como melhorar meu fluxo de caixa?', 'O que é margem de contribuição?', 'Como definir metas?'].map(function (q) { return '<button type="button" data-q="' + q + '">' + q + '</button>'; }).join('') + '</div>' +
      '<form class="chat-input" id="chatForm"><input type="text" id="chatInput" placeholder="Escreva sua dúvida…" aria-label="Mensagem para o assistente"><button class="btn btn-primary" type="submit" aria-label="Enviar"><i class="fa-solid fa-paper-plane"></i></button></form></div>' +
      '<div><div class="card"><div class="card-title"><i class="fa-solid fa-robot"></i> Sobre o assistente</div>' +
      '<p style="font-size:.88rem;color:var(--text-soft);">O assistente usa uma base de conhecimento de educação financeira da Resoluta Finance para responder dúvidas sobre gestão, precificação e indicadores.</p>' +
      '<div class="alert alert-info"><i class="fa-solid fa-shield-halved"></i><div><strong>Privacidade</strong> Chaves de API, quando integradas a modelos externos, permanecem protegidas no back-end e nunca são expostas no navegador.</div></div>' +
      '<p style="font-size:.82rem;color:var(--text-soft);">As respostas são orientativas e não substituem a análise de um contador.</p></div></div></div>';
    $('#iaContent').innerHTML = html;

    function answer(text) {
      var t = text.toLowerCase();
      var best = null, bestScore = 0;
      KB.forEach(function (item) {
        var score = 0;
        item.k.forEach(function (kw) { if (t.indexOf(kw) !== -1) score += kw.length; });
        if (score > bestScore) { bestScore = score; best = item; }
      });
      if (best) return best.a;
      return 'Não encontrei uma resposta específica, mas posso ajudar com: <strong>markup, fluxo de caixa, ticket médio, margem de contribuição, margem de lucro, ponto de equilíbrio, capital de giro, metas, contas a pagar/receber, planos, segurança e acessibilidade</strong>. Reformule a pergunta usando um desses temas. 😊';
    }
    function push(text, who) {
      var log = $('#chatLog');
      var div = document.createElement('div');
      div.className = 'msg ' + who;
      div.innerHTML = text;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }
    function send(text) {
      if (!text.trim()) return;
      push(esc(text), 'user');
      setTimeout(function () { push(answer(text), 'bot'); }, 350);
    }
    $('#chatForm').addEventListener('submit', function (e) { e.preventDefault(); var v = $('#chatInput').value; $('#chatInput').value = ''; send(v); });
    $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { send(b.getAttribute('data-q')); }); });
  }

  /* ======================================================================
     CONFIGURAÇÕES
     ====================================================================== */
  function renderConfig() {
    var d = data();
    var u = A.currentUser() || { name: '', email: '' };
    var planNames = { free: 'Free', 'pro-pf': 'Pro PF', 'pro-pj': 'Pro PJ', premium: 'Premium' };
    var html = '<div class="grid grid-2">' +
      '<div class="card"><div class="card-title"><i class="fa-solid fa-user"></i> Meu perfil</div>' +
      '<form id="cfForm" class="form-stack">' +
      '<div class="field"><label for="cfName">Nome</label><input type="text" id="cfName" value="' + esc(u.name) + '"></div>' +
      '<div class="field"><label for="cfEmail">E-mail</label><input type="email" id="cfEmail" value="' + esc(u.email) + '" disabled></div>' +
      '<div class="field"><label for="cfBusiness">Nome do negócio</label><input type="text" id="cfBusiness" value="' + esc(d.profile.business) + '"></div>' +
      '<div class="field"><label for="cfSegment">Segmento</label><input type="text" id="cfSegment" value="' + esc(d.profile.segment) + '"></div>' +
      '<div class="field"><label for="cfPhone">Telefone / WhatsApp</label><input type="text" id="cfPhone" value="' + esc(d.profile.phone) + '"></div>' +
      '<button class="btn btn-primary" type="submit"><i class="fa-solid fa-floppy-disk"></i> Salvar perfil</button></form></div>' +

      '<div><div class="card"><div class="card-title"><i class="fa-solid fa-arrow-up-right-dots"></i> Meu plano</div>' +
      '<p style="font-size:.88rem;color:var(--text-soft);">Plano atual: <strong style="color:var(--gold-strong);">' + (planNames[d.settings.plan] || 'Free') + '</strong></p>' +
      '<div class="field"><label for="cfPlan">Alterar plano</label><select id="cfPlan">' +
      Object.keys(planNames).map(function (k) { return '<option value="' + k + '"' + (d.settings.plan === k ? ' selected' : '') + '>' + planNames[k] + '</option>'; }).join('') +
      '</select></div>' +
      '<button class="btn btn-secondary btn-sm" id="cfPlanSave" type="button" style="margin-top:12px;"><i class="fa-solid fa-check"></i> Atualizar plano</button></div>' +

      '<div class="card"><div class="card-title"><i class="fa-solid fa-database"></i> Meus dados</div>' +
      '<p style="font-size:.86rem;color:var(--text-soft);">Seus dados ficam armazenados localmente, isolados por usuário. Você pode exportar ou apagar a qualquer momento (LGPD).</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;">' +
      '<button class="btn btn-ghost btn-sm" id="cfExport"><i class="fa-solid fa-download"></i> Exportar dados (JSON)</button>' +
      '<button class="btn btn-ghost btn-sm" id="cfImport"><i class="fa-solid fa-upload"></i> Importar dados</button>' +
      '<button class="btn btn-ghost btn-sm" id="cfDemo"><i class="fa-solid fa-flask"></i> Dados de exemplo</button>' +
      '<button class="btn btn-ghost btn-sm" id="cfClear"><i class="fa-solid fa-trash"></i> Apagar meus dados</button>' +
      '</div><input type="file" id="cfFile" accept="application/json" hidden></div>' +

      '<div class="card"><div class="card-title"><i class="fa-solid fa-shield-halved"></i> Segurança e privacidade</div>' +
      '<ul class="value-list" style="margin:0;">' +
      '<li><i class="fa-solid fa-lock"></i><span>Senha protegida com hashing (PBKDF2/bcrypt).</span></li>' +
      '<li><i class="fa-solid fa-user-lock"></i><span>Bloqueio temporário após 3 tentativas incorretas.</span></li>' +
      '<li><i class="fa-solid fa-cookie-bite"></i><span><a href="#" data-open-cookies>Preferências de cookies</a></span></li>' +
      '<li><i class="fa-solid fa-file-contract"></i><span><a href="privacidade.html">Política de Privacidade (LGPD)</a> · <a href="termos.html">Termos de Uso</a></span></li>' +
      '</ul>' +
      '<button class="btn btn-secondary btn-sm" id="cfLogout" type="button" style="margin-top:14px;"><i class="fa-solid fa-right-from-bracket"></i> Sair da conta</button></div>' +
      '</div></div>';
    $('#configContent').innerHTML = html;

    $('#cfForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var d2 = data();
      d2.profile.business = $('#cfBusiness').value; d2.profile.segment = $('#cfSegment').value; d2.profile.phone = $('#cfPhone').value;
      commit();
      var u2 = A.currentUser();
      toast('Perfil atualizado!');
      updateUserChip();
    });
    $('#cfPlanSave').addEventListener('click', function () { var d2 = data(); d2.settings.plan = $('#cfPlan').value; commit(); updateUserChip(); toast('Plano atualizado para ' + planNames[$('#cfPlan').value] + '.'); });
    $('#cfExport').addEventListener('click', function () { S.download('resoluta-dados.json', JSON.stringify(data(), null, 2), 'application/json'); toast('Dados exportados!'); });
    $('#cfImport').addEventListener('click', function () { $('#cfFile').click(); });
    $('#cfFile').addEventListener('change', function (e) {
      var file = e.target.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { var obj = JSON.parse(reader.result); S.save(obj); toast('Dados importados!'); go(current, true); }
        catch (err) { toast('Arquivo inválido.', 'error'); }
      };
      reader.readAsText(file);
    });
    $('#cfDemo').addEventListener('click', function () { if (confirm('Substituir seus dados pelos dados de exemplo?')) { S.seedDemo(); toast('Dados de exemplo carregados.'); go('dashboard'); } });
    $('#cfClear').addEventListener('click', function () { if (confirm('Apagar TODOS os seus dados financeiros? Esta ação não pode ser desfeita.')) { S.reset(); toast('Dados apagados.'); go('dashboard'); } });
    $('#cfLogout').addEventListener('click', doLogout);
  }

  /* ======================================================================
     UTIL: campo de formulário
     ====================================================================== */
  function field(id, label, type, placeholder, step, value) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<input type="' + (type || 'text') + '" id="' + id + '"' + (step ? ' step="' + step + '"' : '') +
      (placeholder ? ' placeholder="' + placeholder + '"' : '') +
      (value !== undefined && value !== null ? ' value="' + value + '"' : '') + '></div>';
  }

  /* ======================================================================
     SIDEBAR / TOPBAR / USUÁRIO
     ====================================================================== */
  function updateUserChip() {
    var u = A.currentUser();
    var planNames = { free: 'Free', 'pro-pf': 'Pro PF', 'pro-pj': 'Pro PJ', premium: 'Premium' };
    if (u) {
      $('#userName').textContent = u.name.split(' ')[0] || u.name;
      $('#userAvatar').textContent = (u.name || 'R').charAt(0).toUpperCase();
      var d = data();
      $('#userPlan').textContent = planNames[d.settings.plan] || 'Free';
    }
  }
  function doLogout() {
    if (!confirm('Deseja sair da sua conta?')) return;
    A.logout();
    location.href = 'index.html';
  }

  /* ======================================================================
     ONBOARDING
     ====================================================================== */
  function maybeOnboard() {
    var d = data();
    if (d.settings.onboarded) return;
    var u = A.currentUser();
    var ob = $('#onboard');
    ob.classList.add('open');
    if (u) $('#obName').value = u.name;
    $('#onboardForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var d2 = data();
      d2.profile.name = $('#obName').value; d2.profile.business = $('#obBusiness').value; d2.profile.segment = $('#obSegment').value;
      d2.settings.plan = $('#obPlan').value; d2.settings.onboarded = true;
      commit(); ob.classList.remove('open'); updateUserChip(); toast('Tudo pronto! Bem-vindo(a).');
    });
    $('#obDemo').addEventListener('click', function () { S.seedDemo(); ob.classList.remove('open'); updateUserChip(); go('dashboard'); toast('Dados de exemplo carregados!'); });
    $('#obSkip').addEventListener('click', function () { var d2 = data(); d2.settings.onboarded = true; commit(); ob.classList.remove('open'); });
  }

  /* ======================================================================
     INIT
     ====================================================================== */
  function init() {
    if (!A.isLoggedIn()) { location.replace('index.html'); return; }
    S.load();
    if (window.ResolutaA11y) window.ResolutaA11y.init();

    updateUserChip();

    // navegação
    $$('[data-view]').forEach(function (l) {
      l.addEventListener('click', function (e) { e.preventDefault(); go(l.getAttribute('data-view')); });
    });
    window.addEventListener('hashchange', function () { go((location.hash || '#dashboard').slice(1), true); });

    // menu mobile
    $('#menuToggle').addEventListener('click', function () { $('#sidebar').classList.toggle('open'); $('#sidebarBackdrop').classList.toggle('open'); });
    $('#sidebarBackdrop').addEventListener('click', closeSidebar);

    // dropdown usuário
    var chip = $('#userChip'), menu = $('#userMenu');
    chip.addEventListener('click', function (e) { e.stopPropagation(); var o = menu.classList.toggle('open'); chip.setAttribute('aria-expanded', String(o)); });
    document.addEventListener('click', function () { menu.classList.remove('open'); chip.setAttribute('aria-expanded', 'false'); });
    $('#btnLogout').addEventListener('click', doLogout);

    // a11y top button
    $('#btnA11yTop').addEventListener('click', function () { var p = $('#a11yPanel'); p.classList.toggle('open'); $('#a11yToggle').setAttribute('aria-expanded', String(p.classList.contains('open'))); });

    // demo
    $('#btnDemo').addEventListener('click', function () {
      if (confirm('Carregar dados de exemplo? Isso substituirá seus dados atuais.')) { S.seedDemo(); toast('Dados de exemplo carregados.'); go(current, true); updateUserChip(); }
    });

    // modal close
    $('#appModalClose').addEventListener('click', closeModal);
    $('#appModal').addEventListener('click', function (e) { if (e.target === $('#appModal')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    // cookies preference link
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-open-cookies]');
      if (t) { e.preventDefault(); toast('Preferências de cookies podem ser gerenciadas na página inicial.'); }
    });

    // redesenha gráficos ao trocar tema
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-theme-btn]')) setTimeout(function () { VIEWS[current].render(); }, 60);
    });

   maybeOnboard();

go((location.hash || '#dashboard').slice(1), true);

document.addEventListener('DOMContentLoaded', init);

})();

