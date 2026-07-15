// ── firebase.js — Dalki Hub ──────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── CONFIG ────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBynM6OVmdvXJJnewJDSAj6ADO8VJmcSFs",
  authDomain:        "dalki1.firebaseapp.com",
  projectId:         "dalki1",
  storageBucket:     "dalki1.firebasestorage.app",
  messagingSenderId: "613716328809",
  appId:             "1:613716328809:web:2bcdf41404ae335892fdf8",
};

// ── Cloudinary ────────────────────────────────
const CLOUDINARY_CLOUD  = "djiuuswny";
const CLOUDINARY_PRESET = "dalki_portfolio";
const CLOUDINARY_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── ITEMS (Firestore collection: "items") ─────
export async function getItems() {
  const q    = query(collection(db, "items"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addItem(data) {
  return addDoc(collection(db, "items"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateItem(id, data) {
  return updateDoc(doc(db, "items", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteItem(id) {
  return deleteDoc(doc(db, "items", id));
}

// ── IMAGE UPLOAD ──────────────────────────────
export function uploadImage(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    fd.append("folder", "dalki-hub");
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

// ── AUTH ──────────────────────────────────────
export const login  = (e, p) => signInWithEmailAndPassword(auth, e, p);
export const logout = ()     => signOut(auth);
export const onAuthChange = cb => onAuthStateChanged(auth, cb);
export { db, auth };
