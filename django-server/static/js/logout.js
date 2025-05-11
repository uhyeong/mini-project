function handleLogoutResponse(response) {
  if (response.status === 200) {
    window.location.href = 'account/login/'; // 로그아웃 성공 시 로그인 페이지로 이동
  } else {
    alert('로그아웃 실패');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const logoutButton = document.querySelector('#logoutButton');
  logoutButton.addEventListener('click', function(event) {
    event.preventDefault(); // 기본 클릭 동작을 막습니다.

    // 서버로 로그아웃 요청을 전송합니다.
    fetch('/logout/', {
      method: 'POST',
      credentials: 'include',
    })
    .then(response => handleLogoutResponse(response))
    .catch(error => console.error('Error:', error));
  });
});