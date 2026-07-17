// ============================================
//  firebase.js — Dalki Platform
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, where, serverTimestamp,
  getDoc, limit, increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBynM6OVmdvXJJnewJDSAj6ADO8VJmcSFs",
  authDomain:        "dalki1.firebaseapp.com",
  projectId:         "dalki1",
  storageBucket:     "dalki1.firebasestorage.app",
  messagingSenderId: "613716328809",
  appId:             "1:613716328809:web:2bcdf41404ae335892fdf8",
};

const CLOUDINARY_CLOUD  = "djiuuswny";
const CLOUDINARY_PRESET = "dalki_portfolio";
const CLOUDINARY_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── PROJECTS ─────────────────────────────────

export async function getProjects(filters = {}) {
  let q = query(collection(db, "projects"), orderBy("createdAt", "desc"));

  if (filters.category) {
    q = query(q, where("category", "==", filters.category));
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProjectBySlug(slug) {
  const q = query(collection(db, "projects"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getProjectById(id) {
  const snap = await getDoc(doc(db, "projects", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addProject(data) {
  return addDoc(collection(db, "projects"), {
    ...data,
    downloads: 0,
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProject(id, data) {
  return updateDoc(doc(db, "projects", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProject(id) {
  return deleteDoc(doc(db, "projects", id));
}

export async function incrementDownloads(id) {
  return updateDoc(doc(db, "projects", id), { downloads: increment(1) });
}

export async function incrementViews(id) {
  return updateDoc(doc(db, "projects", id), { views: increment(1) });
}

// ── COMMENTS ─────────────────────────────────

export async function getComments(projectId) {
  const q = query(
    collection(db, "projects", projectId, "comments"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addComment(projectId, data) {
  return addDoc(collection(db, "projects", projectId, "comments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// ── AUTH ─────────────────────────────────────

export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

export function getCurrentUser() {
  return auth.currentUser;
}

// ── UPLOAD ───────────────────────────────────

export function uploadImage(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    fd.append("folder", "dalki-projects");
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const d = JSON.parse(xhr.responseText);
        resolve({ url: d.secure_url, cloudinaryId: d.public_id });
      } else {
        reject(new Error("Upload failed: " + xhr.status));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.open("POST", CLOUDINARY_URL);
    xhr.send(fd);
  });
}

export { db, auth };
