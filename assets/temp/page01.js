/* ==========================================
   [AI가입설계 도우미 동작 - page01.js]
   이 스크립트는 상세설계/단순설계 탭 전환,
   고객 검색어 "홍길동" 조회 판별 및 카드 정보 실시간 페이드인 노출,
   다양한 버튼 클릭에 대응하는 맞춤형 토스트 알림 출력을 담당합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const btnBack = document.querySelector('.btn-back'); // 헤더 뒤로가기 버튼
  const tabs = document.querySelectorAll('.tab-item'); // 탭 버튼들
  const tabPanels = document.querySelectorAll('.tab-panel'); // 각 탭의 패널들

  // 상세설계 전용 요소
  const searchInputWrapper = document.getElementById('search-input-box'); // 검색창 감싸개
  const customerNameInput = document.getElementById('customer-name-input'); // 검색 입력 인풋
  const btnFillDemo = document.getElementById('btn-fill-demo'); // "홍길동" 데모 입력 유도 링크
  const searchEmptyBox = document.getElementById('search-empty-box'); // 검색 결과 없음 안내박스
  
  // 기능형 버튼들
  const btnNewCustomer = document.getElementById('btn-new-customer');
  const btnConsent = document.getElementById('btn-consent');
  const btnStartDesign = document.getElementById('btn-start-design');

  // 토스트 피드백 요소
  const toast = document.getElementById('page-toast');
  const toastText = document.getElementById('page-toast-text');
  let toastTimeout = null;

  // 초기 기동 상태 세팅
  let currentActiveTab = 'detail'; // 현재 활성화된 탭 명 ('detail' / 'simple')

  // 뒤로가기 버튼 연동 (목록 페이지로 퇴장)
  btnBack.addEventListener('click', () => {
    showToast('목록 페이지로 이동합니다...');
    setTimeout(() => {
      window.location.href = '../index.html'; // 목록 페이지로 바로 이동
    }, 1000);
  });


  // START: SECTION_1
  // ==========================================
  // [구역 1] AI가입설계 도우미 안내 카드 관련 초기화 로그
  // ==========================================
  console.log('[AI가입설계 도우미] 안내카드 초기화 완료.');
  // END: SECTION_1


  // START: SECTION_2
  // ==========================================
  // [구역 2] 상세설계 / 단순설계 탭 전환 핸들러
  // ==========================================
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabTarget = tab.getAttribute('data-tab');
      currentActiveTab = tabTarget;

      // (1) 모든 탭 버튼 활성화 상태 및 프로퍼티 리셋
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('data-property-1', 'default');
      });
      // 클릭된 탭 활성화
      tab.classList.add('active');
      tab.setAttribute('data-property-1', 'active');

      // (2) 모든 패널 가림 처리 후 대상 패널 노출
      tabPanels.forEach(panel => panel.classList.remove('active'));
      document.getElementById(`panel-${tabTarget}`).classList.add('active');

      showToast(`설계 모드가 변경되었습니다: ${tabTarget === 'detail' ? '상세설계' : '단순설계'}`);
    });
  });
  // END: SECTION_2


  // START: SECTION_3
  // ==========================================
  // [구역 3] 고객명 실시간 검색 인풋 및 상세 정보 카드 제어 로직
  // ==========================================
  
  // (1) 검색창 포커스 인/아웃 시 보더 색상 전환 인터랙션
  customerNameInput.addEventListener('focus', () => {
    searchInputWrapper.classList.add('active-border');
  });

  customerNameInput.addEventListener('blur', () => {
    // 인풋에 검색 글씨가 남아있지 않은 경우에만 보더 원복
    if (!customerNameInput.value.trim()) {
      searchInputWrapper.classList.remove('active-border');
    }
  });

  // (2) 고객 검색어 입력 실시간 판별 핸들러
  customerNameInput.addEventListener('input', () => {
    handleCustomerSearch(customerNameInput.value.trim());
  });

  // (3) 데모 입력 도우미 ("홍길동" 텍스트 자동 주입 기능)
  btnFillDemo.addEventListener('click', () => {
    customerNameInput.value = '홍길동';
    searchInputWrapper.classList.add('active-border'); // 보더 활성화
    customerNameInput.focus(); // 입력 포커싱
    handleCustomerSearch('홍길동'); // 검색 판단 로직 가동
  });

  // (4) 신규고객등록 & 가입설계동의 버튼 클릭 연동
  btnNewCustomer.addEventListener('click', () => {
    showToast('신규고객등록 팝업창을 호출합니다.');
  });

  btnConsent.addEventListener('click', () => {
    showToast('모바일 가입설계 동의 카카오톡 전송을 요청했습니다.');
  });
  // END: SECTION_3


  // (5) 고객명 검색어 판별 제어 함수
  function handleCustomerSearch(query) {
    const staticCard = document.getElementById('client-static-card');

    // START: SECTION_5
    // ==========================================
    // [구역 5] 피보험자 카드 활성/비활성 비주얼 제어 로직 (정적 추가 연동)
    // ==========================================
    if (query === '홍길동') {
      // 홍길동 입력 시 카드 하이라이트 활성화
      staticCard.classList.add('active-card');
      staticCard.classList.remove('inactive-card');
      searchEmptyBox.classList.add('hidden');
    } else if (query === '') {
      // 공백 시 원래 상태로 복원
      staticCard.classList.remove('active-card', 'inactive-card');
      searchEmptyBox.classList.add('hidden');
    } else {
      // 다른 이름 입력 시 카드 흐리게 처리하고 에러 피드백 노출
      staticCard.classList.add('inactive-card');
      staticCard.classList.remove('active-card');
      searchEmptyBox.classList.remove('hidden');
    }
    // END: SECTION_5
  }


  // START: SECTION_4
  // ==========================================
  // [구역 4] AI설계 시작하기 바텀 고정 버튼 클릭 핸들러
  // ==========================================
  btnStartDesign.addEventListener('click', () => {
    if (currentActiveTab === 'detail') {
      const queryName = customerNameInput.value.trim();
      
      if (queryName === '홍길동') {
        showToast('홍길동 고객님의 상세 AI 가입설계를 진행합니다.');
      } else if (queryName === '') {
        showToast('먼저 조회할 고객명을 입력하거나 단순설계 탭으로 진행하세요.');
        customerNameInput.focus();
      } else {
        showToast('검색된 고객이 미등록 상태입니다. 고객등록을 먼저 완료하세요.');
      }
    } else {
      showToast('단순설계 기반 가상 AI 가입설계를 시작합니다.');
    }
  });
  // END: SECTION_4


  // ==========================================
  // [공통 유틸리티 영역]
  // ==========================================

  // 화면 하단 토스트 팝업 띄우기 함수
  function showToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastText.textContent = message;
    toast.classList.add('show');

    // 3초 후 자동 소멸
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

});
