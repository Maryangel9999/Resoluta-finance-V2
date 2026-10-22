/* Resoluta Finance — adaptador de autenticacao Supabase Auth.
   Interface publica legada preservada; identidades e dados nao sao mais
   autenticados ou persistidos nas chaves antigas do browser. */
(function(global) {
'use strict';
var MAX_ATTEMPTS=3, LOCK_MS=300000;
var client=null, user=null, profileData=null, listeners=[], initPromise=null, dataSaveQueue=Promise.resolve(), statusError=null;
var locks={};
function clean(x) {return String(x==null?'':x).replace(/[<>]/g,function(c){return c==='<'?'&lt;':'&gt;';}).replace(/[\u0000-\u001f]/g,'');}
function email(x){return String(x||'').trim().toLowerCase();}
function validEmail(x){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(x||'').trim());}
function strength(p){p=String(p||'');var n=0;if(p.length>=8)n++;if(p.length>=12)n++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))n++;if(/\d/.test(p))n++;if(/[^A-Za-z0-9]/.test(p))n++;if(/(.)\1{2,}/.test(p))n=Math.max(0,n-1);if(/^(123456|senha|password|qwerty|abc123)/i.test(p))n=0;n=Math.max(0,Math.min(4,n));return {score:n,label:['Muito fraca','Fraca','Razoável','Boa','Forte'][n],percent:n*25};}
function normalize(u){if(!u)return null;return {id:u.id,name:clean(u.user_metadata&&u.user_metadata.name||u.email.split('@')[0]),email:u.email,profile:u.user_metadata&&u.user_metadata.profile==='pj'?'pj':'pf',createdAt:Date.parse(u.created_at)||Date.now()};}
function emit(){listeners.slice().forEach(function(fn){try{fn(user);}catch(e){}});}
function onChange(fn){listeners.push(fn);return function(){listeners=listeners.filter(function(v){return v!==fn;});};}
function scriptClient(){
 return new Promise(function(resolve,reject){
   if(global.ResolutaSupabase)return resolve(global.ResolutaSupabase);
   var script=document.createElement('script');script.src='supabase.js';script.async=true;
   script.onload=function(){global.ResolutaSupabase?resolve(global.ResolutaSupabase):reject(new Error('Cliente Supabase indisponível.'));};
   script.onerror=function(){reject(new Error('Não foi possível carregar supabase.js.'));};
   document.head.appendChild(script);
 });
}
function readRemote(){
 if(!user){profileData=null;return Promise.resolve(null);}
 return client.from('User-Data').select('dados_json').eq('user_id',user.id).maybeSingle().then(function(result){
   if(result.error)throw result.error;
   profileData=result.data?result.data.dados_json:null;
   return profileData;
 });
}
function init(){
 if(initPromise)return initPromise;
 initPromise=scriptClient().then(function(config){return config.getClient();}).then(function(sb){
   client=sb;
   client.auth.onAuthStateChange(function(event,session){
     // Nao executar chamadas de Supabase neste callback, evitando deadlocks.
     if(event==='SIGNED_OUT'){user=null;profileData=null;emit();}
   });
   return client.auth.getSession();
 }).then(function(result){
   if(result.error)throw result.error;
   if(!result.data.session){user=null;profileData=null;emit();return null;}
   return client.auth.getUser().then(function(result){
     if(result.error)throw result.error;
     user=normalize(result.data.user);
     return readRemote().then(function(){emit();return user;});
   });
 }).catch(function(err){statusError=err;initPromise=null;throw err;});
 return initPromise;
}
function failure(e){return {ok:false,error:e&&e.message?e.message:'Não foi possível concluir a operação.'};}
function currentUser(){return user;}
function isLoggedIn(){return !!user;}
function lockRemaining(e){var x=locks[email(e)];return x?Math.max(0,x.until-Date.now()):0;}
async function register(data){
 try {
   await init();
   var name=clean(data.name).trim(),mail=email(data.email),password=String(data.password||'');
   if(name.length<3)return {ok:false,error:'Informe seu nome completo.'};
   if(!validEmail(mail))return {ok:false,error:'Informe um e-mail válido.'};
   if(strength(password).score<2)return {ok:false,error:'Senha muito fraca. Use ao menos 8 caracteres com letras e números.'};
   if(password!==data.confirm)return {ok:false,error:'As senhas não conferem.'};
   if(data.acceptTerms===false)return {ok:false,error:'É necessário aceitar os Termos de Uso e a Política de Privacidade.'};
   var result=await client.auth.signUp({email:mail,password:password,options:{data:{name:name,profile:data.profile==='pj'?'pj':'pf'}}});
   if(result.error)throw result.error;
   if(!result.data.session)return {ok:false,pendingConfirmation:true,error:'Cadastro solicitado. Confirme seu e-mail antes de entrar.'};
   user=normalize(result.data.user);profileData=null;emit();
   return {ok:true,user:user};
 }catch(e){return failure(e);}
}
async function login(mail,password,remember){
 mail=email(mail);
 var remain=lockRemaining(mail);
 if(remain)return {ok:false,locked:true,error:'Conta temporariamente bloqueada por segurança. Tente novamente em '+Math.ceil(remain/60000)+' minuto(s).'};
 try {
   await init();
   global.ResolutaSupabase.setRemember(remember!==false);
   var result=await client.auth.signInWithPassword({email:mail,password:String(password||'')});
   if(result.error) {
     var l=locks[mail]||{attempts:0,until:0};l.attempts++;
     if(l.attempts>=MAX_ATTEMPTS){locks[mail]={attempts:0,until:Date.now()+LOCK_MS};return {ok:false,locked:true,error:'Você atingiu 3 tentativas. Conta bloqueada por 5 minutos.'};}
     locks[mail]=l;
     return {ok:false,error:'E-mail ou senha incorretos. Tentativas restantes: '+(MAX_ATTEMPTS-l.attempts)+'.'};
   }
   delete locks[mail];
   user=normalize(result.data.user);
   await readRemote();emit();
   return {ok:true,user:user};
 }catch(e){return failure(e);}
}
async function logout(){
 try {
   await init();
   await dataSaveQueue;
   var result=await client.auth.signOut();
   if(result.error)throw result.error;
   user=null;profileData=null;emit();
   return {ok:true};
 }catch(e){return failure(e);}
}
async function resetPassword(mail,_answer,_newPassword){
 try {
   await init();
   if(!validEmail(email(mail)))return {ok:false,error:'Informe um e-mail válido.'};
   var result=await client.auth.resetPasswordForEmail(email(mail),{redirectTo:new URL('index.html',location.href).href});
   if(result.error)throw result.error;
   return {ok:true,pendingEmail:true};
 }catch(e){return failure(e);}
}
function loadData(){return profileData;}
function saveData(value){
 if(!user||!client)return false;
 var owner=user.id,payload=JSON.parse(JSON.stringify(value));
 profileData=payload;
 dataSaveQueue=dataSaveQueue.catch(function(){}).then(async function(){
   var response=await client.from('User-Data').select('id').eq('user_id',owner).maybeSingle();
   if(response.error)throw response.error;
   var result;
   if(response.data)result=await client.from('User-Data').update({dados_json:payload,updated_at:new Date().toISOString()}).eq('user_id',owner);
   else result=await client.from('User-Data').insert({user_id:owner,dados_json:payload});
   if(result.error)throw result.error;
 }).catch(function(e){statusError=e;global.dispatchEvent(new CustomEvent('resoluta:data-error',{detail:{message:e.message}}));throw e;});
 return true;
}
function clearData(){return saveData(null);}
function getSession(){return init().then(function(){return client.auth.getSession();});}
function getUser(){return init().then(function(){return client.auth.getUser();});}
global.ResolutaAuth={
  ready:init,register:register,login:login,logout:logout,resetPassword:resetPassword,
  currentUser:currentUser,isLoggedIn:isLoggedIn,onChange:onChange,
  passwordStrength:strength,lockRemaining:lockRemaining,loadData:loadData,
  saveData:saveData,clearData:clearData,sanitize:clean,isValidEmail:validEmail,
  getSession:getSession,getUser:getUser,lastError:function(){return statusError;},
  whenSaved:function(){return dataSaveQueue;},MAX_ATTEMPTS:MAX_ATTEMPTS
};
})(typeof window!=='undefined'?window:this);
