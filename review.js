/**
 * review.js — Vimana Construction
 * Firebase Firestore CRUD for client reviews + public slider rendering.
 *
 * Requires: config.js → firebase.js loaded first.
 * window.db is set by firebase.js.
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// ── Collection name helper (reads from config, with fallback) ─────────────────
function COL() {
  return (window.APP_CONFIG && window.APP_CONFIG.collections.reviews) || 'reviews';
}

// ── Module state ───────────────────────────────────────────────────────────────
let editingDocId = null;
let currentIdx   = 0;

// ── Wait for window.db to be available then start listener ────────────────────
function waitForDb(cb, attempts = 0) {
  if (window.db) { cb(); return; }
  if (attempts > 50) { console.warn('[review.js] window.db never became available.'); return; }
  setTimeout(() => waitForDb(cb, attempts + 1), 100);
}

// ─── 1. REAL-TIME LISTENER ────────────────────────────────────────────────────
function initReviewListener() {
  const q = query(collection(window.db, COL()), orderBy('createdAt', 'desc'));

  onSnapshot(q, (snapshot) => {
    const firebaseReviews = [];
    snapshot.forEach((d) => firebaseReviews.push({ id: d.id, ...d.data() }));

    window.reviews = firebaseReviews;
    renderAdminReviews(firebaseReviews);

    currentIdx = 0;
    renderReviews();
  }, (error) => {
    console.error('[review.js] onSnapshot error:', error);
  });
}

// ─── 2. PUBLIC SLIDER RENDER ──────────────────────────────────────────────────
function renderReviews() {
  const track = document.getElementById('rv-track');
  if (!track) return;

  const data = window.reviews || [];

  if (data.length === 0) {
    track.innerHTML = '<div style="color:#555;padding:20px;font-size:14px">No reviews yet.</div>';
    return;
  }

  track.innerHTML = data.map(r => `
    <div class="review-card">
      <div class="rv-stars">${'★'.repeat(r.stars || 5)}${'☆'.repeat(5 - (r.stars || 5))}</div>
      <p class="rv-text">"${r.text}"</p>
      <div class="rv-author">
        <div class="rv-avatar">
          ${r.img
            ? `<img src="${r.img}" alt="${r.name}" loading="lazy">`
            : `<div class="rv-initials">${(r.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>`}
        </div>
        <div>
          <div class="rv-name">${r.name}</div>
          <div class="rv-role">${r.role || 'Client'}</div>
        </div>
      </div>
    </div>`).join('');

  currentIdx = 0;
  updateSliderPos();
}

// ─── 3. SLIDER NAV ────────────────────────────────────────────────────────────
window.slideNext = function(key) {
  // Support both the review slider and generic key-based calls
  if (!key || key === 'rv') {
    const total = (window.reviews || []).length;
    if (currentIdx < total - 4) { currentIdx++; updateSliderPos(); }
  }
};

window.slidePrev = function(key) {
  if (!key || key === 'rv') {
    if (currentIdx > 0) { currentIdx--; updateSliderPos(); }
  }
};

function updateSliderPos() {
  const track = document.getElementById('rv-track');
  if (!track) return;
  track.style.transform = `translateX(-${currentIdx * 25}%)`;
}

// ─── 4. CRUD — Save (Add or Update) ──────────────────────────────────────────
async function saveReview() {
  // Only allow if authenticated as admin
  if (!window._isAdminLoggedIn) {
    alert('Unauthorised: Please log in as admin first.');
    return;
  }

  const nameEl  = document.getElementById('r-name');
  const roleEl  = document.getElementById('r-role');
  const textEl  = document.getElementById('r-text');
  const name    = nameEl  ? nameEl.value.trim()  : '';
  const role    = roleEl  ? roleEl.value.trim()  : '';
  const text    = textEl  ? textEl.value.trim()  : '';
  const stars   = window.rvStars || 5;

  if (!name || !text) {
    alert('Please fill in client name and review text.');
    return;
  }

  try {
    if (editingDocId) {
      await updateDoc(doc(window.db, COL(), editingDocId), { name, role: role || 'Client', text, stars });
      editingDocId = null;
      const btn = document.querySelector('.a-submit');
      if (btn) btn.textContent = 'Add Review →';
    } else {
      await addDoc(collection(window.db, COL()), {
        name,
        role:      role || 'Client',
        text,
        stars,
        createdAt: serverTimestamp()
      });
    }
    resetForm();
  } catch (e) {
    console.error('[review.js] saveReview error:', e);
    alert('Failed to save review. Check console for details.');
  }
}

// ─── 5. CRUD — Edit ──────────────────────────────────────────────────────────
function editReview(id) {
  if (!window._isAdminLoggedIn) return;
  const r = (window.reviews || []).find(item => item.id === id);
  if (!r) return;

  editingDocId = id;

  const nameEl = document.getElementById('r-name');
  const roleEl = document.getElementById('r-role');
  const textEl = document.getElementById('r-text');
  if (nameEl) nameEl.value = r.name;
  if (roleEl) roleEl.value = r.role;
  if (textEl) textEl.value = r.text;
  if (typeof window.setStars === 'function') window.setStars(r.stars || 5);

  const btn = document.querySelector('.a-submit');
  if (btn) btn.textContent = 'Update Review ✓';

  const formEl = document.getElementById('form-reviews');
  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
}

// ─── 6. CRUD — Delete ─────────────────────────────────────────────────────────
async function deleteReview(id) {
  if (!window._isAdminLoggedIn) return;
  if (!confirm('Permanently delete this review?')) return;
  try {
    await deleteDoc(doc(window.db, COL(), id));
  } catch (e) {
    console.error('[review.js] deleteReview error:', e);
    alert('Failed to delete review.');
  }
}

// ─── 7. Admin list render ─────────────────────────────────────────────────────
function renderAdminReviews(list) {
  const listEl = document.getElementById('adm-rv-list');
  if (!listEl) return;

  if (!list || list.length === 0) {
    listEl.innerHTML = '<p style="color:#bbb;font-size:13px">No reviews yet.</p>';
    return;
  }

  listEl.innerHTML = list.map(r => `
    <div class="a-item">
      <div>
        <div class="a-item-t">${r.name} — ${'★'.repeat(r.stars || 5)}</div>
        <div class="a-item-s">${r.role || 'Client'} · "${(r.text || '').slice(0, 50)}..."</div>
      </div>
      <div class="a-item-btns">
        <button class="btn-edit" onclick="editReview('${r.id}')">Edit</button>
        <button class="btn-del"  onclick="deleteReview('${r.id}')">Delete</button>
      </div>
    </div>`).join('');
}

// ─── 8. Reset form ────────────────────────────────────────────────────────────
function resetForm() {
  const nameEl = document.getElementById('r-name');
  const roleEl = document.getElementById('r-role');
  const textEl = document.getElementById('r-text');
  if (nameEl) nameEl.value = '';
  if (roleEl) roleEl.value = '';
  if (textEl) textEl.value = '';
  if (typeof window.setStars === 'function') window.setStars(5);
  if (typeof window.showOK   === 'function') window.showOK('rv-ok');
}

// ── Expose to window ──────────────────────────────────────────────────────────
window.addReview     = saveReview;
window.updateReview  = saveReview;
window.deleteReview  = deleteReview;
window.editReview    = editReview;
window.renderReviews = renderReviews;

// ── Boot ──────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => waitForDb(initReviewListener));
} else {
  waitForDb(initReviewListener);
}