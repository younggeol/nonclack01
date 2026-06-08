/* ==========================================
   [소스 코드 뷰어 동작 - inspector.js]
   이 스크립트는 목록 페이지를 제외한 하위 페이지들에 탑재되어,
   동적으로 HTML, CSS, JS 소스 코드를 불러오고 화면에 표시해 줍니다.
   (구역별 자세히보기 클릭 시 해당 마커 사이의 코드만 추출해 표기하는 파서 포함)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 0. 구역별 독립 소스 보기 배지(.btn-inspect)가 페이지 내에 존재하는지 감지
  const inspectButtons = document.querySelectorAll('.btn-inspect');
  const hasSectionBadges = inspectButtons.length > 0;
  
  let activeSection = null; // 현재 열린 특정 코드 구역 구분자 (예: SECTION_1)

  // 1. 공통 스타일시트(inspector.css) 동적 주입
  const isSubpage = window.location.pathname.includes('/pages/');
  const assetsPath = isSubpage ? '../assets/' : './assets/';
  const pagesPrefix = isSubpage ? '' : 'pages/';

  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = `${assetsPath}css/inspector.css`;
  document.head.appendChild(styleLink);

  // 2. 소스 파일들의 URL 정보 획득
  const currentUrl = window.location.href; // HTML 소스용 현재 URL
  const path = window.location.pathname;
  const fileName = path.substring(path.lastIndexOf('/') + 1); // 파일명 (예: page01.html)
  const baseName = fileName.replace('.html', ''); // 확장자 제외 파일명 (예: page01)

  const cssUrl = `${baseName}.css`; // 1:1 대응되는 CSS 파일 경로
  const jsUrl = `${baseName}.js`;   // 1:1 대응되는 JS 파일 경로

  // 3. 소스 데이터를 저장할 객체
  const sources = {
    html: { content: '', loaded: false, title: 'HTML 소스' },
    css: { content: '', loaded: false, title: 'CSS 소스' },
    js: { content: '', loaded: false, title: 'JS 소스' }
  };

  // 4. 소스 뷰어 UI 구조 동적 빌드 및 화면 삽입
  createInspectorUI();

  // 5. DOM 요소 참조 가져오기
  const overlay = document.querySelector('.inspector-drawer-overlay');
  const drawer = document.querySelector('.inspector-drawer');
  const closeBtn = document.querySelector('.inspector-close-btn');
  const copyBtn = document.querySelector('.inspector-copy-btn');
  const copyTooltip = document.querySelector('.copy-tooltip');
  const tabs = document.querySelectorAll('.inspector-tab');
  const codePanels = {
    html: document.getElementById('code-html'),
    css: document.getElementById('code-css'),
    js: document.getElementById('code-js')
  };

  let currentTab = 'html'; // 현재 활성화된 탭 ('html', 'css', 'js')

  // 6. 이벤트 바인딩
  if (hasSectionBadges) {
    // (A) [구역별 보기 모드] 각각의 구역 소스 단추 클릭 시 실행
    inspectButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        activeSection = btn.getAttribute('data-section'); // 예: 'SECTION_1'
        const type = btn.getAttribute('data-type'); // 'html', 'css', 'js'
        openDrawer(type);
      });
    });
  } else {
    // (B) [전역 보기 모드] 하단 플로팅 독 버튼들 클릭 시 실행
    document.querySelectorAll('.inspector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSection = null; // 전역 모드이므로 구역 필터링 해제
        const type = btn.getAttribute('data-type');
        openDrawer(type);
      });
    });
  }

  // 7. 닫기 버튼 및 오버레이 클릭 시 서랍 닫기
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // 8. 서랍 내 탭(HTML/CSS/JS) 클릭 시 전환 처리
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const type = tab.getAttribute('data-tab');
      switchTab(type);
    });
  });

  // 9. 복사 버튼 클릭 이벤트
  copyBtn.addEventListener('click', () => {
    const activePanel = document.querySelector('.inspector-code-panel.active');
    if (!activePanel) return;

    // 복사할 텍스트 추출 (구문강조용 span 태그가 제거된 원본 내부 텍스트)
    const rawCode = activePanel.textContent;

    navigator.clipboard.writeText(rawCode).then(() => {
      copyTooltip.classList.add('show');
      setTimeout(() => {
        copyTooltip.classList.remove('show');
      }, 1500);
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
    });
  });

  // ==========================================
  // [내부 헬퍼 함수 정의 영역]
  // ==========================================

  // (1) UI 생성 함수
  function createInspectorUI() {
    // 하단 플로팅 독 (전역 소스보기 모드일 때만 동적 생성)
    let dockHtml = '';
    if (!hasSectionBadges) {
      dockHtml = `
        <div class="source-inspector-dock">
          <button class="inspector-btn" data-type="html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span>소스자세히보기</span>
          </button>
          <button class="inspector-btn" data-type="css">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>CSS 자세히보기</span>
          </button>
          <button class="inspector-btn" data-type="js">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6"/><path d="M8 6L2 12l6 6"/></svg>
            <span>JS 자세히보기</span>
          </button>
        </div>
      `;
    }

    // 소스 뷰어 Drawer 서랍 및 암막 오버레이 생성
    const drawerHtml = `
      <div class="inspector-drawer-overlay"></div>
      <div class="inspector-drawer">
        <div class="inspector-drawer-header">
          <div class="inspector-tabs">
            <div class="inspector-tab" data-tab="html">HTML</div>
            <div class="inspector-tab" data-tab="css">CSS</div>
            <div class="inspector-tab" data-tab="js">JavaScript</div>
          </div>
          <div class="inspector-header-actions">
            <span class="copy-tooltip">복사 완료!</span>
            <button class="inspector-action-btn inspector-copy-btn" title="코드 클립보드 복사">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            </button>
            <button class="inspector-action-btn inspector-close-btn" title="닫기">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="inspector-drawer-content">
          <pre id="code-html" class="inspector-code-panel"></pre>
          <pre id="code-css" class="inspector-code-panel"></pre>
          <pre id="code-js" class="inspector-code-panel"></pre>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dockHtml + drawerHtml);
  }

  // 서랍 열기
  function openDrawer(tabType) {
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    switchTab(tabType);
  }

  // 서랍 닫기
  function closeDrawer() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  // 탭 변경 처리 및 리렌더링
  function switchTab(tabType) {
    currentTab = tabType;

    // (1) 모든 탭 버튼 비활성화 후 선택 탭 활성화
    tabs.forEach(t => {
      if (t.getAttribute('data-tab') === tabType) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    // (2) 모든 코드 패널 비활성화 후 선택 패널 활성화
    Object.keys(codePanels).forEach(key => {
      if (key === tabType) {
        codePanels[key].classList.add('active');
      } else {
        codePanels[key].classList.remove('active');
      }
    });

    // (3) 리소스가 이미 메모리에 로드된 경우 즉시 렌더링 갱신 (클릭 구역 변경 대응)
    if (sources[tabType].loaded) {
      renderPanel(tabType, sources[tabType].content);
    } else {
      loadSource(tabType);
    }
  }

  // 비동기 통신 파일 다운로드
  function loadSource(type) {
    let targetUrl = '';
    if (type === 'html') targetUrl = currentUrl;
    else if (type === 'css') targetUrl = cssUrl;
    else if (type === 'js') targetUrl = jsUrl;

    const panel = codePanels[type];
    panel.innerHTML = '<span class="code-comment">// 소스 코드를 불러오는 중입니다...</span>';

    fetch(targetUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`파일을 불러오지 못했습니다. (HTTP 상태코드: ${response.status})`);
        }
        return response.text();
      })
      .then(text => {
        sources[type].content = text;
        sources[type].loaded = true;
        renderPanel(type, text);
      })
      .catch(err => {
        panel.innerHTML = `<span class="code-comment">// 오류 발생: ${err.message}\n// 파일이 존재하지 않거나 로컬 환경(file://) 보안 제한으로 인해 통신이 차단되었을 수 있습니다.\n// 이 경우 로컬 웹 서버(예: Live Server 등)에서 확인해 주셔야 합니다.</span>`;
      });
  }

  // 코드 슬라이싱 가공 후 구문강조 출력 렌더링 함수
  function renderPanel(type, fullText) {
    const panel = codePanels[type];
    let codeToShow = fullText;

    // 특정 구역 소스 보기 모드인 경우 해당 영역만 슬라이스 처리
    if (activeSection) {
      codeToShow = extractSectionCode(fullText, activeSection, type);
    }

    panel.innerHTML = highlightCode(codeToShow, type);
  }

  // 파일 내에서 특정 구역 주석 마커 사이의 코드만 추출해주는 함수
  function extractSectionCode(text, section, type) {
    let startMarker = '';
    let endMarker = '';

    if (type === 'html') {
      startMarker = `<!-- START: ${section} -->`;
      endMarker = `<!-- END: ${section} -->`;
    } else if (type === 'css') {
      startMarker = `/* START: ${section} */`;
      endMarker = `/* END: ${section} */`;
    } else if (type === 'js') {
      // JS 한줄 주석용 마커
      startMarker = `// START: ${section}`;
      endMarker = `// END: ${section}`;
      
      // 파일 내에 한줄 주석 마커가 없을 경우 블록 주석 마커로 2차 검사
      if (!text.includes(startMarker)) {
        startMarker = `/* START: ${section} */`;
        endMarker = `/* END: ${section} */`;
      }
    }

    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
      // 마커 태그 뒷부분부터 종료 마커 앞부분까지 잘라내기
      return text.substring(startIndex + startMarker.length, endIndex).trim();
    }
    
    // 만약 파일 내에 해당 마커가 존재하지 않는다면 전체 텍스트 반환 (안전 장치)
    return text;
  }

  // 정규식 기반 구문 강조 (Syntax Highlight) 엔진
  function highlightCode(code, type) {
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (type === 'html') {
      escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="code-comment">$1</span>');
      escaped = escaped.replace(/(=)(\s*&quot;.*?&quot;|=?\s*'.*?')/g, '$1<span class="code-string">$2</span>');
      escaped = escaped.replace(/(\s[a-zA-Z0-9-]+)(?=\s|=)/g, '<span class="code-attr">$1</span>');
      escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="code-tag">$1</span>');
      escaped = escaped.replace(/(\/?&gt;)/g, '<span class="code-tag">$1</span>');

    } else if (type === 'css') {
      escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');
      escaped = escaped.replace(/([a-zA-Z0-9-._#*:+~>()[\]=\s]+)(?=\s*\{)/g, '<span class="code-selector">$1</span>');
      escaped = escaped.replace(/(:\s*[^;{}]+)/g, (match) => {
        return ': <span class="code-value">' + match.substring(1).trim() + '</span>';
      });
      escaped = escaped.replace(/([a-zA-Z0-9-]+)(?=\s*:)/g, '<span class="code-attr">$1</span>');

    } else if (type === 'js') {
      escaped = escaped.replace(/(&quot;.*?&quot;|'.*?'|`[\s\S]*?`)/g, '<span class="code-string">$1</span>');
      escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');
      escaped = escaped.replace(/(\/\/[^\n]*)/g, '<span class="code-comment">$1</span>');

      const keywords = [
        'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 
        'while', 'switch', 'case', 'break', 'class', 'new', 'import', 
        'export', 'default', 'async', 'await', 'try', 'catch', 'throw'
      ];
      const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
      escaped = escaped.replace(keywordRegex, '<span class="code-keyword">$1</span>');
      escaped = escaped.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

      const builtins = ['document', 'window', 'console', 'addEventListener', 'fetch', 'setTimeout', 'querySelectorAll', 'querySelector'];
      const builtinRegex = new RegExp(`\\b(${builtins.join('|')})\\b`, 'g');
      escaped = escaped.replace(builtinRegex, '<span class="code-builtin">$1</span>');
    }

    return escaped;
  }

});
