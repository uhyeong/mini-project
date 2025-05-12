// Password toggle functionality
function setupPasswordToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    
    if (toggle && input) {
        toggle.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            toggle.querySelector('i').classList.toggle('fa-eye');
            toggle.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) {
        score += 1;
    } else {
        feedback.push('Password should be at least 8 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include at least one lowercase letter');
    }

    // Number check
    if (/[0-9]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include at least one number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include at least one special character');
    }

    return {
        score,
        feedback,
        strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
    };
}

// Update password strength UI
function updatePasswordStrength(password) {
    const strengthResult = checkPasswordStrength(password);
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');
    const feedbackList = document.getElementById('passwordFeedbackList');

    if (strengthBar && strengthText && feedbackList) {
        // Update strength bar
        const percentage = (strengthResult.score / 5) * 100;
        strengthBar.style.width = `${percentage}%`;
        
        // Update colors based on strength
        if (strengthResult.strength === 'weak') {
            strengthBar.style.backgroundColor = '#ef4444'; // red-500
            strengthText.textContent = 'Weak';
            strengthText.className = 'text-red-500';
        } else if (strengthResult.strength === 'medium') {
            strengthBar.style.backgroundColor = '#f59e0b'; // amber-500
            strengthText.textContent = 'Medium';
            strengthText.className = 'text-amber-500';
        } else {
            strengthBar.style.backgroundColor = '#22c55e'; // green-500
            strengthText.textContent = 'Strong';
            strengthText.className = 'text-green-500';
        }

        // Update feedback list
        feedbackList.innerHTML = '';
        strengthResult.feedback.forEach(feedback => {
            const li = document.createElement('li');
            li.textContent = feedback;
            li.className = 'text-sm text-slate-400';
            feedbackList.appendChild(li);
        });
    }
}

// // Initialize form validation
// document.addEventListener('DOMContentLoaded', () => {
//     // Setup password toggles
//     setupPasswordToggle('passwordToggle', 'password');
//     setupPasswordToggle('confirmPasswordToggle', 'confirmPassword');
//     console.log('qwer')
//     // Setup password strength checking
//     const passwordInput = document.getElementById('password');
//     if (passwordInput) {
//         passwordInput.addEventListener('input', (e) => {
//             updatePasswordStrength(e.target.value);
//         });
//     }
// });