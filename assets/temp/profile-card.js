/* ==========================================
   [프로필 카드 동작 - profile-card.js]
   이 스크립트는 팔로우 상태 전환 및 팔로워 수 카운트 증가/감소,
   메시지 전송 및 소셜 아이콘 누를 시 하단 토스트 팝업 띄우기 등의
   클라이언트 사이드 인터랙티브 기능을 수행합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. 필요한 DOM 요소의 참조 획득
  const btnFollow = document.getElementById('btn-follow'); // 팔로우 버튼
  const btnMessage = document.getElementById('btn-message'); // 메시지 버튼
  const followersCountEl = document.getElementById('followers-count'); // 팔로워 수 숫자 요소
  const toast = document.getElementById('toast'); // 알림 메시지 토스트창
  const toastText = document.getElementById('toast-text'); // 토스트창 본문 텍스트
  const socialLinks = document.querySelectorAll('.social-link'); // 하단 소셜네트워크 링크들

  // 2. 초기 데이터 정의
  let isFollowing = false; // 현재 로그인 유저의 해당 디자이너 팔로잉 여부
  let followerCount = 1240; // 초기 팔로워 숫자 세팅
  let toastTimeout = null;  // 토스트 타이머 클리어를 위한 변수

  // 3. 팔로우 버튼 클릭 핸들러
  btnFollow.addEventListener('click', () => {
    // 팔로잉 상태 반전
    isFollowing = !isFollowing;

    // 팔로잉 상태에 맞추어 DOM 속성 조작
    if (isFollowing) {
      // (1) 버튼 클래스 및 내부 텍스트 교체 (초록색 Following 상태로 전환)
      btnFollow.classList.add('following');
      btnFollow.querySelector('span').textContent = '팔로잉';
      
      // (2) 팔로워 수 동적 증가시킴
      followerCount++;
      followersCountEl.textContent = formatNumber(followerCount);

      // (3) 토스트 알림창 출력
      showToast('이지아 님을 팔로우했습니다.');
    } else {
      // (1) 원래 팔로우 상태로 복원
      btnFollow.classList.remove('following');
      btnFollow.querySelector('span').textContent = '팔로우';
      
      // (2) 팔로워 수 동적 감소시킴
      followerCount--;
      followersCountEl.textContent = formatNumber(followerCount);

      // (3) 토스트 알림창 출력
      showToast('팔로우를 취소했습니다.');
    }
  });

  // 4. 메시지 보내기 버튼 클릭 핸들러
  btnMessage.addEventListener('click', () => {
    showToast('이지아 님에게 대화 요청 메시지를 전송했습니다.');
  });

  // 5. 소셜 아이콘 클릭 시 안내 토스트 띄우기
  socialLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // 실제 임시 링크(#)로 인한 페이지 스크롤 튐 방지
      const platform = link.getAttribute('data-platform');
      showToast(`${platform} 포트폴리오 채널로 이동합니다.`);
    });
  });

  // ==========================================
  // [공통 헬퍼 함수 정의 영역]
  // ==========================================

  // (1) 토스트 메시지 팝업을 화면에 띄우는 함수
  function showToast(message) {
    // 기존에 진행 중이던 소멸 타이머가 있다면 즉시 취소 처리
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    // 토스트 내용 변경 후 클래스 활성화 (화면 위로 슬라이딩)
    toastText.textContent = message;
    toast.classList.add('show');

    // 3초 후에 자동으로 서서히 숨겨지도록 타이머 예약
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // (2) 천 단위 콤마(,) 세 자릿수 포맷 함수 (예: 1241 -> 1,241)
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

});
