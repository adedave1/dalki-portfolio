// ── main.js — Dalki Hub ──────────────────────
import { getItems } from "./firebase.js";

const grid        = document.getElementById("grid");
const emptyState  = document.getElementById("emptyState");
const statTotal   = document.getElementById("statTotal");
const statApps    = document.getElementById("statApps");
const statSites   = document.getElementById("statSites");
const modalOverlay= document.getElementById("modalOverlay");
const modalClose  = document.getElementById("modalClose");
const modalImg    = document.getElementById("modalImg");
const modalImgPh  = document.getElementById("modalImgPh");
const modalCat    = document.getElementById("modalCat");
const modalTitle  = document.getElementById("modalTitle");
const modalDesc   = document.getElementById("modalDesc");
const modalMeta   = document.getElementById("modalMeta");
const modalActions= document.getElementById("modalActions");

let allItems = [];
let activeFilter = "all";

const EMOJI = { game:"🎮", app:"📱", website:"🌐", other:"📦" };
const LABEL = { game:"Game", app:"App", website:"Website", other:"Other" };
const BADGE = { game:"badge-game", app:"badge-app", website:"badge-website", other:"badge-other" };

// ── LOAD ─────────────────────────────────────
async function load() {
  try {
    allItems = await getItems();
    const live = allItems.filter(i => i.published === true || i.published === "true");

    // Stats
    const apps  = live.filter(i => i.category === "game" || i.category === "app").length;
    const sites = live.filter(i => i.category === "website").length;
    statTotal.textContent = live.length;
    statApps.textContent  = apps;
    statSites.textContent = sites;

    renderGrid(live);
  } catch(err) {
    grid.innerHTML = `<div class="grid-loading"><p style="color:#EF4444">Failed to load. Refresh and try again.</p></div>`;
    console.error(err);
  }
}

// ── RENDER ───────────────────────────────────
function renderGrid(items) {
  const filtered = activeFilter === "all"
    ? items
    : items.filter(i => i.category === activeFilter);

  grid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  filtered.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card reveal";
    const cat = item.category || "other";

    card.innerHTML = `
      <div class="card-cover">
        ${item.imageURL
          ? `<img src="${item.imageURL}" alt="${item.title}" loading="lazy">`
          : `<div class="card-cover-ph">${EMOJI[cat] || "📦"}</div>`}
      </div>
      <div class="card-body">
        <div class="card-cat">${LABEL[cat] || cat}</div>
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.description || ""}</div>
        <div class="card-footer">
          <span class="card-type-badge ${BADGE[cat] || "badge-other"}">${LABEL[cat] || cat}</span>
          <div class="card-arrow">→</div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => openModal(item));
    grid.appendChild(card);

    setTimeout(() => card.classList.add("active"), i * 40);
  });
}

// ── FILTERS ──────────────────────────────────
document.querySelectorAll(".filter-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    const live = allItems.filter(i => i.published === true || i.published === "true");
    renderGrid(live);
  });
});

// ── MODAL ─────────────────────────────────────
function openModal(item) {
  const cat = item.category || "other";

  // Image
  if (item.imageURL) {
    modalImg.src           = item.imageURL;
    modalImg.style.display = "block";
    modalImgPh.style.display = "none";
  } else {
    modalImg.style.display   = "none";
    modalImgPh.style.display = "flex";
    modalImgPh.textContent   = EMOJI[cat] || "📦";
  }

  modalCat.textContent   = LABEL[cat] || cat;
  modalTitle.textContent = item.title;
  modalDesc.textContent  = item.description || "";

  // Meta
  modalMeta.innerHTML = "";
  if (item.problem) {
    modalMeta.innerHTML += `<div class="modal-meta-item"><b>Problem</b><p>${item.problem}</p></div>`;
  }
  if (item.solution) {
    modalMeta.innerHTML += `<div class="modal-meta-item"><b>What I built</b><p>${item.solution}</p></div>`;
  }
  if (item.results) {
    modalMeta.innerHTML += `<div class="modal-meta-item"><b>Results</b><p>${item.results}</p></div>`;
  }

  // Actions
  modalActions.innerHTML = "";
  if (item.downloadURL) {
    modalActions.innerHTML += `
      <a href="${item.downloadURL}" target="_blank" rel="noopener" class="btn-download">
        ⬇️ Download
      </a>`;
  }
  if (item.siteURL) {
    modalActions.innerHTML += `
      <a href="${item.siteURL}" target="_blank" rel="noopener" class="btn-visit">
        🌐 Visit Website
      </a>`;
  }

  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

load();
