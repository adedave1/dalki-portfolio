// ── main.js — Dalki Browse (Cosmic Obsidian) ─
import { getProjects } from "./firebase.js";

const grid          = document.getElementById("grid");
const emptyState    = document.getElementById("emptyState");
const featuredRow   = document.getElementById("featuredRow");
const statTotal     = document.getElementById("statTotal");
const statGames     = document.getElementById("statGames");
const statApps      = document.getElementById("statApps");
const statSites     = document.getElementById("statSites");

let allProjects = [];
let activeFilter = "all";

const EMOJI = { game:"🎮", app:"📱", website:"🌐", tool:"🛠️", other:"📦" };
const BADGE = { game:"badge-game", app:"badge-app", website:"badge-website", tool:"badge-tool", other:"badge-other" };

// ── PARTICLES ────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById("particlesCanvas");
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];
  const dpr = Math.min(window.devicePixelRatio, 2);

  function resize() {
    w = canvas.width = canvas.clientWidth * dpr;
    h = canvas.height = canvas.clientHeight * dpr;
  }
  resize();
  window.addEventListener("resize", resize);

  // Create particles
  const count = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 8000));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? [0, 212, 255] : [245, 158, 11],
    });
  }

  let mouseX = w/2, mouseY = h/2;
  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * dpr;
    mouseY = (e.clientY - rect.top) * dpr;
  });

  let time = 0;
  function animate() {
    time += 0.016;
    ctx.clearRect(0, 0, w, h);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += 0.015;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Mouse interaction
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const maxDist = 150 * dpr;
      if (dist < maxDist) {
        const force = (1 - dist/maxDist) * 0.5;
        p.vx += (dx/dist) * force * 0.1;
        p.vy += (dy/dist) * force * 0.1;
      }

      // Dampen velocity
      p.vx *= 0.99;
      p.vy *= 0.99;

      const alpha = p.alpha * (0.6 + Math.sin(p.twinkle) * 0.4);
      const r = p.color[0], g = p.color[1], b = p.color[2];

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();

      // Glow for larger particles
      if (p.size > 1.2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.1})`;
        ctx.fill();
      }
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100 * dpr) {
          const alpha = (1 - dist/(100*dpr)) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
})();

// ── LOAD ─────────────────────────────────────
async function load() {
  try {
    allProjects = await getProjects();
    const publicProjects = allProjects.filter(p => p.visibility === "public");

    statTotal.textContent = publicProjects.length;
    statGames.textContent = publicProjects.filter(p => p.category === "game").length;
    statApps.textContent  = publicProjects.filter(p => p.category === "app").length;
    statSites.textContent = publicProjects.filter(p => p.category === "website").length;

    renderFeatured(publicProjects);
    renderGrid(publicProjects);
  } catch(err) {
    grid.innerHTML = `<div class="loading" style="grid-column:1/-1"><p style="color:var(--red)">Failed to load. Refresh to try again.</p></div>`;
    console.error(err);
  }
}

// ── FEATURED ROW ─────────────────────────────
function renderFeatured(projects) {
  const featured = projects.slice(0, 6);
  if (featured.length === 0) {
    featuredRow.innerHTML = "";
    return;
  }

  featuredRow.innerHTML = featured.map((p, i) => {
    const cat = p.category || "other";
    return `
      <a href="/project.html?slug=${p.slug}" class="card fade-up" style="animation-delay:${i*0.1}s">
        <div class="card-cover">
          ${p.coverImage
            ? `<img src="${p.coverImage}" alt="${p.title}" loading="lazy">`
            : `<div class="card-cover-ph">${EMOJI[cat] || "📦"}</div>`}
        </div>
        <div class="card-body">
          <div class="card-cat">${cat}</div>
          <div class="card-title">${p.title}</div>
          <div class="card-desc">${p.shortDescription || p.description || ""}</div>
          <div class="card-footer">
            <span class="card-badge ${BADGE[cat] || "badge-other"}">${cat}</span>
            <div class="card-meta">
              <span>⬇ ${formatNumber(p.downloads || 0)}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  }).join("");
}

// ── GRID ─────────────────────────────────────
function renderGrid(projects) {
  const filtered = activeFilter === "all"
    ? projects
    : projects.filter(p => p.category === activeFilter);

  grid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  filtered.forEach((p, i) => {
    const cat = p.category || "other";
    const card = document.createElement("a");
    card.href = `/project.html?slug=${p.slug}`;
    card.className = "card grid-card fade-up";
    card.style.animationDelay = `${i * 0.04}s`;

    card.innerHTML = `
      <div class="card-cover">
        ${p.coverImage
          ? `<img src="${p.coverImage}" alt="${p.title}" loading="lazy">`
          : `<div class="card-cover-ph">${EMOJI[cat] || "📦"}</div>`}
      </div>
      <div class="card-body">
        <div class="card-cat">${cat}</div>
        <div class="card-title">${p.title}</div>
        <div class="card-desc">${p.shortDescription || ""}</div>
        <div class="card-footer">
          <span class="card-badge ${BADGE[cat] || "badge-other"}">${cat}</span>
          <div class="card-meta">
            <span>⬇ ${formatNumber(p.downloads || 0)}</span>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function formatNumber(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + "M";
  if (n >= 1000) return (n/1000).toFixed(1) + "k";
  return n.toString();
}

// ── FILTERS ──────────────────────────────────
document.querySelectorAll(".filter-pill").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    const publicProjects = allProjects.filter(p => p.visibility === "public");
    renderGrid(publicProjects);
  });
});

// ── SCROLL REVEAL ────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.1 });

load();
