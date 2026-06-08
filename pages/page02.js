/* ==========================================
   [보장분석 결과 안내 동작 - page02.js]
   이 파일은 보장분석 안내 페이지의 전용 동작 스크립트입니다.
   뒤로가기 버튼 클릭 처리 및 초기화 로깅이 포함되어 있으며,
   구역별 소스 조회를 지원하는 SECTION_1, SECTION_2 코드 마커가 적용되어 있습니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const btnBack = document.querySelector('.btn-back'); // 헤더 뒤로가기 버튼
  const toast = document.getElementById('page-toast'); // 토스트 알림창
  const toastText = toast.querySelector('span'); // 토스트 내부 문구
  
  let toastTimeout = null;

  // 2. 뒤로가기 버튼 이벤트 연동 (목록 페이지로 퇴장)
  btnBack.addEventListener('click', () => {
    showToast('목록 페이지로 이동합니다...');
    setTimeout(() => {
      window.location.href = '../index.html'; // 목록 페이지로 바로 이동
    }, 1000);
  });


  // START: SECTION_1
  // ==========================================
  // [구역 1] 보장분석 결과 안내 카드 초기 로그 기록
  // ==========================================
  console.log('[보장분석 결과] 안내카드 로드 완료. 상태 정상.');
  // END: SECTION_1


  // START: SECTION_2
  // ==========================================
  // [구역 2] 사망 및 후유장해 카드 클릭 시 상세 상태 토스트 알림 제공
  // ==========================================
  const deathDisabilityCards = document.querySelectorAll('#death-disability-group .status-card');
  deathDisabilityCards.forEach(card => {
    card.addEventListener('click', () => {
      // 카드의 데이터 속성 파싱
      const cardTitle = card.querySelector('.status-card-title').textContent; // '사망' 또는 '후유장해'
      const statusType = card.getAttribute('data-type'); // '부족' 또는 '충분'

      // 부족/충분에 맞춰 다른 어휘로 피드백 메시지 생성
      let msg = '';
      if (statusType === '부족') {
        msg = `${cardTitle} 보장 금액이 통계 기준치보다 부족합니다. 보장 보강 설계를 추천합니다.`;
      } else {
        msg = `${cardTitle} 보장 자산이 든든하게 준비되어 있습니다. 안심하셔도 좋습니다.`;
      }

      showToast(msg);
    });
  });
  // END: SECTION_2


  // START: SECTION_3
  // ==========================================
  // [구역 3] 진단비 카드 클릭 시 상세 상태 토스트 알림 제공
  // ==========================================
  const diagnosisFeeCards = document.querySelectorAll('#diagnosis-fee-group .status-card');
  diagnosisFeeCards.forEach(card => {
    card.addEventListener('click', () => {
      // 카드의 데이터 속성 파싱
      const cardTitle = card.querySelector('.status-card-title').textContent; // '암', '뇌혈관 질환' 등
      const statusType = card.getAttribute('data-type'); // '부족', '충분' 또는 '미가입'

      // 부족/충분/미가입에 맞춰 다른 어휘로 피드백 메시지 생성
      let msg = '';
      if (statusType === '부족') {
        msg = `${cardTitle} 보장 금액이 부족합니다. 든든한 진단비 마련을 위해 보장을 강화해 보세요.`;
      } else if (statusType === '충분') {
        msg = `${cardTitle} 보장이 충분 상태입니다. 든든하게 준비된 상태이므로 걱정하지 않으셔도 됩니다.`;
      } else if (statusType === '미가입') {
        msg = `${cardTitle} 보장에 아직 가입되어 있지 않습니다. 관련 보장을 추가하는 것을 추천합니다.`;
      } else {
        msg = `${cardTitle} 보장 상태를 확인해 보세요.`;
      }

      showToast(msg);
    });
  });
  // END: SECTION_3


  // START: SECTION_4
  // ==========================================
  // [구역 4] 의료비 · 수술 · 입원 카드 클릭 시 상세 상태 토스트 알림 제공
  // ==========================================
  const medicalSurgeryCards = document.querySelectorAll('#medical-surgery-group .status-card');
  medicalSurgeryCards.forEach(card => {
    card.addEventListener('click', () => {
      // 카드의 데이터 속성 파싱
      // '입원비 (일당)'와 같이 텍스트의 불필요한 줄바꿈 및 다중 공백을 정합화
      const cardTitleText = card.querySelector('.status-card-title').textContent.replace(/\s+/g, ' ').trim();
      const statusType = card.getAttribute('data-type'); // '부족', '충분' 또는 '미가입'

      // 부족/충분/미가입 상태에 따른 한국어 알림 메시지 정의
      let msg = '';
      if (statusType === '부족') {
        msg = `${cardTitleText} 보장이 통계 기준 대비 부족합니다. 의료비 공백이 생기지 않도록 보완이 권장됩니다.`;
      } else if (statusType === '충분') {
        msg = `${cardTitleText} 보장이 안정적으로 충분히 가입되어 있습니다. 든든하게 보호받고 계십니다.`;
      } else if (statusType === '미가입') {
        msg = `${cardTitleText} 보장에 아직 가입되어 있지 않습니다. 예기치 못한 치료 부담에 대비해 보세요.`;
      } else {
        msg = `${cardTitleText} 보장 세부 내용을 확인해 보세요.`;
      }

      showToast(msg);
    });
  });
  // END: SECTION_4


  // START: SECTION_5
  // ==========================================
  // [구역 5] 하단 고정 액션 버튼 클릭 시 토스트 피드백 제공
  // ==========================================
  const bottomActionButtons = document.querySelectorAll('.bottom-action-buttons button');
  bottomActionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const btnType = btn.getAttribute('data-property-1'); // 'secondary' 또는 'primary'
      if (btnType === 'secondary') {
        showToast('테마 및 보험료 선택 옵션을 로드합니다.');
      } else {
        showToast('보장 및 보험료 상세설계 화면으로 진입합니다.');
      }
    });
  });
  // END: SECTION_5


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
