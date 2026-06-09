/* START: SECTION_1 */
/* ==========================================
   [3대 진단 상세 설정 팝업 동작 - page03_popup.js]
   이 파일은 팝업 창 내의 체크박스 상태 관리(선택/해제),
   선택 개수 실시간 합산 및 메인 페이지 전환 로직을 담고 있습니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const optionItems = document.querySelectorAll('.option-item');
  const btnConfirm = document.getElementById('btn-select-confirm');
  const btnClose = document.querySelector('.btn-close-popup');
  const dimOverlay = document.querySelector('.popup-dim-overlay');
  
  const toast = document.getElementById('page-toast');
  const toastText = toast.querySelector('span');
  let toastTimeout = null;

  // 2. 초기화 작업 (selected 클래스 동적 정렬)
  optionItems.forEach(item => {
    const checkbox = item.querySelector('.popup-checkbox');
    const isSelected = checkbox.getAttribute('data-property-1') === 'selected';
    if (isSelected) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  updateSelectedCount();

  // 3. 옵션 아이템 클릭 시 선택 토글 처리
  optionItems.forEach(item => {
    item.addEventListener('click', () => {
      const checkbox = item.querySelector('.popup-checkbox');
      const isSelected = checkbox.getAttribute('data-property-1') === 'selected';

      if (isSelected) {
        // 선택 해제
        checkbox.setAttribute('data-property-1', 'default');
        item.classList.remove('selected');
        const label = item.querySelector('.option-label').textContent;
        showToast(`'${label}' 선택을 취소했습니다.`);
      } else {
        // 선택 활성화
        checkbox.setAttribute('data-property-1', 'selected');
        item.classList.add('selected');
        const label = item.querySelector('.option-label').textContent;
        showToast(`'${label}' 항목을 선택했습니다.`);
      }

      // 개수 실시간 반영
      updateSelectedCount();
    });
  });

  // 4. 선택 완료 버튼 클릭 이벤트
  btnConfirm.addEventListener('click', () => {
    const count = getSelectedCount();
    showToast(`총 ${count}개의 항목이 선택되었습니다. 목록 화면으로 돌아갑니다...`);
    
    // 부드러운 화면 전환을 위해 약간의 지연 후 뒤로가기 실행
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1200);
  });

  // 5. 닫기 버튼 및 딤 영역 클릭 이벤트 (목록 페이지로 이동)
  const goBack = () => {
    showToast('설정을 취소하고 목록 화면으로 이동합니다...');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  };

  btnClose.addEventListener('click', goBack);
  dimOverlay.addEventListener('click', goBack);

  // ==========================================
  // [유틸리티 함수 정의]
  // ==========================================

  // 선택 개수 계산 및 버튼 라벨 업데이트
  function updateSelectedCount() {
    const count = getSelectedCount();
    btnConfirm.querySelector('span').textContent = `선택 (${count})`;
  }

  function getSelectedCount() {
    return document.querySelectorAll('.popup-checkbox[data-property-1="selected"]').length;
  }

  function showToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastText.textContent = message;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

});
/* END: SECTION_1 */
