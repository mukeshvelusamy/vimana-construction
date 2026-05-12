// import { 
//     collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp 
// } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import {     collection,    addDoc,    getDocs,    updateDoc,    deleteDoc,    doc,    onSnapshot,    query,    orderBy,    serverTimestamp} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// --- 1. LISTENER (READ) ---
// This runs automatically whenever data changes in Firebase
// export function initReviewListener() {
//     const q = query(collection(window.db, "reviews"), orderBy("createdAt", "desc"));
    
//     onSnapshot(q, (snapshot) => {
//         const reviews = [];
//         snapshot.forEach((doc) => {
//             reviews.push({ id: doc.id, ...doc.data() });
//         });
//         renderAdminReviews(reviews);
//     });
// }

// --- 1. LISTENER (READ) --- after review issue
export function initReviewListener() {
    const q = query(collection(window.db, "reviews"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        const firebaseReviews = [];
        snapshot.forEach((doc) => {
            firebaseReviews.push({ id: doc.id, ...doc.data() });
        });

        // Update the global "reviews" variable so your slider functions can see it
        window.reviews = firebaseReviews;

        // Trigger both UI renders
        renderAdminReviews(firebaseReviews); 
        if (window.renderReviews) window.renderReviews(); 
    });
}

// --- 2. ADD REVIEW ---
async function addReview() {
    const name = document.getElementById('r-name').value.trim();
    const role = document.getElementById('r-role').value.trim();
    const text = document.getElementById('r-text').value.trim();
    const stars = window.rvStars || 5; // Get current star count

    if (!name || !text) {
        alert('Please enter client name and review text.');
        return;
    }

    try {
        await addDoc(collection(window.db, "reviews"), {
            name,
            role: role || 'Client',
            text,
            stars: stars,
            createdAt: serverTimestamp() // Better than local time
        });

        // UI Reset
        document.getElementById('r-name').value = '';
        document.getElementById('r-role').value = '';
        document.getElementById('r-text').value = '';
        if(window.setStars) window.setStars(5);
        if(window.showOK) window.showOK('rv-ok');
        
    } catch (e) {
        console.error("Error adding review: ", e);
    }
}

// --- 3. EDIT (Populate form) ---
function editReview(id, name, role, text, stars) {
    editingDocId = id;
    document.getElementById('r-name').value = name;
    document.getElementById('r-role').value = role;
    document.getElementById('r-text').value = text;
    if(window.setStars) window.setStars(stars);
    
    // Change button text to show we are in edit mode
    document.querySelector('.a-submit').textContent = "Update Review ✓";
    // Scroll to form
    document.getElementById('form-reviews').scrollIntoView();
}

// --- 4. DELETE REVIEW ---
async function deleteReview(id) {
    if (!confirm('Delete this review permanently?')) return;
    
    try {
        await deleteDoc(doc(window.db, "reviews", id));
    } catch (e) {
        console.error("Error deleting review: ", e);
    }
}

// ══════════════ RENDER REVIEWS SLIDER ══════════════
function renderReviews() {
  const track = document.getElementById('rv-track');
  if (!track) return;

  // Use the global window.reviews populated by Firebase
  const data = window.reviews || [];

  track.innerHTML = data.map(r => `
    <div class="review-card">
      <div class="rv-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <p class="rv-text">"${r.text}"</p>
      <div class="rv-author">
        <div class="rv-avatar">
          ${r.img ? `<img src="${r.img}" alt="${r.name}">` : `<div class="rv-initials">${r.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>`}
        </div>
        <div>
          <div class="rv-name">${r.name}</div>
          <div class="rv-role">${r.role}</div>
        </div>
      </div>
    </div>`).join('');

  // Update slider controls
  if (window.sliders && window.sliders.rv) {
      sliders.rv.total = data.length;
      sliders.rv.idx = 0;
      updateSlider('rv');
  }
}

// Ensure this is globally available for review.js to call
window.renderReviews = renderReviews;


// Expose to window for HTML onclicks
window.addReview = addReview;
window.deleteReview = deleteReview;

// Start the listener
initReviewListener();