// ============================================
//  main.js — Dalki Portfolio (Dynamic Projects)
// ============================================

import { getProjects } from "./firebase.js";

// ── Scroll Reveal ──────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); } });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal,.rs,.sec-title,.sec-label,.sec-desc').forEach(el => {
  if (!el.closest('.hero')) obs.observe(el);
});

// ── Nav active ─────────────────────────────
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; });
  document.querySelectorAll('.links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${cur}`);
  });
});

// ── Mobile menu ────────────────────────────
const mt = document.getElementById('menu-toggle');
const nl = document.getElementById('nav-links');
mt.addEventListener('click', () => { nl.classList.toggle('active'); mt.classList.toggle('active'); });
document.querySelectorAll('.links a').forEach(a => a.addEventListener('click', () => {
  nl.classList.remove('active'); mt.classList.remove('active');
}));

// ── Scroll to top ──────────────────────────
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', scrollY > 400);
  });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Static modals (featured only) ──────────
function initModals() {
  document.querySelectorAll('.modal-trigger').forEach(t => {
    t.addEventListener('click', e => {
      e.preventDefault();
      const m = document.querySelector(t.getAttribute('href'));
      if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
    });
  });
  document.querySelectorAll('.modal-close').forEach(b => {
    b.addEventListener('click', () => { b.closest('.modal').classList.remove('active'); document.body.style.overflow = ''; });
  });
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) { m.classList.remove('active'); document.body.style.overflow = ''; } });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal.active').forEach(m => { m.classList.remove('active'); document.body.style.overflow = ''; });
  });
}

// ── Dynamic Projects ───────────────────────
const CATEGORY_LABELS = {
  game: 'Game', product: 'Product', android: 'Android', ios: 'iOS', flutter: 'Flutter'
};

const CATEGORY_EMOJI = {
  game: '🎮', product: '📦', android: '🤖', ios: '🍎', flutter: '🐦'
};

async function loadProjects() {
  const container = document.getElementById('dynamic-projects');
  if (!container) return;

  try {
    const projects = await getProjects();
    const published = projects.filter(p => p.published === true || p.published === 'true');

    if (published.length === 0) {
      container.innerHTML = '<div style="color:var(--muted);font-size:14px;padding:20px 0">No projects yet.</div>';
      return;
    }

    container.innerHTML = '';

    published.forEach(p => {
      const cat   = p.category || 'product';
      const label = CATEGORY_LABELS[cat] || cat;
      const emoji = CATEGORY_EMOJI[cat]  || '📱';
      const card  = document.createElement('div');
      card.className        = 'project-card';
      card.dataset.category = cat;

      const hasCaseStudy = p.problem || p.solution || p.results || p.caseStudy;

      card.innerHTML = `
        <div class="proj-img">
          ${p.imageURL
            ? `<img src="${p.imageURL}" alt="${p.title}" loading="lazy"/>`
            : `<div class="proj-ph">${emoji}</div>`}
        </div>
        <div class="proj-body">
          <div class="proj-tag">${label}</div>
          <h3>${p.title}</h3>
          <p>${p.description || ''}</p>
          ${hasCaseStudy ? `<button class="case-btn dyn-case-btn">
            Case Study
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>` : ''}
        </div>
      `;

      // Case study modal trigger
      if (hasCaseStudy) {
        card.querySelector('.dyn-case-btn').addEventListener('click', () => openDynModal(p));
      }

      container.appendChild(card);
    });

    // Re-init filters
    initFilters();

    // Observe new cards
    container.querySelectorAll('.project-card').forEach(el => obs.observe(el));

  } catch (err) {
    container.innerHTML = `<div style="color:var(--muted);font-size:14px">Couldn't load projects: ${err.message}</div>`;
    console.error(err);
  }
}

// ── Dynamic case study modal ───────────────
let dynModal = null;

function openDynModal(p) {
  if (dynModal) dynModal.remove();

  const tags = (p.tags || []).map(t => `<span class="ms-pill">${t}</span>`).join('');
  
  // Parse caseStudy field (supports plain text or Problem/Solution/Results format)
  let body = '';
  const text = p.caseStudy || '';
  const hasSections = /problem:|solution:|results:/i.test(text);

  if (hasSections) {
    const lines = text.split('\n').filter(l => l.trim());
    lines.forEach(line => {
      const match = line.match(/^(problem|solution|results):\s*(.*)/i);
      if (match) {
        body += `<div class="modal-sec"><b>${match[1]}</b><p>${match[2]}</p></div>`;
      } else {
        body += `<div class="modal-sec"><p>${line}</p></div>`;
      }
    });
  } else {
    body = `<div class="modal-sec"><p>${text.replace(/\n/g, '<br>')}</p></div>`;
  }

  dynModal = document.createElement('div');
  dynModal.className = 'modal active';
  dynModal.innerHTML = `
    <div class="modal-box">
      <button class="modal-close">&times;</button>
      <h3>${p.title}</h3>
      <div class="modal-stack">${tags}</div>
      ${body}
    </div>
  `;

  document.body.appendChild(dynModal);
  document.body.style.overflow = 'hidden';

  dynModal.querySelector('.modal-close').addEventListener('click', closeDynModal);
  dynModal.addEventListener('click', e => { if (e.target === dynModal) closeDynModal(); });
}

function closeDynModal() {
  if (dynModal) { dynModal.remove(); dynModal = null; }
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && dynModal) closeDynModal();
});

// ── Filters ────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(c => {
        c.style.display = (f === 'all' || c.dataset.category === f) ? 'block' : 'none';
      });
    });
  });
}

// ── Contact form toast ─────────────────────
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', () => {
    setTimeout(() => {
      const t = document.getElementById('toast');
      if (t) { t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 4000); }
    }, 500);
  });
}

// ── Init ───────────────────────────────────
initModals();
loadProjects();
