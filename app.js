let currentId = null;

const CATEGORIES = [
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
];

const els = {
  responsavel: document.getElementById("responsavel"),
  dataEvento: document.getElementById("dataEvento"),
  observacoes: document.getElementById("observacoes"),
  checklistRoot: document.getElementById("checklistRoot"),
  statusHint: document.getElementById("statusHint"),
  historyList: document.getElementById("historyList"),
  btnSalvar: document.getElementById("btnSalvar"),
  btnNovo: document.getElementById("btnNovo"),
  btnExportar: document.getElementById("btnExportar"),
  btnApagar: document.getElementById("btnApagar")
};

/* ---------- Helpers ---------- */
function emptyStatus() {
  const s = {};
  CATEGORIES.forEach(c =>
    c.items.forEach(i => s[i] = "na")
  );
  return s;
}

function summarize(status) {
  const v = Object.values(status);
  return {
    ok: v.filter(x => x === "ok").length,
    falta: v.filter(x => x === "falta").length,
    na: v.filter(x => x === "na").length,
    total: v.length
  };
}

/* ---------- Render ---------- */
function renderChecklist(status) {
  els.checklistRoot.innerHTML = "";

  CATEGORIES.forEach(cat => {
    const title = document.createElement("div");
    title.className = "cat-title";
    title.innerHTML = `<span>${cat.emoji}</span> ${cat.title}`;
    els.checklistRoot.appendChild(title);

    cat.items.forEach(item => {
      const row = document.createElement("div");
      row.className = "item";

      const name = document.createElement("div");
      name.className = "item-name";
      name.textContent = item;

      const controls = document.createElement("div");
      controls.className = "status";

      ["na", "ok", "falta"].forEach(type => {
        const btn = document.createElement("div");
        btn.className = "pill " + (type === "ok" ? "ok" : type === "falta" ? "falta" : "");
        btn.textContent = type === "na" ? "—" : type === "ok" ? "OK" : "Falta";
        btn.dataset.value = type;
        btn.dataset.active = status[item] === type ? "true" : "false";

        btn.onclick = () => {
          status[item] = type;
          renderChecklist(status);
          updateHint(status);
        };

        controls.appendChild(btn);
      });

      row.appendChild(name);
      row.appendChild(controls);
      els.checklistRoot.appendChild(row);
    });
  });
}

function updateHint(status) {
  const s = summarize(status);
  els.statusHint.textContent =
    `Status: ${s.ok} OK • ${s.falta} Falta • ${s.na} não marcados (total ${s.total})`;
}

/* ---------- Init ---------- */
let currentStatus = emptyStatus();
renderChecklist(currentStatus);
updateHint(currentStatus);

/* ---------- Botões ---------- */
els.btnNovo?.addEventListener("click", () => {
  currentStatus = emptyStatus();
  renderChecklist(currentStatus);
  updateHint(currentStatus);
  els.observacoes.value = "";
});

els.btnSalvar?.addEventListener("click", () => {
  alert("Checklist salvo (modo simples). Pronto para deploy!");
});

els.btnExportar?.addEventListener("click", () => {
  const rows = [["Categoria", "Item", "Status"]];
  CATEGORIES.forEach(cat =>
    cat.items.forEach(item =>
      rows.push([cat.title, item, currentStatus[item]])
    )
  );

  const csv = rows.map(r => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "checklist_buffet_corrida.csv";
  a.click();
});
