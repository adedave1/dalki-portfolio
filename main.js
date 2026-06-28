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

// ── Skeleton Templates ─────────────────────
const SKELETON_CARD = `
  <div class="project-card skeleton-card">
    <div class="skeleton-img"></div>
    <div class="skeleton-body">
      <div class="skeleton-tag"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  </div>
`;

const SKELETON_FEATURED = `
  <div class="feat-img skeleton-bg">
    <div class="skeleton-feat-img"></div>
  </div>
  <div class="feat-txt">
    <div class="skeleton-tag" style="width:120px"></div>
    <div class="skeleton-title" style="width:80%;margin:12px 0"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line short"></div>
  </div>
`;

// ── Dynamic Featured Project ───────────────
async function loadFeatured() {
  const wrap = document.getElementById('featured-wrap');
  if (!wrap) return;

  try {
    const projects = await getProjects();
    const published = projects.filter(p => p.published === true || p.published === 'true');
    
    // Sort by updatedAt desc, fallback to createdAt
    published.sort((a, b) => {
      const aTime = b.updatedAt?.toMillis?.() || b.updatedAt || 0;
      const bTime = a.updatedAt?.toMillis?.() || a.updatedAt || 0;
      return bTime - aTime;
    });

    const p = published[0];

    if (!p) {
      // Fallback static featured
      wrap.innerHTML = `
        <div class="feat-img">
          <div class="feat-ph">🎯</div>
        </div>
        <div class="feat-txt">
          <div class="feat-tag">★ Flagship Project</div>
          <div class="feat-title">GlassChat</div>
          <p class="feat-desc">A premium glassmorphism messaging app with Fog Privacy, Time Capsule messages, and WebRTC voice/video calls.</p>
          <div class="feat-meta">
            <div class="meta-item"><b>Problem it solves</b><p>Existing chat apps are cluttered and privacy-invasive. Users want clean, ephemeral messaging.</p></div>
            <div class="meta-item"><b>What I built</b><p>Native Android app with Jetpack Compose, Supabase backend, Firebase Cloud Messaging, and WebRTC.</p></div>
            <div class="meta-item"><b>Results</b><p>Full feature set implemented · Play Store-ready · Custom privacy controls</p></div>
          </div>
        </div>
      `;
      return;
    }

    const tags = (p.tags || []).map(t => `<span class="ms-pill">${t}</span>`).join('');
    const hasCaseStudy = p.problem || p.solution || p.results;

    wrap.innerHTML = `
      <div class="feat-img">
        ${p.imageURL
          ? `<img src="${p.imageURL}" alt="${p.title}" loading="eager"/>`
          : `<div class="feat-ph">${CATEGORY_EMOJI[p.category] || '📱'}</div>`}
      </div>
      <div class="feat-txt">
        <div class="feat-tag">★ Flagship Project</div>
        <div class="feat-title">${p.title}</div>
        <p class="feat-desc">${p.description || ''}</p>
        <div class="feat-meta">
          ${p.problem ? `<div class="meta-item"><b>Problem it solves</b><p>${p.problem}</p></div>` : ''}
          ${p.solution ? `<div class="meta-item"><b>What I built</b><p>${p.solution}</p></div>` : ''}
          ${p.results ? `<div class="meta-item"><b>Results</b><p>${p.results}</p></div>` : ''}
        </div>
        ${tags ? `<div class="modal-stack" style="margin-bottom:20px">${tags}</div>` : ''}
        ${hasCaseStudy ? `<button class="case-btn dyn-case-btn">
          View Full Case Study
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>` : ''}
      </div>
    `;

    if (hasCaseStudy) {
      wrap.querySelector('.dyn-case-btn').addEventListener('click', () => openDynModal(p));
    }

  } catch (err) {
    wrap.innerHTML = `<div class="feat-loading">Couldn't load featured project</div>`;
    console.error(err);
  }
}

// ── Dynamic Projects ───────────────────────
const CATEGORY_LABELS = {
  game: 'Game', product: 'Product', ui: 'UI / Design', other: 'Other',
  android: 'Android', ios: 'iOS', flutter: 'Flutter'
};

const CATEGORY_EMOJI = {
  game: '🎮', product: '📦', ui: '🎨', other: '📱',
  android: '🤖', ios: '🍎', flutter: '🐦'
};

async function loadProjects() {
  const container = document.getElementById('dynamic-projects');
  if (!container) return;

  // Show skeletons first
  container.innerHTML = Array(6).fill(SKELETON_CARD).join('');

  try {
    const projects = await getProjects();
    const published = projects.filter(p => p.published === true || p.published === 'true');

    if (published.length === 0) {
      container.innerHTML = '<div style="color:var(--muted);font-size:14px;padding:20px 0">No projects yet. Check back soon.</div>';
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

      if (hasCaseStudy) {
        card.querySelector('.dyn-case-btn').addEventListener('click', () => openDynModal(p));
      }

      container.appendChild(card);
    });

    initFilters();
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
  
  let body = '';
  if (p.problem) body += `<div class="modal-sec"><b>Problem</b><p>${p.problem}</p></div>`;
  if (p.solution) body += `<div class="modal-sec"><b>Solution</b><p>${p.solution}</p></div>`;
  if (p.results) body += `<div class="modal-sec"><b>Results</b><div class="modal-result"><p>${p.results}</p></div></div>`;
  
  // Fallback to caseStudy field if structured fields aren't present
  if (!body && p.caseStudy) {
    body = `<div class="modal-sec"><p>${p.caseStudy.replace(/\n/g, '<br>')}</p></div>`;
  }

  dynModal = document.createElement('div');
  dynModal.className = 'modal active';
  dynModal.innerHTML = `
    <div class="modal-box">
      <button class="modal-close">&times;</button>
      <h3>${p.title}</h3>
      ${tags ? `<div class="modal-stack">${tags}</div>` : ''}
      ${body || '<div class="modal-sec"><p>No detailed case study available.</p></div>'}
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
loadFeatured();
loadProjects();
