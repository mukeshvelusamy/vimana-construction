// /**
//  * companyperformance.js — Vimana Construction
//  * Firebase Firestore CRUD for Company Performance stats.
//  *
//  * Load order in HTML:
//  *   1. <script src="config.js"></script>                        ← non-module
//  *   2. <script type="module" src="firebase.js"></script>
//  *   3. <script type="module" src="companyperformance.js"></script>
//  *
//  * Firestore document shape (collection: "companyPerformance"):
//  *   {
//  *     projectsCompleted : number,   // e.g. 450
//  *     yearsOfExperience : number,   // e.g. 26
//  *     onTimeDelivery    : number,   // e.g. 99
//  *     referralClients   : number,   // e.g. 88
//  *     createdAt         : Timestamp
//  *   }
//  */

// import {
//   collection,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
//   onSnapshot,
//   query,
//   orderBy,
//   serverTimestamp
// } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// // ── Collection name helper ────────────────────────────────────────────────────
// function COL_NAME() {
//   return (window.APP_CONFIG && window.APP_CONFIG.collections.companyPerformance) || 'companyPerformance';
// }

// // ── Module state ──────────────────────────────────────────────────────────────
// let activeDocId      = null;
// let allPerfDocs      = [];
// let editingPerfDocId = null;

// // ── Default fallback values ───────────────────────────────────────────────────
// const DEFAULTS = {
//   projectsCompleted: 450,
//   yearsOfExperience: 26,
//   onTimeDelivery:    99,
//   referralClients:   88
// };

// // ── Wait for window.db ────────────────────────────────────────────────────────
// function waitForDb(cb, attempts = 0) {
//   if (window.db) { cb(); return; }
//   if (attempts > 50) { console.warn('[companyperformance.js] window.db unavailable.'); return; }
//   setTimeout(() => waitForDb(cb, attempts + 1), 100);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 1. REAL-TIME LISTENER
// // ─────────────────────────────────────────────────────────────────────────────
// function initCompanyPerformanceListener() {
//   const q = query(
//     collection(window.db, COL_NAME()),
//     orderBy('createdAt', 'desc')
//   );

//   onSnapshot(q, (snapshot) => {
//     allPerfDocs = [];
//     snapshot.forEach((d) => allPerfDocs.push({ id: d.id, ...d.data() }));

//     if (allPerfDocs.length > 0) {
//       activeDocId = allPerfDocs[0].id;
//       updateStatsUI(allPerfDocs[0]);
//     } else {
//       updateStatsUI(DEFAULTS);
//     }

//     renderAdminPerfList(allPerfDocs);
//   }, (error) => {
//     console.error('[companyperformance.js] onSnapshot error:', error);
//     updateStatsUI(DEFAULTS);
//   });
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 2. UI UPDATE — hero strip IDs + performance section cards
// // ─────────────────────────────────────────────────────────────────────────────
// function updateStatsUI(data) {
//   const stats = {
//     projectsCompleted: Number(data.projectsCompleted) || DEFAULTS.projectsCompleted,
//     yearsOfExperience: Number(data.yearsOfExperience) || DEFAULTS.yearsOfExperience,
//     onTimeDelivery:    Number(data.onTimeDelivery)    || DEFAULTS.onTimeDelivery,
//     referralClients:   Number(data.referralClients)   || DEFAULTS.referralClients
//   };

//   // a) Hero strip — only if IDs are present in HTML
//   const heroMap = {
//     'hero-stat-projects': { val: stats.projectsCompleted, suffix: '+' },
//     'hero-stat-years':    { val: stats.yearsOfExperience, suffix: ''  },
//     'hero-stat-ontime':   { val: stats.onTimeDelivery,    suffix: '%' },
//     'hero-stat-referral': { val: stats.referralClients,   suffix: '%' }
//   };
//   Object.entries(heroMap).forEach(([id, cfg]) => {
//     const el = document.getElementById(id);
//     if (el) animateCounter(el, cfg.val, cfg.suffix);
//   });

//   // b) Performance section cards (data-target attributes drive the existing HTML cards)
//   const perfCards = document.querySelectorAll('[data-perf]');
//   perfCards.forEach(card => {
//     const numEl = card.querySelector('[data-target]');
//     if (!numEl) return;

//     // Map card position to stat
//     const allCards = Array.from(document.querySelectorAll('[data-perf]'));
//     const idx = allCards.indexOf(card);
//     const map = [
//       { val: stats.projectsCompleted, suffix: '+' },
//       { val: stats.yearsOfExperience, suffix: ''  },
//       { val: stats.onTimeDelivery,    suffix: '%' },
//       { val: stats.referralClients,   suffix: '%' }
//     ];
//     if (map[idx]) {
//       numEl.dataset.target = map[idx].val;
//       numEl.dataset.suffix = map[idx].suffix;
//     }
//   });
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 3. ANIMATED COUNTER
// // ─────────────────────────────────────────────────────────────────────────────
// function animateCounter(el, target, suffix = '', duration = 1800) {
//   const start = performance.now();
//   function step(now) {
//     const elapsed  = now - start;
//     const progress = Math.min(elapsed / duration, 1);
//     const eased    = 1 - Math.pow(1 - progress, 3);
//     const current  = Math.round(eased * target);
//     el.textContent = current + suffix;
//     if (progress < 1) requestAnimationFrame(step);
//   }
//   requestAnimationFrame(step);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 4. INTERSECTIONOBSERVER — trigger card counters on scroll
// // ─────────────────────────────────────────────────────────────────────────────
// function observePerfCards() {
//   const cards = document.querySelectorAll('[data-perf]');
//   if (!cards.length) return;

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting && !entry.target.dataset.counted) {
//         entry.target.dataset.counted = '1';
//         entry.target.classList.add('in-view');
//         const numEl  = entry.target.querySelector('[data-target]');
//         if (numEl) {
//           const target = parseInt(numEl.dataset.target, 10) || 0;
//           const suffix = numEl.dataset.suffix || '';
//           animateCounter(numEl, target, suffix);
//         }
//       }
//     });
//   }, { threshold: 0.25 });

//   cards.forEach(card => observer.observe(card));
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 5. ADMIN — Render list
// // ─────────────────────────────────────────────────────────────────────────────
// function renderAdminPerfList(docs) {
//   const listEl = document.getElementById('adm-perf-list');
//   if (!listEl) return;

//   if (!docs || docs.length === 0) {
//     listEl.innerHTML = '<p style="color:#bbb;font-size:13px">No performance records yet. Add one above.</p>';
//     return;
//   }

//   listEl.innerHTML = docs.map((d, i) => `
//     <div class="a-item">
//       <div>
//         <div class="a-item-t">
//           ${i === 0 ? '🟢 LIVE — ' : ''}
//           ${d.projectsCompleted}+ projects · ${d.yearsOfExperience} yrs · ${d.onTimeDelivery}% on-time · ${d.referralClients}% referral
//         </div>
//         <div class="a-item-s">
//           ${d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'Saving…'}
//           ${i === 0 ? ' · Currently displayed on homepage' : ' · Archived'}
//         </div>
//       </div>
//       <div class="a-item-btns">
//         <button class="btn-edit" onclick="editCompanyPerformance('${d.id}')">Edit</button>
//         <button class="btn-del"  onclick="deleteCompanyPerformance('${d.id}')">Delete</button>
//       </div>
//     </div>`).join('');
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 6. ADMIN — Fill form for editing
// // ─────────────────────────────────────────────────────────────────────────────
// function fillAdminForm(data) {
//   const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
//   set('perf-projects', data.projectsCompleted);
//   set('perf-years',    data.yearsOfExperience);
//   set('perf-ontime',   data.onTimeDelivery);
//   set('perf-referral', data.referralClients);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 7. CRUD — Add / Update
// // ─────────────────────────────────────────────────────────────────────────────
// async function addCompanyPerformance() {
//   console.log('Attempting to add/update company performance... : ', window._isAdminLoggedIn); // Debug log
//   // Check if we are logged in
//   if (!window._isAdminLoggedIn) {
//     alert('Unauthorised: Please log in as admin first.');
//     return;
//   }else{
//     console.log('Admin is logged in, proceeding with add/update.'); // Debug log
//   }

//   // Get elements safely
//   const elProjects = document.getElementById('perf-projects');
//   const elYears = document.getElementById('perf-years');
//   const elOntime = document.getElementById('perf-ontime');
//   const elReferral = document.getElementById('perf-referral');

//   // If elements don't exist, the form wasn't injected correctly
//   if (!elProjects || !elYears || !elOntime || !elReferral) {
//     console.error("Form elements not found in DOM");
//     alert("System error: Form fields are missing. Please refresh.");
//     return;
//   }

//   const projects = parseInt(document.getElementById('perf-projects')?.value, 10);
//   const years    = parseInt(document.getElementById('perf-years')?.value,    10);
//   const ontime   = parseInt(document.getElementById('perf-ontime')?.value,   10);
//   const referral = parseInt(document.getElementById('perf-referral')?.value, 10);
// if (isNaN(projects) || isNaN(years) || isNaN(ontime) || isNaN(referral)) {
//     alert('Please fill in all four performance fields with valid numbers. 1st if check');
//     return;
//   }
//   if ([projects, years, ontime, referral].some(isNaN)) {
//     alert('Please fill in all four performance fields with valid numbers.');
//     return;
//   }
//   if (ontime < 0 || ontime > 100 || referral < 0 || referral > 100) {
//     alert('On-Time Delivery and Referral Clients must be between 0 and 100.');
//     return;
//   }

//   const payload = {
//     projectsCompleted: projects,
//     yearsOfExperience: years,
//     onTimeDelivery:    ontime,
//     referralClients:   referral,
//     createdAt:         serverTimestamp()
//   };

//   try {
//     if (editingPerfDocId) {
//       await updateDoc(doc(window.db, COL_NAME(), editingPerfDocId), payload);
//       editingPerfDocId = null;
//       const btn = document.getElementById('perf-submit-btn');
//       if (btn) btn.textContent = 'Save Performance Stats →';
//     } else {
//       await addDoc(collection(window.db, COL_NAME()), payload);
//     }
//     resetPerfForm();
//     if (typeof window.showOK === 'function') window.showOK('perf-ok');
//   } catch (e) {
//     console.error('[companyperformance.js] save error:', e);
//     alert('Failed to save. Check console for details.');
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 8. CRUD — Delete
// // ─────────────────────────────────────────────────────────────────────────────
// async function deleteCompanyPerformance(id) {
//   if (!window._isAdminLoggedIn) return;
//   const isLive = (id === activeDocId);
//   const msg = isLive
//     ? '⚠️ This is the LIVE record shown on the homepage. Deleting it will revert stats to defaults. Continue?'
//     : 'Delete this archived performance record?';
//   if (!confirm(msg)) return;

//   try {
//     await deleteDoc(doc(window.db, COL_NAME(), id));
//     if (id === editingPerfDocId) {
//       editingPerfDocId = null;
//       resetPerfForm();
//     }
//   } catch (e) {
//     console.error('[companyperformance.js] delete error:', e);
//     alert('Failed to delete. Check console for details.');
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 9. CRUD — Edit (populate form)
// // ─────────────────────────────────────────────────────────────────────────────
// function editCompanyPerformance(id) {
//   if (!window._isAdminLoggedIn) return;
//   const record = allPerfDocs.find(d => d.id === id);
//   if (!record) return;

//   editingPerfDocId = id;
//   fillAdminForm(record);

//   const btn = document.getElementById('perf-submit-btn');
//   if (btn) btn.textContent = 'Update Performance Stats ✓';

//   const formEl = document.getElementById('form-performance');
//   if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 10. Helper — Reset admin form
// // ─────────────────────────────────────────────────────────────────────────────
// function resetPerfForm() {
//   ['perf-projects', 'perf-years', 'perf-ontime', 'perf-referral'].forEach(id => {
//     const el = document.getElementById(id);
//     if (el) el.value = '';
//   });
//   editingPerfDocId = null;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 11. INJECT Admin Form HTML into #form-performance placeholder
// // ─────────────────────────────────────────────────────────────────────────────
// function injectAdminFormHTML() {
//   const target = document.getElementById('form-performance');
//   if (!target || target.dataset.injected) return;
//   target.dataset.injected = 'true';

//   target.innerHTML = `
//     <div class="a-stitle">📊 Company Performance Stats</div>
//     <div class="a-ssub">These numbers appear in the homepage Performance section. The most recently saved record is shown live.</div>
//     <div id="perf-ok" class="a-ok">✓ Performance stats updated and live!</div>

//     <div class="af-row">
//       <div class="af-group">
//         <label>Projects Completed</label>
//         <input type="number" id="perf-projects" placeholder="e.g. 450" min="0">
//         <div style="font-size:11px;color:#aaa;margin-top:3px;font-style:italic">Displayed as "450+"</div>
//       </div>
//       <div class="af-group">
//         <label>Years of Experience</label>
//         <input type="number" id="perf-years" placeholder="e.g. 26" min="0">
//         <div style="font-size:11px;color:#aaa;margin-top:3px;font-style:italic">Plain number</div>
//       </div>
//     </div>

//     <div class="af-row">
//       <div class="af-group">
//         <label>On-Time Delivery (%)</label>
//         <input type="number" id="perf-ontime" placeholder="e.g. 99" min="0" max="100">
//         <div style="font-size:11px;color:#aaa;margin-top:3px;font-style:italic">Displayed as "99%"</div>
//       </div>
//       <div class="af-group">
//         <label>Referral / Repeat Clients (%)</label>
//         <input type="number" id="perf-referral" placeholder="e.g. 88" min="0" max="100">
//         <div style="font-size:11px;color:#aaa;margin-top:3px;font-style:italic">Displayed as "88%"</div>
//       </div>
//     </div>

//     <button class="a-submit" id="perf-submit-btn" onclick="addCompanyPerformance()">
//       Save Performance Stats →
//     </button>

//     <hr class="adm-divider">
//     <div class="list-hd">Saved Records (latest = live on site)</div>
//     <div class="a-list" id="adm-perf-list"></div>
//   `;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // 12. EXPOSE GLOBALLY & BOOT
// // ─────────────────────────────────────────────────────────────────────────────
// window.addCompanyPerformance    = addCompanyPerformance;
// window.deleteCompanyPerformance = deleteCompanyPerformance;
// window.editCompanyPerformance   = editCompanyPerformance;

// function boot() {
//   injectAdminFormHTML();
//   observePerfCards();
//   waitForDb(initCompanyPerformanceListener);
// }

// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', boot);
// } else {
//   boot();
// }


import {
  collection,
  setDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

function COL_NAME() {
  return (window.APP_CONFIG && window.APP_CONFIG.collections.companyPerformance) || 'companyPerformance';
}

// Fixed ID ensures we only ever have ONE record
const SINGLE_DOC_ID = "current_stats"; 

const DEFAULTS = {
  projectsCompleted: 450,
  yearsOfExperience: 26,
  onTimeDelivery:    99,
  referralClients:   88
};

function waitForDb(cb, attempts = 0) {
  if (window.db) { cb(); return; }
  if (attempts > 50) return;
  setTimeout(() => waitForDb(cb, attempts + 1), 100);
}

// ─── 1. DYNAMIC LISTENER (Updates UI in real-time) ───
function initCompanyPerformanceListener() {
  // Listen directly to the single document
  const docRef = doc(window.db, COL_NAME(), SINGLE_DOC_ID);

  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      updateStatsUI(data);
      fillAdminForm(data); // Auto-fill admin form with latest numbers
    } else {
      // If no record exists yet, show defaults
      updateStatsUI(DEFAULTS);
    }
  }, (error) => {
    console.error('[companyperformance.js] Permission error:', error);
    updateStatsUI(DEFAULTS);
  });
}

// ─── 2. UI UPDATE (Hero Stats & Performance Cards) ───
function updateStatsUI(data) {
  const stats = {
    projectsCompleted: Number(data.projectsCompleted) || DEFAULTS.projectsCompleted,
    yearsOfExperience: Number(data.yearsOfExperience) || DEFAULTS.yearsOfExperience,
    onTimeDelivery:    Number(data.onTimeDelivery)    || DEFAULTS.onTimeDelivery,
    referralClients:   Number(data.referralClients)   || DEFAULTS.referralClients
  };

  // Update Hero Section (Image_63aec1.png)
  const heroMap = {
    'hero-stat-projects': { val: stats.projectsCompleted, suffix: '+' },
    'hero-stat-years':    { val: stats.yearsOfExperience, suffix: ''  },
    'hero-stat-ontime':   { val: stats.onTimeDelivery,    suffix: '%' },
    'hero-stat-referral': { val: stats.referralClients,   suffix: '%' }
  };
  
  Object.entries(heroMap).forEach(([id, cfg]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = cfg.val + cfg.suffix;
  });

  // Update Performance Cards (Image_63aee7.png)
  const perfCards = document.querySelectorAll('[data-perf]');
  const map = [
    { val: stats.projectsCompleted, suffix: '+' },
    { val: stats.yearsOfExperience, suffix: ''  },
    { val: stats.onTimeDelivery,    suffix: '%' },
    { val: stats.referralClients,   suffix: '%' }
  ];

  perfCards.forEach((card, idx) => {
    const numEl = card.querySelector('.perf-num');
    if (numEl && map[idx]) {
      numEl.textContent = map[idx].val + map[idx].suffix;
      // Trigger bar animation
      const bar = card.querySelector('.perf-bar-fill');
      if (bar) bar.style.width = map[idx].val + '%';
    }
  });
}

// ─── 3. SINGLE-SAVE ACTION (Updates existing record) ───
async function addCompanyPerformance() {
  if (!window._isAdminLoggedIn) {
    alert('Unauthorised: Please log in.');
    return;
  }

  const payload = {
    projectsCompleted: parseInt(document.getElementById('perf-projects').value, 10),
    yearsOfExperience: parseInt(document.getElementById('perf-years').value, 10),
    onTimeDelivery:    parseInt(document.getElementById('perf-ontime').value, 10),
    referralClients:   parseInt(document.getElementById('perf-referral').value, 10),
    updatedAt:         serverTimestamp()
  };

  if (Object.values(payload).some(val => typeof val === 'number' && isNaN(val))) {
    alert('Please enter valid numbers in all fields.');
    return;
  }

  try {
    const btn = document.getElementById('perf-submit-btn');
    btn.textContent = "Updating...";
    
    // setDoc with merge: true updates the record if it exists, creates if it doesn't
    await setDoc(doc(window.db, COL_NAME(), SINGLE_DOC_ID), payload, { merge: true });
    
    btn.textContent = "Save Performance Stats →";
    if (typeof window.showOK === 'function') window.showOK('perf-ok');
  } catch (e) {
    console.error('Save error:', e);
    alert('Missing Permissions. Ensure your Firestore Rules are published.');
  }
}

// ─── 4. ADMIN UI INJECTION ───
function injectAdminFormHTML() {
  const target = document.getElementById('form-performance');
  if (!target || target.dataset.injected) return;
  target.dataset.injected = 'true';

  target.innerHTML = `
    <div class="a-stitle">📊 Update Company Stats</div>
    <div class="a-ssub">Edit the numbers below. Changes will update instantly across the entire website.</div>
    <div id="perf-ok" class="a-ok">✓ Numbers updated successfully!</div>

    <div class="af-row">
      <div class="af-group"><label>Projects Completed</label><input type="number" id="perf-projects"></div>
      <div class="af-group"><label>Years of Experience</label><input type="number" id="perf-years"></div>
    </div>
    <div class="af-row">
      <div class="af-group"><label>On-Time Delivery (%)</label><input type="number" id="perf-ontime"></div>
      <div class="af-group"><label>Referral Clients (%)</label><input type="number" id="perf-referral"></div>
    </div>

    <button class="a-submit" id="perf-submit-btn" onclick="addCompanyPerformance()">
      Update Live Stats →
    </button>
  `;
}

function fillAdminForm(data) {
  if(document.getElementById('perf-projects')) {
    document.getElementById('perf-projects').value = data.projectsCompleted || '';
    document.getElementById('perf-years').value = data.yearsOfExperience || '';
    document.getElementById('perf-ontime').value = data.onTimeDelivery || '';
    document.getElementById('perf-referral').value = data.referralClients || '';
  }
}

window.addCompanyPerformance = addCompanyPerformance;

function boot() {
  injectAdminFormHTML();
  waitForDb(initCompanyPerformanceListener);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}