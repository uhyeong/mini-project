document.addEventListener('DOMContentLoaded', function() {
  setupPasswordToggle('passwordToggle', 'password');
    setupPasswordToggle('confirmPasswordToggle', 'confirmPassword');
    console.log('qwer')
    // Setup password strength checking
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
        });
    }
  const registerForm = document.getElementById('signupForm');
  if (registerForm) {
      registerForm.addEventListener('submit', async function(e) {
          e.preventDefault();

          // 입력값 가져오기
          const username = document.querySelector('input[name="username"]').value;
          const email = document.querySelector('input[name="email"]').value;
          const password = document.querySelector('input[name="password"]').value;
          const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;
          const gender = document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : '';

          // 비밀번호 확인
          if (password !== confirmPassword) {
              alert('비밀번호가 일치하지 않습니다.');
              return;
          }

          try {
              const response = await fetch('/account/register/', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      username: username,
                      email: email,
                      password: password,
                      gender: gender
                  })
              });

              let data = {};
              try {
                  data = await response.json();
              } catch (err) {
                  // JSON 파싱 실패 시 빈 객체 유지
              }

              if (response.status === 201 || response.status === 200) {
                  alert('회원가입이 완료되었습니다. 로그인 해주세요.');
                  window.location.href = '/account/login/';
              } else {
                  alert(data.detail || '회원가입에 실패했습니다.');
                  // window.location.href = '/account/register/';
              }
          } catch (error) {
              console.error('Error:', error);
              alert('회원가입 처리 중 오류가 발생했습니다.');
          }
      });
  }
});