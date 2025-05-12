document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const credential = document.querySelector('input[name="credential"]').value;
            const password = document.querySelector('input[name="password"]').value;

            try {
                const response = await fetch('/account/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        credential: credential,
                        password: password
                    })
                });

                if (response.ok) {
                    window.location.href = '/chatbot/';
                } else {
                    const data = await response.json();
                    alert(data.detail || '로그인에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('로그인 처리 중 오류가 발생했습니다.');
            }
        });
    }
});