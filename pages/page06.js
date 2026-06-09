/* START: SECTION_1 */
/* ==========================================
   [카테고리 필터 칩 동작 - page06.js]
   이 파일은 필터 칩의 단일 선택 처리,
   칩 리스트 펼치기/접기(토글), 토글에 따른 aria-label 및
   화살표 회전 연동, 목록 페이지 복귀 처리를 제어합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const btnBack = document.querySelector('.btn-back');
  const chipList = document.getElementById('filter-chip-list');
  const filterChips = document.querySelectorAll('.filter-chip');
  const btnToggle = document.getElementById('btn-toggle-chips');
  
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

  // 3. 필터 칩 단일 선택 토글 처리
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // 이미 선택된 항목을 누른 경우 아무 동작 안 함
      if (chip.getAttribute('data-property-2') === 'sel') {
        return;
      }

      // 다른 모든 칩들의 선택을 해제
      filterChips.forEach(otherChip => {
        otherChip.setAttribute('data-property-2', 'nor');
      });

      // 현재 칩을 선택 상태로 변경
      chip.setAttribute('data-property-2', 'sel');

      const text = chip.querySelector('.filter-chip-text').textContent;
      showToast(`'${text}' 필터를 선택했습니다.`);
    });
  });

  // 4. 우측 접기/더보기 버튼 토글 처리
  btnToggle.addEventListener('click', () => {
    const currentState = chipList.getAttribute('data-state');
    
    if (currentState === 'expanded') {
      // 칩 리스트 접기
      chipList.setAttribute('data-state', 'collapsed');
      btnToggle.setAttribute('aria-label', '필터 영역 열기');
      showToast('필터 리스트를 접었습니다. (가로 스크롤 가능)');
    } else {
      // 칩 리스트 펼치기
      chipList.setAttribute('data-state', 'expanded');
      btnToggle.setAttribute('aria-label', '필터 영역 접기');
      showToast('필터 리스트를 전체 펼쳤습니다.');
    }
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
