/* ==========================================
   [보장분석 반영 설정 동작 - page03.js]
   이 파일은 보장분석 반영 설정 화면의 상호작용(체크 토글),
   뒤로가기 처리 및 구역별 마커 소스 뷰어를 지원하는 스크립트입니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const btnBack = document.querySelector('.btn-back');
  const toast = document.getElementById('page-toast');
  const toastText = toast.querySelector('span');
  
  let toastTimeout = null;

  // 2. 뒤로가기 버튼 이벤트 연동 (목록 페이지로 이동)
  btnBack.addEventListener('click', () => {
    showToast('목록 페이지로 이동합니다...');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  });


  // START: SECTION_1
  // ==========================================
  // [구역 1] 보장분석 반영 대화형 체크 토글 상호작용
  // ==========================================
  const toggleGroup = document.getElementById('btn-toggle-reflection');
  const checkIconBox = toggleGroup.querySelector('.check-icon-box');

  toggleGroup.addEventListener('click', () => {
    const isChecked = toggleGroup.classList.contains('checked');

    if (isChecked) {
      // (A) 체크 해제
      toggleGroup.classList.remove('checked');
      checkIconBox.setAttribute('data-property-1', 'default');
      showToast('보장분석 설정을 미반영 상태로 변경했습니다.');
    } else {
      // (B) 체크 설정
      toggleGroup.classList.add('checked');
      checkIconBox.setAttribute('data-property-1', 'active');
      showToast('보장분석 설정이 정상적으로 반영되었습니다.');
    }
  });
  // END: SECTION_1


  // START: SECTION_2
  // ==========================================
  // [구역 2] 판매인기/신담보 설정 영역 (정적 카드 제공 - 별도 스크립트 동작 없음)
  // ==========================================
  console.log('[설정 페이지] 구역 2 판매인기/신담보 로드 완료. (정적 카드)');
  // END: SECTION_2


  // START: SECTION_3
  // ==========================================
  // [구역 3] 3대 진단 설정 영역 (정적 카드 제공 - 별도 스크립트 동작 없음)
  // ==========================================
  console.log('[설정 페이지] 구역 3 3대 진단 로드 완료. (정적 카드)');
  // END: SECTION_3


  // START: SECTION_4
  // ==========================================
  // [구역 4] 유의사항 아코디언 토글 상호작용
  // ==========================================
  const noticeAccordion = document.getElementById('notice-accordion');
  const noticeHeader = noticeAccordion.querySelector('.notice-header-bar');

  noticeHeader.addEventListener('click', () => {
    const isOpen = noticeAccordion.getAttribute('data-property-1') === 'on';

    if (isOpen) {
      noticeAccordion.setAttribute('data-property-1', 'off');
      showToast('유의사항을 접었습니다.');
    } else {
      noticeAccordion.setAttribute('data-property-1', 'on');
      showToast('유의사항을 펼쳤습니다.');
    }
  });
  // END: SECTION_4


  // START: SECTION_5
  // ==========================================
  // [구역 5] 하단 고정 버튼 상호작용
  // ==========================================
  const btnReset = document.getElementById('btn-reset-settings');
  const btnConfirm = document.getElementById('btn-confirm-settings');

  // 초기화 버튼 클릭 시 (체크박스 상태 원복)
  btnReset.addEventListener('click', () => {
    // 구역 1 (체크박스) 초기화 -> 체크해제
    toggleGroup.classList.remove('checked');
    checkIconBox.setAttribute('data-property-1', 'default');

    showToast('설정 항목들을 초기화했습니다.');
  });

  // AI설계결과 확인 버튼 클릭 시
  btnConfirm.addEventListener('click', () => {
    showToast('설정된 정보로 AI설계결과를 조회합니다...');
  });
  // END: SECTION_5


  // ==========================================
  // [공통 유틸리티 영역]
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
