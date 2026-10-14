/* =====================================================================
   Autenticação do sistema de desligamentos
   ---------------------------------------------------------------------
   ATENÇÃO: este login roda 100% no navegador. Ele organiza o acesso por
   perfil (RH, TI, Admin) e registra quem fez cada ação, mas NÃO é uma
   barreira de segurança real: quem abrir o código-fonte consegue ver a
   lista de usuários. Para uso em produção, troque por autenticação de
   servidor (ex.: Supabase Auth, como no Portal RH).
   ===================================================================== */
(function(global){
"use strict";

/* Troque para false antes de usar de verdade: esconde as contas de teste na tela. */
const MOSTRAR_DEMO = true;

const SESSAO_KEY = "desligamentos.sessao";
const TENTATIVAS_KEY = "desligamentos.tentativas";
const MAX_TENTATIVAS = 5;
const BLOQUEIO_SEG = 30;
const DURACAO_SESSAO_H = 8;

/* hash = SHA-256( "desl:" + usuario + ":" + senha ) */
const USUARIOS = [
  { usuario:"admin", nome:"Administrador", perfil:"admin",
    hash:"c6bd288329e56ed087088624db21426efe213d9e44911d404de25044f4093f7f" },
  { usuario:"rh", nome:"Equipe RH", perfil:"rh",
    hash:"646a866600e92f5217d3a264cc3eb1bb3bd8da7f2e438a8082c74bfea2c11257" },
  { usuario:"ti", nome:"Equipe TI", perfil:"ti",
    hash:"0d642db57b57e16b126b48416f6e34899dfcd9ce875c2a7b6724286a1f504b56" }
];

const DEMO = [
  { usuario:"admin", senha:"admin@2026", perfil:"Acesso total" },
  { usuario:"rh",    senha:"rh@2026",    perfil:"Painel, colaboradores e novos desligamentos" },
  { usuario:"ti",    senha:"ti@2026",    perfil:"Área do TI (revogar acessos)" }
];

/* O que cada perfil enxerga e pode fazer */
const PERFIS = {
  admin: { rotulo:"Administrador", telas:["painel","colaboradores","detalhe","novo","ti"], inicio:"painel",
           revogar:true, apagar:true },
  rh:    { rotulo:"RH", telas:["painel","colaboradores","detalhe","novo"], inicio:"painel",
           revogar:false, apagar:false },
  ti:    { rotulo:"TI", telas:["ti"], inicio:"ti",
           revogar:true, apagar:false }
};

/* ---------- SHA-256 em JS puro (funciona também em file://) ---------- */
function sha256(texto){
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  const bytes = new TextEncoder().encode(texto);
  const len = bytes.length;
  const total = (((len + 9 + 63) >> 6) << 6);
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(total - 8, Math.floor((len * 8) / 0x100000000));
  view.setUint32(total - 4, (len * 8) >>> 0);

  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,
      h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  const w = new Uint32Array(64);
  const rotr = (x,n) => (x >>> n) | (x << (32 - n));

  for(let off = 0; off < total; off += 64){
    for(let i = 0; i < 16; i++) w[i] = view.getUint32(off + i*4);
    for(let i = 16; i < 64; i++){
      const s0 = rotr(w[i-15],7) ^ rotr(w[i-15],18) ^ (w[i-15] >>> 3);
      const s1 = rotr(w[i-2],17) ^ rotr(w[i-2],19) ^ (w[i-2] >>> 10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0;
    }
    let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
    for(let i = 0; i < 64; i++){
      const S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h=g; g=f; f=e; e=(d + t1) >>> 0; d=c; c=b; b=a; a=(t1 + t2) >>> 0;
    }
    h0=(h0+a)>>>0; h1=(h1+b)>>>0; h2=(h2+c)>>>0; h3=(h3+d)>>>0;
    h4=(h4+e)>>>0; h5=(h5+f)>>>0; h6=(h6+g)>>>0; h7=(h7+h)>>>0;
  }
  return [h0,h1,h2,h3,h4,h5,h6,h7].map(x => x.toString(16).padStart(8,"0")).join("");
}

function hashSenha(usuario, senha){
  return sha256("desl:" + String(usuario).trim().toLowerCase() + ":" + senha);
}

/* ---------- armazenamento (sessionStorage; localStorage se "manter conectado") ---------- */
function ler(store, k){ try{ return store.getItem(k); }catch(e){ return null; } }
function gravar(store, k, v){ try{ store.setItem(k, v); }catch(e){} }
function apagar(store, k){ try{ store.removeItem(k); }catch(e){} }

/* cópia em memória: garante o login mesmo se o navegador bloquear o armazenamento */
let sessaoMemoria = null;
let tentativasMemoria = { n:0, ate:0 };

function sessao(){
  let s = sessaoMemoria;
  if(!s){
    const raw = ler(sessionStorage, SESSAO_KEY) || ler(localStorage, SESSAO_KEY);
    if(raw){ try{ s = JSON.parse(raw); }catch(e){ s = null; } }
  }
  if(!s || !s.usuario || !PERFIS[s.perfil]) return null;
  if(Date.now() > s.exp){ sair(); return null; }
  return s;
}

function sair(){
  sessaoMemoria = null;
  apagar(sessionStorage, SESSAO_KEY);
  apagar(localStorage, SESSAO_KEY);
}

/* ---------- bloqueio por tentativas erradas ---------- */
function lerTentativas(){
  try{
    const t = JSON.parse(ler(sessionStorage, TENTATIVAS_KEY));
    if(t && typeof t.n === "number") return t;
  }catch(e){}
  return tentativasMemoria;
}
function segundosBloqueado(){
  const t = lerTentativas();
  const resta = Math.ceil((t.ate - Date.now()) / 1000);
  return resta > 0 ? resta : 0;
}
function registrarFalha(){
  const t = lerTentativas();
  t.n += 1;
  if(t.n >= MAX_TENTATIVAS){ t.ate = Date.now() + BLOQUEIO_SEG * 1000; t.n = 0; }
  tentativasMemoria = t;
  gravar(sessionStorage, TENTATIVAS_KEY, JSON.stringify(t));
}
function limparFalhas(){
  tentativasMemoria = { n:0, ate:0 };
  apagar(sessionStorage, TENTATIVAS_KEY);
}

/* ---------- entrar ---------- */
function entrar(usuario, senha, manter){
  const bloqueio = segundosBloqueado();
  if(bloqueio) return { ok:false, motivo:"bloqueado", segundos:bloqueio };

  const u = String(usuario||"").trim().toLowerCase();
  if(!u || !senha) return { ok:false, motivo:"vazio" };

  const conta = USUARIOS.find(x => x.usuario === u);
  const hash = hashSenha(u, senha);
  /* compara sempre, mesmo sem conta, para não revelar se o usuário existe */
  const confere = conta ? (conta.hash === hash) : false;

  if(!confere){
    registrarFalha();
    const b = segundosBloqueado();
    return b ? { ok:false, motivo:"bloqueado", segundos:b } : { ok:false, motivo:"invalido" };
  }

  limparFalhas();
  const s = {
    usuario: conta.usuario, nome: conta.nome, perfil: conta.perfil,
    exp: Date.now() + DURACAO_SESSAO_H * 3600 * 1000
  };
  sessaoMemoria = s;
  gravar(manter ? localStorage : sessionStorage, SESSAO_KEY, JSON.stringify(s));
  return { ok:true, sessao:s };
}

/* ---------- permissões ---------- */
function podeVer(tela){
  const s = sessao();
  return !!(s && PERFIS[s.perfil].telas.indexOf(tela) !== -1);
}
function pode(acao){
  const s = sessao();
  return !!(s && PERFIS[s.perfil][acao]);
}
function telaInicial(){
  const s = sessao();
  return s ? PERFIS[s.perfil].inicio : null;
}

global.Auth = {
  MOSTRAR_DEMO, DEMO, PERFIS,
  entrar, sair, sessao, podeVer, pode, telaInicial,
  segundosBloqueado,
  /* utilitário para cadastrar novos usuários: no console, rode  Auth.gerarHash("maria","senha")  */
  gerarHash: hashSenha
};
})(window);
