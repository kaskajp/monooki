# Semantic Release Setup

## What was configured

✅ **Node.js 20.18.0** - Updated project to use Node.js 20+ (required for semantic-release 24+)  
✅ **Semantic Release Dependencies** - Installed semantic-release and plugins  
✅ **Configuration File** - Created `.releaserc.json` with proper configuration  
✅ **GitHub Actions Workflow** - Created `.github/workflows/release.yml` for automated releases  
✅ **Contributing Guide** - Created `CONTRIBUTING.md` with commit conventions  
✅ **Package.json Updates** - Added Node.js engine requirements and semantic-release script  
✅ **Node Version Management** - Created `.nvmrc` file for consistent Node.js version  

## How it works

1. **Commit Convention**: Use Angular commit message format:
   - `fix:` → Patch release (0.0.1 → 0.0.2)
   - `feat:` → Minor release (0.1.0 → 0.2.0)  
   - `BREAKING CHANGE:` → Major release (1.0.0 → 2.0.0)

2. **Automated Process**: When you push to `main`, `master`, or `develop`:
   - GitHub Actions runs
   - Analyzes commits since last release
   - Determines version bump
   - Updates version in package.json
   - Generates CHANGELOG.md
   - Creates GitHub release with release notes
   - Commits changes back to repo

3. **Branch Strategy**:
   - `main`/`master`: Stable releases (1.0.0, 1.1.0, etc.)
   - `develop`: Beta releases (1.1.0-beta.1, 1.1.0-beta.2, etc.)

## Next Steps

### 1. GitHub Repository Setup
1. Push your code to GitHub
2. Go to your GitHub repository settings
3. Navigate to "Actions" → "General"
4. Enable "Read and write permissions" for GITHUB_TOKEN

### 2. First Release
1. Make your first semantic commit:
   ```bash
   git add .
   git commit -m "feat: initial release with semantic versioning"
   git push origin main
   ```

2. Watch the GitHub Actions workflow run
3. Check your repository for the generated release

### 3. Development Workflow
- Work on feature branches
- Use conventional commit messages
- Merge to `develop` for beta releases
- Merge to `main` for stable releases

## Example Commits

```bash
# Patch release
git commit -m "fix(auth): resolve login timeout issue"

# Feature release  
git commit -m "feat(inventory): add item search functionality"

# Breaking change
git commit -m "feat(api): restructure authentication endpoints

BREAKING CHANGE: All auth endpoints now use /api/v2/ prefix"
```

## Configuration Files

- `.releaserc.json` - Semantic release configuration
- `.github/workflows/release.yml` - GitHub Actions workflow
- `.nvmrc` - Node.js version specification
- `CONTRIBUTING.md` - Commit message guidelines

## Local Testing

Test semantic-release locally (won't create actual releases):
```bash
npx semantic-release --dry-run --no-ci
``` 