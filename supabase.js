/* Resoluta Finance — cliente Supabase (somente credenciais PUBLICAS). */
(function (global) {
  'use strict';

  // Preencher com Project URL e Publishable key do MESMO projeto Supabase.
  // NUNCA colocar secret key / service_role neste arquivo publico.
  var SUPABASE_URL = '';
  var SUPABASE_PUBLISHABLE_KEY = '';
  // Versao fixa para evitar atualizacoes inesperadas da biblioteca em producao.
  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0';

  var clientPromise = null;
  var remember = true;

  function storage() {
    return {
      getItem: function (key) {
        try {
          var temporary = global.sessionStorage.getItem(key);
          if (temporary !== null) { remember = false; return temporary; }
          var persistent = global.localStorage.getItem(key);
          if (persistent !== null) remember = true;
          return persistent;
        } catch (e) { return null; }
      },
      setItem: function (key, value) {
        try {
          if (remember) {
            global.localStorage.setItem(key, value);
            global.sessionStorage.removeItem(key);
          } else {
            global.sessionStorage.setItem(key, value);
            global.localStorage.removeItem(key);
          }
        } catch (e) { throw new Error('Nao foi possivel guardar a sessao no navegador.'); }
      },
      removeItem: function (key) {
        try {
          global.localStorage.removeItem(key);
          global.sessionStorage.removeItem(key);
        } catch (e) {}
      }
    };
  }

  function loadSdk() {
    if (global.supabase && typeof global.supabase.createClient === 'function') {
      return Promise.resolve(global.supabase);
    }
    return new Promise(function (resolve, reject) {
      var element = document.createElement('script');
      element.src = SDK_URL;
      element.async = true;
      element.onload = function () {
        if (global.supabase && typeof global.supabase.createClient === 'function') resolve(global.supabase);
        else reject(new Error('Biblioteca Supabase indisponivel.'));
      };
      element.onerror = function () { reject(new Error('Falha ao carregar a biblioteca Supabase.')); };
      document.head.appendChild(element);
    });
  }

  function getClient() {
    if (!clientPromise) {
      if (!/^https:\/\/[^/]+\.supabase\.co\/?$/.test(SUPABASE_URL) ||
          !SUPABASE_PUBLISHABLE_KEY || !/^(sb_publishable_|eyJ)/.test(SUPABASE_PUBLISHABLE_KEY)) {
        return Promise.reject(new Error('Supabase nao configurado: informe a URL e a chave PUBLICA em supabase.js.'));
      }
      clientPromise = loadSdk().then(function (sdk) {
        return sdk.createClient(SUPABASE_URL.replace(/\/$/, ''), SUPABASE_PUBLISHABLE_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'implicit',
            storage: storage()
          }
        });
      });
    }
    return clientPromise;
  }

  global.ResolutaSupabase = {
    getClient: getClient,
    setRemember: function (value) { remember = value !== false; }
  };
})(typeof window !== 'undefined' ? window : this);
