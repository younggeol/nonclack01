/* START: SECTION_1 */
/* ==========================================
   [희망보험료 상세 설정 팝업 동작 - page04.js]
   이 파일은 팝업 창 내의 라디오 버튼 그룹 상태 관리(단일 선택),
   선택 완료 확인 및 목록 페이지로의 이동을 담당합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const optionItems = document.querySelectorAll('.option-item');
  const btnConfirm = document.getElementById('btn-select-confirm');
  const btnClose = document.querySelector('.btn-close-popup');
  const dimOverlay = document.querySelector('.popup-dim-overlay');
  const btnOpenPopup = document.getElementById('btn-open-popup');
  const popupSheet = document.querySelector('.popup-sheet-container');
  
  const toast = document.getElementById('page-toast');
  const toastText = toast.querySelector('span');
  let toastTimeout = null;

  // 2. 초기화 작업 (selected 클래스 동적 정렬)
  optionItems.forEach(item => {
    const radio = item.querySelector('.popup-radio');
    const isSelected = radio.getAttribute('data-property-1') === 'selected';
    if (isSelected) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });

  // 3. 라디오 버튼 단일 선택 토글 처리
  optionItems.forEach(item => {
    item.addEventListener('click', () => {
      // 이미 선택된 항목을 누른 경우 아무 동작 안 함
      const radio = item.querySelector('.popup-radio');
      if (radio.getAttribute('data-property-1') === 'selected') {
        return;
      }

      // 다른 모든 옵션들의 선택을 해제
      optionItems.forEach(otherItem => {
        const otherRadio = otherItem.querySelector('.popup-radio');
        otherRadio.setAttribute('data-property-1', 'default');
        otherItem.classList.remove('selected');
      });

      // 현재 옵션을 선택 상태로 변경
      radio.setAttribute('data-property-1', 'selected');
      item.classList.add('selected');

      const label = item.querySelector('.option-label').textContent;
      showToast(`희망보험료를 '${label}'로 변경했습니다.`);
    });
  });

  // 4. 팝업 열기 이벤트 바인딩
  btnOpenPopup.addEventListener('click', () => {
    dimOverlay.classList.add('active');
    popupSheet.classList.add('active');
    showToast('희망보험료 상세 설정을 엽니다.');
  });

  // 5. 선택 완료 버튼 클릭 이벤트
  btnConfirm.addEventListener('click', () => {
    const selectedItem = document.querySelector('.option-item.selected');
    const label = selectedItem ? selectedItem.querySelector('.option-label').textContent : '미선택';
    showToast(`희망보험료 '${label}' 선택이 완료되었습니다.`);
    
    // 부드러운 화면 전환을 위해 약간의 지연 후 팝업 닫기
    setTimeout(() => {
      closePopup();
    }, 1000);
  });

  // 6. 닫기 버튼 및 딤 영역 클릭 이벤트
  const closePopup = () => {
    dimOverlay.classList.remove('active');
    popupSheet.classList.remove('active');
  };

  const handleCloseClick = () => {
    showToast('설정을 취소했습니다.');
    closePopup();
  };

  btnClose.addEventListener('click', handleCloseClick);
  dimOverlay.addEventListener('click', handleCloseClick);


  // ==========================================
  // [유틸리티 함수 정의]
  // ==========================================

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
