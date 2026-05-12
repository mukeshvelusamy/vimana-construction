/**
 * Formspree AJAX Integration - Vimana Construction
 * Ensures form is always visible and success message disappears after 3s
 */

window.formspree = window.formspree || function () { 
    (formspree.q = formspree.q || []).push(arguments); 
};

formspree('initForm', { 
    formElement: '#quote-form', 
    formId: 'xeennvge',
    onSuccess: function() {
        const form = document.getElementById('quote-form');
        const statusBox = document.getElementById('quote-ok');

        // 1. Clear the fields
        if (form) {
            form.reset();
            // 2. Explicitly keep form visible
            form.style.setProperty('display', 'block', 'important');
        }
        
        // 3. Show the green success message
        if (statusBox) {
            statusBox.style.display = 'block';
            
            // 4. Hide ONLY the message after 3 seconds
            setTimeout(() => {
                statusBox.style.display = 'none';
            }, 3000);
        }
    }
});