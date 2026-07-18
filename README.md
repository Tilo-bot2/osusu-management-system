# Osusu Management System

A comprehensive management system for Osusu (rotating savings groups) with a React Native mobile app and backend API.

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Express.js backend API
│   ├── mobile/              # React Native mobile app
│   └── ...
├── scripts/                 # Utility scripts
├── .github/
│   └── workflows/
│       └── build-apk.yml    # CI/CD pipeline for APK building
└── package.json
```

## Quick Start

### For Mobile Development

```bash
# Install dependencies
pnpm mobile:install

# Start development
pnpm mobile:start

# Run on Android
pnpm mobile:android
```

For detailed setup, see [Mobile Development Guide](artifacts/mobile/DEVELOPMENT.md)

### For Backend Development

```bash
# Install dependencies
pnpm install

# Start API server
cd artifacts/api-server
pnpm dev
```

## CI/CD Pipeline

The repository includes automated APK building via GitHub Actions:

### Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch
- Tag creation (for releases)

### Setup

Before using the CI/CD pipeline, configure GitHub Secrets:

1. `KEYSTORE_FILE` - Base64-encoded keystore
2. `KEYSTORE_PASSWORD` - Keystore password
3. `KEY_ALIAS` - Key alias
4. `KEY_PASSWORD` - Key password

See [Secrets Setup Guide](artifacts/mobile/SECRETS_SETUP.md) for detailed instructions.

### Release Process

To create a release:

```bash
# Create and push a tag
git tag v0.0.1
git push origin v0.0.1
```

See [Release Strategy](artifacts/mobile/RELEASE_STRATEGY.md) for more details.

## Available Commands

### Root
```bash
pnpm build           # Build all projects
pnpm typecheck       # Type-check all projects
```

### Mobile
```bash
pnpm mobile:install      # Install dependencies
pnpm mobile:start        # Start Metro bundler
pnpm mobile:android      # Run on Android device/emulator
pnpm mobile:build-debug  # Build debug APK
pnpm mobile:build-release # Build release APK
```

## Documentation

- [Mobile App README](artifacts/mobile/README.md)
- [Development Setup](artifacts/mobile/DEVELOPMENT.md)
- [Secrets Configuration](artifacts/mobile/SECRETS_SETUP.md)
- [Release Strategy](artifacts/mobile/RELEASE_STRATEGY.md)

## Technologies

### Mobile
- React Native 0.72.7
- TypeScript
- React Navigation
- Axios

### Backend
- Express.js
- Drizzle ORM
- Pino (logging)

### DevOps
- GitHub Actions
- Android Gradle Build System
- Docker (optional)

## License

MIT
