/* =========================================================
   CHECKLIST – BUFFET DE CORRIDA
   3 tipos de buffet -> 3 checklists
   Offline + por dispositivo (localStorage)
========================================================= */

const STORAGE_PREFIX = "buffet_checklist_events_v2"; // muda a versão quando alterar estrutura
let currentBuffetKey = null;
let currentId = null;

// ✅ AQUI você define o que entra em cada buffet.
// Você pode ajustar itens livremente.
const BUFFETS = {
  simples: {
    label: "Buffet simples",
    categories: [
      {
        key: "cafe",
    title: "CAFÉ",
    emoji: "☕",
    items: [
      "Cafeteira",
      "Funil",
      "Chaleira",
      "Pó de café",
      "Açúcar",
      "Adoçante",
      "Mexedores",
      "Suporte açúcar, adoçante e mexedor",
      "Copos",
      "Extensão",
      "Pinga pinga",
      "Outro"
    ]
  },
  {
    key: "mesa",
    title: "MESA",
    emoji: "🍰",
    items: [
      "Toalhas",
      "Plaquinhas",
      "Suportes para comidas",
      "Cachepô",
      "Escadinha decorativa",
      "Pista quente",
      "Plantas / Flores",
      "Suqueiras",
      "Copos de suco",
      "Jarra de iogurte",
      "Colher mexedor iogurte",
      "Suporte granola",
      "Suporte salada de frutas",
      "Colheres salada de frutas",
      "Suporte colheres",
      "Guardanapos",
      "Suporte Guardanapos",
      "Álcool em gel",
      "Outro"
    ]
  },
  {
    key: "apoio",
    title: "APOIO",
    emoji: "⛺",
    items: [
      "Forno",
      "Papel antiaderente",
      "Luvas",
      "Toucas",
      "Pegador",
      "Toalha mesa",
      "Tabuleiro",
      "Suco",
      "Salada de frutas",
      "Pão de queijo",
      "Cooler",
      "Saco de papel p/ pão de queijo",
      "Faca e colher",
      "Extensão",
      "Uniformes",
      "Repelente",
      "Álcool de limpeza",
      "Flanelas",
      "Pano de prato",
      "Inseticida",
      "Outro"
        ]
      }
    ]
  },

  completo: {
    label: "Buffet completo",
    categories: [
      {
        key: "cafe",
    title: "CAFÉ",
    emoji: "☕",
    items: [
      "Cafeteira",
      "Funil",
      "Chaleira",
      "Pó de café",
      "Açúcar",
      "Adoçante",
      "Mexedores",
      "Suporte açúcar, adoçante e mexedor",
      "Copos",
      "Extensão",
      "Pinga pinga",
      "Outro"
    ]
  },
  {
    key: "mesa",
    title: "MESA",
    emoji: "🍰",
    items: [
      "Toalhas",
      "Plaquinhas",
      "Suportes para comidas",
      "Cachepô",
      "Escadinha decorativa",
      "Pista quente",
      "Plantas / Flores",
      "Suqueiras",
      "Copos de suco",
      "Jarra de iogurte",
      "Colher mexedor iogurte",
      "Suporte granola",
      "Suporte salada de frutas",
      "Colheres salada de frutas",
      "Suporte colheres",
      "Guardanapos",
      "Suporte Guardanapos",
      "Álcool em gel",
      "Outro"
    ]
  },
  {
    key: "apoio",
    title: "APOIO",
    emoji: "⛺",
    items: [
      "Forno",
      "Papel antiaderente",
      "Luvas",
      "Toucas",
      "Pegador",
      "Toalha mesa",
      "Tabuleiro",
      "Suco",
      "Salada de frutas",
      "Pão de queijo",
      "Cooler",
      "Saco de papel p/ pão de queijo",
      "Faca e colher",
      "Extensão",
      "Uniformes",
      "Repelente",
      "Álcool de limpeza",
      "Flanelas",
      "Pano de prato",
      "Inseticida",
      "Outro"
        ]
      }
    ]
  },

  premium: {
    label: "Buffet premium",
    categories: [
      // Por padrão, premium = completo + alguns extras (edite como quiser)
      {
        key: "cafe",
    title: "CAFÉ",
    emoji: "☕",
    items: [
      "Cafeteira",
      "Funil",
      "Chaleira",
      "Pó de café",
      "Açúcar",
      "Adoçante",
      "Mexedores",
      "Suporte açúcar, adoçante e mexedor",
      "Copos",
      "Extensão",
      "Pinga pinga",
      "Outro"
    ]
  },
  {
    key: "mesa",
    title: "MESA",
    emoji: "🍰",
    items: [
      "Toalhas",
      "Plaquinhas",
      "Suportes para comidas",
      "Cachepô",
      "Escadinha decorativa",
      "Pista quente",
      "Plantas / Flores",
      "Suqueiras",
      "Copos de suco",
      "Jarra de iogurte",
      "Colher mexedor iogurte",
      "Suporte granola",
      "Suporte salada de frutas",
      "Colheres salada de frutas",
      "Suporte colheres",
      "Guardanapos",
      "Suporte Guardanapos",
      "Álcool em gel",
      "Outro"
    ]
  },
  {
    key: "apoio",
    title: "APOIO",
    emoji: "⛺",
    items: [
      "Forno",
      "Papel antiaderente",
      "Luvas",
      "Toucas",
      "Pegador",
      "Toalha mesa",
      "Tabuleiro",
      "Suco",
      "Salada de frutas",
      "Pão de queijo",
      "Cooler",
      "Saco de papel p/ pão de queijo",
      "Faca e colher",
      "Extensão",
      "Uniformes",
      "Repelente",
      "Álcool de limpeza",
      "Flanelas",
      "Pano de prato",
      "Inseticida",
      "Outro"
        ]
      }
    ]
  }
};

// Elements
const els = {
  // screens
  home: document.getElementById("screenHome"),
  checklist: document.getElementById("screenChecklist"),

  // home buttons
  btnSimples: document.getElementById("btnSimples"),
  btnCompleto: document.getElementById("btnCompleto"),
  btnPremium: document.getElementById("btnPremium"),

  // checklist ui
  buffetTitle: document.getElementById("buffetTitle"),
  btnVoltar: document.getElementById("btnVoltar"),

  responsavel: document.getElementById("responsavel"),
  dataEvento: document.getElementById("dataEvento"),
  observacoes: document.getElementById("observacoes"),
  root: document.getElementById("checklistRoot"),
  hint: document.getElementById("statusHint"),
  history: document.getElementById("historyList"),

  btnSalvar: document.getElementById("btnSalvar"),
  btnNovo: document.getElementById("btnNovo"),
  btnExportar: document.getElementById("btnExportar"),
  btnApagar: document.getElementById("btnApagar")
};

function storageKeyFor(buffetKey) {
  return `${STORAGE_PREFIX}__${buffetKey}`;
}

function nowISO() {
  return new Date().toISOString();
}

function loadAll(buffetKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKeyFor(buffetKey)) || "[]");
  } catch {
    return [];
  }
}

function saveAll(buffetKey, events) {
  localStorage.setItem(storageKeyFor(buffetKey), JSON.stringify(events));
}

function emptyStatus(categories) {
  const status = {};
  for (const cat of categories) for (const item of cat.items) status[item] = "na";
  return status;
}

function summarize(status) {
  const vals = Object.values(status);
  return {
    ok: vals.filter(v => v === "ok").length,
    falta: vals.filter(v => v === "falta").length,
    na: vals.filter(v => v === "na").length,
    total: vals.length
  };
}

function pill(text, value, active) {
  const b = document.createElement("div");
  b.className = "pill";
  if (value === "ok") b.classList.add("ok");
  if (value === "falta") b.classList.add("falta");
  b.textContent = text;
  b.dataset.value = value;
  b.dataset.active = active ? "true" : "false";
  return b;
}

function renderChecklist(categories, status) {
  els.root.innerHTML = "";

  for (const cat of categories) {
    const title = document.createElement("div");
    title.className = "cat-title";
    title.innerHTML = `<span>${cat.emoji}</span> ${cat.title}`;
    els.root.appendChild(title);

    for (const item of cat.items) {
      const row = document.createElement("div");
      row.className = "item";

      const name = document.createElement("div");
      name.className = "item-name";
      name.textContent = item;

      const controls = document.createElement("div");
      controls.className = "status";

      const btnNA = pill("—", "na", status[item] === "na");
      const btnOK = pill("OK", "ok", status[item] === "ok");
      const btnF  = pill("Falta", "falta", status[item] === "falta");

      btnNA.addEventListener("click", () => setStatus(item, "na"));
      btnOK.addEventListener("click", () => setStatus(item, "ok"));
      btnF .addEventListener("click", () => setStatus(item, "falta"));

      controls.appendChild(btnNA);
      controls.appendChild(btnOK);
      controls.appendChild(btnF);

      row.appendChild(name);
      row.appendChild(controls);
      els.root.appendChild(row);
    }
  }
}

function setStatus(itemName, value) {
  const rows = els.root.querySelectorAll(".item");
  for (const node of rows) {
    const name = node.querySelector(".item-name").textContent;
    if (name !== itemName) continue;
    node.querySelectorAll(".pill").forEach(p => {
      p.dataset.active = (p.dataset.value === value) ? "true" : "false";
    });
  }
  updateHint();
}

function getStatusFromUI(categories) {
  const status = emptyStatus(categories);
  const rows = els.root.querySelectorAll(".item");
  rows.forEach(node => {
    const name = node.querySelector(".item-name").textContent;
    const active = node.querySelector('.pill[data-active="true"]');
    status[name] = active?.dataset.value || "na";
  });
  return status;
}

function updateHint() {
  const cfg = BUFFETS[currentBuffetKey];
  if (!cfg) return;
  const status = getStatusFromUI(cfg.categories);
  const s = summarize(status);
  els.hint.textContent = `Status: ${s.ok} OK • ${s.falta} Falta • ${s.na} não marcados (total ${s.total}).`;
}

function formatDateBR(isoDate) {
  if (!isoDate) return "sem data";
  const [y,m,d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function renderHistory() {
  const all = loadAll(currentBuffetKey);
  els.history.innerHTML = "";

  if (all.length === 0) {
    els.history.innerHTML = `<div class="hint">Nenhum registro salvo ainda.</div>`;
    return;
  }

  for (const ev of all) {
    const s = summarize(ev.status || {});
    const badge = s.falta > 0
      ? `<span style="margin-left:8px;font-size:12px;padding:3px 8px;border:1px solid #e6e6e6;border-radius:999px;background:rgba(198,40,40,.10);"> ${s.falta} falta(s)</span>`
      : `<span style="margin-left:8px;font-size:12px;padding:3px 8px;border:1px solid #e6e6e6;border-radius:999px;background:rgba(46,125,50,.10);"> OK</span>`;

    const div = document.createElement("div");
    div.className = "item";
    div.style.justifyContent = "space-between";
    div.innerHTML = `
      <div>
        <div><strong>${ev.responsavel || "Sem responsável"}</strong>${badge}</div>
        <div style="color:#666;font-size:12px;margin-top:2px;">${formatDateBR(ev.dataEvento)} • atualizado: ${new Date(ev.updatedAt).toLocaleString()}</div>
      </div>
      <div class="btnRow" style="margin:0;">
        <button data-open="${ev.id}">Abrir</button>
      </div>
    `;
    div.querySelector("button[data-open]").addEventListener("click", () => loadEvent(ev.id));
    els.history.appendChild(div);
  }
}

function newEvent() {
  const cfg = BUFFETS[currentBuffetKey];
  if (!cfg) return;

  currentId = null;
  els.responsavel.value = "";
  els.dataEvento.value = "";
  els.observacoes.value = "";

  renderChecklist(cfg.categories, emptyStatus(cfg.categories));
  updateHint();
  els.hint.textContent += " (Novo)";
}

function makeEventObject() {
  const cfg = BUFFETS[currentBuffetKey];
  const status = getStatusFromUI(cfg.categories);

  return {
    id: currentId || crypto.randomUUID(),
    createdAt: nowISO(),
    updatedAt: nowISO(),
    responsavel: (els.responsavel.value || "").trim(),
    dataEvento: els.dataEvento.value || "",
    observacoes: (els.observacoes.value || "").trim(),
    status
  };
}

function upsertEvent(ev) {
  const all = loadAll(currentBuffetKey);
  const idx = all.findIndex(x => x.id === ev.id);

  if (idx >= 0) {
    ev.createdAt = all[idx].createdAt;
    all[idx] = ev;
  } else {
    all.unshift(ev);
  }

  saveAll(currentBuffetKey, all);
  renderHistory();
  currentId = ev.id;
}

function loadEvent(id) {
  const cfg = BUFFETS[currentBuffetKey];
  const ev = loadAll(currentBuffetKey).find(x => x.id === id);
  if (!ev) return;

  currentId = ev.id;
  els.responsavel.value = ev.responsavel || "";
  els.dataEvento.value = ev.dataEvento || "";
  els.observacoes.value = ev.observacoes || "";

  renderChecklist(cfg.categories, ev.status || emptyStatus(cfg.categories));
  updateHint();
  els.hint.textContent += " (Carregado)";
}

function deleteCurrent() {
  if (!currentId) return;
  const all = loadAll(currentBuffetKey).filter(x => x.id !== currentId);
  saveAll(currentBuffetKey, all);
  renderHistory();
  newEvent();
}

function exportCSV() {
  const cfg = BUFFETS[currentBuffetKey];
  const ev = makeEventObject();

  const rows = [];
  rows.push([`Checklist – Buffet de Corrida (${cfg.label})`]);
  rows.push(["Responsável", ev.responsavel]);
  rows.push(["Data do evento", ev.dataEvento]);
  rows.push(["Observações", ev.observacoes]);
  rows.push([]);
  rows.push(["Categoria", "Item", "Status"]);

  for (const cat of cfg.categories) {
    for (const item of cat.items) {
      const st = ev.status[item] || "na";
      const label = st === "ok" ? "OK" : st === "falta" ? "FALTA" : "NÃO MARCADO";
      rows.push([cat.title, item, label]);
    }
  }

  const csv = rows
    .map(r => r.map(x => `"${String(x ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const filename = `checklist_${currentBuffetKey}_${(ev.dataEvento || "sem_data")}_${(ev.responsavel || "responsavel").replace(/\s+/g,"_")}.csv`;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // iPhone share (se disponível)
  if (navigator.canShare && navigator.share) {
    try {
      const file = new File([blob], filename, { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: "Checklist Buffet" });
      }
    } catch {}
  }
}

// Navegação simples (home <-> checklist)
function goHome() {
  currentBuffetKey = null;
  currentId = null;
  els.home.classList.remove("hidden");
  els.checklist.classList.add("hidden");
}

function openBuffet(buffetKey) {
  currentBuffetKey = buffetKey;
  currentId = null;

  const cfg = BUFFETS[buffetKey];
  els.buffetTitle.textContent = `Checklist – ${cfg.label}`;

  els.home.classList.add("hidden");
  els.checklist.classList.remove("hidden");

  // inicia checklist novo e carrega histórico do tipo
  renderChecklist(cfg.categories, emptyStatus(cfg.categories));
  updateHint();
  renderHistory();
}

// Bindings
els.btnSimples.addEventListener("click", () => openBuffet("simples"));
els.btnCompleto.addEventListener("click", () => openBuffet("completo"));
els.btnPremium.addEventListener("click", () => openBuffet("premium"));

els.btnVoltar.addEventListener("click", () => goHome());

els.btnNovo.addEventListener("click", () => newEvent());

els.btnSalvar.addEventListener("click", () => {
  const ev = makeEventObject();
  if (!ev.responsavel) {
    els.hint.textContent = "Preencha o responsável antes de salvar.";
    return;
  }
  ev.updatedAt = nowISO();
  upsertEvent(ev);
  els.hint.textContent = "Registro salvo ✅";
});

els.btnExportar.addEventListener("click", () => exportCSV());
els.btnApagar.addEventListener("click", () => deleteCurrent());

// Init
goHome();
