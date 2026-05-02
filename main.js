// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('active'); obs.unobserve(e.target); } });
},{threshold:0.1});

document.querySelectorAll('.reveal,.rs,.sec-title,.sec-label,.sec-desc').forEach(el => {
  if(!el.closest('.hero')) obs.observe(el);
});

// Nav active
const secs = document.querySelectorAll('section[id]');
window.addEventListener('scroll',()=>{
  let cur='';
  secs.forEach(s=>{ if(scrollY>=s.offsetTop-140) cur=s.id; });
  document.querySelectorAll('.links a').forEach(a=>{
    a.classList.toggle('active', a.getAttribute('href')===`#${cur}`);
  });
});

// Mobile menu
const mt=document.getElementById('menu-toggle'), nl=document.getElementById('nav-links');
mt.addEventListener('click',()=>{ nl.classList.toggle('active'); mt.classList.toggle('active'); });
document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>{ nl.classList.remove('active'); mt.classList.remove('active'); }));

// Filters
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(c=>{ c.style.display=(f==='all'||c.dataset.category===f)?'block':'none'; });
  });
});

// Modals
document.querySelectorAll('.modal-trigger').forEach(t=>{
  t.addEventListener('click',e=>{
    e.preventDefault();
    const m=document.querySelector(t.getAttribute('href'));
    if(m){ m.classList.add('active'); document.body.style.overflow='hidden'; }
  });
});
document.querySelectorAll('.modal-close').forEach(b=>{
  b.addEventListener('click',()=>{ b.closest('.modal').classList.remove('active'); document.body.style.overflow=''; });
});
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click',e=>{ if(e.target===m){ m.classList.remove('active'); document.body.style.overflow=''; } });
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') document.querySelectorAll('.modal.active').forEach(m=>{ m.classList.remove('active'); document.body.style.overflow=''; });
});
// Scroll to top button
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', scrollY > 400);
});
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Form toast feedback
const form = document.querySelector('.contact-form');
const toast = document.getElementById('toast');
if (form) {
  form.addEventListener('submit', (e) => {
    // Let Formspree handle submission, show toast optimistically
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }, 800);
  });
}
