/* START: SECTION_1 */
/* ==========================================
   [추천 보험 플랜 조회 동작 - page05.js]
   이 파일은 추천 플랜의 아코디언 접기/펴기 처리,
   만기 정보 변경 토스트 알림, 카드 상태 토글 및
   뒤로가기 처리를 담당합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const btnBack = document.querySelector('.btn-back');
  const toast = document.getElementById('page-toast');
  const toastText = document.getElementById('page-toast-text');
  let toastTimeout = null;

  // 2. 뒤로가기 버튼 클릭 이벤트 (목록 페이지로 이동)
  btnBack.addEventListener('click', () => {
    showToast('목록 화면으로 돌아갑니다...');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  });

  // 3. 아코디언 접기/펴기 동적 제어
  const accordions = document.querySelectorAll('.plan-accordion');
  
  accordions.forEach(accordion => {
    const header = accordion.querySelector('.plan-header');
    const bodyWrapper = accordion.querySelector('.plan-body-wrapper');

    // 초기 상태 로드 시 max-height 설정 (열려 있는 상태의 높이 고정)
    if (accordion.getAttribute('data-state') === 'on') {
      bodyWrapper.style.maxHeight = bodyWrapper.scrollHeight + 'px';
    } else {
      bodyWrapper.style.maxHeight = '0px';
    }

    // 헤더 클릭 토글
    header.addEventListener('click', () => {
      const currentState = accordion.getAttribute('data-state');
      if (currentState === 'on') {
        accordion.setAttribute('data-state', 'off');
        bodyWrapper.style.maxHeight = '0px';
        showToast(`'${header.querySelector('.plan-title').textContent}' 탭을 접었습니다.`);
      } else {
        accordion.setAttribute('data-state', 'on');
        bodyWrapper.style.maxHeight = bodyWrapper.scrollHeight + 'px';
        showToast(`'${header.querySelector('.plan-title').textContent}' 탭을 폈습니다.`);
        
        // 가변 콘텐츠 확장을 고려한 애니메이션 종료 후 높이 자동화
        setTimeout(() => {
          if (accordion.getAttribute('data-state') === 'on') {
            bodyWrapper.style.maxHeight = 'none';
          }
        }, 400);
      }
    });
  });

  // 4. 만기변경 버튼 클릭 이벤트 (토스트 출력)
  const changeExpiryButtons = document.querySelectorAll('.btn-change-expiry');
  changeExpiryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // 부모 카드 클릭 이벤트 전파 차단 (카드가 꺼지는 오작동 방지)
      e.stopPropagation();
      showToast('만기 정보를 변경합니다.');
    });
  });

  // 5. 상품 카드 클릭 시 활성/비활성 상태 토글
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    card.addEventListener('click', () => {
      const isSelected = card.getAttribute('data-state') === 'on';
      const productName = card.querySelector('.product-name').textContent;
      
      if (isSelected) {
        card.setAttribute('data-state', 'off');
        showToast('선택을 해제했습니다.');
      } else {
        card.setAttribute('data-state', 'on');
        showToast('추천 플랜을 활성화했습니다.');
      }

      // 아코디언 max-height 상태 보정 (높이가 'none'이 아닌 경우 재계산 유도)
      const parentAccordion = card.closest('.plan-accordion');
      const bodyWrapper = parentAccordion.querySelector('.plan-body-wrapper');
      if (parentAccordion.getAttribute('data-state') === 'on' && bodyWrapper.style.maxHeight !== 'none') {
        bodyWrapper.style.maxHeight = bodyWrapper.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // [공통 토스트 유틸리티 함수]
  // ==========================================

  function showToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastText.textContent = message;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

});
/* END: SECTION_1 */
