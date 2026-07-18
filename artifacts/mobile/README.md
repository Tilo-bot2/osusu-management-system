# Osusu Management System - Mobile App

A React Native mobile application for managing Osusu (rotating savings group) transactions.

## Prerequisites

- Node.js 18+ and pnpm
- Android SDK (for Android development)
- Android NDK (for native modules)
- Java Development Kit (JDK) 17+
- Xcode (for iOS development, macOS only)

## Installation

```bash
pnpm install
```

## Development

### Android

```bash
pnpm android
```

### iOS

```bash
pnpm ios
```

### Start Metro Bundler

```bash
pnpm start
```

## Building

### Android Debug APK

```bash
cd android
./gradlew assembleDebug
```

### Android Release APK

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## Release Signing

### Generating a Keystore

```bash
keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias osusu-key
```

### Setting Environment Variables

```bash
export KEYSTORE_PATH="$(pwd)/release.keystore"
export KEYSTORE_PASSWORD="your-password"
export KEY_ALIAS="osusu-key"
export KEY_PASSWORD="your-password"
```

## CI/CD

The GitHub Actions workflow automatically builds APKs when you push to `main` or `develop` branches. APKs are uploaded as artifacts and can be released.

### Creating a Release

Tag your commit to trigger a release:

```bash
git tag v0.0.1
git push origin v0.0.1
```

## Project Structure

```
artifacts/mobile/
├── src/               # TypeScript source files
├── android/           # Android-specific configuration
├── ios/              # iOS-specific configuration (to be added)
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## License

MIT
