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

// Form validation
function validateForm(formId, validationRules) {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    const errors = {};

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
    document.querySelectorAll('.border-red-500').forEach(el => {
        el.classList.remove('border-red-500');
    });

    // Validate each field
    for (const [fieldId, rules] of Object.entries(validationRules)) {
        const field = document.getElementById(fieldId);
        if (!field) continue;

        const value = field.value.trim();
        const errorElement = document.getElementById(`${fieldId}Error`);

        // Required check
        if (rules.required && !value) {
            errors[fieldId] = 'This field is required';
            field.classList.add('border-red-500');
            if (errorElement) {
                errorElement.textContent = errors[fieldId];
                errorElement.classList.remove('hidden');
            }
            isValid = false;
            continue;
        }

        // Pattern check
        if (rules.pattern && value && !rules.pattern.test(value)) {
            errors[fieldId] = rules.message || 'Invalid format';
            field.classList.add('border-red-500');
            if (errorElement) {
                errorElement.textContent = errors[fieldId];
                errorElement.classList.remove('hidden');
            }
            isValid = false;
        }

        // Custom validation
        if (rules.custom && value) {
            const customError = rules.custom(value);
            if (customError) {
                errors[fieldId] = customError;
                field.classList.add('border-red-500');
                if (errorElement) {
                    errorElement.textContent = errors[fieldId];
                    errorElement.classList.remove('hidden');
                }
                isValid = false;
            }
        }
    }

    return isValid;
}

function handleRegisterResponse(response) {
    if (response.status === 201) {
      window.location.href = '../../login/'; // 회원가입 성공 시 로그인 페이지로 이동
    } else {
        let errorMessage = response.data.detail;
        alert(errorMessage);
    }
}

// Initialize form validation
document.addEventListener('DOMContentLoaded', () => {
    // Setup password toggles
    setupPasswordToggle('passwordToggle', 'password');
    setupPasswordToggle('confirmPasswordToggle', 'confirmPassword');

    // Setup password strength checking
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
        });
    }

    // Setup form validation
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const isValid = validateForm('signupForm', {
                username: {
                    required: true,
                    pattern: /^[a-zA-Z0-9_]{3,20}$/,
                    message: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores'
                },
                email: {
                    required: true,
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Please enter a valid email address'
                },
                password: {
                    required: true,
                    pattern: /^.{8,}$/,
                    message: 'Password must be at least 8 characters long',
                    custom: (value) => {
                        const strength = checkPasswordStrength(value);
                        return strength.strength === 'weak' ? 'Please choose a stronger password' : null;
                    }
                },
                confirmPassword: {
                    required: true,
                    custom: (value) => {
                        const password = document.getElementById('password').value;
                        return value !== password ? 'Passwords do not match' : null;
                    }
                },
                gender: {
                    required: true
                }
            });

            if (isValid) {
                // Submit form
                signupForm.submit();
            }
        });
    }
}); 

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // 폼의 기본 제출 동작을 막습니다.

        // 폼 데이터를 가져옵니다.
        const formData = new FormData(form);

        // 버튼을 비활성화하여 중복 제출을 방지합니다.
        submitButton.disabled = true;
        submitButton.textContent = 'Creating Account...';

        // 서버로 폼 데이터를 전송합니다.
        fetch(form.action, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            handleRegisterResponse(response);
            // 서버 응답에 따라 버튼을 다시 활성화합니다.
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        })
        .catch(error => {
            console.error('Error:', error);
            // 에러 발생 시 버튼을 다시 활성화합니다.
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        });
    });
});