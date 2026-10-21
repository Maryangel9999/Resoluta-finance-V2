/* ==========================================================================
   Resoluta Finance — Motor de Cálculos Financeiros
   Funções puras, testáveis e didáticas (sem dependências externas).
   ========================================================================== */
(function (global) {
  'use strict';

  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : (d || 0); }
  function round2(v) { return Math.round((num(v) + Number.EPSILON) * 100) / 100; }

  function brl(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num(v));
  }
  function pct(v, digits) {
    return num(v).toLocaleString('pt-BR', { minimumFractionDigits: digits == null ? 1 : digits, maximumFractionDigits: digits == null ? 1 : digits }) + '%';
  }
  function pctFromRatio(r, digits) { return pct(num(r) * 100, digits); }

  /* ----------------------------------------------------------------------
     1. PRECIFICAÇÃO POR MARKUP
     Markup Divisor      = 1 - (var% + fix% + margem%)
     Markup Multiplicador= 1 / Markup Divisor
     Preço de Venda      = Custo Direto / Markup Divisor
     ---------------------------------------------------------------------- */
  function markup(input) {
    var cost = num(input.cost);
    var varPct = num(input.varPct);
    var fixPct = num(input.fixPct);
    var marginPct = num(input.marginPct);
    var qty = Math.max(1, Math.floor(num(input.qty, 1)));
    var practiced = num(input.practiced, 0);

    if (cost < 0 || varPct < 0 || fixPct < 0 || marginPct < 0) {
      return { ok: false, error: 'Os valores não podem ser negativos.' };
    }
    var sum = varPct + fixPct + marginPct;
    if (sum >= 100) {
      return { ok: false, error: 'A soma de despesas variáveis, fixas e margem não pode atingir ou ultrapassar 100%. Ajuste os percentuais.' };
    }
    if (cost === 0) {
      return { ok: false, error: 'Informe um custo direto unitário maior que zero.' };
    }

    var divisor = 1 - sum / 100;
    var mult = 1 / divisor;
    var price = cost / divisor;
    var revenue = price * qty;
    var totalCost = cost * qty;
    var varExp = price * (varPct / 100) * qty;
    var fixExp = price * (fixPct / 100) * qty;
    var opExp = varExp + fixExp;
    var grossProfit = revenue - totalCost;
    var netProfit = revenue - totalCost - opExp;
    var marginResult = revenue > 0 ? (netProfit / revenue) : 0;

    var practicedInfo = null;
    if (practiced > 0) {
      var practicedNet = practiced - cost - practiced * ((varPct + fixPct) / 100);
      practicedInfo = {
        price: practiced,
        unitProfit: practicedNet,
        margin: practiced > 0 ? (practicedNet / practiced) : 0,
        diff: practiced - price,
        diffPct: price > 0 ? ((practiced - price) / price) : 0
      };
    }

    return {
      ok: true,
      cost: cost, varPct: varPct, fixPct: fixPct, marginPct: marginPct, qty: qty,
      divisor: divisor, multiplier: mult, price: price,
      revenue: revenue, totalCost: totalCost,
      varExp: varExp, fixExp: fixExp, opExp: opExp,
      grossProfit: grossProfit, netProfit: netProfit, marginResult: marginResult,
      unitProfit: netProfit / qty,
      practiced: practicedInfo
    };
  }

  /* ----------------------------------------------------------------------
     2. FLUXO DE CAIXA — saldo realizado e projetado
     ---------------------------------------------------------------------- */
  function cashFlow(transactions, opts) {
    opts = opts || {};
    var now = opts.now ? new Date(opts.now) : new Date();
    var realized = 0, projected = 0;
    var byCategory = {};
    var inTotal = 0, outTotal = 0;

    (transactions || []).forEach(function (t) {
      var amount = num(t.amount);
      var date = t.date ? new Date(t.date) : now;
      var isFuture = date > now;
      var signed = t.type === 'in' ? amount : -amount;
      if (isFuture) projected += signed; else realized += signed;
      if (t.type === 'in') inTotal += amount; else outTotal += amount;
      var cat = t.category || 'Sem categoria';
      if (!byCategory[cat]) byCategory[cat] = { in: 0, out: 0 };
      if (t.type === 'in') byCategory[cat].in += amount; else byCategory[cat].out += amount;
    });

    return {
      realized: round2(realized),
      projected: round2(realized + projected),
      futureDelta: round2(projected),
      income: round2(inTotal),
      expense: round2(outTotal),
      net: round2(inTotal - outTotal),
      byCategory: byCategory
    };
  }

  function filterByPeriod(items, period, ref) {
    var now = ref ? new Date(ref) : new Date();
    var start;
    if (period === 'day') start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (period === 'week') { start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0); }
    else if (period === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'year') start = new Date(now.getFullYear(), 0, 1);
    else return items.slice();
    return (items || []).filter(function (it) {
      var d = new Date(it.date || it.dueDate || 0);
      return d >= start && d <= new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    });
  }

  /* ----------------------------------------------------------------------
     3. CONTAS A PAGAR / RECEBER — status
     ---------------------------------------------------------------------- */
  function billStatus(bill, now) {
    now = now ? new Date(now) : new Date();
    if (bill.status === 'paid' || bill.status === 'received') return bill.status;
    var due = bill.dueDate ? new Date(bill.dueDate) : null;
    if (due && due < new Date(now.getFullYear(), now.getMonth(), now.getDate())) return 'overdue';
    return 'pending';
  }
  function billsSummary(bills, now) {
    var s = { payablePending: 0, receivablePending: 0, overduePayable: 0, overdueReceivable: 0, paid: 0, received: 0, overdueCount: 0 };
    (bills || []).forEach(function (b) {
      var st = billStatus(b, now);
      var amt = num(b.amount);
      if (st === 'overdue') { s.overdueCount++; if (b.type === 'payable') s.overduePayable += amt; else s.overdueReceivable += amt; }
      else if (st === 'pending') { if (b.type === 'payable') s.payablePending += amt; else s.receivablePending += amt; }
      else if (st === 'paid') s.paid += amt;
      else if (st === 'received') s.received += amt;
    });
    Object.keys(s).forEach(function (k) { if (k !== 'overdueCount') s[k] = round2(s[k]); });
    return s;
  }

  /* ----------------------------------------------------------------------
     4. CAPITAL DE GIRO LÍQUIDO — CGL = Ativo Circulante - Passivo Circulante
     ---------------------------------------------------------------------- */
  function workingCapital(currentAssets, currentLiabilities) {
    var a = num(currentAssets), l = num(currentLiabilities);
    var cgl = a - l;
    var ratio = l > 0 ? a / l : (a > 0 ? Infinity : 0);
    var health, advice;
    if (cgl > 0 && ratio >= 1.5) {
      health = 'saudavel';
      advice = 'Seu capital de giro é positivo e confortável. Você tem folga para honrar compromissos de curto prazo e ainda investir no crescimento.';
    } else if (cgl > 0) {
      health = 'atencao';
      advice = 'Capital de giro positivo, mas com pouca folga. Monitore prazos de recebimento e evite assumir novas dívidas de curto prazo.';
    } else if (cgl === 0) {
      health = 'equilibrio';
      advice = 'Ativo e passivo circulantes se equivalem. Qualquer imprevisto pode comprometer o caixa — busque formar reserva.';
    } else {
      health = 'risco';
      advice = 'Capital de giro negativo: as obrigações de curto prazo superam os recursos disponíveis. Priorize renegociar prazos, reduzir despesas e acelerar recebimentos.';
    }
    return { assets: round2(a), liabilities: round2(l), cgl: round2(cgl), ratio: ratio, health: health, advice: advice };
  }

  /* ----------------------------------------------------------------------
     5. TICKET MÉDIO = Faturamento / Quantidade de vendas
     ---------------------------------------------------------------------- */
  function ticketMedio(revenue, salesCount) {
    var r = num(revenue), c = num(salesCount);
    if (c <= 0) return { ok: false, error: 'Informe a quantidade de vendas (maior que zero).' };
    return { ok: true, ticket: r / c, revenue: r, salesCount: c };
  }
  function ticketEvolution(series) {
    // series: [{label, revenue, sales}]
    var out = (series || []).map(function (s) {
      return { label: s.label, ticket: num(s.sales) > 0 ? num(s.revenue) / num(s.sales) : 0 };
    });
    var first = out[0] ? out[0].ticket : 0;
    var last = out[out.length - 1] ? out[out.length - 1].ticket : 0;
    return { series: out, variation: first > 0 ? (last - first) / first : 0 };
  }

  /* ----------------------------------------------------------------------
     6. MARGEM DE CONTRIBUIÇÃO = Receita - (Custos Variáveis + Despesas Variáveis)
     ---------------------------------------------------------------------- */
  function contributionMargin(revenue, variableCosts) {
    var r = num(revenue), v = num(variableCosts);
    var mc = r - v;
    var ratio = r > 0 ? mc / r : 0;
    var advice;
    if (ratio >= 0.4) advice = 'Margem de contribuição robusta: cada venda contribui bem para cobrir os custos fixos e gerar lucro.';
    else if (ratio >= 0.2) advice = 'Margem de contribuição moderada. Vale revisar custos variáveis e o preço de venda.';
    else if (ratio > 0) advice = 'Margem de contribuição baixa: pequenas oscilações podem levar ao prejuízo. Reveja precificação e custos.';
    else advice = 'Margem de contribuição nula ou negativa: cada venda não cobre os custos variáveis. Ação urgente necessária.';
    return { ok: r > 0, revenue: round2(r), variableCosts: round2(v), margin: round2(mc), ratio: ratio, advice: advice };
  }

  /* ----------------------------------------------------------------------
     7. MARGEM DE LUCRO — bruto, operacional e líquido
     ---------------------------------------------------------------------- */
  function profitMargin(input) {
    var revenue = num(input.revenue);
    var cogs = num(input.cogs);          // custo das mercadorias/serviços
    var opExpenses = num(input.opExpenses); // despesas operacionais
    var taxes = num(input.taxes);
    var gross = revenue - cogs;
    var operating = gross - opExpenses;
    var net = operating - taxes;
    return {
      ok: revenue > 0,
      revenue: round2(revenue),
      gross: round2(gross), grossMargin: revenue > 0 ? gross / revenue : 0,
      operating: round2(operating), operatingMargin: revenue > 0 ? operating / revenue : 0,
      net: round2(net), netMargin: revenue > 0 ? net / revenue : 0
    };
  }

  /* ----------------------------------------------------------------------
     8. PONTO DE EQUILÍBRIO (Break-even)
     PE (R$) = Custos e Despesas Fixas / Índice de Margem de Contribuição
     PE (un) = Custos e Despesas Fixas / Margem de Contribuição Unitária
     ---------------------------------------------------------------------- */
  function breakEven(input) {
    var fixed = num(input.fixedCosts);
    var price = num(input.price);
    var varCostUnit = num(input.varCostUnit);
    if (price <= 0) return { ok: false, error: 'Informe o preço de venda unitário.' };
    var mcUnit = price - varCostUnit;
    if (mcUnit <= 0) return { ok: false, error: 'O preço não cobre o custo variável unitário. Não há ponto de equilíbrio possível.' };
    var mcRatio = mcUnit / price;
    var peRevenue = fixed / mcRatio;
    var peUnits = fixed / mcUnit;
    return {
      ok: true,
      fixedCosts: round2(fixed),
      mcUnit: round2(mcUnit),
      mcRatio: mcRatio,
      breakEvenRevenue: round2(peRevenue),
      breakEvenUnits: Math.ceil(peUnits),
      breakEvenUnitsExact: peUnits
    };
  }

  /* ----------------------------------------------------------------------
     9. SIMULADOR DE CENÁRIOS
     ---------------------------------------------------------------------- */
  function scenario(base, delta) {
    // base: {price, varCost, fixedCost, volume}
    var price = num(base.price) * (1 + num(delta.price) / 100);
    var varCost = num(base.varCost) * (1 + num(delta.varCost) / 100);
    var fixedCost = num(base.fixedCost) * (1 + num(delta.fixedCost) / 100);
    var volume = num(base.volume) * (1 + num(delta.volume) / 100);
    var revenue = price * volume;
    var variable = varCost * volume;
    var contribution = revenue - variable;
    var profit = contribution - fixedCost;
    return {
      price: round2(price), varCost: round2(varCost), fixedCost: round2(fixedCost), volume: Math.round(volume),
      revenue: round2(revenue), variable: round2(variable), contribution: round2(contribution),
      profit: round2(profit), margin: revenue > 0 ? profit / revenue : 0
    };
  }
  function simulate(base) {
    return {
      conservador: scenario(base, { price: -5, varCost: +8, fixedCost: +5, volume: -15 }),
      base: scenario(base, { price: 0, varCost: 0, fixedCost: 0, volume: 0 }),
      otimista: scenario(base, { price: +5, varCost: -3, fixedCost: 0, volume: +20 })
    };
  }

  /* ----------------------------------------------------------------------
     10. DIAGNÓSTICO FINANCEIRO
     ---------------------------------------------------------------------- */
  var DIAGNOSIS_QUESTIONS = [
    { id: 'q1', text: 'Você registra todas as entradas e saídas do seu negócio?', weight: 3, good: 'yes' },
    { id: 'q2', text: 'Você sabe exatamente quanto custa cada produto ou serviço que vende?', weight: 3, good: 'yes' },
    { id: 'q3', text: 'Seu preço de venda é definido com base em cálculo (markup), e não apenas no mercado?', weight: 3, good: 'yes' },
    { id: 'q4', text: 'Você separa as finanças pessoais das finanças do negócio?', weight: 3, good: 'yes' },
    { id: 'q5', text: 'Você acompanha o lucro do mês (e não apenas o faturamento)?', weight: 2, good: 'yes' },
    { id: 'q6', text: 'Você possui reserva para imprevistos ou sazonalidade?', weight: 2, good: 'yes' },
    { id: 'q7', text: 'Você define metas financeiras e acompanha o progresso?', weight: 2, good: 'yes' },
    { id: 'q8', text: 'Você controla contas a pagar e a receber com datas de vencimento?', weight: 2, good: 'yes' },
    { id: 'q9', text: 'Você conhece seu ponto de equilíbrio (quanto precisa vender para não ter prejuízo)?', weight: 2, good: 'yes' },
    { id: 'q10', text: 'Você revisa seus preços e custos periodicamente?', weight: 2, good: 'yes' }
  ];

  function diagnosis(answers) {
    // answers: { q1: 'yes'|'partial'|'no', ... }
    var total = 0, max = 0;
    DIAGNOSIS_QUESTIONS.forEach(function (q) {
      max += q.weight;
      var a = answers[q.id];
      if (a === 'yes') total += q.weight;
      else if (a === 'partial') total += q.weight * 0.5;
    });
    var score = max > 0 ? Math.round((total / max) * 100) : 0;
    var level, summary;
    if (score >= 80) { level = 'Avançado'; summary = 'Sua gestão financeira é madura. Foque em otimização, projeções e crescimento sustentável.'; }
    else if (score >= 60) { level = 'Em evolução'; summary = 'Você já tem boas práticas. Ajuste os pontos de atenção para ganhar previsibilidade e margem.'; }
    else if (score >= 40) { level = 'Básico'; summary = 'Há fundamentos em construção. Priorize registro, precificação e separação de contas.'; }
    else { level = 'Inicial'; summary = 'Comece pelo essencial: registrar tudo, calcular preços e separar o dinheiro do negócio do pessoal.'; }

    var plan = [];
    DIAGNOSIS_QUESTIONS.forEach(function (q) {
      var a = answers[q.id];
      if (a !== 'yes') {
        plan.push({
          priority: a === 'partial' ? 'Média' : 'Alta',
          action: actionFor(q.id)
        });
      }
    });
    return { score: score, level: level, summary: summary, plan: plan, max: max, total: total };
  }
  function actionFor(id) {
    var map = {
      q1: 'Passar a registrar diariamente todas as entradas e saídas no Fluxo de Caixa da Resoluta Finance.',
      q2: 'Levantar o custo direto de cada produto/serviço, incluindo insumos, embalagem e tempo.',
      q3: 'Usar a Calculadora de Markup para definir preços com base em custos, despesas e margem desejada.',
      q4: 'Criar contas separadas (ou ao menos um controle separado) para pessoa física e negócio.',
      q5: 'Apurar o lucro mensal na ferramenta de Margem de Lucro, não apenas o faturamento.',
      q6: 'Reservar mensalmente um percentual do lucro para imprevistos e sazonalidade.',
      q7: 'Definir metas financeiras mensuráveis e acompanhar o progresso no módulo de Metas.',
      q8: 'Cadastrar contas a pagar e a receber com datas e ativar alertas de vencimento.',
      q9: 'Calcular o Ponto de Equilíbrio para saber o mínimo necessário para não ter prejuízo.',
      q10: 'Revisar preços e custos a cada trimestre ou quando houver mudança relevante.'
    };
    return map[id] || 'Revisar esta prática de gestão.';
  }

  /* ----------------------------------------------------------------------
     11. METAS
     ---------------------------------------------------------------------- */
  function goalProgress(goal) {
    var target = num(goal.target), current = num(goal.current);
    var pctVal = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    var remaining = Math.max(0, target - current);
    var daysLeft = null, onTrack = null;
    if (goal.deadline) {
      var dl = new Date(goal.deadline);
      daysLeft = Math.ceil((dl - new Date()) / 86400000);
      if (goal.createdAt && target > 0) {
        var totalDays = Math.max(1, (dl - new Date(goal.createdAt)) / 86400000);
        var expected = Math.min(100, ((totalDays - Math.max(0, daysLeft)) / totalDays) * 100);
        onTrack = pctVal >= expected - 5;
      }
    }
    return { pct: pctVal, remaining: round2(remaining), daysLeft: daysLeft, onTrack: onTrack };
  }

  /* ----------------------------------------------------------------------
     12. DASHBOARD — consolidação
     ---------------------------------------------------------------------- */
  function dashboardSummary(data) {
    var tx = (data && data.transactions) || [];
    var cf = cashFlow(tx);
    var bills = billsSummary((data && data.bills) || []);
    var sales = tx.filter(function (t) { return t.type === 'in'; });
    var revenue = sales.reduce(function (a, t) { return a + num(t.amount); }, 0);
    var expenses = tx.filter(function (t) { return t.type === 'out'; }).reduce(function (a, t) { return a + num(t.amount); }, 0);
    var ticket = sales.length > 0 ? revenue / sales.length : 0;
    return {
      revenue: round2(revenue),
      expenses: round2(expenses),
      profit: round2(revenue - expenses),
      margin: revenue > 0 ? (revenue - expenses) / revenue : 0,
      salesCount: sales.length,
      ticket: round2(ticket),
      balance: cf.realized,
      projected: cf.projected,
      bills: bills
    };
  }

  function monthlySeries(transactions, months) {
    months = months || 6;
    var now = new Date();
    var out = [];
    for (var i = months - 1; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var label = d.toLocaleDateString('pt-BR', { month: 'short' });
      var inSum = 0, outSum = 0;
      (transactions || []).forEach(function (t) {
        var td = new Date(t.date);
        if (td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()) {
          if (t.type === 'in') inSum += num(t.amount); else outSum += num(t.amount);
        }
      });
      out.push({ label: label, income: round2(inSum), expense: round2(outSum), net: round2(inSum - outSum) });
    }
    return out;
  }

  global.Finance = {
    num: num, round2: round2, brl: brl, pct: pct, pctFromRatio: pctFromRatio,
    markup: markup, cashFlow: cashFlow, filterByPeriod: filterByPeriod,
    billStatus: billStatus, billsSummary: billsSummary,
    workingCapital: workingCapital, ticketMedio: ticketMedio, ticketEvolution: ticketEvolution,
    contributionMargin: contributionMargin, profitMargin: profitMargin,
    breakEven: breakEven, scenario: scenario, simulate: simulate,
    diagnosis: diagnosis, DIAGNOSIS_QUESTIONS: DIAGNOSIS_QUESTIONS,
    goalProgress: goalProgress, dashboardSummary: dashboardSummary, monthlySeries: monthlySeries
  };
})(typeof window !== 'undefined' ? window : this);
