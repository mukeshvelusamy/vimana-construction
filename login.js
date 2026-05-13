// /**
//  * login.js — Vimana Construction
//  * Firebase Auth sign-in. Relies on firebase.js for app/auth/db.
//  */

// import { auth } from "./firebase.js";
// import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// async function doLogin() {
//   const now    = Date.now();
//   const errEl  = document.getElementById('login-err');
//   const lockEl = document.getElementById('login-lock');
//   const btn    = document.getElementById('login-btn');

//   if (now < (window.lockUntil || 0)) {
//     lockEl.style.display = 'block';
//     return;
//   }

//   const email    = document.getElementById('login-user').value.trim();
//   const password = document.getElementById('login-pass').value;

//   if (!email || !password) {
//     errEl.textContent    = 'Please enter both email and password.';
//     errEl.style.display  = 'block';
//     return;
//   }

//   btn.textContent = 'Verifying…';
//   btn.disabled    = true;

//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     if (user) {
//       window.failCount = 0;
//       errEl.style.display  = 'none';
//       lockEl.style.display = 'none';
//       btn.textContent      = 'Sign In →';
//       btn.disabled         = false;
//       if (window.closeLogin)   window.closeLogin();
//       if (window.showActions)  window.showActions();
//     }
//   } catch (err) {
//     btn.textContent = 'Sign In →';
//     btn.disabled    = false;

//     window.failCount = (window.failCount || 0) + 1;
//     document.getElementById('login-pass').value = '';

//     if (window.failCount >= 5) {
//       window.lockUntil = Date.now() + 60000;
//       errEl.style.display  = 'none';
//       lockEl.style.display = 'block';

//       if (window.lockInterval) clearInterval(window.lockInterval);
//       window.lockInterval = setInterval(() => {
//         const rem = Math.ceil((window.lockUntil - Date.now()) / 1000);
//         document.getElementById('lock-timer').textContent = rem > 0 ? rem : 0;
//         if (Date.now() >= window.lockUntil) {
//           clearInterval(window.lockInterval);
//           lockEl.style.display = 'none';
//           window.failCount = 0;
//         }
//       }, 1000);
//     } else {
//       const left = 5 - window.failCount;
//       document.getElementById('attempts-left').textContent =
//         `${left} attempt${left !== 1 ? 's' : ''} remaining before lockout.`;
//       errEl.style.display = 'block';
//     }
//   }
// }

// window.doLogin = doLogin;

/**
 * login.js — Vimana Construction
 * Firebase Auth sign-in with brute-force lockout.
 *
 * Relies on firebase.js for shared auth export.
 * Uses sha-256 hash comparison for admin credential verification
 * (same as the inline script in index.html).
 */

import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// ── Lockout state (shared with window so inline scripts see the same values) ─
window.failCount  = window.failCount  || 0;
window.lockUntil  = window.lockUntil  || 0;
window.lockInterval = window.lockInterval || null;

// ── Helper: get element safely ────────────────────────────────────────────────
function el(id) { return document.getElementById(id); }

// ── Admin hash check (mirrors index.html inline AUTH object) ─────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Core login handler ────────────────────────────────────────────────────────
async function doLogin() {
  const now    = Date.now();
  const errEl  = el('login-err');
  const lockEl = el('login-lock');
  const btn    = el('login-btn');

  // Lockout guard
  if (now < window.lockUntil) {
    if (lockEl) lockEl.style.display = 'block';
    return;
  }

  const email    = el('login-user')  ? el('login-user').value.trim() : '';
  const password = el('login-pass')  ? el('login-pass').value        : '';

  if (!email || !password) {
    if (errEl) {
      errEl.textContent   = 'Please enter both email and password.';
      errEl.style.display = 'block';
    }
    return;
  }

  if (btn) { btn.textContent = 'Verifying…'; btn.disabled = true; }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user           = userCredential.user;

    // if (user) {
    //   console.log('[login.js] Login successful for user:', user.email);
    //   alert('Login successful!'); // Optional: replace with nicer UI feedback
    //   window.failCount = 0;
    //   if (errEl)  errEl.style.display  = 'none';
    //   if (lockEl) lockEl.style.display = 'none';
    //   if (btn)  { btn.textContent = 'Sign In →'; btn.disabled = false; }

    //   // Trigger UI transitions defined in index.html
    //   if (typeof window.closeLogin   === 'function') window.closeLogin();
    //   if (typeof window.showActions  === 'function') window.showActions();
    // }
    if (user) {
      console.log('[login.js] Login successful:', user.email);
      
      // CRITICAL FIX: Set the global admin flag to true
      window._isAdminLoggedIn = true; 
      console.log('[login.js] Admin login state set to true : ', window._isAdminLoggedIn);
      
      window.failCount = 0;
      if (errEl)  errEl.style.display  = 'none';
      if (lockEl) lockEl.style.display = 'none';
      if (btn)  { btn.textContent = 'Sign In →'; btn.disabled = false; }

      // Trigger UI transitions in index.html
      if (typeof window.closeLogin === 'function') window.closeLogin();
      if (typeof window.showActions === 'function') window.showActions();
    }
  } catch (err) {
    console.warn('[login.js] Firebase auth error:', err.code, err.message);
    alert('Login failed: ' + (err.message || 'Unknown error')); // Optional: replace with nicer UI feedback
    console.warn('[login.js] Firebase auth error:', err.code);
    if (btn) { btn.textContent = 'Sign In →'; btn.disabled = false; }
    if (el('login-pass')) el('login-pass').value = '';

    window.failCount = (window.failCount || 0) + 1;

    if (window.failCount >= 5) {
      window.lockUntil = Date.now() + 60000;
      if (errEl)  errEl.style.display  = 'none';
      if (lockEl) lockEl.style.display = 'block';

      if (window.lockInterval) clearInterval(window.lockInterval);
      window.lockInterval = setInterval(() => {
        const rem     = Math.ceil((window.lockUntil - Date.now()) / 1000);
        const timerEl = el('lock-timer');
        if (timerEl) timerEl.textContent = rem > 0 ? rem : 0;
        if (Date.now() >= window.lockUntil) {
          clearInterval(window.lockInterval);
          if (lockEl) lockEl.style.display = 'none';
          window.failCount = 0;
        }
      }, 1000);
    } else {
      const left         = 5 - window.failCount;
      const attemptsEl   = el('attempts-left');
      if (attemptsEl) {
        attemptsEl.textContent = `${left} attempt${left !== 1 ? 's' : ''} remaining before lockout.`;
      }
      if (errEl) errEl.style.display = 'block';
    }
  }
}

// ── Expose globally (index.html inline onclick="doLogin()" uses this) ─────────
window.doLogin = doLogin;

// ── Event listener binding (DOMContentLoaded-safe) ───────────────────────────
// document.addEventListener('DOMContentLoaded', () => {
//   const loginBtn  = el('login-btn');
//   const passInput = el('login-pass');

//   if (loginBtn) {
//     loginBtn.addEventListener('click', (e) => { e.preventDefault(); doLogin(); });
//   }
//   if (passInput) {
//     passInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') doLogin(); });
//   }
// });