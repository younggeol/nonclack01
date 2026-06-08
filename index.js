/* ==========================================
   [메인 목록 페이지 동작 - index.js]
   이 스크립트는 포트폴리오 허브 페이지의 카테고리 필터링 탭을 눌렀을 때
   해당 분류에 속하는 작업물 카드만 화면에 필터링해 주는 동적 인터랙션을 제어합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const filterTabs = document.querySelectorAll('.filter-tab'); // 카테고리 필터 버튼들
  const pageCards = document.querySelectorAll('.page-card'); // 작업물 카드 링크들

  // 2. 각 필터 탭 클릭 이벤트 바인딩
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // (1) 현재 활성화된 필터 탭의 하이라이트 클래스 제거
      const currentActiveTab = document.querySelector('.filter-tab.active');
      if (currentActiveTab) {
        currentActiveTab.classList.remove('active');
      }

      // (2) 클릭한 탭을 활성화 상태로 전환
      tab.classList.add('active');

      // (3) 클릭한 탭의 카테고리 필터 기준값 가져오기
      const filterValue = tab.getAttribute('data-filter');

      // (4) 모든 카드들의 카테고리를 대조하여 필터링 수행
      pageCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        // 필터가 'all'(전체보기)이거나, 카드의 카테고리가 필터값과 완벽히 일치하는 경우
        if (filterValue === 'all' || cardCategory === filterValue) {
          // 화면에 노출 처리
          card.classList.remove('hide');
        } else {
          // 화면에서 제외 처리 (CSS display: none)
          card.classList.add('hide');
        }
      });
    });
  });

});
