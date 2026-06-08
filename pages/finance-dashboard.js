/* ==========================================
   [금융 요약 대시보드 동작 - finance-dashboard.js]
   이 스크립트는 금액 보이기/숨기기(눈 모양 토글) 상태 분기,
   SVG 차트의 노드 호버 시 툴팁을 해당 좌표에 정렬하여 표시하는 렌더러,
   최근 거래 내역 터치 시의 팝업 피드백 연출을 지원합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const btnBalanceToggle = document.getElementById('btn-balance-toggle'); // 잔액 토글 버튼
  const assetAmountDisplay = document.getElementById('asset-amount-display'); // 잔액 텍스트 표시
  const eyeOpenIcon = document.getElementById('eye-open-icon'); // 눈 뜬 아이콘 SVG
  const eyeClosedIcon = document.getElementById('eye-closed-icon'); // 눈 감은 아이콘 SVG
  
  const chartDots = document.querySelectorAll('.chart-dot'); // SVG 차트 버텍스 점들
  const chartTooltip = document.getElementById('chart-tooltip-el'); // 차트 전용 툴팁 창
  const tooltipDay = chartTooltip.querySelector('.tooltip-day'); // 툴팁 요일 표시 텍스트
  const tooltipVal = chartTooltip.querySelector('.tooltip-val'); // 툴팁 값 표시 텍스트
  
  const transactionItems = document.querySelectorAll('.transaction-item'); // 거래 내역 아이템 목록
  const btnMoreTransactions = document.getElementById('btn-more-transactions'); // 내역 더보기 버튼

  // 2. 초기 상태 변수 세팅
  let isBalanceVisible = true; // 잔액 공개 상태값
  const originalAmount = '₩3,450,200'; // 원래 잔액
  const maskedAmount = '₩ •••••••';   // 비밀 보장 마스킹 잔액

  // 3. 자산 잔액 공개/마스킹 토글 이벤트 처리
  btnBalanceToggle.addEventListener('click', () => {
    isBalanceVisible = !isBalanceVisible;

    if (isBalanceVisible) {
      // (1) 금액 표시 원복 및 아이콘 교체
      assetAmountDisplay.textContent = originalAmount;
      eyeOpenIcon.classList.remove('hidden');
      eyeClosedIcon.classList.add('hidden');
    } else {
      // (2) 금액 마스킹 처리 및 아이콘 교체
      assetAmountDisplay.textContent = maskedAmount;
      eyeOpenIcon.classList.add('hidden');
      eyeClosedIcon.classList.remove('hidden');
    }
  });

  // 4. 주간 소비 SVG 차트 노드(점) 마우스 호버 이벤트 처리
  chartDots.forEach(dot => {
    // 마우스가 점 위에 진입했을 때 (MouseEnter)
    dot.addEventListener('mouseenter', (e) => {
      // (1) 데이터 속성(data-day, data-value)값 추출
      const day = dot.getAttribute('data-day');
      const val = dot.getAttribute('data-value');

      // (2) 툴팁 정보 주입
      tooltipDay.textContent = `${day}요일`;
      tooltipVal.textContent = `₩${val}`;

      // (3) 점의 SVG 내부 좌표(cx, cy) 가져오기
      const cx = parseFloat(dot.getAttribute('cx'));
      const cy = parseFloat(dot.getAttribute('cy'));

      // (4) 반응형 화면 맞춤형 툴팁 좌표 자동 배치 연산
      // SVG viewBox 가로 320, 세로 120을 기준으로 비율(%) 계산 적용
      // 좌우는 패널 가로폭의 cx 비율, 상하는 패널 세로폭의 cy 비율을 환산해 대입
      const leftPercent = (cx / 320) * 100;
      const topPercent = (cy / 120) * 100;

      chartTooltip.style.left = `${leftPercent}%`;
      // 툴팁이 점을 너무 많이 가리지 않도록 Y축 상단 방향으로 약 24% 마진 차감
      chartTooltip.style.top = `${topPercent - 24}%`;
      chartTooltip.style.transform = 'translate(-50%, -50%)';

      // (5) 툴팁 클래스 활성화 (투명도 조절로 서서히 노출)
      chartTooltip.classList.add('show');
    });

    // 마우스가 점 밖으로 탈출했을 때 (MouseLeave)
    dot.addEventListener('mouseleave', () => {
      chartTooltip.classList.remove('show');
    });
  });

  // 5. 최근 거래 목록 내역 클릭 시 상세 요약 팝업 피드백 제공
  transactionItems.forEach(item => {
    item.addEventListener('click', () => {
      // HTML 내부 요소들로부터 세부 정보 파싱
      const txName = item.querySelector('.tx-name').textContent;
      const txDate = item.querySelector('.tx-date').textContent;
      const txAmount = item.querySelector('.tx-amount').textContent;
      const isNegative = item.querySelector('.tx-amount').classList.contains('negative');
      
      const typeLabel = isNegative ? '지출' : '입금';

      // 사용자 체감을 높이기 위한 브라우저 기본 컨펌창 알림 피드백 노출
      alert(`[거래 영수증 상세 내역]\n\n• 거래처명: ${txName}\n• 거래구분: ${typeLabel}\n• 거래일시: ${txDate}\n• 거래금액: ${txAmount}\n\n정상적으로 승인 완료된 거래 정보입니다.`);
    });
  });

  // 6. 더보기 단추 누를 시 안내 피드백
  btnMoreTransactions.addEventListener('click', (e) => {
    e.preventDefault();
    alert('이전 30일간의 추가 금융 거래 목록을 보려면 계좌 비밀번호 또는 생체인증이 필요합니다.');
  });

});
