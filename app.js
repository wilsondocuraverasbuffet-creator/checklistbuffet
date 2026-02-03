// ====== 1) COLE AQUI SUA CONFIG DO FIREBASE ======
const firebaseConfig = {
  // cole aqui o objeto firebaseConfig do console
};
// ================================================

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Cache offline (bom para iPhone com rede instável)
db.enablePersistence({ synchronizeTabs: true }).catch(() => {
  // Em iPhone ou cenários específicos pode falhar; ainda funciona online.
});

const STORAGE_LOCAL = "docura_teamcode_v1";
let unsub = null;
let currentId = null;

const CATEGORIES = [
  { key:"cafe", title:"CAFÉ", emoji:"☕", items:[
    "Cafeteira","Suporte açúcar, adoçante e mexedor","Pó de café","Açúcar","Adoçante","Copos","Mexedores","Extensão","Álcool em gel"
  ]},
  { key:"mesa", title:"MESA", emoji:"🍰", items:[
    "Toalhas","Suportes","Cachepô","Guardanapos","Suqueiras","Suqueiras","Copos de suco","Jarra de iogurte","Suporte para granola","Suporte salada de frutas"
  ]},
  { key:"apoio", title:"APOIO", emoji:"⛺", items:[
    "Forno","Luvas","Toucas","Pegador","Toalha mesa","Tabuleiro","Cooler","Saco de papel p/ pão de queijo","Faca e colher","Extensão","Uniformes","Repelente","Álcool de limpeza","Flanelas","Pano de prato"
  ]},
];

const els = {
  teamCode: document.getElementById("teamCode"),
  responsavel: document.getElementById("responsavel"),
  dataEvento: document.getElementById("dataEvento"),
  observacoes: document.getElementById("observacoes"),
  root: document.getElementById("checklistRoot"),
  hint: document.getElementById("statusHint"),
  history: document.getElementById("historyList"),
  btnSalvar: document.getElementById("btnSalvar"),
  btnNovo: document.getElementById("btnNovo"),
  btnExportar: document.getElementById("btnExportar"),
  btnApagar: document.getElementById("btnApagar"),
};

function nowISO(){ return new Date().toISOString(); }
function emptyStatus(){
  const status = {};
  for(const cat of CATEGORIES){ for(const item of cat.items){ status[item] = "na"; } }
  return status;
}

function pill(text, value, active){
  const b = document.createElement("div");
  b.className = "pill";
  if(value==="ok") b.classList.add("ok");
  if(value==="falta") b.classList.add("falta");
  b.textContent = text;
  b.dataset.value = value;
  b.dataset.active = active ? "true" : "false";
  return b;
}

function renderChecklist(status){
  els.root.innerHTML = "";
  for(const cat of CATEGORIES){
    const title = document.createElement("div");
    title.className = "cat-title";
    title.innerHTML = `<span>${cat.emoji}</span> ${cat.title}`;
    els.root.appendChild(title);

    for(const item of cat.items){
      const row = document.createElement("div");
      row.className = "item";

      const name = document.createElement("div");
      name.className = "item-name";
      name.textContent = item;

      const controls = document.createElement("div");
      controls.className = "status";

      const btnNA = pill("—","na",status[item]==="na");
      const btnOK = pill("OK","ok",status[item]==="ok");
      const btnF  = pill("Falta","falta",status[item]==="falta");

      btnNA.addEventListener("click",()=>setStatus(item,"na"));
      btnOK.addEventListener("click",()=>setStatus(item,"ok"));
      btnF.addEventListener("click", ()=>setStatus(item,"falta"));

      controls.appendChild(btnNA); controls.appendChild(btnOK); controls.appendChild(btnF);
      row.appendChild(name); row.appendChild(controls);
      els.root.appendChild(row);
    }
  }
}

function setStatus(itemName,value){
  const items = els.root.querySelectorAll(".item");
  for(const node of items){
    const name = node.querySelector(".item-name").textContent;
    if(name !== itemName) continue;
    node.querySelectorAll(".pill").forEach(p=>{
      p.dataset.active = (p.dataset.value===value) ? "true" : "false";
    });
  }
  updateHint();
}

function getStatusFromUI(){
  const status = emptyStatus();
  const items = els.root.querySelectorAll(".item");
  items.forEach(node=>{
    const name = node.querySelector(".item-name").textContent;
    const active = node.querySelector('.pill[data-active="true"]');
    status[name] = active?.dataset.value || "na";
  });
  return status;
}

function summarize(status){
  const vals = Object.values(status);
  return {
    ok: vals.filter(v=>v==="ok").length,
    falta: vals.filter(v=>v==="falta").length,
    na: vals.filter(v=>v==="na").length,
    total: vals.length
  };
}

function updateHint(){
  const s = summarize(getStatusFromUI());
  els.hint.textContent = `Status: ${s.ok} OK • ${s.falta} Falta • ${s.na} não marcados (total ${s.total}).`;
}

function normalizeTeamCode(raw){
  return (raw || "").trim().toUpperCase().replace(/\s+/g, "");
}

function teamRef(){
  const code = normalizeTeamCode(els.teamCode.value);
  if(!code || code.length < 4) return null;
  return {
    code,
    col: db.collection("teams").doc(code).collection("events")
  };
}

async function ensureAuth(){
  if (auth.currentUser) return;
  await auth.signInAnonymously();
}

function newEvent(){
  currentId = null;
  els.observacoes.value = "";
  renderChecklist(emptyStatus());
  updateHint();
  els.hint.textContent += " (Novo evento)";
}

async function saveEvent(){
  const t = teamRef();
  if(!t){
    els.hint.textContent = "Informe um Código da equipe (mín. 4 caracteres).";
    return;
  }
  const responsavel = (els.responsavel.value || "").trim();
  if(!responsavel){
    els.hint.textContent = "Preencha o responsável antes de salvar.";
    return;
  }

  await ensureAuth();

  const status = getStatusFromUI();
  const id = currentId || crypto.randomUUID();

  const payload = {
    id,
    createdAt: currentId ? undefined : nowISO(),
    updatedAt: nowISO(),
    responsavel,
    dataEvento: els.dataEvento.value || "",
    observacoes: (els.observacoes.value || "").trim(),
    status,
  };

  // Remove undefined pra não sobrescrever
  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

  await t.col.doc(id).set(payload, { merge: true });
  currentId = id;

  localStorage.setItem(STORAGE_LOCAL, t.code);
  els.hint.textContent = "Evento salvo e sincronizado ✅";
}

async function deleteEvent(){
  const t = teamRef();
  if(!t || !currentId) return;
  await ensureAuth();
  await t.col.doc(currentId).delete();
  els.hint.textContent = "Evento apagado ✅";
  newEvent();
}

function formatDateBR(isoDate){
  if(!isoDate) return "sem data";
  const parts = isoDate.split("-");
  if(parts.length!==3) return isoDate;
  const [y,m,d] = parts;
  return `${d}/${m}/${y}`;
}

function renderHistory(docs){
  els.history.innerHTML = "";
  if(docs.length === 0){
    els.history.innerHTML = `<div class="hint">Nenhum evento salvo ainda para este código de equipe.</div>`;
    return;
  }

  for(const ev of docs){
    const s = summarize(ev.status || emptyStatus());
    const badge = s.falta>0 ? `<span class="badge warn">${s.falta} falta(s)</span>` : `<span class="badge ok">OK</span>`;

    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `
      <div>
        <div><strong>${ev.responsavel || "Sem responsável"}</strong>${badge}</div>
        <small>${formatDateBR(ev.dataEvento)} • atualizado: ${new Date(ev.updatedAt).toLocaleString()}</small>
      </div>
      <div class="event-actions"><button data-open="${ev.id}">Abrir</button></div>
    `;
    div.querySelector("button[data-open]").addEventListener("click",()=>loadFromCloud(ev));
    els.history.appendChild(div);
  }
}

function loadFromCloud(ev){
  currentId = ev.id;
  els.responsavel.value = ev.responsavel || "";
  els.dataEvento.value = ev.dataEvento || "";
  els.observacoes.value = ev.observacoes || "";
  renderChecklist(ev.status || emptyStatus());
  updateHint();
  els.hint.textContent += " (Carregado da equipe)";
}

function listenTeam(){
  const t = teamRef();
  if(!t) return;

  // se já tinha listener, fecha
  if(unsub) { unsub(); unsub = null; }

  ensureAuth().then(()=>{
    unsub = t.col.orderBy("updatedAt", "desc").limit(50).onSnapshot((snap)=>{
      const docs = snap.docs.map(d=>d.data());
      renderHistory(docs);
    }, ()=>{
      els.hint.textContent = "Falha ao sincronizar. Verifique a internet.";
    });
  });
}

function exportCSV(){
  const status = getStatusFromUI();
  const rows = [];
  rows.push(["Checklist – Buffet de Corrida (Equipe)"]);
  rows.push(["Equipe (código)", normalizeTeamCode(els.teamCode.value)]);
  rows.push(["Responsável", (els.responsavel.value||"").trim()]);
  rows.push(["Data do evento", els.dataEvento.value || ""]);
  rows.push(["Observações", (els.observacoes.value||"").trim()]);
  rows.push([]);
  rows.push(["Categoria","Item","Status"]);

  for(const cat of CATEGORIES){
    for(const item of cat.items){
      const st = status[item] || "na";
      const label = st==="ok" ? "OK" : st==="falta" ? "FALTA" : "NÃO MARCADO";
      rows.push([cat.title, item, label]);
    }
  }

  const csv = rows.map(r=>r.map(x=>`"${String(x??"").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const filename = `checklist_${(els.dataEvento.value||"sem_data")}_${((els.responsavel.value||"responsavel").trim().replace(/\s+/g,"_"))}.csv`;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Share iPhone
  if(navigator.canShare && navigator.share){
    try{
      const file = new File([blob], filename, {type:blob.type});
      if(navigator.canShare({files:[file]})){
        navigator.share({files:[file], title:"Checklist Buffet (Equipe)"});
      }
    }catch{}
  }
}

// UI bindings
els.btnSalvar.addEventListener("click", saveEvent);
els.btnNovo.addEventListener("click", newEvent);
els.btnExportar.addEventListener("click", exportCSV);
els.btnApagar.addEventListener("click", deleteEvent);

// Quando mudar o teamCode, começa a escutar o time
els.teamCode.addEventListener("input", ()=>{
  const code = normalizeTeamCode(els.teamCode.value);
  if(code.length >= 4) listenTeam();
});

(function init(){
  renderChecklist(emptyStatus());
  updateHint();

  // restaura teamCode se tiver salvo
  const saved = localStorage.getItem(STORAGE_LOCAL);
  if(saved){
    els.teamCode.value = saved;
    listenTeam();
  }

  // auth lazy
  ensureAuth().catch(()=>{});
})();
