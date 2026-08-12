// ── privacy.js — Dalki Project Privacy Policy Page ─
import { getProjectBySlug } from "./firebase.js";

const policyTitle    = document.getElementById("policyTitle");
const policyBody     = document.getElementById("policyBody");
const backToProject  = document.getElementById("backToProject");
const toast          = document.getElementById("toast");

async function loadPolicy() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    showNotFound();
    return;
  }

  backToProject.href = `/project.html?slug=${encodeURIComponent(slug)}`;

  try {
    const project = await getProjectBySlug(slug);
    if (!project || !project.privacyPolicy) {
      showNotFound();
      return;
    }

    document.title = `Privacy Policy — ${project.title} — Dalki`;
    policyTitle.textContent = `Privacy Policy — ${project.title}`;
    policyBody.textContent = project.privacyPolicy;
  } catch (err) {
    showToast("Error loading privacy policy", "error");
    showNotFound();
  }
}

function showNotFound() {
  policyTitle.textContent = "Privacy Policy";
  policyBody.textContent = "No privacy policy is available for this project.";
}

function showToast(msg, type = "success") {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = "toast"; }, 3200);
}

loadPolicy();


