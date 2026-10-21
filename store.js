/* ==========================================================================
   Resoluta Finance — Camada de Dados (isolada por usuário)
   Persistência em localStorage, com dados de demonstração e exportação.
   ========================================================================== */
(function (global) {
  'use strict';

  function uid(prefix) { return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function shiftDate(days) { var d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }

  function emptyData() {
    return {
      version: 2,
      profile: { name: '', business: '', segment: '', phone: '', city: 'São Luís - MA' },
      transactions: [],
      bills: [],
      products: [],
      goals: [],
      workingCapital: { currentAssets: 0, currentLiabilities: 0, breakdown: [] },
      diagnosis: null,
      scenarios: null,
      settings: { plan: 'free', onboarded: false },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  function demoData() {
    var d = emptyData();
    d.profile = { name: 'Empreendedor(a) Resoluta', business: 'Meu Negócio', segment: 'Comércio e serviços', phone: '(98) 90000-0000', city: 'São Luís - MA' };
    d.settings.plan = 'pro-pj';
    d.settings.onboarded = true;

    var cats = ['Vendas', 'Serviços', 'Insumos', 'Aluguel', 'Marketing', 'Transporte', 'Impostos'];
    d.transactions = [
      { id: uid('tx'), type: 'in', description: 'Vendas da semana', category: 'Vendas', amount: 2400, date: shiftDate(-22) },
      { id: uid('tx'), type: 'in', description: 'Prestação de serviço', category: 'Serviços', amount: 1500, date: shiftDate(-18) },
      { id: uid('tx'), type: 'out', description: 'Compra de insumos', category: 'Insumos', amount: 900, date: shiftDate(-16) },
      { id: uid('tx'), type: 'out', description: 'Aluguel do ponto', category: 'Aluguel', amount: 800, date: shiftDate(-15) },
      { id: uid('tx'), type: 'in', description: 'Vendas do fim de semana', category: 'Vendas', amount: 3200, date: shiftDate(-9) },
      { id: uid('tx'), type: 'out', description: 'Anúncios online', category: 'Marketing', amount: 250, date: shiftDate(-8) },
      { id: uid('tx'), type: 'out', description: 'Combustível e entregas', category: 'Transporte', amount: 320, date: shiftDate(-6) },
      { id: uid('tx'), type: 'in', description: 'Vendas da semana', category: 'Vendas', amount: 2800, date: shiftDate(-3) },
      { id: uid('tx'), type: 'out', description: 'DAS / impostos', category: 'Impostos', amount: 180, date: shiftDate(-2) },
      { id: uid('tx'), type: 'in', description: 'Encomenda especial', category: 'Vendas', amount: 1100, date: shiftDate(4) }
    ];
    d.bills = [
      { id: uid('bl'), type: 'payable', description: 'Fornecedor de embalagens', category: 'Insumos', amount: 420, dueDate: shiftDate(3), status: 'pending' },
      { id: uid('bl'), type: 'payable', description: 'Conta de energia', category: 'Estrutura', amount: 210, dueDate: shiftDate(-2), status: 'pending' },
      { id: uid('bl'), type: 'receivable', description: 'Cliente — pedido corporativo', category: 'Serviços', amount: 1800, dueDate: shiftDate(6), status: 'pending' },
      { id: uid('bl'), type: 'receivable', description: 'Venda a prazo', category: 'Vendas', amount: 650, dueDate: shiftDate(-1), status: 'pending' },
      { id: uid('bl'), type: 'payable', description: 'Internet e telefone', category: 'Estrutura', amount: 130, dueDate: shiftDate(-8), status: 'paid' }
    ];
    d.products = [
      { id: uid('pr'), name: 'Doce artesanal (unidade)', cost: 4.5, varPct: 8, fixPct: 12, marginPct: 25, qty: 100, practiced: 12, createdAt: Date.now() - 86400000 * 5 },
      { id: uid('pr'), name: 'Consultoria (hora)', cost: 35, varPct: 10, fixPct: 18, marginPct: 30, qty: 20, practiced: 90, createdAt: Date.now() - 86400000 * 3 }
    ];
    d.goals = [
      { id: uid('gl'), title: 'Faturamento mensal de R$ 15.000', target: 15000, current: 11000, deadline: shiftDate(30), createdAt: Date.now() - 86400000 * 10 },
      { id: uid('gl'), title: 'Reserva de emergência', target: 5000, current: 1800, deadline: shiftDate(90), createdAt: Date.now() - 86400000 * 20 }
    ];
    d.workingCapital = {
      currentAssets: 12000, currentLiabilities: 7000,
      breakdown: [
        { id: uid('wc'), label: 'Caixa e bancos', type: 'asset', amount: 8000 },
        { id: uid('wc'), label: 'Contas a receber', type: 'asset', amount: 4000 },
        { id: uid('wc'), label: 'Fornecedores', type: 'liability', amount: 4500 },
        { id: uid('wc'), label: 'Impostos a pagar', type: 'liability', amount: 2500 }
      ]
    };
    return d;
  }

  var cache = null;

  function load() {
    if (!global.ResolutaAuth) return emptyData();
    var data = global.ResolutaAuth.loadData();
    if (!data) {
      data = emptyData();
      global.ResolutaAuth.saveData(data);
    }
    // merge defaults
    var base = emptyData();
    Object.keys(base).forEach(function (k) { if (data[k] === undefined) data[k] = base[k]; });
    cache = data;
    return data;
  }

  function save(data) {
    data = data || cache;
    if (!data) return;
    data.updatedAt = Date.now();
    cache = data;
    if (global.ResolutaAuth) global.ResolutaAuth.saveData(data);
    return data;
  }

  function get() { return cache || load(); }

  function seedDemo() {
    var d = demoData();
    save(d);
    return d;
  }

  function reset() {
    var d = emptyData();
    save(d);
    return d;
  }

  /* ---------- CRUD genérico por coleção ---------- */
  function add(collection, item) {
    var d = get();
    if (!d[collection]) d[collection] = [];
    item.id = item.id || uid(collection.slice(0, 2));
    item.createdAt = item.createdAt || Date.now();
    d[collection].unshift(item);
    save(d);
    return item;
  }
  function update(collection, id, patch) {
    var d = get();
    var list = d[collection] || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { list[i] = Object.assign({}, list[i], patch); save(d); return list[i]; }
    }
    return null;
  }
  function remove(collection, id) {
    var d = get();
    d[collection] = (d[collection] || []).filter(function (x) { return x.id !== id; });
    save(d);
  }
  function find(collection, id) {
    return (get()[collection] || []).filter(function (x) { return x.id === id; })[0] || null;
  }

  /* ---------- Exportação ---------- */
  function toCSV(rows) {
    if (!rows || !rows.length) return '';
    var headers = Object.keys(rows[0]);
    var esc = function (v) {
      var s = v == null ? '' : String(v);
      if (/[",;\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    return [headers.join(';')].concat(rows.map(function (r) {
      return headers.map(function (h) { return esc(r[h]); }).join(';');
    })).join('\n');
  }

  function download(filename, content, type) {
    var blob = new Blob(['\ufeff' + content], { type: type || 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  global.Store = {
    emptyData: emptyData, demoData: demoData,
    load: load, save: save, get: get, seedDemo: seedDemo, reset: reset,
    add: add, update: update, remove: remove, find: find,
    toCSV: toCSV, download: download, uid: uid, today: today, shiftDate: shiftDate
  };
})(typeof window !== 'undefined' ? window : this);
