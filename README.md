# Prepare Agent Skills

A cross-platform Node.js CLI tool designed to search for and prepare .agent/skills folders from a GitHub repository based on keyword searches within their contents.

## Features

- **Cross-Platform**: Runs on Linux, macOS, and Windows (requires Node.js and Git).
- **Multiple Keywords**: Support for comma-separated keywords (OR logic).
- **GitHub Powered**: Clones the latest skills directly from a repository.
- **Auto-Cleanup**: Automatically handles temporary directories and cleanup.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [Git](https://git-scm.com/) installed and available in your PATH.

## Installation & Usage

### Run directly from GitHub (Recommended)
Navigate to your **project root** and run:

```bash
npx github:<your-username>/prepare-agent-skills "<keywords>"
```

### Run locally
If you have the repository cloned locally, run it from your project root:

```bash
npx path/to/prepare-agent-skills "<keywords>"
```

### Arguments

1. **`<keywords>`**: A comma-separated list of keywords to search for (e.g., `"python,airflow"`).
2. **`[destination_directory]`** *(Optional)*: The local path where matching skill folders should be copied. **Defaults to `./.agent/skills`** (relative to your project root).
3. **`[repo_url]`** *(Optional)*: The URL of the GitHub repository to search. Defaults to `https://github.com/rmyndharis/antigravity-skills.git`.

## Examples

### Prepare skills in your project root
```bash
npx github:your-username/prepare-agent-skills "airflow,dag"
# This will copy matching skills into ./.agent/skills/
```

### Specify a custom destination
```bash
npx github:your-username/prepare-agent-skills "python" ./custom-skills
```

### Use a custom repository
```bash
npx . "expert" ./expert-skills https://github.com/another-user/skills-repo.git
```

## How It Works

1.  **Clone**: The tool performs a shallow clone (`--depth 1`) of the target repository into a system temporary directory.
2.  **Search**: It iterates through the `skills/` folder of the repository. For each skill, it recursively scans every file to check if it contains any of the specified keywords (case-insensitive).
3.  **Copy**: If a match is found, the entire skill folder is copied to the specified destination.
4.  **Cleanup**: The temporary cloned repository is deleted once the process is complete.

## License

MIT
