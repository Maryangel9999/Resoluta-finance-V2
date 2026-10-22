/* ==========================================================================
   Resoluta Finance — Módulo de Autenticação e Sessão
   --------------------------------------------------------------------------
   Observação de segurança: em produção, o hashing de senhas (bcrypt) e a
   validação devem ocorrer no BACK-END. Nesta versão estática (GitHub Pages),
   usamos Web Crypto (PBKDF2-SHA256, 150.000 iterações + salt aleatório) como
   equivalente seguro no cliente, com a mesma interface para migração futura.
   ========================================================================== */
(function (global) {
  'use strict';

  var USERS_KEY = 'resoluta.users.v1';
  var SESSION_KEY = 'resoluta.session.v1';
  var LOCK_KEY = 'resoluta.lock.v1';
  var MAX_ATTEMPTS = 3;
  var LOCK_MS = 5 * 60 * 1000; // 5 minutos

  /* ---------- Utilidades criptográficas ---------- */
  function toHex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ('00' + b.toString(16)).slice(-2);
    }).join('');
  }

  function randomSalt(len) {
    var a = new Uint8Array(len || 16);
    if (global.crypto && global.crypto.getRandomValues) global.crypto.getRandomValues(a);
    else for (var i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256);
    return toHex(a);
  }

  // Fallback determinístico caso crypto.subtle não esteja disponível (ex.: file://)
  function fallbackHash(str) {
    var h1 = 0x811c9dc5, h2 = 0x1000193;
    for (var i = 0; i < str.length; i++) {
      h1 ^= str.charCodeAt(i); h1 = (h1 * 16777619) >>> 0;
      h2 = ((h2 << 5) - h2 + str.charCodeAt(i)) >>> 0;
    }
    return 'fb$' + h1.toString(16) + h2.toString(16);
  }

  async function hashPassword(password, salt) {
    if (!(global.crypto && global.crypto.subtle)) return fallbackHash(salt + '::' + password);
    var enc = new TextEncoder();
    var keyMaterial = await global.crypto.subtle.importKey(
      'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
    );
    var bits = await global.crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: 150000, hash: 'SHA-256' },
      keyMaterial, 256
    );
    return 'pbkdf2$150000$' + toHex(bits);
  }

  async function verifyPassword(password, salt, stored) {
    var computed = await hashPassword(password, salt);
    return timingSafeEqual(computed, stored);
  }

  function timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  /* ---------- Armazenamento ---------- */
  function readJSON(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { global.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function getUsers() { return readJSON(USERS_KEY, []); }
  function saveUsers(users) { writeJSON(USERS_KEY, users); }
  function normalizeEmail(e) { return String(e || '').trim().toLowerCase(); }

  /* ---------- Sanitização (anti-XSS) ---------- */
  function sanitize(str) {
    return String(str == null ? '' : str)
      .replace(/[<>]/g, function (c) { return c === '<' ? '<' : '>'; })
      .replace(/[\u0000-\u001f]/g, '');
  }
  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
  }

  /* ---------- Força de senha ---------- */
  function passwordStrength(pw) {
    pw = String(pw || '');
    var score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (/(.)\1{2,}/.test(pw)) score = Math.max(0, score - 1);
    if (/^(123456|senha|password|qwerty|abc123)/i.test(pw)) score = 0;
    score = Math.max(0, Math.min(4, score));
    var labels = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];
    return { score: score, label: labels[score], percent: score * 25 };
  }

  /* ---------- Bloqueio por tentativas ---------- */
  function getLock(email) {
    var locks = readJSON(LOCK_KEY, {});
    return locks[normalizeEmail(email)] || null;
  }
  function setLock(email, data) {
    var locks = readJSON(LOCK_KEY, {});
    locks[normalizeEmail(email)] = data;
    writeJSON(LOCK_KEY, locks);
  }
  function clearLock(email) {
    var locks = readJSON(LOCK_KEY, {});
    delete locks[normalizeEmail(email)];
    writeJSON(LOCK_KEY, locks);
  }
  function lockRemaining(email) {
    var lock = getLock(email);
    if (!lock || !lock.until) return 0;
    return Math.max(0, lock.until - Date.now());
  }

  /* ---------- Sessão ---------- */
  function setSession(user, remember) {
    var session = { id: user.id, email: user.email, name: user.name, profile: user.profile, since: Date.now() };
    try {
      if (remember) global.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else global.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {}
    emit(user);
  }
  function getSession() {
    var s = null;
    try { s = JSON.parse(global.localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) {}
    if (!s) { try { s = JSON.parse(global.sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (e) {} }
    return s;
  }
  function currentUser() {
    var s = getSession();
    if (!s) return null;
    var user = getUsers().filter(function (u) { return u.id === s.id; })[0];
    return user ? publicUser(user) : null;
  }
  function publicUser(u) {
    return { id: u.id, name: u.name, email: u.email, profile: u.profile, createdAt: u.createdAt };
  }
  function isLoggedIn() { return !!currentUser(); }
  function logout() {
    try { global.localStorage.removeItem(SESSION_KEY); global.sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    emit(null);
  }

  /* ---------- Eventos ---------- */
  var listeners = [];
  function emit(user) { listeners.forEach(function (cb) { try { cb(user); } catch (e) {} }); }
  function onChange(cb) { listeners.push(cb); return function () { listeners = listeners.filter(function (l) { return l !== cb; }); }; }

  /* ---------- Registro ---------- */
 async function register(data) {
  var name = sanitize(data.name).trim();
  var email = normalizeEmail(data.email);
  var password = String(data.password || '');
  var profile = data.profile === 'pj' ? 'pj' : 'pf';
  if (name.length < 3)
    return { ok: false, error: 'Informe seu nome completo.' };
  if (!isValidEmail(email))
    return { ok: false, error: 'Informe um e-mail válido.' };
  if (passwordStrength(password).score < 2)
    return {
      ok: false,
      error: 'Senha muito fraca. Use ao menos 8 caracteres com letras e números.'
    };
  if (data.password !== data.confirm)
    return { ok: false, error: 'As senhas não conferem.' };

  if (data.acceptTerms === false)
    return {
      ok: false,
      error: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.'
    };
  if (!global.supabaseClient) {
    return {
      ok: false,
      error: 'Cliente Supabase não inicializado.'
    };
  }
  var response = await global.supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        name: name,
        profile: profile
      }
    }
  });
  if (response.error) {
    return {
      ok: false,
      error: response.error.message
    };
  }
  var userObj = response.data.user;
  var mappedUser = {
    id: userObj.id,
    email: userObj.email,
    name: name,
    profile: profile,
    createdAt: Date.now()
  };
  return {
    ok: true,
    user: publicUser(mappedUser)
  };
}

  /* ---------- Login ---------- */
  async function login(email, password, remember) {
    email = normalizeEmail(email);
    password = String(password || '');

    var remaining = lockRemaining(email);
    if (remaining > 0) {
      var mins = Math.ceil(remaining / 60000);
      return { ok: false, locked: true, error: 'Conta temporariamente bloqueada por segurança. Tente novamente em ' + mins + ' minuto(s).' };
    }
    if (!global.supabaseClient) {
      return { ok: false, error: 'Cliente Supabase não inicializado.' };
    }

    var response = await global.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (response.error || !response.data || !response.data.user) {
      var lock = getLock(email) || { attempts: 0 };
      lock.attempts = (lock.attempts || 0) + 1;
      if (lock.attempts >= MAX_ATTEMPTS) {
        lock.until = Date.now() + LOCK_MS;
        lock.attempts = 0;
        setLock(email, lock);
        return { ok: false, locked: true, error: 'Você atingiu 3 tentativas. Conta bloqueada por 5 minutos.' };
      }
      setLock(email, lock);
      var left = MAX_ATTEMPTS - lock.attempts;
      return { ok: false, error: 'E-mail ou senha incorretos. Tentativas restantes: ' + left + '.' };
    }

    // Sincroniza o usuario do Supabase com o store local para manter
    // currentUser() / isLoggedIn() compativeis (nao alterados).
    var sbUser = response.data.user;
    var meta = sbUser.user_metadata || {};
    var users = getUsers();
    var user = users.filter(function (u) { return u.id === sbUser.id; })[0];
    if (!user) {
      user = {
        id: sbUser.id,
        email: normalizeEmail(sbUser.email || email),
        name: sanitize(meta.name || String(sbUser.email || email).split('@')[0]),
        profile: meta.profile === 'pj' ? 'pj' : 'pf',
        createdAt: Date.parse(sbUser.created_at) || Date.now()
      };
      users.push(user);
      saveUsers(users);
    } else {
      user.email = normalizeEmail(sbUser.email || user.email);
      if (meta.name) user.name = sanitize(meta.name);
      if (meta.profile) user.profile = meta.profile === 'pj' ? 'pj' : 'pf';
      saveUsers(users);
    }

    clearLock(email);
    setSession(user, remember !== false);
    return { ok: true, user: publicUser(user) };
  }
  /* ---------- Recuperação de senha ---------- */
  async function resetPassword(email, answer, newPassword) {
    email = normalizeEmail(email);
    var users = getUsers();
    var user = users.filter(function (u) { return u.email === email; })[0];
    if (!user) return { ok: false, error: 'Não encontramos uma conta com este e-mail.' };
    if (!user.ansHash) return { ok: false, error: 'Esta conta não possui pergunta de segurança configurada.' };
    if (passwordStrength(newPassword).score < 2) return { ok: false, error: 'Nova senha muito fraca.' };
    var ok = await verifyPassword(sanitize(answer).trim().toLowerCase(), user.ansSalt, user.ansHash);
    if (!ok) return { ok: false, error: 'Resposta de segurança incorreta.' };
    user.salt = randomSalt(16);
    user.hash = await hashPassword(newPassword, user.salt);
    saveUsers(users);
    clearLock(email);
    return { ok: true };
  }
  /* ---------- Isolamento de dados por usuário ---------- */
  function dataKey(userId) { return 'resoluta.data.' + userId + '.v1'; }
  function loadData() {
    var u = currentUser();
    if (!u) return null;
    return readJSON(dataKey(u.id), null);
  }
  function saveData(data) {
    var u = currentUser();
    if (!u) return false;
    writeJSON(dataKey(u.id), data);
    return true;
  }
  function clearData() {
    var u = currentUser();
    if (!u) return;
    try { global.localStorage.removeItem(dataKey(u.id)); } catch (e) {}
  }
  /* ---------- Export ---------- */
  global.ResolutaAuth = {
    register: register,
    login: login,
    logout: logout,
    resetPassword: resetPassword,
    currentUser: currentUser,
    isLoggedIn: isLoggedIn,
    onChange: onChange,
    passwordStrength: passwordStrength,
    lockRemaining: lockRemaining,
    loadData: loadData,
    saveData: saveData,
    clearData: clearData,
    sanitize: sanitize,
    isValidEmail: isValidEmail,
    MAX_ATTEMPTS: MAX_ATTEMPTS
  };
})(typeof window !== 'undefined' ? window : this);
