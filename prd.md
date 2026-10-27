# [PRD] 초기 창업가를 위한 경량 워크스페이스 (Vanilla Web MVP)

---

## 1. 프로젝트 개요 (Overview)
- **프로젝트명:** 스타트업 에센셜 워크스페이스 (가칭: SparkRoute Lite)
- **문서 목적:** 복잡한 프레임워크나 외부 라이브러리 없이, 순수 웹 표준 기술(HTML5, CSS3, Vanilla JavaScript)만을 사용하여 초기 창업가에게 꼭 필요한 핵심 기능(3단계 트리 메모, 하위 태스크 지원 3단계 칸반 할 일)을 정의하고 구현 가이드를 제공한다.
- **주요 타겟:** 
  - 아이디어 구상 및 사업 기획을 체계적으로 구조화하려는 초기 창업가
  - 복잡한 툴(노션, 지라 등) 대신 빠르고 가벼운 실행 도구를 원하는 1인 창업가 / 소규모 팀
- **기술 제약:**
  - **순수 웹 스택:** HTML5, CSS3, Vanilla JavaScript (ES6+) 단독 사용
  - **무 프레임워크:** React, Vue, Next.js 등 미사용
  - **데이터 영속성:** 브라우저 `localStorage` 기반 (향후 백엔드 API 연동이 용이한 JSON 구조 채택)
  - **반응형 디자인:** 데스크톱 및 모바일 웹뷰(향후 하이브리드 앱 전환 대비) 지원

---

## 2. 정보 구조 및 레이아웃 (Information Architecture & UI)

### 2.1 데스크톱 레이아웃 (PC)
- **좌측 사이드바 (280px ~ 320px):**
  - 상단: 서비스 로고 및 탭 전환 버튼 (`[메모]`, `[할 일]`)
  - 영역 1: 3단계 트리 뷰 (대분류 > 중분류 > 소분류/문서)
  - 하단: `+ 대분류 추가` 버튼
- **우측 메인 작업 영역 (Flexible):**
  - `[메모 모드 선택 시]`: 문서 제목 입력창, 태그 바, 마크다운/텍스트 본문 편집기
  - `[할 일 모드 선택 시]`: 3개 컬럼의 칸반 보드 (시작 전 / 진행 중 / 완료) + 상단 신규 할 일 추가 바

### 2.2 모바일 레이아웃 (Mobile / Webview)
- 상단 헤더: 햄버거 메뉴(사이드바 토글), 현재 활성 탭 타이틀
- 하단 네비게이션 바(Bottom Tab Bar): `[메모]`, `[할 일]` 탭 고정
- 단일 화면 전환 방식으로 동작 (메모 목록 뷰 ↔ 메모 상세 에디터 뷰)

---

## 3. 핵심 기능 상세 요구사항 (Functional Requirements)

### 3.1 기능 A: 3단계 계층형 트리 메모 (Business Brain)

#### A.1 계층 구조 정의
1. **Level 1 (대분류 - Category):** 사업 전략의 대영역 (예: `사업기획`, `제품개발`, `자금/정부지원`)
2. **Level 2 (중분류 - Folder):** 세부 프로젝트 또는 하위 분류 (예: `1차 MVP 기획`, `외주 미팅`)
3. **Level 3 (소분류/문서 - Document):** 실제 작성되는 개별 메모 문서 (예: `와이어프레임 링크 정리`, `수익모델 초안`)

#### A.2 사용자 동작 및 처리 요구사항
- **생성 (Create):**
  - 최상단 `[+ 대분류 추가]` 클릭 시 Level 1 노드 생성
  - 각 Level 1 노드 우측의 `[+]` 클릭 시 해당 노드 하위에 Level 2 노드 생성
  - 각 Level 2 노드 우측의 `[+]` 클릭 시 해당 노드 하위에 Level 3(문서) 노드 생성
  - Level 3 노드는 더 이상 하위 노드를 가질 수 없음
- **조회 및 토글 (Read & Toggle):**
  - Level 1, Level 2 노드 클릭 시 하위 폴더 접기/펼치기(Accordion/Toggle) 동작
  - Level 3 노드 클릭 시 우측 메인 에디터에 해당 문서의 `title`, `updatedAt`, `content` 로드
- **수정 및 삭제 (Update & Delete):**
  - 노드 이름 더블클릭 또는 우측 설정 아이콘을 통해 이름 변경(Inline edit)
  - 노드 삭제 시 하위 자식 노드가 함께 확인 팝업 후 일괄 삭제
- **본문 편집 (Editor):**
  - 순수 `<textarea>` 또는 `contenteditable` 기반 작성
  - 입력 시 실시간(Debounce 300ms)으로 `localStorage`에 자동 저장
  - 간단한 체크박스 리스트 기능 지원 (문서 내 체크리스트 문법 지원)

---

### 3.2 기능 B: 세부 할 일 지원 3단계 칸반 보드 (Task Roadmap)

#### B.1 상태(Status) 3단계 정의
- **1. 시작 전 (To-Do):** 기획되었으나 아직 착수하지 않은 태스크
- **2. 진행 중 (In Progress):** 현재 리소스를 투입하여 실행 중인 태스크
- **3. 완료 (Done):** 모든 세부 실행 항목이 마무리된 태스크

#### B.2 카드(메인 태스크) 필드 및 요구사항
- **필드 구성:**
  - 제목 (Title, 필수)
  - 우선순위 (Priority: 높음/중간/낮음)
  - 마감일 (Due Date, 선택)
  - 하위 세부 할 일 목록 (Sub-tasks: `Array<{ id, text, isCompleted }>`)
  - 진행률 표시 (Sub-task 완료 수 / 전체 Sub-task 수 기반 프로그레스 바)

#### B.3 사용자 동작 및 처리 요구사항
- **카드 생성:**
  - 상단 빠른 추가 인풋을 통해 '시작 전' 컬럼에 즉시 카드 등록
- **상태 이동 (Move Status):**
  - 카드 하단에 상태 전환 셀렉트박스 또는 드래그 앤 드롭(HTML5 Drag and Drop API)을 통해 `시작 전` ↔ `진행 중` ↔ `완료` 간 이동
- **세부 할 일 (Sub-task) 모달/드로어:**
  - 카드 클릭 시 상세 모달 오픈
  - 세부 항목 인풋 입력 후 엔터 시 체크리스트 항목 추가
  - 체크박스 클릭 시 즉시 완료/미완료 토글 및 상위 카드의 진행률 자동 재계산
- **삭제:** 카드 우측 상단 `X` 버튼 클릭 시 확인 후 삭제

---

## 4. 데이터 모델 설계 (Data Models - JSON for LocalStorage)

외부 DB 없이 브라우저 내에서 안전하게 관리될 수 있도록 정규화된 2개의 저장소 키를 정의합니다.

### 4.1 메모 트리 데이터 (`startup_tree_notes`)
```json
[
  {
    "id": "cat_1",
    "name": "사업기획 (Level 1)",
    "level": 1,
    "isOpen": true,
    "children": [
      {
        "id": "folder_1_1",
        "name": "1차 MVP 정의 (Level 2)",
        "level": 2,
        "isOpen": true,
        "children": [
          {
            "id": "doc_1_1_1",
            "name": "핵심 기능 정의서 (Level 3)",
            "level": 3,
            "content": "# 핵심 기능 정의\n1. 트리 메모\n2. 칸반 할 일",
            "updatedAt": "2026-10-27T17:00:00.000Z"
          }
        ]
      }
    ]
  }
]
```

### 4.2 할 일 데이터 (`startup_tasks`)
```json
[
  {
    "id": "task_1",
    "title": "사업자 등록증 발급 신청",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-10-30",
    "subtasks": [
      { "id": "sub_1", "text": "임대차 계약서 스캔", "isCompleted": true },
      { "id": "sub_2", "text": "홈택스 온라인 신청", "isCompleted": false },
      { "id": "sub_3", "text": "업종코드 확인", "isCompleted": true }
    ],
    "createdAt": "2026-10-27T09:00:00.000Z"
  }
]
```

---

## 5. UI/UX 디자인 및 인터랙션 가이드

1. **디자인 톤앤매너:**
   - 배경: 차분한 Slate/Neutral 그레이 계열 (`#F8FAFC`, `#0F172A`)
   - 폰트: 시스템 기본 산세리프 폰트 스택 (`-apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif`)
   - 상태 컬러:
     - 시작 전: Slate Gray (`#64748B`)
     - 진행 중: Warm Amber/Orange (`#F59E0B`)
     - 완료: Fresh Emerald/Green (`#10B981`)
2. **트리 뷰 인터랙션:**
   - 폴더 노드: 접힘/열림 상태에 따라 회전하는 `▶` / `▼` 아이콘 제공
   - 계층 깊이: CSS `padding-left`를 이용해 계층당 16px씩 들여쓰기 구현
3. **칸반 인터랙션:**
   - 카드가 마우스를 올렸을 때 살짝 뜨는 효과 (`transform: translateY(-2px); box-shadow: ...`)
   - 하위 체크리스트 완료 시 취소선(`text-decoration: line-through`) 및 연한 회색 텍스트 처리

---

## 6. 개발 단계별 구현 순서 (Implementation Checklist)

- [ ] **Step 1: HTML 마크업 뼈대 구축**
  - 사이드바 (트리 영역), 상단 탭 전환 바, 메인 영역(메모 에디터 뷰 / 칸반 뷰) 마크업
- [ ] **Step 2: 기본 CSS 스타일링 & 반응형 구조화**
  - Flexbox/CSS Grid 기반 반응형 2단 레이아웃 구현
  - 3단계 들여쓰기 트리 CSS 클래스 및 칸반 3열 레이아웃 스타일링
- [ ] **Step 3: Storage 유틸리티 모듈 구현 (JS)**
  - `loadData(key)`, `saveData(key, data)` 헬퍼 함수 작성
- [ ] **Step 4: 3단계 트리 뷰 로직 구현 (JS)**
  - 재귀(Recursive) 렌더링 함수 작성
  - L1, L2, L3 노드 추가/삭제/이름수정 이벤트 핸들링
  - L3 선택 시 에디터 로드 및 디바운스 자동 저장
- [ ] **Step 5: 칸반 보드 로직 구현 (JS)**
  - 상태별(To-Do, In-Progress, Done) 컬럼 필터링 렌더링
  - 카드 추가, 상태 변경, 세부 항목(Sub-task) 추가 및 체크박스 토글 로직
- [ ] **Step 6: 통합 테스트 및 모바일 뷰 점검**
  - 브라우저 창 축소 시 반응형 레이아웃 정상 동작 확인
  - 새로고침 후 데이터 유지 여부 확인