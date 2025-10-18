# GitLab ReviewBot

AI-powered code review bot for GitLab merge requests using Claude AI.

## Features

- Automated code review using Claude AI
- Supports GitLab Cloud and self-hosted instances
- CLI tool for easy integration
- Detailed feedback on code quality, security, performance, and best practices
- Can post reviews directly as merge request comments
- Structured output in text or JSON format

## Prerequisites

- Node.js 18 or higher
- GitLab personal access token with API access
- Anthropic API key

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

Create a `.env` file in the project root (use `.env.example` as a template):

```bash
# GitLab Configuration
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your-gitlab-personal-access-token

# LLM Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key

# Review Settings (optional)
MAX_DIFF_SIZE=50000
REVIEW_PROMPT_TEMPLATE=default
```

### Getting API Keys

**GitLab Personal Access Token:**
1. Go to GitLab → User Settings → Access Tokens
2. Create a new token with `api` scope
3. Copy the token to your `.env` file

**Anthropic API Key:**
1. Sign up at https://console.anthropic.com/
2. Go to API Keys section
3. Create a new API key
4. Copy the key to your `.env` file

## Usage

### Basic Review (Terminal Output)

```bash
reviewbot review --url <merge-request-url>
```

Example:
```bash
reviewbot review --url https://gitlab.com/mygroup/myproject/-/merge_requests/123
```

### Post Review as Comment

```bash
reviewbot review --url <merge-request-url> --post
```

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
  -u, --url <url>        GitLab merge request URL (required)
  -p, --post             Post the review as a comment on the MR
  -f, --format <format>  Output format: text or json (default: "text")
  -h, --help             Display help for command
```

## Example Output

```
================================================================================
AI CODE REVIEW RESULTS
================================================================================

SUMMARY:
This merge request introduces a new user authentication feature with JWT tokens.
The implementation is generally solid but has some security and error handling
concerns that should be addressed.

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
│   │   └── reviewer.ts     # AI review logic
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   └── utils/
│       ├── logger.ts       # Logging utilities
│       └── parser.ts       # URL parser
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **Parse MR URL** - Extracts project path and merge request ID
2. **Fetch MR Data** - Retrieves merge request information and code diffs via GitLab API
3. **AI Analysis** - Sends code changes to Claude AI for comprehensive review
4. **Parse Results** - Structures AI feedback into actionable comments
5. **Output/Post** - Displays results or posts as MR comment

## Limitations

- Maximum diff size: 50,000 characters (configurable)
- Only reviews files with text diffs (binary files are skipped)
- Deleted files are not reviewed
- Large merge requests may be truncated

## Troubleshooting

**"GITLAB_TOKEN environment variable is required"**
- Make sure you have created a `.env` file with your GitLab token

**"Invalid GitLab merge request URL format"**
- Ensure the URL follows the format: `https://gitlab.com/group/project/-/merge_requests/123`

**"Failed to fetch merge request"**
- Verify your GitLab token has `api` scope
- Check that you have access to the project
- Ensure the MR number is correct

**API rate limits**
- Both GitLab and Anthropic have rate limits
- Consider adding delays between multiple reviews

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT
