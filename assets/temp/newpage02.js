/* ==========================================
   [신규 퍼블리싱 템플릿 동작 02 - newpage02.js]
   이 스크립트는 보장분석 반영 토글 스위치 제어,
   아코디언 카드 헤더 클릭 시 펼침/접힘 폴딩 제어,
   그리고 하위 옵션 체크박스 클릭 시 개별 상태 전환 처리를 담당합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const toggleSwitch = document.querySelector('.toggle-switch-container'); // 토글 스위치
  const accordionCards = document.querySelectorAll('.accordion-card'); // 아코디언 카드들
  
  // 토스트 피드백 요소
  const toast = document.getElementById('page-toast');
  const toastText = document.getElementById('page-toast-text');
  let toastTimeout = null;

  // START: SECTION_1
  // ==========================================
  // [구역 1] 1번 템플릿: 체크버튼 (토글 스위치) 토글 제어
  // ==========================================
  if (toggleSwitch) {
    const toggleInput = toggleSwitch.querySelector('.checkbox-input');
    if (toggleInput) {
      toggleInput.addEventListener('change', () => {
        const isChecked = toggleInput.checked;
        showToast(`보장분석 반영 상태가 ${isChecked ? '활성화' : '비활성화'}되었습니다.`);
      });
    }
  }
  // END: SECTION_1


  // 아코디언 카드별 기능 매핑 (2, 3번 템플릿 공통)
  accordionCards.forEach(card => {
    const header = card.querySelector('.accordion-header');
    const headerCheckbox = card.querySelector('.header-checkbox');
    const optionItems = card.querySelectorAll('.option-item');
    const titleText = card.querySelector('.accordion-title-text').textContent;

    // A. 헤더 영역 클릭 시 아코디언 접기/펼치기 토글 (체크박스 영역 클릭 시에는 미동작)
    if (header) {
      header.addEventListener('click', (e) => {
        // 체크박스 자체 또는 그 자식 요소를 누른 경우는 폴딩을 막고 체크 기능에 양보
        if (e.target.closest('.header-checkbox')) return;

        const currentState = card.getAttribute('data-state');
        const newState = currentState === 'on' ? 'off' : 'on';
        card.setAttribute('data-state', newState);

        showToast(`${titleText} 아코디언 카드가 ${newState === 'on' ? '펼쳐' : '접혀'}졌습니다.`);
      });
    }

    // B. 헤더 체크박스 클릭 시 전체선택/전체해제 연동
    if (headerCheckbox) {
      const headerInput = headerCheckbox.querySelector('.checkbox-input');
      if (headerInput) {
        headerInput.addEventListener('change', () => {
          const isChecked = headerInput.checked;
          
          // 하위 모든 담보 옵션들의 상태를 전체 동기화
          optionItems.forEach(item => {
            const itemInput = item.querySelector('.checkbox-input');
            if (itemInput) {
              itemInput.checked = isChecked;
            }
          });

          showToast(`${titleText}이(가) 전체 ${isChecked ? '선택' : '해제'}되었습니다.`);
        });

        // 체크박스 영역 클릭 시 헤더 폴딩 토글 방지
        headerInput.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    }

    // C. 하위 개별 옵션 담보 아이템 클릭 시 토글 제어
    optionItems.forEach(item => {
      // START: SECTION_3
      // ==========================================
      // [구역 3] 3번 템플릿: 아코디언 내부 하위 옵션 체크박스 토글 제어
      // ==========================================
      const itemInput = item.querySelector('.checkbox-input');
      if (itemInput) {
        itemInput.addEventListener('change', () => {
          const isChecked = itemInput.checked;
          const optionLabel = item.querySelector('.option-label-text').textContent;
          showToast(`${optionLabel} 담보가 ${isChecked ? '선택' : '해제'}되었습니다.`);

          // 하위 옵션들의 체크 상태를 분석하여 헤더 체크박스(전체선택) 상태 보정
          updateHeaderCheckboxState(headerCheckbox, optionItems);
        });
      }
      // END: SECTION_3
    });
  });

  // 하위 옵션 상태에 따라 헤더 체크박스 상태를 업데이트해주는 헬퍼 함수
  function updateHeaderCheckboxState(headerCheckbox, optionItems) {
    if (!headerCheckbox || optionItems.length === 0) return;
    const headerInput = headerCheckbox.querySelector('.checkbox-input');
    if (!headerInput) return;

    const totalCount = optionItems.length;
    let selectedCount = 0;

    optionItems.forEach(item => {
      const itemInput = item.querySelector('.checkbox-input');
      if (itemInput && itemInput.checked) {
        selectedCount++;
      }
    });

    // 모든 옵션이 체크된 경우 헤더 체크박스 활성화, 하나라도 해제되면 비활성화
    if (selectedCount === totalCount) {
      headerInput.checked = true;
    } else {
      headerInput.checked = false;
    }
  }


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
