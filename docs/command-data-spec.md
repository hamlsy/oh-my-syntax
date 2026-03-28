# Command Data Specification

> Oh My Syntax! 프로젝트의 명령어 데이터 구조, 필드 명세, 작성 규칙을 정의한 문서.
> 새 명령어를 추가하거나 기존 명령어를 수정할 때 이 문서를 기준으로 삼는다.

---

## 1. 전체 데이터 아키텍처

```
src/data/
├── categories.ts          # 카테고리 메타데이터 (아이콘, 색상, i18n 키)
├── en/                    # 영문 명령어 데이터 (단일 진실 공급원)
│   ├── index.ts           # 모든 en/*.json을 합쳐 ALL_COMMANDS_EN 배열로 export
│   ├── linux.json
│   ├── git.json
│   ├── docker.json
│   ├── kubernetes.json
│   ├── javascript.json
│   ├── python.json
│   ├── windows.json
│   ├── macos.json
│   ├── java.json
│   └── npm.json           # (신설 예정)
│   └── sql.json           # (신설 예정)
│   └── vim.json           # (신설 예정)
└── ko/                    # 한국어 번역 (title, description, aliases만 오버라이드)
    ├── index.ts           # en을 베이스로 ko를 id 기준으로 머지, ALL_COMMANDS_KO export
    ├── linux.json
    └── ...                # en/과 동일한 파일명
```

### 핵심 원칙

- **`en/` = 단일 진실 공급원**: 명령어의 구조적 데이터(`command`, `id`, `category`, `tags`, `platform`, `popularity`, `isDangerous`, `variables`)는 `en/`에서만 관리.
- **`ko/` = 텍스트 오버라이드**: `title`, `description`, `aliases`만 한국어로 교체. 나머지 필드는 `en`의 것을 그대로 사용.
- **id 기준 머지**: `ko/index.ts`에서 `id`가 일치하면 ko 텍스트로 교체, 없으면 en 텍스트 그대로.

---

## 2. TypeScript 타입 정의

```typescript
// src/types/command.ts

export type CategoryId =
  | 'all'
  | 'linux' | 'macos' | 'windows'
  | 'docker' | 'kubernetes'
  | 'git'
  | 'java' | 'python' | 'javascript'
  | 'npm' | 'sql' | 'vim';

export interface CommandVariable {
  name: string;        // 플레이스홀더 이름 (대문자, 언더스코어 사용)
  defaultValue: string; // 빈 문자열이어도 반드시 포함
  description: string;  // 이 변수가 무엇인지 한 줄 설명
}

export interface Command {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  command: string;
  title: string;
  description: string;
  aliases: string[];
  tags: string[];
  isDangerous?: boolean;
  platform?: 'linux' | 'macos' | 'windows' | 'all';
  popularity?: number;
  variables?: CommandVariable[];
}
```

---

## 3. 영문 데이터 파일 (`en/*.json`)

각 파일은 `Command[]` 배열. 아래는 완전한 예시:

```json
{
  "id": "linux-kill-port",
  "category": "linux",
  "command": "kill -9 $(lsof -ti:{PORT})",
  "title": "Kill process on port",
  "description": "No mercy. Kills whatever dared to squat on your port.",
  "aliases": ["kill port", "port kill", "port 8080", "port occupied", "address already in use"],
  "tags": ["port", "kill", "process", "lsof", "pid"],
  "isDangerous": true,
  "platform": "linux",
  "popularity": 98
}
```

---

## 4. 한국어 데이터 파일 (`ko/*.json`)

`title`, `description`, `aliases` **3개 필드만** 포함. `id`는 en과 반드시 일치해야 한다.

```json
{
  "id": "linux-kill-port",
  "title": "포트 프로세스 강제 종료",
  "description": "자비 없음. 그 포트를 점령한 모든 것을 사살.",
  "aliases": ["포트 죽이기", "kill port", "포트 8080", "포트 사용 중", "address already in use"]
}
```

> ⚠️ `command`, `category`, `tags`, `platform`, `popularity`, `isDangerous`, `variables`는
> ko 파일에 절대 작성하지 않는다. en 값이 자동으로 사용된다.

---

## 5. 필드별 상세 명세

### 5-1. `id` — string (필수)

**형식**: `{category}-{kebab-case-description}`

```
linux-kill-port         ✅
git-stash-save          ✅
docker-compose-up       ✅
npm-install-dev         ✅

linuxKillPort           ❌ (카멜케이스 금지)
kill-port               ❌ (카테고리 접두사 없음)
linux_kill_port         ❌ (언더스코어 금지)
```

**규칙**:
- 소문자 알파벳 + 숫자 + 하이픈만 사용
- 반드시 카테고리명으로 시작
- 프로젝트 전체에서 유일해야 함
- 한 번 배포된 ID는 변경 금지 (최근 복사 기록이 ID로 저장됨)

---

### 5-2. `category` — CategoryId (필수)

유효한 값: `linux` | `macos` | `windows` | `docker` | `kubernetes` | `git` | `java` | `python` | `javascript` | `npm` | `sql` | `vim`

`'all'`은 UI 전용 가상 카테고리. 데이터에 사용 금지.

---

### 5-3. `command` — string (필수)

사용자가 복사해서 그대로 붙여넣을 수 있는 실행 가능한 명령어 또는 코드 스니펫.

**플레이스홀더 문법**: `{UPPER_SNAKE_CASE}`

```json
"command": "kubectl get pods -n {NAMESPACE}"
"command": "git clone --depth 1 {REPO_URL}"
"command": "docker build -t {IMAGE_NAME}:{TAG} ."
```

**다중행**: `\n`으로 줄바꿈 삽입. ResultCard에서 `whitespace-pre`로 렌더링됨.

```json
"command": "with open('{FILENAME}', 'r') as f:\n    content = f.read()"
```

**금지 사항**:
- `...`로 내용을 생략하지 않음 (복사해도 동작 안 함)
- 설명 텍스트를 command 필드에 포함하지 않음
- 플레이스홀더 없이 실제 경로/값을 하드코딩하지 않음 (ex: `kill -9 1234`)

**Vim 카테고리 특례**: ex command(`:wq`, `:%s/...`)만 허용. normal-mode 단축키(`gg`, `dd`)는 복사 불가능하므로 제외.

---

### 5-4. `title` — string (필수)

결과 카드에서 명령어 옆에 굵게 표시되는 짧은 이름.

| 규칙 | 예시 |
|------|------|
| 동사 원형으로 시작 (명령문 형태) | "Kill process on port" ✅ |
| 최대 50자 | — |
| 불필요한 관사(a/the) 생략 권장 | "Remove stopped containers" ✅ |
| 위험 명령어는 "DANGER:" 접두사 | "DANGER: Prune everything" ✅ |

---

### 5-5. `description` — string (필수)

결과 카드의 서브텍스트. 이 앱의 개성을 담는 곳.

| 규칙 | 가이드 |
|------|--------|
| 1–2 문장 | 너무 길면 `line-clamp-2`에 잘림 |
| 개발자 친화적 유머 환영 | "Your team will remember this. Not fondly." |
| 언제/왜 쓰는지 컨텍스트 포함 | "Perfect for the '95% disk full' panic." |
| 위험도 명시 | `isDangerous: true`인 경우 결과를 설명 |
| pnpm/yarn 동등 명령어 안내 | npm 카테고리: "pnpm equivalent: pnpm install" |

---

### 5-6. `aliases` — string[] (필수)

**검색 엔진(fuse.js)이 매칭에 사용하는 핵심 필드.** 사용자가 어떤 단어로 검색할지 예측해서 등록.

#### 영문 aliases 전략 (en/*.json)

```json
"aliases": [
  "kill port",           // 핵심 명령어 이름
  "port kill",           // 역순
  "port 8080",           // 구체적 사용 예시
  "port occupied",       // 상황 묘사
  "address already in use",  // 실제 에러 메시지 ← 매우 효과적
  "port in use"
]
```

| 유형 | 예시 |
|------|------|
| 명령어 핵심 키워드 | `"git stash"`, `"docker ps"` |
| 자연어 동작 설명 | `"save changes temporarily"`, `"install package"` |
| 실제 에러 메시지 | `"address already in use"`, `"permission denied"`, `"EACCES"` |
| 약어/단축형 | `"npm i"`, `"git co"`, `"k8s pods"` |
| 상황 묘사 | `"disk full"`, `"CI clean install"`, `"rollback production"` |

**❌ 금지**: 다른 도구의 명령어를 aliases로 추가 (ex: npm aliases에 `"pnpm install"` 추가 금지)
→ 이유: 사용자가 pnpm 검색 후 npm 명령어를 복사하는 오동작 유발.

**권장 개수**: 영문 4–8개, 한국어 4–8개

#### 한국어 aliases 전략 (ko/*.json)

```json
"aliases": [
  "포트 죽이기",          // 자연어 한국어
  "kill port",           // 영문 핵심어 (영문 검색도 지원)
  "포트 종료",
  "포트 사용 중",         // 상황 묘사 (한국어)
  "address already in use"  // 에러 메시지는 영문 그대로
]
```

> **원칙**: ko aliases는 영문 검색어를 완전히 대체하지 말 것.
> 개발자들은 한국어 UI에서도 `"docker ps"`, `"git stash"` 등 영문 키워드로 검색하므로
> 영문 핵심 키워드 1–2개는 반드시 ko aliases에도 포함.

---

### 5-7. `tags` — string[] (필수)

검색 보조 키워드. aliases보다 짧고 기술적인 단어.

```json
"tags": ["port", "kill", "process", "lsof", "pid"]
```

- 소문자 단어 위주
- 도구명, CLI 플래그명, 기술 용어
- 4–8개 권장
- aliases와 중복 허용 (fuse.js가 가중치 다르게 처리)

---

### 5-8. `isDangerous` — boolean (선택, 기본값 false)

`true`로 설정 시 ResultCard에 빨간 "Danger" 배지 표시.

**true로 설정해야 하는 경우**:
- 되돌릴 수 없는 삭제: `rm -rf`, `docker system prune -a`, `DROP TABLE`
- 데이터 손실 가능: `git reset --hard`, `git clean -fd`
- 보안 위험: `chmod -R 777`, `sudo spctl --master-disable`
- 운영 영향: `kubectl delete namespace`, `git push --force`

**false로 유지하는 경우**:
- 조회/읽기 전용 명령어
- 확인 프롬프트가 있는 명령어
- 되돌릴 수 있는 변경

---

### 5-9. `platform` — 'linux' | 'macos' | 'windows' | 'all' (선택, 기본값 'all')

| 값 | 의미 |
|----|------|
| `"all"` | 모든 플랫폼에서 동작 (git, docker, npm 등) |
| `"linux"` | Linux/Unix 전용. macOS에서도 대부분 동작하지만 Linux 기준 |
| `"macos"` | macOS 전용 (Homebrew, pbcopy, open 등) |
| `"windows"` | Windows CMD/PowerShell 전용 |

**주의사항**:
- `source {ENV}/bin/activate` → `"linux"` (Windows에서 동작 안 함)
- `sed -i 's/a/b/g'` → `"linux"` (macOS `sed`는 `-i ''` 필요)
- `lsof` → `"linux"` (macOS에도 있지만 플래그 다름)

---

### 5-10. `popularity` — number 0–100 (선택)

검색 결과 정렬에 사용. 높을수록 상단 노출.

| 범위 | 의미 | 예시 |
|------|------|------|
| 90–100 | 매일 사용하는 필수 명령어 | `npm install`, `git status`, `docker ps` |
| 80–89 | 주 1–3회 사용 | `npm run build`, `docker logs`, `git stash` |
| 70–79 | 가끔 필요, 잊기 쉬운 것 | `npm publish`, `git revert`, SQL JOIN |
| 60–69 | 드물지만 중요 | `npm dedupe`, `git bisect`, window function |
| 50 이하 | 특수 상황 | 의도적으로 낮은 것 (ex: `chmod -R 777 /`) |

---

### 5-11. `variables` — CommandVariable[] (선택)

command 안의 `{PLACEHOLDER}` 에 대한 메타데이터. UI에서 변수 입력 폼 등 향후 기능 확장에 사용.

```json
"command": "kubectl get pods -n {NAMESPACE}",
"variables": [
  {
    "name": "NAMESPACE",
    "defaultValue": "default",
    "description": "Kubernetes namespace name"
  }
]
```

**규칙**:
- `name`은 command 안의 `{...}` 내용과 반드시 일치
- `defaultValue`는 빈 문자열도 허용 (`""`)
- 현재는 선택 필드. 주요 명령어부터 점진적으로 추가

---

## 6. 명령어 ID 네이밍 컨벤션

```
{category}-{verb}-{object}
{category}-{object}-{qualifier}
```

| 카테고리 | 좋은 ID 예시 |
|----------|-------------|
| linux | `linux-kill-port`, `linux-find-large-files`, `linux-tail-follow` |
| git | `git-stash-save`, `git-rebase-interactive`, `git-force-push-lease` |
| docker | `docker-exec-bash`, `docker-compose-up`, `docker-system-prune` |
| kubernetes | `k8s-get-pods`, `k8s-rollout-restart`, `k8s-port-forward` |
| npm | `npm-install-dev`, `npm-run-build`, `npm-version-patch` |
| sql | `sql-inner-join`, `sql-cte`, `sql-window-row-number` |
| vim | `vim-substitute`, `vim-split-v`, `vim-write-sudo` |

**동의어 처리**: `k8s` prefix가 `kubernetes` category에 사용됨. Kubernetes는 파일명(`kubernetes.json`)이지만 ID prefix는 `k8s-`로 단축.

---

## 7. 새 명령어 추가 체크리스트

```
[ ] en/*.json 에 Command 객체 추가
    [ ] id: 네이밍 컨벤션 준수, 전체 파일에서 유일한지 확인
    [ ] command: 실제로 동작하는 명령어인지 직접 테스트
    [ ] command: 플레이스홀더는 {UPPER_SNAKE_CASE} 형식
    [ ] title: 50자 이하, 동사 원형 시작
    [ ] description: 1–2문장, 컨텍스트 포함
    [ ] aliases: 4–8개, 에러 메시지 포함 여부 검토
    [ ] tags: 4–8개, 기술 키워드
    [ ] isDangerous: 삭제/되돌릴 수 없는 작업이면 true
    [ ] platform: Unix-only 명령어인데 "all"로 설정하지 않았는지 확인
    [ ] popularity: 50–100 사이 적절한 값

[ ] ko/*.json 에 번역 객체 추가 (동일 id)
    [ ] title: 한국어
    [ ] description: 한국어 (유머 톤 유지)
    [ ] aliases: 한국어 4–8개 + 영문 핵심 키워드 1–2개 포함

[ ] en/index.ts: 새 카테고리라면 import 추가
[ ] ko/index.ts: 새 카테고리라면 import 추가
```

---

## 8. 새 카테고리 추가 체크리스트

```
[ ] src/types/command.ts
    [ ] CategoryId union에 새 id 추가

[ ] src/data/categories.ts
    [ ] CATEGORIES 배열에 항목 추가
        { id, labelKey, icon, color }
    [ ] icon: Lucide 아이콘 이름 (문자열)
    [ ] color: 브랜드 연관 hex 색상

[ ] src/locales/en/translation.json
    [ ] category.{id} 키 추가

[ ] src/locales/ko/translation.json
    [ ] category.{id} 키 추가

[ ] src/data/en/{category}.json  ← 신규 파일
[ ] src/data/ko/{category}.json  ← 신규 파일

[ ] src/data/en/index.ts  — import 및 배열에 spread 추가
[ ] src/data/ko/index.ts  — import 및 배열에 spread 추가
```

---

## 9. aliases 작성 고급 가이드

### 검색 UX의 핵심: "사용자가 기억하는 단어로 찾을 수 있어야 한다"

개발자가 명령어를 찾을 때 사용하는 3가지 검색 패턴:

#### 패턴 A — 명령어 이름을 알고 검색
```
"git stash" → git-stash-save 찾아야 함
"docker ps" → docker-ps-all 찾아야 함
```
→ aliases에 명령어 자체를 그대로 포함

#### 패턴 B — 하고 싶은 행동으로 검색
```
"브랜치 만들기" → git-switch-create 찾아야 함
"포트 죽이기"   → linux-kill-port 찾아야 함
"패키지 설치"   → npm-install-package 찾아야 함
```
→ aliases에 동사+목적어 형태 포함 (한국어는 ko aliases에)

#### 패턴 C — 에러 메시지/상황으로 검색 (가장 강력)
```
"address already in use" → linux-kill-port
"permission denied"      → linux-chmod-execute
"EACCES"                 → npm-install-global
"lock file conflict"     → npm-ci
"cannot connect to docker daemon" → docker-start (추가 필요)
```
→ aliases에 실제 에러 메시지 영문 그대로 포함

### 언어별 aliases 작성 예시 비교

**`npm-ci` 명령어**:

```json
// en/npm.json
"aliases": [
  "npm ci",
  "clean install",
  "CI clean install",
  "package-lock install",
  "lock file install",
  "reproducible install",
  "ci cd install"
]

// ko/npm.json
"aliases": [
  "npm ci",              ← 영문 명령어 유지
  "클린 인스톨",
  "CI 설치",
  "package-lock 기준 설치",
  "lock file 설치",
  "재현 가능한 설치"
]
```

---

## 10. 자주 하는 실수 모음

| 실수 | 올바른 방법 |
|------|------------|
| `platform: "all"` 로 Unix 명령어 등록 | `source`, `lsof`, `pkill` → `"linux"` |
| debounce라고 쓰고 setTimeout만 쓰기 | clearTimeout + 재설정 패턴 필수 |
| `&&`로 두 명령을 연결했는데 중간 값 자동 전달인 척하기 | 플레이스홀더 명시 or 두 명령으로 분리 |
| ko 파일에 `command` 필드 추가 | ko는 title/description/aliases 3개만 |
| 이미 존재하는 명령어를 다시 추가 | 추가 전 `grep -r "command문자열" src/data/en/` 확인 |
| pnpm/yarn을 npm aliases에 추가 | description에 텍스트로만 안내 |
| 외부 라이브러리 함수를 표준으로 표시 | description에 "Requires: {library}" 명시 |
| TC39 Proposal 단계 문법을 표준 JS로 표시 | description에 "Stage N Proposal — not yet standard" 명시 |
| `isDangerous` 생략 (dangerous한데) | 삭제, 되돌릴 수 없는 작업은 반드시 `true` |
| popularity 0 또는 생략 | 최소 50 이상, 생략하면 정렬 최하단 |
