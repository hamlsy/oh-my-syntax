# Plan 14: Commands Expansion — npm 탭 신설 & 전체 명령어 대보강 (v2 — 전문가 검토 반영)

> **v2**: v1 계획의 UX/데이터 품질 결함 수정.
> **v3**: 기존 10개 데이터 파일 전수 검토 결과 반영 (버그 수정, 중복 제거).

---

## ⚠️ 기존 명령어 전수 검토 결과 (v3 추가)

10개 기존 파일(231개 명령어) 전수 검토. 발견된 이슈를 심각도 순으로 정리.

---

### 🔴 BUG — 명령어 자체가 잘못됨 (수정 필수)

#### 1. `js-debounce` (javascript.json)

**현재 command**:
```
const debounced = setTimeout(() => fn(), {DELAY_MS});
```
**title**: "Simple debounce pattern"
**description**: "Delay function execution until after a pause. Essential for search inputs."

**문제**: 이 코드는 debounce가 아니다. 그냥 단발성 지연 실행이다.
Debounce의 정의는 "여러 번 연속 호출 시, 마지막 호출 후 일정 시간이 지나야 실행되는 함수"다.
이를 위해서는 반드시 `clearTimeout`으로 이전 타이머를 취소해야 한다.
현재 코드는 호출할 때마다 새 타이머를 쌓기만 하므로 debounce가 전혀 아니다.
검색 input에 쓰면 "모든 키입력마다 타이머가 누적"된다 → 완전히 반대 결과.

**수정 내용**:
```javascript
// command 필드 교체
let debounceTimer;
const debounced = (...args) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fn(...args), {DELAY_MS});
};
```
description도 수정: "Every call resets the timer. fn() only fires after calls stop for DELAY_MS. The pattern behind every search input."

---

#### 2. `py-venv-create` (python.json)

**현재 command**:
```
python -m venv {ENV_NAME} && source {ENV_NAME}/bin/activate
```
**현재 platform**: `"all"`

**문제**: `source` 명령어는 Unix(bash/zsh) 전용. Windows에서는 `{ENV_NAME}\Scripts\activate`를 사용한다.
`platform: "all"`로 설정된 명령어가 Windows에서 실행하면 실패한다.

**수정 내용**:
- platform을 `"linux"` (또는 `"macos"`)로 변경
- Windows용 명령어(`py-venv-create-win`) 신규 추가:
  ```
  python -m venv {ENV_NAME} && {ENV_NAME}\Scripts\activate
  ```
  platform: `"windows"`

---

### 🟡 MISLEADING — 명령어는 동작하나 UX를 오해하게 함

#### 3. `win-kill-port` (windows.json)

**현재 command**:
```
netstat -ano | findstr :{PORT} && taskkill /PID {PID} /F
```
**description**: "Two-step port murder on Windows. Find the PID first, then kill it."

**문제**: `&&` 연결로 인해 이 명령어가 PID를 자동으로 파이프해서 한 번에 처리하는 것처럼 보인다.
하지만 `{PID}`는 수동으로 채워야 하는 플레이스홀더다.
실제 실행하면:
1. netstat 결과가 화면에 출력됨
2. `&&` 이후 `taskkill /PID {PID} /F`가 실행되는데 `{PID}`가 리터럴 문자열이라 에러 발생

이미 PowerShell 원라이너 (`win-kill-port-powershell`)가 있으므로, CMD 버전은 첫 번째 단계(PID 확인)만 남기는 것이 맞다.

**수정 내용**:
```json
"command": "netstat -ano | findstr :{PORT}",
"title": "Find PID on port (then use taskkill /PID {PID} /F)",
"description": "Find which process is using a port. Note the PID, then kill it with: taskkill /PID {PID} /F. Or use the PowerShell one-liner below."
```

---

### 🔵 PLAN DUPLICATE — 계획에서 "추가"로 잡았으나 이미 존재하는 명령어

전수 검토 결과, 계획 v2의 "기존 카테고리 보강" 항목 중 일부가 이미 데이터 파일에 존재.
중복 추가 시 동일한 명령어가 검색 결과에 두 번 나타남.

#### Docker — 8개 중 4개가 중복

| 계획 항목 | 상태 | 기존 ID |
|-----------|------|---------|
| `docker compose up -d` | ❌ 중복 | `docker-compose-up` |
| `docker compose down --volumes` | ⚠️ 유사 | `docker-compose-down` (--volumes 없음 → 기존 항목 description 업데이트로 처리) |
| `docker build -t {IMAGE}:{TAG} .` | ❌ 중복 | `docker-build` |
| `docker run --env-file .env` | ✅ 신규 | — |
| `docker stats` | ❌ 중복 | `docker-stats` |
| `docker cp {SRC} {CONTAINER}:{DEST}` | ✅ 신규 | 기존은 컨테이너→로컬 방향만 있음 |
| `docker network ls` | ❌ 중복 | `docker-network-ls` |
| `docker system df` | ✅ 신규 | — |

**→ Docker 실제 신규 추가: 3개** (`docker run --env-file`, `docker cp to container`, `docker system df`)
**→ 기존 수정: 1개** (`docker-compose-down`에 --volumes 옵션 설명 추가)

#### Python — 5개 중 3개가 중복

| 계획 항목 | 상태 | 기존 ID |
|-----------|------|---------|
| `py-dataclass` | ❌ 중복 | `py-dataclass` (완전 동일) |
| `py-pathlib` | ✅ 신규 | — |
| `py-type-hints` | ❌ 중복 | `py-type-hints` (완전 동일) |
| `py-context-manager` | ❌ 중복 | `py-context-manager` (완전 동일) |
| `py-f-string-format` | ✅ 신규 | `py-f-string`이 있지만 포맷 지정자 특화 버전은 없음 |

**→ Python 실제 신규 추가: 2개** (`py-pathlib`, `py-f-string-format`)
**→ venv 플랫폼 분리로 Windows용 1개 추가**

#### JavaScript — `structuredClone` 중복

| 계획 항목 | 상태 | 기존 ID |
|-----------|------|---------|
| `structuredClone` 추가 | ❌ 중복 | `js-deep-clone` (완전 동일) |

**→ JS 실제 신규 추가: 4개** (js-error-handling, js-async-safe, js-object-freeze, js-array-at)

---

### 🟠 OUTDATED — 최신 OS 환경에서 동작 보장 불가

#### 4. `macos-lock-screen` (macos.json)

**현재 command**:
```
/System/Library/CoreServices/Menu\ Extras/User.menu/Contents/Resources/CGSession -suspend
```

**문제**: macOS Sonoma (14, 2023) 이후 `CGSession` 바이너리 경로가 변경되었을 가능성이 높다.
macOS 14에서는 이 경로가 존재하지 않을 수 있다. 대체 명령어:
```
osascript -e 'tell application "System Events" to key code 12 using {control down, command down}'
```
또는 (Ventura+):
```
pmset displaysleepnow
```
(단, `pmset displaysleepnow`는 화면만 끄고 잠금 상태가 아닐 수 있음)

**권고**: macOS Sonoma/Sequoia에서 검증 후 업데이트. 현재는 description에 "macOS 13 Ventura or earlier. May not work on Sonoma+" 경고 추가.

---

### ✅ 이상 없는 파일

| 파일 | 이상 여부 |
|------|-----------|
| linux.json (49) | ✅ 모든 명령어 정확 |
| git.json (30) | ✅ 모든 명령어 정확 |
| docker.json (25) | ✅ 명령어 정확 (계획 중복 이슈만) |
| kubernetes.json (25) | ✅ 모든 명령어 정확 |
| python.json (21) | ⚠️ venv platform 오류, 계획 중복 이슈 |
| windows.json (20) | ⚠️ win-kill-port 오해 유발 |
| macos.json (20) | ⚠️ lock-screen 잠재적 outdated |
| java.json (17) | ✅ 모든 명령어 정확 |
| javascript.json (24) | 🔴 debounce 명령어 버그 |

---

### 수정 필요 파일 목록 (구현 Step 0에 추가)

```
[0-C] src/data/en/javascript.json  — js-debounce command 교체
[0-D] src/data/en/python.json      — py-venv-create platform: "linux" 변경
[0-D] src/data/en/python.json      — py-venv-create-win 신규 추가 (Windows 버전)
[0-E] src/data/en/windows.json     — win-kill-port command 단순화
[0-F] src/data/en/macos.json       — macos-lock-screen description에 OS 버전 경고 추가
[0-G] src/data/ko/*.json           — 위 변경사항에 대응하는 한국어 파일 동기화
```

---

### 정정된 최종 명령어 수 (완료 후)

| 카테고리 | 현재 | 실제 신규 추가 | 완료 후 |
|----------|------|--------------|---------|
| linux | 49 | +10 | **59** |
| git | 30 | +10 | **40** |
| docker | 25 | +3 | **28** |
| kubernetes | 25 | 0 | 25 |
| javascript | 24 | +4 | **28** |
| python | 21 | +3 (pathlib, f-string-format, venv-win) | **24** |
| windows | 20 | +5 | **25** |
| macos | 20 | 0 | 20 |
| java | 17 | 0 | 17 |
| **npm** | 0 | **+25** | **25** |
| **sql** | 0 | **+25** | **25** |
| **vim** | 0 | **+15** | **15** |
| **TOTAL** | **231** | **+100** | **331** |

---

## 0. 현황 분석

### 기존 카테고리 & 명령어 현황

| 카테고리 | 현재 수 | 주요 공백 |
|----------|---------|-----------|
| linux | 49 | SSH 터널링, jq, xargs, tee, ss(netstat 대체) 없음 |
| git | 30 | `git switch`, `git restore`, `git revert`, `git config` 없음 |
| docker | 25 | compose v2, health check 없음 |
| kubernetes | 25 | 현재 충분 |
| javascript | 24 | 최신 ES2022+ 패턴 없음 |
| python | 21 | dataclass, pathlib, typing 없음 |
| windows | 20 | winget, WSL 없음 |
| macos | 20 | 충분 |
| java | 17 | Stream API 부족 |
| **npm** | 0 | **카테고리 자체 없음 — 최우선 신설** |
| **sql** | 0 | **카테고리 자체 없음 — 신설** |
| **vim** | 0 | **신설 (범위 대폭 축소 — 이유 아래 참고)** |

---

## ⚠️ v1 계획에서 수정된 핵심 사항 (반드시 읽을 것)

### [수정 1] Vim — normal-mode 키바인딩 전면 제거

**v1의 문제**: `gg`, `dd`, `yy`, `p`, `Ctrl+V`, `ciw` 등을 vim "명령어"로 포함했음.

**근본적 UX 결함**: ResultCard는 `command` 필드를 `<code>` 블록으로 렌더링하고
**Copy 버튼을 제공**한다. 사용자가 `gg`나 `dd`를 클립보드에 복사하면 무엇을 하는가?
아무 데도 붙여넣기 불가능 — 이것은 **키를 누르는 동작**이지 타이핑하는 명령어가 아니다.

```
현재 앱의 UX: 명령어 찾기 → Copy → 터미널/에디터에 붙여넣기
vim 키바인딩:  gg, dd, yy → 복사해봤자 붙여넣기 불가 → Copy 버튼이 의미없음
```

**수정**: Vim 카테고리는 **ex command 전용** (`:` 으로 시작하거나 타이핑 가능한 것만).
`gg`, `G`, `0`, `$`, `u/Ctrl+R`, `dd`, `yy`, `p`, `ciw`, `diw`, `Ctrl+V` → **전량 제거**.
남기는 것: `:wq`, `:%s/old/new/g`, `:g/pattern/d`, `:set nu` 등 실제로 복사-붙여넣기 가능한 명령.

### [수정 2] npm aliases에서 pnpm/yarn 제거

**v1의 문제**: `npm install`의 aliases에 `"pnpm install"`, `"yarn install"` 포함.

**근본적 UX 결함**: 사용자가 "pnpm install"을 검색 → npm install 명령어 복사 →
pnpm 프로젝트에 붙여넣기 → npm을 사용하게 됨. **잘못된 도구 복사를 유도하는 패턴**.

```
올바른 방향: description 필드에 "pnpm 동등 명령어: pnpm install" 주석으로 안내
잘못된 방향: aliases에 경쟁 도구 명령어를 섞는 것
```

**수정**: aliases는 npm 명령어의 자연어 표현만. 타 패키지 매니저는 description에서 1줄 언급.

### [수정 3] CRA (create-react-app) 제거

**v1의 문제**: `npx create-react-app {NAME}` 추가 예정.

**사실 확인**: CRA는 2023년 공식 deprecated → archived 처리됨.
2026년 기준 CRA를 추천하는 것은 적극적으로 해로운 정보.

**수정**: `npm create vite@latest`로 대체. CRA 항목 삭제.

### [수정 4] 비표준 JS 패턴 제거

**v1의 문제 2개**:

1. `js-pipe-operator`: `value |> fn1 |> fn2` — TC39 Stage 2 Proposal.
   아직 어떤 메이저 브라우저/Node.js에서도 기본 지원 안 됨. Babel 설정 필요.
   "JavaScript 명령어"로 제공하면 사용자가 그대로 쓰다가 SyntaxError.

2. `js-async-error-wrap`: `const [data, err] = await to(promise)` —
   `to()`는 외부 라이브러리 `await-to-js`의 함수. 표준 JS 아님.
   이 명령어를 복사해도 import 없으면 `ReferenceError`.

**수정**: 두 항목 삭제. 아래 대체 항목으로 교체.

### [수정 5] 탭 UI overflow — "확인 필요"가 아닌 명시적 해결책 요구

**v1의 문제**: "CategoryTabs overflow: overflow-x: auto + 스냅 스크롤 확인 필요"로 뭉갰음.

**실제 상황 계산**:
- 현재 11개 탭 × 평균 ~65px = ~715px → 360px 화면에서 이미 355px 오버플로우
- 13개 탭 추가 시 × 평균 ~65px = ~845px → 485px 오버플로우

**현재 CategoryTabs 코드**: `overflow-x-auto scrollbar-hide` — 스크롤은 되지만
**시각적 어포던스 없음**. 사용자는 탭이 더 있다는 걸 모른다.

**수정**: 탭 컨테이너 양 끝에 **fade gradient overlay** 추가를 구현 계획에 포함.
(좌/우 스크롤 가능성 시각화. 별도 React 로직 필요)

---

## 1. 신규 카테고리: npm ✅

### 설계 근거
- 프론트엔드/풀스택 개발자의 일상적 도구
- `npm ci` vs `npm install` 혼동, `npx` 사용법, 버전 범프 플래그는 실제로 매번 검색하는 것들
- JavaScript 카테고리(코드 스니펫)와 명확히 다른 성격 → 별도 탭이 맞다

### 아이콘 & 색상
- Icon: `Package` (Lucide)
- Color: `#cb3837` (npm 공식 브랜드 컬러)

### 추가할 명령어 (25개)

#### 의존성 관리 (8개)
| ID | command | title |
|----|---------|-------|
| npm-install-all | `npm install` | 모든 의존성 설치 |
| npm-install-package | `npm install {PACKAGE}` | 패키지 설치 (--save 기본) |
| npm-install-dev | `npm install {PACKAGE} --save-dev` | 개발 의존성 설치 |
| npm-install-global | `npm install -g {PACKAGE}` | 전역 설치 |
| npm-uninstall | `npm uninstall {PACKAGE}` | 패키지 제거 |
| npm-ci | `npm ci` | CI 클린 설치 (package-lock.json 완전 준수) |
| npm-update | `npm update` | 허용 버전 내 최신으로 업데이트 |
| npm-outdated | `npm outdated` | 구버전 패키지 목록 확인 |

> **npm-ci 설명 중요**: description에 `npm install`과의 차이 명시 필요.
> "Deletes node_modules first, installs exactly from package-lock.json. Never modifies lock file. Always use this in CI/CD."

#### 스크립트 실행 (5개)
| ID | command | title |
|----|---------|-------|
| npm-run-dev | `npm run dev` | 개발 서버 시작 (pnpm dev / yarn dev와 동일) |
| npm-run-build | `npm run build` | 프로덕션 빌드 |
| npm-run-preview | `npm run preview` | 빌드 결과물 로컬 미리보기 |
| npm-run-test | `npm run test` | 테스트 실행 |
| npm-run-lint | `npm run lint` | 린터 실행 |

#### 프로젝트 초기화 (4개) — CRA 제거됨
| ID | command | title |
|----|---------|-------|
| npm-init-yes | `npm init -y` | 기본값으로 package.json 생성 |
| npm-create-vite | `npm create vite@latest {NAME} -- --template react-ts` | Vite + React TS 프로젝트 |
| npm-create-next | `npx create-next-app@latest {NAME} --typescript --tailwind` | Next.js 프로젝트 |
| npm-npx-run | `npx {PACKAGE}@latest` | 설치 없이 패키지 실행 (항상 최신) |

#### 보안 & 감사 (3개)
| ID | command | title |
|----|---------|-------|
| npm-audit | `npm audit` | 취약점 감사 |
| npm-audit-fix | `npm audit fix` | 취약점 자동 수정 (semver 허용 범위 내) |
| npm-audit-fix-force | `npm audit fix --force` | 강제 수정 (BREAKING CHANGE 포함 가능) |

#### 버전 & 배포 (5개)
| ID | command | title |
|----|---------|-------|
| npm-version-patch | `npm version patch` | 패치 버전 올리기 (1.0.0 → 1.0.1) |
| npm-version-minor | `npm version minor` | 마이너 버전 올리기 (1.0.0 → 1.1.0) |
| npm-version-major | `npm version major` | 메이저 버전 올리기 (1.0.0 → 2.0.0) |
| npm-publish | `npm publish --access public` | npm 레지스트리 배포 |
| npm-publish-dry-run | `npm publish --dry-run` | 배포 시뮬레이션 (실제 배포 안 함) |

---

## 2. 신규 카테고리: sql ✅

### 설계 근거
- 백엔드/풀스택 개발자의 필수 도구
- JOIN 종류, CTE, window function은 알면서도 매번 검색하는 것
- MySQL/PostgreSQL/SQLite 공통 문법 위주

### 아이콘 & 색상
- Icon: `Database` (Lucide)
- Color: `#336791` (PostgreSQL 공식 블루)

### ⚠️ SQL 전용 UI 고려사항

**문제**: 현재 ResultCard는 `command` 필드를 `break-all` 인라인 코드로 렌더링.
SQL 쿼리는 단일 행이 70자+ → 텍스트가 모두 한 줄에 뭉쳐 가독성 0.

**해결 방향 (이번 구현 범위)**: SQL 명령어 작성 시 `\n`으로 줄바꿈 삽입.
ResultCard의 `<code>` 블록은 `whitespace-pre-wrap`으로 변경 필요. → **구현 계획 Step 0에 추가**.

### 추가할 명령어 (25개)

#### 기본 CRUD (5개)
```
sql-select           SELECT {COL1}, {COL2} FROM {TABLE} WHERE {CONDITION} LIMIT {N};
sql-insert           INSERT INTO {TABLE} ({COL1}, {COL2}) VALUES ({VAL1}, {VAL2});
sql-update           UPDATE {TABLE} SET {COL} = {VALUE} WHERE {CONDITION};
sql-delete           DELETE FROM {TABLE} WHERE {CONDITION};
sql-upsert-pg        INSERT INTO {TABLE} (...)\nVALUES (...)\nON CONFLICT ({COL})\nDO UPDATE SET {COL} = EXCLUDED.{COL};
```

#### JOIN (4개)
```
sql-inner-join       SELECT a.*, b.*\nFROM {TABLE_A} a\nINNER JOIN {TABLE_B} b ON a.id = b.{FK};
sql-left-join        SELECT a.*, b.*\nFROM {TABLE_A} a\nLEFT JOIN {TABLE_B} b ON a.id = b.{FK};
sql-right-join       SELECT a.*, b.*\nFROM {TABLE_A} a\nRIGHT JOIN {TABLE_B} b ON a.id = b.{FK};
sql-self-join        SELECT a.{COL}, b.{COL}\nFROM {TABLE} a\nJOIN {TABLE} b ON a.{FK} = b.id;
```

#### 집계 & 그룹 (3개)
```
sql-group-by         SELECT {COL}, COUNT(*) AS cnt\nFROM {TABLE}\nGROUP BY {COL}\nORDER BY cnt DESC;
sql-having           SELECT {COL}, COUNT(*) AS cnt\nFROM {TABLE}\nGROUP BY {COL}\nHAVING COUNT(*) > {N};
sql-aggregate        SELECT\n  COUNT(*) AS total,\n  AVG({COL}) AS avg_val,\n  MAX({COL}) AS max_val,\n  MIN({COL}) AS min_val\nFROM {TABLE};
```

#### 고급 쿼리 (5개)
```
sql-cte              WITH cte AS (\n  SELECT * FROM {TABLE} WHERE {CONDITION}\n)\nSELECT * FROM cte;
sql-subquery         SELECT * FROM {TABLE}\nWHERE id IN (\n  SELECT id FROM {OTHER_TABLE} WHERE {CONDITION}\n);
sql-row-number       SELECT\n  *,\n  ROW_NUMBER() OVER (\n    PARTITION BY {COL}\n    ORDER BY {COL2} DESC\n  ) AS rn\nFROM {TABLE};
sql-rank             SELECT\n  *,\n  RANK() OVER (ORDER BY {COL} DESC) AS rank\nFROM {TABLE};
sql-lag-lead         SELECT\n  {COL},\n  LAG({COL}) OVER (ORDER BY {ORDER_COL}) AS prev_val,\n  LEAD({COL}) OVER (ORDER BY {ORDER_COL}) AS next_val\nFROM {TABLE};
```

#### 스키마 관리 (5개)
```
sql-create-table     CREATE TABLE IF NOT EXISTS {TABLE} (\n  id SERIAL PRIMARY KEY,\n  {COL} {TYPE} NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);
sql-alter-add        ALTER TABLE {TABLE} ADD COLUMN {COL} {TYPE};
sql-alter-drop       ALTER TABLE {TABLE} DROP COLUMN IF EXISTS {COL};
sql-create-index     CREATE INDEX CONCURRENTLY idx_{TABLE}_{COL}\nON {TABLE}({COL});
sql-drop-table       DROP TABLE IF EXISTS {TABLE} CASCADE;
```

#### 성능 & 유틸 (3개)
```
sql-explain          EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\nSELECT * FROM {TABLE} WHERE {CONDITION};
sql-transaction      BEGIN;\n{SQL_OPERATIONS};\nCOMMIT;\n-- On error: ROLLBACK;
sql-coalesce         SELECT COALESCE({COL}, {DEFAULT_VALUE}) AS {ALIAS} FROM {TABLE};
```

---

## 3. 신규 카테고리: vim (범위 축소 — ex commands 전용) ✅

### 설계 근거 & 축소 이유

앱의 핵심 UX는 "복사 → 붙여넣기"다. Vim **ex command** (`:wq`, `:%s/...`)는 복사 후
vim의 command line에 붙여넣기 가능 → **Copy 버튼의 가치가 있다**.

반면 normal mode 키바인딩 (`gg`, `dd`, `yy`, `Ctrl+V`)은:
- 키를 물리적으로 누르는 동작
- 클립보드에 복사해도 아무 데도 붙여넣을 수 없음
- Copy 버튼이 근본적으로 의미 없음

→ **ex command 15개만 포함**.

### 아이콘 & 색상
- Icon: `Terminal2` 또는 `Keyboard` (Lucide)
- Color: `#019733` (Vim 공식 그린)

### 추가할 명령어 (15개 — ex commands only)

#### 파일 저장 & 종료 (5개)
```
vim-wq               :wq                    저장 후 종료 (write + quit)
vim-quit-force       :q!                    변경사항 버리고 강제 종료
vim-save             :w                     저장 (종료 없이)
vim-write-sudo       :w !sudo tee %         읽기 전용 파일 sudo로 저장
vim-reload           :e!                    디스크에서 파일 다시 로드 (변경사항 버림)
```

#### 검색 & 치환 (4개)
```
vim-substitute       :%s/{OLD}/{NEW}/g       전체 파일 치환 (확인 없이)
vim-substitute-ask   :%s/{OLD}/{NEW}/gc      전체 파일 치환 (하나씩 확인)
vim-delete-matching  :g/{PATTERN}/d          패턴 매칭 줄 전체 삭제
vim-clear-highlight  :noh                    검색 하이라이트 제거
```

#### 화면 & 설정 (4개)
```
vim-set-number       :set number            줄 번호 표시
vim-set-relativenu   :set relativenumber    상대 줄 번호 (위아래 이동 계산용)
vim-split-h          :sp {FILE}             수평 분할로 파일 열기
vim-split-v          :vsp {FILE}            수직 분할로 파일 열기
```

#### 고급 (2개)
```
vim-yank-all         :%y                    전체 파일 내용 복사 (클립보드로)
vim-goto-line        :{N}                   N번째 줄로 이동
```

---

## 4. 기존 카테고리 보강

### 4-1. Git — +10개

| ID | command | 비고 |
|----|---------|------|
| git-switch-create | `git switch -c {BRANCH}` | 모던 브랜치 생성 (`checkout -b` 대체) |
| git-restore-file | `git restore {FILE}` | 모던 변경 취소 (`checkout --` 대체) |
| git-revert | `git revert {COMMIT_HASH}` | **안전한** 되돌리기 — 새 커밋 생성 |
| git-config-user | `git config --global user.name "{NAME}" && git config --global user.email "{EMAIL}"` | 최초 설정 필수 |
| git-merge-no-ff | `git merge --no-ff {BRANCH}` | 머지 커밋 강제 생성 |
| git-diff-branch | `git diff {BRANCH1}..{BRANCH2}` | 브랜치 간 전체 차이 |
| git-log-file | `git log --follow -p -- {FILE}` | 파일 전체 변경 이력 |
| git-branch-list | `git branch -a` | 로컬 + 원격 브랜치 전체 목록 |
| git-stash-named | `git stash push -m "{MESSAGE}"` | 이름 있는 stash |
| git-last-tag | `git describe --tags --abbrev=0` | 가장 최근 태그 확인 |

### 4-2. Linux — +10개

| ID | command | 비고 |
|----|---------|------|
| linux-jq-parse | `jq '.{KEY}' {FILE}.json` | JSON 필드 추출 |
| linux-jq-pretty | `echo '{JSON}' \| jq '.'` | JSON 예쁘게 출력 |
| linux-xargs | `find {PATH} -name '{PATTERN}' \| xargs {COMMAND}` | find 결과를 명령어에 연결 |
| linux-tee | `{COMMAND} \| tee {FILE}` | stdout 보면서 파일에도 저장 |
| linux-cut | `cut -d '{DELIM}' -f {N} {FILE}` | 구분자로 특정 컬럼 추출 |
| linux-ss | `ss -tulpn` | 현대적 netstat 대체 |
| linux-ssh-tunnel | `ssh -L {LOCAL_PORT}:{REMOTE_HOST}:{REMOTE_PORT} {USER}@{HOST}` | SSH 로컬 포트 포워딩 |
| linux-ssh-tunnel-r | `ssh -R {REMOTE_PORT}:localhost:{LOCAL_PORT} {USER}@{HOST}` | SSH 리버스 터널 |
| linux-printenv | `printenv \| grep {VAR}` | 환경변수 확인 |
| linux-curl-auth | `curl -H "Authorization: Bearer {TOKEN}" {URL}` | Bearer 토큰 인증 요청 |

### 4-3. Docker — +8개

| ID | command | 비고 |
|----|---------|------|
| docker-compose-up | `docker compose up -d` | v2 문법 (하이픈 없음) |
| docker-compose-down | `docker compose down --volumes` | 컨테이너 + 볼륨 삭제 |
| docker-build-tag | `docker build -t {IMAGE}:{TAG} .` | 이미지 빌드 & 태깅 |
| docker-run-env | `docker run --env-file .env {IMAGE}` | .env 파일로 환경변수 주입 |
| docker-stats | `docker stats` | 실시간 컨테이너 리소스 모니터링 |
| docker-copy | `docker cp {SRC} {CONTAINER}:{DEST}` | 파일 컨테이너로 복사 |
| docker-network-ls | `docker network ls` | 도커 네트워크 목록 |
| docker-system-df | `docker system df` | 도커 디스크 사용량 전체 확인 |

### 4-4. JavaScript — +5개 (비표준 2개 제거 후)

| ID | command | 비고 |
|----|---------|------|
| js-error-handling | `try { ... } catch (err) { if (err instanceof {ErrorType}) { ... } }` | 타입 세이프 에러 처리 |
| js-async-safe | `const result = await promise.then(d => ({ data: d, error: null })).catch(e => ({ data: null, error: e }));` | 외부 라이브러리 없는 안전한 async 패턴 |
| js-object-freeze | `const CONFIG = Object.freeze({ {KEY}: {VALUE} });` | 불변 객체 생성 |
| js-array-at | `const last = arr.at(-1);` | 음수 인덱스 배열 접근 (ES2022) |
| js-structured-clone | `const clone = structuredClone(obj);` | 이미 있지만 중요도 상향 — 없으면 추가 |

### 4-5. Python — +5개

| ID | command | 비고 |
|----|---------|------|
| py-dataclass | `@dataclass\nclass {Name}:\n    {field}: {type}\n    {field2}: {type2} = {default}` | 데이터클래스 |
| py-pathlib | `from pathlib import Path\n\npath = Path("{PATH}")\npath.read_text()  # read_bytes(), write_text()` | 모던 경로 처리 |
| py-type-hints | `def {func}({param}: {Type}, /) -> {ReturnType}:\n    ...` | 타입 힌트 (positional-only) |
| py-context-manager | `with open("{FILE}", "r", encoding="utf-8") as f:\n    content = f.read()` | 파일 안전 읽기 |
| py-f-string-format | `f"{value:.2f}"  # 소수점\nf"{value:,}"    # 천단위 구분\nf"{value:>10}"  # 우측 정렬` | f-string 포맷 지정자 |

### 4-6. Windows — +5개

| ID | command | 비고 |
|----|---------|------|
| win-winget-install | `winget install {PACKAGE_ID}` | 패키지 설치 |
| win-wsl-start | `wsl` | WSL 시작 |
| win-wsl-run | `wsl -e {COMMAND}` | WSL에서 단일 명령 실행 |
| win-set-env-perm | `[System.Environment]::SetEnvironmentVariable("{VAR}", "{VAL}", "Machine")` | 영구 환경변수 |
| win-net-port | `netstat -ano \| findstr :{PORT}` | 포트 사용 프로세스 확인 |

---

## 5. 탭 UI overflow — 구체적 해결책 (필수 구현)

### 상황
13개 탭 × 평균 ~65px = ~845px.
360px 모바일에서 485px 오버플로우. 현재 코드: `scrollbar-hide` → 스크롤 가능하지만 **시각적 단서 없음**.

### 해결: Scroll Fade Gradient Overlay

`CategoryTabs.tsx`에 스크롤 위치를 감지하는 로직 추가:

```
상태 관리:
  - canScrollLeft: boolean  (좌측 fade 표시 여부)
  - canScrollRight: boolean (우측 fade 표시 여부)

이벤트:
  - onScroll: scrollLeft > 0 → canScrollLeft = true
  - ResizeObserver or 초기 렌더: scrollWidth > clientWidth → canScrollRight = true

렌더링:
  - 컨테이너를 relative로 감싸고
  - 좌측: absolute left-0 w-8 h-full bg-gradient-to-r from-bg-overlay to-transparent
  - 우측: absolute right-0 w-8 h-full bg-gradient-to-l from-bg-overlay to-transparent
  - canScrollLeft/Right 상태에 따라 AnimatePresence로 fade in/out
```

이 작업은 **데이터 추가 전에 먼저 처리** — 탭이 10개일 때도 이미 모바일에서 문제임.

---

## 6. ResultCard — SQL 다중행 지원 (필수 구현)

### 현재 코드
```tsx
<code className="bg-bg-overlay text-text-primary font-mono text-sm rounded-lg px-3 py-1 leading-tight break-all">
  {command.command}
</code>
```

### 문제
- `break-all`: SQL의 긴 키워드를 임의 위치에서 잘라냄 → 가독성 파괴
- `leading-tight` + `py-1`: 단일행 최적화, 다중행 SQL은 너무 빽빽함

### 수정 방향

명령어가 `\n`을 포함하면 다중행 모드로 렌더링:

```tsx
const isMultiLine = command.command.includes('\n');

<code className={cn(
  'bg-bg-overlay text-text-primary font-mono text-sm rounded-lg px-3 leading-relaxed',
  isMultiLine
    ? 'block py-2 whitespace-pre overflow-x-auto max-h-32'
    : 'inline py-1 break-all whitespace-nowrap'
)}>
  {command.command}
</code>
```

`max-h-32` + `overflow-y: auto`로 너무 긴 SQL은 스크롤 가능하게 제한.

---

## 7. aliases 설계 원칙 (개정)

### 올바른 aliases 전략

1. **자연어 검색**: 사용자가 결과가 아닌 상황으로 검색 가능하게
   - `"address already in use"` → kill port 명령어
   - `"CI clean install"` → npm ci

2. **도구 동의어 금지**: pnpm/yarn 명령어를 npm aliases에 섞지 않음
   - 검색은 되지만 잘못된 도구 명령어를 복사하게 됨
   - description에 "pnpm: `pnpm {equivalent}`" 형태로 안내

3. **오타 & 약어**: 짧은 형태 포함
   - `"npm i"`, `"git co"`, `"git st"`

4. **에러 메시지로 검색**: 실제 마주치는 에러 상황을 alias로
   - `"EACCES permission denied"` → npm global install
   - `"lock file conflict"` → npm ci

### 예시 (npm-install-all)
```json
{
  "aliases": [
    "npm install", "npm i",
    "install dependencies", "install packages",
    "node_modules", "restore packages"
  ],
  "description": "Install all dependencies from package.json. Modifies package-lock.json if needed. pnpm equivalent: pnpm install | yarn equivalent: yarn install"
}
```

---

## 8. 구현 계획 — 변경 파일 & 순서

### Step 0: 선수 작업 (신규 데이터 추가 전 필수)

```
[0-A] CategoryTabs.tsx — scroll fade gradient 추가
      - useRef + onScroll 핸들러
      - canScrollLeft/canScrollRight state
      - 좌우 gradient overlay (AnimatePresence)

[0-B] ResultCard.tsx — 다중행 code 블록 지원
      - isMultiLine 조건 분기
      - whitespace-pre + overflow-x-auto 적용

[0-C] src/data/en/javascript.json — js-debounce 버그 수정
      - command: setTimeout 단발 호출 → clearTimeout + 재설정 패턴으로 교체
      - description: 실제 debounce 동작 설명으로 교체
      ※ src/data/ko/javascript.json 동기화

[0-D] src/data/en/python.json — 두 가지 수정
      (1) py-venv-create: platform "all" → "linux"
      (2) py-venv-create-win 신규 추가 (Windows: Scripts\activate 경로)
      ※ src/data/ko/python.json 동기화

[0-E] src/data/en/windows.json — win-kill-port 정리
      - command에서 && taskkill 부분 제거 (PID 자동 전달 안 됨)
      - description에 "then run: taskkill /PID {PID} /F" 안내 추가
      ※ src/data/ko/windows.json 동기화

[0-F] src/data/en/macos.json — macos-lock-screen 경고 추가
      - description에 "Verified on macOS 13 Ventura. May not work on Sonoma+" 경고
      ※ src/data/ko/macos.json 동기화
```

### Step 1: 타입 & 카테고리 등록

```
[1] src/types/command.ts
    CategoryId에 'npm' | 'sql' | 'vim' 추가

[2] src/data/categories.ts
    3개 카테고리 항목 추가:
    { id: 'npm', labelKey: 'category.npm', icon: 'Package',  color: '#cb3837' }
    { id: 'sql', labelKey: 'category.sql', icon: 'Database', color: '#336791' }
    { id: 'vim', labelKey: 'category.vim', icon: 'Terminal2', color: '#019733' }
```

### Step 2: 번역 파일

```
[3] src/locales/en/translation.json — category 섹션에 npm/sql/vim 추가
[4] src/locales/ko/translation.json — 동일
```

### Step 3: 영문 데이터 (신규)

```
[5] src/data/en/npm.json (25개)
[6] src/data/en/sql.json (25개)
[7] src/data/en/vim.json (15개)
```

### Step 4: 영문 데이터 (기존 보강)

```
[8]  src/data/en/git.json        (+10 → 40개)
[9]  src/data/en/linux.json      (+10 → 59개)
[10] src/data/en/docker.json     (+8  → 33개)
[11] src/data/en/javascript.json (+5  → 29개)
[12] src/data/en/python.json     (+5  → 26개)
[13] src/data/en/windows.json    (+5  → 25개)
```

### Step 5: 영문 로더

```
[14] src/data/en/index.ts — npm/sql/vim import 추가
```

### Step 6: 한국어 데이터

```
[15] src/data/ko/npm.json (25개 — title/description/aliases 한국어)
[16] src/data/ko/sql.json
[17] src/data/ko/vim.json
[18] src/data/ko/git.json       (기존 + 10개 번역)
[19] src/data/ko/linux.json     (기존 + 10개 번역)
[20] src/data/ko/docker.json    (기존 + 8개 번역)
[21] src/data/ko/javascript.json (기존 + 5개 번역)
[22] src/data/ko/python.json    (기존 + 5개 번역)
[23] src/data/ko/windows.json   (기존 + 5개 번역)
```

### Step 7: 한국어 로더

```
[24] src/data/ko/index.ts — npm/sql/vim import 추가
```

---

## 9. 최종 명령어 수 (완료 후)

| 카테고리 | 현재 | 추가 | 완료 후 |
|----------|------|------|---------|
| linux | 49 | +10 | **59** |
| git | 30 | +10 | **40** |
| docker | 25 | +8 | **33** |
| kubernetes | 25 | 0 | 25 |
| javascript | 24 | +5 | **29** |
| python | 21 | +5 | **26** |
| windows | 20 | +5 | **25** |
| macos | 20 | 0 | 20 |
| java | 17 | 0 | 17 |
| **npm** | 0 | **+25** | **25** |
| **sql** | 0 | **+25** | **25** |
| **vim** | 0 | **+15** | **15** |
| **TOTAL** | **231** | **+108** | **339** |

---

## 10. popularity 기준

| 점수 범위 | 의미 | 예시 |
|-----------|------|------|
| 90–100 | 매일 사용 | npm install, npm run dev, git status |
| 80–89 | 주 1–3회 | npm run build, docker ps, git stash |
| 70–79 | 월 1회 이상 | npm publish, git revert, sql JOIN |
| 60–69 | 가끔 필요 | npm dedupe, git sparse-checkout |

---

## 11. 잠재적 리스크 (구체화)

| 리스크 | 심각도 | 해결책 |
|--------|--------|--------|
| 13개 탭 모바일 UX | 높음 | Step 0-A: scroll fade gradient (이번 구현 포함) |
| SQL 다중행 표시 | 중간 | Step 0-B: whitespace-pre + max-h (이번 구현 포함) |
| CategoryId 타입 변경 → exhaustive check | 낮음 | `grep -r "CategoryId"` 후 switch문 확인 |
| 번들 크기 증가 | 낮음 | 108개 명령어 ≈ +45–60KB JSON. Vite 기본 tree-shake로 무방 |
