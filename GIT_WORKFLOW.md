# Git Workflow - Atomic Commits Guide

## What are Atomic Commits?

Atomic commits are commits that contain **one logical change**. Each commit should:
- ✅ Do one thing
- ✅ Be self-contained (can be understood on its own)
- ✅ Be reversible (can be reverted independently)
- ✅ Have a clear, descriptive message

## Making Atomic Commits

### 1. Check What Changed

```bash
# See all changes
git status

# See detailed changes
git diff

# See staged changes
git diff --staged
```

### 2. Stage Files Selectively

#### Option A: Stage Individual Files

```bash
# Stage one file at a time
git add hardhat/contracts/TipJar.sol
git commit -m "feat: implement TipJar contract"

git add hardhat/test/TipJar.t.sol
git commit -m "test: add Foundry test suite for TipJar"

git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow with ubuntu-22.04"
```

#### Option B: Stage Parts of Files (Interactive)

```bash
# Stage specific hunks/lines from a file
git add -p hardhat/contracts/TipJar.sol

# This opens an interactive prompt:
# y - stage this hunk
# n - don't stage this hunk
# s - split into smaller hunks
# e - manually edit the hunk
# q - quit
```

#### Option C: Stage by Directory

```bash
# Stage all files in a directory
git add hardhat/contracts/
git commit -m "feat: add TipJar contract"

git add hardhat/test/
git commit -m "test: add contract tests"
```

### 3. Commit with Good Messages

```bash
# Use conventional commit format
git commit -m "type: description"

# Types:
# feat:     New feature
# fix:      Bug fix
# test:     Adding tests
# docs:     Documentation changes
# refactor: Code refactoring
# style:    Formatting, missing semicolons, etc.
# chore:    Build process, tooling changes
# ci:       CI/CD changes
```

## Examples for This Project

### Example 1: Adding Contract

```bash
# Stage only contract file
git add hardhat/contracts/TipJar.sol

# Commit with descriptive message
git commit -m "feat: implement TipJar contract with registration and tipping"
```

### Example 2: Adding Tests

```bash
# Stage test file
git add hardhat/test/TipJar.t.sol

# Commit
git commit -m "test: add Foundry test suite with 32 tests for TipJar"
```

### Example 3: Adding Documentation

```bash
# Stage documentation files
git add hardhat/CONTRACT_STATUS.md hardhat/REVIEW.md

# Commit
git commit -m "docs: add contract status and review documentation"
```

### Example 4: Configuration Changes

```bash
# Stage config files
git add hardhat/foundry.toml .github/workflows/ci.yml

# Commit
git commit -m "ci: configure Foundry and GitHub Actions workflow"
```

## Advanced: Interactive Staging

### Stage Specific Lines

```bash
# Interactive mode - choose what to stage
git add -p

# Stage specific files interactively
git add -p hardhat/contracts/TipJar.sol
```

### Edit Staged Changes Before Committing

```bash
# Stage files
git add hardhat/contracts/TipJar.sol

# Edit staged changes
git reset -p  # Unstage parts you don't want

# Or edit the file, then stage again
git add hardhat/contracts/TipJar.sol
```

## Organizing Multiple Changes

### Scenario: You Made Multiple Changes

```bash
# 1. See all changes
git status

# 2. Commit contract changes first
git add hardhat/contracts/TipJar.sol
git commit -m "feat: implement TipJar contract"

# 3. Commit tests separately
git add hardhat/test/TipJar.t.sol
git commit -m "test: add Foundry tests for TipJar"

# 4. Commit documentation separately
git add hardhat/*.md
git commit -m "docs: add contract documentation"

# 5. Commit config separately
git add hardhat/foundry.toml
git commit -m "chore: configure Foundry"
```

## Fixing the Last Commit

### Add More Changes to Last Commit

```bash
# Make changes, then:
git add .
git commit --amend --no-edit  # Keeps same message

# Or edit the message:
git commit --amend -m "feat: implement TipJar contract with all features"
```

### Split Last Commit

```bash
# Reset last commit but keep changes
git reset HEAD~1

# Now stage and commit separately
git add hardhat/contracts/TipJar.sol
git commit -m "feat: implement TipJar contract"

git add hardhat/test/TipJar.t.sol
git commit -m "test: add tests for TipJar"
```

## Best Practices

### ✅ DO:

- Make small, focused commits
- Write clear commit messages
- Test before committing
- Commit related changes together
- Use conventional commit format

### ❌ DON'T:

- Commit everything at once (`git add . && git commit`)
- Mix unrelated changes in one commit
- Commit broken code
- Write vague commit messages like "fix stuff"
- Commit large files or generated files

## Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Examples:

```bash
# Simple
git commit -m "feat: add TipJar contract"

# With scope
git commit -m "feat(contracts): implement TipJar registration"

# With body
git commit -m "feat: add TipJar contract

- Implement creator registration
- Add tipping functionality
- Add weekly voting system"

# Breaking change
git commit -m "feat!: change registration API

BREAKING CHANGE: registration now requires avatar field"
```

## Quick Reference

```bash
# See what changed
git status
git diff

# Stage specific file
git add path/to/file

# Stage interactively (choose parts)
git add -p path/to/file

# Stage all in directory
git add path/to/directory/

# Commit with message
git commit -m "type: description"

# Amend last commit
git commit --amend

# Unstage file
git reset HEAD path/to/file

# See commit history
git log --oneline
```

## Workflow Example

```bash
# 1. Make changes to contract
# Edit hardhat/contracts/TipJar.sol

# 2. Check what changed
git diff hardhat/contracts/TipJar.sol

# 3. Stage contract
git add hardhat/contracts/TipJar.sol

# 4. Commit
git commit -m "feat: add withdrawal function to TipJar"

# 5. Make test changes
# Edit hardhat/test/TipJar.t.sol

# 6. Stage tests
git add hardhat/test/TipJar.t.sol

# 7. Commit separately
git commit -m "test: add withdrawal tests"
```

---

**Remember**: Each commit should tell a story. If you can't explain what a commit does in one sentence, it's probably not atomic enough!

