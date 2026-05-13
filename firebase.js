// /**
//  * firebase.js — Vimana Construction
//  * Shared Firebase app initialization.
//  * Reads config from window.APP_CONFIG (set by config.js).
//  * 
//  * Load order in HTML:
//  *   1. <script src="config.js"></script>          (non-module, sets window.APP_CONFIG)
//  *   2. <script type="module" src="firebase.js"></script>
//  *   3. <script type="module" src="login.js"></script>  (etc.)
//  */

// import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
// import { getAuth }                from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
// import { getFirestore }           from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// // Guard against double-init (e.g. if multiple modules import this)
// const app = getApps().length ? getApps()[0] : initializeApp(window.APP_CONFIG.firebase);

// export const auth = getAuth(app);
// export const db   = getFirestore(app);

// // Also expose globally so non-module scripts can access them
// window.auth = auth;
// window.db   = db;

/**
 * firebase.js — Vimana Construction
 * Shared Firebase app + Auth + Firestore initialisation.
 *
 * Requires config.js to have already run (sets window.APP_CONFIG).
 *
 * Load order in HTML:
 *   1. <script src="config.js"></script>                         ← non-module
 *   2. <script type="module" src="firebase.js"></script>
 *   3. <script type="module" src="review.js"></script>           ← etc.
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth }                 from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore }            from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Guard: window.APP_CONFIG must exist before we try to read it
if (!window.APP_CONFIG || !window.APP_CONFIG.firebase) {
  console.error(
    '[firebase.js] window.APP_CONFIG.firebase is undefined. ' +
    'Make sure <script src="config.js"></script> is loaded BEFORE firebase.js.'
  );
}

const firebaseConfig = window.APP_CONFIG.firebase;

// Guard against double-init when multiple modules import this file
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

// Expose globally so non-module inline scripts can reach them
window.auth = auth;
window.db   = db;