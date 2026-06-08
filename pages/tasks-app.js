/* ==========================================
   [대화형 태스크 매니저 동작 - tasks-app.js]
   이 스크립트는 오늘 날짜 자동 표기, 로컬 스토리지 연동,
   새 항목 추가/선택 취소/삭제 기능 및 필터 탭 교체 시의
   동적 DOM 리렌더링 비즈니스 로직을 포함합니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DOM 요소 획득
  const currentDateEl = document.getElementById('current-date'); // 날짜 표시기
  const taskForm = document.getElementById('task-form'); // 입력 폼
  const taskInput = document.getElementById('task-input'); // 텍스트 입력창
  const taskListEl = document.getElementById('task-list'); // 리스트 ul
  const emptyStateEl = document.getElementById('empty-state'); // 빈화면 div
  const leftCountEl = document.getElementById('left-count'); // 남은 개수 표시기
  const btnClear = document.getElementById('btn-clear'); // 완료 삭제 버튼
  const filterTabs = document.querySelectorAll('.filter-tab'); // 필터 탭들

  // 2. 초기 상태 변수 및 더미 데이터 선언
  let tasks = []; // 할 일 객체 어레이
  let currentFilter = 'all'; // 현재 활성화된 필터 탭 ('all', 'active', 'completed')

  // 3. 앱 구동 초기화 함수 실행
  initApp();

  // ==========================================
  // [초기화 및 데이터 바인딩 영역]
  // ==========================================

  function initApp() {
    // (1) 오늘 날짜 표시 갱신 (예: 2026년 6월 8일 월요일)
    updateCurrentDate();

    // (2) 로컬 스토리지에서 기존 할 일 데이터 복구
    const savedTasks = localStorage.getItem('tasks-app-data');
    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
    } else {
      // 데이터가 아예 없을 때 첫 경험을 돕는 가이드용 더미 할 일 3가지 세팅
      tasks = [
        { id: 1, text: '글래스모피즘 디자인 시안 분석하기', completed: true },
        { id: 2, text: 'CSS 미디어 쿼리 속성 다듬기', completed: false },
        { id: 3, text: '소스 코드 뷰어 위젯 정상 작동 여부 점검', completed: false }
      ];
      saveTasksToStorage();
    }

    // (3) 화면에 할 일 리스트 렌더링
    renderTasks();

    // (4) 각 폼 제출 및 컨트롤러 이벤트 연동
    taskForm.addEventListener('submit', handleAddTask);
    btnClear.addEventListener('click', handleClearCompleted);
    
    // 필터 탭 클릭 이벤트 바인딩
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // 기존 탭 활성화 클래스 이전 처리
        document.querySelector('.filter-tab.active').classList.remove('active');
        tab.classList.add('active');

        // 필터링 상태값 갱신 후 리렌더링
        currentFilter = tab.getAttribute('data-filter');
        renderTasks();
      });
    });
  }

  // ==========================================
  // [이벤트 핸들러 함수 영역]
  // ==========================================

  // (1) 새 할 일 등록 기능
  function handleAddTask(e) {
    e.preventDefault(); // 폼 전송 시 새로고침 동작 차단

    const text = taskInput.value.trim();
    if (!text) return;

    // 새로운 할 일 객체 구조 설계
    const newTask = {
      id: Date.now(), // 고유 ID로 타임스탬프 밀리초 사용
      text: text,
      completed: false
    };

    // 상태 어레이에 병합 후 입력창 청소
    tasks.push(newTask);
    taskInput.value = '';

    // 데이터 저장 후 화면 동기화
    saveTasksToStorage();
    renderTasks();
  }

  // (2) 완료된 항목들만 청소하는 기능
  function handleClearCompleted() {
    // 진행 중인(completed가 false인) 데이터들만 필터링하여 상태값 대체
    tasks = tasks.filter(task => !task.completed);
    
    saveTasksToStorage();
    renderTasks();
  }

  // (3) 할 일 개별 체크박스 상태 토글
  window.toggleTaskStatus = function(id) {
    tasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    saveTasksToStorage();
    renderTasks();
  };

  // (4) 할 일 개별 삭제 기능
  window.deleteTask = function(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasksToStorage();
    renderTasks();
  };

  // ==========================================
  // [화면 그리기 및 기타 가공 영역]
  // ==========================================

  // 상태값을 가공하여 HTML 목록 요소를 동적으로 주입하는 함수
  function renderTasks() {
    // 현재 선택된 필터 탭에 맞게 데이터 걸러내기
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
      filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      filteredTasks = tasks.filter(t => t.completed);
    }

    // 1단계: 기존 리스트 내 목록 제거
    taskListEl.innerHTML = '';

    // 2단계: 필터 결과 할 일이 없을 때 엠티 상태 화면 노출 분기
    if (filteredTasks.length === 0) {
      emptyStateEl.style.display = 'flex';
      taskListEl.style.display = 'none';
    } else {
      emptyStateEl.style.display = 'none';
      taskListEl.style.display = 'flex';

      // 루프를 돌며 동적 HTML 생성 및 삽입
      filteredTasks.forEach(task => {
        const itemHtml = `
          <li class="task-item" id="task-${task.id}">
            <label class="task-checkbox-label">
              <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${task.id})">
              <span class="custom-checkbox">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span class="task-text">${task.text}</span>
            </label>
            <button type="button" class="btn-delete-task" onclick="deleteTask(${task.id})" title="삭제">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </li>
        `;
        taskListEl.insertAdjacentHTML('beforeend', itemHtml);
      });
    }

    // 3단계: 남은 진행중 할 일 개수 요약 정보 연동
    const activeCount = tasks.filter(t => !t.completed).length;
    leftCountEl.textContent = `남은 할 일 ${activeCount}개`;
  }

  // 데이터를 로컬 브라우저 세션에 안전하게 저장하는 함수
  function saveTasksToStorage() {
    localStorage.setItem('tasks-app-data', JSON.stringify(tasks));
  }

  // 기기 시간 기준 한글 날짜 출력 포맷기
  function updateCurrentDate() {
    const today = new Date();
    
    const options = { 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    
    // 한국어 로케일 세팅으로 포맷 추출 (예: "6월 8일 월요일")
    const formatted = today.toLocaleDateString('ko-KR', options);
    currentDateEl.textContent = formatted;
  }

});
