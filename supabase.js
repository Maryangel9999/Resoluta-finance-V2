(function (global) {
  'use strict';

  var SUPABASE_URL = 'https://rflziflcxmfvetobdqyk.supabase.co';

  var SUPABASE_ANON_KEY = 'sb_publishable_YSZm2fIyu0QQfMJRxhsWxw_xFNOoWzb';

  if (global.supabase && typeof global.supabase.createClient === 'function') {
    global.supabaseClient = global.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  } else {
    console.error('Biblioteca do Supabase nao encontrada.');
  }
})(typeof window !== 'undefined' ? window : this);
