/* ==========================================
   [신규 퍼블리싱 템플릿 동작 03 - newpage03.js]
   이 스크립트는 보험 플랜 폴딩 헤더 클릭 시 접힘/펼침 토글,
   플랜 카드 클릭 시 1개씩 단독 활성화되는 라디오 형태 전환,
   그리고 만기변경 버튼 클릭 시 토스트 피드백 출력을 담당합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const accordionContainer = document.querySelector('.plan-accordion-container'); // 폴딩 전체 컨테이너
  const foldingHeader = document.querySelector('.plan-folding-header'); // 폴딩 헤더 영역
  const planCards = document.querySelectorAll('.plan-card'); // 플랜 선택 카드들
  const btnChangeTerm = document.querySelectorAll('.btn-change-term'); // 만기변경 버튼들
  
  // 토스트 피드백 요소
  const toast = document.getElementById('page-toast');
  const toastText = document.getElementById('page-toast-text');
  let toastTimeout = null;

  // 2. 상단 헤더 클릭 시 플랜 목록 접기/펼치기 토글
  if (foldingHeader && accordionContainer) {
    foldingHeader.addEventListener('click', () => {
      const currentState = accordionContainer.getAttribute('data-state');
      const newState = currentState === 'on' ? 'off' : 'on';
      accordionContainer.setAttribute('data-state', newState);

      showToast(`보험료 기준 플랜 목록이 ${newState === 'on' ? '펼쳐' : '접혀'}졌습니다.`);
    });
  }

  // START: SECTION_1
  // ==========================================
  // [구역 1] 1번 템플릿: 플랜 카드 단독 선택 제어 및 만기변경 연동
  // ==========================================
  
  // (1) 플랜 카드 단독 활성화 (라디오 박스 동작) 이벤트 바인딩
  planCards.forEach(card => {
    card.addEventListener('click', () => {
      // 이미 켜져 있는 상태면 중복 동작 방지
      if (card.getAttribute('data-state') === 'on') return;

      // 다른 카드들의 상태를 리셋(off)하고 클릭된 카드만 활성화(on)
      planCards.forEach(c => c.setAttribute('data-state', 'off'));
      card.setAttribute('data-state', 'on');

      const planName = card.querySelector('.plan-title').textContent.trim();
      const planPrice = card.querySelector('.plan-price-text').textContent.trim();
      showToast(`플랜이 변경되었습니다: ${planPrice} (${planName})`);
    });
  });

  // (2) 만기변경 버튼 클릭 연동
  btnChangeTerm.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // 부모 요소인 플랜 카드로 클릭 이벤트 버블링 차단
      showToast('가입 만기 변경 옵션 팝업을 호출합니다.');
    });
  });
  // END: SECTION_1


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
