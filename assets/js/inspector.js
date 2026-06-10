/* ==========================================
   [소스 코드 뷰어 동작 - inspector.js]
   이 스크립트는 목록 페이지를 제외한 하위 페이지들에 탑재되어,
   동적으로 HTML, CSS, JS 소스 코드를 불러오고 화면에 표시해 줍니다.
   구역별 배지가 있는 페이지는 해당 툴바 아래에 인라인 아코디언 코드 패널을 생성하고,
   배지가 없는 경우 하단 플로팅 독 및 전체화면 바텀 서랍 팝업을 띄우는 폴백 기능을 수행합니다.
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

  const cssUrl = isSubpage ? `../assets/temp/${baseName}.css` : `assets/temp/${baseName}.css`;   // 1:1 대응되는 CSS 파일 경로
  const jsUrl = isSubpage ? `../assets/temp/${baseName}.js` : `assets/temp/${baseName}.js`;     // 1:1 대응되는 JS 파일 경로

  // 3. 소스 데이터를 저장할 객체
  const sources = {
    html: { content: '', loaded: false },
    css: { content: '', loaded: false },
    js: { content: '', loaded: false }
  };

  // 4. 전역/인라인 뷰어 초기 설정 분기
  if (hasSectionBadges) {
    // [구역별 보기 모드] 각 툴바 바로 아래에 인라인 아코디언 코드 패널 생성 및 주입
    initInlineViewers();
  } else {
    // [전역 보기 모드] 하단 플로팅 독 및 오버레이 서랍창 빌드 (폴백 호환성 보장)
    createLegacyDrawerUI();
  }

  // ==========================================
  // [인라인 아코디언 소스 뷰어 관련 로직]
  // ==========================================

  function initInlineViewers() {
    const badges = document.querySelectorAll('.section-code-badge');
    badges.forEach(badge => {
      // 툴바 안의 첫 번째 버튼에서 구역 정보(SECTION_X) 추출
      const sampleBtn = badge.querySelector('.btn-inspect');
      if (!sampleBtn) return;
      const section = sampleBtn.getAttribute('data-section');

      // 툴바 바로 아래(nextSibling)에 삽입될 인라인 코드 패널 마크업 동적 빌드
      const panelHtml = `
        <div class="inline-code-panel" id="panel-${section}" style="display: none;">
          <div class="inline-panel-header">
            <div class="inline-tabs">
              <button type="button" class="inline-tab" data-section="${section}" data-tab="html">HTML</button>
              <button type="button" class="inline-tab" data-section="${section}" data-tab="css">CSS</button>
              <button type="button" class="inline-tab" data-section="${section}" data-tab="js">JS</button>
            </div>
            <div class="inline-actions">
              <span class="inline-copy-tooltip">복사 완료!</span>
              <button type="button" class="inline-action-btn inline-copy-btn" data-section="${section}" title="코드 복사">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-icon"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
              </button>
              <button type="button" class="inline-action-btn inline-close-btn" data-section="${section}" title="닫기">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div class="inline-panel-body">
            <pre class="inline-code-content"></pre>
          </div>
        </div>
      `;
      badge.insertAdjacentHTML('afterend', panelHtml);
    });

    // 구역별 소스 보기 버튼(.btn-inspect) 클릭 핸들러 연동
    inspectButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.getAttribute('data-section');
        const type = btn.getAttribute('data-type');
        toggleInlinePanel(section, type);
      });
    });

    // 동적 생성된 인라인 패널 탭 버튼들의 이벤트 처리
    document.querySelectorAll('.inline-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const section = tab.getAttribute('data-section');
        const type = tab.getAttribute('data-tab');
        switchInlineTab(section, type);
      });
    });

    // 닫기 버튼 이벤트 처리
    document.querySelectorAll('.inline-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.getAttribute('data-section');
        const panel = document.getElementById(`panel-${section}`);
        panel.style.display = 'none';

        // 툴바 내부 모든 버튼의 활성화 상태(active) 리셋
        const badge = panel.previousElementSibling;
        badge.querySelectorAll('.btn-inspect').forEach(b => b.classList.remove('active'));
      });
    });

    // 복사 버튼 이벤트 처리
    document.querySelectorAll('.inline-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.getAttribute('data-section');
        const panel = document.getElementById(`panel-${section}`);
        const codePre = panel.querySelector('.inline-code-content');
        const tooltip = panel.querySelector('.inline-copy-tooltip');

        // 복사할 텍스트 추출 (구문강조용 span 태그가 제거된 텍스트)
        const rawCode = codePre.textContent;

        navigator.clipboard.writeText(rawCode).then(() => {
          tooltip.classList.add('show');
          setTimeout(() => {
            tooltip.classList.remove('show');
          }, 1500);
        }).catch(err => {
          console.error('인라인 코드 복사 실패:', err);
        });
      });
    });
  }

  // 아코디언 패널 토글 함수
  function toggleInlinePanel(section, type) {
    const panel = document.getElementById(`panel-${section}`);
    const badge = panel.previousElementSibling;
    const clickedBtn = badge.querySelector(`.btn-inspect[data-type="${type}"]`);

    // 만약 이미 동일한 패널이 열려 있고 동일 탭 버튼이 활성화된 상태라면 접기(토글 닫기)
    if (panel.style.display === 'block' && clickedBtn.classList.contains('active')) {
      panel.style.display = 'none';
      clickedBtn.classList.remove('active');
      return;
    }

    // 툴바 내부 모든 버튼의 active 리셋 후 현재 클릭한 버튼에 active 주입
    badge.querySelectorAll('.btn-inspect').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');

    // 패널 노출
    panel.style.display = 'block';

    // 해당 패널 탭 활성화 및 렌더링 시작
    switchInlineTab(section, type);
  }

  // 인라인 패널 내에서 탭 전환
  function switchInlineTab(section, type) {
    const panel = document.getElementById(`panel-${section}`);
    const codePre = panel.querySelector('.inline-code-content');

    // 패널 헤더 내부 탭들의 활성화 클래스 스위칭
    panel.querySelectorAll('.inline-tab').forEach(tab => {
      if (tab.getAttribute('data-tab') === type) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    activeSection = section; // 렌더링 슬라이싱용 구역 매핑

    // 데이터가 이미 로드된 경우 즉시 렌더링, 없으면 fetch
    if (sources[type].loaded) {
      const parsedCode = extractSectionCode(sources[type].content, section, type);
      codePre.innerHTML = highlightCode(parsedCode, type);
    } else {
      fetchSourceForInline(section, type);
    }
  }

  // 인라인 뷰어용 비동기 소스 로딩
  function fetchSourceForInline(section, type) {
    let targetUrl = '';
    if (type === 'html') targetUrl = currentUrl;
    else if (type === 'css') targetUrl = cssUrl;
    else if (type === 'js') targetUrl = jsUrl;

    const panel = document.getElementById(`panel-${section}`);
    const codePre = panel.querySelector('.inline-code-content');
    codePre.innerHTML = '<span class="code-comment">// 소스 코드를 불러오는 중입니다...</span>';

    fetch(targetUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        sources[type].content = text;
        sources[type].loaded = true;
        const parsedCode = extractSectionCode(text, section, type);
        codePre.innerHTML = highlightCode(parsedCode, type);
      })
      .catch(err => {
        codePre.innerHTML = `<span class="code-comment">// 오류 발생: ${err.message}\n// 파일이 존재하지 않거나 로컬 실행(file://) 정책 제약으로 인해 발생했을 수 있습니다.\n// 이 경우 로컬 웹 서버 환경(예: VS Code Live Server 등)에서 확인해 주셔야 합니다.</span>`;
      });
  }


  // ==========================================
  // [전역 레거시 서랍 오버레이 관련 로직 (폴백 대응)]
  // ==========================================

  let overlay, drawer, closeBtn, copyBtn, copyTooltip, tabs;
  let codePanels = {};
  let currentTab = 'html';

  function createLegacyDrawerUI() {
    // 하단 플로팅 독 생성
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

    // 서랍 모달 및 오버레이 마크업
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

    // 요소 캐싱
    overlay = document.querySelector('.inspector-drawer-overlay');
    drawer = document.querySelector('.inspector-drawer');
    closeBtn = document.querySelector('.inspector-close-btn');
    copyBtn = document.querySelector('.inspector-copy-btn');
    copyTooltip = document.querySelector('.copy-tooltip');
    tabs = document.querySelectorAll('.inspector-tab');
    codePanels = {
      html: document.getElementById('code-html'),
      css: document.getElementById('code-css'),
      js: document.getElementById('code-js')
    };

    // 플로팅 독 버튼 클릭 이벤트
    document.querySelectorAll('.inspector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSection = null; // 전역 모드이므로 구역 필터링 해제
        const type = btn.getAttribute('data-type');
        openDrawer(type);
      });
    });

    // 닫기 및 탭 연동
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const type = tab.getAttribute('data-tab');
        switchTab(type);
      });
    });

    // 복사 동작
    copyBtn.addEventListener('click', () => {
      const activePanel = document.querySelector('.inspector-code-panel.active');
      if (!activePanel) return;
      const rawCode = activePanel.textContent;
      navigator.clipboard.writeText(rawCode).then(() => {
        copyTooltip.classList.add('show');
        setTimeout(() => copyTooltip.classList.remove('show'), 1500);
      });
    });
  }

  function openDrawer(tabType) {
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    switchTab(tabType);
  }

  function closeDrawer() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  function switchTab(tabType) {
    currentTab = tabType;
    tabs.forEach(t => {
      if (t.getAttribute('data-tab') === tabType) t.classList.add('active');
      else t.classList.remove('active');
    });
    Object.keys(codePanels).forEach(key => {
      if (key === tabType) codePanels[key].classList.add('active');
      else codePanels[key].classList.remove('active');
    });

    if (sources[tabType].loaded) {
      renderPanel(tabType, sources[tabType].content);
    } else {
      loadSource(tabType);
    }
  }

  function loadSource(type) {
    let targetUrl = '';
    if (type === 'html') targetUrl = currentUrl;
    else if (type === 'css') targetUrl = cssUrl;
    else if (type === 'js') targetUrl = jsUrl;

    const panel = codePanels[type];
    panel.innerHTML = '<span class="code-comment">// 소스 코드를 불러오는 중입니다...</span>';

    fetch(targetUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        sources[type].content = text;
        sources[type].loaded = true;
        renderPanel(type, text);
      })
      .catch(err => {
        panel.innerHTML = `<span class="code-comment">// 오류 발생: ${err.message}\n// 로컬 실행 제약 또는 파일이 없습니다. 웹 서버 환경을 사용하세요.</span>`;
      });
  }

  function renderPanel(type, fullText) {
    const panel = codePanels[type];
    let codeToShow = fullText;
    if (activeSection) {
      codeToShow = extractSectionCode(fullText, activeSection, type);
    }
    panel.innerHTML = highlightCode(codeToShow, type);
  }


  // ==========================================
  // [공통 헬퍼 함수 영역 (추출기 & 구문강조 엔진)]
  // ==========================================

  // 특정 구역 주석 마커 사이의 코드만 추출해주는 함수
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
      startMarker = `// START: ${section}`;
      endMarker = `// END: ${section}`;
      
      if (!text.includes(startMarker)) {
        startMarker = `/* START: ${section} */`;
        endMarker = `/* END: ${section} */`;
      }
    }

    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
      return text.substring(startIndex + startMarker.length, endIndex).trim();
    }
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
