# ReviewBot

AI-powered code review bot for GitLab and GitHub using AI (Claude or local LLMs via Ollama).

## Features

- **Multi-Platform Support**: Works with both GitLab and GitHub
- **Automated code review using AI**
- **Multiple LLM Providers**: Anthropic Claude or local LLMs via Ollama
- **Configurable Language**: English-only or bilingual reviews (Korean/Japanese/Chinese + English)
- **Line-by-Line Comments**: Posts review comments directly on specific lines in changed files
- Supports GitLab Cloud/self-hosted instances and GitHub
- CLI tool for easy integration
- Detailed feedback on code quality, security, performance, and best practices
- Can post reviews directly as merge/pull request comments
- Structured output in text or JSON format
- Includes LLM provider/model, tool version, and timestamp for audit tracking

## Prerequisites

- Node.js 18 or higher
- Either GitLab personal access token OR GitHub personal access token with API access
- Either:
  - Anthropic API key (for Claude), OR
  - Local Ollama instance (for local LLMs)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd reviewbot
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. (Optional) Link for global usage:
```bash
npm link
```

## Configuration

Create a `.env` file in the project root (use `.env.example` as a template).

### Option 1: Using GitLab + Anthropic Claude

```bash
# VCS Platform Configuration
VCS_PLATFORM=gitlab

# GitLab Configuration
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your-gitlab-personal-access-token

# LLM Configuration
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# Review Settings (optional)
REVIEW_LANGUAGE=english  # or 'korean', 'japanese', 'chinese'
MAX_DIFF_SIZE=50000
REVIEW_PROMPT_TEMPLATE=default
```

### Option 2: Using GitHub + Anthropic Claude

```bash
# VCS Platform Configuration
VCS_PLATFORM=github

# GitHub Configuration
GITHUB_TOKEN=your-github-personal-access-token

# LLM Configuration
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# Review Settings (optional)
REVIEW_LANGUAGE=english  # or 'korean', 'japanese', 'chinese'
MAX_DIFF_SIZE=50000
REVIEW_PROMPT_TEMPLATE=default
```

### Option 3: Using GitLab + Ollama (Local LLM)

```bash
# VCS Platform Configuration
VCS_PLATFORM=gitlab

# GitLab Configuration
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your-gitlab-personal-access-token

# LLM Configuration
LLM_PROVIDER=ollama
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=gemma3:4b

# Review Settings (optional)
REVIEW_LANGUAGE=english  # or 'korean', 'japanese', 'chinese'
MAX_DIFF_SIZE=50000
REVIEW_PROMPT_TEMPLATE=default
```

### Option 4: Using GitHub + Ollama (Local LLM)

```bash
# VCS Platform Configuration
VCS_PLATFORM=github

# GitHub Configuration
GITHUB_TOKEN=your-github-personal-access-token

# LLM Configuration
LLM_PROVIDER=ollama
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=gemma3:4b

# Review Settings (optional)
REVIEW_LANGUAGE=english  # or 'korean', 'japanese', 'chinese'
MAX_DIFF_SIZE=50000
REVIEW_PROMPT_TEMPLATE=default
```

### Getting API Keys & Setting Up LLMs

**GitLab Personal Access Token:**
1. Go to GitLab → User Settings → Access Tokens
2. Create a new token with `api` scope
3. Copy the token to your `.env` file

**GitHub Personal Access Token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope (for private repos) or `public_repo` (for public repos only)
3. Copy the token to your `.env` file

**Anthropic API Key (if using Claude):**
1. Sign up at https://console.anthropic.com/
2. Go to API Keys section
3. Create a new API key
4. Copy the key to your `.env` file

**Ollama Setup (if using local LLMs):**
1. Install Ollama from https://ollama.ai/
2. Pull a model: `ollama pull gemma3:4b` (or any other model)
3. Start Ollama service (usually runs on http://localhost:11434)
4. Configure `OLLAMA_ENDPOINT` and `OLLAMA_MODEL` in `.env`

**Language Configuration:**
- `REVIEW_LANGUAGE=english` (default): Reviews only in English
- `REVIEW_LANGUAGE=korean`: Reviews in both Korean and English
- `REVIEW_LANGUAGE=japanese`: Reviews in both Japanese and English
- `REVIEW_LANGUAGE=chinese`: Reviews in both Chinese and English

When using a non-English language, the bot provides bilingual output with the selected language side-by-side with English for easier understanding by international teams.

## Usage

### Basic Review (Terminal Output)

```bash
reviewbot review --url <merge-request-url>
```

Examples:
```bash
# GitLab
reviewbot review --url https://gitlab.com/mygroup/myproject/-/merge_requests/123

# GitHub
reviewbot review --url https://github.com/owner/repo/pull/456
```

### Post Review as Comments

Posts a summary comment on the MR/PR and creates line-specific discussions on each issue found:

```bash
reviewbot review --url <merge-request-url> --post
```

This will:
1. Post a summary comment with the overall assessment
2. Create individual discussions/review comments on specific lines for each detailed feedback item

### JSON Output

```bash
reviewbot review --url <merge-request-url> --format json
```

### Development Mode

Run without building:
```bash
npm run dev -- review --url <merge-request-url>
```

## Command Line Options

```
reviewbot review [options]

Options:
  -u, --url <url>        GitLab MR or GitHub PR URL (required)
  -p, --post             Post the review as a comment on the MR/PR
  -f, --format <format>  Output format: text or json (default: "text")
  -h, --help             Display help for command
```

## Example Output

### English-only (Default: `REVIEW_LANGUAGE=english`)

```
================================================================================
AI CODE REVIEW RESULTS
================================================================================

SUMMARY:
This merge request introduces a new user authentication feature with JWT tokens.
The implementation is generally solid but has some security and error handling
concerns that should be addressed before merging to production.

DETAILED FEEDBACK:
--------------------------------------------------------------------------------
[CRITICAL] src/auth/login.ts:45
  Password comparison is not using constant-time comparison, vulnerable to timing attacks

[WARNING] src/auth/jwt.ts:23
  JWT secret should be loaded from environment variables, not hardcoded

[SUGGESTION] src/utils/validator.ts:12
  Consider using a validation library like Joi or Yup for more robust input validation

[INFO] src/types/user.ts:8
  Good use of TypeScript interfaces for type safety

OVERALL ASSESSMENT:
APPROVE_WITH_SUGGESTIONS - The code is functional and well-structured, but should
address the security concerns before merging to production.

--------------------------------------------------------------------------------
Review generated by Ollama (gemma3:4b) • reviewbot v1.0.0 • 2025-01-15T10:30:45.123Z
================================================================================
```

### Bilingual (e.g., `REVIEW_LANGUAGE=korean`)

```
================================================================================
AI CODE REVIEW RESULTS
================================================================================

SUMMARY:
**Korean (한국어):**
이 병합 요청은 JWT 토큰을 사용한 새로운 사용자 인증 기능을 도입합니다.
구현은 전반적으로 견고하지만 프로덕션에 병합하기 전에 해결해야 할 몇 가지 보안 및 오류 처리 문제가 있습니다.

**English:**
This merge request introduces a new user authentication feature with JWT tokens.
The implementation is generally solid but has some security and error handling
concerns that should be addressed before merging to production.

DETAILED FEEDBACK:
--------------------------------------------------------------------------------
[CRITICAL] src/auth/login.ts:45
  비밀번호 비교가 상수 시간 비교를 사용하지 않아 타이밍 공격에 취약합니다 / Password comparison is not using constant-time comparison, vulnerable to timing attacks

[WARNING] src/auth/jwt.ts:23
  JWT 시크릿은 하드코딩이 아닌 환경 변수에서 로드해야 합니다 / JWT secret should be loaded from environment variables, not hardcoded

[SUGGESTION] src/utils/validator.ts:12
  더 강력한 입력 검증을 위해 Joi 또는 Yup과 같은 검증 라이브러리 사용을 고려하세요 / Consider using a validation library like Joi or Yup for more robust input validation

OVERALL ASSESSMENT:
**Korean (한국어):**
수정 제안과 함께 승인 - 코드는 기능적이고 잘 구조화되어 있지만 프로덕션에 병합하기 전에 보안 문제를 해결해야 합니다.

**English:**
APPROVE_WITH_SUGGESTIONS - The code is functional and well-structured, but should
address the security concerns before merging to production.

--------------------------------------------------------------------------------
Review generated by Ollama (gemma3:4b) • reviewbot v1.0.0 • 2025-01-15T10:30:45.123Z
================================================================================
```

## Project Structure

```
reviewbot/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── index.ts            # Main review orchestration
│   ├── config/
│   │   └── index.ts        # Configuration loader
│   ├── services/
│   │   ├── gitlab.ts       # GitLab API client
│   │   ├── github.ts       # GitHub API client
│   │   ├── reviewer.ts     # AI review logic
│   │   ├── vcs/
│   │   │   ├── base.ts     # VCS client interface
│   │   │   ├── gitlab-adapter.ts # GitLab adapter
│   │   │   ├── github-adapter.ts # GitHub adapter
│   │   │   └── factory.ts   # VCS client factory
│   │   └── llm/
│   │       ├── base.ts     # LLM client interface
│   │       ├── anthropic.ts # Anthropic implementation
│   │       ├── ollama.ts    # Ollama implementation
│   │       └── factory.ts   # LLM client factory
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   └── utils/
│       ├── logger.ts       # Logging utilities
│       ├── metadata.ts     # Review metadata (LLM info)
│       └── parser.ts       # URL parser (GitLab/GitHub)
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **Parse URL** - Detects platform (GitLab/GitHub) and extracts project identifier and MR/PR number
2. **Fetch Data** - Retrieves merge/pull request information and code diffs via platform API
3. **AI Analysis** - Sends code changes to configured LLM (Anthropic or Ollama) for comprehensive review
4. **Parse Results** - Structures AI feedback into actionable comments
5. **Output/Post** - Displays results in terminal or posts to the platform:
   - Summary comment with overall assessment
   - Line-specific discussions/review comments for each detailed feedback item

## Limitations

- Maximum diff size: 50,000 characters (configurable)
- Only reviews files with text diffs (binary files are skipped)
- Deleted files are not reviewed
- Large merge requests may be truncated

## Troubleshooting

**"GITLAB_TOKEN environment variable is required" / "GITHUB_TOKEN environment variable is required"**
- Make sure you have created a `.env` file with the appropriate token for your VCS platform
- Ensure `VCS_PLATFORM` is set correctly (gitlab or github)

**"Invalid merge/pull request URL format"**
- GitLab format: `https://gitlab.com/group/project/-/merge_requests/123`
- GitHub format: `https://github.com/owner/repo/pull/456`

**"Failed to fetch merge request" / "Failed to fetch pull request"**
- Verify your token has the correct scopes:
  - GitLab: `api` scope
  - GitHub: `repo` or `public_repo` scope
- Check that you have access to the repository
- Ensure the MR/PR number is correct

**API rate limits**
- GitLab, GitHub, and Anthropic have rate limits
- Consider adding delays between multiple reviews

**"Failed to generate completion from Ollama"**
- Ensure Ollama is running: `ollama serve`
- Verify the endpoint is correct (default: http://localhost:11434)
- Check that the model is installed: `ollama list`
- Pull the model if needed: `ollama pull gemma3:4b`

**"Unsupported LLM provider"**
- Check that `LLM_PROVIDER` is set to either `anthropic` or `ollama`

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT
