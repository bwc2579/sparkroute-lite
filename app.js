/**
 * SparkRoute Lite - Vanilla JavaScript Application
 * Features:
 * - 3-Level Hierarchical Tree Notes (Business Brain) with Auto-save & Debounce
 * - 3-Status Kanban Board (Task Roadmap) with Sub-tasks & Drag-and-Drop
 * - LocalStorage Persistence
 * - Responsive Layout & Mobile Drawer
 */

(() => {
  'use strict';

  // ==========================================================================
  // Storage Keys & Seed Data
  // ==========================================================================
  const STORAGE_KEYS = {
    TREE_NOTES: 'startup_tree_notes',
    TASKS: 'startup_tasks',
    ACTIVE_DOC_ID: 'startup_active_doc_id',
    ACTIVE_VIEW: 'startup_active_view'
  };

  // Supabase Configuration
  const SUPABASE_CONFIG = {
    URL: 'https://oqdikkojkrxfbmuiwqvv.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZGlra29qa3J4ZmJtdWl3cXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4ODI0NjAsImV4cCI6MjEwNzQ1ODQ2MH0.n_WNtnOr9AevG7ov3NrmUZ02qMO1bHsprcSfuBKXxvw'
  };

  let supabaseClient = null;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
    } catch (e) {
      console.warn('Supabase client init error:', e);
    }
  }

  const DEFAULT_TREE_NOTES = [
    {
      id: 'cat_1',
      name: '1. 사업기획 (전략)',
      level: 1,
      isOpen: true,
      children: [
        {
          id: 'folder_1_1',
          name: '1차 MVP 기획',
          level: 2,
          isOpen: true,
          children: [
            {
              id: 'doc_1_1_1',
              name: '핵심 기능 정의서',
              level: 3,
              content: `# 🚀 SparkRoute Lite MVP 기획서

## 1. 해결하고자 하는 문제
- 초기 창업가는 복잡한 협업 툴(지라, 노션 등) 세팅에 많은 시간을 낭비합니다.
- 단순하면서도 아이디어를 3단계로 구조화하고 실행 태스크를 추적할 경량 워크스페이스가 필요합니다.

## 2. 핵심 가치 제안
- [x] 순수 웹 표준(Vanilla JS) 기반의 가볍고 빠른 로딩
- [x] 3단계 계층형 트리 메모 (전략 > 프로젝트 > 문서)
- [ ] 하위 태스크를 지원하는 직관적인 3단계 칸반 보드
- [ ] 로컬스토리지 기반 안전한 오프라인 우선 데이터 보관

## 3. 회의 메모
- 출시 목표: 2주 내 프로토타입 완료 후 피드백 수렴
- 고객 인터뷰 질문지 사전 준비 필수!`,
              updatedAt: new Date().toISOString()
            },
            {
              id: 'doc_1_1_2',
              name: '비즈니스 모델(BM) 초안',
              level: 3,
              content: `# 💡 비즈니스 모델(BM) 가설

- **타겟 고객:** 초기 1인 창업가, 사이드 프로젝트 팀
- **수익화 방안:**
  - 기본 웹 버전: 무료 오픈
  - 고급 템플릿 및 클라우드 동기화 팩: 유료 구독 모델 검토`,
              updatedAt: new Date().toISOString()
            }
          ]
        },
        {
          id: 'folder_1_2',
          name: '시장 조사 및 인터뷰',
          level: 2,
          isOpen: false,
          children: [
            {
              id: 'doc_1_2_1',
              name: '경쟁사 기능 분석표',
              level: 3,
              content: `# 경쟁사 분석\n\n1. 노션: 자유도가 높으나 초기 러닝커브가 큼\n2. 트렐로: 칸반에 특화되어 있으나 계층형 문서 정리가 취약`,
              updatedAt: new Date().toISOString()
            }
          ]
        }
      ]
    },
    {
      id: 'cat_2',
      name: '2. 자금 및 정부지원사업',
      level: 1,
      isOpen: true,
      children: [
        {
          id: 'folder_2_1',
          name: '예비창업패키지 준비',
          level: 2,
          isOpen: true,
          children: [
            {
              id: 'doc_2_1_1',
              name: '사업계획서 PSST 체크리스트',
              level: 3,
              content: `# 예창패 PSST 요약\n\n- Problem: 문제 인식 및 고객 페인포인트\n- Solution: 우리 제품의 차별화된 해결책\n- Scale-up: 사업화 및 성장 전략\n- Team: 팀 역량 및 전문성`,
              updatedAt: new Date().toISOString()
            }
          ]
        }
      ]
    }
  ];

  const DEFAULT_TASKS = [
    {
      id: 'task_1',
      title: '사업자 등록증 발급 신청',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      subtasks: [
        { id: 'sub_1', text: '임대차 계약서 스캔 및 PDF 준비', isCompleted: true },
        { id: 'sub_2', text: '홈택스 온라인 신청 접수', isCompleted: false },
        { id: 'sub_3', text: '업종코드 표준분류 확인 (소프트웨어 개발)', isCompleted: true }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_2',
      title: '법인 통장 및 OTP 발급',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      subtasks: [
        { id: 'sub_4', text: '필요 서류(인감증명서, 등기부등본) 구비', isCompleted: false },
        { id: 'sub_5', text: '주거래 은행 영업점 방문 예약', isCompleted: false }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_3',
      title: 'MVP 와이어프레임 설계',
      status: 'done',
      priority: 'high',
      dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      subtasks: [
        { id: 'sub_6', text: '화면 흐름도(User Flow) 정의', isCompleted: true },
        { id: 'sub_7', text: '3단계 트리 구조 UI 설계', isCompleted: true }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  // ==========================================================================
  // Storage Helper
  // ==========================================================================
  const Storage = {
    get(key, defaultValue) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('Storage get error:', e);
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Storage set error:', e);
      }
    }
  };

  // ==========================================================================
  // App State
  // ==========================================================================
  const state = {
    treeNotes: Storage.get(STORAGE_KEYS.TREE_NOTES, DEFAULT_TREE_NOTES),
    tasks: Storage.get(STORAGE_KEYS.TASKS, DEFAULT_TASKS),
    activeDocId: Storage.get(STORAGE_KEYS.ACTIVE_DOC_ID, 'doc_1_1_1'),
    activeView: Storage.get(STORAGE_KEYS.ACTIVE_VIEW, 'memo'), // 'memo' | 'task'
    editingModalTaskId: null,
    draggedTaskId: null,
    saveDebounceTimer: null
  };

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const DOM = {
    // Layout & Navigation
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileActiveViewTitle: document.getElementById('mobileActiveViewTitle'),
    desktopCloudSync: document.getElementById('desktopCloudSync'),
    mobileCloudSync: document.getElementById('mobileCloudSync'),
    tabMemoBtn: document.getElementById('tabMemoBtn'),
    tabTaskBtn: document.getElementById('tabTaskBtn'),
    mobileTabMemo: document.getElementById('mobileTabMemo'),
    mobileTabTask: document.getElementById('mobileTabTask'),
    memoView: document.getElementById('memoView'),
    taskView: document.getElementById('taskView'),

    // Tree Navigation
    treeContainer: document.getElementById('treeContainer'),
    btnAddCategory: document.getElementById('btnAddCategory'),

    // Memo Editor
    memoEditorContainer: document.getElementById('memoEditorContainer'),
    memoEmptyState: document.getElementById('memoEmptyState'),
    btnEmptyAddDoc: document.getElementById('btnEmptyAddDoc'),
    editorBreadcrumb: document.getElementById('editorBreadcrumb'),
    docTitleInput: document.getElementById('docTitleInput'),
    docContentTextarea: document.getElementById('docContentTextarea'),
    saveStatus: document.getElementById('saveStatus'),
    editorUpdatedAt: document.getElementById('editorUpdatedAt'),
    btnInsertChecklist: document.getElementById('btnInsertChecklist'),
    btnInsertHeading: document.getElementById('btnInsertHeading'),
    btnInsertBullet: document.getElementById('btnInsertBullet'),

    // Kanban Board
    quickAddForm: document.getElementById('quickAddForm'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    taskPrioritySelect: document.getElementById('taskPrioritySelect'),
    taskDueDateInput: document.getElementById('taskDueDateInput'),
    dropzoneTodo: document.getElementById('dropzoneTodo'),
    dropzoneInProgress: document.getElementById('dropzoneInProgress'),
    dropzoneDone: document.getElementById('dropzoneDone'),
    countTodo: document.getElementById('countTodo'),
    countInProgress: document.getElementById('countInProgress'),
    countDone: document.getElementById('countDone'),

    // Modal
    taskModal: document.getElementById('taskModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalSaveCloseBtn: document.getElementById('modalSaveCloseBtn'),
    modalDeleteTaskBtn: document.getElementById('modalDeleteTaskBtn'),
    modalStatusBadge: document.getElementById('modalStatusBadge'),
    modalPriorityBadge: document.getElementById('modalPriorityBadge'),
    modalTaskTitle: document.getElementById('modalTaskTitle'),
    modalTaskStatus: document.getElementById('modalTaskStatus'),
    modalTaskPriority: document.getElementById('modalTaskPriority'),
    modalTaskDueDate: document.getElementById('modalTaskDueDate'),
    modalProgressBar: document.getElementById('modalProgressBar'),
    modalProgressText: document.getElementById('modalProgressText'),
    modalAddSubtaskForm: document.getElementById('modalAddSubtaskForm'),
    newSubtaskInput: document.getElementById('newSubtaskInput'),
    modalSubtaskList: document.getElementById('modalSubtaskList'),

    // Toast
    toast: document.getElementById('toast')
  };

  // ==========================================================================
  // Toast Helper
  // ==========================================================================
  let toastTimer = null;
  function showToast(message) {
    if (!DOM.toast) return;
    DOM.toast.textContent = message;
    DOM.toast.classList.remove('hidden');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      DOM.toast.classList.add('hidden');
    }, 2400);
  }

  // ==========================================================================
  // Supabase Cloud Sync
  // ==========================================================================
  function setCloudSyncStatus(status, text) {
    const pills = [DOM.desktopCloudSync, DOM.mobileCloudSync];
    pills.forEach(pill => {
      if (!pill) return;
      pill.className = `cloud-sync-pill ${status}`;
      pill.textContent = text;
    });
  }

  async function syncFromSupabase() {
    if (!supabaseClient) {
      setCloudSyncStatus('offline', '☁️ 로컬');
      return;
    }

    try {
      setCloudSyncStatus('syncing', '☁️ 동기화 중');

      // 1. Fetch Tree Notes
      const { data: treeRow, error: treeErr } = await supabaseClient
        .from('sparkroute_tree_notes')
        .select('*')
        .eq('id', 'default_workspace')
        .maybeSingle();

      if (!treeErr && treeRow && treeRow.data && Array.isArray(treeRow.data) && treeRow.data.length > 0) {
        state.treeNotes = treeRow.data;
        Storage.set(STORAGE_KEYS.TREE_NOTES, state.treeNotes);
        renderTree();
        loadActiveDocument();
      } else if (!treeRow) {
        // Push initial local tree data to Supabase
        await supabaseClient
          .from('sparkroute_tree_notes')
          .upsert({ id: 'default_workspace', data: state.treeNotes });
      }

      // 2. Fetch Tasks
      const { data: taskRows, error: taskErr } = await supabaseClient
        .from('sparkroute_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!taskErr && taskRows && taskRows.length > 0) {
        state.tasks = taskRows.map(row => ({
          id: row.id,
          title: row.title,
          status: row.status,
          priority: row.priority || 'medium',
          dueDate: row.due_date || '',
          subtasks: row.subtasks || [],
          createdAt: row.created_at
        }));
        Storage.set(STORAGE_KEYS.TASKS, state.tasks);
        renderKanbanBoard();
      } else if (taskRows && taskRows.length === 0 && state.tasks.length > 0) {
        // Push initial local tasks to Supabase
        const rows = state.tasks.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          due_date: t.dueDate,
          subtasks: t.subtasks,
          created_at: t.createdAt
        }));
        await supabaseClient.from('sparkroute_tasks').upsert(rows);
      }

      setCloudSyncStatus('synced', '☁️ 동기화됨');
    } catch (err) {
      console.warn('Supabase sync error:', err);
      setCloudSyncStatus('offline', '☁️ 오프라인');
    }
  }

  let cloudDebounceTimer = null;
  function triggerCloudSync() {
    if (!supabaseClient) return;
    setCloudSyncStatus('syncing', '☁️ 저장 중...');
    clearTimeout(cloudDebounceTimer);

    cloudDebounceTimer = setTimeout(async () => {
      try {
        // 1. Sync tree notes
        await supabaseClient
          .from('sparkroute_tree_notes')
          .upsert({
            id: 'default_workspace',
            data: state.treeNotes,
            updated_at: new Date().toISOString()
          });

        // 2. Sync tasks
        if (state.tasks.length > 0) {
          const rows = state.tasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            due_date: t.dueDate,
            subtasks: t.subtasks,
            updated_at: new Date().toISOString()
          }));
          await supabaseClient.from('sparkroute_tasks').upsert(rows);
        }

        setCloudSyncStatus('synced', '☁️ 동기화됨');
      } catch (err) {
        console.warn('Cloud sync save failed:', err);
        setCloudSyncStatus('offline', '☁️ 로컬');
      }
    }, 600);
  }

  // ==========================================================================
  // Mode / Tab Switching
  // ==========================================================================
  function switchView(mode) {
    state.activeView = mode;
    Storage.set(STORAGE_KEYS.ACTIVE_VIEW, mode);

    const isMemo = mode === 'memo';

    // Desktop sidebar tab styles
    DOM.tabMemoBtn.classList.toggle('active', isMemo);
    DOM.tabTaskBtn.classList.toggle('active', !isMemo);

    // Mobile bottom nav styles
    DOM.mobileTabMemo.classList.toggle('active', isMemo);
    DOM.mobileTabTask.classList.toggle('active', !isMemo);

    // View panels
    DOM.memoView.classList.toggle('active', isMemo);
    DOM.taskView.classList.toggle('active', !isMemo);

    // Mobile header title
    DOM.mobileActiveViewTitle.textContent = isMemo ? '트리 메모' : '칸반 할 일';

    // Close mobile drawer if open
    closeMobileSidebar();

    // Re-render kanban on view switch to ensure layout freshness
    if (!isMemo) {
      renderKanbanBoard();
    }
  }

  function toggleMobileSidebar() {
    DOM.sidebar.classList.toggle('open');
    DOM.sidebarOverlay.classList.toggle('active');
  }

  function closeMobileSidebar() {
    DOM.sidebar.classList.remove('open');
    DOM.sidebarOverlay.classList.remove('active');
  }

  // ==========================================================================
  // Tree Traversal & Search Helpers
  // ==========================================================================
  function findNodeAndParent(nodes, targetId, parent = null) {
    for (const node of nodes) {
      if (node.id === targetId) {
        return { node, parent, list: nodes };
      }
      if (node.children && node.children.length > 0) {
        const found = findNodeAndParent(node.children, targetId, node);
        if (found) return found;
      }
    }
    return null;
  }

  function findFirstDocNode(nodes) {
    for (const node of nodes) {
      if (node.level === 3) return node;
      if (node.children && node.children.length > 0) {
        const found = findFirstDocNode(node.children);
        if (found) return found;
      }
    }
    return null;
  }

  function getNodeBreadcrumbs(nodes, targetId, path = []) {
    for (const node of nodes) {
      const currentPath = [...path, node.name];
      if (node.id === targetId) {
        return currentPath;
      }
      if (node.children && node.children.length > 0) {
        const found = getNodeBreadcrumbs(node.children, targetId, currentPath);
        if (found) return found;
      }
    }
    return null;
  }

  // ==========================================================================
  // Feature A: 3-Level Hierarchical Tree Logic
  // ==========================================================================
  function renderTree() {
    DOM.treeContainer.innerHTML = '';
    if (!state.treeNotes || state.treeNotes.length === 0) {
      DOM.treeContainer.innerHTML = `
        <div style="padding: 16px 8px; text-align: center; color: var(--slate-400); font-size: 0.82rem;">
          등록된 대분류가 없습니다.<br>하단의 <strong>+ 대분류 추가</strong>를 클릭하세요.
        </div>
      `;
      return;
    }

    state.treeNotes.forEach(node => {
      DOM.treeContainer.appendChild(createTreeNodeElement(node));
    });
  }

  function createTreeNodeElement(node) {
    const wrapper = document.createElement('div');
    wrapper.className = `tree-node-wrapper tree-level-${node.level}`;
    wrapper.dataset.id = node.id;

    const item = document.createElement('div');
    item.className = 'tree-node-item';
    if (node.id === state.activeDocId && node.level === 3) {
      item.classList.add('active');
    }

    // Toggle Icon (for level 1 and 2)
    let toggleIconHtml = '';
    if (node.level < 3) {
      const isOpenClass = node.isOpen ? 'open' : '';
      toggleIconHtml = `<span class="tree-toggle-icon ${isOpenClass}">▶</span>`;
    } else {
      toggleIconHtml = `<span class="tree-toggle-icon" style="opacity: 0.2;">•</span>`;
    }

    // Node Type Icon
    let nodeIcon = '📄';
    if (node.level === 1) nodeIcon = '📁';
    if (node.level === 2) nodeIcon = '📂';

    // Actions Buttons
    let actionsHtml = '';
    if (node.level === 1) {
      actionsHtml = `
        <button class="tree-action-btn add-btn" title="중분류 추가" data-action="add-child">+</button>
        <button class="tree-action-btn edit-btn" title="이름 변경" data-action="rename">✎</button>
        <button class="tree-action-btn delete-btn" title="삭제" data-action="delete">✕</button>
      `;
    } else if (node.level === 2) {
      actionsHtml = `
        <button class="tree-action-btn add-btn" title="문서(소분류) 추가" data-action="add-child">+</button>
        <button class="tree-action-btn edit-btn" title="이름 변경" data-action="rename">✎</button>
        <button class="tree-action-btn delete-btn" title="삭제" data-action="delete">✕</button>
      `;
    } else {
      actionsHtml = `
        <button class="tree-action-btn edit-btn" title="이름 변경" data-action="rename">✎</button>
        <button class="tree-action-btn delete-btn" title="삭제" data-action="delete">✕</button>
      `;
    }

    item.innerHTML = `
      <div class="tree-node-main">
        ${toggleIconHtml}
        <span class="tree-node-icon">${nodeIcon}</span>
        <span class="tree-node-label" title="${escapeHtml(node.name)}">${escapeHtml(node.name)}</span>
      </div>
      <div class="tree-node-actions">
        ${actionsHtml}
      </div>
    `;

    // Click behavior
    item.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        e.stopPropagation();
        const action = actionBtn.dataset.action;
        handleNodeAction(action, node);
        return;
      }

      // If level 1 or 2: toggle fold/unfold
      if (node.level < 3) {
        node.isOpen = !node.isOpen;
        Storage.set(STORAGE_KEYS.TREE_NOTES, state.treeNotes);
        renderTree();
      } else {
        // Level 3: select document
        selectDocument(node.id);
        if (window.innerWidth <= 900) {
          closeMobileSidebar();
        }
      }
    });

    // Double-click to rename
    item.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      startInlineRename(node, item);
    });

    wrapper.appendChild(item);

    // Render children for level 1 & 2
    if (node.level < 3 && node.children) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = `tree-children ${node.isOpen ? '' : 'collapsed'}`;
      node.children.forEach(child => {
        childrenContainer.appendChild(createTreeNodeElement(child));
      });
      wrapper.appendChild(childrenContainer);
    }

    return wrapper;
  }

  function handleNodeAction(action, node) {
    if (action === 'add-child') {
      if (node.level === 1) {
        // Add Level 2 (Folder)
        const name = prompt('새 중분류 폴더 이름을 입력하세요:', '새 프로젝트');
        if (name && name.trim()) {
          const newFolder = {
            id: `folder_${Date.now()}`,
            name: name.trim(),
            level: 2,
            isOpen: true,
            children: []
          };
          if (!node.children) node.children = [];
          node.children.push(newFolder);
          node.isOpen = true;
          saveAndRefreshTree();
          showToast(`'${name.trim()}' 중분류가 추가되었습니다.`);
        }
      } else if (node.level === 2) {
        // Add Level 3 (Document)
        const name = prompt('새 문서 이름을 입력하세요:', '새 기획 문서');
        if (name && name.trim()) {
          const newDoc = {
            id: `doc_${Date.now()}`,
            name: name.trim(),
            level: 3,
            content: `# ${name.trim()}\n\n내용을 작성하세요...`,
            updatedAt: new Date().toISOString()
          };
          if (!node.children) node.children = [];
          node.children.push(newDoc);
          node.isOpen = true;
          saveAndRefreshTree();
          selectDocument(newDoc.id);
          showToast(`'${name.trim()}' 문서가 추가되었습니다.`);
        }
      }
    } else if (action === 'rename') {
      const newName = prompt('변경할 이름을 입력하세요:', node.name);
      if (newName && newName.trim() && newName.trim() !== node.name) {
        node.name = newName.trim();
        saveAndRefreshTree();
        if (state.activeDocId === node.id) {
          DOM.docTitleInput.value = node.name;
          updateBreadcrumb();
        }
        showToast('이름이 변경되었습니다.');
      }
    } else if (action === 'delete') {
      const isLevel3 = node.level === 3;
      const confirmMsg = isLevel3 
        ? `'${node.name}' 문서를 삭제하시겠습니까?`
        : `'${node.name}' 및 하위에 포함된 모든 문서가 함께 삭제됩니다. 계속하시겠습니까?`;

      if (confirm(confirmMsg)) {
        deleteNodeById(node.id);
        saveAndRefreshTree();
        showToast('삭제되었습니다.');
      }
    }
  }

  function startInlineRename(node, itemEl) {
    const labelSpan = itemEl.querySelector('.tree-node-label');
    if (!labelSpan) return;

    const currentName = node.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tree-inline-input';
    input.value = currentName;

    const finishRename = () => {
      const val = input.value.trim();
      if (val && val !== currentName) {
        node.name = val;
        saveAndRefreshTree();
        if (state.activeDocId === node.id) {
          DOM.docTitleInput.value = node.name;
          updateBreadcrumb();
        }
      } else {
        renderTree();
      }
    };

    input.addEventListener('blur', finishRename);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        renderTree();
      }
    });

    labelSpan.replaceWith(input);
    input.focus();
    input.select();
  }

  function deleteNodeById(id) {
    const target = findNodeAndParent(state.treeNotes, id);
    if (!target) return;

    const { list } = target;
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list.splice(index, 1);
    }

    // If the active doc was inside deleted branch, select first available doc or empty
    const activeExists = findNodeAndParent(state.treeNotes, state.activeDocId);
    if (!activeExists) {
      const firstDoc = findFirstDocNode(state.treeNotes);
      if (firstDoc) {
        selectDocument(firstDoc.id);
      } else {
        state.activeDocId = null;
        Storage.set(STORAGE_KEYS.ACTIVE_DOC_ID, null);
        loadActiveDocument();
      }
    }
  }

  function saveAndRefreshTree() {
    Storage.set(STORAGE_KEYS.TREE_NOTES, state.treeNotes);
    renderTree();
    triggerCloudSync();
  }

  // ==========================================================================
  // Memo Editor Logic
  // ==========================================================================
  function selectDocument(docId) {
    state.activeDocId = docId;
    Storage.set(STORAGE_KEYS.ACTIVE_DOC_ID, docId);
    renderTree(); // refresh active highlight
    loadActiveDocument();

    if (state.activeView !== 'memo') {
      switchView('memo');
    }
  }

  function loadActiveDocument() {
    if (!state.activeDocId) {
      showEmptyState();
      return;
    }

    const found = findNodeAndParent(state.treeNotes, state.activeDocId);
    if (!found || found.node.level !== 3) {
      showEmptyState();
      return;
    }

    const doc = found.node;
    DOM.memoEditorContainer.style.display = 'flex';
    DOM.memoEmptyState.classList.add('hidden');

    DOM.docTitleInput.value = doc.name || '';
    DOM.docContentTextarea.value = doc.content || '';
    updateBreadcrumb();
    updateUpdatedAtLabel(doc.updatedAt);
    setSaveStatus('saved');
  }

  function showEmptyState() {
    DOM.memoEditorContainer.style.display = 'none';
    DOM.memoEmptyState.classList.remove('hidden');
  }

  function updateBreadcrumb() {
    if (!state.activeDocId) return;
    const path = getNodeBreadcrumbs(state.treeNotes, state.activeDocId);
    if (!path || path.length === 0) return;

    DOM.editorBreadcrumb.innerHTML = path.map((name, index) => {
      const isLast = index === path.length - 1;
      return `<span class="crumb ${isLast ? 'active' : ''}">${escapeHtml(name)}</span>`;
    }).join('<span class="crumb-separator">/</span>');
  }

  function updateUpdatedAtLabel(isoString) {
    if (!isoString) {
      DOM.editorUpdatedAt.textContent = '';
      return;
    }
    const d = new Date(isoString);
    const formatted = `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    DOM.editorUpdatedAt.textContent = `최근 수정: ${formatted}`;
  }

  function setSaveStatus(status) {
    if (status === 'saving') {
      DOM.saveStatus.className = 'save-badge saving';
      DOM.saveStatus.textContent = '저장 중...';
    } else {
      DOM.saveStatus.className = 'save-badge saved';
      DOM.saveStatus.textContent = '저장됨';
    }
  }

  function triggerAutoSave() {
    setSaveStatus('saving');
    clearTimeout(state.saveDebounceTimer);

    state.saveDebounceTimer = setTimeout(() => {
      if (!state.activeDocId) return;
      const found = findNodeAndParent(state.treeNotes, state.activeDocId);
      if (found && found.node.level === 3) {
        const doc = found.node;
        doc.name = DOM.docTitleInput.value.trim() || '무제 문서';
        doc.content = DOM.docContentTextarea.value;
        doc.updatedAt = new Date().toISOString();

        Storage.set(STORAGE_KEYS.TREE_NOTES, state.treeNotes);
        updateUpdatedAtLabel(doc.updatedAt);
        updateBreadcrumb();
        renderTree();
        setSaveStatus('saved');
        triggerCloudSync();
      }
    }, 300);
  }

  // Toolbar helper actions
  function insertTextAtCursor(textarea, prefix, suffix = '') {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = prefix + selected + suffix;

    textarea.setRangeText(replacement, start, end, 'end');
    textarea.focus();
    triggerAutoSave();
  }

  // ==========================================================================
  // Feature B: 3-Status Kanban Board Logic
  // ==========================================================================
  function renderKanbanBoard() {
    DOM.dropzoneTodo.innerHTML = '';
    DOM.dropzoneInProgress.innerHTML = '';
    DOM.dropzoneDone.innerHTML = '';

    let todoCount = 0;
    let inProgressCount = 0;
    let doneCount = 0;

    state.tasks.forEach(task => {
      const cardEl = createKanbanCardElement(task);
      if (task.status === 'todo') {
        DOM.dropzoneTodo.appendChild(cardEl);
        todoCount++;
      } else if (task.status === 'in_progress') {
        DOM.dropzoneInProgress.appendChild(cardEl);
        inProgressCount++;
      } else if (task.status === 'done') {
        DOM.dropzoneDone.appendChild(cardEl);
        doneCount++;
      }
    });

    DOM.countTodo.textContent = todoCount;
    DOM.countInProgress.textContent = inProgressCount;
    DOM.countDone.textContent = doneCount;
  }

  function createKanbanCardElement(task) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.dataset.id = task.id;

    // Subtasks completion calculation
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.isCompleted).length : 0;
    const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // Priority label & badge class
    const priorityLabels = { high: '높음 🔥', medium: '중간 ⚡', low: '낮음 ☕' };
    const priorityClass = `priority-${task.priority || 'medium'}`;

    // Due date format & overdue check
    let dueDateHtml = '';
    if (task.dueDate) {
      const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
      dueDateHtml = `
        <span class="card-due-date ${isOverdue ? 'overdue' : ''}">
          📅 ${task.dueDate} ${isOverdue ? '(지연)' : ''}
        </span>
      `;
    }

    card.innerHTML = `
      <div class="card-top-bar">
        <span class="badge ${priorityClass}">${priorityLabels[task.priority] || '보통'}</span>
        <button class="card-delete-btn" title="태스크 삭제" data-action="delete">✕</button>
      </div>

      <div class="card-title">${escapeHtml(task.title)}</div>

      ${totalSubtasks > 0 ? `
        <div class="card-subtask-progress">
          <div class="progress-info">
            <span>하위 실행 태스크</span>
            <span>${completedSubtasks}/${totalSubtasks} (${progressPercent}%)</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill ${progressPercent === 100 ? 'done' : ''}" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
      ` : ''}

      <div class="card-meta-row">
        ${dueDateHtml || '<span></span>'}
        <span class="card-detail-hint">상세 / 세부할일 ↗</span>
      </div>

      <div class="card-footer">
        <select class="card-status-select" data-action="change-status">
          <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>시작 전</option>
          <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>진행 중</option>
          <option value="done" ${task.status === 'done' ? 'selected' : ''}>완료</option>
        </select>
        <span style="font-size: 0.72rem; color: var(--slate-400);">드래그 이동 가능</span>
      </div>
    `;

    // Event: Click to open modal
    card.addEventListener('click', (e) => {
      // Don't open if clicked delete or select
      if (e.target.closest('[data-action]')) return;
      openTaskModal(task.id);
    });

    // Event: Delete task
    const deleteBtn = card.querySelector('[data-action="delete"]');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`'${task.title}' 태스크를 삭제하시겠습니까?`)) {
        deleteTask(task.id);
      }
    });

    // Event: Change status select
    const statusSelect = card.querySelector('[data-action="change-status"]');
    statusSelect.addEventListener('change', (e) => {
      e.stopPropagation();
      task.status = e.target.value;
      saveAndRenderTasks();
      showToast('상태가 업데이트되었습니다.');
    });

    // Drag and Drop handlers
    card.addEventListener('dragstart', (e) => {
      state.draggedTaskId = task.id;
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      state.draggedTaskId = null;
      document.querySelectorAll('.column-dropzone').forEach(dz => dz.classList.remove('drag-over'));
    });

    return card;
  }

  function setupKanbanDragAndDrop() {
    const dropzones = [DOM.dropzoneTodo, DOM.dropzoneInProgress, DOM.dropzoneDone];

    dropzones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', (e) => {
        // Remove style when leaving dropzone
        if (!zone.contains(e.relatedTarget)) {
          zone.classList.remove('drag-over');
        }
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain') || state.draggedTaskId;
        const targetStatus = zone.dataset.status;

        if (taskId && targetStatus) {
          const task = state.tasks.find(t => t.id === taskId);
          if (task && task.status !== targetStatus) {
            task.status = targetStatus;
            saveAndRenderTasks();
            const statusNames = { todo: '시작 전', in_progress: '진행 중', done: '완료' };
            showToast(`'${task.title}' 태스크가 [${statusNames[targetStatus]}]으로 이동되었습니다.`);
          }
        }
      });
    });
  }

  function addTask(title, priority, dueDate) {
    const newTask = {
      id: `task_${Date.now()}`,
      title,
      status: 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || '',
      subtasks: [],
      createdAt: new Date().toISOString()
    };

    state.tasks.unshift(newTask);
    saveAndRenderTasks();
    showToast('새 태스크가 추가되었습니다.');
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveAndRenderTasks();
    if (supabaseClient) {
      supabaseClient.from('sparkroute_tasks').delete().eq('id', id).then(() => {});
    }
    showToast('태스크가 삭제되었습니다.');
  }

  function saveAndRenderTasks() {
    Storage.set(STORAGE_KEYS.TASKS, state.tasks);
    renderKanbanBoard();
    triggerCloudSync();
  }

  // ==========================================================================
  // Task Detail & Sub-task Modal Logic
  // ==========================================================================
  function openTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.editingModalTaskId = taskId;

    // Fill form fields
    DOM.modalTaskTitle.value = task.title;
    DOM.modalTaskStatus.value = task.status;
    DOM.modalTaskPriority.value = task.priority || 'medium';
    DOM.modalTaskDueDate.value = task.dueDate || '';

    // Badges
    const priorityLabels = { high: '높음 🔥', medium: '중간 ⚡', low: '낮음 ☕' };
    const statusLabels = { todo: '시작 전', in_progress: '진행 중', done: '완료' };
    DOM.modalPriorityBadge.textContent = priorityLabels[task.priority] || '보통';
    DOM.modalPriorityBadge.className = `badge priority-${task.priority}`;
    DOM.modalStatusBadge.textContent = statusLabels[task.status] || '시작 전';

    // Subtasks
    renderModalSubtasks(task);

    DOM.taskModal.classList.remove('hidden');
    DOM.modalTaskTitle.focus();
  }

  function closeTaskModal() {
    // Save any pending edits
    if (state.editingModalTaskId) {
      const task = state.tasks.find(t => t.id === state.editingModalTaskId);
      if (task) {
        task.title = DOM.modalTaskTitle.value.trim() || task.title;
        task.status = DOM.modalTaskStatus.value;
        task.priority = DOM.modalTaskPriority.value;
        task.dueDate = DOM.modalTaskDueDate.value;
        saveAndRenderTasks();
      }
    }

    state.editingModalTaskId = null;
    DOM.taskModal.classList.add('hidden');
  }

  function renderModalSubtasks(task) {
    DOM.modalSubtaskList.innerHTML = '';
    const subtasks = task.subtasks || [];

    const total = subtasks.length;
    const completed = subtasks.filter(s => s.isCompleted).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    DOM.modalProgressBar.style.width = `${percent}%`;
    if (percent === 100 && total > 0) {
      DOM.modalProgressBar.classList.add('done');
    } else {
      DOM.modalProgressBar.classList.remove('done');
    }
    DOM.modalProgressText.textContent = `${completed} / ${total} (${percent}%)`;

    if (total === 0) {
      DOM.modalSubtaskList.innerHTML = `
        <li style="text-align: center; color: var(--slate-400); font-size: 0.82rem; padding: 12px 0;">
          등록된 세부 할 일이 없습니다. 위 입력창에서 추가해 보세요.
        </li>
      `;
      return;
    }

    subtasks.forEach(sub => {
      const li = document.createElement('li');
      li.className = `subtask-item ${sub.isCompleted ? 'completed' : ''}`;

      li.innerHTML = `
        <div class="subtask-left">
          <input type="checkbox" class="subtask-checkbox" ${sub.isCompleted ? 'checked' : ''}>
          <span class="subtask-text">${escapeHtml(sub.text)}</span>
        </div>
        <button class="subtask-delete-btn" title="삭제">✕</button>
      `;

      // Checkbox Toggle
      const chk = li.querySelector('.subtask-checkbox');
      chk.addEventListener('change', () => {
        sub.isCompleted = chk.checked;
        saveAndRenderTasks();
        renderModalSubtasks(task);
      });

      // Delete Subtask
      const delBtn = li.querySelector('.subtask-delete-btn');
      delBtn.addEventListener('click', () => {
        task.subtasks = task.subtasks.filter(s => s.id !== sub.id);
        saveAndRenderTasks();
        renderModalSubtasks(task);
      });

      DOM.modalSubtaskList.appendChild(li);
    });
  }

  function addSubtask(text) {
    if (!state.editingModalTaskId || !text.trim()) return;
    const task = state.tasks.find(t => t.id === state.editingModalTaskId);
    if (!task) return;

    if (!task.subtasks) task.subtasks = [];
    task.subtasks.push({
      id: `sub_${Date.now()}`,
      text: text.trim(),
      isCompleted: false
    });

    saveAndRenderTasks();
    renderModalSubtasks(task);
    DOM.newSubtaskInput.value = '';
    DOM.newSubtaskInput.focus();
  }

  // ==========================================================================
  // Utility Functions
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function pad2(num) {
    return String(num).padStart(2, '0');
  }

  // ==========================================================================
  // Event Listeners Registration
  // ==========================================================================
  function initEventListeners() {
    // 1. View & Mobile Drawer Toggles
    DOM.tabMemoBtn.addEventListener('click', () => switchView('memo'));
    DOM.tabTaskBtn.addEventListener('click', () => switchView('task'));
    DOM.mobileTabMemo.addEventListener('click', () => switchView('memo'));
    DOM.mobileTabTask.addEventListener('click', () => switchView('task'));

    DOM.mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    DOM.sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // 2. Tree Category Add
    DOM.btnAddCategory.addEventListener('click', () => {
      const name = prompt('새로운 대분류 이름을 입력하세요 (예: 3. 제품개발, 마케팅):', '새 대분류');
      if (name && name.trim()) {
        const newCat = {
          id: `cat_${Date.now()}`,
          name: name.trim(),
          level: 1,
          isOpen: true,
          children: []
        };
        state.treeNotes.push(newCat);
        saveAndRefreshTree();
        showToast(`대분류 '${name.trim()}'가 생성되었습니다.`);
      }
    });

    DOM.btnEmptyAddDoc.addEventListener('click', () => {
      DOM.btnAddCategory.click();
    });

    // 3. Editor Auto-save & Input Listeners
    DOM.docTitleInput.addEventListener('input', triggerAutoSave);
    DOM.docContentTextarea.addEventListener('input', triggerAutoSave);

    // Toolbar Helpers
    DOM.btnInsertChecklist.addEventListener('click', () => {
      insertTextAtCursor(DOM.docContentTextarea, '- [ ] ');
    });
    DOM.btnInsertHeading.addEventListener('click', () => {
      insertTextAtCursor(DOM.docContentTextarea, '### ');
    });
    DOM.btnInsertBullet.addEventListener('click', () => {
      insertTextAtCursor(DOM.docContentTextarea, '• ');
    });

    // Tab key handling inside textarea for code/indentation
    DOM.docContentTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        insertTextAtCursor(DOM.docContentTextarea, '  ');
      }
    });

    // 4. Kanban Quick Add
    DOM.quickAddForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = DOM.taskTitleInput.value.trim();
      const priority = DOM.taskPrioritySelect.value;
      const dueDate = DOM.taskDueDateInput.value;

      if (!title) return;

      addTask(title, priority, dueDate);
      DOM.taskTitleInput.value = '';
      DOM.taskTitleInput.focus();
    });

    // Drag and Drop
    setupKanbanDragAndDrop();

    // 5. Modal Events
    DOM.modalCloseBtn.addEventListener('click', closeTaskModal);
    DOM.modalSaveCloseBtn.addEventListener('click', closeTaskModal);

    DOM.taskModal.addEventListener('click', (e) => {
      if (e.target === DOM.taskModal) {
        closeTaskModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !DOM.taskModal.classList.contains('hidden')) {
        closeTaskModal();
      }
    });

    DOM.modalAddSubtaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addSubtask(DOM.newSubtaskInput.value);
    });

    DOM.modalDeleteTaskBtn.addEventListener('click', () => {
      if (state.editingModalTaskId) {
        if (confirm('이 태스크를 삭제하시겠습니까?')) {
          deleteTask(state.editingModalTaskId);
          closeTaskModal();
        }
      }
    });

    // Modal Live Badge updates on Select changes
    DOM.modalTaskPriority.addEventListener('change', (e) => {
      const priorityLabels = { high: '높음 🔥', medium: '중간 ⚡', low: '낮음 ☕' };
      DOM.modalPriorityBadge.textContent = priorityLabels[e.target.value] || '보통';
      DOM.modalPriorityBadge.className = `badge priority-${e.target.value}`;
    });

    DOM.modalTaskStatus.addEventListener('change', (e) => {
      const statusLabels = { todo: '시작 전', in_progress: '진행 중', done: '완료' };
      DOM.modalStatusBadge.textContent = statusLabels[e.target.value] || '시작 전';
    });
  }

  // ==========================================================================
  // Application Bootstrap
  // ==========================================================================
  function init() {
    initEventListeners();
    renderTree();
    loadActiveDocument();
    renderKanbanBoard();
    switchView(state.activeView);
    syncFromSupabase();
    console.log('⚡ SparkRoute Lite initialized successfully.');
  }

  // Start app on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
