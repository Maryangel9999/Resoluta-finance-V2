/* ==========================================================================
   Resoluta Finance — Landing Page
   Renderização de ferramentas/planos, calculadora de markup, autenticação,
   cookies e interações gerais.
   ========================================================================== */
(function () {
  'use strict';
  var F = window.Finance;
let otpValidated = false;
  /* ---------- Dados de apresentação ---------- */
  var TOOLS = [
    { icon: 'fa-tags', title: 'Calculadora de Markup', desc: 'Defina o preço de venda ideal a partir de custos, despesas e margem desejada.', tag: 'Precificação' },
    { icon: 'fa-money-bill-trend-up', title: 'Fluxo de Caixa', desc: 'Registre entradas e saídas e acompanhe o saldo realizado e projetado.', tag: 'Controle' },
    { icon: 'fa-file-invoice-dollar', title: 'Contas a Pagar e Receber', desc: 'Organize compromissos por vencimento com alertas de pendência e atraso.', tag: 'Controle' },
    { icon: 'fa-scale-balanced', title: 'Capital de Giro', desc: 'Calcule o capital de giro líquido e entenda a saúde financeira do negócio.', tag: 'Análise' },
    { icon: 'fa-receipt', title: 'Ticket Médio', desc: 'Descubra quanto cada cliente gasta em média e acompanhe a evolução.', tag: 'Análise' },
    { icon: 'fa-chart-pie', title: 'Margem de Contribuição', desc: 'Veja quanto cada venda contribui para cobrir custos fixos e gerar lucro.', tag: 'Análise' },
    { icon: 'fa-percent', title: 'Margem de Lucro', desc: 'Detalhe lucro bruto, resultado operacional e lucro líquido de forma didática.', tag: 'Análise' },
    { icon: 'fa-arrows-to-dot', title: 'Ponto de Equilíbrio', desc: 'Saiba o mínimo que precisa vender para cobrir custos e não ter prejuízo.', tag: 'Planejamento' },
    { icon: 'fa-stethoscope', title: 'Diagnóstico Financeiro', desc: 'Responda um questionário e receba um plano de ação personalizado.', tag: 'Diagnóstico' },
    { icon: 'fa-bullseye', title: 'Planejamento e Metas', desc: 'Defina metas financeiras e acompanhe o progresso percentual.', tag: 'Planejamento' },
    { icon: 'fa-sliders', title: 'Simulador de Cenários', desc: 'Compare cenários conservador, base e otimista variando preço, custo e volume.', tag: 'Planejamento' },
    { icon: 'fa-gauge-high', title: 'Dashboard Financeiro', desc: 'Painel consolidado com gráficos alimentados pelos seus dados reais.', tag: 'Relatórios' },
    { icon: 'fa-file-lines', title: 'Relatórios Financeiros', desc: 'Relatórios mensais e anuais com exportação para CSV e PDF.', tag: 'Relatórios' },
    { icon: 'fa-robot', title: 'Assistente de IA', desc: 'Tire dúvidas sobre markup, fluxo de caixa, gráficos e gestão financeira.', tag: 'Inteligência' },
    { icon: 'fa-graduation-cap', title: 'Aprenda', desc: 'Cinco módulos com aulas, exercícios, glossário e questionários interativos.', tag: 'Educação' }
  ];

  var PLANS = [
    { id: 'free', name: 'Free', price: 'R$ 0', period: '/mês', desc: 'Para começar a organizar as finanças.', featured: false,
      feats: [['Calculadora de Markup básica', 1], ['Fluxo de Caixa simples', 1], ['Ticket Médio', 1], ['Diagnóstico Financeiro', 1], ['Controle financeiro básico', 1], ['Relatórios avançados', 0]] },
    { id: 'pro-pf', name: 'Pro PF', price: 'R$ 19,90', period: '/mês', desc: 'Para autônomos que querem previsibilidade.', featured: true, flag: 'Mais popular',
      feats: [['Tudo do Free', 1], ['Precificação por Markup avançada', 1], ['Fluxo de Caixa completo', 1], ['Planejamento e Metas', 1], ['Relatórios mensais e histórico', 1], ['Dashboard básico', 1]] },
    { id: 'pro-pj', name: 'Pro PJ', price: 'R$ 29,90', period: '/mês', desc: 'Para pequenos negócios em crescimento.', featured: false,
      feats: [['Tudo do Pro PF', 1], ['Precificação profissional', 1], ['Margem de Contribuição e Lucro', 1], ['Ponto de Equilíbrio e Capital de Giro', 1], ['Contas a Pagar e Receber', 1], ['Simulador de Cenários e Dashboard empresarial', 1]] },
    { id: 'premium', name: 'Premium', price: 'R$ 49,90', period: '/mês', desc: 'Inteligência artificial e automação.', featured: false, flag: 'Em breve',
      feats: [['Tudo do Pro PJ', 1], ['IA para análises e recomendações', 1], ['Recomendação automática de preço', 1], ['Alertas inteligentes', 1], ['Projeções de faturamento', 1], ['Assistente virtual', 1]] }
  ];

  /* ---------- Render: ferramentas ---------- */
  function renderTools() {
    var el = document.getElementById('toolsGrid');
    if (!el) return;
    el.innerHTML = TOOLS.map(function (t) {
      return '<article class="tool-card reveal">' +
        '<div class="tool-ico"><i class="fa-solid ' + t.icon + '" aria-hidden="true"></i></div>' +
        '<h3>' + t.title + '</h3>' +
        '<p>' + t.desc + '</p>' +
        '<span class="tool-tag">' + t.tag + '</span>' +
        '</article>';
    }).join('');
  }

  /* ---------- Render: planos ---------- */
  function renderPlans() {
    var el = document.getElementById('plansGrid');
    if (!el) return;
    el.innerHTML = PLANS.map(function (p) {
      var feats = p.feats.map(function (f) {
        return '<li class="' + (f[1] ? '' : 'off') + '"><i class="fa-solid ' + (f[1] ? 'fa-check' : 'fa-minus') + '" aria-hidden="true"></i> ' + f[0] + '</li>';
      }).join('');
      return '<article class="plan-card' + (p.featured ? ' featured' : '') + ' reveal">' +
        (p.flag ? '<span class="plan-flag">' + p.flag + '</span>' : '') +
        '<h3>' + p.name + '</h3>' +
        '<div class="plan-price">' + p.price + '<span>' + p.period + '</span></div>' +
        '<p class="plan-desc">' + p.desc + '</p>' +
        '<ul class="plan-feats">' + feats + '</ul>' +
        '<button class="btn ' + (p.featured ? 'btn-primary' : 'btn-secondary') + ' btn-block" type="button" data-plan="' + p.id + '">' +
        (p.id === 'free' ? 'Começar grátis' : (p.id === 'premium' ? 'Entrar na lista' : 'Assinar ' + p.name)) + '</button>' +
        '</article>';
    }).join('');
    el.querySelectorAll('[data-plan]').forEach(function (b) {
      b.addEventListener('click', function () {
        var plan = b.getAttribute('data-plan');
        if (plan === 'premium') { alert('O plano Premium está em desenvolvimento. Em breve você poderá ativar os recursos de Inteligência Artificial!'); return; }
        if (window.ResolutaAuth && window.ResolutaAuth.isLoggedIn()) {
          var d = window.Store.get(); d.settings.plan = plan; window.Store.save(d);
          alert('Plano "' + plan + '" selecionado! Acesse o painel para começar.');
          window.location.href = 'app.html';
        } else {
          openAuth('register');
        }
      });
    });
  }

  /* ---------- Calculadora de Markup ---------- */
  function readNumber(id) { var el = document.getElementById(id); return el ? parseFloat(el.value) : NaN; }
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  function calcularMarkup(e) {
    if (e) e.preventDefault();
    var errBox = document.getElementById('calcError');
    var errMsg = document.getElementById('calcErrorMsg');
    var res = document.getElementById('calcResultado');

    var input = {
      cost: readNumber('custoDireto'),
      varPct: readNumber('despesasVar') || 0,
      fixPct: readNumber('despesasFixas') || 0,
      marginPct: readNumber('margemLucro') || 0,
      qty: readNumber('quantidade') || 1,
      practiced: readNumber('precoPraticado') || 0
    };

    if (!isFinite(input.cost) || input.cost <= 0) {
      errBox.hidden = false;
      errMsg.textContent = ' Informe um custo direto unitário maior que zero.';
      res.hidden = true;
      return;
    }

    var r = F.markup(input);
    if (!r.ok) {
      errBox.hidden = false;
      errMsg.textContent = ' ' + r.error;
      res.hidden = true;
      return;
    }
    errBox.hidden = true;

    setText('resPreco', F.brl(r.price));
    setText('resDivisor', r.divisor.toFixed(4));
    setText('resMult', r.multiplier.toFixed(4));
    setText('resLucro', F.brl(r.unitProfit));
    setText('resFat', F.brl(r.revenue));
    setText('resCusto', F.brl(r.totalCost));
    setText('resDesp', F.brl(r.opExp));
    setText('resMargem', F.pctFromRatio(r.marginResult));
    setText('resFatNota', r.qty + ' unidade(s)');
    setText('resPrecoNota', r.practiced ? 'Preço praticado: ' + F.brl(r.practiced.price) : '');

    var note = document.getElementById('resPrecoNota');
    if (r.practiced) {
      var diff = r.practiced.diff;
      note.textContent = 'Praticado ' + F.brl(r.practiced.price) + ' (' + (diff >= 0 ? '+' : '') + F.brl(diff) + ') · margem ' + F.pctFromRatio(r.practiced.margin);
    } else { note.textContent = ''; }

    res.hidden = false;
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function fillExample() {
    document.getElementById('nomeProduto').value = 'Doce artesanal (unidade)';
    document.getElementById('custoDireto').value = 4.5;
    document.getElementById('despesasVar').value = 8;
    document.getElementById('despesasFixas').value = 12;
    document.getElementById('margemLucro').value = 25;
    document.getElementById('quantidade').value = 100;
    document.getElementById('precoPraticado').value = 12;
    calcularMarkup();
  }

  function resetCalc() {
    ['nomeProduto', 'custoDireto', 'despesasVar', 'despesasFixas', 'margemLucro', 'precoPraticado'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });
    document.getElementById('quantidade').value = 1;
    document.getElementById('calcResultado').hidden = true;
    document.getElementById('calcError').hidden = true;
  }

  function saveCalc() {
    if (!window.ResolutaAuth || !window.ResolutaAuth.isLoggedIn()) {
      openAuth('register');
      return;
    }
    var input = {
      cost: readNumber('custoDireto'), varPct: readNumber('despesasVar') || 0,
      fixPct: readNumber('despesasFixas') || 0, marginPct: readNumber('margemLucro') || 0,
      qty: readNumber('quantidade') || 1, practiced: readNumber('precoPraticado') || 0
    };
    var r = F.markup(input);
    if (!r.ok) { alert(r.error); return; }
    window.Store.add('products', {
      name: document.getElementById('nomeProduto').value || 'Produto sem nome',
      cost: input.cost, varPct: input.varPct, fixPct: input.fixPct, marginPct: input.marginPct,
      qty: input.qty, practiced: input.practiced
    });
    alert('Precificação salva no seu painel! Acesse "Precificação" no aplicativo para consultá-la.');
  }

  /* ---------- Autenticação (modais) ---------- */
  var modal, authAlert;

  function showAlert(msg, type) {
    if (!authAlert) return;
    authAlert.className = 'alert alert-' + (type || 'error');
    authAlert.innerHTML = '<i class="fa-solid ' + (type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation') + '" aria-hidden="true"></i><div>' + msg + '</div>';
    authAlert.hidden = false;
  }
  function hideAlert() { if (authAlert) authAlert.hidden = true; }

  function switchTab(tab) {
     console.log('Trocando para:', tab);
    hideAlert();
    var forms = { login: 'loginForm', register: 'registerForm', forgot: 'forgotForm' };
    Object.keys(forms).forEach(function (k) {
      var f = document.getElementById(forms[k]); if (f) {
    f.hidden = (k !== tab);
    console.log(k, f.hidden);
}

    });
    document.querySelectorAll('[data-auth-tab]').forEach(function (b) {
      var t = b.getAttribute('data-auth-tab');
      if (b.classList.contains('active') || b.getAttribute('role') === 'tab') b.classList.toggle('active', t === tab);
    });
    var titles = { login: ['Bem-vindo de volta', 'Acesse sua conta para continuar.'], register: ['Crie sua conta gratuita', 'Comece a organizar suas finanças hoje.'], forgot: ['Recuperar senha', 'Redefina o acesso à sua conta.'] };
    var t = titles[tab] || titles.login;
    document.getElementById('authTitle').textContent = t[0];
    document.getElementById('authSubtitle').textContent = t[1];
  }

  function openAuth(tab) {
    if (!modal) modal = document.getElementById('authModal');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    switchTab(tab || 'login');
    setTimeout(function () { var f = modal.querySelector('input:not([type=checkbox])'); if (f) f.focus(); }, 60);
  }
  function closeAuth() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function bindAuth() {
    modal = document.getElementById('authModal');
    authAlert = document.getElementById('authAlert');
    document.querySelectorAll('[data-open-auth]').forEach(function (b) {
      b.addEventListener('click', function () { openAuth(b.getAttribute('data-open-auth')); });
    });
    document.querySelectorAll('[data-close-modal]').forEach(function (b) { b.addEventListener('click', closeAuth); });
    if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeAuth(); });
    document.querySelectorAll('[data-auth-tab]').forEach(function (b) {
      b.addEventListener('click', function () { switchTab(b.getAttribute('data-auth-tab')); });
    });

    // Força de senha
    var pw = document.getElementById('regPassword'), meter = document.getElementById('pwMeter'), label = document.getElementById('pwLabel');
    if (pw && meter) {
      pw.addEventListener('input', function () {
        var s = window.ResolutaAuth.passwordStrength(pw.value);
        meter.className = 'pw-meter s' + s.score;
        label.textContent = pw.value ? ('Força: ' + s.label + '. ' + (s.score < 3 ? 'Use 8+ caracteres com letras, números e símbolo.' : 'Ótima senha!')) : 'Use ao menos 8 caracteres, com letras, números e símbolo.';
      });
    }
    var pw2 = document.getElementById('forgotNew'), meter2 = document.getElementById('pwMeter2');
    if (pw2 && meter2) {
      pw2.addEventListener('input', function () {
        var s = window.ResolutaAuth.passwordStrength(pw2.value);
        meter2.className = 'pw-meter s' + s.score;
      });
    }

    // Login
    var loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = document.getElementById('loginEmail').value;
      var pass = document.getElementById('loginPassword').value;
      var remember = document.getElementById('loginRemember').checked;
      var res = await window.ResolutaAuth.login(email, pass, remember);
      if (res.ok) {
        showAlert('Login realizado com sucesso! Redirecionando…', 'success');
        setTimeout(function () { window.location.href = 'app.html'; }, 700);
      } else { showAlert(res.error); }
    });

    // Registro
    var regForm = document.getElementById('registerForm');
    if (regForm) regForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var data = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        confirm: document.getElementById('regConfirm').value,
        profile: document.getElementById('regProfile').value,
        securityAnswer: document.getElementById('regAnswer').value,
        acceptTerms: document.getElementById('regTerms').checked
      };
      var res = await window.ResolutaAuth.register(data);
      if (res.ok) {
        showAlert('Conta criada com sucesso! Bem-vindo(a), ' + res.user.name + '.', 'success');
        setTimeout(function () { window.location.href = 'app.html'; }, 800);
      } else { showAlert(res.error); }
    });

    // Recuperar senha
var forgotForm = document.getElementById('forgotForm');

if (forgotForm) forgotForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  var res = await window.ResolutaAuth.resetPassword(
    document.getElementById('forgotEmail').value
  );

  if (res.ok) {
    alert('Verifique sua caixa de entrada para redefinir sua senha.');

    setTimeout(function () {
      switchTab('login');
    }, 2000);

  } else {
    alert(res.error);
  }
});
   
  }

  /* ---------- Cookies (LGPD) ---------- */
  function initCookies() {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;
    var consent = null;
    try { consent = JSON.parse(localStorage.getItem('resoluta.cookies.v1') || 'null'); } catch (e) {}
    function syncBody() { document.body.classList.toggle('cookie-open', banner.classList.contains('show')); }
    if (!consent) { banner.classList.add('show'); syncBody(); }
    function setConsent(level) {
      try { localStorage.setItem('resoluta.cookies.v1', JSON.stringify({ level: level, date: Date.now() })); } catch (e) {}
      banner.classList.remove('show'); syncBody();
    }
    var a = document.getElementById('cookieAccept'), b = document.getElementById('cookieEssential');
    if (a) a.addEventListener('click', function () { setConsent('all'); });
    if (b) b.addEventListener('click', function () { setConsent('essential'); });
    document.querySelectorAll('[data-open-cookies]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); banner.classList.add('show'); syncBody(); });
    });
  }

  /* ---------- Navegação ---------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.innerHTML = '<i class="fa-solid ' + (open ? 'fa-xmark' : 'fa-bars') + '" aria-hidden="true"></i>';
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>'; });
      });
    }
    var header = document.querySelector('.header');
    if (header) window.addEventListener('scroll', function () { header.classList.toggle('scrolled', window.scrollY > 20); }, { passive: true });

    // Link ativo conforme seção
    var sections = document.querySelectorAll('main section[id]');
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if ('IntersectionObserver' in window && sections.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id); });
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { obs.observe(s); });
    }
  }

  /* ---------- Reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { obs.observe(e); });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (window.ResolutaA11y) window.ResolutaA11y.init();
    renderTools();
    renderPlans();
    bindAuth();
    initCookies();
    initNav();
    initReveal();

    var form = document.getElementById('markupForm');
    if (form) form.addEventListener('submit', calcularMarkup);
    var ex = document.getElementById('calcExample'); if (ex) ex.addEventListener('click', fillExample);
    var rs = document.getElementById('calcReset'); if (rs) rs.addEventListener('click', resetCalc);
    var sv = document.getElementById('calcSave'); if (sv) sv.addEventListener('click', saveCalc);

    var ano = document.getElementById('anoAtual'); if (ano) ano.textContent = new Date().getFullYear();

    // Se já logado, ajusta botões do header
    if (window.ResolutaAuth && window.ResolutaAuth.isLoggedIn()) {
      var u = window.ResolutaAuth.currentUser();
      document.querySelectorAll('[data-open-auth]').forEach(function (b) { b.style.display = 'none'; });
      var nav = document.querySelector('.nav-actions');
      if (nav) {
        var a = document.createElement('a');
        a.className = 'btn btn-primary btn-sm'; a.href = 'app.html';
        a.innerHTML = '<i class="fa-solid fa-gauge-high" aria-hidden="true"></i> Meu painel';
        nav.insertBefore(a, nav.firstChild);
      }
    }
  });
})();
const sendEmailBtn = document.getElementById('sendEmailRecoveryBtn');

if (sendEmailBtn) {

  sendEmailBtn.addEventListener('click', async () => {

    const emailInput = document.getElementById('recoveryEmail');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      alert('Por favor, informe seu e-mail.');
      return;
    }

    if (!window.supabaseClient) {
      alert('Erro crítico: Cliente Supabase não inicializado.');
      return;
    }

    sendEmailBtn.disabled = true;
    sendEmailBtn.textContent = 'Enviando...';

    try {

      const response = await fetch(
  'https://resolutaagi.app.n8n.cloud/webhook/resoluta-recuperar-senha',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email
    })
  }
);

if (!response.ok) {
  throw new Error('Falha ao enviar código.');
}

     alert('Código de recuperação enviado com sucesso! Verifique seu e-mail.');

      emailInput.value = '';

    } catch (err) {

      alert(
        err.message ||
        'Ocorreu um erro ao enviar o e-mail.'
      );

    } finally {

      sendEmailBtn.disabled = false;
      sendEmailBtn.textContent =
        'Enviar link de recuperação';

    }

  });

}
const validateOtpBtn = document.getElementById('validateOtpBtn');

if (validateOtpBtn) {
  validateOtpBtn.addEventListener('click', async () => {
  const email = document.getElementById('recoveryEmail').value.trim();
  const otpCode = document.getElementById('otpCode').value.trim();

  if (!email || !otpCode) {
    alert('❌ Por favor, preencha o e-mail e o código OTP.');
    return;
  }

  try {
    const { data, error } = await window.supabaseClient
      .from('password_reset_codes')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otpCode)
     .eq('used', false)
.order('created_at', { ascending: false })
.limit(1);
     console.log('DATA:', data);
console.log('ERROR:', error);
if (error || !data.length) {
      alert('❌ Código inválido');
      return;
    }

    otpValidated = true;
    alert('✅ Código validado com sucesso');
  } catch (err) {
    console.error('Erro ao validar o código:', err);
    alert('❌ Código inválido');
  }
});
   }
