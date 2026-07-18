# Version Management & Release Strategy

## Version Format

This project uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes

Example: `v1.2.3`

## Creating Releases

### 1. Update Version Numbers

**In `artifacts/mobile/package.json`:**
```json
{
  "version": "0.0.1"
}
```

**In `artifacts/mobile/android/app/build.gradle`:**
```gradle
defaultConfig {
    versionCode 1        // Increment by 1 each release
    versionName "0.0.1"  // Match package.json
}
```

### 2. Create a Git Tag

```bash
# Update version numbers first
# Then commit the changes
git add .
git commit -m "chore: bump version to v0.0.1"

# Create a tag
git tag -a v0.0.1 -m "Release version 0.0.1"

# Push the tag (this triggers the release workflow)
git push origin v0.0.1
```

### 3. Automated Release Process

When you push a tag:

1. ✅ GitHub Actions builds the APK
2. ✅ Signs it with your release keystore
3. ✅ Creates a GitHub Release
4. ✅ Attaches the signed APK
5. ✅ (Optional) Posts to Slack

## Release Notes

When creating a release on GitHub, include:

```markdown
## v0.0.1 - Release Title

### Features
- Feature 1
- Feature 2

### Bug Fixes
- Fixed bug 1
- Fixed bug 2

### Breaking Changes
- Breaking change 1 (if any)

### Download
APK is available in the Assets section below.
```

## Version Code Strategy

Android requires an incrementing integer `versionCode`. Use this formula:

```
versionCode = (MAJOR * 10000) + (MINOR * 100) + PATCH
```

Examples:
- v0.0.1 → versionCode = 1
- v0.1.0 → versionCode = 100
- v1.0.0 → versionCode = 10000
- v1.2.3 → versionCode = 10203

## Git Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature

# 2. Make your changes and commit
git commit -m "feat: add your feature"

# 3. Push and create a PR
git push origin feature/your-feature

# 4. After PR approval and merge to main
git checkout main
git pull origin main

# 5. Create a release tag
git tag v0.0.2
git push origin v0.0.2
```

## Changelog

Maintain a `CHANGELOG.md` file:

```markdown
# Changelog

## [0.0.1] - 2026-07-18

### Added
- Initial release of Osusu Management mobile app
- Basic navigation structure
- API integration setup

### Fixed
- None
```
