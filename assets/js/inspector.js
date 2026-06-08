/* ==========================================
   [소스 코드 뷰어 동작 - inspector.js]
   이 스크립트는 목록 페이지를 제외한 하위 페이지들에 탑재되어,
   동적으로 HTML, CSS, JS 소스 코드를 불러오고 화면에 표시해 줍니다.
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 공통 스타일시트(inspector.css) 동적 주입
  // 현재 페이지의 위치를 감지하여 루트 기준 경로 설정
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
  const fileName = path.substring(path.lastIndexOf('/') + 1); // 파일명 (예: profile-card.html)
  const baseName = fileName.replace('.html', ''); // 확장자 제외 파일명 (예: profile-card)

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
  const dock = document.querySelector('.source-inspector-dock');
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

  // 6. 플로팅 독(Dock)의 각 버튼 클릭 시 소스 뷰어 열기 설정
  document.querySelectorAll('.inspector-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.getAttribute('data-type');
      openDrawer(type);
    });
  });

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

  // 9. 복사 버튼 클릭 이벤트 (클립보드 복사 및 피드백 툴팁 노출)
  copyBtn.addEventListener('click', () => {
    const activePanel = document.querySelector('.inspector-code-panel.active');
    if (!activePanel) return;

    // 내부 텍스트 콘텐츠(구문 강조가 되지 않은 순수 코드) 복사
    const rawCode = activePanel.textContent;

    navigator.clipboard.writeText(rawCode).then(() => {
      // 툴팁 활성화 피드백 제공
      copyTooltip.classList.add('show');
      setTimeout(() => {
        copyTooltip.classList.remove('show');
      }, 1500);
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
    });
  });

  // ==========================================
  // [내부 헬퍼 함수 정의 정의 영역]
  // ==========================================

  // UI 생성 함수
  function createInspectorUI() {
    // (1) 하단 컨트롤러 독 (Floating Dock) 생성
    const dockHtml = `
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

    // (2) 소스 뷰어 Drawer 서랍 및 암막 오버레이 생성
    const drawerHtml = `
      <div class="inspector-drawer-overlay"></div>
      <div class="inspector-drawer">
        <!-- 헤더 영역: 탭메뉴 및 액션버튼 -->
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
        <!-- 본문 영역: 코드 뷰 패널 -->
        <div class="inspector-drawer-content">
          <pre id="code-html" class="inspector-code-panel"></pre>
          <pre id="code-css" class="inspector-code-panel"></pre>
          <pre id="code-js" class="inspector-code-panel"></pre>
        </div>
      </div>
    `;

    // body 태그 마지막에 동적 삽입
    document.body.insertAdjacentHTML('beforeend', dockHtml + drawerHtml);
  }

  // 서랍 열기
  function openDrawer(tabType) {
    overlay.classList.add('open');
    drawer.classList.add('open');
    // 뒤쪽 페이지 콘텐츠 스크롤 차단
    document.body.style.overflow = 'hidden';
    switchTab(tabType);
  }

  // 서랍 닫기
  function closeDrawer() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    // 뒤쪽 페이지 콘텐츠 스크롤 원복 (모바일/태블릿 기준)
    document.body.style.overflow = '';
  }

  // 탭 변경 및 리소스 동적 수집(Fetch)
  function switchTab(tabType) {
    currentTab = tabType;

    // (1) 모든 탭 비활성화 후 선택 탭 활성화
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

    // (3) 해당 리소스 데이터가 아직 로드되지 않은 경우 비동기 Fetch 진행
    if (!sources[tabType].loaded) {
      loadSource(tabType);
    }
  }

  // 비동기 통신을 통한 실제 소스코드 다운로드 및 하이라이팅 처리
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

        // 정규식 기반 자체 구문 강조(Syntax Highlighter) 수행 후 화면 렌더링
        panel.innerHTML = highlightCode(text, type);
      })
      .catch(err => {
        panel.innerHTML = `<span class="code-comment">// 오류 발생: ${err.message}\n// 파일이 존재하지 않거나 로컬 환경(file://) 보안 제한으로 인해 통신이 차단되었을 수 있습니다.\n// 이 경우 로컬 웹 서버(예: Live Server 등)에서 확인해 주셔야 합니다.</span>`;
      });
  }

  // 정규식 기반 구문 강조 (Syntax Highlight) 코어 엔진
  function highlightCode(code, type) {
    // HTML 특수기호 안전 치환 (마크업 인젝션 방지)
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (type === 'html') {
      // 1. 주석 강조: &lt;!-- ... --&gt;
      escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="code-comment">$1</span>');
      
      // 2. 문자열 값 강조 (태그 속성값)
      escaped = escaped.replace(/(=)(\s*&quot;.*?&quot;|=?\s*'.*?')/g, '$1<span class="code-string">$2</span>');
      
      // 3. 태그 속성명 강조
      escaped = escaped.replace(/(\s[a-zA-Z0-9-]+)(?=\s|=)/g, '<span class="code-attr">$1</span>');

      // 4. 태그명 강조: &lt;/?([a-zA-Z0-9:-]+)
      escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="code-tag">$1</span>');
      escaped = escaped.replace(/(\/?&gt;)/g, '<span class="code-tag">$1</span>');

    } else if (type === 'css') {
      // 1. 주석 강조: /* ... */
      escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');

      // 2. 중괄호 앞 셀렉터 강조
      escaped = escaped.replace(/([a-zA-Z0-9-._#*:+~>()[\]=\s]+)(?=\s*\{)/g, '<span class="code-selector">$1</span>');

      // 3. 속성값 및 문자열 강조
      escaped = escaped.replace(/(:\s*[^;{}]+)/g, (match) => {
        return ': <span class="code-value">' + match.substring(1).trim() + '</span>';
      });

      // 4. 속성명 강조
      escaped = escaped.replace(/([a-zA-Z0-9-]+)(?=\s*:)/g, '<span class="code-attr">$1</span>');

    } else if (type === 'js') {
      // 1. 문자열 강조 (쌍따옴표, 홑따옴표, 백틱)
      escaped = escaped.replace(/(&quot;.*?&quot;|'.*?'|`[\s\S]*?`)/g, '<span class="code-string">$1</span>');

      // 2. 주석 강조: // ... 이나 /* ... */
      escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');
      escaped = escaped.replace(/(\/\/[^\n]*)/g, '<span class="code-comment">$1</span>');

      // 3. 예약어/키워드 강조
      const keywords = [
        'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 
        'while', 'switch', 'case', 'break', 'class', 'new', 'import', 
        'export', 'default', 'async', 'await', 'try', 'catch', 'throw'
      ];
      const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
      escaped = escaped.replace(keywordRegex, '<span class="code-keyword">$1</span>');

      // 4. 숫자 강조
      escaped = escaped.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

      // 5. 브라우저 내장 객체/함수 강조
      const builtins = ['document', 'window', 'console', 'addEventListener', 'fetch', 'setTimeout', 'querySelectorAll', 'querySelector'];
      const builtinRegex = new RegExp(`\\b(${builtins.join('|')})\\b`, 'g');
      escaped = escaped.replace(builtinRegex, '<span class="code-builtin">$1</span>');
    }

    return escaped;
  }

});
