// ============================================
//  firebase.js — Dalki Firebase + Cloudinary
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, getDoc, doc,
  addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── FIREBASE CONFIG ───────────────────────────
// TODO: Replace with your Dalki Firebase project config
// Go to console.firebase.google.com → dalki1 → Project Settings → Your apps → Add web app
const firebaseConfig = {
  apiKey:            "AIzaSyBynM6OVmdvXJJnewJDSAj6ADO8VJmcSFs",
  authDomain:        "dalki1.firebaseapp.com",
  projectId:         "dalki1",
  storageBucket:     "dalki1.firebasestorage.app",
  messagingSenderId: "613716328809",
  appId:             "1:613716328809:web:2bcdf41404ae335892fdf8",
};

// ── CLOUDINARY CONFIG ─────────────────────────
// TODO: Replace with your Cloudinary details
// Go to cloudinary.com → Settings → Upload presets → create unsigned preset
const CLOUDINARY_CLOUD  = "djiuuswny";
const CLOUDINARY_PRESET = "dalki_portfolio";
const CLOUDINARY_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

// ── INIT ──────────────────────────────────────
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── PROJECTS ──────────────────────────────────
export async function getProjects() {
  const q    = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProject(id) {
  const snap = await getDoc(doc(db, "projects", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addProject(data) {
  const ref = await addDoc(collection(db, "projects"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProject(id, data) {
  await updateDoc(doc(db, "projects", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(id) {
  await deleteDoc(doc(db, "projects", id));
}

// ── IMAGE UPLOAD (Cloudinary) ─────────────────
export function uploadImage(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    fd.append("folder", "dalki");

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.secure_url, cloudinaryId: data.public_id });
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.open("POST", CLOUDINARY_URL);
    xhr.send(fd);
  });
}

// ── AUTH ──────────────────────────────────────
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function logout() {
  return signOut(auth);
}
export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

export { db, auth };


