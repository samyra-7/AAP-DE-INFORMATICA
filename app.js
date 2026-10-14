(function(){
"use strict";
const KEY = "desligamentos.v1";
const KEY_TI = "desligamentos.respTI";
const KEY_TEMA = "desligamentos.tema";

const ETAPAS_PADRAO = [
  "Comunicação ao colaborador",
  "Comunicação ao time e ao gestor",
  "Exame demissional",
  "Entrevista de desligamento",
  "Cálculo das verbas rescisórias",
  "Assinatura dos documentos",
  "Pagamento da rescisão",
  "Baixa na carteira / eSocial"
];

let dados = [];
let atual = null;   // id do colaborador aberto
let viewAtual = "painel";

/* ---------- armazenamento ---------- */
function carregar(){
  try{
    const raw = localStorage.getItem(KEY);
    dados = raw ? JSON.parse(raw) : exemplos();
  }catch(e){ dados = exemplos(); }
  if(!Array.isArray(dados)) dados = [];
}
function salvar(){
  try{ localStorage.setItem(KEY, JSON.stringify(dados)); }
  catch(e){ toast("Não foi possível salvar neste navegador."); }
}
function lerCampo(k){ try{ return localStorage.getItem(k) || ""; }catch(e){ return ""; } }
function gravarCampo(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

/* ---------- usuário logado ---------- */
function quemSou(){ const s = window.Auth && Auth.sessao(); return s ? s.nome : ""; }

/* ---------- utilidades ---------- */
const uid = () => Math.random().toString(36).slice(2,10);
const hoje = () => { const d=new Date(); d.setHours(0,0,0,0); return d; };
function dataBR(iso){
  if(!iso) return "—";
  const [a,m,d] = iso.split("-");
  return d+"/"+m+"/"+a;
}
function diasPara(iso){
  if(!iso) return null;
  const [a,m,d] = iso.split("-").map(Number);
  const alvo = new Date(a, m-1, d);
  return Math.round((alvo - hoje()) / 86400000);
}
function agora(){
  const d = new Date();
  const p = n => String(n).padStart(2,"0");
  return p(d.getDate())+"/"+p(d.getMonth()+1)+"/"+d.getFullYear()+" "+p(d.getHours())+":"+p(d.getMinutes());
}
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function moeda(n){ return "R$ " + (Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:2, maximumFractionDigits:2}); }
function listar(txt){ return String(txt||"").split(",").map(s=>s.trim()).filter(Boolean); }
let toastTimer;
function toast(msg){
  document.querySelectorAll(".toast").forEach(t=>t.remove());
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = msg; el.setAttribute("role","status");
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.remove(), 2600);
}
function registrar(c, texto){ const q = quemSou(); c.log.unshift({ ts: agora(), texto: texto + (q ? " — por "+q : "") }); }

/* ---------- cálculos de status ---------- */
function pend(c){
  return {
    etapas: c.etapas.filter(e=>!e.feito).length,
    itens: c.itens.filter(i=>!i.devolvido).length,
    acessos: c.acessos.filter(a=>!a.revogado).length
  };
}
function totalPend(c){ const p = pend(c); return p.etapas + p.itens + p.acessos; }
function progresso(c){
  const total = c.etapas.length + c.itens.length + c.acessos.length;
  if(!total) return 100;
  return Math.round(((total - totalPend(c)) / total) * 100);
}
function urgente(c){
  const d = diasPara(c.ultimoDia);
  return totalPend(c) > 0 && d !== null && d <= 0;
}

/* ---------- dados de exemplo ---------- */
function novoRegistro(o){
  return {
    id: uid(), nome:o.nome, matricula:o.matricula, cargo:o.cargo, setor:o.setor,
    empresa:o.empresa, gestor:o.gestor, admissao:o.admissao, ultimoDia:o.ultimoDia,
    tipo:o.tipo, responsavel:o.responsavel, salario:o.salario||"", aviso:o.aviso||"indenizado", obs:o.obs||"",
    etapas: (o.etapas||ETAPAS_PADRAO).map(n=>({id:uid(), nome:n, feito:false, quem:"", quando:""})),
    itens: (o.equip||[]).map(n=>({id:uid(), nome:n, devolvido:false, obs:"", quem:"", quando:""})),
    acessos: (o.acessos||[]).map(n=>({id:uid(), nome:n, revogado:false, quem:"", quando:""})),
    entrevista: { feita:false, motivo:"", nota:"", recomendaria:"", comentarios:"", data:"" },
    log: [{ ts: agora(), texto: "Desligamento registrado no sistema" }]
  };
}
function exemplos(){
  const d = new Date();
  const iso = n => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()+n); return x.toISOString().slice(0,10); };
  const a = novoRegistro({nome:"Mariana Costa Ribeiro", matricula:"10482", cargo:"Analista Fiscal", setor:"Controladoria",
    empresa:"Matriz", gestor:"Paulo Andrade", admissao:"2021-03-15", ultimoDia:iso(4),
    tipo:"Pedido de demissão", responsavel:"RH", salario:"4200", aviso:"trabalhado",
    equip:["Notebook","Crachá","Celular corporativo"], acessos:["E-mail corporativo","Rede/AD","ERP","VPN"]});
  a.itens[1].devolvido = true; a.itens[1].quem="RH"; a.itens[1].quando=agora();
  a.etapas[0].feito = true; a.etapas[0].quem="RH"; a.etapas[0].quando=agora();
  a.etapas[1].feito = true; a.etapas[1].quem="RH"; a.etapas[1].quando=agora();

  const b = novoRegistro({nome:"Diego Fernandes Lima", matricula:"10233", cargo:"Auxiliar de Produção", setor:"Operações",
    empresa:"Unidade II", gestor:"Sandra Muniz", admissao:"2019-08-01", ultimoDia:iso(-3),
    tipo:"Dispensa sem justa causa", responsavel:"RH", salario:"2600", aviso:"indenizado",
    equip:["Crachá","Uniforme","Chaves do armário"], acessos:["E-mail corporativo","Sistema de ponto","Rede/AD"]});
  b.etapas.forEach((e,i)=>{ if(i<3){ e.feito=true; e.quem="RH"; e.quando=agora(); }});
  b.itens[0].devolvido=true; b.itens[0].quem="Portaria"; b.itens[0].quando=agora();
  b.entrevista = {feita:true, motivo:"Falta de perspectiva de crescimento", nota:"3", recomendaria:"Talvez",
    comentarios:"Gostava do time, sentiu falta de plano de carreira.", data:agora()};
  b.etapas[3].feito = true; b.etapas[3].quem="RH"; b.etapas[3].quando=agora();

  const c = novoRegistro({nome:"Helena Souza Prado", matricula:"10877", cargo:"Designer", setor:"Marketing",
    empresa:"Matriz", gestor:"Rafael Nunes", admissao:"2022-11-07", ultimoDia:iso(-20),
    tipo:"Acordo (art. 484-A)", responsavel:"RH", salario:"5100", aviso:"dispensado",
    equip:["Notebook","Monitor","Crachá"], acessos:["E-mail corporativo","Rede/AD","Figma","VPN"]});
  c.etapas.forEach(e=>{ e.feito=true; e.quem="RH"; e.quando=agora(); });
  c.itens.forEach(i=>{ i.devolvido=true; i.quem="TI"; i.quando=agora(); });
  c.acessos.forEach(x=>{ x.revogado=true; x.quem="TI"; x.quando=agora(); });
  c.entrevista = {feita:true, motivo:"Proposta melhor em outra empresa", nota:"4", recomendaria:"Sim",
    comentarios:"Saída em bons termos.", data:agora()};
  return [a,b,c];
}

/* ---------- navegação ---------- */
function irPara(v){
  if(!window.Auth || !Auth.sessao()){ return sairDoApp(); }
  if(!Auth.podeVer(v)){
    const ini = Auth.telaInicial();
    if(v !== ini) toast("Seu perfil não tem acesso a essa área.");
    v = ini;
  }
  viewAtual = v;
  document.querySelectorAll(".view").forEach(s => s.classList.toggle("is-active", s.id === "view-"+v));
  document.querySelectorAll("#nav button").forEach(b => b.setAttribute("aria-current", String(b.dataset.view === v)));
  window.scrollTo({top:0});
  render();
}
function abrir(id){ atual = id; irPara("detalhe"); }

/* ---------- render ---------- */
function render(){
  document.getElementById("cntCol").textContent = dados.filter(c=>totalPend(c)>0).length || "";
  const acessosAbertos = dados.reduce((s,c)=>s+pend(c).acessos,0);
  document.getElementById("cntTi").textContent = acessosAbertos || "";
  if(viewAtual==="painel") renderPainel();
  if(viewAtual==="colaboradores") renderLista();
  if(viewAtual==="detalhe") renderDetalhe();
  if(viewAtual==="ti") renderTI();
  if(viewAtual==="novo") renderEmpresas();
}

function linhaColaborador(c){
  const d = diasPara(c.ultimoDia);
  const p = totalPend(c);
  let quando, rotulo;
  if(d === null){ quando = "—"; rotulo = ""; }
  else if(d > 0){ quando = d; rotulo = d === 1 ? "dia restante" : "dias restantes"; }
  else if(d === 0){ quando = "hoje"; rotulo = "último dia"; }
  else { quando = Math.abs(d); rotulo = Math.abs(d) === 1 ? "dia atrás" : "dias atrás"; }
  const status = p === 0
    ? '<span class="tag ok">Concluído</span>'
    : (d !== null && d <= 0 ? '<span class="tag late">'+p+' pendências vencidas</span>' : '<span class="tag pend">'+p+' pendências</span>');
  return '<button class="pcard'+(urgente(c)?" urgente":"")+(p===0?" concluido":"")+'" data-abrir="'+c.id+'">'
    + '<span class="pc-head">'
    +   '<span class="pc-id">'
    +     '<span><span class="pc-days">'+quando+'</span><span class="pc-days-l">'+rotulo+'</span></span>'
    +     '<span><span class="pc-name">'+esc(c.nome)+'</span><span class="pc-sub">'+esc([c.cargo,c.setor,c.empresa].filter(Boolean).join(" · "))+' — saída em '+dataBR(c.ultimoDia)+'</span></span>'
    +   '</span>'
    +   '<span class="pc-tags">'+status+'</span>'
    + '</span>'
    + '<span class="pc-foot"><span class="bar'+(p===0?" completa":"")+'"><i style="width:'+progresso(c)+'%"></i></span><span class="pc-abrir">Abrir checklist →</span></span>'
    + '</button>';
}

function renderPainel(){
  const abertos = dados.filter(c=>totalPend(c)>0);
  const acessos = dados.reduce((s,c)=>s+pend(c).acessos,0);
  const itens = dados.reduce((s,c)=>s+pend(c).itens,0);
  const vencidos = dados.filter(urgente).length;
  document.getElementById("resumo").innerHTML =
      bloco(abertos.length, "desligamentos em andamento")
    + bloco(acessos, "acessos ainda ativos")
    + bloco(itens, "equipamentos não devolvidos")
    + bloco(vencidos, "processos com prazo vencido");

  const ordem = [...dados].sort((a,b)=>{
    const pa = totalPend(a)>0 ? 0 : 1, pb = totalPend(b)>0 ? 0 : 1;
    if(pa!==pb) return pa-pb;
    return String(a.ultimoDia).localeCompare(String(b.ultimoDia));
  });
  const tl = document.getElementById("timeline");
  tl.innerHTML = ordem.length ? ordem.map(linhaColaborador).join("")
    : '<div class="vazio"><b>Nenhum desligamento registrado</b>Comece registrando a saída de um colaborador.</div>';

  const comEntrevista = dados.filter(c=>c.entrevista.feita && c.entrevista.motivo);
  const mapa = {};
  comEntrevista.forEach(c=>{ mapa[c.entrevista.motivo] = (mapa[c.entrevista.motivo]||0)+1; });
  const chaves = Object.keys(mapa).sort((a,b)=>mapa[b]-mapa[a]);
  const box = document.getElementById("motivos");
  if(!chaves.length){
    box.innerHTML = '<div class="vazio"><b>Sem entrevistas preenchidas</b>Preencha a entrevista de desligamento no perfil de cada colaborador para enxergar padrões de saída.</div>';
  }else{
    const max = mapa[chaves[0]];
    box.innerHTML = chaves.map(k =>
      '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:13.5px"><span>'+esc(k)+'</span><span>'+mapa[k]+'</span></div>'
      + '<span class="bar marca" style="display:block;margin-top:4px"><i style="width:'+Math.round(mapa[k]/max*100)+'%"></i></span></div>').join("");
  }
}
function bloco(n, txt){ return "<div><b>"+n+"</b><span>"+txt+"</span></div>"; }

function renderEmpresas(){
  const dl = document.getElementById("empresas");
  const set = [...new Set(dados.map(c=>c.empresa).filter(Boolean))];
  dl.innerHTML = set.map(e=>'<option value="'+esc(e)+'">').join("");
}

function renderLista(){
  const termo = document.getElementById("busca").value.trim().toLowerCase();
  const st = document.getElementById("filtroStatus").value;
  const emp = document.getElementById("filtroEmpresa").value;

  const selEmp = document.getElementById("filtroEmpresa");
  const empresas = [...new Set(dados.map(c=>c.empresa).filter(Boolean))];
  const atualVal = selEmp.value;
  selEmp.innerHTML = '<option value="todas">Todas as empresas</option>' + empresas.map(e=>'<option value="'+esc(e)+'">'+esc(e)+'</option>').join("");
  selEmp.value = empresas.includes(atualVal) ? atualVal : "todas";

  let lista = dados.filter(c=>{
    const alvo = (c.nome+" "+c.matricula+" "+c.setor+" "+c.cargo).toLowerCase();
    if(termo && !alvo.includes(termo)) return false;
    if(st==="pendente" && totalPend(c)===0) return false;
    if(st==="concluido" && totalPend(c)>0) return false;
    if(emp!=="todas" && c.empresa!==emp) return false;
    return true;
  }).sort((a,b)=>String(a.ultimoDia).localeCompare(String(b.ultimoDia)));

  document.getElementById("listaCol").innerHTML = lista.length ? lista.map(linhaColaborador).join("")
    : '<div class="vazio"><b>Nenhum colaborador encontrado</b>Ajuste a busca ou os filtros.</div>';
}

function renderDetalhe(){
  const c = dados.find(x=>x.id===atual);
  const el = document.getElementById("view-detalhe");
  if(!c){ el.innerHTML = '<div class="vazio">Colaborador não encontrado.</div>'; return; }
  const p = pend(c);
  const d = diasPara(c.ultimoDia);
  const prazo = d===null ? "" : (d>0 ? "Faltam "+d+" dia(s) para a saída" : (d===0 ? "Hoje é o último dia" : "Saída ocorreu há "+Math.abs(d)+" dia(s)"));

  el.innerHTML =
  '<button class="voltar" data-goto="colaboradores">← Voltar para colaboradores</button>'
  + '<div class="page-head"><div><h2>'+esc(c.nome)+'</h2>'
  + '<p>'+esc([c.cargo,c.setor,c.empresa].filter(Boolean).join(" · "))+' — '+esc(c.tipo)+'. '+prazo+'.</p></div>'
  + '<div style="text-align:right"><div class="bar'+(totalPend(c)===0?" completa":"")+'" style="width:160px"><i style="width:'+progresso(c)+'%"></i></div>'
  + '<small style="color:var(--ink-3)">'+progresso(c)+'% concluído · '+totalPend(c)+' pendências</small></div></div>'

  + '<div class="card"><div class="card-head"><h3>Dados do desligamento</h3>'
  + '<button class="btn ghost small" data-excluir="'+c.id+'">Excluir registro</button></div>'
  + '<div class="card-body"><div class="dados">'
  + campo("Matrícula", c.matricula) + campo("Gestor imediato", c.gestor)
  + campo("Admissão", dataBR(c.admissao)) + campo("Último dia", dataBR(c.ultimoDia))
  + campo("Aviso prévio", c.aviso) + campo("Responsável no RH", c.responsavel)
  + '</div>' + (c.obs ? '<p style="margin:14px 0 0;color:var(--ink-2);font-size:13.5px">'+esc(c.obs)+'</p>' : '')
  + '</div></div>'

  + '<div class="card"><div class="card-head"><h3>Etapas do processo</h3><span class="hint">'+(c.etapas.length-p.etapas)+' de '+c.etapas.length+' concluídas</span></div>'
  + '<ul class="itens">' + c.etapas.map(e =>
      '<li class="'+(e.feito?"feito":"")+'"><input class="check" type="checkbox" data-etapa="'+e.id+'" '+(e.feito?"checked":"")+' aria-label="'+esc(e.nome)+'">'
      + '<span class="txt"><strong>'+esc(e.nome)+'</strong>'
      + (e.feito ? '<span class="meta">Concluída em '+esc(e.quando)+(e.quem?" por "+esc(e.quem):"")+'</span>' : '<span class="meta">Pendente</span>')
      + '</span></li>').join("")
  + '</ul></div>'

  + '<div class="card"><div class="card-head"><h3>Devolução de equipamentos</h3><span class="hint">'+p.itens+' item(ns) pendente(s)</span></div>'
  + '<ul class="itens">' + (c.itens.length ? c.itens.map(i =>
      '<li class="'+(i.devolvido?"feito":"")+'"><input class="check" type="checkbox" data-item="'+i.id+'" '+(i.devolvido?"checked":"")+' aria-label="'+esc(i.nome)+'">'
      + '<span class="txt"><strong>'+esc(i.nome)+'</strong>'
      + (i.devolvido ? '<span class="meta">Devolvido em '+esc(i.quando)+(i.quem?" · recebido por "+esc(i.quem):"")+'</span>' : '<span class="meta">Aguardando devolução</span>')
      + '</span><button class="btn ghost small" data-remitem="'+i.id+'">Remover</button></li>').join("")
      : '<li><span class="txt"><span class="meta">Nenhum equipamento cadastrado.</span></span></li>')
  + '</ul><div class="card-body" style="border-top:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap">'
  + '<input id="novoItem" placeholder="Adicionar equipamento" style="flex:1;min-width:180px;padding:7px 9px;border:1px solid var(--line-strong);border-radius:6px;background:var(--surface)">'
  + '<button class="btn ghost small" id="addItem">Adicionar</button></div></div>'

  + '<div class="card"><div class="card-head"><h3>Acessos a sistemas</h3><span class="hint">'+p.acessos+' ativo(s) · '+(Auth.pode("revogar")?"revogação também pode ser feita na Área do TI":"a revogação é feita pelo TI")+'</span></div>'
  + '<ul class="itens">' + (c.acessos.length ? c.acessos.map(a =>
      '<li class="'+(a.revogado?"feito":"")+'"><input class="check" type="checkbox" data-acesso="'+a.id+'" '+(a.revogado?"checked":"")+(Auth.pode("revogar")?"":" disabled")+' aria-label="'+esc(a.nome)+'">'
      + '<span class="txt"><strong>'+esc(a.nome)+'</strong>'
      + (a.revogado ? '<span class="meta">Revogado em '+esc(a.quando)+(a.quem?" por "+esc(a.quem):"")+'</span>' : '<span class="meta">Acesso ainda ativo</span>')
      + '</span></li>').join("")
      : '<li><span class="txt"><span class="meta">Nenhum acesso cadastrado.</span></span></li>')
  + '</ul><div class="card-body" style="border-top:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap">'
  + '<input id="novoAcesso" placeholder="Adicionar sistema" style="flex:1;min-width:180px;padding:7px 9px;border:1px solid var(--line-strong);border-radius:6px;background:var(--surface)">'
  + '<button class="btn ghost small" id="addAcesso">Adicionar</button></div></div>'

  + '<div class="card"><div class="card-head"><h3>Entrevista de desligamento</h3>'
  + '<span class="hint">'+(c.entrevista.feita?"Registrada em "+esc(c.entrevista.data):"Ainda não registrada")+'</span></div>'
  + '<div class="card-body"><div class="grid">'
  + '<label class="field">Motivo principal da saída<select id="entMotivo">'
  + ["","Proposta melhor em outra empresa","Falta de perspectiva de crescimento","Relação com a liderança","Remuneração e benefícios","Carga de trabalho","Mudança de cidade","Motivos pessoais","Decisão da empresa","Outro"]
      .map(m=>'<option value="'+esc(m)+'"'+(c.entrevista.motivo===m?" selected":"")+'>'+(m||"Selecione")+'</option>').join("")
  + '</select></label>'
  + '<label class="field">Nota para a experiência (1 a 5)<select id="entNota">'
  + ["","1","2","3","4","5"].map(n=>'<option value="'+n+'"'+(c.entrevista.nota===n?" selected":"")+'>'+(n||"Selecione")+'</option>').join("")
  + '</select></label>'
  + '<label class="field">Recomendaria a empresa?<select id="entRec">'
  + ["","Sim","Talvez","Não"].map(n=>'<option value="'+n+'"'+(c.entrevista.recomendaria===n?" selected":"")+'>'+(n||"Selecione")+'</option>').join("")
  + '</select></label>'
  + '<label class="field wide">Comentários<textarea id="entCom" placeholder="O que o colaborador relatou">'+esc(c.entrevista.comentarios)+'</textarea></label>'
  + '</div><div class="form-actions"><button class="btn" id="salvarEnt">Salvar entrevista</button></div>'
  + '<p class="aviso">A entrevista dá pistas, não verdades: mesmo em formulário, quem sai pode não ser totalmente sincero. Leia os padrões de vários desligamentos, não um caso isolado.</p>'
  + '</div></div>'

  + rescisaoHTML(c)

  + '<div class="card"><div class="card-head"><h3>Histórico do processo</h3></div>'
  + '<div class="card-body"><ul class="log">'
  + c.log.map(l=>'<li><time>'+esc(l.ts)+'</time> — '+esc(l.texto)+'</li>').join("")
  + '</ul></div></div>';
}
function campo(rot, val){ return '<div><span>'+rot+'</span><b>'+esc(val||"—")+'</b></div>'; }

function rescisaoHTML(c){
  const sal = Number(c.salario)||0;
  if(!sal) return '<div class="card"><div class="card-head"><h3>Cálculo assistido da rescisão</h3></div>'
    + '<div class="card-body"><p style="margin:0;color:var(--ink-2);font-size:13.5px">Informe o salário mensal no cadastro para ver uma estimativa das verbas.</p></div></div>';

  const [ay,am,ad] = (c.admissao||"").split("-").map(Number);
  const [sy,sm,sd] = (c.ultimoDia||"").split("-").map(Number);
  let meses = 0, avos13 = 0, diasMes = sd||0;
  if(ay && sy){
    meses = (sy-ay)*12 + (sm-am) + ((sd>=ad)?0:-1);
    if(meses<0) meses = 0;
    avos13 = sm - (sy===ay ? am-1 : 0);
    avos13 = sy===ay ? (sm-am+1) : sm;
    if(sd < 15) avos13 = Math.max(0, avos13-1);
    avos13 = Math.min(12, Math.max(0, avos13));
  }
  const saldo = sal/30*diasMes;
  const decimo = sal/12*avos13;
  const feriasProp = (sal/12*(meses%12)) * (4/3);
  const indeniz = (c.aviso==="indenizado") ? sal : 0;
  const total = saldo+decimo+feriasProp+indeniz;
  const linha = (a,b)=>'<div class="rescisao-linha"><span>'+a+'</span><span>'+moeda(b)+'</span></div>';
  return '<div class="card"><div class="card-head"><h3>Cálculo assistido da rescisão</h3><span class="hint">Estimativa · '+meses+' meses de casa</span></div>'
    + '<div class="card-body">'
    + linha("Saldo de salário ("+diasMes+" dias)", saldo)
    + linha("13º proporcional ("+avos13+"/12)", decimo)
    + linha("Férias proporcionais + 1/3", feriasProp)
    + linha("Aviso prévio indenizado", indeniz)
    + '<div class="rescisao-total"><span>Total estimado</span><span>'+moeda(total)+'</span></div>'
    + '<p class="aviso">Estimativa para conferência, não substitui o cálculo oficial. Descontos (INSS, IRRF, faltas), multa do FGTS, férias vencidas e casos de justa causa ou acordo precisam da análise do setor pessoal ou de um especialista.</p>'
    + '</div></div>';
}

function renderTI(){
  const resp = document.getElementById("respTI");
  resp.value = quemSou(); resp.readOnly = true;

  const termo = document.getElementById("buscaTI").value.trim().toLowerCase();

  const abertos = dados.filter(c=>{
    if(pend(c).acessos===0) return false;
    if(termo){
      const alvo = (c.nome+" "+c.matricula).toLowerCase();
      if(!alvo.includes(termo)) return false;
    }
    return true;
  }).sort((a,b)=>String(a.ultimoDia).localeCompare(String(b.ultimoDia)));

  const totalAbertos = dados.reduce((s,c)=>s+pend(c).acessos,0);
  document.getElementById("tiResumo").textContent = totalAbertos ? totalAbertos+" acesso(s) ativo(s) no total" : "";

  document.getElementById("listaTI").innerHTML = abertos.length ? abertos.map(c=>{
    const d = diasPara(c.ultimoDia);
    const alerta = d!==null && d<=0
      ? '<span class="tag late">Saída em '+dataBR(c.ultimoDia)+' — revogar agora</span>'
      : '<span class="tag pend">Sai em '+dataBR(c.ultimoDia)+'</span>';
    return '<div class="card ti-card"><div class="card-head ti-head">'
      + '<span><span class="who">'+esc(c.nome)+'</span>'
      + '<span class="sub">mat. '+esc(c.matricula)+' · '+esc(c.cargo||"—")+' · '+esc(c.setor||"—")+'</span></span>'
      + alerta + '</div>'
      + '<ul class="itens">' + c.acessos.filter(a=>!a.revogado).map(a=>
          '<li><span class="txt"><strong>'+esc(a.nome)+'</strong><span class="meta">Acesso ativo</span></span>'
          + '<button class="btn small" data-revogar="'+c.id+":"+a.id+'">Revogar acesso</button></li>').join("")
      + '</ul></div>';
  }).join("") : ('<div class="card"><div class="vazio"><b>'+(termo?"Nada encontrado":"Nada na fila")+'</b>'+(termo?"Ajuste a busca por nome ou matrícula.":"Todos os acessos de colaboradores desligados já foram revogados.")+'</div></div>');

  const feitos = [];
  dados.forEach(c=>c.acessos.filter(a=>a.revogado).forEach(a=>feitos.push({c,a})));
  feitos.sort((x,y)=>String(y.a.quando).localeCompare(String(x.a.quando)));
  document.getElementById("listaTIFeito").innerHTML = feitos.length
    ? '<ul class="itens">' + feitos.slice(0,40).map(({c,a})=>
        '<li><span class="txt"><strong>'+esc(a.nome)+'</strong><span class="meta">'+esc(c.nome)+' · revogado em '+esc(a.quando)+(a.quem?" por "+esc(a.quem):"")+'</span></span>'
        + '<button class="btn ghost small" data-reativar="'+c.id+":"+a.id+'">Desfazer</button></li>').join("") + '</ul>'
    : '<div class="vazio">Nenhuma revogação registrada ainda.</div>';
}

/* ---------- ações ---------- */
function acharAcesso(par){
  const [cid,aid] = par.split(":");
  const c = dados.find(x=>x.id===cid);
  const a = c && c.acessos.find(x=>x.id===aid);
  return {c,a};
}

document.addEventListener("click", function(ev){
  const t = ev.target.closest("[data-goto],[data-view],[data-abrir],[data-revogar],[data-reativar],[data-excluir],[data-remitem],#addItem,#addAcesso,#salvarEnt,#btnTema,#btnLimpar,#btnSair");
  if(!t) return;

  if(t.dataset.view) return irPara(t.dataset.view);
  if(t.dataset.goto) return irPara(t.dataset.goto);
  if(t.dataset.abrir) return abrir(t.dataset.abrir);

  if(t.dataset.revogar){
    const {c,a} = acharAcesso(t.dataset.revogar);
    if(!c||!a) return;
    if(!Auth.pode("revogar")){ toast("Seu perfil não pode revogar acessos."); return; }
    const quem = quemSou() || "TI";
    a.revogado = true; a.quem = quem; a.quando = agora();
    registrar(c, "Acesso revogado: "+a.nome);
    salvar(); render(); toast("Acesso revogado: "+a.nome);
    return;
  }
  if(t.dataset.reativar){
    const {c,a} = acharAcesso(t.dataset.reativar);
    if(!c||!a) return;
    a.revogado = false; a.quem=""; a.quando="";
    registrar(c, "Revogação desfeita: "+a.nome);
    salvar(); render(); toast("Revogação desfeita.");
    return;
  }
  if(t.dataset.excluir){
    const c = dados.find(x=>x.id===t.dataset.excluir);
    if(c && confirm("Excluir o registro de "+c.nome+"? Isso apaga o checklist e o histórico.")){
      dados = dados.filter(x=>x.id!==c.id);
      salvar(); irPara("colaboradores"); toast("Registro excluído.");
    }
    return;
  }
  if(t.dataset.remitem){
    const c = dados.find(x=>x.id===atual); if(!c) return;
    const it = c.itens.find(i=>i.id===t.dataset.remitem); if(!it) return;
    c.itens = c.itens.filter(i=>i.id!==it.id);
    registrar(c, "Equipamento removido da lista: "+it.nome);
    salvar(); render(); return;
  }
  if(t.id==="addItem" || t.id==="addAcesso"){
    const c = dados.find(x=>x.id===atual); if(!c) return;
    const input = document.getElementById(t.id==="addItem" ? "novoItem" : "novoAcesso");
    const nome = input.value.trim();
    if(!nome){ input.focus(); return; }
    if(t.id==="addItem"){ c.itens.push({id:uid(), nome, devolvido:false, obs:"", quem:"", quando:""}); registrar(c,"Equipamento incluído: "+nome); }
    else { c.acessos.push({id:uid(), nome, revogado:false, quem:"", quando:""}); registrar(c,"Acesso incluído: "+nome); }
    salvar(); render(); toast("Incluído: "+nome); return;
  }
  if(t.id==="salvarEnt"){
    const c = dados.find(x=>x.id===atual); if(!c) return;
    c.entrevista = {
      feita:true,
      motivo: document.getElementById("entMotivo").value,
      nota: document.getElementById("entNota").value,
      recomendaria: document.getElementById("entRec").value,
      comentarios: document.getElementById("entCom").value.trim(),
      data: agora()
    };
    const etapa = c.etapas.find(e=>e.nome.indexOf("Entrevista")===0);
    if(etapa && !etapa.feito){ etapa.feito=true; etapa.quem=quemSou()||"RH"; etapa.quando=agora(); }
    registrar(c, "Entrevista de desligamento registrada");
    salvar(); render(); toast("Entrevista salva.");
    return;
  }
  if(t.id==="btnTema"){
    const atualTema = document.documentElement.getAttribute("data-theme");
    const novo = atualTema === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", novo);
    gravarCampo(KEY_TEMA, novo);
    return;
  }
  if(t.id==="btnSair"){ sairDoApp(); return; }
  if(t.id==="btnLimpar"){
    if(!Auth.pode("apagar")){ toast("Somente o administrador pode apagar os dados."); return; }
    if(confirm("Apagar todos os desligamentos salvos neste navegador?")){
      dados = []; salvar(); irPara("painel"); toast("Dados apagados.");
    }
    return;
  }
});

document.addEventListener("change", function(ev){
  const el = ev.target;
  const c = dados.find(x=>x.id===atual);

  if(el.dataset && el.dataset.etapa && c){
    const e = c.etapas.find(x=>x.id===el.dataset.etapa); if(!e) return;
    e.feito = el.checked; e.quem = e.feito ? (quemSou()||c.responsavel||"RH") : ""; e.quando = e.feito ? agora() : "";
    registrar(c, (e.feito?"Etapa concluída: ":"Etapa reaberta: ")+e.nome);
    salvar(); render(); return;
  }
  if(el.dataset && el.dataset.item && c){
    const i = c.itens.find(x=>x.id===el.dataset.item); if(!i) return;
    i.devolvido = el.checked; i.quem = i.devolvido ? (quemSou()||c.responsavel||"RH") : ""; i.quando = i.devolvido ? agora() : "";
    registrar(c, (i.devolvido?"Equipamento devolvido: ":"Devolução desfeita: ")+i.nome);
    salvar(); render(); return;
  }
  if(el.dataset && el.dataset.acesso && c){
    const a = c.acessos.find(x=>x.id===el.dataset.acesso); if(!a) return;
    if(!Auth.pode("revogar")){ el.checked = a.revogado; toast("Seu perfil não pode revogar acessos."); return; }
    a.revogado = el.checked; a.quem = a.revogado ? (quemSou()||"TI") : ""; a.quando = a.revogado ? agora() : "";
    registrar(c, (a.revogado?"Acesso revogado: ":"Revogação desfeita: ")+a.nome);
    salvar(); render(); return;
  }
  if(el.id==="filtroStatus" || el.id==="filtroEmpresa") renderLista();
});

document.getElementById("busca").addEventListener("input", renderLista);
document.getElementById("buscaTI").addEventListener("input", renderTI);
document.getElementById("respTI").addEventListener("input", e => gravarCampo(KEY_TI, e.target.value));

document.getElementById("formNovo").addEventListener("submit", function(ev){
  ev.preventDefault();
  const f = new FormData(ev.target);
  const get = k => String(f.get(k)||"").trim();
  const erro = document.getElementById("erroNovo");
  if(!get("nome") || !get("matricula") || !get("ultimoDia")){
    erro.hidden = false; erro.textContent = "Preencha nome, matrícula e último dia de trabalho para abrir o processo.";
    return;
  }
  if(dados.some(c=>c.matricula === get("matricula"))){
    erro.hidden = false; erro.textContent = "Já existe um desligamento com essa matrícula. Abra o registro existente ou use outra matrícula.";
    return;
  }
  erro.hidden = true;
  const reg = novoRegistro({
    nome:get("nome"), matricula:get("matricula"), cargo:get("cargo"), setor:get("setor"),
    empresa:get("empresa"), gestor:get("gestor"), admissao:get("admissao"), ultimoDia:get("ultimoDia"),
    tipo:get("tipo"), responsavel:get("responsavel"), salario:get("salario"), aviso:get("aviso"), obs:get("obs"),
    equip: listar(get("equip")), acessos: listar(get("acessos"))
  });
  if(quemSou()) reg.log[0].texto += " — por "+quemSou();
  dados.push(reg); salvar();
  ev.target.reset();
  toast("Desligamento de "+reg.nome+" registrado.");
  abrir(reg.id);
});

/* ---------- busca automática por matrícula ---------- */
const CAMPOS_AUTO = ["nome","cargo","setor","empresa","gestor","admissao","salario"];

function buscarFuncionario(matricula){
  if(typeof BASE_FUNCIONARIOS === "undefined") return null;
  return BASE_FUNCIONARIOS.find(f => String(f.matricula) === String(matricula)) || null;
}

document.getElementById("formNovo").matricula.addEventListener("change", function(){
  const mat = this.value.trim();
  const erro = document.getElementById("erroNovo");
  if(!mat) return;

  const f = buscarFuncionario(mat);
  if(!f){
    erro.hidden = false;
    erro.textContent = "Matrícula não encontrada na base de funcionários. Preencha os dados manualmente.";
    return;
  }
  erro.hidden = true;
  const form = document.getElementById("formNovo");
  CAMPOS_AUTO.forEach(c => { if(form[c] && f[c]) form[c].value = f[c]; });
  toast("Dados de " + f.nome + " carregados.");
});

/* ---------- início ---------- */
const temaSalvo = lerCampo(KEY_TEMA);
if(temaSalvo) document.documentElement.setAttribute("data-theme", temaSalvo);
carregar();
salvar();

/* ---------- login / sessão ---------- */
const formLogin = document.getElementById("formLogin");
let timerBloqueio = null;

function erroLogin(msg){
  const e = document.getElementById("erroLogin");
  e.hidden = !msg; e.textContent = msg || "";
}
function atualizarBloqueio(){
  const seg = Auth.segundosBloqueado();
  const btn = document.getElementById("btnEntrar");
  clearTimeout(timerBloqueio); timerBloqueio = null;
  if(seg > 0){
    btn.disabled = true;
    erroLogin("Muitas tentativas incorretas. Aguarde " + seg + "s para tentar de novo.");
    timerBloqueio = setTimeout(atualizarBloqueio, 500);
  }else{
    if(btn.disabled) erroLogin("");
    btn.disabled = false;
  }
}
function aplicarPerfil(){
  const s = Auth.sessao(); if(!s) return;
  document.querySelectorAll("#nav button").forEach(b => { b.hidden = !Auth.podeVer(b.dataset.view); });
  document.getElementById("btnLimpar").hidden = !Auth.pode("apagar");
  document.getElementById("userNome").textContent = s.nome;
  document.getElementById("userPerfil").textContent = "Perfil: " + Auth.PERFIS[s.perfil].rotulo;
}
function entrouNoApp(){
  document.body.classList.remove("locked");
  aplicarPerfil();
  irPara(Auth.telaInicial());
}
function sairDoApp(){
  Auth.sair();
  atual = null;
  document.body.classList.add("locked");
  formLogin.reset();
  erroLogin("");
  atualizarBloqueio();
  formLogin.usuario.focus();
}

formLogin.addEventListener("submit", function(ev){
  ev.preventDefault();
  const f = new FormData(formLogin);
  const r = Auth.entrar(f.get("usuario"), f.get("senha"), !!f.get("manter"));
  if(r.ok){ formLogin.reset(); erroLogin(""); entrouNoApp(); return; }
  if(r.motivo === "vazio"){ erroLogin("Informe usuário e senha."); return; }
  if(r.motivo === "bloqueado"){ atualizarBloqueio(); return; }
  erroLogin("Usuário ou senha incorretos.");
  formLogin.senha.value = ""; formLogin.senha.focus();
});

document.getElementById("verSenha").addEventListener("click", function(){
  const campo = formLogin.senha;
  const mostrar = campo.type === "password";
  campo.type = mostrar ? "text" : "password";
  this.textContent = mostrar ? "Ocultar" : "Mostrar";
  this.setAttribute("aria-pressed", String(mostrar));
  this.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
});

if(Auth.MOSTRAR_DEMO){
  const box = document.getElementById("demoBox");
  box.hidden = false;
  document.getElementById("demoLista").innerHTML = Auth.DEMO.map(d =>
    '<div class="demo-linha"><span><code>'+esc(d.usuario)+'</code> / <code>'+esc(d.senha)+'</code><small>'+esc(d.perfil)+'</small></span>'
    + '<button type="button" class="btn ghost small" data-demo="'+esc(d.usuario)+'">Usar</button></div>').join("");
  box.addEventListener("click", function(ev){
    const b = ev.target.closest("[data-demo]"); if(!b) return;
    const d = Auth.DEMO.find(x => x.usuario === b.dataset.demo); if(!d) return;
    formLogin.usuario.value = d.usuario; formLogin.senha.value = d.senha; formLogin.senha.focus();
  });
}

if(Auth.sessao()) entrouNoApp();
else { atualizarBloqueio(); formLogin.usuario.focus(); }
})();
