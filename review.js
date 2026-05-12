// import { 
//     collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp 
// } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// // Global variable to track if we are currently editing an existing review
// let editingDocId = null;

// // --- 1. LISTENER (READ) ---
// export function initReviewListener() {
//     const q = query(collection(window.db, "reviews"), orderBy("createdAt", "desc"));
    
//     onSnapshot(q, (snapshot) => {
//         const firebaseReviews = [];
//         snapshot.forEach((doc) => {
//             firebaseReviews.push({ id: doc.id, ...doc.data() });
//         });

//         // Update global state for the public slider
//         window.reviews = firebaseReviews;

//         // Render Admin List and Public Slider
//         renderAdminReviews(firebaseReviews); 
//         if (window.renderReviews) window.renderReviews(); 
//     });
// }

// // --- 2. SAVE (Handles both ADD and UPDATE) ---
// async function saveReview() {
//     const name = document.getElementById('r-name').value.trim();
//     const role = document.getElementById('r-role').value.trim();
//     const text = document.getElementById('r-text').value.trim();
//     const stars = window.rvStars || 5;

//     if (!name || !text) {
//         alert('Please enter client name and review text.');
//         return;
//     }

//     try {
//         if (editingDocId) {
//             // Logic for UPDATING existing review
//             const docRef = doc(window.db, "reviews", editingDocId);
//             await updateDoc(docRef, {
//                 name,
//                 role: role || 'Client',
//                 text,
//                 stars: stars
//             });
//             editingDocId = null; 
//             document.querySelector('.a-submit').textContent = "Add Review →";
//         } else {
//             // Logic for ADDING new review
//             await addDoc(collection(window.db, "reviews"), {
//                 name,
//                 role: role || 'Client',
//                 text,
//                 stars: stars,
//                 createdAt: serverTimestamp()
//             });
//         }

//         // Reset UI Form
//         document.getElementById('r-name').value = '';
//         document.getElementById('r-role').value = '';
//         document.getElementById('r-text').value = '';
//         if(window.setStars) window.setStars(5);
//         if(window.showOK) window.showOK('rv-ok');
        
//     } catch (e) {
//         console.error("Error saving review: ", e);
//         alert("Failed to save. Check console for details.");
//     }
// }

// // --- 3. EDIT (Triggered by clicking Edit button in the list) ---
// function editReview(id) {
//     // Find the review data from our global window.reviews array
//     const reviewToEdit = window.reviews.find(r => r.id === id);
    
//     if (reviewToEdit) {
//         editingDocId = id;
        
//         // Fill the form fields
//         document.getElementById('r-name').value = reviewToEdit.name;
//         document.getElementById('r-role').value = reviewToEdit.role;
//         document.getElementById('r-text').value = reviewToEdit.text;
        
//         // Set the stars (UI helper)
//         if(window.setStars) window.setStars(reviewToEdit.stars);
        
//         // Change UI button text to "Update"
//         document.querySelector('.a-submit').textContent = "Update Review ✓";
        
//         // Scroll to form so the user sees it
//         document.getElementById('form-reviews').scrollIntoView({ behavior: 'smooth' });
//     }
// }

// // --- 4. DELETE ---
// async function deleteReview(id) {
//     if (!confirm('Delete this review permanently?')) return;
//     try {
//         await deleteDoc(doc(window.db, "reviews", id));
//     } catch (e) {
//         console.error("Error deleting review: ", e);
//     }
// }

// // --- 5. RENDER ADMIN LIST ---
// function renderAdminReviews(reviewsList) {
//     const listEl = document.getElementById('adm-rv-list');
//     if(!listEl) return;

//     listEl.innerHTML = reviewsList.map(r => `
//         <div class="a-item">
//             <div>
//                 <div class="a-item-t">${r.name} — ${'★'.repeat(r.stars)}</div>
//                 <div class="a-item-s">${r.role} · "${r.text.slice(0, 60)}..."</div>
//             </div>
//             <div class="a-item-btns">
//                 <button class="btn-edit" onclick="editReview('${r.id}')">Edit</button>
//                 <button class="btn-del" onclick="deleteReview('${r.id}')">Delete</button>
//             </div>
//         </div>
//     `).join('') || '<p style="color:#bbb;font-size:13px">No reviews yet.</p>';
// }

// // Expose functions to HTML window
// window.addReview = saveReview;
// window.deleteReview = deleteReview;
// window.editReview = editReview;

// // Initial Run
// initReviewListener();
import { 
    collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

let editingDocId = null;
let currentIdx = 0; 

// --- 1. LISTENER ---
export function initReviewListener() {
    const q = query(collection(window.db, "reviews"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        const firebaseReviews = [];
        snapshot.forEach((doc) => {
            firebaseReviews.push({ id: doc.id, ...doc.data() });
        });

        window.reviews = firebaseReviews;
        renderAdminReviews(firebaseReviews); 
        
        currentIdx = 0;
        if (window.renderReviews) window.renderReviews(); 
    });
}

// --- 2. RENDER PUBLIC SLIDER ---
function renderReviews() {
    const track = document.getElementById('rv-track');
    if (!track) return;
    const data = window.reviews || [];

    track.innerHTML = data.map(r => `
        <div class="review-card">
            <div class="rv-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
            <p class="rv-text">"${r.text}"</p>
            <div class="rv-author">
                <div class="rv-avatar">
                    ${r.img ? `<img src="${r.img}" alt="${r.name}">` : `<div class="rv-initials">${r.name.split(' ').map(w => w[0]).join('').toUpperCase()}</div>`}
                </div>
                <div><div class="rv-name">${r.name}</div><div class="rv-role">${r.role}</div></div>
            </div>
        </div>`).join('');
    updateSliderPos();
}

// --- 3. SLIDER NAV ---
window.slideNext = function() {
    const total = window.reviews.length;
    if (currentIdx < total - 4) { currentIdx++; updateSliderPos(); }
};
window.slidePrev = function() {
    if (currentIdx > 0) { currentIdx--; updateSliderPos(); }
};
function updateSliderPos() {
    const track = document.getElementById('rv-track');
    if (!track) return;
    track.style.transform = `translateX(-${currentIdx * 25}%)`;
}

// --- 4. CRUD OPERATIONS ---

// FIX: This handles the actual update in Firebase
async function saveReview() {
    const name = document.getElementById('r-name').value.trim();
    const role = document.getElementById('r-role').value.trim();
    const text = document.getElementById('r-text').value.trim();
    const stars = window.rvStars || 5;

    if (!name || !text) { alert('Please fill in all fields.'); return; }

    try {
        if (editingDocId) {
            // UPDATING existing doc in Firestore
            await updateDoc(doc(window.db, "reviews", editingDocId), { 
                name, role, text, stars 
            });
            editingDocId = null;
            document.querySelector('.a-submit').textContent = "Add Review →";
        } else {
            // ADDING new doc to Firestore
            await addDoc(collection(window.db, "reviews"), { 
                name, role, text, stars, createdAt: serverTimestamp() 
            });
        }
        resetForm();
    } catch (e) { console.error("Save error:", e); }
}

function resetForm() {
    document.getElementById('r-name').value = '';
    document.getElementById('r-role').value = '';
    document.getElementById('r-text').value = '';
    if (window.setStars) window.setStars(5);
    if (window.showOK) window.showOK('rv-ok');
}

// FIX: Correct Edit logic - Populates the form
function editReview(id) {
    // 1. Find the specific review from our data
    const r = window.reviews.find(item => item.id === id);
    if (!r) return;

    // 2. Set the global ID so saveReview() knows we are editing
    editingDocId = id;

    // 3. Fill the form fields
    document.getElementById('r-name').value = r.name;
    document.getElementById('r-role').value = r.role;
    document.getElementById('r-text').value = r.text;
    
    // 4. Update the star UI
    if (window.setStars) window.setStars(r.stars);

    // 5. Change button text
    document.querySelector('.a-submit').textContent = "Update Review ✓";

    // 6. Scroll up to the form so the owner can see it
    document.getElementById('form-reviews').scrollIntoView({ behavior: 'smooth' });
}

async function deleteReview(id) {
    if (!confirm('Permanently delete this review?')) return;
    try {
        await deleteDoc(doc(window.db, "reviews", id));
    } catch (e) { console.error("Delete error:", e); }
}

// --- 5. RENDER ADMIN LIST ---
function renderAdminReviews(list) {
    const adminList = document.getElementById('adm-rv-list');
    if (!adminList) return;
    adminList.innerHTML = list.map(r => `
        <div class="a-item">
            <div>
                <div class="a-item-t">${r.name} — ${'★'.repeat(r.stars)}</div>
                <div class="a-item-s">${r.role} · "${r.text.slice(0, 50)}..."</div>
            </div>
            <div class="a-item-btns">
                <button class="btn-edit" onclick="editReview('${r.id}')">Edit</button>
                <button class="btn-del" onclick="deleteReview('${r.id}')">Delete</button>
            </div>
        </div>`).join('');
}

// Expose to window
window.addReview = saveReview;
window.deleteReview = deleteReview;
window.editReview = editReview;
window.renderReviews = renderReviews;

initReviewListener();