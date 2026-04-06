# Basic Commands Addition Plan

> Linux/Windows 기본 탐색·조작 명령어 추가 계획
> 작성일: 2026-04-06
> 최종 검토: 2026-04-06 (2차 — 누락 기본 명령어 8+3개 추가)

---

## 개요

현재 `linux.json`(57개)과 `windows.json`(25개)에 `cd`, `ls`, `pwd`, `cat` 등
기초 명령어가 전혀 없음. 검색 시 당연히 나와야 할 결과가 나오지 않는 문제.

**추가 목표:** Linux +26개 / Windows +15개 = 총 41개

---

## 사전 검토 결과

### 중복 없음 확인
- `linux-ls-all`, `linux-cd`, `linux-pwd`, `linux-cat` 등 17개 전부 미존재 ✅
- `win-dir-simple` — 기존 `win-dir`은 `dir /b /s {PATTERN}` (검색 전용). 단순 `dir`은 별개 ✅
- `win-set-list` — 기존 환경변수 항목들은 전부 PowerShell 전용. CMD `set`은 없음 ✅
- `linux-ssh-login` — 기존 ssh-copy-id, ssh-tunnel은 있지만 기본 `ssh user@host` 없음 ✅
- `linux-clear` — 기존 57개 어디에도 없음 ✅
- `linux-sudo` — `sudo !!` 팁은 있지만 기본 `sudo {command}` 개념 항목 없음 ✅
- `linux-rm-file` — `rm -rf`는 있지만 단일 파일 `rm {file}` 없음 ✅
- `win-ping` — windows.json 25개에 완전 누락 ✅

### 계획 변경 사항 (1차)
| 변경 | 이유 |
|------|------|
| `win-cd-print` 제거 | `win-cd` description에 "인자 없이 치면 현재 경로 출력" 설명으로 충분 |
| `win-touch` 추가 | Windows 빈 파일 생성(`type nul > {FILE}`)은 개발자가 자주 모름 |
| `linux-sudo-last` — bash 전용 명시 | zsh에서 `!!` 미동작, description에 명시 필요 |
| `linux-tree` — 설치 필요 명시 | 기본 포함 아님. `apt install tree` / `brew install tree` description 명시 |

### 계획 변경 사항 (2차 검토 — 누락 기본 명령어)
| 추가 | 이유 |
|------|------|
| `linux-clear` 추가 | 매일 수십 번 치는 명령어, 완전 누락 |
| `linux-ssh-login` 추가 | SSH 기본 로그인이 없음 — tunnel/copy-id만 있었음 |
| `linux-sudo` 추가 | Linux 가장 기본 개념. sudo !! 팁만으론 부족 |
| `linux-rm-file` 추가 | rm -rf는 있는데 단일 파일 삭제가 없었음 |
| `linux-echo` 추가 | 터미널 출력/파이프의 기본 |
| `linux-man` 추가 | 명령어 도움말, 초보자/비숙련자 필수 |
| `linux-chown` 추가 | "permission denied" 디버깅 핵심 명령어 |
| `linux-unzip` 추가 | tar.gz는 있는데 .zip 압축 해제가 없었음 |
| `win-ping` 추가 | windows.json에 완전 누락. 기본 네트워크 테스트 |
| `win-echo` 추가 | CMD 기본 출력 명령어 |
| `win-net-service` 추가 | Windows 서비스 시작/중지 CMD 명령어 |

---

## Linux 추가 명령어 (26개)

### 그룹 1: 파일/디렉토리 탐색

#### `linux-ls-all`
- **command:** `ls -la`
- **title:** List all files (including hidden)
- **description:** The command you run first in every unfamiliar directory. -l for details, -a for hidden dotfiles.
- **platform:** `all`
- **popularity:** 97
- **isDangerous:** false
- **EN aliases:** `ls -la`, `list files`, `list all files`, `show hidden files`, `directory listing`, `ls -l`
- **KO aliases:** `파일 목록`, `ls`, `숨김파일 보기`, `ls -la`, `디렉토리 목록`, `파일 리스트`

#### `linux-cd`
- **command:** `cd {PATH}`
- **title:** Change directory
- **description:** Navigate to a directory. Use `cd -` to go back to the previous one. Use `cd ~` to go home.
- **platform:** `all`
- **popularity:** 99
- **isDangerous:** false
- **EN aliases:** `cd`, `change directory`, `navigate to folder`, `go to directory`, `move to folder`, `cd ~`
- **KO aliases:** `디렉토리 이동`, `cd`, `폴더 이동`, `경로 이동`, `디렉토리 변경`

#### `linux-cd-back`
- **command:** `cd -`
- **title:** Go to previous directory
- **description:** Jump back to where you just were. Like the browser back button, but for the terminal.
- **platform:** `linux`
- **popularity:** 85
- **isDangerous:** false
- **EN aliases:** `cd -`, `go back`, `previous directory`, `last directory`, `switch back`, `toggle directory`
- **KO aliases:** `이전 디렉토리`, `cd -`, `뒤로 가기`, `이전 폴더`, `전 위치로`

#### `linux-pwd`
- **command:** `pwd`
- **title:** Print working directory
- **description:** Where the heck am I? pwd answers this eternal question.
- **platform:** `all`
- **popularity:** 95
- **isDangerous:** false
- **EN aliases:** `pwd`, `current directory`, `where am i`, `print working directory`, `current path`, `show path`
- **KO aliases:** `현재 경로`, `pwd`, `현재 위치`, `작업 디렉토리`, `어디 있어`, `경로 확인`

---

### 그룹 2: 파일 조작

#### `linux-cat`
- **command:** `cat {FILE}`
- **title:** Print file contents
- **description:** Dump a file to stdout. For large files, use `less` instead — cat will flood your terminal.
- **platform:** `all`
- **popularity:** 96
- **isDangerous:** false
- **EN aliases:** `cat`, `print file`, `show file content`, `read file`, `view file`, `output file`, `display file`
- **KO aliases:** `파일 출력`, `cat`, `파일 내용 보기`, `파일 읽기`, `파일 보기`, `내용 확인`

#### `linux-less`
- **command:** `less {FILE}`
- **title:** View file with paging
- **description:** Browse a file without flooding your terminal. `q` to quit, `/` to search, arrows to scroll.
- **platform:** `all`
- **popularity:** 88
- **isDangerous:** false
- **EN aliases:** `less`, `page file`, `view large file`, `read file page by page`, `more`, `scroll file`, `browse file`
- **KO aliases:** `파일 페이징`, `less`, `큰 파일 보기`, `페이지별 보기`, `스크롤 보기`, `파일 탐색`

#### `linux-cp`
- **command:** `cp {SOURCE} {DESTINATION}`
- **title:** Copy file
- **description:** Copy a file. Use `cp -r` for directories — omitting -r on a directory throws an error.
- **platform:** `all`
- **popularity:** 94
- **isDangerous:** false
- **EN aliases:** `cp`, `copy file`, `duplicate file`, `file copy`, `cp command`
- **KO aliases:** `파일 복사`, `cp`, `복사`, `파일 복제`, `copy`

#### `linux-cp-recursive`
- **command:** `cp -r {SOURCE} {DESTINATION}`
- **title:** Copy directory recursively
- **description:** Copy an entire directory tree. Without -r, cp refuses to copy directories.
- **platform:** `all`
- **popularity:** 90
- **isDangerous:** false
- **EN aliases:** `cp -r`, `copy directory`, `copy folder`, `recursive copy`, `copy folder linux`, `omitting -r on directory`
- **KO aliases:** `디렉토리 복사`, `cp -r`, `폴더 복사`, `재귀 복사`, `폴더 통째 복사`

#### `linux-mv`
- **command:** `mv {SOURCE} {DESTINATION}`
- **title:** Move or rename file
- **description:** Move a file — or rename it. Same command, different paths. mv doesn't ask for confirmation.
- **platform:** `all`
- **popularity:** 95
- **isDangerous:** false
- **EN aliases:** `mv`, `move file`, `rename file`, `rename`, `move folder`, `file exists`, `overwrite file`
- **KO aliases:** `파일 이동`, `mv`, `파일 이름 변경`, `이름 바꾸기`, `폴더 이동`, `rename`

#### `linux-touch`
- **command:** `touch {FILE}`
- **title:** Create empty file
- **description:** Create a blank file, or update its timestamp if it already exists. Often the first step in a new script.
- **platform:** `all`
- **popularity:** 88
- **isDangerous:** false
- **EN aliases:** `touch`, `create file`, `new file`, `create empty file`, `make file`, `blank file`
- **KO aliases:** `파일 생성`, `touch`, `빈 파일 만들기`, `새 파일`, `파일 만들기`, `빈 파일 생성`

#### `linux-rm-file`
- **command:** `rm {FILE}`
- **title:** Delete file
- **description:** Delete a single file. No recycle bin, no undo. Use `rm -i` to confirm before deleting. For directories, use `rm -rf`.
- **platform:** `all`
- **popularity:** 93
- **isDangerous:** true
- **EN aliases:** `rm`, `delete file`, `remove file`, `rm file`, `delete linux`, `remove linux`
- **KO aliases:** `파일 삭제`, `rm`, `삭제`, `파일 지우기`, `remove`, `delete`

#### `linux-mkdir`
- **command:** `mkdir {DIR}`
- **title:** Create directory
- **description:** Create a new directory. Use `mkdir -p` to create nested paths in one shot.
- **platform:** `all`
- **popularity:** 96
- **isDangerous:** false
- **EN aliases:** `mkdir`, `make directory`, `create folder`, `new folder`, `create directory`, `make folder`
- **KO aliases:** `디렉토리 생성`, `mkdir`, `폴더 만들기`, `새 폴더`, `폴더 생성`

#### `linux-echo`
- **command:** `echo "{TEXT}"`
- **title:** Print text to terminal
- **description:** Output text. Use with `>` to write to a file, `>>` to append. Essential for scripts and quick file creation.
- **platform:** `all`
- **popularity:** 92
- **isDangerous:** false
- **EN aliases:** `echo`, `print text`, `output text`, `write to file`, `echo command`, `print string`, `display message`
- **KO aliases:** `텍스트 출력`, `echo`, `문자열 출력`, `파일에 쓰기`, `터미널 출력`, `메시지 출력`

#### `linux-unzip`
- **command:** `unzip {FILE}.zip -d {DESTINATION}`
- **title:** Extract zip archive
- **description:** Unzip a .zip file. -d sets the output directory. Use `unzip -l {FILE}` to list contents without extracting. Not installed by default on some systems — `apt install unzip` / `brew install unzip`.
- **platform:** `all`
- **popularity:** 87
- **isDangerous:** false
- **EN aliases:** `unzip`, `extract zip`, `unzip file`, `decompress zip`, `zip extract`, `open zip`
- **KO aliases:** `압축 해제`, `unzip`, `zip 풀기`, `zip 압축 해제`, `파일 압축 풀기`, `압축 파일 열기`

---

### 그룹 3: 권한 및 사용자

#### `linux-sudo`
- **command:** `sudo {COMMAND}`
- **title:** Run command as root
- **description:** Execute a command with superuser privileges. If you get "permission denied", try sudo first. Use `sudo -s` for a root shell.
- **platform:** `linux`
- **popularity:** 97
- **isDangerous:** false
- **EN aliases:** `sudo`, `run as root`, `admin command`, `superuser`, `permission denied sudo`, `root command`, `sudo command`
- **KO aliases:** `관리자 권한`, `sudo`, `루트 권한`, `권한 없음`, `permission denied`, `슈퍼유저`, `관리자로 실행`

#### `linux-chown`
- **command:** `chown {USER}:{GROUP} {FILE}`
- **title:** Change file ownership
- **description:** Change who owns a file. Use `-R` for directories. Pair with `ls -la` to inspect current ownership.
- **platform:** `linux`
- **popularity:** 82
- **isDangerous:** false
- **EN aliases:** `chown`, `change owner`, `file ownership`, `change file owner`, `permission denied chown`, `own file`
- **KO aliases:** `파일 소유자 변경`, `chown`, `소유권 변경`, `파일 권한 소유자`, `ownership`, `권한 소유`

---

### 그룹 4: 시스템 정보

#### `linux-whoami`
- **command:** `whoami`
- **title:** Print current username
- **description:** Who are you running as? Essential after sudo -s or ssh into an unfamiliar server.
- **platform:** `all`
- **popularity:** 88
- **isDangerous:** false
- **EN aliases:** `whoami`, `current user`, `who am i`, `logged in as`, `username`, `which user`
- **KO aliases:** `현재 사용자`, `whoami`, `내가 누구`, `로그인 사용자`, `사용자 이름`, `접속 계정`

#### `linux-id`
- **command:** `id`
- **title:** Show user and group IDs
- **description:** Print UID, GID, and all group memberships. Useful for debugging permission issues.
- **platform:** `all`
- **popularity:** 78
- **isDangerous:** false
- **EN aliases:** `id`, `uid`, `gid`, `user id`, `group id`, `user info`, `permission denied debug`
- **KO aliases:** `사용자 ID`, `id`, `UID`, `GID`, `그룹 ID`, `권한 확인`

#### `linux-uname`
- **command:** `uname -a`
- **title:** Show OS and kernel info
- **description:** Print everything: kernel version, hostname, architecture, OS. The first thing to check on an unfamiliar server.
- **platform:** `all`
- **popularity:** 82
- **isDangerous:** false
- **EN aliases:** `uname`, `kernel version`, `os version`, `linux version`, `kernel info`, `system info linux`, `architecture`
- **KO aliases:** `커널 버전`, `uname`, `OS 버전`, `리눅스 버전`, `시스템 정보`, `커널 정보`, `아키텍처`

#### `linux-uptime`
- **command:** `uptime`
- **title:** Show uptime and load average
- **description:** How long has this server been running? Also shows load averages for 1/5/15 minutes.
- **platform:** `all`
- **popularity:** 75
- **isDangerous:** false
- **EN aliases:** `uptime`, `system uptime`, `load average`, `how long running`, `server uptime`, `load avg`
- **KO aliases:** `가동 시간`, `uptime`, `부하 평균`, `서버 가동`, `얼마나 켜있어`, `load average`

#### `linux-date`
- **command:** `date`
- **title:** Show current date and time
- **description:** Print the current date and time. Add `+%Y-%m-%d` for formatted output. Great for log timestamps.
- **platform:** `all`
- **popularity:** 80
- **isDangerous:** false
- **EN aliases:** `date`, `current date`, `current time`, `system time`, `what time is it`, `date linux`, `timestamp`
- **KO aliases:** `날짜 확인`, `date`, `현재 시간`, `시스템 시간`, `지금 몇 시`, `타임스탬프`

---

### 그룹 5: 터미널 유틸

#### `linux-clear`
- **command:** `clear`
- **title:** Clear terminal screen
- **description:** Clear the terminal output. Ctrl+L does the same thing. Your screen, your rules.
- **platform:** `all`
- **popularity:** 96
- **isDangerous:** false
- **EN aliases:** `clear`, `clear screen`, `clear terminal`, `clean screen`, `cls linux`, `terminal clear`
- **KO aliases:** `화면 지우기`, `clear`, `터미널 클리어`, `화면 초기화`, `cls 리눅스`, `스크린 클리어`

#### `linux-man`
- **command:** `man {COMMAND}`
- **title:** Show command manual
- **description:** Read the full manual for any command. `q` to quit. `/{KEYWORD}` to search. When in doubt, man it out.
- **platform:** `all`
- **popularity:** 87
- **isDangerous:** false
- **EN aliases:** `man`, `manual`, `help command`, `command help`, `how to use`, `man page`, `documentation`
- **KO aliases:** `매뉴얼`, `man`, `도움말`, `명령어 사용법`, `사용법`, `명령어 설명`, `man page`

#### `linux-ssh-login`
- **command:** `ssh {USER}@{HOST}`
- **title:** SSH into remote server
- **description:** Connect to a remote server via SSH. Add `-p {PORT}` for non-standard ports. Use `-i {KEY}` to specify a private key.
- **platform:** `all`
- **popularity:** 95
- **isDangerous:** false
- **EN aliases:** `ssh`, `connect to server`, `remote login`, `ssh login`, `remote ssh`, `ssh connect`, `login server`
- **KO aliases:** `서버 접속`, `ssh`, `원격 접속`, `ssh 로그인`, `서버 연결`, `원격 서버`, `리모트 접속`

---

### 그룹 6: 꿀팁

#### `linux-sudo-last`
- **command:** `sudo !!`
- **title:** Re-run last command with sudo
- **description:** Forgot sudo? Run this. `!!` expands to the previous command. Bash only — won't work in zsh unless history expansion is enabled.
- **platform:** `linux`
- **popularity:** 88
- **isDangerous:** false
- **EN aliases:** `sudo !!`, `run last command as sudo`, `forgot sudo`, `repeat with sudo`, `sudo previous command`
- **KO aliases:** `이전 명령 sudo`, `sudo !!`, `sudo 깜빡`, `관리자로 재실행`, `sudo 다시`

#### `linux-tree`
- **command:** `tree -L {DEPTH} {DIR}`
- **title:** Visualize directory tree
- **description:** Print a directory as an ASCII tree. Not installed by default — `apt install tree` / `brew install tree`. -L limits depth.
- **platform:** `all`
- **popularity:** 80
- **isDangerous:** false
- **EN aliases:** `tree`, `directory tree`, `folder structure`, `visualize directory`, `dir tree`, `show tree`
- **KO aliases:** `디렉토리 트리`, `tree`, `폴더 구조`, `디렉토리 구조`, `파일 트리`, `트리 구조`

---

## Windows 추가 명령어 (15개)

### 그룹 1: 파일/디렉토리 탐색

#### `win-dir-simple`
- **command:** `dir`
- **title:** List files (CMD)
- **description:** Basic directory listing in CMD. For recursive file search, use `dir /b /s {PATTERN}`. Linux equivalent: `ls`.
- **platform:** `windows`
- **popularity:** 92
- **isDangerous:** false
- **EN aliases:** `dir`, `list files cmd`, `file list windows`, `show files cmd`, `ls windows`, `directory cmd`
- **KO aliases:** `파일 목록 cmd`, `dir`, `윈도우 파일 목록`, `cmd 파일 보기`, `ls 윈도우`

#### `win-cd`
- **command:** `cd {PATH}`
- **title:** Change directory (CMD)
- **description:** Navigate to a directory in CMD. Type `cd` alone (no args) to print your current path — Windows' version of `pwd`.
- **platform:** `windows`
- **popularity:** 98
- **isDangerous:** false
- **EN aliases:** `cd windows`, `change directory cmd`, `navigate folder cmd`, `go to folder windows`, `pwd windows`, `current path cmd`
- **KO aliases:** `디렉토리 이동 cmd`, `cd`, `폴더 이동 윈도우`, `경로 이동 cmd`, `현재 경로 cmd`, `pwd 윈도우`

---

### 그룹 2: 파일 조작

#### `win-type`
- **command:** `type {FILE}`
- **title:** Print file contents (CMD)
- **description:** Display the contents of a file in CMD. Linux/macOS equivalent: `cat`. For large files, consider `more {FILE}`.
- **platform:** `windows`
- **popularity:** 86
- **isDangerous:** false
- **EN aliases:** `type cmd`, `cat windows`, `print file cmd`, `show file content windows`, `read file cmd`, `view file cmd`
- **KO aliases:** `파일 내용 cmd`, `type`, `cat 윈도우`, `파일 출력 cmd`, `파일 보기 윈도우`

#### `win-touch`
- **command:** `type nul > {FILE}`
- **title:** Create empty file (CMD)
- **description:** Create a blank file in CMD. Warning: if the file already exists, this truncates it to empty. PowerShell alternative: `New-Item {FILE}`.
- **platform:** `windows`
- **popularity:** 78
- **isDangerous:** false
- **EN aliases:** `touch windows`, `create empty file cmd`, `new file cmd`, `make file windows`, `type nul`, `blank file cmd`
- **KO aliases:** `빈 파일 생성 cmd`, `touch 윈도우`, `파일 만들기 cmd`, `type nul`, `새 파일 cmd`

#### `win-copy`
- **command:** `copy {SOURCE} {DESTINATION}`
- **title:** Copy file (CMD)
- **description:** Copy a single file. For directories, use `xcopy` or `robocopy`. Prompts before overwriting.
- **platform:** `windows`
- **popularity:** 85
- **isDangerous:** false
- **EN aliases:** `copy cmd`, `copy file windows`, `file copy cmd`, `duplicate file windows`
- **KO aliases:** `파일 복사 cmd`, `copy`, `윈도우 파일 복사`, `cmd 복사`

#### `win-move`
- **command:** `move {SOURCE} {DESTINATION}`
- **title:** Move or rename file (CMD)
- **description:** Move a file to another location, or rename it by changing the destination name.
- **platform:** `windows`
- **popularity:** 82
- **isDangerous:** false
- **EN aliases:** `move cmd`, `move file windows`, `rename file cmd`, `rename windows cmd`, `mv windows`
- **KO aliases:** `파일 이동 cmd`, `move`, `파일 이름 변경 cmd`, `이름 바꾸기 윈도우`, `mv 윈도우`

#### `win-del`
- **command:** `del {FILE}`
- **title:** Delete file (CMD)
- **description:** Delete a file in CMD. No recycle bin. No undo. Use `/F` to force-delete read-only files. `access denied`? Try running as admin.
- **platform:** `windows`
- **popularity:** 84
- **isDangerous:** true
- **EN aliases:** `del cmd`, `delete file windows`, `remove file cmd`, `erase file`, `access denied delete`
- **KO aliases:** `파일 삭제 cmd`, `del`, `윈도우 파일 삭제`, `cmd 삭제`, `access denied`

#### `win-rmdir`
- **command:** `rd /s /q {DIRECTORY}`
- **title:** Delete directory recursively (CMD)
- **description:** Remove a directory and all its contents. /s = recursive, /q = quiet (no confirmation). No undo.
- **platform:** `windows`
- **popularity:** 80
- **isDangerous:** true
- **EN aliases:** `rd /s /q`, `delete folder cmd`, `remove directory cmd`, `rmdir windows`, `delete directory cmd`, `rm -rf windows`
- **KO aliases:** `폴더 삭제 cmd`, `rd`, `디렉토리 삭제 cmd`, `윈도우 폴더 삭제`, `rm -rf 윈도우`

---

### 그룹 3: 터미널 유틸

#### `win-cls`
- **command:** `cls`
- **title:** Clear terminal screen (CMD)
- **description:** Clear the CMD screen. The Windows equivalent of `clear` on Linux/macOS.
- **platform:** `windows`
- **popularity:** 88
- **isDangerous:** false
- **EN aliases:** `cls`, `clear screen windows`, `clear cmd`, `clear terminal windows`, `clean terminal`
- **KO aliases:** `화면 지우기`, `cls`, `cmd 화면 초기화`, `터미널 클리어 윈도우`, `clear 윈도우`

#### `win-echo`
- **command:** `echo {TEXT}`
- **title:** Print text (CMD)
- **description:** Output text in CMD. Use `echo.` for a blank line. Redirect with `>` to write to a file, `>>` to append.
- **platform:** `windows`
- **popularity:** 88
- **isDangerous:** false
- **EN aliases:** `echo cmd`, `print text windows`, `echo windows`, `output text cmd`, `display text cmd`, `echo command`
- **KO aliases:** `텍스트 출력 cmd`, `echo`, `문자열 출력 윈도우`, `cmd 출력`, `터미널 출력 윈도우`

#### `win-where`
- **command:** `where {COMMAND}`
- **title:** Find command location (CMD)
- **description:** Find the full path of an executable. Windows equivalent of Linux `which`. Useful to see which version of a tool is active.
- **platform:** `windows`
- **popularity:** 80
- **isDangerous:** false
- **EN aliases:** `where`, `which windows`, `find command path windows`, `where is command`, `command location cmd`
- **KO aliases:** `명령어 경로 윈도우`, `where`, `which 윈도우`, `명령어 위치 cmd`, `실행 파일 위치`

#### `win-ping`
- **command:** `ping {HOST}`
- **title:** Ping a host (CMD)
- **description:** Test network connectivity. Sends 4 packets by default. Use `-t` for continuous ping. The first thing to try when network is acting up.
- **platform:** `windows`
- **popularity:** 92
- **isDangerous:** false
- **EN aliases:** `ping windows`, `ping cmd`, `network test windows`, `check host windows`, `connectivity test`, `is host alive windows`
- **KO aliases:** `핑 윈도우`, `ping`, `네트워크 테스트 윈도우`, `서버 연결 확인`, `연결 테스트 cmd`, `호스트 확인 윈도우`

#### `win-set-list`
- **command:** `set`
- **title:** List environment variables (CMD)
- **description:** Print all environment variables in CMD. Filter with `set {PREFIX}` (e.g., `set PATH`). PowerShell equivalent: `Get-ChildItem Env:`.
- **platform:** `windows`
- **popularity:** 78
- **isDangerous:** false
- **EN aliases:** `set`, `list env variables cmd`, `environment variables cmd`, `show variables cmd`, `print env windows`
- **KO aliases:** `환경변수 목록 cmd`, `set`, `윈도우 환경변수 보기`, `cmd 변수 목록`, `env 윈도우`

#### `win-net-service`
- **command:** `net start {SERVICE}`
- **title:** Start/stop Windows service (CMD)
- **description:** Start a Windows service with `net start`, stop with `net stop {SERVICE}`. Run as admin. Alternative: `sc start/stop`.
- **platform:** `windows`
- **popularity:** 80
- **isDangerous:** false
- **EN aliases:** `net start`, `net stop`, `start service windows`, `stop service cmd`, `windows service start`, `service management cmd`
- **KO aliases:** `서비스 시작 윈도우`, `net start`, `윈도우 서비스 관리`, `서비스 중지 cmd`, `net stop`, `서비스 cmd`

#### `win-tree`
- **command:** `tree {DIR} /F`
- **title:** Visualize directory tree (CMD)
- **description:** Print a directory tree with files (/F). Built into Windows — no install needed. Redirect to file: `tree /F > tree.txt`.
- **platform:** `windows`
- **popularity:** 76
- **isDangerous:** false
- **EN aliases:** `tree windows`, `directory tree cmd`, `folder structure windows`, `tree /F`, `visualize folder cmd`
- **KO aliases:** `디렉토리 트리 윈도우`, `tree`, `폴더 구조 cmd`, `윈도우 트리`, `트리 구조 cmd`

---

## 체크리스트

```
[ ] src/data/en/linux.json  — 26개 추가
[ ] src/data/ko/linux.json  — 26개 번역 추가
[ ] src/data/en/windows.json — 15개 추가
[ ] src/data/ko/windows.json — 15개 번역 추가
[ ] 커밋 & 푸시
```

---

## 요약

| 파일 | 현재 | 추가 | 완료 후 |
|------|------|------|---------|
| `en/linux.json` | 57 | +26 | 83 |
| `ko/linux.json` | 57 | +26 | 83 |
| `en/windows.json` | 25 | +15 | 40 |
| `ko/windows.json` | 25 | +15 | 40 |
| **합계** | **164** | **+82** | **246** |
