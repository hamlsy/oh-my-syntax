# Contributing to Oh My Syntax!

First off — thank you! 🎉
Every command you add saves some developer from frantically Googling at 2am.

---

## Ways to Contribute

| Type | How |
|------|-----|
| Add a new command/snippet | [Open a "New Command" issue](../../issues/new?template=new-command.yml) |
| Report a bug | [Open a Bug Report](../../issues/new?template=bug-report.yml) |
| Suggest a feature | [Open a Feature Request](../../issues/new?template=feature-request.yml) |

---

## Adding a New Command (Step-by-step)

### 1. Open an Issue First
Use the **✨ New Command / Snippet** issue template.
Fill in the command, aliases, and descriptions. A maintainer will review and merge it.

> You don't need to touch any code. Just fill in the issue form and we'll handle the rest.

### 2. (Optional) Submit a PR Yourself

If you'd prefer to add the command directly:

**a) Fork & clone the repo**
```bash
git clone https://github.com/hamlsy/oh-my-syntax.git
cd oh-my-syntax
npm install
```

**b) Find the right data file**
Commands live in `src/data/en/<category>.json`.
Each entry must also have a matching entry (same `id`) in `src/data/ko/<category>.json`.

**c) Add your entry to the English file**

```json
{
  "id": "linux-kill-port",
  "category": "linux",
  "command": "kill -9 $(lsof -ti:{PORT})",
  "title": "Kill process on port",
  "description": "No mercy. Kills whatever dared to squat on your port.",
  "aliases": ["kill port", "port kill", "address already in use", "port 8080"],
  "tags": ["port", "kill", "process", "lsof", "pid"],
  "isDangerous": true,
  "platform": "linux",
  "popularity": 90,
  "variables": [
    { "name": "PORT", "defaultValue": "8080", "description": "Target port number" }
  ]
}
```

**d) Add the Korean translation**

```json
{
  "id": "linux-kill-port",
  "title": "포트 프로세스 강제 종료",
  "description": "자비 없음. 포트 점령한 놈을 즉시 처단합니다.",
  "aliases": ["포트 죽이기", "포트 종료", "8080 죽이기", "이미 사용 중인 포트"]
}
```

> Korean is optional — leave the `ko/` file entry out and it will fall back to English.

**e) Validate & test**
```bash
npm run validate:data   # checks EN/KO ID parity
npm run dev             # test your command appears in search
```

**f) Open a PR to `develop`**

---

## Command Quality Guidelines

### ✅ Good aliases
- Natural language: `"kill port"`, `"포트 죽이기"`
- Error messages: `"address already in use"`, `"permission denied"`
- Numeric patterns: `"8080"`, `"3000"`, `"443"`
- Synonyms: `"terminate"`, `"stop process"`, `"end task"`

### ❌ Bad aliases
- Exact command string (already searched automatically)
- Generic terms: `"command"`, `"run"`, `"execute"`

### Dangerous Commands (`isDangerous: true`)
If the command can cause **data loss or irreversible damage**, mark it dangerous.
The description **must** include a fun but clear warning:

| Command | Good description |
|---------|-----------------|
| `rm -rf /` | `"DON'T. Just... don't. Not even for fun."` |
| `git push --force` | `"Your team will remember this. Not fondly."` |
| `DROP TABLE` | `"This is why we have backups. You have backups, right?"` |

### Template Variables
If a command has a placeholder the user needs to fill in, use `{VARIABLE_NAME}`:
```
kill -9 $(lsof -ti:{PORT})
```
And declare it in the `variables` array with a sensible `defaultValue`.

---

## Your Avatar in the Background ✨

If you contribute a command that gets merged, you can optionally be added
to the floating contributor easter eggs on the site background.

To opt in, mention it in your PR or issue and provide:
- Your name (or handle)
- A 64×64px avatar image
- Your GitHub profile URL
- A short message (shown when someone clicks your card)

---

## Code of Conduct

Be kind. Everyone here is a developer who forgets things sometimes.
