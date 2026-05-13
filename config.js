// /**
//  * config.js — Vimana Construction
//  * Centralized configuration for Firebase and app constants.
//  * Import this file in all pages before firebase.js.
//  * 
//  * SECURITY NOTE: For production, move sensitive keys to a backend proxy or 
//  * use Firebase App Check. Never commit real secrets to version control.
//  */

// window.APP_CONFIG = {
//   // ── Firebase ──
//   firebase: {
//     apiKey:            "AIzaSyBLK2UbEdzPa7rpiGf6A0AJO6S7jvUqDxk",
//     authDomain:        "vimana-construction-e6a4a.firebaseapp.com",
//     projectId:         "vimana-construction-e6a4a",
//     storageBucket:     "vimana-construction-e6a4a.firebasestorage.app",
//     messagingSenderId: "1058890052113",
//     appId:             "1:1058890052113:web:8e02824eee430b52d2f7b0"
//   },

//   // ── Firestore Collection Names ──
//   collections: {
//     reviews:            "reviews",
//     gallery:            "gallery",
//     companyPerformance: "companyPerformance"
//   },

//   // ── Gallery Settings ──
//   gallery: {
//     homepageMaxItems: 15,
//     fullPageUrl:      "gallery.html"
//   },

//   // ── App Meta ──
//   app: {
//     name:    "Vimana Construction",
//     year:    new Date().getFullYear(),
//     email:   "raswanth@vimanaconstruction.com",
//     phone:   "+91 98765 43210",
//     address: "Bengaluru, Karnataka, India"
//   }
// };

/**
 * config.js — Vimana Construction
 * Centralized configuration for Firebase and app constants.
 * Load this FIRST as a regular (non-module) script so window.APP_CONFIG
 * is available synchronously before any ES-module scripts run.
 *
 *   <script src="config.js"></script>           ← 1st, non-module
 *   <script type="module" src="firebase.js"></script>   ← 2nd
 *   <script type="module" src="review.js"></script>     ← 3rd
 */

window.APP_CONFIG = {
  // ── Firebase ──────────────────────────────────────────────────────────────
  firebase: {
    apiKey:            "AIzaSyBLK2UbEdzPa7rpiGf6A0AJO6S7jvUqDxk",
    authDomain:        "vimana-construction-e6a4a.firebaseapp.com",
    projectId:         "vimana-construction-e6a4a",
    storageBucket:     "vimana-construction-e6a4a.firebasestorage.app",
    messagingSenderId: "1058890052113",
    appId:             "1:1058890052113:web:8e02824eee430b52d2f7b0"
  },

  // ── Firestore Collection Names ─────────────────────────────────────────────
  collections: {
    reviews:            "reviews",
    gallery:            "gallery",
    companyPerformance: "companyPerformance"
  },

  // ── Gallery Settings ───────────────────────────────────────────────────────
  gallery: {
    homepageMaxItems: 15,
    fullPageUrl:      "gallery.html"
  },

  // ── App Meta ───────────────────────────────────────────────────────────────
  app: {
    name:    "Vimana Construction",
    year:    new Date().getFullYear(),
    email:   "raswanth@vimanaconstruction.com",
    phone:   "+91 98765 43210",
    address: "Bengaluru, Karnataka, India"
  },

  // ── Admin (SHA-256 hashes only — never plain-text) ─────────────────────────
  // sha256('raswanthbalu') = d63e9b023ff69c351e33a22a5ddd473dd071a89f8b71162581555205aeef4854
  // sha256('ulabraswanth') = f996dbabdac5b948927b501c4b77c5a637b74d565bdb446d98cd57fad49703b9
  adminHash: Object.freeze({
    u: 'd63e9b023ff69c351e33a22a5ddd473dd071a89f8b71162581555205aeef4854',
    p: 'f996dbabdac5b948927b501c4b77c5a637b74d565bdb446d98cd57fad49703b9'
  })
};