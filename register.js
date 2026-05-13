/**
 * register.js — Vimana Construction
 * Firebase Auth sign-up (admin account creation).
 * Relies on firebase.js for shared auth export.
 */

import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

async function doSignup() {
  const now    = Date.now();
  const errEl  = document.getElementById('login-err');
  const lockEl = document.getElementById('login-lock');
  const btn    = document.getElementById('login-btn');

  if (now < (window.lockUntil || 0)) {
    if (lockEl) lockEl.style.display = 'block';
    return;
  }

  const email    = document.getElementById('login-user') ? document.getElementById('login-user').value.trim() : '';
  const password = document.getElementById('login-pass') ? document.getElementById('login-pass').value        : '';

  if (!email || !password) {
    if (errEl) {
      errEl.textContent   = 'Please enter both email and password.';
      errEl.style.display = 'block';
    }
    return;
  }

  if (btn) { btn.textContent = 'Creating account…'; btn.disabled = true; }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user           = userCredential.user;

    if (user) {
      window.failCount = 0;
      if (errEl)  errEl.style.display  = 'none';
      if (lockEl) lockEl.style.display = 'none';
      if (btn)  { btn.textContent = 'Sign Up →'; btn.disabled = false; }

      if (typeof window.closeLogin  === 'function') window.closeLogin();
      if (typeof window.showActions === 'function') window.showActions();
    }
  } catch (err) {
    if (btn) { btn.textContent = 'Sign Up →'; btn.disabled = false; }
    if (errEl) {
      errEl.textContent   = err.message || 'Registration failed. Please try again.';
      errEl.style.display = 'block';
    }
  }
}

window.doSignup = doSignup;