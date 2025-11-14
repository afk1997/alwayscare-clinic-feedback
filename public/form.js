document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');
    const messageDiv = document.getElementById('message');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // Hide previous messages
            messageDiv.style.display = 'none';
            messageDiv.className = 'message';

            // Get clinic name from data attribute
            const clinic = form.getAttribute('data-clinic');
            
            // Collect form data
            const formData = {
                clinic: clinic,
                dateOfVisit: document.getElementById('dateOfVisit').value,
                caseNumber: document.getElementById('caseNumber').value,
                name: document.getElementById('name').value,
                contactNumber: document.getElementById('contactNumber').value,
                overallRating: form.querySelector('input[name="overallRating"]:checked')?.value || '',
                clearExplanation: form.querySelector('input[name="clearExplanation"]:checked')?.value || '',
                properAttention: form.querySelector('input[name="properAttention"]:checked')?.value || '',
                waitingTime: form.querySelector('input[name="waitingTime"]:checked')?.value || '',
                cleanComfortable: form.querySelector('input[name="cleanComfortable"]:checked')?.value || '',
                clearInstructions: form.querySelector('input[name="clearInstructions"]:checked')?.value || '',
                improvements: document.getElementById('improvements').value
            };

            try {
                const response = await fetch('/api/submit-feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                let result;
                try {
                    result = await response.json();
                } catch (jsonError) {
                    console.error('Error parsing JSON response:', jsonError);
                    messageDiv.textContent = 'Server error. Please try again later.';
                    messageDiv.className = 'message error';
                    messageDiv.style.display = 'block';
                    return;
                }

                if (result.success) {
                    messageDiv.textContent = result.message;
                    messageDiv.className = 'message success';
                    messageDiv.style.display = 'block';
                    
                    // Reset form
                    form.reset();
                    
                    // Scroll to message
                    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    messageDiv.textContent = result.message || 'An error occurred. Please try again.';
                    messageDiv.className = 'message error';
                    messageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Error:', error);
                messageDiv.textContent = 'Network error. Please check your connection and try again.';
                messageDiv.className = 'message error';
                messageDiv.style.display = 'block';
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

