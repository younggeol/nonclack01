/* ==========================================
   [신규 퍼블리싱 템플릿 동작 - n_page01.js]
   이 스크립트는 가입설계 기본 정보 폼의 토글식 선택 단추 제어,
   상세설계/단순설계 탭 전환, 상품유형 선택,
   그리고 건강 고지서 질문지에서 '전부 아니오' 일괄 선택 연동을 제어합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 토스트 피드백 요소
  const toast = document.getElementById('page-toast');
  const toastText = document.getElementById('page-toast-text');
  let toastTimeout = null;

  // 1. 설계구분 탭 전환 연동 (상세설계 / 단순설계)
  const designTabs = document.querySelectorAll('.design-tab-button');
  designTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      designTabs.forEach(t => t.setAttribute('data-state', 'inactive'));
      tab.setAttribute('data-state', 'active');
      const text = tab.querySelector('.design-tab-text').textContent;
      showToast(`설계 모드가 전환되었습니다: ${text}`);
    });
  });

  // START: SECTION_1
  // 2. 라디오 버튼 그룹 변경 감지 및 연동 (성별, 직업급수, 운전용도)
  const radioInputs = document.querySelectorAll('.btn-select-item .radio-input');
  radioInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (input.checked) {
        const labelText = input.value;
        
        // 직업급수 선택 시 readonly-box 텍스트 업데이트 연동
        if (input.name === 'grade') {
          const readonlySpan = document.querySelector('.readonly-box span');
          if (readonlySpan) {
            let riskLevel = '선택대기';
            if (input.value === '1급') riskLevel = '1급 (저위험)';
            else if (input.value === '2급') riskLevel = '2급 (중위험)';
            else if (input.value === '3급') riskLevel = '3급 (고위험)';
            readonlySpan.textContent = riskLevel;
          }
        }
        
        showToast(`선택되었습니다: ${labelText}`);
      }
    });
  });
  // END: SECTION_1

  // 3. 상품유형 선택 카드 변경 감지
  const productInputs = document.querySelectorAll('.product-type-card .radio-input');
  productInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (input.checked) {
        showToast(`상품유형 선택: ${input.value}`);
      }
    });
  });

  // START: SECTION_3
  // ==========================================
  // [구역 3] 3번 템플릿: 건강 고지 질문지 및 '전부 아니오' 일괄 선택 제어
  // ==========================================
  const allNoBtn = document.querySelector('.all-no-trigger-btn');
  const questionBlocks = document.querySelectorAll('.question-block');

  // (1) 개별 답변 카드 클릭/변경 이벤트 매핑
  questionBlocks.forEach(block => {
    const radioInputs = block.querySelectorAll('.radio-input');
    radioInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          const card = input.closest('.answer-card-item');
          const label = card.querySelector('.answer-label-text').textContent.trim();
          const qNum = block.querySelector('.question-number').textContent.trim();
          showToast(`${qNum}번 문항 답변 선택: ${label}`);

          // 개별 답변 변화에 따라 상단 [전부 아니오] 버튼 상태 실시간 보정
          updateAllNoButtonState();
        }
      });
    });
  });

  // (2) [전부 아니오] 일괄 선택 버튼 클릭 이벤트 매핑
  if (allNoBtn) {
    allNoBtn.addEventListener('click', () => {
      const currentState = allNoBtn.getAttribute('data-state');
      
      if (currentState === 'selected') {
        // 이미 켜진 경우 -> 전부 해제 (선택 초기화)
        allNoBtn.setAttribute('data-state', 'default');
        questionBlocks.forEach(block => {
          block.querySelectorAll('.radio-input').forEach(input => {
            input.checked = false;
          });
        });
        showToast('질문지 답변 선택을 전부 초기화했습니다.');
      } else {
        // 꺼진 경우 -> 모든 질문의 [아니오] 카드를 On 처리
        allNoBtn.setAttribute('data-state', 'selected');
        questionBlocks.forEach(block => {
          block.querySelectorAll('.radio-input').forEach(input => {
            if (input.value === '아니오') {
              input.checked = true;
            } else {
              input.checked = false;
            }
          });
        });
        showToast('모든 질병 고지 문항에 대해 [아니오]를 선택했습니다.');
      }
    });
  }

  // 개별 답변 상태에 따라 [전부 아니오] 배지 활성여부를 판별해주는 함수
  function updateAllNoButtonState() {
    if (!allNoBtn) return;

    let allNoChecked = true;
    
    questionBlocks.forEach(block => {
      const cards = block.querySelectorAll('.answer-card-item');
      let noCardActive = false;

      cards.forEach(card => {
        const input = card.querySelector('.radio-input');
        const isActive = input && input.checked;
        if (input && input.value === '아니오' && isActive) {
          noCardActive = true;
        }
      });

      // 단 하나라도 '아니오'가 선택되지 않은 문항이 있다면 전체 체크 해제 대상
      if (!noCardActive) {
        allNoChecked = false;
      }
    });

    if (allNoChecked) {
      allNoBtn.setAttribute('data-state', 'selected');
    } else {
      allNoBtn.setAttribute('data-state', 'default');
    }
  }
  // END: SECTION_3


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
