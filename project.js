// ── project.js — Dalki Project Page (Play Store) ─
import { 
  getProjectBySlug, incrementViews, incrementDownloads,
  getComments, addComment, onAuthChange, getCurrentUser
} from "./firebase.js";

const projectHeroCover = document.getElementById("projectHeroCover");
const projectIcon      = document.getElementById("projectIcon");
const projectCat       = document.getElementById("projectCat");
const projectTitle     = document.getElementById("projectTitle");
const projectStatus    = document.getElementById("projectStatus");
const statDownloads    = document.getElementById("statDownloads");
const statViews        = document.getElementById("statViews");
const btnDownload      = document.getElementById("btnDownload");
const btnVisit         = document.getElementById("btnVisit");
const btnShare         = document.getElementById("btnShare");
const projectDescription= document.getElementById("projectDescription");
const blockScreenshots = document.getElementById("blockScreenshots");
const screenshotCarousel=document.getElementById("screenshotCarousel");
const blockProblem     = document.getElementById("blockProblem");
const projectProblem   = document.getElementById("projectProblem");
const blockSolution    = document.getElementById("blockSolution");
const projectSolution  = document.getElementById("projectSolution");
const blockResults     = document.getElementById("blockResults");
const projectResults   = document.getElementById("projectResults");
const blockVideo       = document.getElementById("blockVideo");
const videoEmbed       = document.getElementById("videoEmbed");
const blockSimilar     = document.getElementById("blockSimilar");
const similarGrid      = document.getElementById("similarGrid");
const infoCategory     = document.getElementById("infoCategory");
const infoGenre        = document.getElementById("infoGenre");
const infoStatus       = document.getElementById("infoStatus");
const infoDownloads    = document.getElementById("infoDownloads");
const infoTagsRow      = document.getElementById("infoTagsRow");
const infoTags         = document.getElementById("infoTags");
const cardStores       = document.getElementById("cardStores");
const storeLinks       = document.getElementById("storeLinks");
const cardTech         = document.getElementById("cardTech");
const techTags         = document.getElementById("techTags");
const commentSection   = document.getElementById("commentSection");
const commentForm      = document.getElementById("commentForm");
const commentInput     = document.getElementById("commentInput");
const btnPostComment   = document.getElementById("btnPostComment");
const commentList      = document.getElementById("commentList");
const lightbox         = document.getElementById("lightbox");
const lightboxImg      = document.getElementById("lightboxImg");
const lightboxClose    = document.getElementById("lightboxClose");
const toast            = document.getElementById("toast");

let currentProject = null;
let currentUser = null;

// ── AUTH ─────────────────────────────────────
onAuthChange(user => {
  currentUser = user;
});

// ── LOAD ─────────────────────────────────────
async function loadProject() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    showToast("Project not found", "error");
    return;
  }

  try {
    currentProject = await getProjectBySlug(slug);
    if (!currentProject) {
      showToast("Project not found", "error");
      return;
    }

    // Track view
    incrementViews(currentProject.id).catch(() => {});

    renderProject();
    loadComments();
    loadSimilar();
  } catch (err) {
    showToast("Error loading project", "error");
  }
}

function renderProject() {
  const p = currentProject;
  document.title = `${p.title} — Dalki`;

  // Hero cover
  if (p.coverImage) {
    projectHeroCover.innerHTML = `<img src="${p.coverImage}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover">`;
    projectIcon.innerHTML = `<img src="${p.coverImage}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover">`;
  }

  // Text
  projectCat.textContent = (p.category || "project").toUpperCase();
  projectTitle.textContent = p.title;
  projectStatus.textContent = p.releaseStatus ? p.releaseStatus.replace("-", " ") : "Released";
  statDownloads.textContent = formatNumber(p.downloads || 0);
  statViews.textContent = formatNumber(p.views || 0);

  // Description
  projectDescription.innerHTML = p.description || `<p style="color:var(--text-3)">No description provided.</p>`;

  // Problem
  if (p.problem) {
    blockProblem.style.display = "block";
    projectProblem.textContent = p.problem;
  }

  // Solution
  if (p.solution) {
    blockSolution.style.display = "block";
    projectSolution.textContent = p.solution;
  }

  // Results
  if (p.results) {
    blockResults.style.display = "block";
    projectResults.textContent = p.results;
  }

  // Screenshots
  if (p.screenshots && p.screenshots.length > 0) {
    blockScreenshots.style.display = "block";
    screenshotCarousel.innerHTML = p.screenshots.map((url, i) => `
      <div class="screenshot-item" onclick="openLightbox('${url}')">
        <img src="${url}" alt="Screenshot ${i+1}" loading="lazy">
      </div>
    `).join("");
  }

  // Video
  if (p.videoURL) {
    const videoId = extractYouTubeId(p.videoURL);
    if (videoId) {
      blockVideo.style.display = "block";
      videoEmbed.innerHTML = `
        <iframe width="100%" height="100%" 
          src="https://www.youtube.com/embed/${videoId}" 
          frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen style="border-radius:var(--r)">
        </iframe>
      `;
    }
  }

  // Actions
  const hasDownload = p.downloadURL || (p.files && p.files.length > 0);
  const hasWebsite = p.siteURL;

  if (hasDownload) {
    btnDownload.style.display = "flex";
    btnDownload.onclick = () => {
      const url = p.downloadURL || p.files[0].url;
      incrementDownloads(p.id);
      window.open(url, "_blank");
    };
  }

  if (hasWebsite) {
    btnVisit.style.display = "flex";
    btnVisit.href = p.siteURL;
  }

  btnShare.onclick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied!");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  // Side info
  infoCategory.textContent = p.category || "—";
  infoGenre.textContent = p.genre || "—";
  infoStatus.textContent = p.releaseStatus ? p.releaseStatus.replace("-", " ") : "Released";
  infoDownloads.textContent = formatNumber(p.downloads || 0);

  // Tags
  if (p.tags && p.tags.length > 0) {
    infoTagsRow.style.display = "flex";
    infoTags.innerHTML = p.tags.map(t => 
      `<span style="padding:3px 10px;background:var(--surface-2);border:1px solid var(--border);border-radius:20px;font-size:11px">${t}</span>`
    ).join("");
  }

  // Store links
  const stores = p.storeLinks || {};
  const storeEntries = [];
  if (stores.steam) storeEntries.push({ name: "Steam", url: stores.steam, icon: "🎮" });
  if (stores.appStore) storeEntries.push({ name: "App Store", url: stores.appStore, icon: "🍎" });
  if (stores.playStore) storeEntries.push({ name: "Play Store", url: stores.playStore, icon: "🤖" });
  if (stores.amazon) storeEntries.push({ name: "Amazon", url: stores.amazon, icon: "📱" });

  if (storeEntries.length > 0) {
    cardStores.style.display = "block";
    storeLinks.innerHTML = storeEntries.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener" class="store-btn">
        <span class="store-btn-icon">${s.icon}</span>
        <span>${s.name}</span>
      </a>
    `).join("");
  }

  // Tech stack (using tags as tech stack for now)
  if (p.tags && p.tags.length > 0) {
    cardTech.style.display = "block";
    techTags.innerHTML = p.tags.map(t => 
      `<span style="padding:4px 12px;background:var(--cyan-dim);border:1px solid rgba(0,212,255,0.2);border-radius:20px;font-size:12px;color:var(--cyan)">${t}</span>`
    ).join("");
  }

  // Comments
  if (p.communityType !== "disabled") {
    commentSection.style.display = "block";
  }
}

// ── SIMILAR PROJECTS ─────────────────────────
async function loadSimilar() {
  if (!currentProject) return;
  try {
    const { getProjects } = await import("./firebase.js");
    const all = await getProjects();
    const similar = all
      .filter(p => p.id !== currentProject.id && p.visibility === "public" && p.category === currentProject.category)
      .slice(0, 4);

    if (similar.length === 0) return;

    blockSimilar.style.display = "block";
    similarGrid.innerHTML = similar.map(p => `
      <a href="/project.html?slug=${p.slug}" class="similar-card">
        <div class="similar-card-cover">
          ${p.coverImage ? `<img src="${p.coverImage}" alt="${p.title}" loading="lazy">` : ""}
        </div>
        <div class="similar-card-body">
          <div class="similar-card-title">${p.title}</div>
          <div class="similar-card-cat">${p.category || "project"}</div>
        </div>
      </a>
    `).join("");
  } catch (err) {
    console.error("Failed to load similar:", err);
  }
}

// ── COMMENTS ─────────────────────────────────
async function loadComments() {
  if (!currentProject || currentProject.communityType === "disabled") return;
  try {
    const comments = await getComments(currentProject.id);
    if (comments.length === 0) {
      commentList.innerHTML = `<p style="color:var(--text-3);text-align:center;padding:40px">No comments yet. Be the first!</p>`;
      return;
    }
    commentList.innerHTML = comments.map(c => `
      <div class="comment">
        <div class="comment-avatar">${(c.authorName || "U")[0].toUpperCase()}</div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">${c.authorName || "Anonymous"}</span>
            <span class="comment-time">${timeAgo(c.createdAt)}</span>
          </div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Comments error:", err);
  }
}

btnPostComment?.addEventListener("click", async () => {
  const text = commentInput.value.trim();
  if (!text) return;

  btnPostComment.disabled = true;
  btnPostComment.textContent = "Posting…";

  try {
    await addComment(currentProject.id, {
      text,
      authorId: currentUser?.uid || "guest",
      authorName: currentUser?.displayName || currentUser?.email?.split("@")[0] || "Guest",
    });
    commentInput.value = "";
    showToast("Comment posted!");
    loadComments();
  } catch (err) {
    showToast("Failed to post comment", "error");
  } finally {
    btnPostComment.disabled = false;
    btnPostComment.textContent = "Post Comment";
  }
});

// ── LIGHTBOX ─────────────────────────────────
window.openLightbox = function(url) {
  lightboxImg.src = url;
  lightbox.style.display = "flex";
  setTimeout(() => lightbox.classList.add("open"), 10);
  document.body.style.overflow = "hidden";
};

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });

function closeLightbox() {
  lightbox.classList.remove("open");
  setTimeout(() => {
    lightbox.style.display = "none";
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }, 250);
}

// ── UTILS ────────────────────────────────────
function showToast(msg, type = "success") {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = "toast"; }, 3200);
}

function formatNumber(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + "M";
  if (n >= 1000) return (n/1000).toFixed(1) + "k";
  return n.toString();
}

function timeAgo(timestamp) {
  if (!timestamp) return "just now";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
  return match ? match[1] : null;
}

loadProject();


