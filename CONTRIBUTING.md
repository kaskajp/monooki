# Contributing to Monooki

## Commit Message Convention

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and publishing. Please follow the [Angular Commit Message Conventions](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format).

### Commit Message Format

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: Optional context for the change
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

### Release Types

| Commit Type | Release Type | Example |
|-------------|-------------|---------|
| `fix:` | Patch Release | `fix(auth): resolve login timeout issue` |
| `feat:` | Minor Release | `feat(inventory): add item categories` |
| `BREAKING CHANGE:` | Major Release | `feat(api): restructure endpoints`<br>`BREAKING CHANGE: API endpoints now use v2 format` |

### Examples

- **Patch release**: `fix(database): handle connection timeouts properly`
- **Feature release**: `feat(ui): add dark mode support`
- **Breaking change**: `feat(api): update authentication system`
  ```
  BREAKING CHANGE: JWT tokens now require refresh tokens
  ```

### Scopes

Common scopes for this project:
- `auth` - Authentication related changes
- `database` - Database operations
- `api` - API endpoints
- `ui` - User interface changes
- `docker` - Docker configuration
- `build` - Build system changes
- `docs` - Documentation changes

### Development Workflow

1. Make your changes
2. Commit using the conventional format
3. Push to `develop` branch for beta releases
4. Push to `main`/`master` branch for stable releases
5. Semantic-release will automatically:
   - Determine the version bump
   - Generate release notes
   - Create a GitHub release
   - Update the changelog

### Tools

To help with commit formatting, you can use:
- [Commitizen](https://github.com/commitizen/cz-cli)
- [Commitlint](https://github.com/conventional-changelog/commitlint) 