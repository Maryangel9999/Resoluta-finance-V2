/* ==========================================================================
   Resoluta Finance — Conexão Supabase
   ========================================================================== */
(function (global) {
  'use strict';

  var SUPABASE_URL = 'https://rflziflcxmfvetobdqyk.supabase.co';

  var SUPABASE_ANON_KEY = 'COLE_AQUI_SUA_PUBLISHABLE_KEY';

  if (global.supabase && typeof global.supabase.createClient === 'function') {
    global.supabaseClient = global.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  } else {
    console.error('Biblioteca do Supabase não encontrada.');
  }
})(typeof window !== 'undefined' ? window : this);
