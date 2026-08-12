// ── admin.js — Dalki Admin Dashboard ─────────
import { 
  getProjects, addProject, updateProject, deleteProject, 
  uploadImage, login, logout, onAuthChange 
} from "./firebase.js";

// ── ELEMENTS ─────────────────────────────────
const loginScreen   = document.getElementById("loginScreen");
const dashboard     = document.getElementById("dashboard");
const loginForm     = document.getElementById("loginForm");
const loginEmail    = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError    = document.getElementById("loginError");
const loginBtn      = document.getElementById("loginBtn");
const loginBtnText  = document.getElementById("loginBtnText");
const adminEmail    = document.getElementById("adminEmail");
const logoutBtn     = document.getElementById("logoutBtn");

const projectCount  = document.getElementById("projectCount");
const projectList   = document.getElementById("projectList");
const projectTable  = document.getElementById("projectTable");
const emptyProjects = document.getElementById("emptyProjects");
const navBadge      = document.getElementById("navBadge");
const btnNewProject = document.getElementById("btnNewProject");
const btnEmptyNew   = document.getElementById("btnEmptyNew");

const createForm    = document.getElementById("createForm");
const formTitle     = document.getElementById("formTitle");
const editId        = document.getElementById("editId");
const btnBackToList = document.getElementById("btnBackToList");
const btnCancel     = document.getElementById("btnCancel");
const btnSave       = document.getElementById("btnSave");
const saveBtnText   = document.getElementById("saveBtnText");
const formError     = document.getElementById("formError");

const fieldTitle    = document.getElementById("fieldTitle");
const fieldSlug     = document.getElementById("fieldSlug");
const fieldShortDesc= document.getElementById("fieldShortDesc");
const fieldCategory = document.getElementById("fieldCategory");
const fieldGenre    = document.getElementById("fieldGenre");
const fieldTags     = document.getElementById("fieldTags");
const fieldDownload = document.getElementById("fieldDownload");
const fieldSite     = document.getElementById("fieldSite");
const fieldDescription= document.getElementById("fieldDescription");
const fieldProblem  = document.getElementById("fieldProblem");
const fieldSolution = document.getElementById("fieldSolution");
const fieldResults  = document.getElementById("fieldResults");
const fieldPrivacyPolicy = document.getElementById("fieldPrivacyPolicy");
const fieldVideo    = document.getElementById("fieldVideo");
const fieldSteam    = document.getElementById("fieldSteam");
const fieldAppStore = document.getElementById("fieldAppStore");
const fieldPlayStore= document.getElementById("fieldPlayStore");
const fieldAmazon   = document.getElementById("fieldAmazon");

const coverZone     = document.getElementById("coverZone");
const coverInput    = document.getElementById("coverInput");
const coverPreview  = document.getElementById("coverPreview");
const coverPreviewImg=document.getElementById("coverPreviewImg");
const removeCover   = document.getElementById("removeCover");
const coverProgress = document.getElementById("coverProgress");
const coverProgressBar=document.getElementById("coverProgressBar");
const coverProgressText=document.getElementById("coverProgressText");

const screenshotZone  = document.getElementById("screenshotZone");
const screenshotInput = document.getElementById("screenshotInput");
const screenshotGrid  = document.getElementById("screenshotPreviewGrid");

const deleteModal   = document.getElementById("deleteModal");
const cancelDelete  = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");
const toast         = document.getElementById("toast");

// ── STATE ────────────────────────────────────
let allProjects = [];
let coverFile = null;
let coverURL = null;
let screenshots = [];
let pendingDeleteId = null;

// ── AUTH ─────────────────────────────────────
onAuthChange(user => {
  if (user) {
    loginScreen.style.display = "none";
    dashboard.style.display = "flex";
    adminEmail.textContent = user.email;
    loadProjects();
  } else {
    loginScreen.style.display = "flex";
    dashboard.style.display = "none";
  }
});

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginError.style.display = "none";
  loginBtn.disabled = true;
  loginBtnText.textContent = "Authenticating…";
  try {
    await login(loginEmail.value.trim(), loginPassword.value);
  } catch (err) {
    loginError.textContent = friendlyError(err.code);
    loginError.style.display = "block";
    loginBtn.disabled = false;
    loginBtnText.textContent = "Authenticate";
  }
});

logoutBtn.addEventListener("click", () => logout());

function friendlyError(code) {
  const map = {
    "auth/invalid-email": "Invalid email address.",
    "auth/user-not-found": "No account found.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
  };
  return map[code] || "Sign in failed. Check your credentials.";
}

// ── PANEL NAV ────────────────────────────────
function goToPanel(name) {
  document.querySelectorAll(".admin-nav-item").forEach(b =>
    b.classList.toggle("active", b.dataset.panel === name)
  );
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById(`panel-${name}`).classList.add("active");
}

document.querySelectorAll(".admin-nav-item[data-panel]").forEach(btn =>
  btn.addEventListener("click", () => goToPanel(btn.dataset.panel))
);

btnNewProject.addEventListener("click", () => { resetForm(); goToPanel("create"); });
btnEmptyNew?.addEventListener("click", () => { resetForm(); goToPanel("create"); });
btnBackToList.addEventListener("click", () => goToPanel("projects"));
btnCancel.addEventListener("click", () => {
  if (confirm("Discard changes?")) goToPanel("projects");
});

// ── LOAD PROJECTS ────────────────────────────
async function loadProjects() {
  try {
    allProjects = await getProjects();
    renderTable();
  } catch (err) {
    projectList.innerHTML = `<div style="padding:40px;text-align:center;color:var(--red)">Error: ${err.message}</div>`;
  }
}

function renderTable() {
  const count = allProjects.length;
  projectCount.textContent = count === 0 ? "No projects yet" : `${count} project${count !== 1 ? "s" : ""}`;
  navBadge.textContent = count;
  navBadge.style.display = count > 0 ? "inline-block" : "none";

  if (count === 0) {
    projectTable.style.display = "none";
    emptyProjects.style.display = "block";
    return;
  }

  projectTable.style.display = "block";
  emptyProjects.style.display = "none";

  projectList.innerHTML = allProjects.map((p, i) => {
    const vis = p.visibility || "draft";
    const statusClass = vis === "public" ? "status-public" : "status-draft";
    return `
      <div class="admin-table-row fade-up" style="animation-delay:${i*0.05}s">
        ${p.coverImage
          ? `<img class="table-thumb" src="${p.coverImage}" alt="${p.title}" loading="lazy">`
          : `<div class="table-thumb" style="display:flex;align-items:center;justify-content:center;font-size:18px;background:var(--bg-3)">📦</div>`}
        <div>
          <div style="font-size:14px;font-weight:600">${p.title}</div>
          <div style="font-size:12px;color:var(--text-3)">${p.slug}</div>
        </div>
        <span style="font-size:13px;color:var(--text-2);text-transform:capitalize">${p.category || "—"}</span>
        <span class="table-status ${statusClass}">${vis}</span>
        <div style="display:flex;gap:6px">
          <button class="table-btn table-btn-edit" data-id="${p.id}">Edit</button>
          <button class="table-btn table-btn-del" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");

  projectList.querySelectorAll(".table-btn-edit").forEach(btn =>
    btn.addEventListener("click", () => openEdit(btn.dataset.id))
  );
  projectList.querySelectorAll(".table-btn-del").forEach(btn =>
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id))
  );
}

// ── SLUG ─────────────────────────────────────
fieldTitle.addEventListener("input", () => {
  fieldSlug.value = fieldTitle.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
});

// ── COVER UPLOAD ─────────────────────────────
coverZone.addEventListener("click", () => coverInput.click());
coverZone.addEventListener("dragover", e => { e.preventDefault(); coverZone.classList.add("dragover"); });
coverZone.addEventListener("dragleave", () => coverZone.classList.remove("dragover"));
coverZone.addEventListener("drop", e => {
  e.preventDefault(); coverZone.classList.remove("dragover");
  if (e.dataTransfer.files[0]) handleCover(e.dataTransfer.files[0]);
});
coverInput.addEventListener("change", () => { if (coverInput.files[0]) handleCover(coverInput.files[0]); });

removeCover.addEventListener("click", () => {
  coverFile = null; coverURL = null;
  coverPreview.style.display = "none";
  coverZone.style.display = "block";
  coverInput.value = "";
});

function handleCover(file) {
  if (!file.type.startsWith("image/")) { showToast("Please select an image.", "error"); return; }
  if (file.size > 10 * 1024 * 1024) { showToast("Max 10MB.", "error"); return; }
  coverFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    coverPreviewImg.src = e.target.result;
    coverZone.style.display = "none";
    coverPreview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// ── SCREENSHOTS ──────────────────────────────
screenshotZone.addEventListener("click", () => screenshotInput.click());
screenshotZone.addEventListener("dragover", e => { e.preventDefault(); screenshotZone.classList.add("dragover"); });
screenshotZone.addEventListener("dragleave", () => screenshotZone.classList.remove("dragover"));
screenshotZone.addEventListener("drop", e => {
  e.preventDefault(); screenshotZone.classList.remove("dragover");
  Array.from(e.dataTransfer.files).forEach(handleScreenshot);
});
screenshotInput.addEventListener("change", () => Array.from(screenshotInput.files).forEach(handleScreenshot));

function handleScreenshot(file) {
  if (!file.type.startsWith("image/")) { showToast("Images only.", "error"); return; }
  if (file.size > 5 * 1024 * 1024) { showToast("Max 5MB.", "error"); return; }
  screenshots.push({ file, url: null });
  renderScreenshots();
}

function renderScreenshots() {
  screenshotGrid.innerHTML = screenshots.map((s, i) => {
    const url = s.url || URL.createObjectURL(s.file);
    return `
      <div class="screenshot-item" style="position:relative;width:200px;height:130px">
        <img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r)">
        <button type="button" data-index="${i}" style="position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,0.7);color:#fff;border:none;cursor:pointer;font-size:12px">✕</button>
      </div>
    `;
  }).join("");

  screenshotGrid.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      screenshots.splice(parseInt(btn.dataset.index), 1);
      renderScreenshots();
    });
  });
}

// ── RICH TEXT ────────────────────────────────
document.querySelectorAll(".rich-toolbar-dark button").forEach(btn => {
  btn.addEventListener("click", () => {
    const cmd = btn.dataset.cmd;
    if (cmd === "createLink") {
      const url = prompt("Enter URL:");
      if (url) document.execCommand(cmd, false, url);
    } else {
      document.execCommand(cmd, false, null);
    }
    fieldDescription.focus();
  });
});

// ── RADIO GROUPS ─────────────────────────────
document.querySelectorAll(".radio-dark").forEach(group => {
  group.querySelectorAll(".radio-dark-item").forEach(item => {
    item.addEventListener("click", () => {
      group.querySelectorAll(".radio-dark-item").forEach(i => i.classList.remove("selected"));
      item.classList.add("selected");
      const input = item.querySelector('input[type="radio"]');
      if (input) input.checked = true;
    });
  });
});

// ── SAVE ─────────────────────────────────────
createForm.addEventListener("submit", async e => {
  e.preventDefault();
  formError.style.display = "none";

  if (!fieldTitle.value.trim()) { showFormError("Please enter a project title."); return; }
  if (!fieldCategory.value) { showFormError("Please select a category."); return; }
  if (!fieldSlug.value.trim()) { showFormError("Slug is required."); return; }

  btnSave.disabled = true;
  saveBtnText.textContent = "Saving…";

  try {
    // Upload cover
    let coverImageURL = coverURL;
    if (coverFile) {
      coverProgress.style.display = "flex";
      const result = await uploadImage(coverFile, pct => {
        coverProgressBar.style.width = pct + "%";
        coverProgressText.textContent = pct + "%";
      });
      coverImageURL = result.url;
      coverProgress.style.display = "none";
    }

    // Upload screenshots
    const uploadedScreenshots = [];
    for (const s of screenshots) {
      if (!s.url && s.file) {
        const result = await uploadImage(s.file);
        uploadedScreenshots.push(result.url);
      } else if (s.url) {
        uploadedScreenshots.push(s.url);
      }
    }

    const data = {
      title: fieldTitle.value.trim(),
      slug: fieldSlug.value.trim(),
      shortDescription: fieldShortDesc.value.trim(),
      category: fieldCategory.value,
      genre: fieldGenre.value || null,
      tags: fieldTags.value.split(",").map(t => t.trim()).filter(Boolean).slice(0, 10),
      releaseStatus: document.querySelector('input[name="releaseStatus"]:checked')?.value || "released",
      downloadURL: fieldDownload.value.trim() || null,
      siteURL: fieldSite.value.trim() || null,
      description: fieldDescription.innerHTML,
      problem: fieldProblem.value.trim(),
      solution: fieldSolution.value.trim(),
      results: fieldResults.value.trim(),
      privacyPolicy: fieldPrivacyPolicy.value.trim(),
      screenshots: uploadedScreenshots,
      videoURL: fieldVideo.value.trim() || null,
      storeLinks: {
        steam: fieldSteam.value.trim() || null,
        appStore: fieldAppStore.value.trim() || null,
        playStore: fieldPlayStore.value.trim() || null,
        amazon: fieldAmazon.value.trim() || null,
      },
      communityType: document.querySelector('input[name="communityType"]:checked')?.value || "comments",
      visibility: document.querySelector('input[name="visibility"]:checked')?.value || "draft",
      coverImage: coverImageURL,
    };

    const id = editId.value;
    if (id) {
      await updateProject(id, data);
      showToast("Project updated!");
    } else {
      await addProject(data);
      showToast("Project created!");
    }

    resetForm();
    await loadProjects();
    goToPanel("projects");

  } catch (err) {
    showFormError("Error: " + err.message);
    btnSave.disabled = false;
    saveBtnText.textContent = "Save Project";
  }
});

// ── EDIT ─────────────────────────────────────
async function openEdit(id) {
  resetForm();
  formTitle.textContent = "Edit Project";
  editId.value = id;

  try {
    const { getProjectById } = await import("./firebase.js");
    const p = await getProjectById(id);
    if (!p) { showToast("Project not found", "error"); return; }

    fieldTitle.value = p.title || "";
    fieldSlug.value = p.slug || "";
    fieldShortDesc.value = p.shortDescription || "";
    fieldCategory.value = p.category || "";
    fieldGenre.value = p.genre || "";
    fieldTags.value = (p.tags || []).join(", ");
    fieldDownload.value = p.downloadURL || "";
    fieldSite.value = p.siteURL || "";
    fieldDescription.innerHTML = p.description || "";
    fieldProblem.value = p.problem || "";
    fieldSolution.value = p.solution || "";
    fieldResults.value = p.results || "";
    fieldPrivacyPolicy.value = p.privacyPolicy || "";
    fieldVideo.value = p.videoURL || "";
    fieldSteam.value = p.storeLinks?.steam || "";
    fieldAppStore.value = p.storeLinks?.appStore || "";
    fieldPlayStore.value = p.storeLinks?.playStore || "";
    fieldAmazon.value = p.storeLinks?.amazon || "";

    // Set radios
    if (p.releaseStatus) document.querySelector(`input[name="releaseStatus"][value="${p.releaseStatus}"]`)?.closest(".radio-dark-item")?.click();
    if (p.communityType) document.querySelector(`input[name="communityType"][value="${p.communityType}"]`)?.closest(".radio-dark-item")?.click();
    if (p.visibility) document.querySelector(`input[name="visibility"][value="${p.visibility}"]`)?.closest(".radio-dark-item")?.click();

    // Cover
    if (p.coverImage) {
      coverURL = p.coverImage;
      coverPreviewImg.src = p.coverImage;
      coverZone.style.display = "none";
      coverPreview.style.display = "block";
    }

    // Screenshots
    if (p.screenshots) {
      screenshots = p.screenshots.map(url => ({ file: null, url }));
      renderScreenshots();
    }

    goToPanel("create");
  } catch (err) {
    showToast("Error: " + err.message, "error");
  }
}

// ── DELETE ───────────────────────────────────
function openDeleteModal(id) {
  pendingDeleteId = id;
  deleteModal.classList.add("open");
}

cancelDelete.addEventListener("click", () => {
  deleteModal.classList.remove("open");
  pendingDeleteId = null;
});

confirmDelete.addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  deleteModal.classList.remove("open");
  try {
    await deleteProject(pendingDeleteId);
    showToast("Project deleted.");
    pendingDeleteId = null;
    await loadProjects();
  } catch (err) {
    showToast("Delete failed: " + err.message, "error");
  }
});

// ── RESET ────────────────────────────────────
function resetForm() {
  createForm.reset();
  editId.value = "";
  formTitle.textContent = "New Project";
  coverFile = null; coverURL = null;
  coverPreview.style.display = "none";
  coverZone.style.display = "block";
  coverProgress.style.display = "none";
  coverProgressBar.style.width = "0%";
  screenshots = [];
  screenshotGrid.innerHTML = "";
  fieldDescription.innerHTML = "";
  formError.style.display = "none";
  btnSave.disabled = false;
  saveBtnText.textContent = "Save Project";

  // Reset radios to defaults
  document.querySelector('input[name="releaseStatus"][value="released"]')?.closest(".radio-dark-item")?.click();
  document.querySelector('input[name="communityType"][value="comments"]')?.closest(".radio-dark-item")?.click();
  document.querySelector('input[name="visibility"][value="draft"]')?.closest(".radio-dark-item")?.click();
}

// ── UTILS ────────────────────────────────────
function showToast(msg, type = "success") {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = "toast"; }, 3200);
}

function showFormError(msg) {
  formError.textContent = msg;
  formError.style.display = "block";
  formError.scrollIntoView({ behavior: "smooth", block: "center" });
}
