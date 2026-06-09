/* START: SECTION_1 */
/* ==========================================
   [세부 보장 내역 카드 동작 - page07.js]
   이 파일은 보장 항목 클릭 시의 피드백 토스트 출력,
   뒤로가기 처리 및 목록 복귀를 담당합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const btnBack = document.querySelector('.btn-back');
  const coverageItems = document.querySelectorAll('.coverage-item');
  
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

  // 3. 보장 내역 아이템 클릭 이벤트 (토스트 안내 바인딩)
  coverageItems.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('.coverage-item-title').textContent;
      showToast(`'${title}' 상세 내역을 확인합니다.`);
    });

    // 키보드 엔터 키 지원 (접근성 보강)
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const title = item.querySelector('.coverage-item-title').textContent;
        showToast(`'${title}' 상세 내역을 확인합니다.`);
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
