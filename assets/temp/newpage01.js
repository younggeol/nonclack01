/* ==========================================
   [신규 퍼블리싱 템플릿 동작 - newpage01.js]
   이 스크립트는 탭 메뉴 버튼 클릭 시 온/오프 상태 전환,
   전환된 단계에 맞춰 하단 프로그레스 바의 채우기 게이지 연동,
   그리고 각종 버튼 클릭에 대한 피드백 토스트 창 출력을 담당합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const tabItems = document.querySelectorAll('.template-tab-item'); // 탭 버튼 아이템들
  const progressSegments = document.querySelectorAll('.progress-segment'); // 프로그레스 바 세그먼트들
  const btnBack = document.querySelector('.back-btn-wrapper'); // 2번 템플릿의 뒤로가기 버튼
  const btnHamburger = document.querySelector('.hamburger-btn-wrapper'); // 2번 템플릿의 햄버거 메뉴 버튼
  
  // 토스트 피드백 요소
  const toast = document.getElementById('page-toast');
  const toastText = document.getElementById('page-toast-text');
  let toastTimeout = null;

  // 2. 뒤로가기 버튼 이벤트 바인딩 (목록 페이지로 퇴장)
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      showToast('목록 페이지로 이동합니다...');
      setTimeout(() => {
        window.location.href = '../index.html'; // 목록 페이지로 바로 이동
      }, 1000);
    });
  }

  // 3. 햄버거 메뉴 버튼 이벤트 바인딩
  if (btnHamburger) {
    btnHamburger.addEventListener('click', () => {
      showToast('전체 메뉴 목록을 호출합니다.');
    });
  }

  // START: SECTION_1
  // ==========================================
  // [구역 1] 1번 템플릿: 탭 메뉴 온/오프 활성화 핸들러
  // ==========================================
  tabItems.forEach(item => {
    item.addEventListener('click', () => {
      const step = parseInt(item.getAttribute('data-step'), 10);
      const menuName = item.querySelector('.template-tab-text').textContent;

      // (1) 모든 탭 버튼 상태 리셋 (off) 후 클릭된 탭 활성화 (on)
      tabItems.forEach(t => t.setAttribute('data-state', 'off'));
      item.setAttribute('data-state', 'on');

      // (2) 3번 템플릿 프로그레스 바 연동 가동
      updateProgressBar(step);

      showToast(`단계가 전환되었습니다: ${step}단계 (${menuName})`);
    });
  });
  // END: SECTION_1


  // START: SECTION_3
  // ==========================================
  // [구역 3] 3번 템플릿: 탭 단계 연계 프로그레스 바 제어 로직
  // ==========================================
  function updateProgressBar(step) {
    progressSegments.forEach((segment, index) => {
      // 선택된 단계 이하의 세그먼트들만 활성화(빨간색), 나머지는 비활성화(회색)
      if (index < step) {
        segment.setAttribute('data-active', 'true');
      } else {
        segment.setAttribute('data-active', 'false');
      }
    });
  }
  // END: SECTION_3


  // ==========================================
  // [공통 유틸리티 영역]
  // ==========================================

  // 화면 하단 토스트 팝업 띄우기 함수
  function showToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    if (toastText && toast) {
      toastText.textContent = message;
      toast.classList.add('show');

      // 3초 후 자동 소멸
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }

});
