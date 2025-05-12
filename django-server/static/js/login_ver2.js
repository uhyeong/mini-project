document.addEventListener('DOMContentLoaded', function() {
    // 쿠키에서 JWT 토큰 가져오기
    function getCookie(name) {
        let value = `; ${document.cookie}`;
        let parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // JWT 토큰 확인
    const accessToken = getCookie('access_token');

    // 로그인 상태 확인
    if (accessToken) {
        const currentPath = window.location.pathname;
        // 로그인 상태일 경우 로그인 페이지와 회원가입 페이지 접근 제한
        if (currentPath.includes('account/login')) {
            alert('로그인상태');
            // 다른 페이지로 리다이렉트 (예: 메인 페이지)
            window.location.href = '/chatbot/';
        }
    }

    // 로그인 폼 제출 처리
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

    // API 요청 시 Authorization 헤더 추가
    function makeAuthenticatedRequest(url, options = {}) {
        const token = getCookie('access_token'); // 쿠키에서 access_token을 가져옴
        if (!options.headers) {
            options.headers = {};
        }
        options.headers['Authorization'] = `Bearer ${token}`;
        
        return fetch(url, options);
    }

    // 예시: 인증된 요청 보내기
    makeAuthenticatedRequest('/account/login/', {
        method: 'GET'
    }).then(response => {
        // 응답 처리
        return response.json();
    }).then(data => {
        console.log(data);
    }).catch(error => {
        console.error('Error:', error);
    });
});

