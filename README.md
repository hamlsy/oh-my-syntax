<div align="center">

# ✦ Oh My Syntax!
![oms_small2](https://github.com/user-attachments/assets/56ed4a2e-0246-4dbe-be70-3de3e83f103f)



**The command lookup tool for developers who forget things.**

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Deploy](https://img.shields.io/badge/deployed%20on-Vercel-black)](https://ohmysyntax.vercel.app)

[English](#english) · [한국어](#한국어)

</div>

---

## English

### What is Oh My Syntax?

> "You know *what* you want to do. You just forgot *how* to write it."

Oh My Syntax is a lightning-fast command & syntax lookup tool for developers.
Type anything — a port number, a vague description, even Korean — and instantly get the exact command you need, ready to copy.

**Try it:**
- Type `8080` → get `kill -9 $(lsof -ti:8080)` instantly
- Type `undo last commit` → get the exact `git reset` command
- Type `docker clean up` → get all the Docker cleanup commands

### Features

- **Zero-latency search** — results appear on every keystroke, no debounce
- **Fuzzy matching** — finds commands even with typos or vague descriptions
- **Natural language aliases** — search in plain English or Korean
- **One-click copy** — Raycast-style clipboard with visual feedback
- **Keyboard navigation** — `↑ ↓` to browse, `Enter` to copy, `Esc` to clear
- **Category filters** — Linux, macOS, Windows, Docker, K8s, Git, Java, Python, JavaScript
- **Bilingual** — full English and Korean UI & search
- **Space background** — ambient animated starfield with floating code snippets
- **Easter eggs** — contributor cards floating in the background

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS |
| Animation | Framer Motion + Lenis |
| Search | Fuse.js + `useDeferredValue` |
| State | Zustand |
| i18n | i18next |
| Build | Vite |
| Deploy | Vercel |

### Local Development

```bash
# Clone the repo
git clone https://github.com/hamlsy/oh-my-syntax.git
cd oh-my-syntax

# Install dependencies
npm install

# Copy env file
cp .env.example .env.development

# Start dev server
npm run dev
```

### Contributing a Command

Missing a command? Found one that should be here?

**The easiest way:** [Open a New Command issue](../../issues/new?template=new-command.yml)
— no code required, just fill in the form.

**Want to submit a PR?** See [CONTRIBUTING.md](CONTRIBUTING.md) for a step-by-step guide.

Every command that gets merged earns you a spot in the floating contributor cards on the site background. Your little avatar, drifting through space forever. 🌌

---

## 한국어

### Oh My Syntax란?

> "뭘 하려는지는 아는데, 어떻게 쓰는지 기억이 안 나."

Oh My Syntax는 개발자를 위한 초고속 명령어 검색 도구입니다.
포트 번호든, 두루뭉술한 설명이든, 한국어든 — 뭐든 입력하면 필요한 명령어가 즉시 나타납니다. 바로 복사해서 쓰세요.

**이런 식으로 씁니다:**
- `8080` 입력 → `kill -9 $(lsof -ti:8080)` 즉시 등장
- `커밋 되돌리기` 입력 → 정확한 `git reset` 명령어
- `도커 청소` 입력 → Docker 정리 명령어 모음

### 주요 기능

- **제로 레이턴시 검색** — 키 입력마다 즉시 결과, 디바운스 없음
- **퍼지 검색** — 오타나 애매한 표현으로도 찾아냄
- **자연어 별칭** — 영어/한국어로 자유롭게 검색
- **원클릭 복사** — Raycast 스타일 클립보드 피드백
- **키보드 탐색** — `↑ ↓`로 이동, `Enter`로 복사, `Esc`로 초기화
- **카테고리 필터** — Linux, macOS, Windows, Docker, K8s, Git, Java, Python, JavaScript
- **한/영 동시 지원** — UI와 검색 모두 한국어 완전 지원
- **우주 배경** — 떠다니는 코드 조각과 별빛 애니메이션
- **이스터에그** — 기여자 카드가 배경에 둥둥 떠다님

### 로컬 개발 환경 설정

```bash
# 레포 클론
git clone https://github.com/hamlsy/oh-my-syntax.git
cd oh-my-syntax

# 패키지 설치
npm install

# 환경변수 파일 복사
cp .env.example .env.development

# 개발 서버 실행
npm run dev
```

### 명령어 기여하기

빠져있는 명령어가 있나요? 이런 게 있으면 좋겠다 싶은 게 있나요?

**가장 쉬운 방법:** [명령어 추가 이슈 열기](../../issues/new?template=new-command.yml)
— 코드 몰라도 됩니다. 양식만 채우면 끝.

**직접 PR을 올리고 싶다면?** [CONTRIBUTING.md](CONTRIBUTING.md)에 단계별 가이드가 있습니다.

머지된 명령어를 기여하면 사이트 배경에 떠다니는 기여자 카드에 이름을 올릴 수 있습니다.
우주를 영원히 떠도는 당신의 아바타. 🌌

---

## Project Structure

```
src/
├── features/        # Feature modules (search, results, background…)
├── components/      # Shared UI components
├── hooks/           # Custom hooks (useCommandSearch, useCopyToClipboard…)
├── store/           # Zustand global state
├── data/            # Command data — en/ and ko/ separated by language
├── locales/         # UI string translations (i18next)
├── constants/       # Design tokens, animation presets, config
└── types/           # Shared TypeScript interfaces
```

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built for developers who forget things. Which is all of us.</sub>
</div>
